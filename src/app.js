// Client-side behaviour: theme, language memory, search, spaced repetition, TOC highlight, graph.
(function () {
  "use strict";
  const root = document.documentElement;
  const rel = root.dataset.rel || "./";
  const lang = root.dataset.lang || "en";

  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* storage unavailable: feature degrades to session-only */
      }
    },
  };

  // Remember language for the root redirect.
  try {
    localStorage.setItem("quantref.lang", lang);
  } catch (e) {}

  // ---------------------------------------------------------------- theme
  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const dark = root.dataset.theme
        ? root.dataset.theme === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
      const next = dark ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("quantref.theme", next);
      } catch (e) {}
    });
  }

  // ---------------------------------------------------------------- search
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  let index = null;
  let selected = -1;

  function norm(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function highlight(text, terms) {
    let out = text;
    for (const t of terms) {
      if (!t) continue;
      out = out.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>");
    }
    return out;
  }
  function snippet(text, terms) {
    const low = norm(text);
    let pos = -1;
    for (const t of terms) {
      pos = low.indexOf(t);
      if (pos >= 0) break;
    }
    if (pos < 0) return text.slice(0, 110);
    const start = Math.max(0, pos - 40);
    return (start ? "…" : "") + text.slice(start, start + 120) + "…";
  }
  function search(q) {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return index
      .map((c) => {
        const title = norm(c.title), summary = norm(c.summary), tags = norm(c.tags.join(" ")), text = norm(c.text);
        let score = 0;
        for (const t of terms) {
          if (title.startsWith(t)) score += 12;
          else if (title.includes(t)) score += 8;
          if (tags.includes(t)) score += 5;
          if (summary.includes(t)) score += 3;
          if (text.includes(t)) score += 1;
        }
        return { c, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.c);
  }
  function render(q) {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    const hits = search(q);
    selected = -1;
    if (!q.trim()) {
      results.hidden = true;
      return;
    }
    if (!hits.length) {
      results.innerHTML = `<div class="r-empty">${input.dataset.empty || "—"}</div>`;
    } else {
      results.innerHTML = hits
        .map(
          (c) => `<a href="${rel}${lang}/concepts/${c.slug}.html">
            <div class="r-title">${highlight(c.title, terms)} <span class="r-sub">· ${c.subject}</span></div>
            <div class="r-sub">${highlight(snippet(c.summary + " — " + c.text, terms), terms)}</div></a>`
        )
        .join("");
    }
    results.hidden = false;
  }
  if (input && results) {
    input.addEventListener("focus", () => {
      if (!index) fetch(`${rel}${lang}/search-index.json`).then((r) => r.json()).then((d) => (index = d));
    });
    input.addEventListener("input", () => {
      if (index) render(input.value);
      else fetch(`${rel}${lang}/search-index.json`).then((r) => r.json()).then((d) => { index = d; render(input.value); });
    });
    input.addEventListener("keydown", (e) => {
      const items = results.querySelectorAll("a");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!items.length) return;
        selected = (selected + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach((a, i) => a.classList.toggle("selected", i === selected));
        items[selected].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && items.length) {
        location.href = items[Math.max(0, selected)].href;
      } else if (e.key === "Escape") {
        results.hidden = true;
        input.blur();
      }
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#search")) results.hidden = true;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  // ---------------------------------------------------------------- spaced repetition
  // Simplified SM-2: grade 0 = again, 1 = hard, 2 = good, 3 = easy.
  const REVIEW_KEY = "quantref.review";
  const DAY = 86400000;
  function getReview() {
    return store.get(REVIEW_KEY, {});
  }
  function schedule(slug, grade) {
    const all = getReview();
    const cur = all[slug] || { interval: 0, ease: 2.5, reps: 0 };
    let { interval, ease, reps } = cur;
    if (grade === 0) {
      interval = 0;
      reps = 0;
      ease = Math.max(1.3, ease - 0.2);
    } else {
      reps += 1;
      if (reps === 1) interval = grade === 1 ? 1 : grade === 2 ? 2 : 4;
      else if (reps === 2) interval = grade === 1 ? 3 : grade === 2 ? 6 : 10;
      else interval = Math.round(interval * ease * (grade === 1 ? 0.7 : grade === 3 ? 1.3 : 1));
      ease = Math.max(1.3, ease + (grade === 3 ? 0.15 : grade === 1 ? -0.15 : 0));
    }
    const now = Date.now();
    all[slug] = { interval, ease, reps, last: now, due: now + Math.max(interval, grade === 0 ? 0.0104 : interval) * DAY };
    if (grade === 0) all[slug].due = now + 15 * 60000; // 15 minutes
    store.set(REVIEW_KEY, all);
    return all[slug];
  }
  function fmtDate(ts) {
    return new Date(ts).toLocaleDateString(lang, { day: "numeric", month: "short" });
  }
  function fmtIn(ts) {
    const d = Math.round((ts - Date.now()) / DAY);
    if (d <= 0) return lang === "fr" ? "aujourd'hui" : "today";
    if (d === 1) return lang === "fr" ? "demain" : "tomorrow";
    return lang === "fr" ? `dans ${d} j` : `in ${d} d`;
  }

  // Concept page bar
  const bar = document.querySelector(".review-bar");
  if (bar) {
    const slug = bar.dataset.slug;
    const next = bar.querySelector("[data-next-review]");
    const last = document.querySelector(`[data-last-reviewed="${slug}"]`);
    const refresh = () => {
      const r = getReview()[slug];
      if (!r) return;
      if (last) last.textContent = fmtDate(r.last);
      next.textContent = `${bar.dataset.next}: ${fmtIn(r.due)}`;
    };
    refresh();
    bar.querySelectorAll("button[data-grade]").forEach((b) =>
      b.addEventListener("click", () => {
        schedule(slug, Number(b.dataset.grade));
        refresh();
        b.blur();
      })
    );
  }

  // Dashboard due badges
  document.querySelectorAll("[data-due]").forEach((el) => {
    const r = getReview()[el.dataset.due];
    if (r && r.due <= Date.now()) el.textContent = lang === "fr" ? "à revoir" : "due";
  });

  // Review page
  const reviewApp = document.getElementById("review-app");
  if (reviewApp) {
    const data = JSON.parse(document.getElementById("review-data").textContent);
    const t = data.ui;
    let bucket = "due";
    let open = null;

    function buckets() {
      const r = getReview();
      const now = Date.now();
      const due = [], fresh = [], later = [];
      for (const c of data.cards) {
        const s = r[c.slug];
        if (!s) fresh.push(c);
        else if (s.due <= now) due.push(c);
        else later.push(c);
      }
      due.sort((a, b) => r[a.slug].due - r[b.slug].due);
      later.sort((a, b) => r[a.slug].due - r[b.slug].due);
      return { due, new: fresh, later };
    }
    function renderList() {
      const b = buckets();
      document.getElementById("count-due").textContent = b.due.length;
      document.getElementById("count-new").textContent = b.new.length;
      document.getElementById("count-later").textContent = b.later.length;
      document.querySelectorAll(".review-tabs button").forEach((x) => x.classList.toggle("active", x.dataset.bucket === bucket));
      const list = b[bucket];
      const r = getReview();
      if (!list.length) {
        reviewApp.innerHTML = `<p class="review-empty">${t.nothingDue}</p>`;
        return;
      }
      reviewApp.innerHTML = `<ul class="review-list">${list
        .map(
          (c) => `<li data-slug="${c.slug}"><div class="rl-title">${c.title}</div><div class="rl-sub">${c.subject}${
            r[c.slug] ? ` · ${t.nextReview}: ${fmtIn(r[c.slug].due)}` : ""
          }</div></li>`
        )
        .join("")}</ul>`;
      reviewApp.querySelectorAll("li").forEach((li) => li.addEventListener("click", () => renderCard(li.dataset.slug)));
    }
    function renderCard(slug) {
      const c = data.cards.find((x) => x.slug === slug);
      open = slug;
      reviewApp.innerHTML = `<div class="review-card">
        <div class="rc-subject">${c.subject}</div>
        <h2>${c.title}</h2>
        <div class="rc-front">${c.front}</div>
        <div class="rc-back" hidden>${c.back}</div>
        <div class="rc-actions">
          <button class="primary" id="rc-show">${t.showAnswer}</button>
          <div class="review-buttons" hidden>
            <button data-grade="0">${t.again}</button><button data-grade="1">${t.hard}</button>
            <button data-grade="2">${t.good}</button><button data-grade="3">${t.easy}</button>
          </div>
          <a href="${rel}${lang}/${c.href}">${t.openConcept} →</a>
        </div></div>`;
      const back = reviewApp.querySelector(".rc-back");
      const show = document.getElementById("rc-show");
      const btns = reviewApp.querySelector(".review-buttons");
      show.addEventListener("click", () => {
        back.hidden = false;
        show.hidden = true;
        btns.hidden = false;
      });
      btns.querySelectorAll("button").forEach((b) =>
        b.addEventListener("click", () => {
          schedule(slug, Number(b.dataset.grade));
          open = null;
          renderList();
        })
      );
    }
    document.querySelectorAll(".review-tabs button").forEach((b) =>
      b.addEventListener("click", () => {
        bucket = b.dataset.bucket;
        renderList();
      })
    );
    document.getElementById("review-reset").addEventListener("click", () => {
      if (confirm(lang === "fr" ? "Effacer toute la progression de révision ?" : "Erase all review progress?")) {
        store.set(REVIEW_KEY, {});
        renderList();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (!open) return;
      if (e.key === " " || e.key === "Enter") {
        const show = document.getElementById("rc-show");
        if (show && !show.hidden) {
          e.preventDefault();
          show.click();
        }
      } else if (/^[1-4]$/.test(e.key)) {
        const b = reviewApp.querySelector(`.review-buttons:not([hidden]) button[data-grade="${Number(e.key) - 1}"]`);
        if (b) b.click();
      }
    });
    renderList();
  }

  // ------------------------------------------------- open collapsed sections
  // A link to a heading inside a closed <details> would otherwise scroll nowhere.
  function revealHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    let d = el.closest("details");
    while (d) { d.open = true; d = d.parentElement.closest("details"); }
    el.scrollIntoView({ block: "start" });
  }
  window.addEventListener("hashchange", revealHash);
  if (location.hash) setTimeout(revealHash, 0);
  document.querySelectorAll('.toc a[href^="#"]').forEach((a) =>
    a.addEventListener("click", () => setTimeout(revealHash, 0))
  );
  // Printing should show everything, not just what happens to be open.
  window.addEventListener("beforeprint", () => document.querySelectorAll("details.deep").forEach((d) => (d.open = true)));

  // ---------------------------------------------------------------- TOC highlight
  const tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    const map = new Map();
    tocLinks.forEach((a) => {
      const el = document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1)));
      if (el) map.set(el, a);
    });
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            tocLinks.forEach((a) => a.classList.remove("active"));
            map.get(en.target).classList.add("active");
          }
        }
      },
      { rootMargin: "-10% 0px -80% 0px" }
    );
    map.forEach((_, el) => io.observe(el));
  }

  // ---------------------------------------------------------------- prerequisite graph
  const svg = document.getElementById("graph");
  if (svg) {
    const data = JSON.parse(document.getElementById("graph-data").textContent);
    const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]));
    const edges = data.edges.filter((e) => byId[e.from] && byId[e.to]);
    const parents = {}, children = {};
    for (const n of data.nodes) { parents[n.id] = []; children[n.id] = []; }
    for (const e of edges) {
      parents[e.to].push(e.from);
      children[e.from].push(e.to);
    }
    // Depth = longest chain of prerequisites (layered left-to-right).
    const depth = {};
    function d(id, seen = new Set()) {
      if (depth[id] !== undefined) return depth[id];
      if (seen.has(id)) return 0; // cycle guard
      seen.add(id);
      depth[id] = parents[id].length ? 1 + Math.max(...parents[id].map((p) => d(p, seen))) : 0;
      return depth[id];
    }
    data.nodes.forEach((n) => d(n.id));
    const maxDepth = Math.max(0, ...data.nodes.map((n) => depth[n.id]));

    const NW = 180, NH = 38, DH = 12, GX = 80, GY = 16, PAD = 28;

    // Layered layout. An edge spanning more than one column gets a dummy node in
    // each column it crosses, so it is routed through a reserved empty slot
    // instead of passing behind the opaque boxes that sit there.
    const cols = Array.from({ length: maxDepth + 1 }, () => []);
    for (const n of data.nodes) cols[depth[n.id]].push({ kind: "node", id: n.id, h: NH, node: n });

    const routes = [];
    const layPrev = {}, layNext = {};
    const link = (a, b) => { (layPrev[b] ||= []).push(a); (layNext[a] ||= []).push(b); };
    for (const e of edges) {
      const chain = [e.from];
      for (let k = 1; k < depth[e.to] - depth[e.from]; k++) {
        const id = `~${e.from}~${e.to}~${k}`;
        cols[depth[e.from] + k].push({ kind: "dummy", id, h: DH });
        chain.push(id);
      }
      chain.push(e.to);
      for (let i = 0; i + 1 < chain.length; i++) link(chain[i], chain[i + 1]);
      routes.push({ from: e.from, to: e.to, chain });
    }

    const pos = {};
    let H = 0;
    function place() {
      const colH = [];
      for (let c = 0; c <= maxDepth; c++) {
        let y = 0;
        for (const it of cols[c]) { pos[it.id] = { x: PAD + c * (NW + GX), y, h: it.h }; y += it.h + GY; }
        colH[c] = Math.max(0, y - GY);
      }
      H = Math.max(...colH, NH) + PAD * 2;
      for (let c = 0; c <= maxDepth; c++) {
        const off = PAD + (H - PAD * 2 - colH[c]) / 2;
        for (const it of cols[c]) pos[it.id].y += off;
      }
    }
    const mid = (id) => pos[id].y + pos[id].h / 2;
    function bary(it, adj) {
      const ns = (adj[it.id] || []).filter((x) => pos[x]);
      return ns.length ? ns.reduce((s, x) => s + mid(x), 0) / ns.length : mid(it.id);
    }
    // A few barycentre sweeps: order each column by where its neighbours sit,
    // which is what keeps the long routed edges from crossing each other.
    place();
    for (let pass = 0; pass < 4; pass++) {
      for (let c = 1; c <= maxDepth; c++) { cols[c].sort((a, b) => bary(a, layPrev) - bary(b, layPrev)); place(); }
      for (let c = maxDepth - 1; c >= 0; c--) { cols[c].sort((a, b) => bary(a, layNext) - bary(b, layNext)); place(); }
    }
    const W = PAD * 2 + (maxDepth + 1) * NW + maxDepth * GX;

    const ns = "http://www.w3.org/2000/svg";
    const el = (tag, attrs = {}) => {
      const e = document.createElementNS(ns, tag);
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
      return e;
    };
    const defs = el("defs");
    const marker = el("marker", { id: "arrow", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" });
    marker.appendChild(el("path", { d: "M0,0 L10,5 L0,10 z", class: "arrow" }));
    defs.appendChild(marker);
    svg.appendChild(defs);
    const vp = el("g", { class: "vp" });
    svg.appendChild(vp);

    function pathThrough(chain) {
      // A dummy contributes two points, so the edge crosses its column as a
      // straight horizontal line inside the reserved slot. All the vertical
      // movement then happens in the gaps between columns, where nothing sits.
      const pts = [];
      chain.forEach((id, i) => {
        const p = pos[id];
        const y = p.y + p.h / 2;
        if (i === 0) pts.push([p.x + NW, y]);
        else if (i === chain.length - 1) pts.push([p.x, y]);
        else pts.push([p.x, y], [p.x + NW, y]);
      });
      let d = `M${pts[0][0]},${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2;
        d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
      }
      return d;
    }

    const edgeEls = routes.map((r) => {
      const p = el("path", { d: pathThrough(r.chain), class: "edge", "marker-end": "url(#arrow)" });
      p.dataset.from = r.from;
      p.dataset.to = r.to;
      vp.appendChild(p);
      return p;
    });
    const nodeEls = {};
    for (const n of data.nodes) {
      const g = el("g", { class: "node", transform: `translate(${pos[n.id].x},${pos[n.id].y})` });
      g.dataset.subject = n.subject;
      g.dataset.id = n.id;
      g.appendChild(el("rect", { width: NW, height: NH }));
      const label = el("text", { x: 12, y: NH / 2 + 4.5 });
      label.textContent = n.title.length > 24 ? n.title.slice(0, 23) + "…" : n.title;
      g.appendChild(label);
      const title = el("title");
      title.textContent = `${n.title} · ${n.subjectName}`;
      g.appendChild(title);
      g.addEventListener("click", () => { if (!dragged) location.href = rel + lang + "/" + n.href; });
      g.addEventListener("mouseenter", () => focus(n.id));
      g.addEventListener("mouseleave", () => focus(null));
      vp.appendChild(g);
      nodeEls[n.id] = g;
    }
    function lineage(id) {
      const set = new Set([id]);
      const up = [id], down = [id];
      while (up.length) for (const p of parents[up.pop()]) if (!set.has(p)) { set.add(p); up.push(p); }
      while (down.length) for (const c of children[down.pop()]) if (!set.has(c)) { set.add(c); down.push(c); }
      return set;
    }
    function focus(id) {
      if (!id) {
        edgeEls.forEach((e) => e.classList.remove("hi", "dim"));
        Object.values(nodeEls).forEach((g) => g.classList.remove("hi", "dim", "self"));
        return;
      }
      const set = lineage(id);
      for (const e of edgeEls) {
        const on = set.has(e.dataset.from) && set.has(e.dataset.to);
        e.classList.toggle("hi", on);
        e.classList.toggle("dim", !on);
      }
      for (const [nid, g] of Object.entries(nodeEls)) {
        g.classList.toggle("hi", set.has(nid));
        g.classList.toggle("dim", !set.has(nid));
        g.classList.toggle("self", nid === id);
      }
    }

    // ---- pan and zoom -----------------------------------------------------
    // The svg keeps a 1-unit-per-CSS-pixel viewBox and all the content lives in
    // `vp`, so panning and zooming is one transform on that group.
    const MAX_K = 4;
    let MIN_K = 0.25, k = 1, tx = 0, ty = 0, dragged = false;

    function apply() {
      vp.setAttribute("transform", `translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${k.toFixed(4)})`);
    }
    function size() {
      const r = svg.getBoundingClientRect();
      return { w: r.width || svg.clientWidth || 800, h: r.height || svg.clientHeight || 400 };
    }
    function syncViewBox() {
      const { w, h } = size();
      svg.setAttribute("viewBox", `0 0 ${Math.round(w)} ${Math.round(h)}`);
    }
    function fit() {
      // Height follows the content so a short graph does not sit in a tall empty
      // box, with headroom left over so there is somewhere to pan once zoomed in.
      const w0 = svg.getBoundingClientRect().width || 800;
      const fitted = Math.min(1, (w0 - 24) / W);
      const minH = w0 < 700 ? 260 : 340;
      svg.style.height = Math.min(680, Math.max(minH, Math.round(H * fitted) + 120)) + "px";
      syncViewBox();
      const { w, h } = size();
      k = Math.min(1, (w - 24) / W, (h - 24) / H);
      // Never allow zooming out past the whole-graph view, however small that is
      // on a narrow screen, so the fitted view always fits.
      MIN_K = Math.min(0.25, k);
      tx = (w - W * k) / 2;
      ty = (h - H * k) / 2;
      apply();
    }
    function zoomAt(cx, cy, factor) {
      const nk = Math.min(MAX_K, Math.max(MIN_K, k * factor));
      if (nk === k) return;
      // Keep the content point under (cx, cy) fixed.
      tx = cx - ((cx - tx) / k) * nk;
      ty = cy - ((cy - ty) / k) * nk;
      k = nk;
      apply();
    }
    const localPoint = (e) => {
      const r = svg.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };

    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const [cx, cy] = localPoint(e);
      // ctrlKey is set by trackpad pinch; treat it as a stronger zoom.
      const step = e.ctrlKey ? 0.01 : 0.0022;
      zoomAt(cx, cy, Math.exp(-e.deltaY * step));
    }, { passive: false });

    // No setPointerCapture here: capturing the pointer on the svg retargets the
    // click away from the node, which would stop a node click from opening its
    // page. Track the drag on window listeners instead.
    const pointers = new Map();
    let pinchDist = 0, panStart = null;

    const onMove = (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, localPoint(e));
      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (pinchDist > 0) zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, d / pinchDist);
        pinchDist = d;
        dragged = true;
        return;
      }
      if (!panStart) return;
      const [x, y] = pointers.get(e.pointerId);
      if (Math.hypot(x - panStart.x, y - panStart.y) > 4) dragged = true;
      if (!dragged) return; // below the threshold this is still a click, not a pan
      tx = panStart.tx + (x - panStart.x);
      ty = panStart.ty + (y - panStart.y);
      apply();
    };
    const onUp = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size) return;
      panStart = null;
      svg.classList.remove("panning");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      // `dragged` stays set through the click that follows, and is cleared by
      // the next pointerdown.
    };
    svg.addEventListener("pointerdown", (e) => {
      pointers.set(e.pointerId, localPoint(e));
      if (pointers.size === 1) {
        dragged = false;
        const [x, y] = pointers.get(e.pointerId);
        panStart = { x, y, tx, ty };
        svg.classList.add("panning");
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a[0] - b[0], a[1] - b[1]);
        panStart = null;
      }
    });

    document.querySelectorAll(".graph-controls button").forEach((b) =>
      b.addEventListener("click", () => {
        const { w, h } = size();
        if (b.dataset.zoom === "fit") fit();
        else zoomAt(w / 2, h / 2, b.dataset.zoom === "in" ? 1.3 : 1 / 1.3);
      })
    );
    svg.setAttribute("tabindex", "0");
    svg.addEventListener("keydown", (e) => {
      const { w, h } = size();
      if (e.key === "+" || e.key === "=") { e.preventDefault(); zoomAt(w / 2, h / 2, 1.3); }
      else if (e.key === "-") { e.preventDefault(); zoomAt(w / 2, h / 2, 1 / 1.3); }
      else if (e.key === "0") { e.preventDefault(); fit(); }
    });

    fit();
    if ("ResizeObserver" in window) {
      // Observe the wrapper, not the svg: fit() sets the svg height, which would
      // otherwise retrigger the observer forever.
      const wrap = svg.parentElement;
      let lastW = Math.round(wrap.getBoundingClientRect().width);
      new ResizeObserver(() => {
        const w = Math.round(wrap.getBoundingClientRect().width);
        if (w !== lastW) { lastW = w; fit(); }
      }).observe(wrap);
    }
  }
})();

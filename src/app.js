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
    const parents = {}, children = {};
    for (const n of data.nodes) { parents[n.id] = []; children[n.id] = []; }
    for (const e of data.edges) {
      if (!byId[e.from] || !byId[e.to]) continue;
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
    const cols = {};
    for (const n of data.nodes) (cols[depth[n.id]] ||= []).push(n);
    // Order inside a column by average parent position to reduce crossings.
    const pos = {};
    const NW = 190, NH = 38, GX = 90, GY = 18, PAD = 30;
    const maxDepth = Math.max(...Object.keys(cols).map(Number));
    let maxRows = 0;
    for (let c = 0; c <= maxDepth; c++) {
      const col = cols[c] || [];
      col.sort((a, b) => {
        const pa = parents[a.id].map((p) => pos[p]?.y ?? 0);
        const pb = parents[b.id].map((p) => pos[p]?.y ?? 0);
        const ma = pa.length ? pa.reduce((x, y) => x + y, 0) / pa.length : 0;
        const mb = pb.length ? pb.reduce((x, y) => x + y, 0) / pb.length : 0;
        return ma - mb || a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title);
      });
      maxRows = Math.max(maxRows, col.length);
      col.forEach((n, i) => { pos[n.id] = { x: PAD + c * (NW + GX), y: PAD + i * (NH + GY) }; });
    }
    // Centre columns vertically.
    const H = PAD * 2 + maxRows * (NH + GY) - GY;
    for (let c = 0; c <= maxDepth; c++) {
      const col = cols[c] || [];
      const h = col.length * (NH + GY) - GY;
      const off = (H - PAD * 2 - h) / 2;
      col.forEach((n) => (pos[n.id].y += off));
    }
    const W = PAD * 2 + (maxDepth + 1) * NW + maxDepth * GX;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.style.height = Math.max(320, H) + "px";

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

    const edgeEls = [];
    for (const e of data.edges) {
      const a = pos[e.from], b = pos[e.to];
      if (!a || !b) continue;
      const x1 = a.x + NW, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y + NH / 2;
      const cx = (x1 + x2) / 2;
      const p = el("path", { d: `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`, class: "edge", "marker-end": "url(#arrow)" });
      p.dataset.from = e.from;
      p.dataset.to = e.to;
      svg.appendChild(p);
      edgeEls.push(p);
    }
    const nodeEls = {};
    for (const n of data.nodes) {
      const g = el("g", { class: "node", transform: `translate(${pos[n.id].x},${pos[n.id].y})` });
      g.dataset.subject = n.subject;
      g.dataset.id = n.id;
      g.appendChild(el("rect", { width: NW, height: NH }));
      const label = el("text", { x: 12, y: NH / 2 + 4.5 });
      label.textContent = n.title.length > 26 ? n.title.slice(0, 25) + "…" : n.title;
      g.appendChild(label);
      const title = el("title");
      title.textContent = `${n.title} · ${n.subjectName}`;
      g.appendChild(title);
      g.addEventListener("click", () => (location.href = rel + lang + "/" + n.href));
      g.addEventListener("mouseenter", () => focus(n.id));
      g.addEventListener("mouseleave", () => focus(null));
      svg.appendChild(g);
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
  }
})();

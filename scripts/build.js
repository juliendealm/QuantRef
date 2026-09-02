// Static site generator for QuantRef.
// Reads concepts/<lang>/<slug>.md, renders Markdown + KaTeX to HTML, and writes dist/.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import container from "markdown-it-container";
import texmath from "markdown-it-texmath";
import katex from "katex";
import { site, subjects, sections, sectionOrder, openSections, ui } from "../site.config.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const OUT = process.env.QUANTREF_OUT ? path.resolve(process.env.QUANTREF_OUT) : path.join(ROOT, "dist");
const CONCEPTS = path.join(ROOT, "concepts");

// ---------------------------------------------------------------------------
// Markdown setup
// ---------------------------------------------------------------------------

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugifyHeading(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function makeMarkdown(lang) {
  const t = ui[lang];
  const md = new MarkdownIt({ html: true, linkify: true, typographer: false });

  md.use(texmath, {
    engine: katex,
    delimiters: "dollars",
    katexOptions: { throwOnError: true, strict: "ignore" },
  });

  md.use(anchor, {
    level: [2, 3],
    slugify: slugifyHeading,
    permalink: anchor.permalink.linkInsideHeader({ symbol: "#", placement: "after", class: "anchor" }),
  });

  // ::: formula Label
  md.use(container, "formula", {
    render(tokens, idx) {
      const tok = tokens[idx];
      if (tok.nesting === 1) {
        const label = tok.info.trim().replace(/^formula\s*/, "");
        return `<div class="callout formula"><div class="callout-head"><span class="callout-kind">${t.keyFormula}</span>${
          label ? `<span class="callout-label">${escapeHtml(label)}</span>` : ""
        }</div><div class="callout-body">\n`;
      }
      return "</div></div>\n";
    },
  });

  // ::: pitfall Optional title
  md.use(container, "pitfall", {
    render(tokens, idx) {
      const tok = tokens[idx];
      if (tok.nesting === 1) {
        const label = tok.info.trim().replace(/^pitfall\s*/, "");
        return `<div class="callout pitfall"><div class="callout-head"><span class="callout-kind">${t.pitfall}</span>${
          label ? `<span class="callout-label">${escapeHtml(label)}</span>` : ""
        }</div><div class="callout-body">\n`;
      }
      return "</div></div>\n";
    },
  });

  // ::: output  (text produced by the preceding code block)
  md.use(container, "output", {
    render(tokens, idx) {
      return tokens[idx].nesting === 1
        ? `<div class="output"><div class="output-head">${t.output}</div>\n`
        : "</div>\n";
    },
  });

  // ::: question Question text     (nesting: ::: hint / ::: answer inside)
  md.use(container, "question", {
    render(tokens, idx) {
      const tok = tokens[idx];
      if (tok.nesting === 1) {
        const q = tok.info.trim().replace(/^question\s*/, "");
        const n = tok.attrGet("data-n") || "";
        return `<details class="question"><summary><span class="q-n">${n}</span><span class="q-text">${md.renderInline(
          q
        )}</span></summary><div class="q-body">\n`;
      }
      return "</div></details>\n";
    },
  });

  md.use(container, "hint", {
    render(tokens, idx) {
      return tokens[idx].nesting === 1
        ? `<details class="hint"><summary>${t.hint}</summary><div>\n`
        : "</div></details>\n";
    },
  });

  md.use(container, "answer", {
    render(tokens, idx) {
      return tokens[idx].nesting === 1
        ? `<details class="answer"><summary>${t.answer}</summary><div>\n`
        : "</div></details>\n";
    },
  });

  // Highlight code blocks minimally (no external highlighter): wrap with language class.
  md.set({
    highlight(str, lang) {
      return `<pre class="code" data-lang="${escapeHtml(lang)}"><code>${escapeHtml(str)}</code></pre>`;
    },
  });

  return md;
}

// Resolve [[slug]] wiki links to concept pages. Done before Markdown parsing.
function resolveWikiLinks(src, lang, index, relRoot) {
  return src.replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, slug, label) => {
    const target = index[lang]?.[slug];
    if (!target) {
      console.warn(`  warning: unresolved link [[${slug}]]`);
      return label || slug;
    }
    return `[${label || target.title}](${relRoot}${lang}/concepts/${slug}.html)`;
  });
}

// ---------------------------------------------------------------------------
// Loading concepts
// ---------------------------------------------------------------------------

function loadConcepts() {
  const index = {}; // lang -> slug -> concept
  for (const lang of site.languages) {
    index[lang] = {};
    const dir = path.join(CONCEPTS, lang);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      if (!data.title) throw new Error(`${lang}/${file}: missing title`);
      if (!subjects.find((s) => s.id === data.subject)) {
        throw new Error(`${lang}/${file}: unknown subject "${data.subject}"`);
      }
      index[lang][slug] = {
        lang,
        slug,
        file: `concepts/${lang}/${file}`,
        title: data.title,
        subject: data.subject,
        summary: data.summary || "",
        difficulty: Number(data.difficulty || 1),
        interview: Number(data.interview || 1),
        tags: data.tags || [],
        prerequisites: data.prerequisites || [],
        related: data.related || [],
        body: content,
      };
    }
  }
  // Validate cross references.
  for (const lang of site.languages) {
    for (const c of Object.values(index[lang])) {
      for (const p of [...c.prerequisites, ...c.related]) {
        if (!index[lang][p]) console.warn(`  warning: ${lang}/${c.slug}: unknown reference "${p}"`);
      }
    }
  }
  return index;
}

// Transitive prerequisites in topological order (closest last).
function learningPath(concept, all) {
  const seen = new Set();
  const order = [];
  function visit(slug) {
    if (seen.has(slug) || !all[slug]) return;
    seen.add(slug);
    for (const p of all[slug].prerequisites) visit(p);
    order.push(slug);
  }
  for (const p of concept.prerequisites) visit(p);
  return order.map((s) => all[s]);
}

// ---------------------------------------------------------------------------
// Rendering a concept
// ---------------------------------------------------------------------------

function renderConcept(md, concept, lang, index) {
  const relRoot = "../../";
  const src = resolveWikiLinks(concept.body, lang, index, relRoot);
  const env = {};
  const tokens = md.parse(src, env);

  // Number questions and collect their token ranges.
  const questionRanges = [];
  let qn = 0;
  const stack = [];
  tokens.forEach((tok, i) => {
    if (tok.type === "container_question_open") {
      qn += 1;
      tok.attrSet("data-n", String(qn));
      stack.push(i);
    } else if (tok.type === "container_question_close") {
      questionRanges.push([stack.pop(), i]);
    }
  });

  // Section ranges by h2 heading, in document order.
  const toc = [];
  const sectionRanges = {};
  const ordered = [];
  let currentH2 = null;
  tokens.forEach((tok, i) => {
    if (tok.type === "heading_open" && tok.tag === "h2") {
      const text = tokens[i + 1].content;
      const id = tok.attrGet("id");
      const deep = sectionOrder[lang].indexOf(text) >= openSections;
      toc.push({ id, text, deep });
      if (currentH2) {
        sectionRanges[currentH2].end = i;
        ordered[ordered.length - 1].end = i;
      }
      currentH2 = text;
      sectionRanges[text] = { start: i, end: tokens.length };
      ordered.push({ text, id, deep, start: i, end: tokens.length });
    }
  });

  // Render the four lead sections open and the rest inside a disclosure, so the
  // page reads as a short note with the depth one click away.
  const render = (a, b) => md.renderer.render(tokens.slice(a, b), md.options, env);
  let html = ordered.length ? render(0, ordered[0].start) : render(0, tokens.length);
  for (const sec of ordered) {
    const body = render(sec.start + 3, sec.end); // skip heading_open, inline, heading_close
    if (!sec.deep) {
      html += render(sec.start, sec.start + 3) + body;
    } else {
      html +=
        `<details class="deep" id="sec-${sec.id}">` +
        `<summary><span class="deep-title">${escapeHtml(sec.text)}</span></summary>` +
        `<div class="deep-body" id="${sec.id}">${body}</div></details>`;
    }
  }

  function renderSection(name, { skipHeading = true } = {}) {
    const r = sectionRanges[name];
    if (!r) return "";
    let start = r.start;
    if (skipHeading) start += 3; // heading_open, inline, heading_close
    return md.renderer.render(tokens.slice(start, r.end), md.options, env);
  }

  const formulaCount = tokens.filter((t) => t.type === "container_formula_open").length;
  const questions = questionRanges.map(([a, b]) => md.renderer.render(tokens.slice(a, b + 1), md.options, env));

  // Plain text for the search index.
  const plain = src
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]*\$/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^:::.*$/gm, " ")
    .replace(/[#*_>`\[\]|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const s = sections[lang];
  return {
    html,
    toc,
    formulaCount,
    questions,
    revisionHtml: renderSection(s.revision),
    formulasHtml: renderSection(s.formulas),
    plain,
  };
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

function stars(n, label) {
  return `<span class="stars" title="${n} ${label}" aria-label="${n} ${label}">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
}

function dots(n, levels) {
  return `<span class="dots" title="${levels[n - 1]}" aria-label="${levels[n - 1]}">${Array.from(
    { length: 5 },
    (_, i) => `<i class="${i < n ? "on" : ""}"></i>`
  ).join("")}</span>`;
}

function subjectName(id, lang) {
  return subjects.find((s) => s.id === id)?.[lang] || id;
}

function layout({ lang, title, body, rel, page, otherLangHref, description, extraHead = "" }) {
  const t = ui[lang];
  const nav = [
    ["dashboard", `${rel}${lang}/index.html`],
    ["graph", `${rel}${lang}/graph.html`],
    ["review", `${rel}${lang}/review.html`],
    ["interview", `${rel}${lang}/interview.html`],
  ]
    .map(
      ([key, href]) =>
        `<a href="${href}" class="${page === key ? "active" : ""}">${t[key]}</a>`
    )
    .join("");

  return `<!doctype html>
<html lang="${lang}" data-rel="${rel}" data-lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · ${site.name}</title>
${description ? `<meta name="description" content="${escapeHtml(description)}">` : ""}
<link rel="icon" href="${rel}assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${rel}assets/katex.min.css">
<link rel="stylesheet" href="${rel}assets/style.css">
<script>
try { const th = localStorage.getItem("quantref.theme"); if (th) document.documentElement.dataset.theme = th; } catch (e) {}
</script>
${extraHead}
</head>
<body>
<header class="top">
  <a class="brand" href="${rel}${lang}/index.html"><span class="brand-mark">Q</span>${site.name}</a>
  <nav class="nav">${nav}</nav>
  <div class="search" id="search">
    <input type="search" id="search-input" placeholder="${t.search}" data-empty="${t.noResults}" autocomplete="off" aria-label="${t.search}">
    <div class="search-results" id="search-results" hidden></div>
  </div>
  <div class="top-actions">
    <a class="lang" href="${otherLangHref}" title="${t.langSwitch}">${t.otherLang}</a>
    <button class="theme" id="theme-toggle" title="${t.toggleTheme}" aria-label="${t.toggleTheme}">◐</button>
  </div>
</header>
<main class="page page-${page}">
${body}
</main>
<footer class="foot">
  <span>${t.footer}</span>
  <a href="${site.repo}">GitHub</a>
</footer>
<script src="${rel}assets/app.js"></script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function conceptPage(concept, rendered, lang, index) {
  const t = ui[lang];
  const all = index[lang];
  const rel = "../../";
  const other = site.languages.find((l) => l !== lang);
  const otherLangHref = index[other]?.[concept.slug]
    ? `${rel}${other}/concepts/${concept.slug}.html`
    : `${rel}${other}/index.html`;

  const link = (c) => `<a href="${rel}${lang}/concepts/${c.slug}.html">${escapeHtml(c.title)}</a>`;
  const prereqs = concept.prerequisites.map((s) => all[s]).filter(Boolean);
  const usedBy = Object.values(all).filter((c) => c.prerequisites.includes(concept.slug));
  const related = concept.related.map((s) => all[s]).filter(Boolean);
  const pathList = learningPath(concept, all);

  const list = (items) => (items.length ? `<ul class="links">${items.map((c) => `<li>${link(c)}</li>`).join("")}</ul>` : "");

  const side = `
<aside class="side">
  <div class="meta">
    <div class="meta-row"><span>${t.subject}</span><a href="${rel}${lang}/index.html#${concept.subject}">${subjectName(concept.subject, lang)}</a></div>
    <div class="meta-row"><span>${t.difficulty}</span>${dots(concept.difficulty, t.level)}</div>
    <div class="meta-row"><span>${t.interviewValue}</span>${stars(concept.interview, t.starLabel)}</div>
    <div class="meta-row"><span>${t.lastReviewed}</span><span data-last-reviewed="${concept.slug}">${t.never}</span></div>
  </div>
  <div class="tags">${concept.tags.map((tag) => `<a class="tag" href="${rel}${lang}/index.html#tag-${tag}">#${tag}</a>`).join("")}</div>
  ${prereqs.length ? `<h4>${t.prerequisites}</h4>${list(prereqs)}` : ""}
  ${pathList.length > prereqs.length ? `<h4>${t.learningPath}</h4><ol class="links path">${pathList.map((c) => `<li>${link(c)}</li>`).join("")}<li class="current">${escapeHtml(concept.title)}</li></ol>` : ""}
  ${usedBy.length ? `<h4>${t.usedBy}</h4>${list(usedBy)}` : ""}
  ${related.length ? `<h4>${t.related}</h4>${list(related)}` : ""}
  <h4>${t.onThisPage}</h4>
  <ol class="toc">${rendered.toc.map((h) => `<li><a class="${h.deep ? "deep" : ""}" href="#${h.id}">${escapeHtml(h.text)}</a></li>`).join("")}</ol>
  <a class="edit" href="${site.repo}/edit/main/${concept.file}">${t.edit}</a>
</aside>`;

  const body = `
<div class="concept-layout">
<article class="concept" data-slug="${concept.slug}">
  <div class="crumbs"><a href="${rel}${lang}/index.html">${t.home}</a> / <a href="${rel}${lang}/index.html#${concept.subject}">${subjectName(concept.subject, lang)}</a></div>
  <h1>${escapeHtml(concept.title)}</h1>
  <p class="lead">${escapeHtml(concept.summary)}</p>
  ${rendered.html}
  <div class="review-bar" data-slug="${concept.slug}" data-next="${t.nextReview}">
    <span class="review-prompt">${t.reviewedPrompt}</span>
    <div class="review-buttons">
      <button data-grade="0">${t.again}</button>
      <button data-grade="1">${t.hard}</button>
      <button data-grade="2">${t.good}</button>
      <button data-grade="3">${t.easy}</button>
    </div>
    <span class="review-next" data-next-review="${concept.slug}"></span>
  </div>
</article>
${side}
</div>`;

  return layout({
    lang,
    title: concept.title,
    description: concept.summary,
    body,
    rel,
    page: "concept",
    otherLangHref,
  });
}

function dashboardPage(lang, index, rendered) {
  const t = ui[lang];
  const rel = "../";
  const all = Object.values(index[lang]);
  const other = site.languages.find((l) => l !== lang);

  const formulas = all.reduce((n, c) => n + rendered[lang][c.slug].formulaCount, 0);
  const questions = all.reduce((n, c) => n + rendered[lang][c.slug].questions.length, 0);
  const activeSubjects = subjects.filter((s) => all.some((c) => c.subject === s.id));

  const card = (c) => `
<a class="card" href="${rel}${lang}/concepts/${c.slug}.html" data-slug="${c.slug}">
  <div class="card-title">${escapeHtml(c.title)}</div>
  <div class="card-summary">${escapeHtml(c.summary)}</div>
  <div class="card-meta">${dots(c.difficulty, t.level)}${stars(c.interview, t.starLabel)}<span class="card-due" data-due="${c.slug}"></span></div>
</a>`;

  const subjectBlocks = subjects
    .map((s) => {
      const items = all.filter((c) => c.subject === s.id).sort((a, b) => a.difficulty - b.difficulty || a.title.localeCompare(b.title));
      return `
<section class="subject" id="${s.id}">
  <h2>${s[lang]} <span class="count">${items.length}</span></h2>
  ${items.length ? `<div class="cards">${items.map(card).join("")}</div>` : `<p class="empty">${t.emptySubject}</p>`}
</section>`;
    })
    .join("");

  const tagMap = {};
  for (const c of all) for (const tag of c.tags) (tagMap[tag] ||= []).push(c);
  const tagBlocks = Object.keys(tagMap)
    .sort()
    .map(
      (tag) => `
<details class="tag-group" id="tag-${tag}">
  <summary><span class="tag">#${tag}</span><span class="count">${tagMap[tag].length}</span></summary>
  <ul class="links">${tagMap[tag].map((c) => `<li><a href="${rel}${lang}/concepts/${c.slug}.html">${escapeHtml(c.title)}</a></li>`).join("")}</ul>
</details>`
    )
    .join("");

  const body = `
<section class="hero">
  <h1>${site.name}</h1>
  <p>${t.tagline}</p>
  <div class="stats">
    <div><b>${all.length}</b><span>${t.stats.concepts}</span></div>
    <div><b>${formulas}</b><span>${t.stats.formulas}</span></div>
    <div><b>${questions}</b><span>${t.stats.questions}</span></div>
    <div><b>${activeSubjects.length}</b><span>${t.stats.subjects}</span></div>
  </div>
</section>
<div class="dash-layout">
<div class="dash-main">
${subjectBlocks}
</div>
<aside class="dash-side">
  <h3>${t.tags}</h3>
  ${tagBlocks}
</aside>
</div>`;

  return layout({ lang, title: t.dashboard, body, rel, page: "dashboard", otherLangHref: `${rel}${other}/index.html`, description: t.tagline });
}

function graphPage(lang, index) {
  const t = ui[lang];
  const rel = "../";
  const other = site.languages.find((l) => l !== lang);
  const all = Object.values(index[lang]);
  const data = {
    nodes: all.map((c) => ({ id: c.slug, title: c.title, subject: c.subject, subjectName: subjectName(c.subject, lang), href: `concepts/${c.slug}.html` })),
    edges: all.flatMap((c) => c.prerequisites.filter((p) => index[lang][p]).map((p) => ({ from: p, to: c.slug }))),
  };
  const legend = subjects
    .filter((s) => all.some((c) => c.subject === s.id))
    .map((s) => `<span class="legend-item"><i data-subject="${s.id}"></i>${s[lang]}</span>`)
    .join("");
  const body = `
<h1>${t.graphTitle}</h1>
<p class="intro">${t.graphIntro}</p>
<div class="legend">${legend}</div>
<div class="graph-wrap">
  <svg id="graph" class="graph"></svg>
  <div class="graph-controls">
    <button data-zoom="in" title="${t.zoomIn}" aria-label="${t.zoomIn}">+</button>
    <button data-zoom="out" title="${t.zoomOut}" aria-label="${t.zoomOut}">−</button>
    <button data-zoom="fit" title="${t.zoomFit}" aria-label="${t.zoomFit}">⤡</button>
  </div>
</div>
<script id="graph-data" type="application/json">${JSON.stringify(data)}</script>`;
  return layout({ lang, title: t.graphTitle, body, rel, page: "graph", otherLangHref: `${rel}${other}/graph.html` });
}

function reviewPage(lang, index, rendered) {
  const t = ui[lang];
  const rel = "../";
  const other = site.languages.find((l) => l !== lang);
  const cards = Object.values(index[lang]).map((c) => ({
    slug: c.slug,
    title: c.title,
    subject: subjectName(c.subject, lang),
    href: `concepts/${c.slug}.html`,
    front: c.summary,
    back: rendered[lang][c.slug].revisionHtml + rendered[lang][c.slug].formulasHtml,
  }));
  const body = `
<h1>${t.reviewTitle}</h1>
<p class="intro">${t.reviewIntro}</p>
<div class="review-tabs">
  <button data-bucket="due" class="active">${t.due} <span class="count" id="count-due">0</span></button>
  <button data-bucket="new">${t.newCards} <span class="count" id="count-new">0</span></button>
  <button data-bucket="later">${t.later} <span class="count" id="count-later">0</span></button>
</div>
<div id="review-app" class="review-app"></div>
<p class="review-reset"><button class="linklike" id="review-reset">${t.resetProgress}</button></p>
<script id="review-data" type="application/json">${JSON.stringify({ cards, ui: { showAnswer: t.showAnswer, openConcept: t.openConcept, nothingDue: t.nothingDue, again: t.again, hard: t.hard, good: t.good, easy: t.easy, nextReview: t.nextReview } })}</script>`;
  return layout({ lang, title: t.reviewTitle, body, rel, page: "review", otherLangHref: `${rel}${other}/review.html` });
}

function interviewPage(lang, index, rendered) {
  const t = ui[lang];
  const rel = "../";
  const other = site.languages.find((l) => l !== lang);
  const all = Object.values(index[lang]);
  const blocks = subjects
    .map((s) => {
      const items = all.filter((c) => c.subject === s.id && rendered[lang][c.slug].questions.length);
      if (!items.length) return "";
      return `
<section class="subject" id="${s.id}">
  <h2>${s[lang]}</h2>
  ${items
    .map(
      (c) => `
  <div class="interview-concept">
    <h3><a href="${rel}${lang}/concepts/${c.slug}.html">${escapeHtml(c.title)}</a> ${stars(c.interview, t.starLabel)}</h3>
    ${rendered[lang][c.slug].questions.join("\n")}
  </div>`
    )
    .join("")}
</section>`;
    })
    .join("");
  const total = all.reduce((n, c) => n + rendered[lang][c.slug].questions.length, 0);
  const body = `
<h1>${t.interviewTitle} <span class="count">${total} ${t.questions}</span></h1>
<p class="intro">${t.interviewIntro}</p>
${blocks}`;
  return layout({ lang, title: t.interviewTitle, body, rel, page: "interview", otherLangHref: `${rel}${other}/interview.html` });
}

function rootRedirect() {
  const langs = JSON.stringify(site.languages);
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${site.name}</title>
<script>
(function () {
  var langs = ${langs}, pick = "${site.defaultLang}";
  try { var saved = localStorage.getItem("quantref.lang"); if (langs.indexOf(saved) >= 0) pick = saved; } catch (e) {}
  location.replace(pick + "/index.html");
})();
</script>
<noscript><meta http-equiv="refresh" content="0; url=${site.defaultLang}/index.html"></noscript>
</head><body><a href="${site.defaultLang}/index.html">${site.name}</a></body></html>`;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function write(file, content) {
  const p = path.join(OUT, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function copyAssets() {
  const assets = path.join(OUT, "assets");
  fs.mkdirSync(assets, { recursive: true });
  for (const f of fs.readdirSync(SRC)) fs.copyFileSync(path.join(SRC, f), path.join(assets, f));
  const katexDist = path.join(ROOT, "node_modules", "katex", "dist");
  fs.copyFileSync(path.join(katexDist, "katex.min.css"), path.join(assets, "katex.min.css"));
  fs.cpSync(path.join(katexDist, "fonts"), path.join(assets, "fonts"), { recursive: true });
}

function build() {
  const started = Date.now();
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  copyAssets();
  write(".nojekyll", "");

  const index = loadConcepts();
  const rendered = {};

  for (const lang of site.languages) {
    const md = makeMarkdown(lang);
    rendered[lang] = {};
    for (const concept of Object.values(index[lang])) {
      console.log(`  ${lang}/${concept.slug}`);
      const r = renderConcept(md, concept, lang, index);
      rendered[lang][concept.slug] = r;
      write(`${lang}/concepts/${concept.slug}.html`, conceptPage(concept, r, lang, index));
    }
    write(`${lang}/index.html`, dashboardPage(lang, index, rendered));
    write(`${lang}/graph.html`, graphPage(lang, index));
    write(`${lang}/review.html`, reviewPage(lang, index, rendered));
    write(`${lang}/interview.html`, interviewPage(lang, index, rendered));
    write(
      `${lang}/search-index.json`,
      JSON.stringify(
        Object.values(index[lang]).map((c) => ({
          slug: c.slug,
          title: c.title,
          summary: c.summary,
          subject: subjectName(c.subject, lang),
          tags: c.tags,
          text: rendered[lang][c.slug].plain.slice(0, 4000),
        }))
      )
    );
  }
  write("index.html", rootRedirect());

  const n = site.languages.reduce((a, l) => a + Object.keys(index[l]).length, 0);
  console.log(`built ${n} concept pages in ${Date.now() - started} ms → ${path.relative(ROOT, OUT) || OUT}/`);
}

build();

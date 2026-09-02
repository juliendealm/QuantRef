// Scaffold a new concept in every language.
// Usage: npm run new -- "Title" --subject probability [--slug my-slug]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site, subjects, sections } from "../site.config.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const title = args.find((a) => !a.startsWith("--"));
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const subject = opt("subject");

if (!title || !subject) {
  console.error('Usage: npm run new -- "Title" --subject <id> [--slug <slug>]');
  console.error("Subjects: " + subjects.map((s) => s.id).join(", "));
  process.exit(1);
}
if (!subjects.find((s) => s.id === subject)) {
  console.error(`Unknown subject "${subject}". Subjects: ${subjects.map((s) => s.id).join(", ")}`);
  process.exit(1);
}

const slug =
  opt("slug") ||
  title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const headings = {
  en: ["Intuition", "Key Formulas", "Common Mistakes", "30-Second Revision", "Mathematical Formulation", "Derivation", "Assumptions & Edge Cases", "Worked Example", "Why It Matters in Quant Finance", "Interview Questions"],
  fr: ["Intuition", "Formules clés", "Erreurs fréquentes", "Révision en 30 secondes", "Formulation mathématique", "Dérivation", "Hypothèses et cas limites", "Exemple détaillé", "Pourquoi c'est important en finance quantitative", "Questions d'entretien"],
};

for (const lang of site.languages) {
  const file = path.join(ROOT, "concepts", lang, `${slug}.md`);
  if (fs.existsSync(file)) {
    console.log(`skip ${lang}/${slug}.md (exists)`);
    continue;
  }
  const body = `---
title: ${title}
subject: ${subject}
summary: One sentence that says what this concept is and why you care.
difficulty: 2
interview: 3
tags: []
prerequisites: []
related: []
---

${headings[lang].map((h) => `## ${h}\n\n`).join("")}`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  console.log(`created concepts/${lang}/${slug}.md`);
}

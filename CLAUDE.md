# QuantRef

Personal quantitative-finance reference notes, built into a static site for GitHub Pages.

## Layout

- `concepts/en/<slug>.md`, `concepts/fr/<slug>.md` — one Markdown file per concept per language, same slug in both.
- `site.config.js` — languages, subject list, UI strings, recognised section headings.
- `scripts/build.js` — renders Markdown + KaTeX to `dist/` (no client-side math).
- `scripts/new.js` — `npm run new -- "Title" --subject <id>` scaffolds a concept in every language.
- `src/` — `style.css`, `app.js` (search, theme, spaced repetition, prerequisite graph).
- `.claude/agents/` — `concept-writer` (creates concepts) and `concept-reviewer` (read-only checks).

## Commands

```bash
npm run build     # -> dist/
npm run serve     # preview dist/ at http://localhost:4321
QUANTREF_OUT=/some/dir npm run build   # build elsewhere (used by parallel agents)
```

The build throws on invalid KaTeX and warns on unknown `prerequisites`, `related`, or `[[wiki-links]]`.

## Concept file conventions

Frontmatter:

```yaml
title: Human title in that language
subject: probability | stochastic | derivatives | risk | statistics | filtering | portfolio | microstructure
summary: One or two sentences. Shown on cards, in search, and as the review-card front.
difficulty: 1-5
interview: 1-5
tags: [lowercase, english, no-spaces]      # identical across languages
prerequisites: [slug, ...]                 # identical across languages; drives the graph and learning path
related: [slug, ...]                       # identical across languages
```

Section headings, in this exact order. The first four render open on the page;
the last six are collapsed behind a disclosure, so a note reads short and the
depth is one click away. The build looks up the last three by exact text.

| # | en | fr | shown |
|---|---|---|---|
| 1 | Intuition | Intuition | open |
| 2 | Key Formulas | Formules clés | open |
| 3 | Common Mistakes | Erreurs fréquentes | open |
| 4 | 30-Second Revision | Révision en 30 secondes | open |
| 5 | Mathematical Formulation | Formulation mathématique | collapsed |
| 6 | Derivation | Dérivation | collapsed |
| 7 | Assumptions & Edge Cases | Hypothèses et cas limites | collapsed |
| 8 | Worked Example | Exemple détaillé | collapsed |
| 9 | Why It Matters in Quant Finance | Pourquoi c'est important en finance quantitative | collapsed |
| 10 | Interview Questions | Questions d'entretien | collapsed |

`sectionOrder` and `openSections` in `site.config.js` are the source of truth.

## Length

These are reference notes for revision, not a textbook. Be brief and dense.
A whole note is about **1200-1500 words**, and the four open sections are about
**400 words together** — that is what the reader sees on arrival.

| section | words |
|---|---|
| Intuition | 90 |
| Key Formulas | a table, no prose |
| Common Mistakes | 3 pitfalls, 1-2 sentences each |
| 30-Second Revision | 70 |
| Mathematical Formulation | 180 |
| Derivation | 150 |
| Assumptions & Edge Cases | 130, as bullets |
| Worked Example | 150 plus the code |
| Why It Matters in Quant Finance | 120, as bullets |
| Interview Questions | 4 questions, hint and answer each, ~90 words per question |

Cut ruthlessly: no restating the same idea in two registers, no throat-clearing
before a formula, no paragraph that only announces the next one. Prefer a
bulleted list to prose wherever the content is a list. Keep every formula, every
number and every pitfall; cut the words around them.

Markup available inside the body:

- Math: `$inline$` and `$$display$$` (KaTeX, build-time). No `\(` `\)`.
- `[[slug]]` or `[[slug|label]]` links to another concept.
- `::: formula Label` … `:::` — key formula callout (counted on the dashboard).
- `::: pitfall Title` … `:::` — warning callout.
- Fenced ```python block followed by `::: output` … ``` … ``` … `:::` — code plus its real output.
- `::: question Question text` containing `::: hint` … `:::` and `::: answer` … `:::` — interview question (collected into the interview bank). Closing markers: hint, answer, then question.

Style: tutorial voice, precise, concrete numbers, finance applications. French files are full translations of the English content (same formulas, same examples, same code, same output), not summaries. Code comments stay in English. Reference example: `concepts/en/conditional-probability.md` and its French twin.

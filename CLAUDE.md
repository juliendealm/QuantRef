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

Section headings, in this order (the build looks up the last three by exact text):

| en | fr |
|---|---|
| Intuition | Intuition |
| Mathematical Formulation | Formulation mathématique |
| Derivation | Dérivation |
| Assumptions & Edge Cases | Hypothèses et cas limites |
| Worked Example | Exemple détaillé |
| Why It Matters in Quant Finance | Pourquoi c'est important en finance quantitative |
| Common Mistakes | Erreurs fréquentes |
| 30-Second Revision | Révision en 30 secondes |
| Key Formulas | Formules clés |
| Interview Questions | Questions d'entretien |

Markup available inside the body:

- Math: `$inline$` and `$$display$$` (KaTeX, build-time). No `\(` `\)`.
- `[[slug]]` or `[[slug|label]]` links to another concept.
- `::: formula Label` … `:::` — key formula callout (counted on the dashboard).
- `::: pitfall Title` … `:::` — warning callout.
- Fenced ```python block followed by `::: output` … ``` … ``` … `:::` — code plus its real output.
- `::: question Question text` containing `::: hint` … `:::` and `::: answer` … `:::` — interview question (collected into the interview bank). Closing markers: hint, answer, then question.

Style: tutorial voice, precise, concrete numbers, finance applications. French files are full translations of the English content (same formulas, same examples, same code, same output), not summaries. Code comments stay in English. Reference example: `concepts/en/conditional-probability.md` and its French twin.

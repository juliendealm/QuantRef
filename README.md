# QuantRef

Personal reference notes for quantitative finance, in English and French, published with GitHub Pages.

Each concept is one Markdown file per language in `concepts/`. A small Node script renders them (KaTeX at build time, no client-side math) into a static site with search, a prerequisite graph, an interview-question bank, and spaced-repetition review stored in the browser.

## Usage

```bash
npm install
npm run build          # writes dist/
npm run serve          # http://localhost:4321
npm run new -- "Title" --subject probability   # scaffold a concept in every language
```

Subjects: `probability`, `stochastic`, `derivatives`, `risk`, `statistics`, `filtering`, `portfolio`, `microstructure` (see `site.config.js`).

Writing conventions (frontmatter, sections, callouts, questions) are documented in `CLAUDE.md`.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds `dist/` and publishes it. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** once.

## Claude Code agents

- `concept-writer` researches a topic and writes the concept in every language, runs the Python example, and validates the build.
- `concept-reviewer` is read-only: it checks mathematics, completeness, French/English consistency, and conventions, and reports without editing.

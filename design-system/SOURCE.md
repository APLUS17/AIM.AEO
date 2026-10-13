# Ember Ledger — source

Pulled from the Claude Design project **Ember Ledger** (`68873134-41a6-4b3e-9a3e-47574c50079b`,
https://claude.ai/design/p/68873134-41a6-4b3e-9a3e-47574c50079b) on 2026-10-13.

| File | Origin |
|---|---|
| `tokens.json`, `README.md`, `components/bundle.css`, `components/*/README.md` | Copied verbatim. Do not edit by hand; re-pull from the project. |
| `tokens.css` | Generated from `tokens.json` by `npm run tokens`. |

Not pulled: the per-component `preview.html` cards and the `Cover` card. They live in the
Claude Design project.

## Using it

Load order on every page: Google Fonts link (see `README.md` → Type), `tokens.css`,
`components/bundle.css`, then the site's own `site.css`. `site.css` holds page layout only and may
reference tokens, never raw hex values.

## Deviations on this site

- **Code snippets** use the system monospace stack. The system ships no mono face and code needs one.
- **PolySans** is not licensed here. Headings use the `Inter Tight` fallback the system specifies.
- **Pale panels on white and ash bands** follow the README rule (ash cards on white, white cards on ash).
  The white card on an ash band is `el-data`.

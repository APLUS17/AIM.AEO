# Button

Square-cornered actions with PolySans labels: a Graphite-filled primary and a 1px-outlined ghost.

**Consumer provides:** an `<a>` or `<button>` with class `el-btn` plus `el-btn--primary` or `el-btn--ghost`, and a short label (1–3 words).

- Use one primary per view (e.g. "Contact us"); pair it with a ghost for the quieter alternative.
- Corners are always `radius-buttons` (0px). No shadows, no icons unless essential.
- Never fill a button with `color-ember-orange`.
- Hover: primary lightens to `color-steel`; ghost fills `color-ash`. Focus: 2px `color-graphite` ring, 2px offset.

An editorial data observatory on warm paper: monochrome precision, whisper-weight headlines, and a single orange ember used like a highlighter on a printed report. Pages read about 95% achromatic; colour is punctuation, not decoration.

## Content fundamentals

- Write like an annual report, not an ad: short declarative sentences, concrete numbers, no exclamation marks, no emoji.
- Headlines are sentence case and calm ("From raw data to clear reporting"), never all caps. Overlines (`overline`) are the only uppercase text.
- Speak as "we" to "you". Lead with the outcome, then the method.
- Let the charts carry the claim: a real figure in a data card beats an adjective in a headline. Never invent stats to fill a card.

## Visual foundations

### Colour

- Text is `color-graphite` on `color-canvas-white`, `color-ash`, `color-fog` or `color-ivory`. Paragraphs are `color-steel`.
- `color-slate` is for helper text, the language toggle and footer links only. It is 3.8:1 on white — below 4.5:1 — so never set essential body copy in it; switch to `color-steel` when it matters.
- `color-ember-orange` is the one accent: link underlines, the primary chart line, a small icon accent. Never a button fill, never a large text colour on light grounds (2.9:1 on white). At most one or two ember moments per screen.
- `color-brass` is the secondary warm accent: secondary chart strokes, tag text, the partner-strip caption.
- No blue, green or other hues. Ember + Brass is the entire chromatic budget.

### Surfaces and depth

- Surfaces stack `surface-page-canvas` (0) → `surface-ash-surface` (1) → `surface-fog-surface` (2) → `surface-ivory-surface` (3).
- Separate sections with `section-gap` (80px) of whitespace and alternating white / ash bands. No divider lines between sections.
- No shadows anywhere (`shadow-none`). Depth comes from surface contrast: a white data card on an ash band, an ash card on white.
- `color-mist` is the only rule colour: table hairlines and chart gridlines.

### Type

- Display face is PolySans (`--font-polysans`), always weight 400 with -0.02em tracking — never bold, never 500. PolySans is a commercial font: until a licensed file is added under `fonts/`, the stack falls back to Inter Tight (Google Fonts, weight 400).
- Text face is Inter (`--font-inter`): 400 for paragraphs, 500 for UI labels, 600 only for `overline`.
- Use `display` once per page for the hero; `heading-lg` for sections; `heading` for feature cards; `card-title` on data cards; `label-display` for buttons and nav items.
- Keep display line-height tight (`display` 0.91). Never loosen a display headline above 1.25.
- Load fonts with `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@400&display=swap`.

### Shape — the three-radius rhythm

- Sharp: every button is `radius-buttons` (0px).
- Asymmetric: feature cards round the top-left corner only, `radius-asymmetric-card` (6px), every other corner square. This is the signature; never give feature cards a symmetric radius.
- Round: the nav capsule is `radius-nav-pills` (200px); tags are `radius-tags` (20px); data cards are `radius-2xl` (20px).

### Space and layout

- Content sits in a `page-max-width` (1200px) centered container with 16px gutters on mobile.
- Gaps between siblings are `element-gap` (20px); cards pad `card-padding` (40px); feature cards pad 70px top / `spacing-60` left.
- Hero: two columns — headline, `lead` paragraph and a primary + ghost button pair on the left; a cluster of two or three overlapping data cards on the right.
- If something feels empty, add whitespace, not decoration.

### Interaction states

- Primary button hover: background lightens to `color-steel`. Ghost button hover: fill `color-ash`.
- Links: `color-graphite` text with a 1px `color-ember-orange` underline offset 3px; hover thickens the underline to 2px.
- Focus ring on every interactive element: 2px solid `color-graphite`, offset 2px (16:1 on white, 14:1 on ash). On graphite fills the ring is `color-canvas-white`.

## Imagery and iconography

- The charts are the imagery: flat line graphs, progress rings and stat cards with thin strokes in `color-ember-orange` (primary series) and `color-brass` (secondary series) on white cards. Gridlines in `color-mist`.
- No lifestyle photography, stock images or hero illustrations.
- Partner and client logos appear monochrome in `color-graphite` only, with a `caption-display` caption in `color-brass` above them.
- Icons are thin-stroke monoline (1.5px) in `color-graphite`, used sparingly in nav and card headers. No icon set ships with this system yet; use a monoline set such as Lucide at 1.5px stroke until one is added.
- No logo ships with this system: set the product name in `label-display` until a real mark is added under `assets/Logos/`.

## Components

Components are plain HTML + CSS: link `components/bundle.css` after the tokens and use the `el-` classes shown in each component's preview. There is no JavaScript bundle.

## Don'ts

- Don't bold PolySans headings.
- Don't fill a button with `color-ember-orange`.
- Don't add box-shadows, gradients, or divider lines between sections.
- Don't use symmetric radius on feature cards.
- Don't introduce a third accent hue.

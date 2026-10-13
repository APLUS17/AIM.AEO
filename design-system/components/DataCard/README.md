# DataCard

A chart widget: flat `color-canvas-white` surface, `radius-2xl` corners, `card-padding`, sitting on an ash band with no shadow.

**Consumer provides:** a `<section class="el-data">` with an `el-data__head` (title in `card-title`, optional meta), then the chart (an SVG with class `el-chart`, using `primary`, `secondary`, `grid`, `track`, `axis` classes) and optionally an `el-data__value` + `el-data__delta`. The data is the consumer's — never fill a card with invented figures in production.

- Primary series: 2px `color-ember-orange`. Comparison series: 1.5px dashed `color-brass`. Gridlines: `color-mist`. Axis text: `micro-display` in `color-steel`.
- Charts are flat line graphs, progress rings and single stats — no 3D, no gradients, no area fills.
- In a hero, overlap two or three cards on the right column; elsewhere, lay them out on a grid with `element-gap`.
- Give every chart an `aria-label` that states the takeaway.

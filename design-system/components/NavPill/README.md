# NavPill

The header: a wordmark left, a floating `color-ash` capsule of nav items centred, and the language toggle plus primary button right.

**Consumer provides:** the brand name (or logo), 3–5 nav items as `el-nav__item` links (dropdown triggers carry a 10px monoline chevron), an optional `el-nav__lang` toggle and one `el-btn--primary`.

- The capsule uses `radius-nav-pills`, 8px × 18px padding, `element-gap` between items. Flat — no shadow.
- Items are `label-display-relaxed` in `color-graphite`; the current page gets the ember underline.
- The language toggle is `color-slate` (3.8:1 — keep it short, it is not essential copy).
- On narrow screens collapse the capsule into a menu button; keep the primary action visible.

# FeatureCard

The signature panel: a flat `color-ash` (or `color-ivory`) surface whose top-left corner alone is rounded by `radius-asymmetric-card` (6px); every other corner is square.

**Consumer provides:** an `<article class="el-feature">` containing an `el-feature__title` (PolySans `heading`) and an `el-feature__body` (Inter `lead` in `color-steel`); optionally a tag above the title. Add `el-feature--ivory` for the one featured block on a page.

- Padding is 70px top, `spacing-60` left, `card-padding` right and bottom.
- Never give it a symmetric radius, a border or a shadow — surface colour does the lifting.
- Place ash cards on white bands; on an ash band use a white or ivory card instead.

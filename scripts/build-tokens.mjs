// Generates design-system/tokens.css (custom properties + type-style classes) from tokens.json.
// Run with `npm run tokens`. Never edit tokens.css by hand.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'design-system');
const tokens = JSON.parse(readFileSync(path.join(dir, 'tokens.json'), 'utf8'));

const resolve = value => value.replace(/\{([\w-]+)\}/g, (_, name) => `var(--${name})`);
const vars = list => list.map(t => `  --${t.name}: ${resolve(t.value)};`);

const families = Object.entries(tokens.type.families).map(([name, stack]) => `  --font-${name}: ${stack};`);

const typeClasses = tokens.type.groups.flatMap(group =>
  group.styles.map(s =>
    [
      `.ts-${s.name} {`,
      `  font-family: var(--font-${group.family});`,
      `  font-size: ${s.fontSize};`,
      `  line-height: ${s.lineHeight};`,
      `  font-weight: ${s.fontWeight};`,
      s.letterSpacing ? `  letter-spacing: ${s.letterSpacing};` : null,
      '}',
    ]
      .filter(Boolean)
      .join('\n')
  )
);

const css = [
  `/* ${tokens.name} tokens — generated from tokens.json by scripts/build-tokens.mjs. Do not edit. */`,
  ':root {',
  ...vars(tokens.color.tokens),
  ...families,
  ...vars(tokens.spacing.tokens),
  ...vars(tokens.radius.tokens),
  ...vars(tokens.shadow.tokens),
  '}',
  '',
  '/* Type styles: one class per token style, e.g. .ts-heading-lg */',
  ...typeClasses,
  '',
].join('\n');

writeFileSync(path.join(dir, 'tokens.css'), css);
console.log(`Wrote design-system/tokens.css (${css.length} bytes)`);

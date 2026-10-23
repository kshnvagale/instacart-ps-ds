#!/usr/bin/env node
/**
 * Calibrates check-design: how often does each rule catch what it should, and
 * how often does it fire on correct usage?
 *
 *   npm run check:design:calibrate [-- --no-stories]
 *
 * Two corpora:
 *  - fixtures/*.tsx, *.html and *.dc.html (top level only; `fixtures/format-examples/`
 *    holds SSX canvas exports kept as format references and is skipped): annotated in a JSX or HTML comment. `expect: a, b` names the rules that must fire
 *    on the next line opening a JSX element; `expect-file:` rules fire on line
 *    1. Any other finding is a false positive.
 *  - The atom stories (src/components/<atom>/*.stories.tsx): correct usage by
 *    definition, so every Jev flag there is a false positive. Only the Jev
 *    rules are scored on them; stories are canvas chrome and break the static
 *    rules on purpose.
 *
 * A Jev rule is ready to promote from warning to error only when it reaches
 * 100% recall on the fixtures with no false positives on either corpus, over
 * enough cases to mean something.
 */
import fs from 'node:fs';
import path from 'node:path';
import { checkFiles, ROOT } from './lib/check.mjs';
import { JEV_RULES } from './lib/jev.mjs';

const withStories = !process.argv.includes('--no-stories');
const FIX = path.join(ROOT, 'scripts/check-design/fixtures');
const fixtures = fs.readdirSync(FIX).filter((f) => /\.(tsx|html)$/.test(f)).map((f) => path.join(FIX, f));

const ATOMS = ['Avatar', 'Badge', 'Button', 'Checkbox', 'Heading', 'Icon', 'IconButton', 'Input', 'Link', 'Logo', 'Price', 'QuantityStepper', 'Spinner', 'Switch', 'Text'];
const stories = withStories
  ? ATOMS.flatMap((a) => {
      const dir = path.join(ROOT, 'src/components', a);
      return fs.readdirSync(dir).filter((f) => f.endsWith('.stories.tsx')).map((f) => path.join(dir, f));
    })
  : [];

/** line -> Set(rule) from the `expect:` annotations. */
function expectations(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const map = new Map();
  const add = (line, rules) => rules.split(',').map((r) => r.trim()).filter(Boolean).forEach((r) => {
    if (!map.has(line)) map.set(line, new Set());
    map.get(line).add(r);
  });
  lines.forEach((text, i) => {
    const file1 = text.match(/expect-file:\s*([\w\s,-]+?)\s*(\*\/|-->|$)/);
    if (file1) return add(1, file1[1]);
    const m = text.match(/expect:\s*([\w\s,-]+?)\s*(\*\/|-->|$)/);
    if (!m) return;
    for (let j = i + 1; j < lines.length; j++) {
      if (/expect:/.test(lines[j])) continue;
      if (/</.test(lines[j])) return add(j + 1, m[1]);
    }
  });
  return map;
}

const score = {};
const bump = (rule, k) => {
  score[rule] ??= { tp: 0, fn: 0, fp: 0, storyFp: 0, storyCases: 0 };
  score[rule][k] += 1;
};
const notes = [];

const fx = await checkFiles(fixtures, { jev: true });
for (const { file, findings, judged } of fx.results) {
  const want = expectations(file);
  const got = new Map();
  for (const f of findings.filter((f) => f.severity !== 'info')) {
    if (!got.has(f.line)) got.set(f.line, new Set());
    got.get(f.line).add(f.rule);
  }
  for (const [line, rules] of want) {
    for (const r of rules) {
      if (got.get(line)?.has(r)) bump(r, 'tp');
      else {
        bump(r, 'fn');
        const j = judged.find((x) => x.def.id === r && x.el.line === line);
        notes.push(`missed  ${r} at ${path.basename(file)}:${line}${j ? ` (Jev ${j.noul?.toFixed(2)})` : ''}`);
      }
    }
  }
  for (const [line, rules] of got) {
    for (const r of rules) {
      if (!want.get(line)?.has(r)) {
        bump(r, 'fp');
        const j = judged.find((x) => x.def.id === r && x.el.line === line);
        notes.push(`false+  ${r} at ${path.basename(file)}:${line}${j ? ` (Jev ${j.noul?.toFixed(2)}): ${j.snippet.split('\n')[0].slice(0, 90)}` : ''}`);
      }
    }
  }
}

let usage = fx.usage;
if (stories.length) {
  const st = await checkFiles(stories, { jev: true });
  usage = Object.fromEntries(Object.keys(usage).map((k) => [k, usage[k] + st.usage[k]]));
  for (const { file, judged } of st.results) {
    for (const j of judged) {
      bump(j.def.id, 'storyCases');
      if (j.noul >= 0.8) {
        bump(j.def.id, 'storyFp');
        notes.push(`story+  ${j.def.id} at ${path.relative(ROOT, file)}:${j.el.line} (Jev ${j.noul.toFixed(2)}): ${j.snippet.split('\n')[0].slice(0, 90)}`);
      }
    }
  }
}

const jevIds = new Set(JEV_RULES.map((r) => r.id));
const pad = (s, n) => String(s).padEnd(n);
console.log(`\n${pad('rule', 24)}${pad('kind', 7)}${pad('caught', 9)}${pad('missed', 8)}${pad('false+', 8)}story false+`);
for (const [rule, s] of Object.entries(score).sort()) {
  const story = jevIds.has(rule) ? `${s.storyFp}/${s.storyCases}` : '-';
  console.log(`${pad(rule, 24)}${pad(jevIds.has(rule) ? 'jev' : 'static', 7)}${pad(`${s.tp}/${s.tp + s.fn}`, 9)}${pad(s.fn, 8)}${pad(s.fp, 8)}${story}`);
}
if (notes.length) console.log(`\n${notes.join('\n')}`);
console.log(`\nJev: ${usage.requests} request(s), ${usage.input_tokens} input tokens`);

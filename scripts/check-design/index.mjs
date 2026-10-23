#!/usr/bin/env node
/**
 * check-design: does a design (a Claude Design export: .tsx, .jsx or .html, or code made from one)
 * follow the Instacart design system (instacart-ps-ds), and can developers
 * ship it as-is?
 *
 *   npm run check:design -- <file|dir>... [--jev] [--json] [--verbose]
 *
 * Deterministic rules (dead classes, arbitrary values, raw colours, inline
 * styles, raw elements, prop types) are ERRORS and set exit code 1.
 * `--jev` adds semantic rules judged by TypeSafe's Jev: WARNINGS only, they
 * never change the exit code. `--verbose` also lists Jev's unsure calls
 * (0.5–0.8).
 *
 * Exit codes: 0 clean (warnings allowed), 1 errors, 2 bad usage or a Jev
 * transport failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import { checkFiles, ROOT } from './lib/check.mjs';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const targets = args.filter((a) => !a.startsWith('--'));

if (!targets.length) {
  console.error('usage: npm run check:design -- <file|dir>... [--jev] [--json] [--verbose]');
  process.exit(2);
}

const files = targets.flatMap((t) => {
  const abs = path.resolve(t);
  if (!fs.existsSync(abs)) {
    console.error(`not found: ${t}`);
    process.exit(2);
  }
  if (fs.statSync(abs).isFile()) return [abs];
  // A downloaded Claude Design canvas: check the artboards its index lists,
  // in order (`project/canvas.json`, keyed by path under project/).
  const index = [path.join(abs, 'project/canvas.json'), path.join(abs, 'canvas.json')].find((p) => fs.existsSync(p));
  if (index) {
    const canvas = JSON.parse(fs.readFileSync(index, 'utf8'));
    const boards = (canvas.order?.length ? canvas.order : Object.keys(canvas.boards ?? {}))
      .map((b) => path.join(path.dirname(index), b))
      .filter((p) => fs.existsSync(p));
    if (!boards.length) {
      console.error(`no artboard files found next to ${path.relative(process.cwd(), index)}`);
      process.exit(2);
    }
    return boards;
  }
  // Any other folder. A canvas's design-system copy (`ds/`) and the canvas
  // type's own files are not designs.
  return fs.readdirSync(abs, { recursive: true })
    .filter((f) => /\.(tsx|jsx|html?)$/.test(f) && !/(^|\/)(node_modules|ds|artifact-type|format-examples)\//.test(f))
    .map((f) => path.join(abs, f));
});

/** A path to show: relative to here, or from `project/` for a downloaded canvas elsewhere. */
const display = (file) => {
  const rel = path.relative(process.cwd(), file);
  if (!rel.startsWith('..')) return rel;
  const at = file.lastIndexOf(`${path.sep}project${path.sep}`);
  return at >= 0 ? file.slice(at + 1) : path.basename(file);
};

let out;
try {
  out = await checkFiles(files, { jev: flags.has('--jev') });
} catch (e) {
  console.error(`check-design: ${e.message}`);
  process.exit(2);
}
const { results, usage } = out;
const errors = results.reduce((n, r) => n + r.findings.filter((f) => f.severity === 'error').length, 0);

if (flags.has('--json')) {
  const strip = results.map(({ file, findings }) => ({ file: path.relative(ROOT, file), findings }));
  console.log(JSON.stringify({ results: strip, usage, exitCode: errors ? 1 : 0 }, null, 2));
} else {
  const icon = { error: '✖', warning: '▲', info: '·' };
  for (const { file, findings } of results) {
    const shown = findings.filter((f) => f.severity !== 'info' || flags.has('--verbose'));
    console.log(`\n${display(file)}${shown.length ? '' : '  ✓ clean'}`);
    for (const f of shown) {
      console.log(`  ${String(f.line).padStart(4)}:${String(f.column).padEnd(3)} ${icon[f.severity]} ${f.severity.padEnd(7)} ${f.rule.padEnd(22)} ${f.message}`);
    }
  }
  const count = (s) => results.reduce((n, r) => n + r.findings.filter((f) => f.severity === s).length, 0);
  console.log(`\n${count('error')} error(s), ${count('warning')} warning(s)${flags.has('--jev') ? ` · Jev: ${usage.requests} request(s), ${usage.input_tokens} input tokens` : ''}`);
}
process.exit(errors ? 1 : 0);

/** Runs every rule over a set of design files. Shared by the CLI and calibrate. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDesign } from './parse.mjs';
import { parseHtmlDesign } from './parse-html.mjs';
import { dcHandlers, dcToTsx, isDcArtboard } from './parse-dc.mjs';
import { staticRules } from './static-rules.mjs';
import { typecheck } from './typecheck.mjs';
import { jevRules } from './jev.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export async function checkFiles(paths, { jev = false } = {}) {
  // Read every file once; an HTML export becomes either its design script or
  // its rendered DOM (see parse-html.mjs).
  const inputs = paths.map((file) => {
    const raw = fs.readFileSync(file, 'utf8');
    if (!/\.html?$/.test(file)) return { file, design: parseDesign(file, raw), source: raw };
    if (isDcArtboard(raw)) {
      // A Claude Design canvas artboard: source, converted line for line.
      const source = dcToTsx(raw);
      const design = parseDesign(`${file}.tsx`, source);
      design.text = raw; // data-theme sits on <html>, outside the converted part
      for (const [name, def] of dcHandlers(raw)) if (!design.declarations.has(name)) design.declarations.set(name, def);
      return { file, design, source };
    }
    const h = parseHtmlDesign(file, raw);
    return { file, design: h.design, source: h.mode === 'script' ? h.source : null };
  });
  const withSource = inputs.filter((i) => i.source !== null);
  const types = withSource.length ? typecheck(withSource.map((i) => ({ file: i.file, text: i.source })), { root: ROOT }) : [];

  const usage = { input_tokens: 0, output_tokens: 0, requests: 0 };
  const results = [];
  for (const { file, design, source } of inputs) {
    const findings = [
      ...(await staticRules(design, { root: ROOT })),
      ...(source !== null
        ? types.find((t) => t.file === file).findings
        : [{ rule: 'html-no-props', severity: 'warning', line: 1, column: 1, message: 'Plain rendered HTML: there are no component props to type-check. Export the design as code (JSX) for the prop check.', evidence: '' }]),
    ];
    let judged = [];
    if (jev) {
      const j = await jevRules(design);
      findings.push(...j.findings);
      judged = j.judged;
      for (const k of Object.keys(usage)) usage[k] += j.usage[k];
    }
    findings.sort((a, b) => a.line - b.line || a.column - b.column);
    results.push({ file, findings, judged });
  }
  return { results, usage };
}

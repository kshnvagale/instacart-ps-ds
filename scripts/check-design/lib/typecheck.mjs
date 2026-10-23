/**
 * Prop check: type-checks the design against the package's real `.d.ts`, so a
 * variant, size or tone name that does not exist, a missing required prop, or
 * a component that is not exported, is an error with a line number.
 *
 * A Claude Design export reads components from `window.Instacart`; that is
 * rewritten to an import of `instacart-ps-ds` (resolved to `dist/`)
 * without moving any line, so diagnostics point at the original source.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

/**
 * The useful sentence of a TypeScript diagnostic: the deepest message in its
 * chain ("Property 'autocomplete' does not exist … Did you mean
 * 'autoComplete'?"), with long type dumps shortened.
 */
function readable(messageText) {
  let leaf = messageText;
  while (typeof leaf !== 'string' && leaf.next?.length) leaf = leaf.next[leaf.next.length - 1];
  const text = typeof leaf === 'string' ? leaf : leaf.messageText;
  return text.replace(/'([^']{60,})'/g, (_, t) => `'${t.slice(0, 40)}…'`).slice(0, 300);
}

/** Not about the design system: a missing module is an environment problem. */
const WARNING_CODES = new Set([2307, 7016]);

/** `files`: paths, or `{ file, text }` when the source is not the file itself (a script extracted from HTML). */
export function typecheck(inputs, { root }) {
  const files = inputs.map((i) => (typeof i === 'string' ? i : i.file));
  const textOf = new Map(inputs.map((i) => (typeof i === 'string' ? [i, null] : [i.file, i.text])));
  const dts = path.join(root, 'dist/index.d.ts');
  if (!fs.existsSync(dts)) {
    return files.map((file) => ({ file, findings: [{ rule: 'prop-type', severity: 'warning', line: 1, column: 1, message: 'dist/index.d.ts is missing: run `npm run build` to enable the prop check.', evidence: '' }] }));
  }

  // The rewritten copies live under node_modules/.cache so bare imports
  // (react, @phosphor-icons/react) resolve from the repo's node_modules.
  const tmp = path.join(root, 'node_modules/.cache/check-design');
  fs.mkdirSync(tmp, { recursive: true });
  const copies = files.map((file, i) => {
    const text = textOf.get(file) ?? fs.readFileSync(file, 'utf8');
    const usesGlobal = /\bwindow\.Instacart\b/.test(text);
    const body = usesGlobal ? text.replace(/\bwindow\.Instacart\b/g, '__Instacart') : text;
    const header = usesGlobal ? "import * as __Instacart from 'instacart-ps-ds'; " : '';
    const copy = path.join(tmp, `${i}-${path.basename(file).replace(/\.(jsx|js|html?)$/, '.tsx')}`);
    fs.writeFileSync(copy, header + body);
    return { file, copy, headerLength: header.length };
  });

  const program = ts.createProgram(copies.map((c) => c.copy), {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: false,
    noEmit: true,
    skipLibCheck: true,
    allowUmdGlobalAccess: true,
    esModuleInterop: true,
    allowJs: true,
    lib: ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    baseUrl: root,
    paths: { 'instacart-ps-ds': [dts] },
  });

  return copies.map(({ file, copy, headerLength }) => {
    const sf = program.getSourceFile(copy);
    const findings = ts.getPreEmitDiagnostics(program, sf)
      .filter((d) => d.file === sf)
      // `class` on a component is reported by the clearer component-class rule.
      .filter((d) => !/Property 'class' does not exist/.test(ts.flattenDiagnosticMessageText(d.messageText, ' ')))
      .map((d) => {
      const { line, character } = sf.getLineAndCharacterOfPosition(d.start ?? 0);
      return {
        rule: 'prop-type',
        severity: WARNING_CODES.has(d.code) ? 'warning' : 'error',
        line: line + 1,
        column: line === 0 ? Math.max(1, character + 1 - headerLength) : character + 1,
        message: readable(d.messageText),
        evidence: '',
      };
    });
    return { file, findings };
  });
}

#!/usr/bin/env node
/**
 * check:visual — render Claude Design canvas artboards with the real
 * design-system components and screenshot them, light and dark.
 *
 *   node scripts/visual-check/index.mjs <artboard.dc.html | canvas folder> [...]
 *
 * Options:
 *   --bundle <js>      a ready IIFE bundle that sets window.<Ns> (repeatable)
 *   --entry <js>       an ESM entry to bundle into an IIFE (default: dist/index.js)
 *   --global <Ns[,Ns]> the global name(s) for --entry (default: Instacart)
 *   --css <css>        a stylesheet to load (repeatable; default: dist/instacart.standalone.css)
 *   --out <dir>        output folder (default: visual-check-output)
 *   --themes <list>    default: light,dark
 *   --width <px>       artboard width when the canvas gives none (default 1280)
 *   --no-signals       screenshots only, no warnings
 *   --strict           exit 1 when there are warnings
 *
 * When neither --bundle nor --entry is given, the artboard's own
 * `ds/<ns>/…` files are used if they sit next to it; otherwise the Instacart
 * build in dist/.
 *
 * See README.md in this folder.
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectInputs, loadArtboard } from './lib/artboard.mjs';
import { buildDsBundle, buildReactVendor, DEFAULTS, REPO } from './lib/bundle.mjs';
import { writeContactSheets } from './lib/contact-sheet.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

/* ------------------------------------------------------------------ args */
function parseArgs(argv) {
  const o = { inputs: [], bundles: [], css: [], themes: ['light', 'dark'], width: 1280, signals: true, strict: false, out: join(REPO, 'visual-check-output') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) throw new Error(`${a} needs a value`);
      return argv[++i];
    };
    if (a === '--bundle') o.bundles.push(resolve(next()));
    else if (a === '--entry') o.entry = resolve(next());
    else if (a === '--global') o.global = next();
    else if (a === '--css') o.css.push(resolve(next()));
    else if (a === '--out') o.out = resolve(next());
    else if (a === '--themes') o.themes = next().split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--width') o.width = Number(next());
    else if (a === '--no-signals') o.signals = false;
    else if (a === '--strict') o.strict = true;
    else if (a === '-h' || a === '--help') o.help = true;
    else if (a.startsWith('--')) throw new Error(`unknown option ${a}`);
    else o.inputs.push(a);
  }
  return o;
}

/* --------------------------------------------------------- file server */
const TYPES = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };

/** Serves any local file at `/fs/<absolute path>`, so CSS-relative font URLs work. */
function serve() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.startsWith('/fs/') ? path.slice(3) : null;
    if (!file || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ server, base: `http://127.0.0.1:${server.address().port}` })));
}
const url = (base, file) => `${base}/fs${file.split('/').map(encodeURIComponent).join('/')}`;

/* -------------------------------------------------------------- page */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function pageHtml({ board, theme, base, reactJs, bundles, css, artboardJs }) {
  const attrs = Object.entries(board.htmlAttrs)
    .filter(([k]) => k !== 'data-theme')
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join('');
  const config = { theme, dcCode: board.dcCode, dcProps: board.dcProps };
  return `<!doctype html>
<html${attrs} data-theme="${theme}">
<head>
<meta charset="utf-8">
<title>${esc(board.title)}</title>
${css.map((c) => `<link rel="stylesheet" href="${url(base, c)}">`).join('\n')}
${board.helmet}
<script src="${url(base, reactJs)}"></script>
${bundles.map((b) => `<script src="${url(base, b)}"></script>`).join('\n')}
<script src="${url(base, join(HERE, 'lib/runtime.js'))}"></script>
</head>
<body>
<div id="vc-root"></div>
<script>window.__vcConfig = ${JSON.stringify(config).replace(/</g, '\\u003c')};</script>
<script src="${url(base, artboardJs)}"></script>
<script>window.__vcRun();</script>
</body>
</html>
`;
}

/* -------------------------------------------------------------- main */
async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.help || o.inputs.length === 0) {
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').match(/\/\*\*([\s\S]*?)\*\//)[1].replace(/^ \* ?/gm, ''));
    process.exit(o.help ? 0 : 1);
  }

  const groups = collectInputs(o.inputs);
  mkdirSync(o.out, { recursive: true });
  // Output never goes in git.
  if (!existsSync(join(o.out, '.gitignore'))) writeFileSync(join(o.out, '.gitignore'), '*\n');

  const reactJs = await buildReactVendor(o.out);
  const { server, base } = await serve();
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  let warnings = 0;

  try {
    for (const group of groups) {
      const outDir = join(o.out, group.canvas);
      const pagesDir = join(outDir, '_pages');
      mkdirSync(pagesDir, { recursive: true });
      const report = { canvas: group.canvas, source: group.dir, renderedAt: new Date().toISOString(), boards: [] };
      console.log(`\n${group.canvas}  (${relative(process.cwd(), group.dir) || '.'})`);

      for (const { file, board: meta } of group.boards) {
        const entry = { board: basename(file), title: meta.title ?? null, shots: {}, issues: [], setup: {} };
        report.boards.push(entry);
        let board;
        try {
          board = await loadArtboard(file, meta);
        } catch (err) {
          entry.issues.push({ rule: 'convert-error', message: err.message });
          console.log(`  ${basename(file)}: ${err.message}`);
          continue;
        }
        entry.title = board.title;
        if (!meta.w && !board.dcProps?.$preview?.width) board.width = o.width;

        // Which design-system files to load.
        let bundles;
        let css;
        let source;
        if (o.bundles.length || o.entry) {
          bundles = [...o.bundles];
          if (o.entry) bundles.push(await buildDsBundle(o.entry, (o.global ?? board.namespaces[0] ?? DEFAULTS.global).split(','), o.out));
          css = o.css;
          source = 'flags';
        } else if (board.assets.js.length) {
          bundles = board.assets.js;
          css = o.css.length ? o.css : board.assets.css;
          source = "the artboard's own ds/ files";
        } else {
          if (!existsSync(DEFAULTS.entry)) throw new Error('dist/ is missing. Run `npm run build` first, or pass --bundle / --entry.');
          bundles = [await buildDsBundle(DEFAULTS.entry, (o.global ?? DEFAULTS.global).split(','), o.out)];
          css = o.css.length ? o.css : [DEFAULTS.css];
          source = 'Instacart dist/';
        }
        entry.setup = { source, bundles: bundles.map((b) => relative(REPO, b)), css: css.map((c) => relative(REPO, c)), size: [board.width, board.height] };
        if (board.assets.missing.length && source !== "the artboard's own ds/ files") {
          entry.issues.push({ rule: 'setup', level: 'info', message: `The artboard loads ${board.assets.missing.join(', ')} on the canvas; used ${source} instead.` });
        }

        const artboardJs = join(pagesDir, `${board.name}.artboard.js`);
        writeFileSync(artboardJs, board.js);

        const seen = new Set();
        for (const theme of o.themes) {
          const pageFile = join(pagesDir, `${board.name}.${theme}.html`);
          writeFileSync(pageFile, pageHtml({ board, theme, base, reactJs, bundles, css, artboardJs }));
          const page = await browser.newPage({ viewport: { width: board.width, height: board.height }, colorScheme: theme === 'dark' ? 'dark' : 'light' });
          const errors = [];
          // Errors while the artboard renders count; errors from the signals'
          // own trial renders (a part mounted without its parent) do not.
          let rendering = true;
          page.on('pageerror', (e) => rendering && errors.push(e.message));
          page.on('console', (m) => rendering && m.type() === 'error' && !/^Failed to load resource/.test(m.text()) && errors.push(m.text()));
          const notFound = new Set();
          page.on('response', (r) => r.status() >= 400 && notFound.add(decodeURIComponent(new URL(r.url()).pathname.replace(/^\/fs/, ''))));
          try {
            await page.goto(url(base, pageFile), { waitUntil: 'load', timeout: 30000 });
            await page.waitForFunction(() => window.__vcDone === true, null, { timeout: 15000 });
            await page.waitForTimeout(150);
            const shot = join(outDir, `${board.name}.${theme}.png`);
            await page.screenshot({ path: shot, fullPage: true });
            entry.shots[theme] = basename(shot);
            rendering = false;
            const height = await page.evaluate(() => document.documentElement.scrollHeight);
            const issues = o.signals ? await page.evaluate((t) => window.__vcSignals(t), theme) : await page.evaluate(() => window.__vcIssues);
            if (height > board.height + 1) issues.push({ rule: 'board-overflow', level: 'info', message: `The content is ${height}px tall; the artboard is ${board.height}px. The screenshot shows all of it.` });
            for (const f of notFound) issues.push({ rule: 'missing-file', level: 'info', message: `The page asked for ${relative(REPO, f)} and it does not exist (often a font the stylesheet points at).` });
            for (const e of errors.slice(0, 5)) issues.push({ rule: 'page-error', message: e.slice(0, 300) });
            for (const i of issues) {
              // The same finding in both themes is listed once.
              const key = `${i.rule}|${i.message}`;
              if (seen.has(key)) continue;
              seen.add(key);
              entry.issues.push({ ...i, theme });
            }
          } catch (err) {
            entry.issues.push({ rule: 'render-error', theme, message: err.message.split('\n')[0] });
          } finally {
            await page.close();
          }
        }

        const real = entry.issues.filter((i) => i.level !== 'info');
        warnings += real.length;
        console.log(`  ${board.name}  ${Object.keys(entry.shots).map((t) => `${t}.png`).join(' ')}  ${real.length ? `${real.length} warning(s)` : 'no warnings'}`);
        for (const i of real) console.log(`    ${i.rule}${i.theme ? ` (${i.theme})` : ''}: ${i.message}`);
      }

      writeFileSync(join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    }
  } finally {
    await browser.close();
    server.close();
  }

  const sheet = writeContactSheets(o.out);
  console.log(`\nContact sheet: ${relative(process.cwd(), sheet)}`);
  console.log('Clean signals are not a pass. Open the screenshots and look.');
  if (o.strict && warnings) process.exit(1);
}

main().catch((err) => {
  console.error(`check:visual: ${err.message}`);
  if (/Executable doesn't exist|browserType\.launch/.test(err.message)) console.error('Install the browser once with: npx playwright install chromium');
  process.exit(2);
});

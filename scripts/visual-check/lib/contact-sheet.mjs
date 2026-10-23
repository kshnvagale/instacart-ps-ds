/**
 * Contact sheets: `<out>/<canvas>/index.html` for each canvas, and
 * `<out>/index.html` with every canvas rendered so far (read from each
 * canvas folder's report.json).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const STYLE = `
:root { color-scheme: light dark; --bg: #f6f6f4; --card: #fff; --ink: #1d1d1b; --muted: #6b6b66; --line: #deded8; --warn: #a14a00; }
@media (prefers-color-scheme: dark) { :root { --bg: #161615; --card: #20201e; --ink: #ececea; --muted: #a2a29c; --line: #3a3a36; --warn: #ffb066; } }
* { box-sizing: border-box; }
body { margin: 0; padding: 24px 16px 64px; background: var(--bg); color: var(--ink); font: 14px/1.5 system-ui, sans-serif; }
h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 18px; margin: 40px 0 4px; } h3 { font-size: 15px; margin: 0; }
p.lead { color: var(--muted); margin: 0 0 16px; }
.board { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 16px; margin: 16px 0; }
.shots { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; margin-top: 12px; }
figure { margin: 0; } figcaption { color: var(--muted); font-size: 12px; margin-bottom: 4px; }
figure img { width: 100%; height: auto; border: 1px solid var(--line); border-radius: 6px; display: block; }
ul.issues { margin: 12px 0 0; padding-left: 18px; } ul.issues li { margin: 2px 0; }
.rule { font-family: ui-monospace, monospace; font-size: 12px; color: var(--warn); }
.info .rule { color: var(--muted); } .info { color: var(--muted); }
.meta { color: var(--muted); font-size: 12px; }
a { color: inherit; }
`;

function boardHtml(r, b, prefix) {
  const shots = Object.entries(b.shots ?? {})
    .map(([t, f]) => `<figure><figcaption>${esc(t)}</figcaption><a href="${prefix}${esc(f)}"><img loading="lazy" src="${prefix}${esc(f)}" alt="${esc(b.title)}, ${esc(t)} theme"></a></figure>`)
    .join('');
  const issues = (b.issues ?? [])
    .map((i) => `<li class="${i.level === 'info' ? 'info' : ''}"><span class="rule">${esc(i.rule)}${i.theme ? ` · ${esc(i.theme)}` : ''}</span> ${esc(i.message)}</li>`)
    .join('');
  const warn = (b.issues ?? []).filter((i) => i.level !== 'info').length;
  return `<section class="board">
<h3>${esc(b.title)} <span class="meta">${esc(b.board)} · ${warn ? `${warn} warning(s)` : 'no warnings'}</span></h3>
<div class="meta">${esc(b.setup?.source ?? '')}${b.setup?.size ? ` · ${b.setup.size.join(' × ')}` : ''}</div>
<div class="shots">${shots || '<p class="meta">No screenshot.</p>'}</div>
${issues ? `<ul class="issues">${issues}</ul>` : ''}
</section>`;
}

const page = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><style>${STYLE}</style></head>
<body>${body}</body></html>
`;

export function writeContactSheets(out) {
  const reports = readdirSync(out, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.') && existsSync(join(out, d.name, 'report.json')))
    .map((d) => ({ dir: d.name, r: JSON.parse(readFileSync(join(out, d.name, 'report.json'), 'utf8')) }));

  for (const { dir, r } of reports) {
    const body = `<h1>${esc(r.canvas)}</h1><p class="lead">Rendered ${esc(r.renderedAt)} from ${esc(r.source)}. Clean signals are not a pass: look at every screenshot.</p>${r.boards.map((b) => boardHtml(r, b, '')).join('\n')}`;
    writeFileSync(join(out, dir, 'index.html'), page(`${r.canvas} visual check`, body));
  }

  const body = `<h1>Visual check</h1><p class="lead">Every canvas rendered with the real components, light and dark. Clean signals are not a pass: look at every screenshot.</p>${reports
    .map(({ dir, r }) => `<h2><a href="${esc(dir)}/index.html">${esc(r.canvas)}</a></h2><p class="meta">${esc(r.renderedAt)}</p>${r.boards.map((b) => boardHtml(r, b, `${dir}/`)).join('\n')}`)
    .join('\n')}`;
  const file = join(out, 'index.html');
  writeFileSync(file, page('Visual check', body));
  return file;
}

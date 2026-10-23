/*
 * The visual check's small canvas runtime. It runs in the browser page, after
 * React (window.React / window.ReactDOM) and the design-system bundle.
 *
 * It mounts an artboard the way the Claude Design canvas does:
 * - plain HTML stays HTML (already converted to React elements);
 * - `NS.Comp` resolves on `window.NS`, and the real component is mounted with
 *   the attributes as props, unchanged by us;
 * - `{{hole}}` values come from the artboard's `renderVals()`.
 * Then it collects simple warning signals from what actually rendered.
 */
(function () {
  'use strict';
  const React = window.React;
  const issues = [];
  const note = (rule, message, extra) => issues.push(Object.assign({ rule, message }, extra || {}));

  /** Real component -> its canvas name ("NS.Comp"), for the signals below. */
  const names = new Map();
  const missing = new Map();

  function Missing(name) {
    if (!missing.has(name)) {
      const C = function MissingComponent(props) {
        return React.createElement(
          'div',
          { 'data-vc-missing': name, style: { outline: '2px dashed #d00', color: '#d00', padding: 4, font: '12px monospace' } },
          'Missing component: ' + name,
          props.children,
        );
      };
      missing.set(name, C);
      note('missing-component', name + ' is not in the design-system bundle, so nothing real renders there.', { component: name });
    }
    return missing.get(name);
  }

  function resolver(path, obj) {
    return new Proxy(
      {},
      {
        get(_, key) {
          if (typeof key !== 'string') return undefined;
          const full = path + '.' + key;
          const value = obj == null ? undefined : obj[key];
          if (value == null) return Missing(full);
          // A component (function, forwardRef or memo object) is used as is.
          if (typeof value === 'function' || (typeof value === 'object' && value.$$typeof)) {
            if (!names.has(value)) names.set(value, full);
            // `Ns.Dialog.Popup`: an object of parts that is itself a component.
            return value;
          }
          if (typeof value === 'object') return resolver(full, value);
          return value;
        },
      },
    );
  }

  window.__vcNamespace = function (ns) {
    if (window[ns] == null) note('missing-namespace', 'window.' + ns + ' does not exist. No bundle on the page sets it.', { namespace: ns });
    return resolver(ns, window[ns]);
  };

  class DCLogic {
    constructor(props) {
      this.props = props || {};
      this.state = {};
    }
    setState(s) {
      Object.assign(this.state, typeof s === 'function' ? s(this.state) : s);
    }
    forceUpdate() {}
  }

  function holes(cfg) {
    let vals = {};
    if (cfg.dcCode && cfg.dcCode.trim()) {
      try {
        const Component = new Function('DCLogic', 'React', cfg.dcCode + '\n;return typeof Component !== "undefined" ? Component : null;')(DCLogic, React);
        if (Component) {
          const inst = new Component(cfg.dcProps || {});
          vals = (inst.renderVals && inst.renderVals()) || {};
        }
      } catch (e) {
        note('render-vals', 'renderVals() failed, so {{holes}} show as placeholders: ' + e.message);
      }
    }
    const reported = new Set();
    return new Proxy(vals, {
      get(t, k) {
        if (typeof k !== 'string') return undefined;
        if (k in t) return t[k];
        // A literal written as a hole: {{true}}, {{false}}, {{null}}, {{3}}.
        if (k === 'true') return true;
        if (k === 'false') return false;
        if (k === 'null') return null;
        if (/^-?\d+(\.\d+)?$/.test(k)) return Number(k);
        if (!reported.has(k)) {
          reported.add(k);
          note('missing-hole', '{{' + k + '}} has no value in renderVals(); it shows as a placeholder.', { hole: k });
        }
        return '{{' + k + '}}';
      },
    });
  }

  const raf = () => new Promise((r) => requestAnimationFrame(() => r()));

  /* The artboard script reads holes when it renders, which is after
     renderVals() has run; this stand-in forwards to the real values. */
  let holeValues = {};
  window.__vcHoles = new Proxy({}, { get: (_, k) => holeValues[k], has: (_, k) => k in holeValues });

  window.__vcRun = async function () {
    const cfg = window.__vcConfig;
    try {
      holeValues = holes(cfg);
      const Artboard = window.__vcArtboard && window.__vcArtboard.default;
      if (!Artboard) throw new Error('the artboard script did not load');
      const root = document.getElementById('vc-root');
      window.ReactDOM.flushSync
        ? window.ReactDOM.flushSync(() => window.ReactDOM.createRoot(root).render(React.createElement(Artboard)))
        : window.ReactDOM.createRoot(root).render(React.createElement(Artboard));
      await raf();
      applyTheme(cfg.theme);
      await raf();
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      await raf();
    } catch (e) {
      note('render-error', 'The artboard did not render: ' + (e && e.message));
    }
    window.__vcDone = true;
  };

  /* Elements in the artboard that pin data-theme are switched to the theme
     under test, so the dark shot really is dark. Recorded as a note. */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const pinned = [...document.querySelectorAll('#vc-root [data-theme]')].filter((el) => el.getAttribute('data-theme') !== theme);
    if (pinned.length) {
      pinned.forEach((el) => el.setAttribute('data-theme', theme));
      note('theme-pinned', pinned.length + ' element(s) in the artboard pin data-theme; switched to "' + theme + '" for this shot.', { level: 'info' });
    }
  }

  /* ---------------------------------------------------------------- signals */

  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  /** Any CSS colour (oklch, color(), hex…) -> [r, g, b, a] in sRGB 0-255 / 0-1. */
  function rgba(color) {
    if (!color || color === 'transparent') return [0, 0, 0, 0];
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  }
  const over = (top, bottom) => {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat(a);
  };
  const lum = (c) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

  function describe(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    const slot = el.getAttribute('data-slot');
    if (slot) s += '[data-slot=' + slot + ']';
    return s;
  }
  const textOf = (el) =>
    [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0.05;
  };

  /** The background behind an element: its own and its ancestors', composited. */
  function backdrop(el) {
    const layers = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; // a gradient or image: unknown
      const c = rgba(cs.backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] >= 1) break;
    }
    let bg = [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg);
    return bg;
  }

  function contrast(root) {
    const seen = new Set();
    for (const el of root.querySelectorAll('*')) {
      const text = textOf(el);
      if (!text || !visible(el)) continue;
      if (el.closest('[disabled],[aria-disabled="true"],[data-disabled],[aria-hidden="true"],.sr-only,[data-vc-missing]')) continue;
      const cs = getComputedStyle(el);
      const bg = backdrop(el);
      if (!bg) continue;
      const fg = over(rgba(cs.color), bg);
      const size = parseFloat(cs.fontSize);
      const weight = Number(cs.fontWeight) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const need = large ? 3 : 4.5;
      const r = ratio(fg, bg);
      if (r >= need) continue;
      const key = hex(fg) + hex(bg) + text.slice(0, 40);
      if (seen.has(key)) continue;
      seen.add(key);
      note('low-contrast', 'Text contrast ' + r.toFixed(2) + ':1 (needs ' + need + ':1): "' + text.slice(0, 60) + '"', {
        element: describe(el),
        color: hex(fg),
        background: hex(bg),
        ratio: Number(r.toFixed(2)),
      });
    }
  }

  function overflow(root) {
    for (const el of root.querySelectorAll('*')) {
      const text = textOf(el);
      if (!text) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'inline' || cs.textOverflow === 'ellipsis' || !visible(el)) continue;
      if (el.closest('.sr-only')) continue;
      const x = el.scrollWidth - el.clientWidth;
      const y = el.scrollHeight - el.clientHeight;
      if (el.clientWidth > 0 && x > 1) {
        note('text-overflow', 'Text is ' + x + 'px wider than its box' + (cs.overflowX === 'visible' ? ' and spills out' : ' and is cut off') + ': "' + text.slice(0, 60) + '"', { element: describe(el) });
      } else if (el.clientHeight > 0 && y > 2 && cs.overflowY !== 'visible') {
        note('text-overflow', 'Text is ' + y + 'px taller than its box and is cut off: "' + text.slice(0, 60) + '"', { element: describe(el) });
      }
    }
    const page = document.documentElement;
    if (page.scrollWidth > page.clientWidth + 1) {
      note('page-overflow', 'The page is ' + (page.scrollWidth - page.clientWidth) + 'px wider than the artboard (horizontal scroll).');
    }
  }

  /* ---- lost styling: a component that, rendered alone with the same props,
     has a background, border, shadow or padding, but on the artboard has none. */
  const fiberOf = (el) => {
    const k = Object.keys(el).find((x) => x.startsWith('__reactFiber$'));
    return k ? el[k] : null;
  };
  const dsName = (f) => names.get(f.elementType) || names.get(f.type);
  const HOST = 5;
  /** The design-system component whose first DOM node is this element. */
  function ownerOf(el) {
    let f = fiberOf(el);
    if (!f) return null;
    for (let p = f.return; p; p = p.return) {
      if (p.tag === HOST) return null; // another element sits in between
      if (dsName(p)) return p;
    }
    return null;
  }
  const paint = (el) => {
    const cs = getComputedStyle(el);
    const border = ['Top', 'Right', 'Bottom', 'Left'].some(
      (s) => parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none' && rgba(cs['border' + s + 'Color'])[3] > 0,
    );
    return {
      background: rgba(cs.backgroundColor)[3] > 0 || cs.backgroundImage !== 'none',
      border,
      shadow: cs.boxShadow !== 'none',
      padding: ['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(cs['padding' + s]) > 0),
    };
  };

  function lostStyling(root, theme) {
    const sandbox = document.createElement('div');
    sandbox.setAttribute('data-theme', theme);
    sandbox.style.cssText = 'position:absolute;left:-20000px;top:0;width:1200px;';
    document.body.appendChild(sandbox);
    const done = new Set();
    for (const el of root.querySelectorAll('*')) {
      const owner = ownerOf(el);
      if (!owner || done.has(owner)) continue;
      done.add(owner);
      const name = dsName(owner);
      const props = Object.assign({}, owner.memoizedProps);
      const given = { class: props.class, className: props.className };
      delete props.class;
      delete props.className;
      delete props.style;
      delete props.ref;
      const host = document.createElement('div');
      sandbox.appendChild(host);
      let ref = null;
      try {
        const r = window.ReactDOM.createRoot(host);
        window.ReactDOM.flushSync(() => r.render(React.createElement(owner.elementType || owner.type, props)));
        ref = host.firstElementChild;
        if (ref) {
          const want = paint(ref);
          const got = paint(el);
          const lost = Object.keys(want).filter((k) => want[k] && !got[k]);
          if (lost.length) {
            const why = given.class != null ? ' It was given class="' + given.class + '" (a prop named `class`; the canvas wants class-name).' : '';
            note('lost-styling', name + ' renders with no ' + lost.join(', ') + ', but its recipe has ' + (lost.length > 1 ? 'them' : 'it') + '.' + why, {
              component: name,
              element: describe(el),
              lost,
              classProp: given.class,
            });
          }
        }
        r.unmount();
      } catch (e) {
        /* a component that cannot render alone (needs a parent): skip */
      }
      host.remove();
    }
    sandbox.remove();
  }

  window.__vcSignals = function (theme) {
    const root = document.getElementById('vc-root');
    try {
      lostStyling(root, theme);
    } catch (e) {
      note('signal-error', 'lost-styling check failed: ' + e.message, { level: 'info' });
    }
    try {
      overflow(root);
    } catch (e) {
      note('signal-error', 'overflow check failed: ' + e.message, { level: 'info' });
    }
    try {
      contrast(root);
    } catch (e) {
      note('signal-error', 'contrast check failed: ' + e.message, { level: 'info' });
    }
    return issues;
  };
  window.__vcIssues = issues;
})();

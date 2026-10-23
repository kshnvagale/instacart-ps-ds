/**
 * Reads a design file (TSX/JSX) into the facts every rule needs: each JSX
 * element with its tag, attributes, class names, inline style, parent and
 * source text. Rules never touch the TypeScript AST themselves.
 *
 * Tags are normalised to the component name, so `<Button>`,
 * `<Instacart.Button>` and `<window.Instacart.Button>` (a Claude Design export) are all
 * `Button`.
 */
import ts from 'typescript';

/** Calls whose string arguments are class lists. */
const CLASS_HELPERS = new Set(['cn', 'clsx', 'cx', 'twMerge', 'classNames']);

export function parseDesign(fileName, text) {
  const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const elements = [];
  const declarations = new Map();

  const pos = (node) => {
    const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    return { line: line + 1, column: character + 1 };
  };

  const visit = (node, parent) => {
    if (ts.isFunctionDeclaration(node) && node.name) declarations.set(node.name.text, node.getText(sf));
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      declarations.set(node.name.text, node.getText(sf));
    }

    let self = parent;
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const rawTag = opening.tagName.getText(sf);
      const last = rawTag.split('.').pop();
      const el = {
        tag: /^[A-Z]/.test(last) ? last : rawTag,
        intrinsic: /^[a-z]/.test(rawTag),
        attrs: readAttributes(opening, sf),
        classes: [],
        style: [],
        parent,
        children: [],
        text: node.getText(sf),
        openingText: opening.getText(sf),
        childText: ts.isJsxElement(node) ? jsxText(node, sf) : '',
        ...pos(node),
      };
      collectClasses(opening, sf, el.classes);
      collectStyle(opening, sf, el.style);
      if (parent) parent.children.push(el);
      elements.push(el);
      self = el;
    }
    ts.forEachChild(node, (child) => visit(child, self));
  };
  visit(sf, null);

  return { sourceFile: sf, elements, declarations, text };
}

/** Attribute name -> literal string, `true`, or the expression's source text. */
function readAttributes(opening, sf) {
  const attrs = {};
  for (const a of opening.attributes.properties) {
    if (!ts.isJsxAttribute(a)) continue;
    const name = a.name.getText(sf);
    if (!a.initializer) attrs[name] = true;
    else if (ts.isStringLiteral(a.initializer)) attrs[name] = a.initializer.text;
    else if (ts.isJsxExpression(a.initializer) && a.initializer.expression) {
      const e = a.initializer.expression;
      attrs[name] = ts.isStringLiteralLike(e) ? e.text : { expr: e.getText(sf), identifier: ts.isIdentifier(e) ? e.text : null };
    }
  }
  return attrs;
}

/** The visible words inside an element, JSX text and string children only. */
function jsxText(node, sf) {
  const parts = [];
  const walk = (n) => {
    if (ts.isJsxText(n)) parts.push(n.text);
    else if (ts.isJsxExpression(n) && n.expression && ts.isStringLiteralLike(n.expression)) parts.push(n.expression.text);
    ts.forEachChild(n, walk);
  };
  node.children.forEach(walk);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function collectClasses(opening, sf, out) {
  for (const a of opening.attributes.properties) {
    if (!ts.isJsxAttribute(a) || !['className', 'class'].includes(a.name.getText(sf)) || !a.initializer) continue;
    const pushString = (s) => s.split(/\s+/).filter(Boolean).forEach((c) => out.push(c));
    const walk = (n) => {
      if (ts.isStringLiteralLike(n)) pushString(n.text);
      else if (ts.isTemplateExpression(n)) {
        pushString(n.head.text);
        n.templateSpans.forEach((s) => pushString(s.literal.text));
      } else if (ts.isCallExpression(n) && CLASS_HELPERS.has(n.expression.getText(sf))) n.arguments.forEach(walk);
      else if (ts.isConditionalExpression(n)) [n.whenTrue, n.whenFalse].forEach(walk);
      else if (ts.isBinaryExpression(n)) walk(n.right);
      else if (ts.isArrayLiteralExpression(n)) n.elements.forEach(walk);
      else if (ts.isObjectLiteralExpression(n)) {
        n.properties.forEach((p) => p.name && ts.isStringLiteral(p.name) && pushString(p.name.text));
      } else if (ts.isJsxExpression(n) && n.expression) walk(n.expression);
    };
    walk(a.initializer);
  }
}

/** `style={{ prop: literal }}` entries; non-literal values are skipped. */
function collectStyle(opening, sf, out) {
  for (const a of opening.attributes.properties) {
    if (!ts.isJsxAttribute(a) || a.name.getText(sf) !== 'style') continue;
    const e = a.initializer && ts.isJsxExpression(a.initializer) ? a.initializer.expression : null;
    if (!e || !ts.isObjectLiteralExpression(e)) continue;
    for (const p of e.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      const v = p.initializer;
      const value = ts.isStringLiteralLike(v) ? v.text : ts.isNumericLiteral(v) ? Number(v.text) : null;
      if (value !== null) out.push({ prop: p.name.getText(sf).replace(/['"]/g, ''), value });
    }
  }
}

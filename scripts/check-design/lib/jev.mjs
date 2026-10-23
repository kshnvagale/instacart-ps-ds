/**
 * Semantic rules, judged by Jev (TypeSafe System One).
 *
 * The split follows TypeSafe's own guidance: code finds every candidate usage
 * (deterministic, from the AST); Jev answers ONE narrow yes/no (a Noul) per
 * usage, with the rule written as the component's TSDoc header states it. Jev never sees colours, numbers or counts: those
 * are its documented weak spots and live in static-rules.mjs instead.
 *
 * These are opinions, so they are WARNINGS: they never change the exit code.
 * Promote a rule only after `calibrate.mjs` shows it is reliable on our data.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const API_URL = 'https://api.typesafe.ai/v1/systemone';
const MODEL = process.env.TYPESAFE_MODEL || 'jev-latest';
const FLAG_AT = 0.8;
const UNSURE_AT = 0.5;
const SNIPPET = 500;
const WINDOW = 220;

/** A money amount or a per-unit price in visible words: "$3.99", "$0.42/oz". */
const MONEY = /[$€£]\s?\d|\d\s?\/\s?(oz|fl oz|lb|lbs|each|ea|ct|kg|g|ml|l)\b/i;
/** Plain elements that can carry visible copy. */
const TEXT_TAGS = new Set(['p', 'span', 'div', 'strong', 'b', 'em', 'small', 'label', 'td', 'li', 'dd']);
const QUANTITY_BUTTONS = new Set(['IconButton', 'Button', 'button']);

/**
 * One rule: which usages are candidates, and the question about each. The
 * `rule` text is the component's TSDoc header (src/components/<Name>/<Name>.tsx)
 * in one or two sentences; keep them in step.
 */
export const JEV_RULES = [
  {
    id: 'link-writes-data',
    criteria: { true: 'Its onClick or href performs an action that changes data: it adds to cart, places or cancels an order, saves, deletes, signs out or pays. In rendered HTML, where handlers are not visible, a link that goes nowhere (href="#") with an action label such as Add to cart, Cancel order, Remove or Sign out counts.', false: 'It only takes the user to another page, section, store, aisle or help article, even in a new tab.' },
    rule: 'An Instacart Link is navigation and nothing else: it changes where you are, not what is true. If activating it adds to cart, places or cancels an order, saves, deletes or signs out, it must be a Button.',
    question: 'Does activating this Link write, submit or delete data instead of navigating to another place?',
    candidates: (els) => els.filter((e) => e.tag === 'Link'),
  },
  {
    id: 'badge-interactive',
    criteria: { true: 'The Badge has a click, remove or toggle handler, a remove mark such as ×, or reads as a filter or button the user can act on ("Organic ×", "Tap to apply").', false: 'The Badge only labels or reports a fact about what it sits beside, such as Sale, Out of stock, Organic, Delivered or Only 3 left.' },
    rule: 'An Instacart Badge is a small passive tag that reports a fact about the thing it sits on. It is NEVER something the user clicks, removes or toggles: for an action use Button, to go somewhere use Link.',
    question: 'Is this Badge presented as something the user is meant to click, remove, toggle or filter by?',
    candidates: (els) => els.filter((e) => e.tag === 'Badge'),
    context: 'parent',
  },
  {
    id: 'checkbox-instant',
    criteria: { true: 'Its change handler saves, sends or applies the setting right away (an API call, a mutation, persisting), or the text around it says the change applies at once, with no submit button.', false: 'It only updates form state that a submit button such as "Place order" or "Save address" sends later, or it has no handler and sits in a form with a submit button.' },
    rule: 'An Instacart Checkbox is an opt-in that takes effect when the form is submitted ("Leave at door", applied by "Place order"). A setting that applies the moment it is flipped, with no save button ("Substitution alerts"), must be a Switch.',
    question: 'Does changing this Checkbox immediately apply or save a setting, rather than set a value that is submitted later?',
    candidates: (els) => els.filter((e) => e.tag === 'Checkbox'),
    context: 'parent',
  },
  {
    id: 'text-as-heading',
    criteria: { true: 'The bold or strong text names the content that follows it, like a section, card, aisle or group title ("Often Bought With", "Delivery details").', false: 'The text is emphasis inside a sentence, a value, a single field\'s label, a product size, or a price.' },
    rule: 'Instacart Text is body, label and caption copy. Anything that titles a section, card or group of content ("Often Bought With") is a Heading with a level, never bold or big Text.',
    question: 'Is this bold Text acting as the title of a section, card or group of content?',
    candidates: (els) => els.filter((e) => e.tag === 'Text' && (e.tone === 'strong' || e.attrs.tone === 'strong' || (e.renderedClasses ?? e.classes).some((c) => /^font-(semibold|bold)$/.test(c)))),
    context: 'parent',
  },
  {
    id: 'vague-label',
    criteria: { true: 'The label is only a generic word that could be on any button: OK, Confirm, Submit, Yes, No, Continue, Done, Click here or Go.', false: 'The label names the specific action or object (Add to cart, Place order, Save address, Apply promo code), is a standard dismissal (Cancel, Close, Dismiss, Back), or is a loading message.' },
    rule: 'An Instacart Button label is the verb that says what happens ("Add to cart", "Place order"). A bare generic word such as OK, Submit, Confirm, Yes, Continue or Click here does not.',
    question: 'Is this button label a bare generic word that does not name the specific action?',
    candidates: (els) => els.filter((e) => e.tag === 'Button' && e.childText),
    label: (e) => `Label: "${e.childText}"`,
  },
  {
    id: 'price-as-text',
    criteria: { true: 'The element shows a price on its own, as the amount a shopper pays or compares: "$3.99", "$2.99 each", "was $4.99", "$0.42/oz", a cart subtotal or a fee amount.', false: 'The money is mentioned inside a sentence of copy ("$0 delivery fees on your first 3 orders", "Free delivery on orders over $35"), or the element is not about money at all.' },
    rule: 'Every Instacart money amount a shopper reads on a product, in the cart or at checkout ("$3.99", a sale price, a unit price "$0.42/oz") is a Price component, never plain Text or a plain element. A sentence that mentions money is copy and stays Text.',
    question: 'Is this element showing a price or unit price as plain text, where a Price component belongs?',
    candidates: (els) => els.filter((e) => (e.tag === 'Text' || (e.intrinsic && TEXT_TAGS.has(e.tag) && !e.insideComponent))
      && MONEY.test(e.childText) && !e.children.some((c) => MONEY.test(c.childText))),
    context: 'parent',
  },
  {
    id: 'quantity-raw-input',
    criteria: { true: 'The control sets how many of an item go in the cart or order: a number field for a quantity, or a hand-made pair of −/+ (minus / plus) buttons around a count.', false: 'The number is not an item count (a tip, a rating, an apartment number), or the buttons do unrelated actions (Cancel and Save, Add to cart and Save for later), or it is a single "Add" button.' },
    rule: 'An Instacart item quantity is always the QuantityStepper component. It is never an Input or <input> with type="number", and never a hand-made −/+ pair of buttons around a count.',
    question: 'Is this control used to set an item quantity, as a number field or a hand-made minus/plus pair?',
    candidates: (els) => els.filter((e) => ((e.tag === 'Input' || (e.intrinsic && e.tag === 'input')) && String(e.attrs.type).toLowerCase() === 'number')
      || (e.intrinsic && !e.insideComponent && e.children.filter((c) => QUANTITY_BUTTONS.has(c.tag)).length >= 2)),
    context: 'parent',
  },
];

export function apiKey() {
  if (process.env.TYPESAFE_API_KEY?.trim()) return process.env.TYPESAFE_API_KEY.trim();
  const envFile = path.join(os.homedir(), '.config/typesafe.env');
  if (!fs.existsSync(envFile)) return null;
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?TYPESAFE_API_KEY\s*=\s*['"]?([^'"\s]+)/);
    if (m) return m[1];
  }
  return null;
}

/**
 * Comments are the author's notes, not the design (and in fixtures they hold
 * the `expect:` answer), so Jev never reads them.
 */
const noComments = (t) => t.replace(/\{\/\*[\s\S]*?\*\/\}|<!--[\s\S]*?-->/g, '').replace(/\n\s*\n/g, '\n');

/**
 * What Jev sees for one usage: the element to judge, kept SEPARATE from its
 * surroundings (neighbours in a window get judged by mistake otherwise), plus
 * the definition of any handler passed by name.
 */
function usageFor(el, def, design) {
  const cut = (t) => (t.length > SNIPPET ? `${t.slice(0, SNIPPET)}…` : t);
  const own = noComments(el.text);
  const usage = { element: cut(own) };
  if (def.label) usage.label = def.label(el);
  if (def.context === 'parent' && el.parent) {
    // A bounded window of the parent around the element, so a large parent (a
    // whole page) never pushes the element out of what Jev reads.
    const parent = noComments(el.parent.text);
    const at = parent.indexOf(own);
    if (at >= 0) {
      const before = parent.slice(Math.max(0, at - WINDOW), at);
      const after = parent.slice(at + own.length, at + own.length + WINDOW);
      usage.surroundings = `${before}[THE ELEMENT]${after}`;
    }
  }
  // Handlers passed by name, and functions called inside inline handlers
  // (`onCheckedChange={(v) => updateSetting('sms', v)}`).
  // A canvas hole (`on-checked-change="{{saveAlerts}}"`) arrives as `__dc.saveAlerts`.
  const names = Object.values(el.attrs).flatMap((v) =>
    v?.identifier ? [v.identifier] : v?.expr ? [...v.expr.matchAll(/__dc\.([A-Za-z_$][\w$]*)|\b([A-Za-z_$][\w$]*)\s*\(/g)].map((m) => m[1] ?? m[2]) : []);
  const handlers = [...new Set(names)].map((n) => design.declarations.get(n)).filter(Boolean);
  if (handlers.length) usage.handler_definitions = cut(handlers.join('\n'));
  return usage;
}

export function jevQuestions(design) {
  const items = [];
  for (const def of JEV_RULES) {
    for (const el of def.candidates(design.elements)) {
      items.push({ def, el, usage: usageFor(el, def, design), snippet: el.text.split('\n')[0] });
    }
  }
  return items;
}

async function ask(questions, key) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, state: { library: 'Instacart design system (React, unofficial teaching copy)' }, questions }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`TypeSafe HTTP ${res.status}${res.status === 401 || res.status === 403 ? ' (API key missing or rejected)' : ''}`);
  return res.json();
}

/**
 * Judges every candidate. Questions go 20 to a request; each question carries
 * its own rule and snippet, so the shared state stays tiny (accuracy falls as
 * irrelevant state grows).
 */
export async function jevRules(design) {
  const key = apiKey();
  const items = jevQuestions(design);
  const usage = { input_tokens: 0, output_tokens: 0, requests: 0 };
  if (!items.length) return { findings: [], judged: [], usage };
  if (!key) return { findings: [{ rule: 'jev', severity: 'warning', line: 1, column: 1, message: 'Jev skipped: no TypeSafe key in $TYPESAFE_API_KEY or ~/.config/typesafe.env.', evidence: '' }], judged: [], usage };

  const chunks = [];
  for (let i = 0; i < items.length; i += 20) chunks.push(items.slice(i, i + 20));
  const judged = [];
  await Promise.all(chunks.map(async (chunk, ci) => {
    const questions = {};
    chunk.forEach((it, i) => {
      questions[`q${ci}_${i}`] = {
        type: 'noul',
        instructions: { rule: it.def.rule, ...it.usage, question: `${it.def.question} Judge only \`element\`; \`surroundings\` is context, where [THE ELEMENT] marks its place.` },
        criteria: it.def.criteria,
      };
    });
    const data = await ask(questions, key);
    usage.requests += 1;
    usage.input_tokens += data.usage?.input_tokens ?? 0;
    usage.output_tokens += data.usage?.output_tokens ?? 0;
    chunk.forEach((it, i) => judged.push({ ...it, noul: data.answers?.[`q${ci}_${i}`]?.noul ?? null }));
  }));

  const findings = judged
    .filter((j) => j.noul !== null && j.noul >= UNSURE_AT)
    .map((j) => ({
      rule: j.def.id,
      severity: j.noul >= FLAG_AT ? 'warning' : 'info',
      line: j.el.line,
      column: j.el.column,
      message: `${j.def.question.replace(/\?$/, '')} (Jev ${j.noul.toFixed(2)}${j.noul < FLAG_AT ? ', unsure' : ''}). ${j.def.rule}`,
      evidence: j.el.openingText.slice(0, 160),
      noul: j.noul,
    }));
  return { findings, judged, usage };
}

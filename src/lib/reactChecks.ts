/**
 * "Check my component" for React machine-coding challenges.
 *
 * A JS challenge is graded by the ✅/❌ lines its tests print. A React challenge
 * has nothing to print: what is graded is behaviour (click Next and the next
 * slide shows, press Escape and the modal closes). So each React challenge
 * carries a short script of user actions and expectations, and this module
 * drives them against whatever is mounted in the preview, the way a person
 * would: by role, visible text and label, never by class name or component
 * internals, so a reader's own implementation passes if it BEHAVES right.
 *
 * It is plain DOM code with real timers, so the playground and the jsdom test
 * (`reactChallengeChecks.test.tsx`, which runs every script against the
 * reference template) execute exactly the same steps.
 */

import type { Target, CheckStep, ReactCheck, FetchMock } from '../data/playground/reactCheckTypes';
export type { Target, CheckStep, ReactCheck };

export interface CheckResult {
  label: string;
  passed: boolean;
  /** 1-based index of the step that failed, and why. */
  failedStep?: number;
  message?: string;
}

const norm = (s: string | null | undefined): string => (s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
const has = (hay: string | null | undefined, needle: string): boolean => norm(hay).includes(norm(needle));
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const TEXT_INPUTS = new Set(['', 'text', 'email', 'search', 'password', 'tel', 'url', 'number']);

export function roleOf(el: Element): string {
  const explicit = el.getAttribute('role');
  if (explicit) return explicit.split(' ')[0];
  const tag = el.tagName.toLowerCase();
  if (tag === 'button') return 'button';
  if (tag === 'a' && el.hasAttribute('href')) return 'link';
  if (tag === 'textarea') return 'textbox';
  if (tag === 'select') return 'combobox';
  if (tag === 'input') {
    const type = (el.getAttribute('type') ?? '').toLowerCase();
    if (['button', 'submit', 'reset'].includes(type)) return 'button';
    if (type === 'checkbox') return 'checkbox';
    if (type === 'radio') return 'radio';
    if (type === 'range') return 'slider';
    if (TEXT_INPUTS.has(type)) return 'textbox';
    return type;
  }
  const implicit: Record<string, string> = {
    h1: 'heading', h2: 'heading', h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading',
    ul: 'list', ol: 'list', li: 'listitem', dialog: 'dialog', img: 'img', nav: 'navigation',
    table: 'table', tr: 'row', td: 'cell', th: 'columnheader', progress: 'progressbar',
    option: 'option', form: 'form', main: 'main', aside: 'complementary',
  };
  return implicit[tag] ?? '';
}

function labelText(el: Element): string {
  const doc = el.ownerDocument;
  const byIds = el.getAttribute('aria-labelledby');
  if (byIds) return byIds.split(/\s+/).map((id) => doc.getElementById(id)?.textContent ?? '').join(' ');
  const labels = (el as HTMLInputElement).labels;
  if (labels && labels.length) return [...labels].map((l) => l.textContent ?? '').join(' ');
  return '';
}

export function accessibleName(el: Element): string {
  return el.getAttribute('aria-label') || labelText(el) || el.getAttribute('alt')
    || (['input', 'textarea', 'select'].includes(el.tagName.toLowerCase()) ? '' : el.textContent ?? '')
    || el.getAttribute('title') || el.getAttribute('placeholder') || '';
}

export function isHidden(el: Element): boolean {
  for (let n: Element | null = el; n; n = n.parentElement) {
    if (n.hasAttribute('hidden') || n.getAttribute('aria-hidden') === 'true' || n.hasAttribute('inert')) return true;
    // A closed <details> shows only its <summary>.
    const parent = n.parentElement;
    if (parent && parent.tagName === 'DETAILS' && !parent.hasAttribute('open') && n.tagName !== 'SUMMARY') return true;
    const view = n.ownerDocument.defaultView;
    const style = view ? view.getComputedStyle(n) : null;
    if (style && (style.display === 'none' || style.visibility === 'hidden')) return true;
  }
  return false;
}

/**
 * Where the component's UI can be: the preview root, plus anything it portalled
 * into <body> (a modal, a toast). A portal container is a direct child of body
 * that does not contain the preview, which excludes the app shell around it.
 */
export function scopesOf(root: Element): Element[] {
  const body = root.ownerDocument.body;
  const portals = body && body !== root && body.contains(root)
    ? [...body.children].filter((c) => !c.contains(root) && !['SCRIPT', 'STYLE'].includes(c.tagName))
    : [];
  return [root, ...portals];
}

export function findAll(root: Element, t: Target): Element[] {
  const scopes = scopesOf(root);
  const all = scopes.flatMap((s) => [s, ...s.querySelectorAll('*')]);
  const pool = t.selector ? scopes.flatMap((s) => [...s.querySelectorAll(t.selector as string)]) : all;
  const matches = pool.filter((el) =>
    (!t.role || roleOf(el) === t.role)
    && (t.name === undefined || has(accessibleName(el), t.name))
    && (t.text === undefined || has(el.textContent, t.text))
    && (t.label === undefined || has(el.getAttribute('aria-label') || labelText(el), t.label))
    && (t.placeholder === undefined || has(el.getAttribute('placeholder'), t.placeholder))
    && (t.includeHidden || !isHidden(el)));
  // A `text` match also matches every ancestor of the element holding the text;
  // keep the innermost, which is the one a person would point at.
  if (t.text !== undefined && !t.role && !t.selector) {
    return matches.filter((el) => !matches.some((other) => other !== el && el.contains(other)));
  }
  return matches;
}

function describeTarget(t: Target): string {
  const parts = Object.entries(t).filter(([k]) => k !== 'includeHidden').map(([k, v]) => `${k} ${JSON.stringify(v)}`);
  return parts.join(', ');
}

/** Retry `probe` until it returns a non-null value or the timeout passes. */
async function until<T>(probe: () => T | null, timeoutMs: number): Promise<T | null> {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const v = probe();
    if (v !== null) return v;
    if (Date.now() > end) return null;
    await sleep(25);
  }
}

function fire(el: Element, type: string, init: Record<string, unknown> = {}): Event | null {
  const view = el.ownerDocument.defaultView;
  if (!view) return null;
  const Ctor = type.startsWith('key') ? view.KeyboardEvent
    : type.startsWith('pointer') && 'PointerEvent' in view ? view.PointerEvent
      : type.startsWith('mouse') || type === 'click' || type.startsWith('pointer') ? view.MouseEvent
        : view.Event;
  const event = new Ctor(type, { bubbles: true, cancelable: true, ...init });
  el.dispatchEvent(event);
  return event;
}

/** An event carrying a fake DataTransfer / clipboardData, which jsdom lacks. */
function fireWithData(el: Element, type: string, prop: 'dataTransfer' | 'clipboardData', data: Map<string, string>): void {
  const view = el.ownerDocument.defaultView;
  if (!view) return;
  const event = new view.Event(type, { bubbles: true, cancelable: true });
  const transfer = {
    getData: (k: string) => data.get(k) ?? '', setData: (k: string, v: string) => { data.set(k, v); },
    clearData: () => data.clear(), get types() { return [...data.keys()]; },
    dropEffect: 'move', effectAllowed: 'all', files: [], items: [], setDragImage: () => {},
  };
  Object.defineProperty(event, prop, { value: transfer });
  el.dispatchEvent(event);
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Tab's default action, which a synthetic keydown does not perform: move focus in document order. */
function moveFocus(root: Element, from: Element, back: boolean): void {
  const order = scopesOf(root).flatMap((s) => [...s.querySelectorAll(FOCUSABLE)]).filter((e) => !isHidden(e));
  if (!order.length) return;
  const at = order.indexOf(from);
  let next: Element;
  if (at !== -1) next = order[(at + (back ? -1 : 1) + order.length) % order.length];
  else {
    // Focus is on something outside the Tab order (a dialog panel with
    // tabIndex=-1): a browser moves to the next focusable AFTER it in document
    // order, not to the top of the page.
    const FOLLOWING = 4; // Node.DOCUMENT_POSITION_FOLLOWING
    const after = order.filter((e) => (from.compareDocumentPosition(e) & FOLLOWING) !== 0);
    const before = order.filter((e) => !after.includes(e));
    next = back ? (before.at(-1) ?? order[order.length - 1]) : (after[0] ?? order[0]);
  }
  (next as HTMLElement).focus();
}

/** Set an input's value the way typing does, so React's onChange sees it. */
function setValue(el: Element, value: string): void {
  const view = el.ownerDocument.defaultView;
  if (!view) return;
  const proto = el.tagName === 'TEXTAREA' ? view.HTMLTextAreaElement.prototype
    : el.tagName === 'SELECT' ? view.HTMLSelectElement.prototype : view.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  fire(el, 'input');
  fire(el, 'change');
}

type Act = (root: Element) => Promise<string | null>;
const TIMEOUT = 1500;
const SETTLE = 40;

function locate(root: Element, t: Target): Element | null {
  return findAll(root, t)[t.nth ?? 0] ?? null;
}

function action(t: Target, run: (el: Element) => void): Act {
  return async (root) => {
    const el = await until(() => locate(root, t), TIMEOUT);
    if (!el) return `could not find ${describeTarget(t)}`;
    run(el);
    await sleep(SETTLE);
    return null;
  };
}

function click(el: Element): void {
  fire(el, 'pointerdown'); fire(el, 'mousedown');
  (el as HTMLElement).focus?.();
  fire(el, 'pointerup'); fire(el, 'mouseup');
  (el as HTMLElement).click();
}

function expectation(step: Extract<CheckStep, { expect: Target }>): Act {
  return async (root) => {
    let last = '';
    const ok = await until(() => {
      const t = { ...step.expect, includeHidden: step.expect.includeHidden ?? step.visible === false };
      const found = findAll(root, t);
      if (step.count !== undefined) {
        last = `expected ${step.count} × ${describeTarget(step.expect)}, found ${found.length}`;
        return found.length === step.count ? true : null;
      }
      const el = found[step.expect.nth ?? 0];
      if (!el) { last = `could not find ${describeTarget(step.expect)}`; return null; }
      const checks: [boolean, string][] = [];
      if (step.attr !== undefined) checks.push([el.getAttribute(step.attr) === (step.equals ?? null), `${step.attr}="${el.getAttribute(step.attr)}", expected ${JSON.stringify(step.equals ?? null)}`]);
      if (step.value !== undefined) checks.push([(el as HTMLInputElement).value === step.value, `value "${(el as HTMLInputElement).value}", expected "${step.value}"`]);
      if (step.focused !== undefined) checks.push([(el.ownerDocument.activeElement === el) === step.focused, step.focused ? 'is not focused' : 'is still focused']);
      if (step.checked !== undefined) checks.push([(el as HTMLInputElement).checked === step.checked || el.getAttribute('aria-checked') === String(step.checked), `checked is not ${String(step.checked)}`]);
      if (step.disabled !== undefined) checks.push([((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') === step.disabled, step.disabled ? 'is not disabled' : 'is disabled']);
      if (step.visible !== undefined) checks.push([isHidden(el) === !step.visible, step.visible ? 'is hidden' : 'is visible']);
      const bad = checks.find(([pass]) => !pass);
      if (bad) { last = `${describeTarget(step.expect)}: ${bad[1]}`; return null; }
      return true;
    }, TIMEOUT);
    return ok ? null : last;
  };
}

function toAct(step: CheckStep): Act {
  if ('click' in step) return action(step.click, click);
  if ('fill' in step) return action(step.fill, (el) => { (el as HTMLElement).focus?.(); setValue(el, step.text); });
  if ('hover' in step) return action(step.hover, (el) => { fire(el, 'pointerover'); fire(el, 'mouseover'); fire(el, 'mouseenter', { bubbles: false }); });
  if ('unhover' in step) return action(step.unhover, (el) => { fire(el, 'pointerout'); fire(el, 'mouseout'); fire(el, 'mouseleave', { bubbles: false }); });
  if ('focus' in step) return action(step.focus, (el) => { (el as HTMLElement).focus?.(); });
  if ('wait' in step) return async () => { await sleep(step.wait); return null; };
  if ('scrollTo' in step) return action(step.scrollTo, (el) => { el.scrollIntoView?.({ block: 'center' }); });
  if ('blur' in step) return action(step.blur, (el) => { (el as HTMLElement).blur?.(); fire(el, 'focusout'); });
  if ('drag' in step) return async (root) => {
    const from = await until(() => locate(root, step.drag), TIMEOUT);
    const to = await until(() => locate(root, step.to), TIMEOUT);
    if (!from) return `could not find ${describeTarget(step.drag)}`;
    if (!to) return `could not find ${describeTarget(step.to)}`;
    const data = new Map<string, string>();
    // Separate tasks, as in a browser: a component that stores the dragged item
    // in state on dragstart only sees it at drop after React has re-rendered.
    fireWithData(from, 'dragstart', 'dataTransfer', data);
    await sleep(SETTLE);
    for (const type of ['dragenter', 'dragover', 'drop']) { fireWithData(to, type, 'dataTransfer', data); await sleep(SETTLE); }
    fireWithData(from, 'dragend', 'dataTransfer', data);
    await sleep(SETTLE);
    return null;
  };
  if ('paste' in step) return async (root) => {
    const el = step.into ? await until(() => locate(root, step.into as Target), TIMEOUT) : root.ownerDocument.activeElement;
    if (!el) return step.into ? `could not find ${describeTarget(step.into)}` : 'nothing is focused to paste into';
    (el as HTMLElement).focus?.();
    fireWithData(el, 'paste', 'clipboardData', new Map([['text', step.paste], ['text/plain', step.paste]]));
    await sleep(SETTLE);
    return null;
  };
  if ('typeKeys' in step) return async (root) => {
    for (const ch of step.typeKeys) {
      const el = root.ownerDocument.activeElement;
      if (!el || el === root.ownerDocument.body) return 'nothing is focused to type into';
      fire(el, 'keydown', { key: ch });
      setValue(el, ((el as HTMLInputElement).value ?? '') + ch);
      fire(el, 'keyup', { key: ch });
      await sleep(SETTLE);
    }
    return null;
  };
  if ('press' in step) return async (root) => {
    const el = step.on ? await until(() => locate(root, step.on as Target), TIMEOUT) : root.ownerDocument.activeElement ?? root;
    if (!el) return `could not find ${describeTarget(step.on as Target)}`;
    const [key, shift] = step.press === 'Shift+Tab' ? ['Tab', true] : [step.press, false];
    const down = fire(el, 'keydown', { key, shiftKey: shift });
    if (key === 'Tab' && down && !down.defaultPrevented) moveFocus(root, el, shift);
    fire(el, 'keyup', { key, shiftKey: shift });
    await sleep(SETTLE);
    return null;
  };
  if ('expectText' in step) return async (root) =>
    (await until(() => (has(visibleText(root), step.expectText) ? true : null), TIMEOUT)) ? null : `did not see "${step.expectText}"`;
  if ('expectNoText' in step) return async (root) =>
    (await until(() => (has(visibleText(root), step.expectNoText) ? null : true), TIMEOUT)) ? null : `still sees "${step.expectNoText}"`;
  return expectation(step);
}

const BLOCKS = new Set(['ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BR', 'BUTTON', 'DD', 'DETAILS', 'DIALOG', 'DIV', 'DL', 'DT',
  'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'INPUT', 'LABEL', 'LI',
  'MAIN', 'NAV', 'OL', 'OPTION', 'P', 'PRE', 'SECTION', 'SELECT', 'SUMMARY', 'TABLE', 'TD', 'TEXTAREA', 'TH', 'TR', 'UL']);

/**
 * The text a person can see: text content minus hidden subtrees. Text nodes
 * inside one inline run join with NO separator, because React splits
 * `+{n} waiting` into three nodes that a browser renders as "+2 waiting".
 * Block-level elements (and form controls) separate with a space.
 */
export function visibleText(root: Element): string {
  const out: string[] = [];
  const walk = (n: Node) => {
    if (n.nodeType === 3) { out.push(n.textContent ?? ''); return; }
    if (n.nodeType !== 1) return;
    const el = n as Element;
    if (el !== root && isHidden(el)) return;
    const block = BLOCKS.has(el.tagName);
    if (block) out.push(' ');
    if (['INPUT', 'TEXTAREA'].includes(el.tagName)) out.push((el as HTMLInputElement).value);
    el.childNodes.forEach(walk);
    if (block) out.push(' ');
  };
  scopesOf(root).forEach(walk);
  return out.join('');
}

/**
 * Run every check against the mounted component. `reset` remounts it fresh
 * before each check, so one check's clicks never leak into the next.
 */
export async function runReactChecks(
  root: Element, checks: ReactCheck[], reset: () => Promise<void>,
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const view = root.ownerDocument.defaultView;
  for (const check of checks) {
    // Read and restore through Reflect: the original, not a bound copy, goes back.
    const realFetch: unknown = view ? Reflect.get(view, 'fetch') : undefined;
    if (check.fetch && view) view.fetch = mockFetch(check.fetch, view);
    try {
      results.push(await runOne(root, check, reset));
    } finally {
      if (check.fetch && view) Reflect.set(view, 'fetch', realFetch);
    }
  }
  return results;
}

/** A fetch that answers from canned responses, honouring AbortSignal like the real one. */
function mockFetch(spec: FetchMock | FetchMock[], view: Window & typeof globalThis): typeof fetch {
  const queue = Array.isArray(spec) ? spec : [spec];
  let call = 0;
  return ((_input: unknown, init?: { signal?: AbortSignal }) => {
    const r = queue[Math.min(call++, queue.length - 1)];
    const status = r.status ?? 200;
    const text = typeof r.body === 'string' ? r.body : JSON.stringify(r.body ?? null);
    const response = new view.Response(text, { status, headers: { 'content-type': 'application/json' } });
    return new Promise<Response>((resolve, reject) => {
      const abort = () => reject(new view.DOMException('The operation was aborted.', 'AbortError'));
      if (init?.signal?.aborted) { abort(); return; }
      const t = view.setTimeout(() => resolve(response), r.delayMs ?? 0);
      init?.signal?.addEventListener('abort', () => { view.clearTimeout(t); abort(); });
    });
  }) as typeof fetch;
}

async function runOne(root: Element, check: ReactCheck, reset: () => Promise<void>): Promise<CheckResult> {
  await reset();
  for (const [i, step] of check.steps.entries()) {
    let message: string | null;
    try { message = await toAct(step)(root); } catch (e) { message = `threw ${e instanceof Error ? e.message : String(e)}`; }
    if (message) return { label: check.label, passed: false, failedStep: i + 1, message };
  }
  return { label: check.label, passed: true };
}

export function describeCheckResults(results: CheckResult[]): string[] {
  const passed = results.filter((r) => r.passed).length;
  return [
    `🧪 Behaviour checks: ${passed}/${results.length} passed`,
    ...results.filter((r) => !r.passed).map((r) => `   ✗ ${r.label} (step ${r.failedStep}): ${r.message}`),
  ];
}

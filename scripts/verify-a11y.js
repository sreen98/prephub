/**
 * Accessibility gate: axe-core on every page template, light and dark.
 *
 * Contrast cannot be checked in jsdom (no layout, no computed colours over
 * backgrounds), so this drives a real headless Chrome or Edge over the DevTools
 * Protocol and runs axe in the page. It starts its own Vite dev server, so it
 * needs no build. No Puppeteer: Node's global WebSocket speaks CDP directly,
 * which keeps the only new dependency axe-core itself.
 *
 * The v1.7.33 redesign found eleven sub-AA status colours and an unnamed
 * back-to-top button this way, all of which had shipped. A one-off scan proves
 * nothing a week later; this keeps it proved.
 *
 * Browser: $CHROME_PATH, else the usual Chrome/Edge/Chromium install paths.
 * Usage:   node scripts/verify-a11y.js [--probe]
 *   --probe plants a 3.1:1 text colour on each page and fails unless axe
 *           reports it, so the gate is shown able to fail (CLAUDE.md rule 8).
 */
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf-8');
const PROBE = process.argv.includes('--probe');

/** One route per page template (a guide stands for every guide, and so on). */
const PAGES = [
  '/',
  '/frontend/react',
  '/cheatsheets',
  '/cheatsheets/react-hooks',
  '/quiz',
  '/review',
  '/interview',
  '/last-minute',
  '/bookmarks',
  '/checkpoints',
  '/changelog',
  '/privacy',
  '/terms',
  '/admin',
];

/**
 * The rules that have caught real defects here, plus the structural ones that
 * go with them. Not the full ruleset: landmark and region rules would flag the
 * app shell's layout choices, which is a separate decision from AA text.
 */
const RULES = [
  'color-contrast', 'label', 'select-name', 'button-name', 'link-name', 'input-button-name',
  'image-alt', 'svg-img-alt', 'list', 'listitem', 'aria-valid-attr', 'aria-valid-attr-value',
  'aria-required-attr', 'aria-allowed-attr', 'aria-dialog-name', 'document-title',
  'html-has-lang', 'nested-interactive',
];

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const local = process.env.LOCALAPPDATA ?? '';
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    join(local, 'Google/Chrome/Application/chrome.exe'),
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  for (const name of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
    try {
      return execFileSync('which', [name], { encoding: 'utf-8' }).trim();
    } catch { /* not on PATH */ }
  }
  return null;
}

/** Launches the browser and resolves with its DevTools HTTP port. */
function launch(path, profile) {
  const args = [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--window-size=1280,900',
    // GitHub's Ubuntu runners block the user-namespace sandbox.
    ...(process.env.CI ? ['--no-sandbox'] : []),
    'about:blank',
  ];
  const proc = spawn(path, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  return new Promise((resolve, reject) => {
    let err = '';
    const timer = setTimeout(() => reject(new Error(`browser did not start:\n${err}`)), 30_000);
    proc.stderr.on('data', (d) => {
      err += d;
      const m = /DevTools listening on ws:\/\/[^:]+:(\d+)\//.exec(err);
      if (m) { clearTimeout(timer); resolve({ proc, port: Number(m[1]) }); }
    });
    proc.on('exit', (code) => { clearTimeout(timer); reject(new Error(`browser exited (${code}):\n${err}`)); });
  });
}

/** A minimal CDP session on one page target. */
async function connect(port) {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
  const { webSocketDebuggerUrl } = await res.json();
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (e) => {
    const msg = JSON.parse(String(e.data));
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method) {
      for (const l of listeners) l(msg);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  const once = (method) => new Promise((resolve) => {
    const l = (msg) => { if (msg.method === method) { listeners.delete(l); resolve(msg.params); } };
    listeners.add(l);
  });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  return { send, once, evaluate, close: () => ws.close() };
}

/**
 * Waits until the route has rendered real content (no spinner, no skeleton) and has
 * stopped moving. framer-motion keeps its opacity fades under reduced motion, and a card
 * scanned mid-fade blends its text into the paper (the quiz card read 1.4:1). Inline
 * opacities must hold still for three ticks, since not every fade is a WAAPI animation.
 */
const SETTLED = `new Promise((resolve) => {
  const start = Date.now();
  let last = '', still = 0;
  const tick = () => {
    const main = document.querySelector('main') ?? document.body;
    const busy = document.querySelector('.animate-spin, .animate-pulse')
      || document.getAnimations().some((a) => a.playState === 'running');
    const fades = [...document.querySelectorAll('[style*="opacity"]')].map((e) => e.style.opacity).join();
    still = fades === last ? still + 1 : 0;
    last = fades;
    const ready = !busy && still >= 3 && main.innerText.trim().length > 40;
    if (ready || Date.now() - start > 20000) resolve(ready);
    else setTimeout(tick, 100);
  };
  tick();
})`;

/** Plants a 3.1:1 grey on the first paragraph-sized text, inline so Tailwind can't drop it. */
const PLANT_PROBE = `(() => {
  const el = [...document.querySelectorAll('main p, main li, main h1, p')]
    .find((e) => e.offsetParent && e.textContent.trim().length > 3);
  if (!el) return false;
  document.documentElement.classList.remove('dark');
  el.style.setProperty('color', '#949494', 'important');
  el.style.setProperty('background', '#ffffff', 'important');
  el.setAttribute('data-a11y-probe', '');
  return true;
})()`;

async function scan(page, theme) {
  // No transitions at all. Reduced motion shortens them to 0.01ms, but a headless tab
  // can still hold the old colour for a frame, and axe then measures the previous
  // theme's ink on the new theme's paper (1.19:1 everywhere).
  await page.evaluate(`document.getElementById('a11y-no-transitions') || document.head.insertAdjacentHTML('beforeend',
    '<style id="a11y-no-transitions">*, *::before, *::after { transition: none !important; animation: none !important; }</style>')`);
  await page.evaluate(`document.documentElement.classList.toggle('dark', ${theme === 'dark'})`);
  // A frame for the class change to restyle.
  await page.evaluate('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))');
  return page.evaluate(`axe.run(document, { runOnly: ${JSON.stringify(RULES)}, resultTypes: ['violations'] })
    .then((r) => r.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => ({
      target: n.target.join(' '), probe: n.html.includes('data-a11y-probe'),
      why: (n.any[0] ?? n.all[0] ?? n.none[0])?.message ?? '' })) })))`);
}

async function main() {
  const browserPath = findBrowser();
  if (!browserPath) {
    console.error('verify:a11y needs Chrome, Edge or Chromium. Install one or set CHROME_PATH.');
    process.exit(1);
  }

  const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false } });
  await server.listen();
  const address = server.httpServer.address();
  const base = `http://localhost:${typeof address === 'object' && address ? address.port : 5173}`;

  const profile = mkdtempSync(join(tmpdir(), 'prephub-a11y-'));
  let browser;
  const failures = [];
  const probeMisses = [];
  try {
    browser = await launch(browserPath, profile);
    const page = await connect(browser.port);
    await page.send('Page.enable');
    await page.send('Runtime.enable');
    // Reduced motion: framer-motion skips its transforms and index.css ends every
    // transition at once, so axe never measures a colour frozen mid-transition.
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

    console.log(`\nAccessibility (axe-core, ${RULES.length} rules) — ${browserPath.split(/[\\/]/).pop()}\n`);
    for (const route of PAGES) {
      const loaded = page.once('Page.loadEventFired');
      await page.send('Page.navigate', { url: base + route });
      await loaded;
      const settled = await page.evaluate(SETTLED);
      await page.evaluate(AXE_SOURCE);

      const states = [['', null]];
      // The quiz's answer face is a different card with its own colours.
      if (route === '/quiz') states.push([' (answer)', `document.querySelector('[style*="perspective"]')?.click()`]);

      for (const [suffix, action] of states) {
        if (action) {
          await page.evaluate(action);
          await page.evaluate(SETTLED);
        }
        if (PROBE) {
          const planted = await page.evaluate(PLANT_PROBE);
          const v = await scan(page, 'light');
          const caught = v.some((x) => x.id === 'color-contrast' && x.nodes.some((n) => n.probe));
          if (!planted || !caught) probeMisses.push(route + suffix);
          console.log(`  ${caught ? '✓' : '✗'} ${route}${suffix}  probe ${caught ? 'caught' : 'MISSED'}`);
          continue;
        }
        const counts = [];
        for (const theme of ['light', 'dark']) {
          const v = await scan(page, theme);
          const n = v.reduce((s, x) => s + x.nodes.length, 0);
          counts.push(`${theme} ${n}`);
          for (const x of v) for (const node of x.nodes) {
            failures.push(`${route}${suffix} [${theme}] ${x.id}: ${node.target}${node.why ? ` — ${node.why}` : ''}`);
          }
        }
        const ok = counts.every((c) => c.endsWith(' 0'));
        console.log(`  ${ok ? '✓' : '✗'} ${(route + suffix).padEnd(28)} ${counts.join(', ')}${settled ? '' : '  (still loading after 20 s)'}`);
      }
    }
    page.close();
  } finally {
    browser?.proc.kill();
    await server.close();
    // The browser may hold the profile for a moment after kill.
    for (let i = 0; i < 10; i++) {
      try { rmSync(profile, { recursive: true, force: true }); break; } catch { await new Promise((r) => setTimeout(r, 300)); }
    }
  }

  if (PROBE) {
    if (probeMisses.length) {
      console.error(`\nThe probe was not caught on: ${probeMisses.join(', ')}. The gate cannot fail there.`);
      process.exit(1);
    }
    console.log('\nEvery page caught the planted 3.1:1 colour ✓');
    return;
  }
  if (failures.length) {
    console.error(`\n${failures.length} accessibility violation(s):\n  ${failures.slice(0, 40).join('\n  ')}`);
    console.error('\nStatus text is 700 in light and 400 in dark (CLAUDE.md, Styling). Icon-only buttons need an aria-label.');
    process.exit(1);
  }
  console.log('\nNo accessibility violations in either theme ✓');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

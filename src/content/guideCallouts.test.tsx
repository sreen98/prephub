import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseCalloutMarker, isCalloutKind } from '../lib/callouts';
import { calloutComponents } from '../components/calloutComponents';

/**
 * Guide callouts (`> [!FOLLOWUP]`, `> [!TRAP]` …): the marker parser, the renderer
 * through the real ReactMarkdown, and every callout in every guide. A typo in a kind
 * would silently render as a plain quote, and a follow-up with no blank `>` line
 * between question and answer would show the answer straight away, so both fail here.
 */
const render = (md: string) =>
  renderToStaticMarkup(<ReactMarkdown remarkPlugins={[remarkGfm]} components={calloutComponents}>{md}</ReactMarkdown>);

describe('parseCalloutMarker', () => {
  it('splits a known marker off the text', () => {
    expect(parseCalloutMarker('[!TRAP] Watch out')).toEqual({ kind: 'TRAP', rest: 'Watch out' });
    expect(parseCalloutMarker('[!FOLLOWUP]\nWhat if?')).toEqual({ kind: 'FOLLOWUP', rest: 'What if?' });
  });

  it('ignores unknown kinds, lowercase markers and markers mid-text', () => {
    expect(parseCalloutMarker('[!FOLLOWUPS] x')).toBeNull();
    expect(parseCalloutMarker('[!trap] x')).toBeNull();
    expect(parseCalloutMarker('see [!TRAP] x')).toBeNull();
  });
});

describe('callout rendering', () => {
  it('shows a follow-up question and folds its answer', () => {
    const html = render('> [!FOLLOWUP]\n> What if the **cache** is stale?\n>\n> Revalidate `it`.\n>\n> Then retry.');
    expect(html).toContain('aria-label="Interviewer follow-up"');
    expect(html).not.toContain('[!FOLLOWUP]');
    const [beforeDetails, details] = html.split('<details');
    expect(beforeDetails).toContain('What if the <strong>cache</strong> is stale?');
    expect(details).toContain('Revalidate <code');
    expect(details).toContain('Then retry.');
    expect(details).toContain('Think of your answer, then reveal');
  });

  it('renders a follow-up with no answer as just the question', () => {
    const html = render('> [!FOLLOWUP] Why not a mutex?');
    expect(html).toContain('Why not a mutex?');
    expect(html).not.toContain('<details');
  });

  it('renders a trap and a key line with their labels and no marker', () => {
    expect(render('> [!TRAP]\n> Putting the token in localStorage.')).toMatch(/callout-trap[\s\S]*Common trap[\s\S]*Putting the token/);
    expect(render('> [!KEY] Cache by how often it changes.')).toMatch(/callout-key[\s\S]*Say this in the interview[\s\S]*<p>Cache by how often/);
  });

  it('leaves plain quotes and unknown markers as plain blockquotes', () => {
    expect(render('> Just a quote')).toBe('<blockquote>\n<p>Just a quote</p>\n</blockquote>');
    expect(render('> [!NOPE] x')).toContain('<blockquote>');
  });
});

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? markdownFiles(join(dir, e.name)) : e.name.endsWith('.md') ? [join(dir, e.name)] : []);
}

/** Every blockquote that opens with a `[!…]` marker, as its lines with the `>` stripped. */
const callouts = markdownFiles('src/content').flatMap((file) => {
  const lines = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n');
  const found: { id: string; kind: string; body: string[] }[] = [];
  lines.forEach((line, i) => {
    const m = /^\s*> \[!([A-Za-z]+)\]/.exec(line);
    if (!m || /^\s*>/.test(lines[i - 1] ?? '')) return;
    const body: string[] = [];
    for (let j = i; j < lines.length && /^\s*>/.test(lines[j]); j++) body.push(lines[j].replace(/^\s*> ?/, ''));
    found.push({ id: `${file.replace(/\\/g, '/')}:${i + 1}`, kind: m[1], body });
  });
  return found;
});

describe('callouts in the guides', () => {
  it('exist', () => {
    expect(callouts.length).toBeGreaterThan(0);
  });

  it.each(callouts.map((c) => [c.id, c]))('%s uses a known kind', (_id, c) => {
    expect(isCalloutKind(c.kind), `unknown callout kind [!${c.kind}]`).toBe(true);
  });

  const followUps = callouts.filter((c) => c.kind === 'FOLLOWUP');
  it.each(followUps.map((c) => [c.id, c]))('%s has a question, then a blank line, then an answer', (_id, c) => {
    const paragraphs = c.body.join('\n').replace(/^\[!FOLLOWUP\][ \t]*/, '').split(/\n\s*\n/).filter((p) => p.trim());
    expect(paragraphs.length).toBeGreaterThanOrEqual(2);
  });
});

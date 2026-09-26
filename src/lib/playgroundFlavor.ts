import { allTemplates, blankStarters } from '../data/playground/templateIndex';
import type { TemplateLang, BlankStarter } from '../data/playground/playgroundTemplates';
import { detectJSX } from './playgroundRunner';
import { getJSON, safeGet } from './storage';
import { stripChallengeHeader } from './challengeHeader';

/**
 * The playground is two playgrounds that share one editor: JavaScript at
 * `/playground` and React at `/playground/react`. Each shows only its own
 * templates, challenges and blank starters, and remembers its own last session,
 * so switching between them never lands you in the other one's work.
 *
 * Only the CATALOGUE is split. The runner is unchanged: the JavaScript
 * playground still runs JSX if you paste some in, because refusing to would be
 * a worse surprise than running it.
 */
export type PlaygroundFlavor = 'js' | 'react';

export interface FlavorConfig {
  flavor: PlaygroundFlavor;
  /** Route, without the `/prephub` basename. */
  path: string;
  /** The template-category tag this flavor shows. */
  tag: 'JS' | 'React';
  title: string;
  /**
   * Where "the template I had open last" is remembered. The JS key is the
   * original one, so existing users keep their resume point.
   */
  lastSessionKey: 'playground-last-session' | 'playground-last-session-react';
  starters: BlankStarter[];
}

const REACT_LANGS: TemplateLang[] = ['jsx', 'tsx'];

export const FLAVORS: Record<PlaygroundFlavor, FlavorConfig> = {
  js: {
    flavor: 'js', path: '/playground', tag: 'JS', title: 'JavaScript Playground',
    lastSessionKey: 'playground-last-session',
    starters: blankStarters.filter((s) => !REACT_LANGS.includes(s.lang)),
  },
  react: {
    flavor: 'react', path: '/playground/react', tag: 'React', title: 'React Playground',
    lastSessionKey: 'playground-last-session-react',
    starters: blankStarters.filter((s) => REACT_LANGS.includes(s.lang)),
  },
};

export function flavorOfTag(tag: string): PlaygroundFlavor {
  return tag === 'React' ? 'react' : 'js';
}

/** Which playground a "Try it" snippet belongs in. */
export function flavorForCode(code: string): PlaygroundFlavor {
  return detectJSX(code) ? 'react' : 'js';
}

/** The template this flavor remembers as last open, or null. */
export function lastSessionFor(flavor: PlaygroundFlavor): string | null {
  const own = safeGet(FLAVORS[flavor].lastSessionKey);
  if (own) return own;
  // Before the split there was ONE key, shared by both. A React template
  // remembered there is a React user's resume point, so the React playground
  // inherits it rather than starting them from scratch.
  if (flavor === 'react') {
    const legacy = safeGet(FLAVORS.js.lastSessionKey);
    if (legacy && allTemplates.some((t) => t.name === legacy && t.tag === 'React')) return legacy;
  }
  return null;
}

export interface InitialPlaygroundState {
  code: string;
  selectedName: string | null;
  lang: TemplateLang;
  /** The template whose body still has to be fetched, if any. */
  needsCode: string | null;
}

/**
 * What the editor shows on first render, from three sources in priority order:
 *   1. sessionStorage "playground-code": the one-shot handoff from a guide's Try it.
 *   2. This flavor's last session, with the user's saved draft if there is one.
 *   3. The flavor's first template.
 * A saved draft resolves synchronously from localStorage, so a returning user
 * sees their own work with no fetch; otherwise `needsCode` names the body to load.
 */
export function resolveInitialPlaygroundState(flavor: PlaygroundFlavor): InitialPlaygroundState {
  const handoff = safeGet('playground-code', 'session');
  if (handoff) return { code: handoff, selectedName: null, lang: flavor === 'react' ? 'jsx' : 'js', needsCode: null };

  const own = allTemplates.filter((t) => flavorOfTag(t.tag) === flavor);
  const lastName = lastSessionFor(flavor);
  // A remembered name from the other flavor (or a renamed template) is ignored.
  const tpl = lastName ? own.find((t) => t.name === lastName) : undefined;
  const target = tpl ?? own[0];
  const lang = target.lang ?? (target.jsx ? 'jsx' : 'js');
  if (tpl) {
    const saved = getJSON<Record<string, { code?: string } | undefined>>('playground-progress', {})[tpl.name]?.code;
    if (typeof saved === 'string' && saved) return { code: stripChallengeHeader(saved), selectedName: tpl.name, lang, needsCode: null };
  }
  return { code: '', selectedName: target.name, lang, needsCode: target.name };
}

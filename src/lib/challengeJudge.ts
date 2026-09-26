import {
  buildHiddenHarness, describeHiddenResults, harnessBudgetMs, HIDDEN_MARKER, loadHiddenTests,
  readHiddenResults, type HiddenTest,
} from './hiddenTests';
import { describeTypeDiagnostics } from './typeCheck';

/**
 * Grading for one Run of a challenge, in two halves around execution:
 *   prepare → what to append to the code (the hidden-test harness) and how
 *             long the worker must stay alive for it;
 *   finish  → strip the harness's result line, describe hidden results, add
 *             the TypeScript check for TS challenges, and total everything.
 * Kept out of CodePlayground so the rule "solved means every visible test,
 * every hidden test and the type check passed" is testable in one place.
 */
export interface JudgedTemplate {
  name: string;
  kind: 'template' | 'challenge';
  tag: string;
  lang?: string;
}

export interface RunSummary {
  pass: number;
  fail: number;
  /** Present when the challenge has hidden tests. */
  hiddenPass?: number;
  hiddenTotal?: number;
}

export interface PreparedJudge {
  hidden: HiddenTest[] | null;
  /** Code to append after the (transpiled) reader's code. */
  appendix: string;
  waitFor?: { marker: string; maxMs: number };
  typeCheck: boolean;
}

interface LogLine { type: 'log' | 'warn' | 'error' | 'result'; text: string }

export function isTypeScriptChallenge(t: JudgedTemplate | null): boolean {
  return !!t && t.kind === 'challenge' && (t.lang === 'ts' || t.lang === 'tsx');
}

export async function prepareJudge(t: JudgedTemplate | null): Promise<PreparedJudge> {
  const none: PreparedJudge = { hidden: null, appendix: '', typeCheck: false };
  if (!t || t.kind !== 'challenge' || t.tag !== 'JS') return none;
  const hidden = await loadHiddenTests(t.name).catch(() => null);
  const typeCheck = isTypeScriptChallenge(t);
  if (!hidden?.length) return { ...none, typeCheck };
  return {
    hidden, typeCheck,
    appendix: buildHiddenHarness(hidden),
    waitFor: { marker: HIDDEN_MARKER, maxMs: harnessBudgetMs(hidden) },
  };
}

/**
 * `typeErrors` is the result of checking the reader's source with the real
 * compiler, or null when this is not a TypeScript challenge (or the checker
 * could not load, which is reported rather than counted as a pass).
 */
export function finishJudge<T extends LogLine>(
  prepared: PreparedJudge, logs: T[],
  typeCheck: { diagnostics: import('./typeCheck').TypeDiagnostic[] } | { error: string } | null,
): { logs: LogLine[]; summary: RunSummary | null; solved: boolean } {
  let out: LogLine[] = logs;
  let hiddenPass: number | undefined;
  let hiddenOk = true;
  if (prepared.hidden) {
    const read = readHiddenResults(logs, prepared.hidden);
    out = [...read.logs, ...describeHiddenResults(read.results, prepared.hidden.length)
      .map((text) => ({ type: 'log' as const, text }))];
    hiddenPass = read.results ? read.results.filter((r) => r.passed).length : 0;
    hiddenOk = hiddenPass === prepared.hidden.length;
  }
  if (typeCheck) {
    const lines = 'error' in typeCheck
      ? [{ type: 'warn' as const, text: `Type check could not run: ${typeCheck.error}` }]
      : describeTypeDiagnostics(typeCheck.diagnostics).map((text) => ({ type: text.startsWith('❌') ? 'error' as const : 'log' as const, text }));
    out = [...out, ...lines];
  }
  const pass = out.filter((e) => e.text.includes('✅')).length;
  const fail = out.filter((e) => e.text.includes('❌')).length;
  if (pass + fail === 0 && !prepared.hidden) return { logs: out, summary: null, solved: false };
  const summary: RunSummary = { pass, fail, ...(prepared.hidden ? { hiddenPass, hiddenTotal: prepared.hidden.length } : {}) };
  const typeOk = !typeCheck || ('diagnostics' in typeCheck && typeCheck.diagnostics.length === 0);
  return { logs: out, summary, solved: fail === 0 && pass > 0 && hiddenOk && typeOk };
}

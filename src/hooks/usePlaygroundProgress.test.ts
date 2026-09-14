import { describe, it, expect } from 'vitest';
import { applySolved, resolveOpenCode, hashCode, type Progress, type ProgressEntry } from './usePlaygroundProgress';

const withEntry = (over: Partial<Progress[string]> = {}): Progress => ({
  Tabs: { code: 'const mine = 1;', notes: 'my scratch notes', status: 'in-progress', updatedAt: 't0', ...over },
});

describe('applySolved — explicit challenge completion', () => {
  it('marks a challenge complete and records when', () => {
    const next = applySolved({}, 'Tic-Tac-Toe', true, 't1');
    expect(next['Tic-Tac-Toe'].status).toBe('solved');
    expect(next['Tic-Tac-Toe'].solvedAt).toBe('t1');
  });

  it("un-marking keeps the user's code and notes", () => {
    // The whole reason this is not `clearEntry`: undoing a mis-click must not
    // delete the work. clearEntry drops the entry, code and all.
    const solved = applySolved(withEntry(), 'Tabs', true, 't1');
    const undone = applySolved(solved, 'Tabs', false, 't2');
    expect(undone.Tabs.status).toBe('in-progress');
    expect(undone.Tabs.code).toBe('const mine = 1;');
    expect(undone.Tabs.notes).toBe('my scratch notes');
    expect(undone.Tabs.solvedAt).toBeUndefined();
  });

  it('keeps solvedAt while it stays solved, but a re-completion is a new one', () => {
    // Marking an already-solved entry must not bump the timestamp — otherwise
    // re-running a passing challenge silently rewrites when you solved it.
    const a = applySolved({}, 'Accordion', true, 't1');
    expect(applySolved(a, 'Accordion', true, 't2').Accordion.solvedAt).toBe('t1');

    // But un-marking means "not done", so completing it again is a NEW event.
    const undone = applySolved(a, 'Accordion', false, 't2');
    expect(applySolved(undone, 'Accordion', true, 't3').Accordion.solvedAt).toBe('t3');
  });

  it('un-marking something never started is a no-op', () => {
    const before: Progress = {};
    expect(applySolved(before, 'Never Opened', false)).toBe(before);
  });

  it('never mutates the map it was given', () => {
    const before = withEntry();
    applySolved(before, 'Tabs', true, 't1');
    expect(before.Tabs.status).toBe('in-progress');
  });

  it('ignores an empty name', () => {
    const before: Progress = {};
    expect(applySolved(before, '', true)).toBe(before);
  });
});

const OLD_TEMPLATE = 'function Protected() { onRedirect(); return null; }';
const NEW_TEMPLATE = 'function Protected() { return <Redirect />; }';

const draft = (code: string, baseHash?: string): ProgressEntry => ({
  code, status: 'in-progress', updatedAt: 't0', ...(baseHash === undefined ? {} : { baseHash }),
});

describe('resolveOpenCode — which code the editor opens with', () => {
  it('uses the template when there is no draft', () => {
    expect(resolveOpenCode(null, NEW_TEMPLATE)).toEqual({
      code: NEW_TEMPLATE, restored: false, templateUpdated: false,
    });
  });

  it('an UNTOUCHED draft does not outrank a corrected template', () => {
    // The reported bug: opening a challenge autosaves a copy 800ms later, so a
    // reader who merely looked at it kept seeing the old, broken version long
    // after the template was fixed.
    const untouched = draft(OLD_TEMPLATE, hashCode(OLD_TEMPLATE));
    const out = resolveOpenCode(untouched, NEW_TEMPLATE);
    expect(out.code).toBe(NEW_TEMPLATE);
    expect(out.restored).toBe(false);
  });

  it("keeps the reader's own work when they HAVE edited it", () => {
    const mine = draft(OLD_TEMPLATE + '\n// my attempt', hashCode(OLD_TEMPLATE));
    const out = resolveOpenCode(mine, NEW_TEMPLATE);
    expect(out.code).toContain('my attempt');
    expect(out.restored).toBe(true);
    // ...and says so, because Reset is the only way to the new version.
    expect(out.templateUpdated).toBe(true);
  });

  it('does not claim an update when the template has not moved', () => {
    const mine = draft(NEW_TEMPLATE + '\n// my attempt', hashCode(NEW_TEMPLATE));
    expect(resolveOpenCode(mine, NEW_TEMPLATE).templateUpdated).toBe(false);
  });

  it('a legacy draft with no baseHash still wins, as before', () => {
    // Entries written before baseHash existed cannot be told apart from edited
    // ones. Discarding them would delete real work, so they keep priority.
    const legacy = draft(OLD_TEMPLATE);
    const out = resolveOpenCode(legacy, NEW_TEMPLATE);
    expect(out.code).toBe(OLD_TEMPLATE);
    expect(out.restored).toBe(true);
  });

  it('hashCode is stable and distinguishes near-identical strings', () => {
    expect(hashCode(OLD_TEMPLATE)).toBe(hashCode(OLD_TEMPLATE));
    expect(hashCode(OLD_TEMPLATE)).not.toBe(hashCode(OLD_TEMPLATE + ' '));
  });
});

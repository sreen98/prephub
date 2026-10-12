import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LAST_MINUTE_CARDS } from './lastMinuteCards';

/**
 * The Git deck's claims, run against a real repository in a temp folder. A card
 * read minutes before an interview must not say "no merge commit" when there is one.
 *
 * Safety: git hooks export GIT_DIR, GIT_INDEX_FILE and friends, and this suite runs
 * inside the pre-push hook. Every GIT_* variable is dropped, and the user's global
 * and system config are ignored, so nothing here can touch PrepHub's own repository.
 */
const empty = join(mkdtempSync(join(tmpdir(), 'lm-git-config-')), 'gitconfig');
writeFileSync(empty, '');
const env: NodeJS.ProcessEnv = {
  ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.toUpperCase().startsWith('GIT_'))),
  GIT_CONFIG_GLOBAL: empty,
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Card Test',
  GIT_AUTHOR_EMAIL: 'card@test.invalid',
  GIT_COMMITTER_NAME: 'Card Test',
  GIT_COMMITTER_EMAIL: 'card@test.invalid',
};

let root = '';
beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'lm-git-')); });
afterEach(() => { rmSync(root, { recursive: true, force: true }); });

/** Runs git in `dir` (relative to the temp root) and returns the result. */
function git(dir: string, ...args: string[]) {
  const r = spawnSync('git', args, { cwd: join(root, dir), env, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() };
}
/** Runs git and fails the test if it fails. */
function must(dir: string, ...args: string[]) {
  const r = git(dir, ...args);
  expect(r.ok, `git ${args.join(' ')}: ${r.err}`).toBe(true);
  return r.out;
}
function commit(dir: string, file: string, text: string) {
  writeFileSync(join(root, dir, file), text);
  must(dir, 'add', file);
  must(dir, 'commit', '-q', '-m', `${file}: ${text}`);
  return must(dir, 'rev-parse', 'HEAD');
}
/** A repo `repo` with main = [base, main work] and feature = [base, feature work]. */
function diverged() {
  must('', 'init', '-q', '-b', 'main', 'repo');
  commit('repo', 'base.txt', 'base');
  must('repo', 'switch', '-q', '-c', 'feature');
  const featureCommit = commit('repo', 'feature.txt', 'feature work');
  must('repo', 'switch', '-q', 'main');
  const mainCommit = commit('repo', 'main.txt', 'main work');
  return { featureCommit, mainCommit };
}
const parents = (sha: string) => must('repo', 'rev-list', '--parents', '-n', '1', sha).split(' ').slice(1);
const card = (id: string) => LAST_MINUTE_CARDS.find(c => c.id === id);

describe('Git deck', () => {
  it('has the five cards, contiguous, with merge vs rebase in Core', () => {
    const ids = LAST_MINUTE_CARDS.filter(c => c.deck === 'git').map(c => c.id);
    expect(ids).toEqual(['git-merge-rebase', 'git-worktree', 'git-reset-revert', 'git-fetch-pull', 'git-one-liners']);
    expect(card('git-merge-rebase')?.core).toBe(true);
  });

  it('merge: a merge commit with two parents', () => {
    const { featureCommit, mainCommit } = diverged();
    must('repo', 'merge', '-q', '--no-edit', 'feature');
    expect(parents('HEAD')).toEqual([mainCommit, featureCommit]);
  });

  it('rebase: new hashes, a straight line, and main then fast-forwards with no merge commit', () => {
    const { featureCommit, mainCommit } = diverged();
    // The card's own four commands, in order.
    must('repo', 'switch', '-q', 'feature');
    must('repo', 'rebase', '-q', 'main');
    const replayed = must('repo', 'rev-parse', 'HEAD');
    expect(replayed).not.toBe(featureCommit);                 // the replayed commit has a new hash
    expect(parents(replayed)).toEqual([mainCommit]);          // on top of main
    must('repo', 'switch', '-q', 'main');
    must('repo', 'merge', '-q', '--ff-only', 'feature');
    expect(must('repo', 'rev-parse', 'HEAD')).toBe(replayed); // main just moved forward
    expect(must('repo', 'rev-list', '--merges', '--count', 'HEAD')).toBe('0');
  });

  it('worktree: a second folder on another branch; the same branch twice is refused; config is shared', () => {
    must('', 'init', '-q', '-b', 'main', 'repo');
    commit('repo', 'a.txt', 'a');
    must('repo', 'branch', 'hotfix');
    must('repo', 'worktree', 'add', '-q', '../app-hotfix', 'hotfix');
    expect(must('app-hotfix', 'branch', '--show-current')).toBe('hotfix');
    expect(must('repo', 'worktree', 'list')).toContain('[hotfix]');
    expect(git('repo', 'worktree', 'add', '-q', '../again', 'hotfix').ok).toBe(false);
    must('app-hotfix', 'config', 'card.test', 'shared');
    expect(must('repo', 'config', 'card.test')).toBe('shared');
    must('repo', 'worktree', 'remove', '../app-hotfix');
    expect(must('repo', 'worktree', 'list')).not.toContain('hotfix');
  });

  it('revert adds a commit; reset --hard drops one, and the reflog brings it back', () => {
    must('', 'init', '-q', '-b', 'main', 'repo');
    commit('repo', 'a.txt', 'one');
    const bad = commit('repo', 'a.txt', 'two');
    must('repo', 'revert', '--no-edit', 'HEAD');
    expect(must('repo', 'rev-list', '--count', 'HEAD')).toBe('3');   // history only grows
    expect(readFileSync(join(root, 'repo', 'a.txt'), 'utf8')).toBe('one');

    must('repo', 'reset', '-q', '--hard', 'HEAD~1');
    expect(must('repo', 'rev-parse', 'HEAD')).toBe(bad);
    must('repo', 'reset', '-q', '--hard', 'HEAD~1');
    expect(must('repo', 'rev-list', '--count', 'HEAD')).toBe('1');
    expect(must('repo', 'reflog', '--format=%H')).toContain(bad);
    must('repo', 'reset', '-q', '--hard', bad);
    expect(readFileSync(join(root, 'repo', 'a.txt'), 'utf8')).toBe('two');
  });

  it('reset --soft keeps the changes staged; restore discards uncommitted edits', () => {
    must('', 'init', '-q', '-b', 'main', 'repo');
    commit('repo', 'a.txt', 'one');
    commit('repo', 'a.txt', 'two');
    must('repo', 'reset', '-q', '--soft', 'HEAD~1');
    expect(must('repo', 'diff', '--cached', '--name-only')).toBe('a.txt');
    must('repo', 'commit', '-q', '-m', 'again');
    writeFileSync(join(root, 'repo', 'a.txt'), 'scratch');
    must('repo', 'restore', 'a.txt');
    expect(readFileSync(join(root, 'repo', 'a.txt'), 'utf8')).toBe('two');
  });

  it('fetch leaves main alone; log main..origin/main shows what arrived; pull --rebase replays on top', () => {
    must('', 'init', '-q', '-b', 'main', 'repo');
    commit('repo', 'a.txt', 'a');
    must('', 'clone', '-q', 'repo', 'clone');
    const remoteNew = commit('repo', 'b.txt', 'from a teammate');
    const mine = commit('clone', 'c.txt', 'my work');

    must('clone', 'fetch', '-q');
    expect(must('clone', 'rev-parse', 'main')).toBe(mine);
    expect(must('clone', 'rev-parse', 'origin/main')).toBe(remoteNew);
    expect(must('clone', 'log', '--format=%H', 'main..origin/main')).toBe(remoteNew);

    must('clone', 'pull', '-q', '--rebase');
    expect(parents('HEAD').length).toBe(1);
    expect(must('clone', 'rev-parse', 'HEAD~1')).toBe(remoteNew);
    expect(must('clone', 'rev-list', '--merges', '--count', 'HEAD')).toBe('0');
  });

  it('one-liners: cherry-pick makes a new hash, HEAD^2 is the merged branch, .gitignore skips tracked files', () => {
    const { featureCommit, mainCommit } = diverged();
    must('repo', 'cherry-pick', featureCommit);
    const picked = must('repo', 'rev-parse', 'HEAD');
    expect(picked).not.toBe(featureCommit);
    expect(must('repo', 'show', '-s', '--format=%s', picked)).toBe(must('repo', 'show', '-s', '--format=%s', featureCommit));
    must('repo', 'reset', '-q', '--hard', mainCommit);

    must('repo', 'merge', '-q', '--no-edit', 'feature');
    expect(must('repo', 'rev-parse', 'HEAD^2')).toBe(featureCommit);
    expect(must('repo', 'rev-parse', 'HEAD~1')).toBe(mainCommit);

    writeFileSync(join(root, 'repo', '.gitignore'), 'base.txt\n');
    writeFileSync(join(root, 'repo', 'base.txt'), 'changed');
    expect(must('repo', 'status', '--porcelain', 'base.txt')).toBe('M base.txt');   // still tracked
    must('repo', 'rm', '-q', '--cached', 'base.txt');
    must('repo', 'commit', '-q', '-m', 'untrack');
    expect(must('repo', 'status', '--porcelain', 'base.txt')).toBe('');             // now ignored
  });

  it('one-liners: stash shelves changes and pop brings them back', () => {
    must('', 'init', '-q', '-b', 'main', 'repo');
    commit('repo', 'a.txt', 'one');
    writeFileSync(join(root, 'repo', 'a.txt'), 'wip');
    must('repo', 'stash', '-q');
    expect(readFileSync(join(root, 'repo', 'a.txt'), 'utf8')).toBe('one');
    must('repo', 'stash', 'pop', '-q');
    expect(readFileSync(join(root, 'repo', 'a.txt'), 'utf8')).toBe('wip');
  });
});

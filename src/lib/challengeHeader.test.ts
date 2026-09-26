import { describe, it, expect } from 'vitest';
import { stripChallengeHeader } from './challengeHeader';

describe('stripChallengeHeader (old headers in saved drafts)', () => {
  it('removes a JS header and the blank lines after it, keeping the user\'s code', () => {
    const draft = '// ===== CHALLENGE: X =====\n// Do the thing.\n//\n// Example: f(1) → 2\n\nfunction f(n) {\n  // my note\n  return n + 1;\n}';
    expect(stripChallengeHeader(draft)).toBe('function f(n) {\n  // my note\n  return n + 1;\n}');
  });

  it('handles the ═════ variant', () => {
    expect(stripChallengeHeader('// ═════ CHALLENGE: X ═════\n// text\n\ncode();')).toBe('code();');
  });

  it('keeps React design notes but drops the intro and TASK list', () => {
    const draft = '// ===== MACHINE CODING: A =====\n// Intro.\n//\n// TASK\n//   1. do\n//\n// WHY?\n//   because\n\nfunction A() {}';
    expect(stripChallengeHeader(draft)).toBe('// WHY?\n//   because\n\nfunction A() {}');
  });

  it('never touches code that does not start with the old header', () => {
    const own = '// my own header\n// ===== CHALLENGE: not first =====\nfunction f() {}';
    expect(stripChallengeHeader(own)).toBe(own);
  });
});

import { describe, it, expect } from 'vitest';
import { closingTagFor, shouldClosePair, shouldCloseAngle, VOID_ELEMENTS } from './playgroundAutoClose';

// Replays the real key handler's decision order over a string of keystrokes.
// Every rule the handler applies is represented here, so a regression in any
// one of them shows up as a wrong final buffer rather than a passing unit test.
const PAIR: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSERS = new Set([')', ']', '}', '"', "'", '`']);

function type(keys: string, isJSX = true): string {
  let code = '', caret = 0;
  for (const k of keys) {
    const before = code.slice(0, caret), after = code.slice(caret);
    if (k === '<' && shouldCloseAngle(before, isJSX) && shouldClosePair(code, caret, caret, '<')) {
      code = before + '<>' + after; caret += 1; continue;
    }
    if (k === '>') {
      const closeTag = closingTagFor(before, isJSX);
      const pending = code[caret] === '>';
      if (closeTag || pending) {
        code = before + '>' + (closeTag ?? '') + (pending ? after.slice(1) : after);
        caret += 1; continue;
      }
    }
    if (CLOSERS.has(k) && code[caret] === k) { caret += 1; continue; }
    if (PAIR[k] && shouldClosePair(code, caret, caret, k)) {
      code = before + k + PAIR[k] + after; caret += 1; continue;
    }
    code = before + k + after; caret += 1;
  }
  return code;
}

describe('closingTagFor — fires', () => {
  it.each([
    ['  <div', '</div>'],
    ['<h1', '</h1>'],
    ['  <', '</>'],                                  // fragment
    ['<Counter', '</Counter>'],
    ['<Modal.Header', '</Modal.Header>'],
    ['<button onClick={inc}', '</button>'],
    ['<button onClick={() => setX(1)}', '</button>'], // `>` inside a closed brace
    ['return (\n    <ul', '</ul>'],
    ['<div>\n  <span', '</span>'],
  ])('%j → %j', (before, want) => {
    expect(closingTagFor(before, true)).toBe(want);
  });
});

describe('closingTagFor — must not fire', () => {
  it.each([
    ['<br', 'void element'],
    ['<img src="x"', 'void element with attributes'],
    ['<Counter /', 'already self-closing'],
    ['</div', 'a closing tag'],
    ['useState<Props', 'TS generic'],
    ['Array<string', 'TS generic'],
    ['if (a < b', 'comparison — was matched as a nameless tag and closed to </>'],
    ['if (a < b) { if (c ', 'unmatched < earlier in the line'],
    ['const a = 1 ', 'no < at all'],
    ['<div>text', 'tag already closed'],
    ['<div>\n  if (a ', 'a > b after an earlier complete tag'],
    ['<button onClick={()=', 'mid prop expression — inserted </button> INSIDE the prop'],
    ['<button onClick={() =', 'mid prop expression, spaced'],
    ['<div style={{color:', 'nested unclosed braces'],
    ['<Foo bar={[1,', 'unclosed bracket in a prop'],
  ])('%j → null (%s)', (before) => {
    expect(closingTagFor(before, true)).toBeNull();
  });

  it('never fires outside JSX', () => {
    expect(closingTagFor('<div', false)).toBeNull();
  });

  it('treats every HTML void element as childless', () => {
    for (const tag of VOID_ELEMENTS) {
      expect(closingTagFor(`<${tag}`, true), tag).toBeNull();
    }
  });
});

describe('shouldClosePair', () => {
  it('does not wrap following text — the corruption that shipped', () => {
    // Typing `[` in front of existing text used to insert `[]` and swallow the
    // text, turning `const [count, setCount]` into `count[(count, setCount)]`.
    expect(shouldClosePair('const count', 6, 6, '[')).toBe(false);
    expect(shouldClosePair('foo bar', 4, 4, '(')).toBe(false);
    expect(shouldClosePair('xyz', 0, 0, '{')).toBe(false);
  });

  it('closes at a boundary', () => {
    expect(shouldClosePair('const a = ', 10, 10, '[')).toBe(true);
    expect(shouldClosePair('a  b', 2, 2, '[')).toBe(true);
    expect(shouldClosePair('foo()', 4, 4, '[')).toBe(true);
  });

  it('wraps a real selection, which is deliberate', () => {
    expect(shouldClosePair('const [count, setCount] = useState(0);', 6, 23, '[')).toBe(true);
  });

  it('leaves an apostrophe alone', () => {
    expect(shouldClosePair('don', 3, 3, "'")).toBe(false);
    expect(shouldClosePair('const s = ', 10, 10, '"')).toBe(true);
  });
});

describe('shouldCloseAngle', () => {
  it.each([['return (\n    ', true], ['<div>\n  ', true], ['', true], ['xs.map(x => ', true]])(
    'tag position %j → %s', (before, want) => expect(shouldCloseAngle(before, true)).toBe(want),
  );
  it.each([['count ', false], ['useState', false], ['arr[0] ', false], ['foo() ', false]])(
    'value position %j → %s', (before, want) => expect(shouldCloseAngle(before, true)).toBe(want),
  );
});

describe('typing simulation — end to end', () => {
  it.each([
    ['<div>', '<div></div>'],
    ['<button>', '<button></button>'],
    ['<h1>Count : {Count}', '<h1>Count : {Count}</h1>'],
    ['<>', '<></>'],
    ['<div><span>hi', '<div><span>hi</span></div>'],
    ['<img src="a">', '<img src="a">'],
    ['<br />', '<br />'],
    ['<div style={{color:"red"}}>', '<div style={{color:"red"}}></div>'],
    ['{xs.map(x => <li>{x}', '{xs.map(x => <li>{x}</li>)}'],
    // the reported corruption, keystroke for keystroke
    ['<button onClick={()=>', '<button onClick={()=>}>'],
    ['<button onClick={()=>x}>', '<button onClick={()=>x}></button>'],
    ['<button onClick={() => inc()}>Go', '<button onClick={() => inc()}>Go</button>'],
    // things that must survive untouched
    ['if (i < n) {', 'if (i < n) {}'],
    ['useState<Props>(', 'useState<Props>()'],
    ['const [a, setA] = useState(0);', 'const [a, setA] = useState(0);'],
    ['return { a: 1, b: 2 };', 'return { a: 1, b: 2 };'],
    ['`hello ${name}`', '`hello ${name}`'],
  ])('typing %j yields %j', (keys, want) => {
    expect(type(keys)).toBe(want);
  });

  it('leaves plain JS comparisons alone', () => {
    expect(type('a < b && c > d', false)).toBe('a < b && c > d');
  });
});

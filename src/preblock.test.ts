import { describe, it, expect } from 'vitest';

/** Mirrors the auto-append heuristic in PreBlock.tsx. */
function pick(text: string): string | null {
  const matches = [
    ...text.matchAll(/function\s+([A-Z][A-Za-z0-9]*)\s*\(/g),
    ...text.matchAll(/(?:const|let|var)\s+([A-Z][A-Za-z0-9]*)\s*=/g),
    ...text.matchAll(/class\s+([A-Z][A-Za-z0-9]*)\s+extends/g),
  ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  return matches.length ? matches[matches.length - 1][1] : null;
}

describe('Try-it picks the composing component', () => {
  it('Q17: memo child declared with const, parent declared with function', () => {
    expect(pick(`const Child = React.memo(function Child({ data, onSelect }) {
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
});

function Parent() {
  const [users] = useState([{ id: 1, name: "Ana" }]);
  return <Child data={users} onSelect={() => {}} />;
}`)).toBe('Parent');
  });

  it('still works when the composer is a const', () => {
    expect(pick(`function Row() { return <li />; }
const List = () => <ul><Row /></ul>;`)).toBe('List');
  });

  it('single component', () => {
    expect(pick(`function App() { return <p>hi</p>; }`)).toBe('App');
  });
});

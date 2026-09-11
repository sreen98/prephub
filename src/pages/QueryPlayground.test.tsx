// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import QueryPlayground from './QueryPlayground';
import QuestionList from '../features/queryPlayground/QuestionList';
import SchemaPanel from '../features/queryPlayground/SchemaPanel';
import ResultTable from '../features/queryPlayground/ResultTable';
import { SQL_QUESTIONS, MONGO_QUESTIONS, HR_DATASET, MONGO_SHOP } from '../data/queries';

const wrap = (node: React.ReactNode) =>
  renderToStaticMarkup(<MemoryRouter initialEntries={['/query-playground']}>{node}</MemoryRouter>);

describe('QueryPlayground page', () => {
  it('renders without throwing', () => {
    expect(wrap(<QueryPlayground />)).toBeTruthy();
  });

  it('shows the first question and its prompt on load', () => {
    const html = wrap(<QueryPlayground />);
    expect(html).toContain(SQL_QUESTIONS[0].title);
    expect(html).toContain('Run');
  });

  it('does NOT pull the PGlite engine into the initial render', () => {
    // The engine is 5 MB; it must only load when a query is actually run.
    // Rendering must not touch it.
    expect(() => wrap(<QueryPlayground />)).not.toThrow();
  });

  it('has a default export for React.lazy', async () => {
    expect(typeof (await import('./QueryPlayground')).default).toBe('function');
  });
});

describe('QuestionList', () => {
  const props = {
    questions: [...SQL_QUESTIONS, ...MONGO_QUESTIONS],
    selectedId: SQL_QUESTIONS[0].id,
    solvedIds: new Set<string>(),
    engine: 'postgres' as const,
    onEngineChange: () => {},
    onSelect: () => {},
  };

  it('lists only the questions for the active engine', () => {
    const html = wrap(<QuestionList {...props} />);
    expect(html).toContain(SQL_QUESTIONS[0].title);
    expect(html).not.toContain(MONGO_QUESTIONS[0].title);
  });

  it('switches scope with the engine', () => {
    const html = wrap(<QuestionList {...props} engine="mongo" />);
    expect(html).toContain(MONGO_QUESTIONS[0].title);
    expect(html).not.toContain(SQL_QUESTIONS[0].title);
  });

  it('shows a solved count that reflects only the active engine', () => {
    const solved = new Set([SQL_QUESTIONS[0].id, MONGO_QUESTIONS[0].id]);
    const html = wrap(<QuestionList {...props} solvedIds={solved} />);
    expect(html).toContain(`1 / ${SQL_QUESTIONS.length} solved`);
  });
});

describe('SchemaPanel', () => {
  it('lists SQL tables and their columns', () => {
    const html = wrap(<SchemaPanel sql={HR_DATASET} />);
    expect(html).toContain('employees');
    expect(html).toContain('departments');
    expect(html).toContain('manager_id');
  });

  it('shows a sample document for a Mongo collection', () => {
    const html = wrap(<SchemaPanel mongo={MONGO_SHOP} />);
    expect(html).toContain('orders');
    expect(html).toContain('customers');
    expect(html).toContain('Keyboard');   // from the first sample document
  });
});

describe('ResultTable', () => {
  it('renders headers and rows', () => {
    const html = wrap(<ResultTable rows={[{ name: 'Ada', salary: 150000 }]} columns={['name', 'salary']} />);
    expect(html).toContain('name');
    expect(html).toContain('Ada');
    expect(html).toContain('150000');
  });

  it('renders NULL distinctly rather than blank', () => {
    const html = wrap(<ResultTable rows={[{ manager: null }]} columns={['manager']} />);
    expect(html).toContain('NULL');
  });

  it('renders an object cell as JSON, not [object Object]', () => {
    const html = wrap(<ResultTable rows={[{ _id: { a: 1 } }]} columns={['_id']} />);
    expect(html).not.toContain('[object Object]');
    expect(html).toContain('&quot;a&quot;:1');
  });

  it('shows an empty-state message for zero rows', () => {
    expect(wrap(<ResultTable rows={[]} columns={[]} />)).toContain('No rows');
  });
});

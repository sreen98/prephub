import { describe, it, expect } from 'vitest';
import { SQL_QUESTIONS, MONGO_QUESTIONS, ALL_QUERY_QUESTIONS } from './index';
import { sqlDataset, mongoDataset } from './datasets';
import { runPostgres } from '../../features/queryPlayground/engines/postgres';
import { runMongo } from '../../features/queryPlayground/engines/mongo';
import { checkAnswer } from '../../features/queryPlayground/checkAnswer';

/**
 * Every question's reference solution must actually execute and return rows.
 *
 * The expected result for checking a user's answer is DERIVED by running the
 * solution, so a solution that errors would silently make its question
 * unanswerable — the user could write a perfect query and be told they are
 * wrong. This suite is what makes the answer-checking trustworthy.
 */

describe('question bank integrity', () => {
  it('every question has the fields the UI needs', () => {
    for (const q of ALL_QUERY_QUESTIONS) {
      expect(q.id, q.title).toBeTruthy();
      expect(q.prompt.length, q.id).toBeGreaterThan(20);
      expect(q.solution.trim().length, q.id).toBeGreaterThan(5);
      expect(q.explanation.length, q.id).toBeGreaterThan(100);
      expect(q.topics.length, q.id).toBeGreaterThan(0);
      expect(['Easy', 'Medium', 'Hard'], q.id).toContain(q.difficulty);
    }
  });

  it('ids are unique', () => {
    const ids = ALL_QUERY_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every question points at a dataset that exists', () => {
    for (const q of ALL_QUERY_QUESTIONS) {
      const ds = q.engine === 'postgres' ? sqlDataset(q.datasetId) : mongoDataset(q.datasetId);
      expect(ds, `${q.id} → ${q.datasetId}`).toBeTruthy();
    }
  });

  it('every mongo question names a collection that exists', () => {
    for (const q of MONGO_QUESTIONS) {
      const ds = mongoDataset(q.datasetId);
      expect(q.collection, q.id).toBeTruthy();
      expect(Object.keys(ds!.collections), q.id).toContain(q.collection!);
    }
  });
});

describe('PostgreSQL solutions execute', () => {
  for (const q of SQL_QUESTIONS) {
    it(`${q.id} — ${q.title}`, async () => {
      const ds = sqlDataset(q.datasetId)!;
      const result = await runPostgres(ds.id, ds.setup, q.solution);
      expect(result.error, `${q.id}: ${result.error ?? ''}`).toBeUndefined();
      expect(result.rows.length, `${q.id} returned no rows`).toBeGreaterThan(0);
      // The solution must validate against itself, or checking is broken.
      expect(checkAnswer(result.rows, result.rows, q.orderMatters).correct).toBe(true);
    }, 60_000);
  }
});

describe('MongoDB solutions execute', () => {
  for (const q of MONGO_QUESTIONS) {
    it(`${q.id} — ${q.title}`, async () => {
      const ds = mongoDataset(q.datasetId)!;
      const result = await runMongo(ds.collections, q.collection!, q.solution);
      expect(result.error, `${q.id}: ${result.error ?? ''}`).toBeUndefined();
      expect(result.rows.length, `${q.id} returned no rows`).toBeGreaterThan(0);
      expect(checkAnswer(result.rows, result.rows, q.orderMatters).correct).toBe(true);
    }, 30_000);
  }
});

describe('the checker actually discriminates', () => {
  it('rejects a query that returns the wrong rows', async () => {
    const q = SQL_QUESTIONS.find((x) => x.id === 'sql-second-highest')!;
    const ds = sqlDataset(q.datasetId)!;
    const right = await runPostgres(ds.id, ds.setup, q.solution);
    // The classic wrong answer: forgetting DISTINCT, so a tie at the top
    // makes "second highest" return the highest again.
    const wrong = await runPostgres(
      ds.id, ds.setup,
      'SELECT salary AS second_highest FROM employees ORDER BY salary DESC OFFSET 1 LIMIT 1',
    );
    expect(wrong.error).toBeUndefined();
    expect(checkAnswer(wrong.rows, right.rows, q.orderMatters).correct).toBe(false);
  }, 60_000);

  it('rejects the LEFT JOIN / WHERE mistake', async () => {
    const q = SQL_QUESTIONS.find((x) => x.id === 'sql-left-join-where-trap')!;
    const ds = sqlDataset(q.datasetId)!;
    const right = await runPostgres(ds.id, ds.setup, q.solution);
    const wrong = await runPostgres(ds.id, ds.setup, `
      SELECT c.name, COUNT(o.id) AS shipped_orders
      FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
      WHERE o.status = 'shipped'
      GROUP BY c.name ORDER BY c.name`);
    expect(wrong.error).toBeUndefined();
    const check = checkAnswer(wrong.rows, right.rows, q.orderMatters);
    expect(check.correct).toBe(false);
    expect(check.reason).toMatch(/rows are being excluded/);
  }, 60_000);

  it('rejects the $elemMatch mistake', async () => {
    const q = MONGO_QUESTIONS.find((x) => x.id === 'mongo-array-query')!;
    const ds = mongoDataset(q.datasetId)!;
    const right = await runMongo(ds.collections, q.collection!, q.solution);
    // Without $elemMatch the conditions can be satisfied by DIFFERENT items.
    const wrong = await runMongo(ds.collections, q.collection!, `[
      { "$match": { "items.sku": "CB", "items.qty": { "$gte": 5 } } },
      { "$project": { "_id": 1 } }
    ]`);
    expect(wrong.error).toBeUndefined();
    expect(wrong.rows.length).toBeGreaterThan(right.rows.length);
    expect(checkAnswer(wrong.rows, right.rows, q.orderMatters).correct).toBe(false);
  }, 30_000);

  it('accepts an equivalent query written differently', async () => {
    const q = SQL_QUESTIONS.find((x) => x.id === 'sql-never-ordered')!;
    const ds = sqlDataset(q.datasetId)!;
    const viaJoin = await runPostgres(ds.id, ds.setup, q.solution);
    const viaNotExists = await runPostgres(ds.id, ds.setup, `
      SELECT name FROM customers c
      WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)`);
    expect(checkAnswer(viaNotExists.rows, viaJoin.rows, q.orderMatters).correct).toBe(true);
  }, 60_000);
});

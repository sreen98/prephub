/** Shared types for the Query Playground's question bank. */

export type QueryEngine = 'postgres' | 'mongo';
export type QueryDifficulty = 'Easy' | 'Medium' | 'Hard';

/** One row of a result set. Postgres returns numerics as strings; the checker normalises. */
export type ResultRow = Record<string, unknown>;

export interface SqlDataset {
  id: string;
  name: string;
  /** DDL + seed INSERTs, run once per session into a fresh PGlite database. */
  setup: string;
  /** Shown in the schema panel so the user knows the shape without running anything. */
  tables: { name: string; columns: string[]; note?: string }[];
}

export interface MongoDataset {
  id: string;
  name: string;
  /** Collection name → documents. Seeded in memory; mingo queries run against these. */
  collections: Record<string, ResultRow[]>;
}

export interface QueryQuestion {
  id: string;
  engine: QueryEngine;
  title: string;
  /** What to write, in plain language. */
  prompt: string;
  datasetId: string;
  /** For mongo: which collection the pipeline runs against. */
  collection?: string;
  difficulty: QueryDifficulty;
  topics: string[];
  /** A correct answer. Shown on request, and used to derive the expected result. */
  solution: string;
  /** Why that answer works, and what the question is really testing. */
  explanation: string;
  /**
   * Whether row order is part of the answer. True when the prompt asks for
   * "top N", "ordered by", "first" — otherwise rows are compared as a set, so
   * a correct query is not marked wrong for returning rows in another order.
   */
  orderMatters: boolean;
  /** Optional starter text in the editor. */
  starter?: string;
  /** Shown after a correct answer — the follow-up an interviewer would ask. */
  followUp?: string;
  /**
   * How the same question differs on MySQL. Present only where it genuinely
   * does — the engine here is PostgreSQL because that is what compiles to
   * WebAssembly, and for most interview SQL the two are identical since MySQL
   * 8.0 added window functions and CTEs. Where they diverge, say so.
   */
  mysqlNote?: string;
}

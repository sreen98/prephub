import { SQL_QUESTIONS } from './sqlQuestions';
import { MONGO_QUESTIONS } from './mongoQuestions';
import type { QueryQuestion } from './types';

export * from './types';
export * from './datasets';
export { SQL_QUESTIONS } from './sqlQuestions';
export { MONGO_QUESTIONS } from './mongoQuestions';

export const ALL_QUERY_QUESTIONS: QueryQuestion[] = [...SQL_QUESTIONS, ...MONGO_QUESTIONS];

export function queryQuestion(id: string): QueryQuestion | undefined {
  return ALL_QUERY_QUESTIONS.find((q) => q.id === id);
}

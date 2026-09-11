import { useReducer, useCallback } from 'react';
import type { Pattern, Difficulty } from '../data/playground/playgroundTemplates';

export type ModalMode = 'templates' | 'challenges' | 'blank';

export interface TemplateFilterState {
  search: string;
  /** Language/kind tag — 'all' | 'JS' | 'React' | … */
  tag: string;
  /** Category label in templates mode. */
  category: string;
  mode: ModalMode;
  /** Only meaningful for JS coding challenges. */
  pattern: Pattern | 'all';
  /** Only meaningful for JS coding challenges. */
  difficulty: Difficulty | 'all';
}

const INITIAL: TemplateFilterState = {
  search: '',
  tag: 'all',
  category: 'all',
  mode: 'templates',
  pattern: 'all',
  difficulty: 'all',
};

export type TemplateFilterAction =
  | { type: 'search'; value: string }
  | { type: 'tag'; value: string }
  | { type: 'mode'; value: ModalMode }
  | { type: 'category'; value: string }
  | { type: 'pattern'; value: Pattern | 'all' }
  | { type: 'difficulty'; value: Difficulty | 'all' }
  | { type: 'reset' };

/**
 * The whole reason this is a reducer and not six `useState` calls:
 *
 * `pattern` and `difficulty` exist only on JS coding challenges — React
 * machine-coding templates carry neither. So changing the tag or the mode MUST
 * clear them, or a pattern picked under JS stays applied after switching to
 * React, excludes every template, and shows "No templates found".
 *
 * That is a bug this app actually shipped, and it shipped because the reset had
 * to be repeated by hand in three separate handlers (open, change mode, change
 * tag) and one was missed. Here the reset is part of the transition, so the
 * mistake is not expressible.
 */
export function templateFilterReducer(
  state: TemplateFilterState,
  action: TemplateFilterAction,
): TemplateFilterState {
  switch (action.type) {
    case 'search':
      return { ...state, search: action.value };

    // Both of these change which templates are in scope, so the scope-specific
    // filters are cleared as part of the same transition.
    case 'tag':
      return { ...state, tag: action.value, pattern: 'all', difficulty: 'all' };
    case 'mode':
      return { ...state, mode: action.value, pattern: 'all', difficulty: 'all' };

    case 'category':
      return { ...state, category: action.value };
    case 'pattern':
      return { ...state, pattern: action.value };
    case 'difficulty':
      return { ...state, difficulty: action.value };

    // Opening the modal starts clean — the previous session's filters should
    // not survive a close/reopen.
    case 'reset':
      return INITIAL;
  }
}

export interface UseTemplateFiltersReturn extends TemplateFilterState {
  setSearch: (v: string) => void;
  setTag: (v: string) => void;
  setMode: (v: ModalMode) => void;
  setCategory: (v: string) => void;
  setPattern: (v: Pattern | 'all') => void;
  setDifficulty: (v: Difficulty | 'all') => void;
  resetFilters: () => void;
}

export function useTemplateFilters(): UseTemplateFiltersReturn {
  const [state, dispatch] = useReducer(templateFilterReducer, INITIAL);
  return {
    ...state,
    setSearch: useCallback((value: string) => dispatch({ type: 'search', value }), []),
    setTag: useCallback((value: string) => dispatch({ type: 'tag', value }), []),
    setMode: useCallback((value: ModalMode) => dispatch({ type: 'mode', value }), []),
    setCategory: useCallback((value: string) => dispatch({ type: 'category', value }), []),
    setPattern: useCallback((value: Pattern | 'all') => dispatch({ type: 'pattern', value }), []),
    setDifficulty: useCallback((value: Difficulty | 'all') => dispatch({ type: 'difficulty', value }), []),
    resetFilters: useCallback(() => dispatch({ type: 'reset' }), []),
  };
}

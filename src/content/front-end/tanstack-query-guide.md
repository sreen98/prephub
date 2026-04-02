# TanStack Query (React Query) — Complete Guide

## Table of Contents

- [1. What is TanStack Query?](#1-what-is-tanstack-query)
- [2. Core Concepts](#2-core-concepts)
- [3. Queries (Reading Data)](#3-queries-reading-data)
- [4. Mutations (Writing Data)](#4-mutations-writing-data)
- [5. Cache Management](#5-cache-management)
- [6. Advanced Patterns](#6-advanced-patterns)
- [7. TanStack Query vs Redux — Detailed Comparison](#7-tanstack-query-vs-redux--detailed-comparison)
- [8. When to Use What](#8-when-to-use-what)
- [9. Interview Questions & Answers](#9-interview-questions--answers)

---

## 1. What is TanStack Query?

TanStack Query (formerly React Query) is a **server state management** library for React. It handles fetching, caching, synchronizing, and updating data that comes from a server/API.

**Key insight:** It separates **server state** (data from APIs) from **client state** (UI state like modals, theme, form inputs). Most apps mix these two in Redux, leading to unnecessary boilerplate.

### Installation

```bash
npm install @tanstack/react-query
```

### Setup

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 30 * 60 * 1000,       // 30 minutes (garbage collection)
      retry: 2,                      // retry failed requests twice
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
    </QueryClientProvider>
  );
}
```

---

## 2. Core Concepts

### 2.1 Query Keys

Every piece of cached data is identified by a **query key** — an array that uniquely describes the data.

```ts
// Simple key
['todos']

// Key with parameters
['todos', { status: 'active' }]

// Hierarchical key
['jobs', jobId, 'candidates', candidateId]
```

Query keys are used for:
- **Cache lookup** — finding existing data
- **Automatic refetching** — when keys change, data is refetched
- **Invalidation** — marking specific data as stale

### 2.2 Query Function

The async function that actually fetches the data. It can be any function that returns a promise.

```ts
const fetchTodos = async (): Promise<Todo[]> => {
  const response = await axios.get('/api/todos');
  return response.data;
};
```

### 2.3 Stale Time vs GC Time

| Concept | What it means | Default |
|---------|--------------|---------|
| **Stale Time** | How long data is considered "fresh". Fresh data is never refetched automatically. | 0 (immediately stale) |
| **GC Time** (formerly cacheTime) | How long **unused** (no active subscribers) cached data stays in memory before garbage collection. | 5 minutes |

**Lifecycle of cached data:**
```
Fetch -> Fresh (within staleTime) -> Stale -> Background refetch on trigger -> Fresh again
                                            -> If no subscribers for gcTime -> Garbage collected
```

### 2.4 Query States

```
           +---------------+
           |   pending     |  No cached data, fetching for the first time
           +------+--------+
                  |
           +------v--------+
           |   success      |  Data received and cached
           +------+---------+
                  |
           +------v--------+
           |    stale       |  Data is outdated (past staleTime)
           +------+---------+
                  | (trigger: mount, focus, interval, invalidation)
           +------v--------+
           |  fetching      |  Background refetch (stale data still shown)
           +------+---------+
                  |
           +------v--------+
           |   success      |  Updated data, cycle repeats
           +---------------+

On error at any fetch:
           +---------------+
           |    error       |  Fetch failed (retries exhausted)
           +---------------+
```

---

## 3. Queries (Reading Data)

### 3.1 Basic Query

```tsx
import { useQuery } from '@tanstack/react-query';

function TodoList() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  if (isPending) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### 3.2 Query with Parameters

```tsx
function TodoDetail({ todoId }: { todoId: string }) {
  const { data } = useQuery({
    queryKey: ['todos', todoId],          // refetches when todoId changes
    queryFn: () => fetchTodo(todoId),
    enabled: !!todoId,                    // don't fetch if no ID
  });

  return <div>{data?.title}</div>;
}
```

### 3.3 All useQuery Return Values

```ts
const {
  // Data
  data,                // TData | undefined - the resolved data
  dataUpdatedAt,       // number - timestamp of last successful fetch
  error,               // TError | null - error object if failed

  // Status flags (mutually exclusive)
  status,              // 'pending' | 'error' | 'success'
  isPending,           // true if no cached data and currently fetching
  isError,             // true if in error state
  isSuccess,           // true if data is available

  // Fetch status flags
  fetchStatus,         // 'fetching' | 'paused' | 'idle'
  isFetching,          // true if ANY fetch is in progress (including background)
  isRefetching,        // true if fetching AND data already exists (background refetch)
  isPaused,            // true if fetch is paused (e.g., offline)

  // Staleness
  isStale,             // true if data is past staleTime

  // Computed
  isLoading,           // isPending && isFetching (first load, no cache)
  isLoadingError,      // error on first load
  isRefetchError,      // error on background refetch (stale data still available)

  // Actions
  refetch,             // () => Promise - manually trigger a refetch
} = useQuery({ ... });
```

### 3.4 Important Distinction: isPending vs isFetching vs isLoading

```
First visit (no cache):
  isPending = true, isFetching = true, isLoading = true
  -> Show skeleton/spinner

Background refetch (stale data exists):
  isPending = false, isFetching = true, isLoading = false
  -> Show existing data + optional loading indicator

Cached and fresh:
  isPending = false, isFetching = false, isLoading = false
  -> Show data, no fetch happening
```

### 3.5 Parallel Queries

```tsx
// Option 1: Multiple useQuery hooks (run in parallel automatically)
function Dashboard() {
  const kpis = useQuery({ queryKey: ['kpis'], queryFn: fetchKPIs });
  const billing = useQuery({ queryKey: ['billing'], queryFn: fetchBilling });
  const credits = useQuery({ queryKey: ['credits'], queryFn: fetchCredits });
  // All three fire simultaneously
}

// Option 2: useQueries for dynamic parallel queries
function JobCandidates({ jobIds }: { jobIds: string[] }) {
  const results = useQueries({
    queries: jobIds.map(id => ({
      queryKey: ['job', id, 'candidates'],
      queryFn: () => fetchCandidates(id),
    })),
  });
}
```

### 3.6 Dependent (Serial) Queries

```tsx
function UserProfile({ userId }: { userId: string }) {
  // First: fetch user
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  // Then: fetch user's projects (only when user is loaded)
  const { data: projects } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => fetchProjects(user!.id),
    enabled: !!user?.id,                    // waits for user to exist
  });
}
```

### 3.7 Polling (Auto Refetch at Interval)

```tsx
const { data } = useQuery({
  queryKey: ['processing', jobId],
  queryFn: () => fetchProcessingStatus(jobId),
  refetchInterval: 3000,                       // poll every 3 seconds
  refetchIntervalInBackground: false,          // stop polling when tab is hidden
});

// Dynamic: stop when done
const { data } = useQuery({
  queryKey: ['processing', jobId],
  queryFn: () => fetchProcessingStatus(jobId),
  refetchInterval: (query) => {
    return query.state.data?.status === 'completed' ? false : 3000;
  },
});
```

### 3.8 Placeholder and Initial Data

```tsx
// Placeholder: shown while loading, not persisted to cache
useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => fetchTodo(todoId),
  placeholderData: { id: todoId, title: 'Loading...', completed: false },
});

// keepPreviousData equivalent: show old data while new params load
import { keepPreviousData } from '@tanstack/react-query';

useQuery({
  queryKey: ['todos', page],
  queryFn: () => fetchTodos(page),
  placeholderData: keepPreviousData,  // keeps page 1 data visible while page 2 loads
});

// Initial data: pre-populate cache from another source
useQuery({
  queryKey: ['todo', todoId],
  queryFn: () => fetchTodo(todoId),
  initialData: () => {
    // Pull from the list cache
    return queryClient.getQueryData(['todos'])?.find(t => t.id === todoId);
  },
});
```

### 3.9 Select (Transform Data)

```tsx
// Only re-renders when the selected value changes
const { data: todoCount } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => todos.length,   // component only gets the count
});

const { data: activeTodos } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => todos.filter(t => !t.completed),
});
```

---

## 4. Mutations (Writing Data)

### 4.1 Basic Mutation

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function AddTodo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newTodo: CreateTodoInput) => {
      return axios.post('/api/todos', newTodo);
    },
    onSuccess: () => {
      // Invalidate the todos list so it refetches
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ title: 'New Todo' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}
```

### 4.2 All useMutation Return Values

```ts
const {
  // Actions
  mutate,              // (variables, options?) => void - fire and forget
  mutateAsync,         // (variables, options?) => Promise - awaitable
  reset,               // () => void - reset mutation state

  // Data
  data,                // TData | undefined - response from last successful mutation
  error,               // TError | null
  variables,           // TVariables | undefined - the input passed to mutate()

  // Status
  status,              // 'idle' | 'pending' | 'error' | 'success'
  isIdle,              // true before mutate() is called
  isPending,           // true while mutation is in progress
  isError,
  isSuccess,

  // Meta
  submittedAt,         // timestamp of last mutate() call
  failureCount,        // number of retries so far
  failureReason,       // error that caused the last retry
} = useMutation({ ... });
```

### 4.3 Mutation Callbacks

```tsx
useMutation({
  mutationFn: updateTodo,

  // Called before mutationFn fires - great for optimistic updates
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // Snapshot previous value
    const previousTodos = queryClient.getQueryData(['todos']);

    // Optimistically update cache
    queryClient.setQueryData(['todos'], (old) =>
      old.map(t => t.id === newTodo.id ? { ...t, ...newTodo } : t)
    );

    // Return snapshot for rollback
    return { previousTodos };
  },

  onSuccess: (data, variables, context) => {
    // Runs on success
    console.log('Updated:', data);
  },

  onError: (error, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos'], context.previousTodos);
  },

  onSettled: (data, error, variables, context) => {
    // Runs on both success and error - like finally
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

### 4.4 Optimistic Updates (Full Pattern)

```tsx
const updateTodoMutation = useMutation({
  mutationFn: (updated: Todo) => api.updateTodo(updated),

  onMutate: async (updated) => {
    // 1. Cancel any in-flight queries for this data
    await queryClient.cancelQueries({ queryKey: ['todos', updated.id] });

    // 2. Snapshot current cache
    const previous = queryClient.getQueryData<Todo>(['todos', updated.id]);

    // 3. Optimistically update the cache
    queryClient.setQueryData(['todos', updated.id], updated);

    // 4. Return snapshot for rollback
    return { previous };
  },

  onError: (err, updated, context) => {
    // 5. Rollback on error
    if (context?.previous) {
      queryClient.setQueryData(['todos', updated.id], context.previous);
    }
  },

  onSettled: (data, err, updated) => {
    // 6. Always refetch to ensure server truth
    queryClient.invalidateQueries({ queryKey: ['todos', updated.id] });
  },
});
```

---

## 5. Cache Management

### 5.1 Query Invalidation

Invalidation marks cached data as stale and triggers a refetch if there are active subscribers.

```ts
const queryClient = useQueryClient();

// Invalidate a single query
queryClient.invalidateQueries({ queryKey: ['todos'] });

// Invalidate with exact match
queryClient.invalidateQueries({ queryKey: ['todos', 1], exact: true });

// Invalidate all queries that start with 'todos'
queryClient.invalidateQueries({ queryKey: ['todos'] });
// This invalidates: ['todos'], ['todos', 1], ['todos', { status: 'active' }]

// Invalidate everything
queryClient.invalidateQueries();
```

### 5.2 Direct Cache Manipulation

```ts
// Read from cache (synchronous)
const todos = queryClient.getQueryData<Todo[]>(['todos']);

// Write to cache (synchronous)
queryClient.setQueryData(['todos'], (old: Todo[] | undefined) => {
  return old ? [...old, newTodo] : [newTodo];
});

// Remove from cache
queryClient.removeQueries({ queryKey: ['todos', deletedId] });

// Prefetch (fire-and-forget, populates cache)
queryClient.prefetchQuery({
  queryKey: ['todo', nextId],
  queryFn: () => fetchTodo(nextId),
});
```

### 5.3 Cache Invalidation Strategies

```
Strategy 1: Invalidate after mutation (most common)
  mutate -> onSuccess -> invalidateQueries -> auto refetch -> fresh data

Strategy 2: Optimistic update + invalidate on settled
  mutate -> onMutate (update cache) -> API call -> onSettled (invalidate to sync)

Strategy 3: Update cache directly from mutation response
  mutate -> onSuccess (setQueryData with response) -> no refetch needed

Strategy 4: Refetch manually
  Button click -> queryClient.refetchQueries({ queryKey: ['todos'] })
```

---

## 6. Advanced Patterns

### 6.1 Infinite Queries (Pagination / Load More)

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

function InfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['todos'],
    queryFn: ({ pageParam }) => fetchTodos({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
  });

  return (
    <>
      {data?.pages.map(page =>
        page.items.map(todo => <TodoItem key={todo.id} todo={todo} />)
      )}
      <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
      </button>
    </>
  );
}
```

### 6.2 Custom Hooks (Recommended Pattern)

```ts
// hooks/use-todos.ts
export function useTodos(status?: string) {
  return useQuery({
    queryKey: ['todos', { status }],
    queryFn: () => fetchTodos(status),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// Component - clean and simple
function Todos() {
  const { data, isPending } = useTodos('active');
  const createTodo = useCreateTodo();

  return (
    <button onClick={() => createTodo.mutate({ title: 'New' })}>Add</button>
  );
}
```

### 6.3 Suspense Mode

```tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

function TodoList() {
  // No isPending check needed - Suspense handles it
  const { data } = useSuspenseQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  return <ul>{data.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <TodoList />
    </Suspense>
  );
}
```

### 6.4 Query Cancellation

```ts
useQuery({
  queryKey: ['todos'],
  queryFn: ({ signal }) => {
    // signal is an AbortSignal - passed to fetch/axios automatically
    return axios.get('/api/todos', { signal });
  },
});
// If the component unmounts or queryKey changes before the request completes,
// the request is automatically cancelled via AbortController.
```

### 6.5 Retry Configuration

```ts
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  retry: 3,                              // number of retries (default: 3)
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

// Custom retry logic
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  retry: (failureCount, error) => {
    if (error.status === 404) return false; // don't retry 404s
    return failureCount < 3;
  },
});
```

### 6.6 Window Focus Refetching

Enabled by default. When the user switches back to the browser tab, stale queries automatically refetch.

```ts
// Disable globally
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Disable per query
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  refetchOnWindowFocus: false,
});
```

---

## 7. TanStack Query vs Redux — Detailed Comparison

### 7.1 Conceptual Difference

```
Redux:  "Here is a global store. Put everything in it. Manage it manually."
RQ:     "Server data has its own lifecycle. Let me handle fetch, cache, sync, GC for you."
```

| Aspect | Redux (+ Saga/Thunk) | TanStack Query |
|--------|---------------------|----------------|
| **Philosophy** | Single global store for all state | Specialized cache for server state |
| **Data ownership** | You own the data lifecycle | Library manages the lifecycle |
| **Caching** | Manual (store data in state) | Automatic (keyed cache with TTL) |
| **Background sync** | Manual (dispatch refetch actions) | Automatic (stale-while-revalidate) |
| **Garbage collection** | Manual (or never - data stays forever) | Automatic (configurable gcTime) |
| **Deduplication** | Manual (check before fetching) | Automatic (same key = same request) |
| **Devtools** | Redux DevTools | React Query DevTools |
| **Boilerplate** | High (action, reducer, saga, selector) | Low (one hook call) |
| **Learning curve** | Steep (Redux + middleware concepts) | Moderate (cache concepts) |
| **Bundle size** | redux + toolkit + saga ~15KB | @tanstack/react-query ~13KB |

### 7.2 Code Comparison — Fetching a List

**Redux + Saga approach (5 files, ~120 lines):**

```ts
// 1. types.ts
interface TodosState {
  items: Todo[];
  loading: boolean;
  error: string | null;
}

// 2. slice.ts
const todosSlice = createSlice({
  name: 'todos',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    fetchTodosRequest: (state) => { state.loading = true; state.error = null; },
    fetchTodosSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload;
    },
    fetchTodosFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

// 3. saga.ts
function* fetchTodosSaga() {
  try {
    const response = yield call(api.getTodos);
    yield put(fetchTodosSuccess(response.data));
  } catch (error) {
    yield put(fetchTodosFailure(error.message));
  }
}
function* watchTodos() {
  yield takeLatest(fetchTodosRequest.type, fetchTodosSaga);
}

// 4. selectors.ts
export const selectTodos = (state: RootState) => state.todos.items;
export const selectTodosLoading = (state: RootState) => state.todos.loading;

// 5. component.tsx
function TodoList() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector(selectTodos);
  const loading = useAppSelector(selectTodosLoading);

  useEffect(() => {
    dispatch(fetchTodosRequest());
  }, [dispatch]);

  if (loading) return <Spinner />;
  return <ul>{todos.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

**TanStack Query approach (1 file, ~15 lines):**

```tsx
function TodoList() {
  const { data: todos, isPending } = useQuery({
    queryKey: ['todos'],
    queryFn: api.getTodos,
  });

  if (isPending) return <Spinner />;
  return <ul>{todos.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

Same result. No slice, no saga, no selectors, no dispatch, no useEffect.

### 7.3 Code Comparison — Mutation with Cache Update

**Redux + Saga:**

```ts
// slice.ts - add more actions
updateTodoRequest: (state, action) => { state.updating = true; },
updateTodoSuccess: (state, action) => {
  state.updating = false;
  const index = state.items.findIndex(t => t.id === action.payload.id);
  if (index !== -1) state.items[index] = action.payload;
},
updateTodoFailure: (state, action) => {
  state.updating = false;
  state.error = action.payload;
},

// saga.ts - add another saga
function* updateTodoSaga(action) {
  try {
    const response = yield call(api.updateTodo, action.payload);
    yield put(updateTodoSuccess(response.data));
  } catch (error) {
    yield put(updateTodoFailure(error.message));
  }
}

// component.tsx
dispatch(updateTodoRequest(updatedTodo));
```

**TanStack Query:**

```tsx
const mutation = useMutation({
  mutationFn: api.updateTodo,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
});

mutation.mutate(updatedTodo);
```

### 7.4 What Redux Does Better

| Scenario | Why Redux Wins |
|----------|---------------|
| **Complex async orchestration** | Sagas can model multi-step workflows (poll -> wait -> retry -> branch) as sequential code with `yield` |
| **Cross-cutting client state** | Auth session, theme, sidebar open/close - truly global UI state shared by unrelated components |
| **Time-travel debugging** | Redux DevTools let you replay actions and inspect every state change |
| **Predictable updates** | Single-direction data flow with strict action -> reducer -> state pattern |
| **Middleware pipeline** | Intercept any action for logging, analytics, error tracking |

### 7.5 What TanStack Query Does Better

| Scenario | Why TanStack Query Wins |
|----------|------------------------|
| **Any API data fetching** | Automatic loading/error states, no boilerplate |
| **Caching with smart invalidation** | Key-based cache with TTL, GC, and partial matching |
| **Background sync** | Stale-while-revalidate, window focus refetch, polling |
| **Deduplication** | Multiple components using same query = one request |
| **Optimistic updates** | Built-in pattern with rollback support |
| **Pagination / infinite scroll** | `useInfiniteQuery` handles it natively |
| **Request cancellation** | Auto-cancels on unmount or key change |
| **Offline support** | Pauses queries when offline, resumes when online |

---

## 8. When to Use What

### Decision Matrix

```
Is the data from an API/server?
  |-- YES -> Use TanStack Query
  |          (fetch, cache, sync, paginate, poll)
  |
  +-- NO -> Is it shared across unrelated components?
             |-- YES -> Use Redux
             |          (auth, theme, global notifications)
             |
             +-- NO -> Is it complex async orchestration?
                        |-- YES -> Use Redux Saga
                        |          (multi-step workflows, polling chains)
                        |
                        +-- NO -> Use local state
                                  (useState, useReducer)
```

### Recommended Architecture

```
+--------------------------------------------------+
|                   React App                       |
|                                                   |
|  +----------------+  +-------------------------+  |
|  |  Redux Store    |  |  React Query Cache      |  |
|  |                 |  |                         |  |
|  |  - auth         |  |  - ['todos']            |  |
|  |  - theme        |  |  - ['jobs', '123']      |  |
|  |  - ui state     |  |  - ['kpis']             |  |
|  |  - conversation |  |  - ['candidates', ...]  |  |
|  |    flow (saga)  |  |                         |  |
|  +----------------+  +-------------------------+  |
|                                                   |
|  +----------------+  +-------------------------+  |
|  |  React State    |  |  React Hook Form        |  |
|  |                 |  |                         |  |
|  |  - modal open   |  |  - form values          |  |
|  |  - tab index    |  |  - validation           |  |
|  |  - local UI     |  |  - dirty/touched        |  |
|  +----------------+  +-------------------------+  |
+--------------------------------------------------+
```

---

## 9. Interview Questions & Answers

### Beginner Level

---

**Q1: What is TanStack Query and why would you use it?**

TanStack Query is a server state management library for React. It handles data fetching, caching, synchronization, and background updates. You'd use it instead of manually managing loading/error/data states with useState + useEffect, or instead of Redux for API data. It eliminates boilerplate and provides automatic caching, deduplication, background refetching, and garbage collection out of the box.

---

**Q2: What is the difference between `isPending`, `isFetching`, and `isLoading`?**

- `isPending`: `true` when there is no cached data yet (status === 'pending'). The query has never successfully resolved.
- `isFetching`: `true` whenever a network request is in flight — including background refetches when stale data is already available.
- `isLoading`: `isPending && isFetching` — true only on the very first fetch with no cached data.

Use `isPending` (or `isLoading`) for initial loading spinners. Use `isFetching` for subtle background-refresh indicators when data is already displayed.

---

**Q3: What are query keys and why are they important?**

Query keys are arrays (e.g., `['todos', { status: 'active' }]`) that uniquely identify a piece of cached data. They're important because:
1. React Query uses them to look up cached data
2. When a key changes, the query automatically refetches
3. You can invalidate queries by matching keys (partial or exact)
4. They enable automatic deduplication — if two components use the same key, only one request is made

---

**Q4: What is `staleTime` and how does it differ from `gcTime`?**

- `staleTime` (default: 0): How long fetched data is considered "fresh". While fresh, the data won't be refetched on component mount or window focus. After staleTime expires, the data is marked "stale" and will be refetched on the next trigger.
- `gcTime` (default: 5 minutes): How long **unused** cached data (no active component subscribers) stays in memory. After gcTime, the data is garbage collected and the next access will be a cold fetch.

Setting `staleTime: Infinity` means data is never considered stale (good for data that rarely changes). Setting `staleTime: 0` means data is always stale (good for data that changes frequently).

---

**Q5: How do you handle errors in React Query?**

Multiple levels:
1. **Per query**: Check `isError` and `error` from the hook return
2. **Retry**: Configure `retry` option (default: 3 retries with exponential backoff)
3. **Global error handler**: Set `onError` in the QueryClient `defaultOptions` via the `MutationCache` or `QueryCache`
4. **Error boundaries**: Use `throwOnError: true` option with React error boundaries
5. **Mutation callbacks**: Use `onError` callback in `useMutation`

---

**Q6: What is the difference between `useQuery` and `useMutation`?**

- `useQuery` is for **reading** data (GET requests). It runs automatically on mount, supports caching, background refetching, polling, and stale-while-revalidate.
- `useMutation` is for **writing** data (POST/PUT/DELETE). It is triggered manually via `mutate()`, does not cache the result, and provides callbacks (`onSuccess`, `onError`, `onSettled`) for side effects like cache invalidation.

---

### Intermediate Level

---

**Q7: Explain the stale-while-revalidate pattern in React Query.**

When data becomes stale (past `staleTime`):
1. The stale data is immediately returned from cache (the user sees data instantly)
2. A background refetch is triggered
3. When the fresh data arrives, the cache is updated and the component re-renders

This gives users instant feedback (cached data) while ensuring data freshness in the background. It's the core pattern that makes React Query feel fast. Triggers include: component mount, window focus, network reconnect, or explicit invalidation.

---

**Q8: How does query invalidation work? Explain fuzzy matching.**

`queryClient.invalidateQueries({ queryKey: ['todos'] })` marks all queries whose key **starts with** `['todos']` as stale. This is called fuzzy matching.

```ts
// This invalidation:
queryClient.invalidateQueries({ queryKey: ['todos'] });

// Matches ALL of these:
['todos']
['todos', 1]
['todos', { status: 'active' }]
['todos', 1, 'comments']

// Does NOT match:
['users']
['todo-categories']
```

For exact matching: `queryClient.invalidateQueries({ queryKey: ['todos', 1], exact: true })` — only invalidates that specific key.

Active queries (with mounted subscribers) are immediately refetched. Inactive queries are just marked stale and will refetch on next mount.

---

**Q9: Walk through the complete optimistic update pattern.**

```ts
useMutation({
  mutationFn: updateTodo,
  onMutate: async (newData) => {
    // 1. Cancel outgoing refetches to avoid overwriting our optimistic update
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // 2. Snapshot current cache for rollback
    const previous = queryClient.getQueryData(['todos']);

    // 3. Optimistically update cache
    queryClient.setQueryData(['todos'], (old) => /* apply update */);

    // 4. Return context with snapshot
    return { previous };
  },
  onError: (err, newData, context) => {
    // 5. Rollback to snapshot on failure
    queryClient.setQueryData(['todos'], context.previous);
  },
  onSettled: () => {
    // 6. Refetch to ensure server/client are in sync
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

The user sees the update immediately (step 3). If the API fails, it rolls back (step 5). Either way, it syncs with the server (step 6).

---

**Q10: When would you NOT use React Query?**

1. **Purely client-side state** — modal open/close, theme, form inputs. No server involved.
2. **Complex async orchestration** — multi-step workflows with branching logic (e.g., poll -> wait -> branch -> retry). Redux Sagas or state machines are better.
3. **WebSocket / real-time data** — React Query is request-response oriented. For streams, use a dedicated solution and feed updates to the cache via `setQueryData`.
4. **State that must survive page refresh** — React Query cache lives in memory. Use localStorage/Redux Persist for offline persistence (though RQ has a persistor plugin).

---

**Q11: How do you implement polling with React Query?**

```ts
useQuery({
  queryKey: ['status', jobId],
  queryFn: () => fetchStatus(jobId),
  refetchInterval: 3000,                    // poll every 3 seconds
  refetchIntervalInBackground: true,        // continue polling when tab is hidden
});
```

For conditional polling (stop when done):
```ts
useQuery({
  queryKey: ['status', jobId],
  queryFn: () => fetchStatus(jobId),
  refetchInterval: (query) => {
    if (query.state.data?.status === 'completed') return false;
    return 3000;
  },
});
```

This replaces the saga polling pattern (dispatch action -> saga loop with delay -> check condition -> repeat) with a single option.

---

**Q12: Explain `select` in useQuery. How does it optimize re-renders?**

`select` transforms the cached data before it reaches the component. React Query memoizes the select function's output and only re-renders the component when the **selected** value changes — not when the full cached data changes.

```ts
// Component only re-renders when the count changes
const { data: count } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => todos.length,
});
```

This is similar to Redux's `useSelector` — derived data that prevents unnecessary re-renders.

---

**Q13: What is the `enabled` option and when would you use it?**

The `enabled` option controls whether the query automatically fires. When `enabled: false`, the query won't fetch on mount, window focus, or any other automatic trigger.

Common use cases:
- **Dependent queries**: Wait for a previous query to finish before fetching
  ```ts
  useQuery({ queryKey: ['projects', userId], queryFn: ..., enabled: !!userId })
  ```
- **User-triggered queries**: Only fetch when the user clicks a button (combine with `refetch()`)
- **Conditional data**: Don't fetch if a feature flag is off or a permission is missing
- **Form completion**: Only validate/search after the user has typed enough characters

---

### Advanced Level

---

**Q14: How would you structure React Query in a large-scale application?**

1. **Custom hooks per domain**: Encapsulate queries/mutations in hooks (`useTodos`, `useCreateTodo`). Components never call `useQuery` directly.
2. **Query key factory**: Centralize key definitions to prevent typos and enable type safety.
   ```ts
   export const todoKeys = {
     all: ['todos'] as const,
     lists: () => [...todoKeys.all, 'list'] as const,
     list: (filters: Filters) => [...todoKeys.lists(), filters] as const,
     details: () => [...todoKeys.all, 'detail'] as const,
     detail: (id: string) => [...todoKeys.details(), id] as const,
   };
   ```
3. **Prefetching on hover/focus**: Use `queryClient.prefetchQuery` to start loading before the user navigates.
4. **Suspense boundaries**: Group queries under `<Suspense>` boundaries for cleaner loading states.
5. **Error boundaries**: Use `throwOnError` per-query or globally for error handling.

---

**Q15: How does React Query handle request deduplication?**

If multiple components mount simultaneously and call `useQuery` with the same query key, React Query fires **only one** network request. All components subscribe to the same cache entry and re-render when data arrives.

```tsx
// Both of these fire ONE request, not two
function Header() {
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUser });
  return <span>{user?.name}</span>;
}

function Sidebar() {
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUser });
  return <span>{user?.email}</span>;
}
```

The deduplication window lasts while the query is fetching. After it resolves, a new mount may trigger a refetch if data is stale.

---

**Q16: Compare React Query's cache with Redux store for the same data flow.**

```
                    Redux                          React Query
                    -----                          -----------
Fetch trigger:      dispatch(action)               useQuery auto-fetches
Dedup:              manual check                   automatic by key
Loading state:      manual flag in slice           isPending / isFetching
Cache storage:      reducer state                  internal Map by key
Cache lifetime:     forever (until manual clear)   gcTime (auto cleanup)
Staleness:          no concept                     staleTime (auto refetch)
Background sync:    manual saga/interval           window focus, mount, interval
Invalidation:       dispatch + refetch manually    invalidateQueries (fuzzy match)
Optimistic update:  manual in reducer              onMutate + rollback pattern
Devtools:           action log + state tree        query list + cache viewer
```

---

**Q17: You have a page with 10 different API calls. How would you handle loading states?**

Three strategies depending on UX requirements:

1. **Independent loading** — Each section shows its own skeleton. Best for dashboards where sections load independently.
   ```tsx
   function Dashboard() {
     const kpis = useQuery({ queryKey: ['kpis'], queryFn: fetchKPIs });
     const alerts = useQuery({ queryKey: ['alerts'], queryFn: fetchAlerts });
     // Each renders its own isPending state
   }
   ```

2. **Grouped Suspense boundaries** — Related queries grouped under Suspense. Shows one skeleton for the group.
   ```tsx
   <Suspense fallback={<DashboardSkeleton />}>
     <KPIs />
     <Alerts />
   </Suspense>
   ```

3. **Wait for all** — Use `useQueries` and derive combined loading state.
   ```tsx
   const results = useQueries({ queries: [...] });
   const isAnyLoading = results.some(r => r.isPending);
   ```

---

**Q18: How would you migrate a Redux-based data fetching flow to React Query?**

Step-by-step:
1. Keep the existing Redux slice working
2. Create a custom hook wrapping `useQuery` that calls the same API endpoint
3. Replace component's `useSelector` + `dispatch` with the new hook
4. Verify behavior is identical (loading, error, data)
5. Remove the Redux actions, saga handlers, and reducer cases for that data
6. If no more actions remain in the slice, remove the entire slice

Key migration gotchas:
- Redux state is global (singleton). React Query cache is per QueryClient instance. Make sure you have one QueryClient at the top of the app.
- Redux data persists forever. React Query garbage collects. Set appropriate `gcTime` if you need data to survive longer.
- Redux sagas can orchestrate complex flows. Don't migrate those — keep sagas for orchestration, use RQ for the data fetching part.

---

**Q19: How does React Query handle offline scenarios?**

React Query has built-in network-aware behavior:
1. **Online/offline detection**: Pauses queries automatically when the browser goes offline
2. **`networkMode` option**:
   - `'online'` (default): Queries only fire when online. Paused offline.
   - `'always'`: Always fires (useful for ServiceWorker/local-first apps)
   - `'offlineFirst'`: Tries cache first, then network
3. **Retry on reconnect**: Paused queries automatically retry when the browser comes back online
4. **Mutations while offline**: Mutations can be paused and resumed. Combined with the `onMutate` optimistic update pattern, users can continue working offline.

---

**Q20: What is the difference between `queryClient.fetchQuery` and `queryClient.prefetchQuery`?**

| | `fetchQuery` | `prefetchQuery` |
|---|---|---|
| Returns | `Promise<TData>` — resolves with data | `Promise<void>` — never throws |
| On error | Throws the error | Silently catches (logs to console) |
| Use case | Need the data imperatively (e.g., in a route loader) | Warm the cache ahead of time (e.g., on hover) |
| Cache behavior | Same as useQuery — respects staleTime, deduplicates | Same |

```ts
// In a route loader (need data before rendering)
const data = await queryClient.fetchQuery({
  queryKey: ['todo', id],
  queryFn: () => fetchTodo(id),
});

// On link hover (warm cache, don't care about errors)
queryClient.prefetchQuery({
  queryKey: ['todo', id],
  queryFn: () => fetchTodo(id),
});
```

---

**Q21: You need to show real-time data (updates every second) for 100 items. Would you use React Query polling or something else?**

For 100 items updating every second, polling with React Query would mean 100 requests/second (or 1 bulk request/second). This works but has tradeoffs:

- **Polling (React Query)**: Simple, works. Set `refetchInterval: 1000`. Best if the backend supports a bulk endpoint that returns all 100 items in one call.
- **WebSocket / SSE**: Better for true real-time. Server pushes updates only when data changes. Use `queryClient.setQueryData` inside the socket handler to update the React Query cache — components re-render automatically.
- **Hybrid**: Initial data via React Query, live updates via WebSocket feeding into the same cache keys.

```ts
// WebSocket -> React Query cache bridge
useEffect(() => {
  const ws = new WebSocket('ws://...');
  ws.onmessage = (event) => {
    const updated = JSON.parse(event.data);
    queryClient.setQueryData(['items', updated.id], updated);
  };
  return () => ws.close();
}, []);
```

This gives you the best of both: React Query handles initial load, caching, and error states. WebSocket handles real-time updates. Components just use `useQuery` and don't know where the data came from.

---

**Q22: How do you test components that use React Query?**

1. **Wrap in QueryClientProvider** with a fresh client per test:
   ```tsx
   function createTestClient() {
     return new QueryClient({
       defaultOptions: {
         queries: { retry: false },
       },
     });
   }

   function renderWithQuery(ui: ReactElement) {
     const client = createTestClient();
     return render(
       <QueryClientProvider client={client}>{ui}</QueryClientProvider>
     );
   }
   ```

2. **Mock the API layer** (not React Query itself):
   ```ts
   vi.mock('@/lib/api', () => ({
     fetchTodos: vi.fn().mockResolvedValue([{ id: 1, title: 'Test' }]),
   }));
   ```

3. **Wait for loading to complete**:
   ```tsx
   renderWithQuery(<TodoList />);
   expect(screen.getByText('Loading...')).toBeInTheDocument();
   await waitFor(() => {
     expect(screen.getByText('Test')).toBeInTheDocument();
   });
   ```

---

**Q23: What are `QueryCache` and `MutationCache`, and when would you use them?**

They are the low-level stores that `QueryClient` uses internally. You'd interact with them directly for **global** side effects:

```ts
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Global error handler for ALL queries
      if (error.status === 401) redirectToLogin();
      toast.error(`Something went wrong: ${error.message}`);
    },
    onSuccess: (data, query) => {
      // Global success handler
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      // Global mutation error handler
      toast.error('Failed to save');
    },
  }),
});
```

This is cleaner than adding `onError` to every individual query/mutation — handles cross-cutting concerns like auth redirects and error toasts in one place.

---

## Quick Reference Card

```
+-------------------------------------------------------------+
|                    TanStack Query Cheat Sheet                |
+-------------------------------------------------------------+
|                                                             |
|  READ:   useQuery({ queryKey, queryFn })                    |
|  WRITE:  useMutation({ mutationFn, onSuccess })             |
|  MANY:   useQueries({ queries: [...] })                     |
|  PAGES:  useInfiniteQuery({ queryKey, queryFn,              |
|            getNextPageParam })                               |
|                                                             |
|  INVALIDATE:  queryClient.invalidateQueries({ queryKey })   |
|  SET CACHE:   queryClient.setQueryData(key, updater)        |
|  GET CACHE:   queryClient.getQueryData(key)                 |
|  PREFETCH:    queryClient.prefetchQuery({ queryKey, fn })   |
|  REMOVE:      queryClient.removeQueries({ queryKey })       |
|                                                             |
|  KEY OPTIONS:                                               |
|    staleTime        - how long data stays fresh             |
|    gcTime           - how long unused data stays in memory  |
|    retry            - number of retries on failure          |
|    enabled          - conditional fetching                  |
|    select           - transform data (memoized)             |
|    refetchInterval  - polling interval                      |
|    placeholderData  - show while loading                    |
|    throwOnError     - throw for error boundaries            |
|                                                             |
|  STATUS:                                                    |
|    isPending  - no cached data yet                          |
|    isFetching - request in flight (including bg refetch)    |
|    isLoading  - isPending + isFetching (first load)         |
|    isStale    - past staleTime                              |
|    isError    - failed (retries exhausted)                  |
|    isSuccess  - data available                              |
|                                                             |
+-------------------------------------------------------------+
```

---

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest) — Official docs and guides
- [TanStack Query API Reference](https://tanstack.com/query/latest/docs/reference/useQuery) — Complete API reference
- [TanStack Query GitHub](https://github.com/TanStack/query) — Source code and examples

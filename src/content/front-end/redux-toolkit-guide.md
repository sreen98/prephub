# Redux (Redux Toolkit) — Complete Guide

## Table of Contents

- [1. What is Redux?](#1-what-is-redux)
- [2. Core Principles](#2-core-principles)
- [3. Redux Toolkit Setup](#3-redux-toolkit-setup)
- [4. Slices](#4-slices)
- [5. Store](#5-store)
- [6. Selectors](#6-selectors)
- [7. Async Logic (Thunks)](#7-async-logic-thunks)
- [8. React Integration](#8-react-integration)
- [9. Middleware](#9-middleware)
- [10. RTK Query](#10-rtk-query)
- [11. Patterns and Best Practices](#11-patterns-and-best-practices)
- [12. Testing](#12-testing)
- [13. Interview Questions & Answers](#13-interview-questions-answers)
- [14. Tricky Output Questions](#14-tricky-output-questions)

---

## 1. What is Redux?

Redux is a library for keeping the state that many parts of your app share (the logged-in user, a cart, filters) in **one central object, the store**. You cannot edit the store directly: you send it an *action* (a plain object saying what happened), and a *reducer* function decides the new state. Because every change goes through that one door, you can always answer "what changed this, and when?", which is what people mean when they call Redux "predictable".

**Redux Toolkit (RTK)** is the official, recommended way to write Redux today. Plain Redux needed a lot of hand-written setup (action type constants, action creator functions, copy-everything immutable updates); RTK generates most of that for you and turns on safety checks by default.

```bash
npm install @reduxjs/toolkit react-redux
```

---

## 2. Core Principles

### 2.1 Three Principles

```
1. Single source of truth
   → One store holds the entire application state

2. State is read-only
   → Only way to change state is to dispatch an action

3. Changes are made with pure functions
   → Reducers take (state, action) and return new state (no mutations)
```

### 2.2 Data Flow

```
                    ┌──────────┐
         dispatch   │          │  subscribe
   UI ──────────> Action ──> Store ──────────> UI
                    │          │
                    │  Reducer │
                    │ (state,  │
                    │  action) │
                    │  => new  │
                    │  state   │
                    └──────────┘

1. User clicks button → component dispatches an action
2. Action goes to the store
3. Store calls the reducer with current state + action
4. Reducer returns new state
5. Store updates, notifies subscribers
6. UI re-renders with new state
```

### 2.3 Key Terminology

```
Store      — Single object holding the entire app state
Action     — Plain object { type: string, payload?: any } describing what happened
Reducer    — Pure function (state, action) => newState
Dispatch   — Method to send actions to the store
Selector   — Function to extract data from the store
Slice      — Collection of reducer logic and actions for a single feature (RTK concept)
Middleware — Code that runs between dispatch and reducer (for side effects)
```

---

## 3. Redux Toolkit Setup

### 3.1 Minimal Setup

```ts
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counter.slice';
import usersReducer from './users.slice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```tsx
// main.tsx
import { Provider } from 'react-redux';
import { store } from './store';

<Provider store={store}>
  <App />
</Provider>
```

### 3.2 Typed Hooks

```ts
// hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

---

## 4. Slices

A slice is a collection of Redux reducer logic and actions for a single feature.

### 4.1 Basic Slice

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
  step: number;
}

const initialState: CounterState = {
  value: 0,
  step: 1,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value += state.step;           // Immer allows "mutation" syntax
    },
    decrement(state) {
      state.value -= state.step;
    },
    incrementByAmount(state, action: PayloadAction<number>) {
      state.value += action.payload;
    },
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    reset() {
      return initialState;                 // return new state to replace entirely
    },
  },
});

// Export actions (auto-generated action creators)
export const { increment, decrement, incrementByAmount, setStep, reset } = counterSlice.actions;

// Export reducer
export default counterSlice.reducer;
```

### 4.2 Slice with Prepare Callback

A reducer must be pure: the same state and action must always give the same result. So it must not call `crypto.randomUUID()` or `new Date()` itself. The `prepare` callback is where that work goes: it runs when the action is *created*, builds the payload (id, timestamp, defaults), and the reducer then just stores what it is given. It also lets callers pass simple arguments (`addTodo('Buy milk')`) instead of a full object.

```ts
const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    addTodo: {
      reducer(state, action: PayloadAction<Todo>) {
        state.push(action.payload);
      },
      prepare(title: string) {
        return {
          payload: {
            id: crypto.randomUUID(),
            title,
            completed: false,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },
  },
});

// Usage: dispatch(addTodo('Buy milk'))
// Action: { type: 'todos/addTodo', payload: { id: '...', title: 'Buy milk', ... } }
```

### 4.3 Immer (Built-in Immutable Updates)

Redux state must never be changed in place; each update has to produce a new object, because React-Redux detects changes by comparing object references. Doing that by hand means spreading every level you touch. **Immer** is a small library RTK uses inside `createSlice`: it hands your reducer a *draft* (a stand-in copy that records every change you make to it), and when your reducer finishes it builds a new state from those changes, reusing every part you did not touch. So you can write "mutating" code and still get an immutable update:

```ts
// These are equivalent:

// "Mutating" syntax (Immer — recommended)
const mutatingReducers = {
  updateUser(state, action: PayloadAction<Partial<User>>) {
    Object.assign(state.user, action.payload);
  },
  addItem(state, action: PayloadAction<Item>) {
    state.items.push(action.payload);
  },
  removeItem(state, action: PayloadAction<string>) {
    const index = state.items.findIndex(i => i.id === action.payload);
    if (index !== -1) state.items.splice(index, 1);
  },
};

// Immutable syntax (manual — more verbose)
const immutableReducers = {
  updateUser(state, action) {
    return { ...state, user: { ...state.user, ...action.payload } };
  },
  addItem(state, action) {
    return { ...state, items: [...state.items, action.payload] };
  },
};
```

### 4.4 Extra Reducers (Handle External Actions)

`reducers` defines actions that the slice *owns*: RTK generates an action creator for each. `extraReducers` is for reacting to actions defined *elsewhere*, most often the `pending` / `fulfilled` / `rejected` actions of an async thunk (§7), or another slice's action (for example, clearing data on `auth/logout`). No action creators are generated here, because the actions already exist.

```ts
const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [] as User[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed';
      });
  },
});
```

---

## 5. Store

### 5.1 configureStore

```ts
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    jobs: jobsReducer,
    conversation: conversationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,                        // disable thunks if using sagas
      serializableCheck: {
        ignoredActions: ['some/action'],   // ignore non-serializable check
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

sagaMiddleware.run(rootSaga);
```

### 5.2 Store Methods

```ts
store.getState();                          // get current state
store.dispatch(action);                    // dispatch an action
store.subscribe(listener);                 // listen for changes (returns unsubscribe fn)
```

---

## 6. Selectors

Selectors are functions that extract and derive data from the store.

### 6.1 Basic Selectors

```ts
// Simple selectors (inline)
const selectUsers = (state: RootState) => state.users.items;
const selectUsersLoading = (state: RootState) => state.users.loading;
const selectUserById = (state: RootState, userId: string) =>
  state.users.items.find(u => u.id === userId);
```

### 6.2 Memoized Selectors (createSelector)

A selector that builds a new array or object (`filter`, `map`, `{ ...x }`) returns a new reference on every call, and `useSelector` compares with `===`, so the component would re-render after every dispatch even when nothing it shows changed. `createSelector` fixes that: it remembers its last inputs and result, and only re-runs the derivation when an input selector returns a different reference. Otherwise it hands back the same result object. Since Reselect 5 (bundled with RTK 2) the default cache is keyed on the arguments you call the selector with, so a parameterized selector such as `selectUserById(state, id)` keeps a separate result per `id` instead of recomputing each time the id changes (Reselect 4 held only the last call).

```ts
import { createSelector } from '@reduxjs/toolkit';

// Memoized: recomputes only when input selectors change
const selectActiveUsers = createSelector(
  [(state: RootState) => state.users.items],
  (users) => users.filter(u => u.isActive)
);

// Multiple inputs
const selectFilteredUsers = createSelector(
  [
    (state: RootState) => state.users.items,
    (state: RootState) => state.users.filter,
  ],
  (users, filter) => {
    if (!filter) return users;
    return users.filter(u => u.name.includes(filter));
  }
);

// Parameterized selector
const selectUserById = createSelector(
  [(state: RootState) => state.users.items, (_state: RootState, userId: string) => userId],
  (users, userId) => users.find(u => u.id === userId)
);

// Usage
const user = useAppSelector(state => selectUserById(state, '123'));
```

### 6.3 Selector Composition

```ts
const selectUsers = (state: RootState) => state.users.items;
const selectFilter = (state: RootState) => state.users.filter;

const selectActiveUsers = createSelector(
  [selectUsers],
  (users) => users.filter(u => u.isActive)
);

const selectFilteredActiveUsers = createSelector(
  [selectActiveUsers, selectFilter],
  (activeUsers, filter) => {
    if (!filter) return activeUsers;
    return activeUsers.filter(u => u.name.includes(filter));
  }
);

const selectUserCount = createSelector(
  [selectFilteredActiveUsers],
  (users) => users.length
);
```

---

## 7. Async Logic (Thunks)

### 7.1 createAsyncThunk

```ts
import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getUsers();
      return response.data;                // becomes action.payload in fulfilled
    } catch (error) {
      return rejectWithValue(error.message); // becomes action.payload in rejected
    }
  }
);

// With arguments
export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId: string) => {
    const response = await api.getUser(userId);
    return response.data;
  }
);

// With conditions (skip if already fetched)
export const fetchUsersV2 = createAsyncThunk(
  'users/fetchUsersV2',
  async () => await api.getUsers(),
  {
    condition: (_, { getState }) => {
      const { users } = getState() as RootState;
      if (users.items.length > 0) return false; // skip
    },
  }
);
```

### 7.2 Handling Thunk States

```ts
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [] as User[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
```

### 7.3 Dispatching Thunks

```tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchUsers, createUser, selectUsers, selectUsersLoading } from './users.slice';

function UserList() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectUsers);
  const loading = useAppSelector(selectUsersLoading);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // With unwrap (get the result or throw)
  const handleCreate = async () => {
    try {
      const user = await dispatch(createUser(data)).unwrap();
      console.log('Created:', user);
    } catch (err) {
      console.error('Failed:', err);
    }
  };
}
```

---

## 8. React Integration

Components talk to the store through two hooks from `react-redux`: `useSelector` reads a value and re-renders the component when that value changes, and `useDispatch` returns the function that sends actions. The examples below use the typed `useAppSelector` / `useAppDispatch` from §3.2, which are the same hooks with your `RootState` and `AppDispatch` types attached. They are single files from a larger app, so they import their slices and helpers rather than running on their own.

### 8.1 useSelector

```tsx
import { useAppSelector } from './hooks';
import { selectActiveUsers } from './users.slice';
import { Spinner } from './Spinner';

function UserProfile() {
  // Subscribes to store, re-renders when selected value changes
  const user = useAppSelector(state => state.auth.user);
  const isLoading = useAppSelector(state => state.auth.loading);

  // With memoized selector
  const activeUsers = useAppSelector(selectActiveUsers);

  if (isLoading) return <Spinner />;
  return <div>{user?.name}</div>;
}
```

### 8.2 useDispatch

```tsx
import { useAppDispatch } from './hooks';
import { loginRequest, type LoginData } from './auth.slice';

function LoginForm() {
  const dispatch = useAppDispatch();

  const handleSubmit = (data: LoginData) => {
    dispatch(loginRequest(data));
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 8.3 Component Pattern

```tsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchTodos, toggleTodo, deleteTodo, selectTodos, selectFilter, selectTodosLoading } from './todos.slice';
import { Spinner } from './Spinner';
import { TodoItem } from './TodoItem';

function TodoList() {
  const dispatch = useAppDispatch();
  const todos = useAppSelector(selectTodos);
  const filter = useAppSelector(selectFilter);
  const loading = useAppSelector(selectTodosLoading);

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  const handleToggle = (id: string) => {
    dispatch(toggleTodo(id));
  };

  const handleDelete = (id: string) => {
    dispatch(deleteTodo(id));
  };

  if (loading) return <Spinner />;

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}
```

---

## 9. Middleware

Middleware sits between dispatch and reducer, enabling side effects.

### 9.1 Custom Middleware

```ts
import { Middleware } from '@reduxjs/toolkit';

// Logger middleware
const logger: Middleware = (store) => (next) => (action) => {
  console.log('Dispatching:', action.type);
  const result = next(action);                // pass to next middleware/reducer
  console.log('Next state:', store.getState());
  return result;
};

// Crash reporter
const crashReporter: Middleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    console.error('Caught an exception!', err);
    reportToService(err, { action, state: store.getState() });
    throw err;
  }
};

// Add to store
configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger, crashReporter),
});
```

### 9.2 Listener Middleware (Built-in)

The listener middleware is RTK's built-in way to say "when this action happens (or when state changes like this), run this side effect". Reducers cannot do side effects (writing to storage, dispatching a follow-up fetch), and putting them in components scatters them; a listener keeps each reaction in one place, written with ordinary `async`/`await`.

```ts
import { createListenerMiddleware } from '@reduxjs/toolkit';

const listenerMiddleware = createListenerMiddleware();

// Listen for specific action
listenerMiddleware.startListening({
  actionCreator: loginSuccess,
  effect: async (action, listenerApi) => {
    // Side effect after login
    const user = action.payload;
    localStorage.setItem('user', JSON.stringify(user));
    listenerApi.dispatch(fetchUserPreferences(user.id));
  },
});

// Listen with condition
listenerMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    return currentState.cart.total !== previousState.cart.total;
  },
  effect: async (action, listenerApi) => {
    // Cart total changed — recalculate shipping
    const cart = listenerApi.getState().cart;
    listenerApi.dispatch(calculateShipping(cart));
  },
});
```

---

## 10. RTK Query

RTK Query is a data fetching and caching tool built into Redux Toolkit. You describe your API endpoints once, and it generates a React hook per endpoint that handles loading, error and cached data for you, so you stop hand-writing `loading`/`error`/`items` fields and thunks for every request.

Cache freshness works through **tags**: a query says which data it *provides* (`providesTags: ['User']`), and a mutation says which data it makes stale (`invalidatesTags: ['User']`). When the mutation succeeds, every query holding a matching tag refetches automatically.

### 10.1 API Definition

```ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Post'],              // for cache invalidation
  endpoints: (builder) => ({
    // Query (GET)
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Mutation (POST/PUT/DELETE)
    createUser: builder.mutation<User, CreateUserInput>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],           // refetch user list after create
    }),

    updateUser: builder.mutation<User, { id: string; body: Partial<User> }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = apiSlice;
```

### 10.2 Using RTK Query Hooks

```tsx
import { useGetUsersQuery, useCreateUserMutation } from './api.slice';
import { Spinner } from './Spinner';
import { ErrorMessage } from './ErrorMessage';

function UserList() {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage />;

  return (
    <>
      <button onClick={() => createUser({ name: 'New User' })} disabled={isCreating}>
        Add User
      </button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </>
  );
}
```

---

## 11. Patterns and Best Practices

### 11.1 Feature-Based Structure

```
src/store/
  auth/
    auth.slice.ts
    auth.selectors.ts
    auth.types.ts
    index.ts                 // barrel export
  users/
    users.slice.ts
    users.selectors.ts
    users.types.ts
    index.ts
  root-reducer.ts
  root-saga.ts               // if using sagas
  hooks.ts                   // typed useAppDispatch, useAppSelector
  index.ts                   // store configuration
```

### 11.2 Normalizing State

```json
// BAD: nested/duplicated data
{
  users: [
    { id: '1', name: 'Alice', posts: [{ id: 'p1', title: '...' }] }
  ]
}

// GOOD: normalized (flat, by ID)
{
  users: {
    ids: ['1', '2'],
    entities: {
      '1': { id: '1', name: 'Alice', postIds: ['p1'] },
      '2': { id: '2', name: 'Bob', postIds: ['p2'] },
    }
  },
  posts: {
    ids: ['p1', 'p2'],
    entities: {
      'p1': { id: 'p1', title: '...', authorId: '1' },
      'p2': { id: 'p2', title: '...', authorId: '2' },
    }
  }
}
```

RTK provides `createEntityAdapter` for this:

```ts
const usersAdapter = createEntityAdapter<User>();

const usersSlice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState({ loading: false }),
  reducers: {
    addUser: usersAdapter.addOne,
    addUsers: usersAdapter.addMany,
    updateUser: usersAdapter.updateOne,
    removeUser: usersAdapter.removeOne,
  },
});

// Auto-generated selectors
const { selectAll, selectById, selectIds } = usersAdapter.getSelectors(
  (state: RootState) => state.users
);
```

### 11.3 What Belongs in Redux

| In Redux | Not in Redux |
|----------|-------------|
| Shared across many components | Local to one component |
| Needs to survive navigation | Lost on unmount is fine |
| Complex update logic | Simple toggle/input |
| Server cache (or use React Query) | Form state (use React Hook Form) |

### 11.4 Performance: Finding and Fixing Over-Rendering

A Redux store is one object, and **every connected component re-runs its selector on every dispatched action**. That is cheap as long as each selector returns the *same reference* when nothing it reads has changed, because `useSelector` compares the new result with the previous one using `===` and skips the re-render when they match. Almost every Redux performance problem is a selector that breaks that rule.

**1. Measure before changing anything.** Record a real interaction (typing in a filter, switching a tab) in the React DevTools Profiler, not the initial page load, and turn on *Record why each component rendered while profiling* in its settings. Components that re-render with "hook changed" after a dispatch that has nothing to do with them are the ones to fix.

**2. Derived data goes through `createSelector`.** `state.orders.filter(...)` inside `useSelector` allocates a new array on every dispatch, so the component re-renders on every action in the app (tricky Q5). A memoized selector (§6.2) returns the cached array until `orders` or the filter actually changes.

**3. Know what the memoization cache holds.** Since Reselect 5 (RTK 2), `createSelector` uses `weakMapMemoize` by default, which keeps a result for **every** set of arguments it has seen, so `selectOrderById(state, id)` called by fifty rows no longer evicts itself; the old advice to create one selector instance per component with `useMemo` was a Reselect 4 workaround. The flip side is that the cache is unbounded for arguments that keep changing (ids, timestamps, offsets). For those, give the selector a bounded cache:

```ts
import { createSelector, lruMemoize } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Keeps the 50 most recent (state, since) combinations and evicts the oldest,
// instead of growing forever as `since` changes every few seconds.
export const selectEventsSince = createSelector(
  [(s: RootState) => s.events.items, (_s: RootState, since: number) => since],
  (items, since) => items.filter((e) => e.at >= since),
  { memoize: lruMemoize, memoizeOptions: { maxSize: 50 } },
);
```

**4. Select the smallest thing, or compare shallowly.** A selector that returns an object built on the spot (`state => ({ name: state.user.name, plan: state.user.plan })`) is a new reference every time. Either call `useSelector` once per value, or pass `shallowEqual` from `react-redux` as the second argument so equal fields count as equal.

**5. RTK Query: cache on purpose.**

- **Requests are shared.** Components that call the same endpoint with the same arguments share one cache entry and one request in flight, so a query hook in ten components is not ten fetches. Do not copy the result into local state or a slice; read it from the hook.
- **`keepUnusedDataFor`** (default 60 seconds) is how long a result stays cached after the last component using it unmounts. Set it per endpoint: reference data such as currencies or roles can stay for the session, while a live feed should expire quickly.
- **Tag at the level of one item** (`{ type: 'Order', id }`, plus a `{ type: 'Order', id: 'LIST' }` tag for the list itself), so editing one order refetches that order and the list, not every order query on the page.
- **`selectFromResult`** lets a component subscribe to part of a query's result, such as one row, so it re-renders only when that part changes:

```ts
const { order } = useGetOrdersQuery(status, {
  selectFromResult: ({ data }) => ({ order: data?.find((o) => o.id === id) }),
});
```

**6. Normalise lists that are updated by id** with `createEntityAdapter` (§11.2), so updating one entity replaces one object and the rows showing other entities keep their references.

---

## 12. Testing

### 12.1 Testing Slices

```ts
import counterReducer, { increment, decrement, incrementByAmount } from './counter.slice';

describe('counterSlice', () => {
  const initialState = { value: 0, step: 1 };

  it('should return initial state', () => {
    expect(counterReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('should increment', () => {
    const state = counterReducer(initialState, increment());
    expect(state.value).toBe(1);
  });

  it('should increment by amount', () => {
    const state = counterReducer(initialState, incrementByAmount(5));
    expect(state.value).toBe(5);
  });
});
```

### 12.2 Testing Selectors

```ts
import { selectActiveUsers, selectUserCount } from './users.selectors';

describe('selectActiveUsers', () => {
  it('should return only active users', () => {
    const state = {
      users: {
        items: [
          { id: '1', name: 'Alice', isActive: true },
          { id: '2', name: 'Bob', isActive: false },
        ],
      },
    } as RootState;

    expect(selectActiveUsers(state)).toEqual([
      { id: '1', name: 'Alice', isActive: true },
    ]);
  });
});
```

### 12.3 Testing Components with Redux

```tsx
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

function renderWithStore(ui: React.ReactElement, preloadedState?: Partial<RootState>) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });
  return render(<Provider store={store}>{ui}</Provider>);
}

test('shows user name', () => {
  renderWithStore(<UserProfile />, {
    auth: { user: { name: 'Alice' }, loading: false, error: null },
  });
  expect(screen.getByText('Alice')).toBeInTheDocument();
});
```

---

## 13. Interview Questions & Answers

### Beginner

---

**Q1: What is Redux, and what problem does it solve?**

**Short answer:** Redux keeps shared application state in **one store**, and allows it to change in only **one way**: by dispatching an *action* (a plain object describing what happened) that a *reducer* (a pure function) turns into the next state. The problem it solves is not "where do I put data" but "**who changed this, and when?**"

**The problem, concretely.** In a growing React app, the same data (the logged-in user, the cart, a list of notifications) is needed by components far apart in the tree. Without a pattern for it, you get three symptoms:

- **Prop drilling:** the data is passed through five components that do not use it, just to reach one that does.
- **Scattered updates:** any component holding a setter can change the data, in any way, at any time. When the cart total is wrong, there are twenty places to look.
- **Unpredictable timing:** several updates in flight, and no record of the order they happened in.

**What Redux changes.** Components no longer change shared data themselves. They *describe* what happened, `{ type: 'cart/itemAdded', payload: { id: 7 } }`, and the reducer is the only code that decides what that means. So:

- Every change is an event you can log, replay and inspect. Redux DevTools shows each action and the state before and after it, and can step backwards ("time travel").
- Reducers are pure functions, so the logic is trivial to unit-test: state in, action in, state out.
- Any component can read exactly the slice it needs with `useSelector`, and re-renders only when that slice changes.
- Side effects (API calls) have a defined home in middleware (thunks, listeners, sagas), rather than being mixed into components.

**When you do not need it.** Data from the server belongs in a query cache (RTK Query or TanStack Query), which handles loading, caching and refetching; hand-writing that in Redux was the most common misuse. Local UI state (is this dropdown open) belongs in the component. What is left for Redux is **client state shared widely, with non-trivial update rules**: a multi-step editor, a cart with pricing rules, a complex filter panel. If that set is small, Context or Zustand is simpler (Q10).

---

**Q2: What is an action in Redux?**

An action is a plain JavaScript object with a `type` field describing what happened, and an optional `payload` with data:

```json
{ type: 'todos/addTodo', payload: { title: 'Buy milk' } }
```

Action creators are functions that return actions:
```ts
const addTodo = (title: string) => ({ type: 'todos/addTodo', payload: { title } });
```

RTK's `createSlice` auto-generates action creators from reducer names.

---

**Q3: What is a reducer?**

A reducer is a pure function that takes the current state and an action, and returns new state:

```ts
function counterReducer(state = 0, action) {
  switch (action.type) {
    case 'increment': return state + 1;
    case 'decrement': return state - 1;
    default: return state;
  }
}
```

Rules: no mutations (return new state), no side effects, no random values. Given the same input, always return the same output.

**Why those rules exist.** A reducer that always gives the same output for the same input can be unit-tested with no mocks, and Redux DevTools can replay a list of actions and get exactly the same states back ("time travel"). An API call or `Math.random()` inside a reducer breaks both: replaying would fire the request again or produce a different state. Side effects belong in thunks or middleware instead.

---

**Q4: What is Redux Toolkit and why use it over plain Redux?**

Redux Toolkit (RTK) is the official recommended approach. It solves common complaints:

| Problem with plain Redux | RTK Solution |
|--------------------------|-------------|
| Too much boilerplate | `createSlice` generates actions + reducer |
| Complex store setup | `configureStore` handles defaults |
| Manual immutable updates | Immer built-in (write "mutable" code) |
| No standard async pattern | `createAsyncThunk` for thunks |
| No data fetching | RTK Query built-in |
| Accidental mutations | Immer prevents real mutations |

---

**Q5: What is the difference between `useSelector` and `useDispatch`?**

- `useSelector(selectorFn)`: Reads data from the Redux store. Component re-renders when the selected value changes.
- `useDispatch()`: Returns the `dispatch` function. Used to send actions to the store.

```tsx
const count = useSelector(state => state.counter.value);  // read
const dispatch = useDispatch();
dispatch(increment());                                      // write
```

---

### Intermediate

---

**Q6: How does immutability work in Redux? Why is it important?**

**Short answer:** every update must produce a *new* object or array instead of changing the existing one, because Redux and React-Redux decide "did anything change?" by comparing references, not contents.

1. **Change detection**: `useSelector` compares the old and new selected values with `===`. If you mutate an object in place, it is still the same object, so `===` says "unchanged" and the component never re-renders: the UI shows stale data with no error.
2. **Predictability**: if two parts of the app hold the same object and one mutates it, the other sees the change without any action being dispatched. Immutable updates make every change go through a reducer, where you can see it.
3. **Time-travel debugging**: because old state objects are never modified, DevTools can keep each one as a snapshot and jump back to it. A mutation would silently rewrite the history too.

RTK's Immer library lets you write "mutating" code that actually produces immutable updates:
```ts
// Looks like mutation, but Immer makes it immutable
state.user.name = 'Alice';
state.items.push(newItem);
```

---

**Q7: Explain `createSelector` and memoization.**

**Short answer:** *memoization* means caching a function's result and returning the cached result when it is called again with the same inputs. `createSelector` builds a selector that does this: it runs its *input selectors* (small functions that pull raw values out of state), and only re-runs the expensive part when one of those raw values is a different reference from last time.

```ts
const selectActiveUsers = createSelector(
  [state => state.users.items],
  (users) => users.filter(u => u.isActive)  // only runs when users changes
);
```

Without memoization, `users.filter(...)` runs every time the selector is called (after every dispatch), and returns a new array each time. `useSelector` compares results with `===`, a new array never equals the old one, so the component re-renders even when the list of active users has not changed.

With `createSelector`, the filtered array is cached — if `users` hasn't changed, the same array reference is returned.

---

**Q8: What is middleware in Redux? Give examples.**

**Short answer:** middleware is a function that every dispatched action passes through *before* it reaches the reducer. Each one can look at the action, change it, stop it, or do something extra (log it, call an API, report an error), then hand it on with `next(action)`. It exists because reducers must stay pure, so anything with a side effect needs somewhere else to live.

```ts
// Middleware signature
const middleware = (store) => (next) => (action) => {
  // Before reducer
  console.log('Action:', action.type);
  const result = next(action);              // call next middleware/reducer
  // After reducer
  console.log('New state:', store.getState());
  return result;
};
```

The three nested functions look odd but each has a job: the outer one receives the store once at setup, the middle one receives `next` (the next middleware in the chain, or the reducer at the end), and the inner one runs for every action.

Built-in RTK middleware: `thunk` (lets you dispatch a function that does async work and dispatches real actions later), plus the development-only `serializableCheck` and `immutableCheck`, which warn when you put a non-plain value in state or mutate it.
Common third-party: `redux-saga` (complex async workflows written with generator functions), `redux-logger` (logs each action and the state before and after).

---

**Q9: What is `createAsyncThunk` and how does it work?**

A *thunk* is a function you dispatch instead of a plain action object; the thunk middleware calls it, so it can `await` an API call and then dispatch real actions with the result. `createAsyncThunk` builds one for you and dispatches three actions automatically around your async function: `pending` before it runs, then `fulfilled` if it resolves or `rejected` if it throws.

```ts
const fetchUsers = createAsyncThunk('users/fetch', async () => {
  const response = await api.getUsers();
  return response.data;
});
// Dispatches:
// 1. users/fetch/pending
// 2. users/fetch/fulfilled (with data)
// OR users/fetch/rejected (with error)
```

You handle these in `extraReducers` to update loading/data/error state. This eliminates the boilerplate of manually creating three action types for every async operation.

---

**Q10: When would you choose Redux over Context API?**

**Short answer:** Context is a way to *pass* a value down the tree without props; it is not a state manager, and every component that reads a context re-renders whenever its value changes. Choose Redux when shared state changes often, has non-trivial update rules, or needs async side effects and debugging tools. For values that rarely change (theme, current user, locale), Context is enough.

| Use Case | Context | Redux |
|----------|---------|-------|
| Simple shared state (theme, auth) | Best | Overkill |
| Frequent updates | Causes re-renders in all consumers | Selectors prevent unnecessary re-renders |
| Complex state logic | useReducer works but no devtools | Full devtools, middleware, time-travel |
| Many state slices | Multiple providers (nesting hell) | Single store, clean separation |
| Async side effects | Manual | Thunks, Sagas, Listener middleware |
| Team size | Small teams | Large teams (enforced patterns) |

The row that decides most cases is "frequent updates". Context re-renders ALL consumers when its value changes, even those that only use one field of it. Redux + `useSelector` lets each component subscribe to exactly the piece it reads, and it re-renders only when that SELECTED value changes. The "team size" row is about conventions: Redux gives a large team one agreed place and shape for shared state, which Context does not.

---

### Advanced

---

**Q11: Explain the Redux Toolkit listener middleware vs Redux Saga.**

**Short answer:** both are places to put side effects that react to actions ("when the user logs in, load their preferences"). The listener middleware is built into RTK and uses ordinary `async`/`await`; Redux Saga is a separate library that writes effects as *generator functions* (functions that `yield` descriptions of effects, which the saga runtime executes). Sagas are more powerful for long-running, cancellable workflows, and harder to learn and test.

| Feature | Listener Middleware | Redux Saga |
|---------|-------------------|------------|
| Syntax | async/await | Generators (yield) |
| Learning curve | Low | High |
| Bundle size | Built into RTK | Additional dependency |
| Complex orchestration | Limited | Excellent (channels, races, forks) |
| Testing | Standard async testing | Specialized (step-by-step generator) |
| Use case | Simple side effects | Complex async workflows |

Listener middleware is recommended for most apps because it needs no extra library and no new syntax. Reach for Sagas only when you need complex orchestration: polling that must stop when the user navigates away, "whichever of these two finishes first wins" races, or cancelling an in-flight flow when a newer action arrives. Those are exactly the cases where generators pay for their learning curve.

---

**Q12: How does RTK Query compare to React Query?**

**Short answer:** they solve the same problem, caching server data with loading and error states, and the choice is mostly about whether Redux is already in the app. RTK Query stores its cache in the Redux store and generates a hook per endpoint from one API definition. React Query (now published as TanStack Query) keeps its own cache outside any store and you call `useQuery` with a key and a fetch function wherever you need data.

| Feature | RTK Query | React Query |
|---------|-----------|-------------|
| Part of | Redux Toolkit | Standalone |
| Store | Redux store | Own internal cache |
| Cache invalidation | Tags (declarative) | Query keys (imperative) |
| Auto-generated hooks | Yes (from API definition) | No (you write hooks) |
| Optimistic updates | Via `onQueryStarted` | Via `onMutate` |
| DevTools | Redux DevTools | React Query DevTools |
| Bundle | Included with RTK | Separate package |
| Best when | Already using Redux | Not using Redux |

The "tags vs query keys" row is the real design difference. In RTK Query a mutation declares which tags it invalidates, so the refetch rule lives in one API definition. In React Query you invalidate by key (`queryClient.invalidateQueries({ queryKey: ['users'] })`), usually in the mutation's success handler, which is more flexible but spread across call sites.

If you already use Redux, RTK Query integrates naturally: one store, one DevTools. If you don't, adding Redux just to get RTK Query is extra weight, and React Query is simpler.

---

**Q13: How would you normalize state and why?**

Normalization means storing data in a flat structure indexed by ID, instead of nested/duplicated:

```json
// Normalized state
{
  ids: ['1', '2'],
  entities: {
    '1': { id: '1', name: 'Alice' },
    '2': { id: '2', name: 'Bob' },
  }
}
```

Why it matters:
- **Fast lookup:** finding a user is `entities[id]`, a single step, instead of scanning the whole array with `.find()` every time.
- **One copy of each record:** in nested data, the same user can appear inside every post they wrote. Rename them and you must find and update every copy; miss one and the UI shows two different names for the same person. Normalized, the user exists once and posts refer to it by `authorId`.
- **Small, cheap updates:** changing one user replaces one entry in `entities`. Components showing *other* users keep the same object references, so they do not re-render.

RTK's `createEntityAdapter` provides CRUD operations and selectors for normalized state out of the box.

---

**Q14: How do you handle optimistic updates in Redux?**

**Short answer:** an *optimistic update* shows the change in the UI immediately, before the server confirms it, and undoes it if the request fails. The app feels instant, at the cost of occasionally reverting. You need three things: apply the change when the request starts, remember what it replaced, and restore that on failure.

With `createAsyncThunk`, the `pending` action carries the thunk's argument in `action.meta.arg`, so the reducer can apply the change there and roll it back in `rejected`. Two details in the sketch below are easy to get wrong. The snapshot is copied **before** `Object.assign` applies the change; copy it after and the "rollback" restores the new value. And snapshots are keyed by `action.meta.requestId` (a unique id `createAsyncThunk` gives every call) rather than kept in one `previousState` field, so a second update in flight cannot overwrite the first one's snapshot. `fulfilled` deletes the snapshot once the server confirms.

```ts
const updateUser = createAsyncThunk('users/update', async (user: User) => {
  return await api.updateUser(user);
});

// In slice
extraReducers: (builder) => {
  builder
    .addCase(updateUser.pending, (state, action) => {
      // Optimistic: apply update immediately
      const user = action.meta.arg;
      const existing = state.entities[user.id];
      if (existing) {
        state.snapshots[action.meta.requestId] = { ...existing };  // save BEFORE changing
        Object.assign(existing, user);
      }
    })
    .addCase(updateUser.fulfilled, (state, action) => {
      delete state.snapshots[action.meta.requestId];  // confirmed: snapshot no longer needed
    })
    .addCase(updateUser.rejected, (state, action) => {
      // Rollback on failure
      const user = action.meta.arg;
      const snapshot = state.snapshots[action.meta.requestId];
      if (snapshot) state.entities[user.id] = snapshot;
      delete state.snapshots[action.meta.requestId];
    });
}
```

With RTK Query this is built in, and it is the cleaner option. `onQueryStarted` runs when the mutation starts; `updateQueryData` patches the cached `getUsers` result in place and returns a patch object whose `undo()` reverses exactly that change, so you never store a snapshot yourself:
```ts
updateUser: builder.mutation({
  query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
  async onQueryStarted({ id, ...body }, { dispatch, queryFulfilled }) {
    const patchResult = dispatch(
      apiSlice.util.updateQueryData('getUsers', undefined, (draft) => {
        const user = draft.find(u => u.id === id);
        if (user) Object.assign(user, body);
      })
    );
    try { await queryFulfilled; }
    catch { patchResult.undo(); }           // rollback on error
  },
})
```

---

**Q15: How do you handle large-scale Redux applications?**

**Short answer:** the biggest win is keeping *less* in Redux; after that, organise by feature and make the rules mechanical so a large team cannot drift.

1. **No unnecessary Redux**: server data goes in a query cache (RTK Query or React Query) and local UI state stays in components. Most "our Redux is huge" problems are hand-written loading/error/data fields for API calls that a query cache would own.
2. **Feature slices**: each feature owns its slice, selectors and types in one folder (§11.1), so a team can change its feature without touching a shared mega-reducer.
3. **Code splitting**: lazy-load a feature's reducer with `store.replaceReducer` when its route loads, so users do not download state logic for pages they never visit.
4. **Normalized data**: `createEntityAdapter` for collections, so each record exists once and updates stay small (Q13).
5. **Memoized selectors**: `createSelector` for derived data, so components re-render only when the derived result actually changes (Q7).
6. **Typed hooks**: `useAppSelector` and `useAppDispatch` carry the store's types, so a renamed field is a compile error instead of an `undefined` at runtime.
7. **One home for side effects**: listener middleware (or Sagas for complex flows), rather than effects scattered across components.

---

**Q16: Explain Redux's `dispatch` batching behavior.**

React 18+ automatically batches all state updates within the same event handler, including Redux dispatches:

```tsx
function handleClick() {
  dispatch(action1());
  dispatch(action2());
  dispatch(action3());
  // Only ONE re-render, not three
}
```

Before React 18, batching only worked in React event handlers. Dispatches in setTimeout, promises, or native event listeners caused separate re-renders. React 18's automatic batching covers all cases.

React-Redux also exports a `batch` helper from before React 18. On React 18+ you rarely need it, since batching is already automatic, but you will see it in older code:
```ts
import { batch } from 'react-redux';
batch(() => {
  dispatch(action1());
  dispatch(action2());
});
```

---

**Q17: What is the `extraReducers` builder pattern?**

`extraReducers` lets a slice respond to actions defined OUTSIDE the slice (like thunks or actions from other slices):

```ts
extraReducers: (builder) => {
  builder
    .addCase(specificAction, (state, action) => { /* … */ })
    .addMatcher(
      (action) => action.type.endsWith('/rejected'), // match pattern
      (state, action) => { state.error = action.error.message; }
    )
    .addDefaultCase((state, action) => {
      // fallback for unhandled actions
    });
}
```

`addCase` for specific actions. `addMatcher` for patterns (for example, "any rejected thunk"). `addDefaultCase` for everything else. Why a builder instead of a plain object of handlers: each `addCase` call lets TypeScript infer the exact `action` type from the action creator you pass, so `action.payload` is typed without annotations. RTK 2 removed the older object syntax for `extraReducers` for this reason. The builder also enforces an order: all `addCase` calls first, then `addMatcher`, then `addDefaultCase`.

---

**Q18: What is the use of `configureStore` in Redux Toolkit?**

`configureStore` is the one function you call to **create the Redux store**, and it replaces the five-step setup plain Redux needed. With plain `createStore` you had to combine the reducers yourself, apply middleware, wire up the Redux DevTools extension with `compose`, and add thunk support, and every team did it slightly differently. `configureStore` does all of that in one call, with safe defaults.

```ts
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    auth: authReducer,       // an object of slice reducers is combined for you
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),   // keep the defaults, add your own
});

// Types for the whole app, derived from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**What one call does for you:**

| Step | Plain Redux | `configureStore` |
|---|---|---|
| Combine reducers | call `combineReducers` yourself | pass an object to `reducer` |
| Async support | install and apply `redux-thunk` | thunk included by default |
| Catch mistakes | nothing | in development, checks that you never **mutate** state and never put **non-serializable** values (a `Date`, a class instance, a function) in state or actions |
| DevTools | `compose` with `window.__REDUX_DEVTOOLS_EXTENSION__` | on by default (`devTools: true`); turn it off with `devTools: false` |
| Batching | nothing | `autoBatchEnhancer` included, so many dispatches in a row notify subscribers once |

The development checks are the part people underrate. The immutability check and the serializability check run **only in development**; in production the default middleware is just thunk. So they cost nothing for users, and they catch the two bugs that break Redux silently: a mutation that React never sees, and a `Date` in state that breaks persistence and time-travel debugging.

**The mistakes worth knowing:**

- **Passing your own middleware list replaces the defaults.** The docs are explicit: if you supply `middleware`, you are responsible for *all* of it. `middleware: () => [logger]` quietly removes thunk and both dev checks. Always start from `getDefaultMiddleware()` and `.concat()` (or `.prepend()`) your own. The same rule applies to `enhancers` and `getDefaultEnhancers()`.
- **Use the callback form.** It is what the docs recommend, and it is what makes TypeScript infer the right `dispatch` type, including thunks. A plain array still works in JavaScript.
- **Don't switch the checks off to silence a warning.** A serializability warning about a `Date` means the state shape is wrong: store `date.toISOString()` or a timestamp. Only ignore specific action types you understand, such as the ones redux-persist dispatches.
- **For SSR and tests, create a store per request or per test.** Export a `makeStore()` function that calls `configureStore`, instead of one module-level `store`. A shared store leaks one user's state into another user's server render, and one test's state into the next test.

**The one-sentence answer:** `configureStore` creates the store with good defaults (combined reducers, thunk, DevTools, batching, and development-only checks for mutation and non-serializable values), and `getDefaultMiddleware` is how you add to those defaults without losing them.

---

**Q19: Explain the Redux flow: Component → Action → Reducer → Store → Component.**

**Short answer:** a component **dispatches an action** describing what happened; the store passes it through any **middleware**, then to the **reducer**, which returns the next state; the store saves that state and notifies subscribers; and each component whose **selected** data changed re-renders. Data only ever moves in that one direction.

The whole loop fits in a few lines. This is a stripped-down `createStore`, enough to watch each step happen in order:

```js
// A tiny Redux: enough to watch the flow, step by step.
function createStore(reducer) {
  let state = reducer(undefined, { type: '@@init' });   // the reducer supplies the initial state
  const listeners = [];
  return {
    getState: () => state,
    subscribe: (listener) => listeners.push(listener),
    dispatch(action) {
      console.log('2. dispatch', action.type);
      state = reducer(state, action);                    // the ONLY way state changes
      console.log('4. store now holds', JSON.stringify(state));
      listeners.forEach((listener) => listener());       // tell the UI
    },
  };
}

// The reducer: (current state, action) -> next state. Pure, so no API calls here.
function cartReducer(state = { items: 0 }, action) {
  if (action.type === 'cart/itemAdded') {
    console.log('3. reducer computes the next state');
    return { ...state, items: state.items + action.payload.quantity };   // a NEW object
  }
  return state;
}

const store = createStore(cartReducer);

// What react-redux's useSelector does for you: re-render when the selected value changes.
store.subscribe(() => console.log('5. component re-renders showing', store.getState().items, 'items'));

console.log('1. user clicks "Add to cart"');
store.dispatch({ type: 'cart/itemAdded', payload: { quantity: 2 } });
```

```text
1. user clicks "Add to cart"
2. dispatch cart/itemAdded
3. reducer computes the next state
4. store now holds {"items":2}
5. component re-renders showing 2 items
```

**Each step in a real Redux Toolkit app:**

| Step | Redux Toolkit | What to say about it |
|---|---|---|
| 1. Component | `const dispatch = useDispatch()` and an event handler | components describe events; they never edit the store |
| 2. Action | `dispatch(itemAdded({ id: 7, quantity: 2 }))` | `createSlice` generates the action creator and its `type` string |
| (middleware) | thunks by default, plus the dev-only checks | where async work lives: a thunk can `await` an API call, then dispatch a result action |
| 3. Reducer | the `reducers` in `createSlice` | pure and synchronous; Immer lets you write `state.items.push(x)` and still produces a new object |
| 4. Store | `configureStore({ reducer: { cart: cartReducer } })` | one store, with each slice's reducer handling its own part (Q18) |
| 5. Component | `const count = useSelector((s) => s.cart.items.length)` | re-renders only if the selected value changed, compared with `===` |

**Two things interviewers check you understand:**

- **Why the reducer must return a new object.** `useSelector` and the store decide whether anything changed by comparing references. Mutating the old object in place (outside Immer) keeps the reference the same, so nothing re-renders, and the UI shows stale data.
- **Where the API call goes.** Not in the reducer, which must be pure, and ideally not in the component. The flow for async work is: component dispatches a thunk → the thunk calls the API → it dispatches a success or failure action → the reducer stores the result. `createAsyncThunk` generates the `pending`, `fulfilled` and `rejected` actions for that (Q9).

---

**Q20: A Redux Toolkit app feels sluggish: typing in a search box re-renders half the page. How do you diagnose and fix it?**

**Start from a profile, and look for selectors that return a new reference on every dispatch, because that is the cause almost every time.** Redux runs every connected component's selector after every action, so one keystroke that dispatches `setQuery` asks the whole app "did your data change?" Components answer "yes" when their selector builds a new array or object each time, even though nothing they display changed.

1. **Profile the interaction** in the React DevTools Profiler with "why each component rendered" enabled, and sort by render time, not render count: forty cheap renders matter less than one slow one.
2. **Fix derived selectors** with `createSelector`, so `filter`, `map` and sort results keep their reference until their inputs change (§6.2).
3. **Stop returning fresh objects** from `useSelector`: select single values, or pass `shallowEqual`.
4. **Check the state shape.** If the search text lives in the same slice as the data, every keystroke replaces that slice's reference. Keep fast-changing UI state (the input's value) in the component, and dispatch only the debounced query.
5. **Move server data to RTK Query** where it is being fetched into slices by hand, and use `selectFromResult` for components that need one item from a large result.
6. **Then look at rendering cost itself:** `React.memo` on heavy rows that receive stable props, and virtualisation if the list is long.

Re-measure after each step. The answer that stands out names the mechanism (`===` after every dispatch) before the tools, and ends with a check that stops it recurring. §11.4 has the details, including when a selector needs a bounded cache.

---

## 14. Tricky Output Questions

Practice questions testing your understanding of Redux reducer execution, Immer mutations, selector memoization, and thunk lifecycle.

### Reducers & Immer

---

**Q1: Inside a `createSlice` reducer that uses Immer, which of these three patterns work — mutating the draft, returning a new object, or mutating AND returning — and why does the third one throw?**

```js
import { createSlice, configureStore } from "@reduxjs/toolkit";

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    // Pattern A: mutate
    increment: (state) => {
      state.value += 1;
    },
    // Pattern B: return new object
    reset: (state) => {
      return { value: 0 };
    },
    // Pattern C: mutate AND return
    broken: (state) => {
      state.value += 1;
      return { ...state };
    },
  },
});

const store = configureStore({ reducer: counterSlice.reducer });
store.dispatch(counterSlice.actions.increment()); // fine
store.dispatch(counterSlice.actions.reset());     // fine
store.dispatch(counterSlice.actions.broken());    // throws, only when this case reducer runs
```

**Answer:**
- **A — works.** Immer tracks the mutations made to the draft and produces an immutable next-state from them.
- **B — works.** Returning a fresh object short-circuits Immer's draft tracking and replaces the state entirely.
- **C — throws.** It mutates the draft *and* returns a new object (`{ ...state }` is a fresh copy). Immer raises: `[Immer] An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.` Note the look-alike that is fine: `return state` (returning the draft itself, not a copy) counts as "returned nothing", so a mutation followed by `return state` works.

**Explanation:**

`createSlice` reducers are Immer producers. When you dispatch an action, Immer wraps the current state in a Proxy called a *draft* and passes it to your case reducer. You must then pick exactly one of two contracts:

1. **Write-draft contract** — mutate `state.foo = bar` directly on the draft. Immer observes every write through the Proxy, and when your function returns `undefined` (or returns the draft itself), it uses those writes to build a new immutable state, reusing untouched branches (*structural sharing*).
2. **Replace contract** — return a brand-new object from the reducer. Immer throws the draft away and uses your return value verbatim as the next state.

These contracts are mutually exclusive: if you mutated the draft *and* returned some other object, Immer would have to guess whether to honor the recorded mutations or the replacement. Rather than pick a silent winner, it errors loudly.

Returning the draft is not a replacement, because it is the same object Immer handed you, so adding `return state` "to be explicit" is harmless. The pitfall is the look-alike `return { ...state }` at the bottom of a reducer that already mutated: that spread creates a new object, which is exactly the forbidden combination.

**Takeaway:** In Immer (and thus `createSlice` case reducers): mutate the draft OR return a new object — never both. Returning the draft itself counts as mutating.

---

**Q2: After dispatching an action that modifies state, are the `before` and `after` snapshots the same object reference, and does the old snapshot still show the old value?**

```js
import { createSlice, configureStore } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "test",
  initialState: { count: 0, name: "hello" },
  reducers: {
    increment: (state) => { state.count += 1; },
  },
});

const store = configureStore({ reducer: slice.reducer });

const before = store.getState();
store.dispatch(slice.actions.increment());
const after = store.getState();

console.log(before === after);
console.log(before.count, after.count);
```

**Output:**
```
false
0 1
```

**Explanation:**

Although the case reducer *looks* like a mutation (`state.count += 1`), Immer is intercepting that write on a draft Proxy, not on the actual store state. When the reducer returns, Immer produces an entirely new top-level object that reflects the change. The Redux store then swaps its internal `currentState` pointer to that new object.

That's why `before === after` is `false` — they point at two distinct objects in memory. And because Immer never touched the original, `before.count` remains `0` forever while `after.count` is `1`. The previous snapshot is effectively a frozen history record.

This identity-based change detection is the whole foundation of React-Redux performance. `useSelector` compares the previous selected value with the new one using `===`. If the reference is the same, it skips the re-render; if it's different, it schedules one. If Redux mutated state in place (like you'd naively write without Immer), every selector would think nothing changed and your UI would go stale.

**Takeaway:** Every successful dispatch that writes to state produces a brand-new state object; old snapshots are immutable history and never mutate under your feet.

---

**Q3: If you dispatch a `setValue(5)` when the current value is already `5`, does the store's state reference stay the same or change — and what does that mean for re-renders?**

```js
import { createSlice, configureStore } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "test",
  initialState: { value: 5 },
  reducers: {
    setValue: (state, action) => { state.value = action.payload; },
  },
});

const store = configureStore({ reducer: slice.reducer });

const before = store.getState();
store.dispatch(slice.actions.setValue(5));  // same value!
const after = store.getState();

console.log(before === after);
```

**Output:** `true`

**Short answer:** the reference stays the same. Immer ignores an assignment that writes the value a property already has, so the draft is never marked as changed and Immer hands back the original state object. A common wrong answer is `false`, from assuming any assignment counts as a change.

**Explanation:**

Immer's draft is a Proxy: every assignment goes through a "set" trap Immer controls. Before marking anything as changed, that trap compares the new value with the current one (using `Object.is`, which is `===` except that it treats `NaN` as equal to itself). `state.value = 5` when `value` is already `5` passes that check, so nothing is recorded. When the reducer finishes with no recorded changes, Immer returns the base state untouched.

That is what makes a no-op dispatch cheap for React: the store's state is the same object, so every `useSelector` gets the same value back and nothing re-renders.

**The limit of this, and the part worth volunteering:** the check is shallow, one property at a time. Assigning a *new object* with the same contents is a real change as far as Immer is concerned:

- `state.value = 5` (already `5`) → no change, same reference.
- `state.user = { ...action.payload }` with identical fields → a new object, so `state` and `state.user` both get new references, and any component selecting `state.user` re-renders.

So the fix for redundant re-renders is still at the source: assign individual primitive fields rather than replacing whole objects, or skip the dispatch when nothing changed.

**Takeaway:** Immer skips writes of an identical value (compared with `Object.is`), so a same-value primitive write keeps the same state reference; replacing an object with an equal-looking copy does not.

---

### Selectors & Memoization

---

**Q4: When you call a `createSelector` memoized selector twice in a row against the same store state, how many times does the result function run and are the two returned arrays the same reference?**

```js
import { createSelector, configureStore, createReducer } from "@reduxjs/toolkit";

const selectItems = (state) => state.items;
const selectFilter = (state) => state.filter;

const selectFilteredItems = createSelector(
  [selectItems, selectFilter],
  (items, filter) => {
    console.log("recomputing");
    return items.filter(item => item.includes(filter));
  }
);

const store = configureStore({
  reducer: createReducer(
    { items: ["apple", "banana", "avocado"], filter: "a" },
    () => {}
  ),
});

const result1 = selectFilteredItems(store.getState());
const result2 = selectFilteredItems(store.getState());

console.log(result1 === result2);
```

**Output:**
```
recomputing
true
```

**Explanation:**

`createSelector` (from Reselect, re-exported by Redux Toolkit) returns a memoized function. Each time you call it, it first runs the *input selectors* (`selectItems`, `selectFilter`) and compares their outputs to what it saw on the previous call using `===` (reference equality). If every input matches, it skips the expensive result function entirely and returns the cached output.

In this snippet, both calls pass the exact same state object. The input selectors pull out `state.items` and `state.filter`, and because nothing dispatched in between, those two references are identical across calls. Reselect's cache hits on the second call, the result function never runs, so `"recomputing"` prints only once. And because the cached result is handed back verbatim, `result1 === result2` is `true`.

This reference stability is the whole point of Reselect. Components subscribing via `useSelector(selectFilteredItems)` will see the same array reference across renders (assuming inputs haven't changed), so `useSelector`'s `===` check short-circuits and the component doesn't re-render. The moment `state.items` or `state.filter` gets a new reference, the input check fails, the result function re-runs, a new filtered array is produced, and downstream subscribers re-render — exactly when they should.

**Takeaway:** `createSelector` memoizes on input *reference equality*; same inputs produce zero recompute and the same output reference.

---

**Q5: What goes wrong when you call `.filter()` (or `.map()`) inline inside `useSelector`, and why does React-Redux even print a warning about it?**

```js
// In a React component:
const items = useSelector(state =>
  state.items.filter(item => item.price > 10)
);
```

**Answer:** On every store update, `useSelector` re-runs the inline selector. `.filter()` always produces a **new array reference** — even when the filtered contents are identical — so `useSelector`'s default `===` equality check decides the selected value has changed and schedules a re-render. If your component dispatches anything during render or an effect, you can tip into a render loop, and React-Redux will log a warning: *"Selector returned a different result when called with the same parameters. This can lead to unnecessary rerenders."*

**Explanation:**

`useSelector` subscribes to the store and, after every dispatch, calls your selector function with the latest state. It then compares the new return value to the previous one using `Object.is` (essentially `===`). Reference equality is fast, but it means any selector that constructs a new object or array on each call will always appear "changed" — even if the data inside is byte-for-byte identical.

`.filter()`, `.map()`, `.slice()`, object literals, `{ ...state.foo }`, and `[...arr]` all fall into this trap. They're fine as transient values in the render body, but deadly inside `useSelector`.

The fix is to move the derivation behind a memoized boundary so the transformation is only re-executed when inputs change, and the same array reference is returned otherwise. `createSelector` is the canonical tool:

```js
const selectExpensiveItems = createSelector(
  state => state.items,
  items => items.filter(item => item.price > 10)
);
const items = useSelector(selectExpensiveItems);
```

Alternatives: pass `shallowEqual` as the second arg to `useSelector` (compares array/object fields with `===`), or select the raw input and do the filter inside a `useMemo` in the component.

**Takeaway:** Never derive new arrays or objects inside `useSelector` without memoization — `===` makes every call look like a change.

---

### Thunks & Async

---

**Q6: When you dispatch a `createAsyncThunk`, in what order do the `pending` / `fulfilled` actions fire relative to the async payload function executing — and what does the store subscriber actually log?**

```js
import { createAsyncThunk, configureStore, createSlice } from "@reduxjs/toolkit";

const fetchUser = createAsyncThunk("user/fetch", async (userId) => {
  console.log("thunk executing");
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

const store = configureStore({
  reducer: createSlice({
    name: "user",
    initialState: { status: "idle" },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchUser.pending, (state) => { state.status = "loading"; })
        .addCase(fetchUser.fulfilled, (state) => { state.status = "done"; })
        .addCase(fetchUser.rejected, (state) => { state.status = "error"; });
    },
  }).reducer,
});

store.subscribe(() => console.log("state:", store.getState().status));
store.dispatch(fetchUser(1));
```

**Output (assuming API succeeds):**
```
state: loading
thunk executing
state: done
```

**Explanation:**

`createAsyncThunk` generates a thunk action creator with a fixed lifecycle: **pending → (fulfilled | rejected)**. Understanding the ordering requires peeking at what it does internally:

1. When you dispatch `fetchUser(1)`, the thunk middleware intercepts it and synchronously dispatches a `user/fetch/pending` action **before** invoking your payload creator. That dispatch flips `state.status` to `"loading"` and triggers the subscriber — hence the first line, `state: loading`.
2. Only after dispatching `pending` does the middleware actually *call* your async payload function. The first thing inside that function is `console.log("thunk executing")`, which prints next.
3. The function hits `await fetch(...)`, suspends, and later resumes with the response. When the promise it returns resolves, RTK dispatches `user/fetch/fulfilled` with the resolved value as `action.payload`. That flips `state.status` to `"done"` and triggers the subscriber again — giving `state: done`.

If the fetch had thrown or the promise rejected, the third action would have been `user/fetch/rejected` instead, carrying the error in `action.error`. There's also an optional `condition` callback on the thunk that, if it returns `false`, cancels the dispatch entirely — no pending, no call, no resolution.

The key mental model: `pending` is dispatched *before* your code runs, not after the network call starts. That's why you can safely set `status = "loading"` in the `pending` reducer.

**Takeaway:** `createAsyncThunk` dispatches `pending` synchronously before your async code runs, then `fulfilled` or `rejected` when the promise settles.

---

**Q7: When you `await store.dispatch(someAsyncThunk())`, what exactly does the awaited value contain — the payload you returned, or something else?**

```js
import { createAsyncThunk, configureStore } from "@reduxjs/toolkit";

const fetchData = createAsyncThunk("data/fetch", async () => {
  return { items: [1, 2, 3] };
});

const store = configureStore({ reducer: (state = {}) => state });

const result = await store.dispatch(fetchData());

console.log(result.type);
console.log(result.payload);
console.log(result.meta.requestStatus);
```

**Output:**
```
data/fetch/fulfilled
{ items: [1, 2, 3] }
fulfilled
```

**Explanation:**

This is a frequent source of bugs. `dispatch(thunk())` does **not** resolve to the value your async function returned — it resolves to the final **action object** that was dispatched to the reducer. That action has a predictable shape:

- `type` — the terminal action type, either `"data/fetch/fulfilled"` or `"data/fetch/rejected"`.
- `payload` — on fulfillment, the value your async function returned. On rejection it is `undefined` unless you called `rejectWithValue(x)`, in which case it is `x`; a plain thrown error goes in `error` instead.
- `meta` — metadata about the request, including `meta.arg` (the argument you called the thunk with), `meta.requestId`, and `meta.requestStatus` (`"fulfilled"` | `"rejected"`).
- `error` — present only on rejection, with a serialized description of the thrown error.

Critically, even when the thunk *rejects internally*, the promise returned by `dispatch` still **resolves** — it resolves to a rejected-shape action. It does not throw. That's why code like `try { await dispatch(fetchX()); } catch {}` silently misses errors.

To get behavior that throws on rejection, wrap the result with `unwrapResult(result)` (or call `.unwrap()` on the promise itself: `await dispatch(fetchX()).unwrap()`). That helper inspects `meta.requestStatus` and either returns the payload or throws the error, which matches what developers intuitively expect from `await`.

**Takeaway:** `dispatch(asyncThunk())` resolves to an action object with `type`, `payload`, and `meta` — use `.unwrap()` or `unwrapResult` if you want throws on rejection.

---

**Q8: If a click handler dispatches `increment()` three times in a row on React 18, how many times does the component re-render and what are the logged values?**

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { increment } from './counter.slice';

function MyComponent() {
  const dispatch = useDispatch();
  const count = useSelector(state => state.counter.value);
  console.log("render", count);

  const handleClick = () => {
    dispatch(increment());
    dispatch(increment());
    dispatch(increment());
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

**Output on click (starting from count = 0):**
```
render 3
```

**Explanation:**

(Mounting logs `render 0` first; the line above is what the click adds.)

This is **not** new in React 18 for a click handler. React has always batched updates made inside its own event handlers, and React-Redux v7 wrapped its subscriber notifications in `batch()`, so React 17 + React-Redux 7 also logs a single `render 3` here (measured). What React 18 changed is **everywhere else**: the same three dispatches inside a `setTimeout`, a promise callback or a native listener rendered once *per dispatch* on React 17 + React-Redux 7 (measured: two dispatches in a `setTimeout` logged `render 4`, `render 5`), and now render once (`render 5`). That is **automatic batching** — it extends batching beyond React event handlers.

React-Redux v8+ subscribes through `useSyncExternalStore`. That hook exists to prevent *tearing* (two components reading different store versions in one render), and it renders store updates at synchronous priority rather than as interruptible concurrent work; the batching itself comes from React 18 grouping those updates until the current event or task finishes.

Here's what actually happens inside the click handler:
1. `dispatch(increment())` runs the reducer, the store's state reference changes, and subscribers are notified — but React defers the render.
2. The second and third dispatches each update the store; no render has happened yet.
3. The click handler returns. React flushes pending work, calls `useSelector` which now returns `3`, and re-renders the component exactly once.

The store state itself still goes through every intermediate value (1, then 2, then 3) — batching only deduplicates the *UI* renders, not the Redux state transitions. Middleware, subscribers registered via `store.subscribe`, and thunks still see every individual action.

If you genuinely need to see intermediate values, that's a design smell: combine the three dispatches into a single thunk or a single action with a richer payload.

**Takeaway:** Multiple synchronous dispatches produce a single re-render with the final state — inside a React event handler this was already true before React 18; React 18 extends it to timeouts, promises and native listeners. Store transitions are still per-dispatch, only the UI collapses.

---

### Middleware

---

**Q9: Given two logger middlewares registered as `[logger1, ...getDefault(), logger2]`, in what order do the four `before`/`after` logs appear when you dispatch one action?**

```js
import { configureStore } from "@reduxjs/toolkit";

const counterReducer = (state = 0, action) =>
  action.type === "increment" ? state + 1 : state;

const logger1 = (store) => (next) => (action) => {
  console.log("logger1 before");
  const result = next(action);
  console.log("logger1 after");
  return result;
};

const logger2 = (store) => (next) => (action) => {
  console.log("logger2 before");
  const result = next(action);
  console.log("logger2 after");
  return result;
};

const store = configureStore({
  reducer: counterReducer,
  middleware: (getDefault) => [logger1, ...getDefault(), logger2],
});

store.dispatch({ type: "increment" });
```

**Output:**
```
logger1 before
logger2 before
logger2 after
logger1 after
```

**Explanation:**

Redux middleware composes into an **onion**, not a pipeline. When you register `[logger1, defaultMiddleware, logger2]`, Redux wires them into a chain where each middleware's `next` is the head of the next one. Dispatching an action enters the outermost layer, walks inward to the reducer, then unwinds back out.

Step by step:
1. `dispatch(action)` enters `logger1`. It prints `"logger1 before"`, then calls `next(action)`.
2. That `next` is `logger2`'s entry (after passing through default middleware, which in this trivial case passes the action through). `logger2` prints `"logger2 before"` and calls its own `next`.
3. `logger2`'s `next` is the real `store.dispatch` — which runs the reducer and updates state. Control returns to `logger2`.
4. `logger2` prints `"logger2 after"` and returns. Control returns to `logger1`.
5. `logger1` prints `"logger1 after"` and returns. The original `dispatch` call resolves.

The order is therefore **outside-in on the way in, inside-out on the way out**, which is identical to Express middleware or any classic recursive wrapper pattern. The position of `logger2` *after* `getDefault()` means it's the innermost middleware before the reducer — so it's closest to state changes and sees them last (before unwinding).

This structure is why middleware can implement cross-cutting concerns: you can short-circuit by not calling `next()`, transform the action by calling `next(modifiedAction)`, or inspect the result after the reducer has run.

**Takeaway:** Redux middleware is onion-shaped — "before" logs fire outer-to-inner, "after" logs fire inner-to-outer, around a synchronous reducer in the center.

---

**Q10: What warning does Redux Toolkit emit when you dispatch an action whose payload is `new Date()`, and why does it care about the type of the value?**

```js
import { createSlice, configureStore } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "test",
  initialState: { date: null },
  reducers: {
    setDate: (state, action) => {
      state.date = action.payload;
    },
  },
});

const store = configureStore({ reducer: slice.reducer }); // development mode

store.dispatch(slice.actions.setDate(new Date()));
```

**Output:** two console errors — one for the action, one for the state it produced:
```
A non-serializable value was detected in an action, in the path: `payload`. Value: Wed Apr 23 2026 ...
Take a look at the logic that dispatched this action:  { type: 'test/setDate', payload: Wed Apr 23 2026 ... }
(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)
(To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)
A non-serializable value was detected in the state, in the path: `date`. Value: Wed Apr 23 2026 ...
Take a look at the reducer(s) handling this action type: test/setDate.
(See https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)
```

The reducer stored the `Date`, so the check fires twice: once on the way in (the action) and once on the result (the state). How the `Date` itself is printed depends on the console — a browser shows `Wed Apr 23 2026 …`, Node prints the ISO string.

**Explanation:**

`configureStore` wires up two sanity-check middlewares by default in development: `serializableCheck` and `immutableCheck`. The serializability check walks both the action and the resulting state after every dispatch and confirms every value is JSON-safe — plain objects, arrays, strings, numbers, booleans, `null`. Anything with a prototype chain beyond `Object.prototype` fails the check.

Common offenders: `Date`, `Map`, `Set`, `RegExp`, `Error`, class instances, DOM nodes, functions, promises, `undefined`, symbols.

Why does Redux insist on serializable state?

1. **Time-travel debugging** — Redux DevTools replay, export, and import actions by serializing them to JSON. A `Date` survives `JSON.stringify` (as a string) but not a roundtrip (`new Date(str)` isn't a `Date` anymore unless you reconstruct it).
2. **Persistence** — tools like `redux-persist` write store state to `localStorage`, which only accepts strings. Non-serializable values silently corrupt when reloaded.
3. **Determinism** — pure actions are easier to log, test, and reason about. A `Date` whose `.getTime()` changes per-run makes replays non-deterministic.
4. **SSR hydration** — server-rendered state is JSON-serialized over the wire; mismatched types blow up hydration.

The standard fix is to store a primitive representation (`new Date().toISOString()` or `Date.now()`) and re-hydrate to a `Date` in selectors or components if you truly need the instance. If you legitimately need to store non-serializable data (e.g., a `File` during upload), you can disable the check per path via `configureStore({ middleware: (gDM) => gDM({ serializableCheck: { ignoredPaths: ['upload.file'] } }) })` — but that's an escape hatch, not a default posture.

**Takeaway:** Store and actions must be JSON-serializable; convert non-plain values (Date, Map, Set, class instances) to primitives before dispatching.

---

### Key Rules

```
Redux Toolkit Output Cheat Sheet:
1. Immer: mutate OR return, never both
2. A dispatch that actually changes state creates a new state reference
3. createSelector memoizes — same inputs = same output reference
4. Inline filter/map in useSelector breaks memoization (new array every time)
5. createAsyncThunk dispatches: pending → fulfilled/rejected
6. dispatch(thunk()) returns a promise of the action, not the payload
7. React 18 batches multiple synchronous dispatches into one re-render
8. Middleware runs left-to-right (before), right-to-left (after) — onion pattern
9. RTK warns on non-serializable values (Date, Map, Set, functions)
10. Immer checks each write with Object.is — same primitive value keeps the reference; an equal-looking new object does not
```

---

## References

- [Redux Toolkit Documentation](https://redux-toolkit.js.org) — Official RTK docs and tutorials
- [Redux Essentials Tutorial](https://redux.js.org/tutorials/essentials/part-1-overview-concepts) — Step-by-step Redux learning path
- [Redux Toolkit GitHub](https://github.com/reduxjs/redux-toolkit) — Source code and examples
- [Building Performant React Applications](https://anshurajsingh.com/blog/react-performance-optimization) — a worked Redux Toolkit performance pass: memoized selectors, RTK Query caching, code-splitting and virtualisation

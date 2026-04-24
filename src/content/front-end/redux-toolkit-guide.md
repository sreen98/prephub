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
- [13. Interview Questions & Answers](#13-interview-questions--answers)
- [14. Tricky Output Questions](#14-tricky-output-questions)

---

## 1. What is Redux?

Redux is a **predictable state container** for JavaScript apps. It provides a single centralized store for application state, with strict rules about how state can be updated.

**Redux Toolkit (RTK)** is the official, recommended way to write Redux logic. It simplifies store setup, reduces boilerplate, and includes best practices by default.

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

RTK uses Immer internally, so you can write "mutating" code that produces immutable updates:

```ts
// These are equivalent:

// "Mutating" syntax (Immer — recommended)
reducers: {
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
}

// Immutable syntax (manual — more verbose)
reducers: {
  updateUser(state, action) {
    return { ...state, user: { ...state.user, ...action.payload } };
  },
  addItem(state, action) {
    return { ...state, items: [...state.items, action.payload] };
  },
}
```

### 4.4 Extra Reducers (Handle External Actions)

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
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
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

### 8.1 useSelector

```tsx
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

RTK Query is a data fetching and caching tool built into Redux Toolkit. It generates hooks for data fetching automatically.

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
function UserList() {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  if (isLoading) return <Spinner />;
  if (error) return <Error />;

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

```ts
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

**Q1: What is Redux and why would you use it?**

Redux is a predictable state management library that provides a single centralized store for application state. You'd use it when:
- Multiple components need the same data
- State needs to survive component unmount/remount
- Complex state update logic
- Need time-travel debugging

The three principles: single store, read-only state (dispatch actions), pure reducer functions.

---

**Q2: What is an action in Redux?**

An action is a plain JavaScript object with a `type` field describing what happened, and an optional `payload` with data:

```ts
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

Redux requires immutable state updates — you must return a new object/array, not modify the existing one. This is important because:

1. **Change detection**: Redux uses reference equality (`===`) to check if state changed. Mutations don't change the reference, so Redux wouldn't detect the update.
2. **Predictability**: No hidden side effects from shared mutable state.
3. **Time-travel debugging**: Each state snapshot is preserved.

RTK's Immer library lets you write "mutating" code that actually produces immutable updates:
```ts
// Looks like mutation, but Immer makes it immutable
state.user.name = 'Alice';
state.items.push(newItem);
```

---

**Q7: Explain `createSelector` and memoization.**

`createSelector` creates memoized selectors. It only recomputes when its input selectors return new values:

```ts
const selectActiveUsers = createSelector(
  [state => state.users.items],
  (users) => users.filter(u => u.isActive)  // only runs when users changes
);
```

Without memoization, `users.filter(...)` runs on EVERY render, creating a new array reference each time, causing unnecessary re-renders in components using `useSelector`.

With `createSelector`, the filtered array is cached — if `users` hasn't changed, the same array reference is returned.

---

**Q8: What is middleware in Redux? Give examples.**

Middleware intercepts actions between dispatch and the reducer. It's used for side effects like logging, async operations, and error reporting.

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

Built-in RTK middleware: `thunk` (async), `serializableCheck`, `immutableCheck`.
Common third-party: `redux-saga`, `redux-logger`.

---

**Q9: What is `createAsyncThunk` and how does it work?**

`createAsyncThunk` creates a thunk (async action) that dispatches three actions automatically: `pending`, `fulfilled`, `rejected`.

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

| Use Case | Context | Redux |
|----------|---------|-------|
| Simple shared state (theme, auth) | Best | Overkill |
| Frequent updates | Causes re-renders in all consumers | Selectors prevent unnecessary re-renders |
| Complex state logic | useReducer works but no devtools | Full devtools, middleware, time-travel |
| Many state slices | Multiple providers (nesting hell) | Single store, clean separation |
| Async side effects | Manual | Thunks, Sagas, Listener middleware |
| Team size | Small teams | Large teams (enforced patterns) |

Context re-renders ALL consumers when value changes. Redux + `useSelector` only re-renders when the SELECTED value changes.

---

### Advanced

---

**Q11: Explain the Redux Toolkit listener middleware vs Redux Saga.**

Both handle side effects, but with different approaches:

| Feature | Listener Middleware | Redux Saga |
|---------|-------------------|------------|
| Syntax | async/await | Generators (yield) |
| Learning curve | Low | High |
| Bundle size | Built into RTK | Additional dependency |
| Complex orchestration | Limited | Excellent (channels, races, forks) |
| Testing | Standard async testing | Specialized (step-by-step generator) |
| Use case | Simple side effects | Complex async workflows |

Listener middleware is recommended for most apps. Use Sagas only when you need complex orchestration (multi-step polling, race conditions, cancellation patterns).

---

**Q12: How does RTK Query compare to React Query?**

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

If you already use Redux, RTK Query integrates naturally. If you don't, React Query is simpler.

---

**Q13: How would you normalize state and why?**

Normalization means storing data in a flat structure indexed by ID, instead of nested/duplicated:

```ts
// Normalized state
{
  ids: ['1', '2'],
  entities: {
    '1': { id: '1', name: 'Alice' },
    '2': { id: '2', name: 'Bob' },
  }
}
```

Benefits:
- O(1) lookup by ID (instead of O(n) array search)
- No duplicated data
- Simpler updates (just update one entity)
- Easier to maintain consistency

RTK's `createEntityAdapter` provides CRUD operations and selectors for normalized state out of the box.

---

**Q14: How do you handle optimistic updates in Redux?**

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
      if (existing) Object.assign(existing, user);
      state.previousState = { ...existing };  // save for rollback
    })
    .addCase(updateUser.rejected, (state, action) => {
      // Rollback on failure
      const user = action.meta.arg;
      state.entities[user.id] = state.previousState;
    });
}
```

With RTK Query:
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

1. **Feature slices**: Each feature has its own slice, selectors, types
2. **Code splitting**: Lazy-load reducers with `store.replaceReducer`
3. **Normalized data**: Use `createEntityAdapter` for collections
4. **Memoized selectors**: `createSelector` for derived data
5. **Typed hooks**: `useAppSelector`, `useAppDispatch` for type safety
6. **Middleware for side effects**: Listener middleware or Sagas
7. **RTK Query**: For server state (eliminates manual loading/error/data management)
8. **No unnecessary Redux**: Local state for local concerns, React Query for server data

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

For explicit batching control:
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
    .addCase(specificAction, (state, action) => { ... })
    .addMatcher(
      (action) => action.type.endsWith('/rejected'), // match pattern
      (state, action) => { state.error = action.error.message; }
    )
    .addDefaultCase((state, action) => {
      // fallback for unhandled actions
    });
}
```

`addCase` for specific actions. `addMatcher` for patterns. `addDefaultCase` for everything else. The builder pattern ensures type safety and correct ordering.

---

## 14. Tricky Output Questions

Practice questions testing your understanding of Redux reducer execution, Immer mutations, selector memoization, and thunk lifecycle.

### Reducers & Immer

---

**Q1: Inside a `createSlice` reducer that uses Immer, which of these three patterns work — mutating the draft, returning a new object, or mutating AND returning — and why does the third one throw?**

```js
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
      return state;
    },
  },
});
```

**Answer:**
- **A — works.** Immer tracks the mutations made to the draft and produces an immutable next-state from them.
- **B — works.** Returning a fresh object short-circuits Immer's draft tracking and replaces the state entirely.
- **C — throws.** Immer can't reconcile "I mutated the draft" with "but you also returned a new value" and raises: `[Immer] An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.`

**Explanation:**

`createSlice` reducers are Immer producers. When you dispatch an action, Immer wraps the current state in a Proxy called a *draft* and passes it to your case reducer. You must then pick exactly one of two contracts:

1. **Write-draft contract** — mutate `state.foo = bar` directly on the draft. Immer observes every write through the Proxy, and when your function returns `undefined`, it replays those writes to build a new immutable state with structural sharing for untouched branches.
2. **Replace contract** — return a brand-new object from the reducer. Immer throws the draft away and uses your return value verbatim as the next state.

These contracts are mutually exclusive: if you did both, Immer would have to guess whether to honor the recorded draft mutations or the replacement object you returned. Rather than pick a silent winner, it errors loudly.

This pitfall shows up when someone starts with mutations, then adds `return state` at the bottom "to be explicit." That one line flips the reducer into the replace contract while the draft still has pending writes, which is exactly the forbidden combination.

**Takeaway:** In Immer (and thus `createSlice` case reducers): mutate OR return — never both.

---

**Q2: After dispatching an action that modifies state, are the `before` and `after` snapshots the same object reference, and does the old snapshot still show the old value?**

```js
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

**Output:** `false`

**Explanation:**

Intuition says "nothing changed, so the reference should stay," but that's not how Immer works. Immer tracks *writes* on the draft Proxy, not whether the new value is structurally equal to the old one. The moment your reducer executes `state.value = action.payload`, a write was recorded — and any non-empty set of recorded writes causes Immer to produce a new root object when the producer finishes.

Immer deliberately avoids deep equality comparisons because they'd be expensive and lossy on large trees. It's cheaper to blindly emit a new object than to diff the draft against the original. The trade-off: `setValue(5)` when the value is already `5` still creates a new state reference, and any `useSelector` watching the root (or `state.value`) will see a changed reference and potentially re-render.

For primitive selectors this is usually fine because `useSelector` also compares the *selected* value with `===`. `selectValue` returning `5 === 5` will short-circuit the re-render. But if you select an object (`state => state.user`) and dispatch a no-op update, the object reference changes even though no field did, and the component will re-render unnecessarily.

The real fix is at the dispatch site: guard with a condition, or use a selector that compares with `shallowEqual`, or avoid dispatching redundant updates altogether.

**Takeaway:** Immer does not deduplicate — any assignment on a draft produces a new state reference, even if the new value equals the old one.

---

### Selectors & Memoization

---

**Q4: When you call a `createSelector` memoized selector twice in a row against the same store state, how many times does the result function run and are the two returned arrays the same reference?**

```js
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

`createSelector` (from Reselect, re-exported by Redux Toolkit) returns a memoized function with a cache of size 1. Each time you call it, it first runs the *input selectors* (`selectItems`, `selectFilter`) and compares their outputs to what it saw on the previous call using `===` (reference equality). If every input matches, it skips the expensive result function entirely and returns the cached output.

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
const fetchUser = createAsyncThunk("user/fetch", async (userId) => {
  console.log("thunk executing");
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

const store = configureStore({
  reducer: createSlice({
    name: "user",
    initialState: { status: "idle" },
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
const fetchData = createAsyncThunk("data/fetch", async () => {
  return { items: [1, 2, 3] };
});

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
- `payload` — on fulfillment, the value your async function returned; on rejection, the error (or whatever you passed to `rejectWithValue`).
- `meta` — metadata about the request, including `meta.arg` (the argument you called the thunk with), `meta.requestId`, and `meta.requestStatus` (`"fulfilled"` | `"rejected"`).
- `error` — present only on rejection, with a serialized description of the thrown error.

Critically, even when the thunk *rejects internally*, the promise returned by `dispatch` still **resolves** — it resolves to a rejected-shape action. It does not throw. That's why code like `try { await dispatch(fetchX()); } catch {}` silently misses errors.

To get behavior that throws on rejection, wrap the result with `unwrapResult(result)` (or call `.unwrap()` on the promise itself: `await dispatch(fetchX()).unwrap()`). That helper inspects `meta.requestStatus` and either returns the payload or throws the error, which matches what developers intuitively expect from `await`.

**Takeaway:** `dispatch(asyncThunk())` resolves to an action object with `type`, `payload`, and `meta` — use `.unwrap()` or `unwrapResult` if you want throws on rejection.

---

**Q8: If a click handler dispatches `increment()` three times in a row on React 18, how many times does the component re-render and what are the logged values?**

```js
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

Under pre-React-18 rules and old React-Redux (v7), this would have logged three times: `render 1`, `render 2`, `render 3`. Each synchronous `dispatch` triggered subscribers, React scheduled a re-render, and the renders interleaved with the remaining dispatches.

React 18 introduced **automatic batching** for all state updates — not just ones inside React event handlers, but also promises, `setTimeout`, and native event handlers. React-Redux v8+ opts into this batching by using `useSyncExternalStore` under the hood, which cooperates with the concurrent renderer.

Here's what actually happens inside the click handler:
1. `dispatch(increment())` runs the reducer, the store's state reference changes, and subscribers are notified — but React defers the render.
2. The second and third dispatches each update the store; no render has happened yet.
3. The click handler returns. React flushes pending work, calls `useSelector` which now returns `3`, and re-renders the component exactly once.

The store state itself still goes through every intermediate value (1, then 2, then 3) — batching only deduplicates the *UI* renders, not the Redux state transitions. Middleware, subscribers registered via `store.subscribe`, and thunks still see every individual action.

If you genuinely need to see intermediate values, that's a design smell: combine the three dispatches into a single thunk or a single action with a richer payload.

**Takeaway:** React 18 batches multiple synchronous dispatches into a single re-render with the final state — store transitions are still per-dispatch, only the UI collapses.

---

### Middleware

---

**Q9: Given two logger middlewares registered as `[logger1, ...getDefault(), logger2]`, in what order do the four `before`/`after` logs appear when you dispatch one action?**

```js
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
const slice = createSlice({
  name: "test",
  initialState: { date: null },
  reducers: {
    setDate: (state, action) => {
      state.date = action.payload;
    },
  },
});

store.dispatch(slice.actions.setDate(new Date()));
```

**Output:** Console warning:
```
A non-serializable value was detected in an action, in the path: `payload`.
Value: Wed Apr 23 2026 ...
Take a look at the logic that dispatched this action: { type: 'test/setDate', payload: [Date] }
```

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
2. Every dispatch that writes to state creates a new state reference
3. createSelector memoizes — same inputs = same output reference
4. Inline filter/map in useSelector breaks memoization (new array every time)
5. createAsyncThunk dispatches: pending → fulfilled/rejected
6. dispatch(thunk()) returns a promise of the action, not the payload
7. React 18 batches multiple synchronous dispatches into one re-render
8. Middleware runs left-to-right (before), right-to-left (after) — onion pattern
9. RTK warns on non-serializable values (Date, Map, Set, functions)
10. Immer doesn't do deep equality — same value write still creates new reference
```

---

## References

- [Redux Toolkit Documentation](https://redux-toolkit.js.org) — Official RTK docs and tutorials
- [Redux Essentials Tutorial](https://redux.js.org/tutorials/essentials/part-1-overview-concepts) — Step-by-step Redux learning path
- [Redux Toolkit GitHub](https://github.com/reduxjs/redux-toolkit) — Source code and examples

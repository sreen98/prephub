# Redux Saga — Complete Guide

## Table of Contents

- [1. What is Redux Saga?](#1-what-is-redux-saga)
- [2. Generator Functions](#2-generator-functions)
- [3. Core Effects](#3-core-effects)
- [4. Watcher and Worker Pattern](#4-watcher-and-worker-pattern)
- [5. Concurrency Helpers](#5-concurrency-helpers)
- [6. Error Handling](#6-error-handling)
- [7. Advanced Patterns](#7-advanced-patterns)
- [8. Channels](#8-channels)
- [9. Testing](#9-testing)
- [10. Saga vs Thunk vs Listener Middleware](#10-saga-vs-thunk-vs-listener-middleware)
- [11. Best Practices](#11-best-practices)
- [12. Interview Questions & Answers](#12-interview-questions--answers)
- [13. Tricky Output Questions](#13-tricky-output-questions)

---

## 1. What is Redux Saga?

Redux Saga is a middleware library for handling **side effects** in Redux applications. It uses ES6 **generator functions** to make async flows look like synchronous code that's easy to read, write, and test.

Side effects include: API calls, data fetching, timers, WebSocket connections, browser cache access, and anything that interacts with the outside world.

```bash
npm install redux-saga
```

### Setup

```ts
import createSagaMiddleware from 'redux-saga';
import { configureStore } from '@reduxjs/toolkit';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);
```

---

## 2. Generator Functions

Sagas are built on JavaScript generators — functions that can pause and resume.

### 2.1 Generator Basics

```js
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numberGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }
```

### 2.2 Two-Way Communication

```js
function* conversation() {
  const name = yield 'What is your name?';   // pause, yield question
  const age = yield `Hello ${name}, how old are you?`;
  return `${name} is ${age} years old`;
}

const gen = conversation();
gen.next();          // { value: 'What is your name?', done: false }
gen.next('Alice');   // { value: 'Hello Alice, how old are you?', done: false }
gen.next(30);        // { value: 'Alice is 30 years old', done: true }
```

This is how sagas work: `yield` an effect (instruction), the saga middleware executes it, and passes the result back via `next()`.

### 2.3 Why Generators for Side Effects?

```js
// With generators, async code reads like sync
function* fetchUserSaga(action) {
  const user = yield call(api.getUser, action.payload);  // pause, wait for API
  yield put(fetchUserSuccess(user));                      // dispatch action
}

// Compare with async/await (similar readability, but generators are:
// 1. Pausable by the middleware (cancellation)
// 2. Yield plain objects (testable without mocking)
// 3. Controllable from outside (the saga runner drives execution)
```

---

## 3. Core Effects

Effects are plain JavaScript objects (instructions) that the saga middleware interprets. You `yield` them, and the middleware executes them.

### 3.1 call — Call a Function

```ts
import { call } from 'redux-saga/effects';

// Call an async function and wait for result
const users = yield call(api.getUsers);

// With arguments
const user = yield call(api.getUser, userId);

// Call a method on an object
const data = yield call([obj, obj.method], arg1, arg2);

// call is blocking — saga pauses until the function resolves
```

### 3.2 put — Dispatch an Action

```ts
import { put } from 'redux-saga/effects';

// Dispatch a Redux action
yield put(fetchUsersSuccess(users));
yield put({ type: 'FETCH_SUCCESS', payload: data });
```

### 3.3 select — Read from Store

```ts
import { select } from 'redux-saga/effects';

// Get entire state
const state = yield select();

// Get specific slice
const users = yield select(state => state.users.items);

// Use a selector
const activeUsers = yield select(selectActiveUsers);

// Get specific value
const userId = yield select(state => state.auth.userId);
```

### 3.4 take — Wait for an Action

```ts
import { take } from 'redux-saga/effects';

// Wait for a specific action type
const action = yield take('LOGIN_REQUEST');
console.log(action.payload);               // { email, password }

// Wait for any of multiple actions
const action = yield take(['LOGOUT', 'SESSION_EXPIRED']);

// Wait with pattern (function)
const action = yield take(action => action.type.endsWith('_FAILURE'));
```

### 3.5 fork — Non-Blocking Call

```ts
import { fork } from 'redux-saga/effects';

// Fork starts a task without waiting for it to complete
const task = yield fork(backgroundSync);

// Parent continues immediately
yield put(syncStarted());

// Later, cancel the forked task if needed
yield cancel(task);
```

### 3.6 delay — Wait for Time

```ts
import { delay } from 'redux-saga/effects';

// Wait 2 seconds
yield delay(2000);

// Polling pattern
while (true) {
  const data = yield call(api.fetchStatus);
  yield put(statusUpdated(data));
  yield delay(5000);                       // poll every 5 seconds
}
```

### 3.7 all — Run in Parallel

```ts
import { all, call } from 'redux-saga/effects';

// Run multiple effects in parallel (like Promise.all)
const [users, posts, comments] = yield all([
  call(api.getUsers),
  call(api.getPosts),
  call(api.getComments),
]);

// All three API calls fire simultaneously
// Saga waits until ALL complete
```

### 3.8 race — First to Complete Wins

```ts
import { race, call, delay } from 'redux-saga/effects';

// Race between API call and timeout
const { response, timeout } = yield race({
  response: call(api.fetchData),
  timeout: delay(5000),
});

if (timeout) {
  yield put(fetchTimedOut());
} else {
  yield put(fetchSuccess(response));
}

// The losing effect is automatically cancelled
```

### 3.9 Effects Summary

```
call(fn, ...args)      — Call function, wait for result (blocking)
put(action)            — Dispatch Redux action
select(selector)       — Read from Redux store
take(pattern)          — Wait for a specific action (blocking)
fork(fn, ...args)      — Start non-blocking task
spawn(fn, ...args)     — Start detached task (survives parent cancellation)
cancel(task)           — Cancel a forked task
cancelled()            — Check if current saga was cancelled
delay(ms)              — Wait for milliseconds
all([...effects])      — Run effects in parallel (wait for all)
race({...effects})     — Run effects in parallel (first wins)
takeEvery(pattern, fn) — Fork fn for every matching action
takeLatest(pattern, fn)— Fork fn, cancel previous if still running
takeLeading(pattern, fn)— Fork fn, ignore while running
debounce(ms, pattern, fn)— Fork fn after ms of inactivity
throttle(ms, pattern, fn) — Fork fn at most once per ms
```

---

## 4. Watcher and Worker Pattern

The most common saga pattern: a **watcher** listens for actions, a **worker** handles them.

### 4.1 Basic Pattern

```ts
// Worker saga — handles the side effect
function* fetchUsersSaga() {
  try {
    yield put(fetchUsersRequest());
    const users = yield call(api.getUsers);
    yield put(fetchUsersSuccess(users));
  } catch (error) {
    yield put(fetchUsersFailure(error.message));
  }
}

// Watcher saga — listens for trigger action
function* watchFetchUsers() {
  yield takeLatest('users/fetchRequest', fetchUsersSaga);
}

// Root saga — combines all watchers
function* rootSaga() {
  yield all([
    watchFetchUsers(),
    watchCreateUser(),
    watchDeleteUser(),
  ]);
}
```

### 4.2 With Payload

```ts
function* fetchUserByIdSaga(action: PayloadAction<string>) {
  try {
    const userId = action.payload;
    const user = yield call(api.getUser, userId);
    yield put(fetchUserSuccess(user));
  } catch (error) {
    yield put(fetchUserFailure(error.message));
  }
}

function* watchFetchUser() {
  yield takeLatest(fetchUserRequest.type, fetchUserByIdSaga);
}
```

---

## 5. Concurrency Helpers

### 5.1 takeEvery

```ts
// Handles EVERY dispatched action (multiple concurrent)
yield takeEvery('FETCH_REQUESTED', fetchSaga);

// If user clicks 3 times, 3 sagas run in parallel
// Use for: actions where every instance matters (analytics events, batch operations)
```

### 5.2 takeLatest

```ts
// Cancels previous running saga, starts new one
yield takeLatest('SEARCH_CHANGED', searchSaga);

// If user types "a", "ab", "abc" — only "abc" search runs
// Previous requests are cancelled automatically
// Use for: search, filters, form auto-save
```

### 5.3 takeLeading

```ts
// Ignores new actions while saga is running
yield takeLeading('SUBMIT_FORM', submitSaga);

// If user double-clicks submit, only first click is processed
// Use for: form submission, prevent double-actions
```

### 5.4 debounce

```ts
// Waits for N ms of inactivity before running
yield debounce(300, 'SEARCH_CHANGED', searchSaga);

// User types "a" (wait 300ms) — no new input — runs search for "a"
// User types "a", "b", "c" rapidly — only runs search for "c"
// Use for: search input, auto-save, resize handlers
```

### 5.5 throttle

```ts
// Runs at most once per N ms
yield throttle(1000, 'SCROLL', handleScroll);

// User scrolls continuously — handler runs once per second
// Use for: scroll handlers, resize, rate-limited APIs
```

### 5.6 Comparison

```
takeEvery:   A-A-A → handles all three (concurrent)
takeLatest:  A-A-A → cancels first two, handles third
takeLeading: A-A-A → handles first, ignores second and third
debounce:    A-A-A → waits for silence, handles once
throttle:    A-A-A → handles first, waits, handles next allowed
```

---

## 6. Error Handling

### 6.1 Try/Catch in Worker Saga

```ts
function* fetchUsersSaga() {
  try {
    const users = yield call(api.getUsers);
    yield put(fetchUsersSuccess(users));
  } catch (error) {
    yield put(fetchUsersFailure(error.message));
    // Optionally show toast
    yield put(showToast({ type: 'error', message: 'Failed to fetch users' }));
  }
}
```

### 6.2 Safe Wrapper

```ts
function* safeSaga(saga, ...args) {
  try {
    yield call(saga, ...args);
  } catch (error) {
    console.error('Saga error:', error);
    yield put(showErrorToast(error.message));
  }
}

// Usage
function* watchFetchUsers() {
  yield takeLatest('FETCH_USERS', safeSaga, fetchUsersSaga);
}
```

### 6.3 Retry Pattern

```ts
function* fetchWithRetry(fn, ...args) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return yield call(fn, ...args);
    } catch (error) {
      if (attempt === 2) throw error;       // final attempt, re-throw
      yield delay(1000 * Math.pow(2, attempt)); // exponential backoff
    }
  }
}

function* fetchUsersSaga() {
  try {
    const users = yield call(fetchWithRetry, api.getUsers);
    yield put(fetchUsersSuccess(users));
  } catch (error) {
    yield put(fetchUsersFailure(error.message));
  }
}
```

### 6.4 Cancellation Cleanup

```ts
function* pollingSaga() {
  try {
    while (true) {
      const data = yield call(api.fetchStatus);
      yield put(statusUpdated(data));
      yield delay(5000);
    }
  } finally {
    if (yield cancelled()) {
      console.log('Polling cancelled, cleaning up...');
      yield put(pollingCancelled());
    }
  }
}
```

---

## 7. Advanced Patterns

### 7.1 Polling

```ts
function* pollingSaga(action) {
  const { jobId } = action.payload;

  while (true) {
    try {
      const status = yield call(api.getStatus, jobId);
      yield put(statusUpdated(status));

      if (status.state === 'completed' || status.state === 'failed') {
        break;                               // stop polling
      }

      yield delay(3000);
    } catch (error) {
      yield put(pollingError(error.message));
      break;
    }
  }
}

// Start/stop polling with takeLatest (new start cancels old)
function* watchPolling() {
  yield takeLatest('START_POLLING', pollingSaga);
}
```

### 7.2 Polling with Exponential Backoff

```ts
function* pollWithBackoff(action) {
  const { conversationId } = action.payload;
  let interval = 15000;                      // start at 15s
  const minInterval = 2000;

  while (true) {
    try {
      const status = yield call(api.checkStatus, conversationId);

      if (status === 'completed') {
        yield put(statusComplete());
        break;
      }
      if (status === 'failed') {
        yield put(statusFailed());
        break;
      }

      yield delay(interval);
      interval = Math.max(interval / 2, minInterval); // decrease interval
    } catch (error) {
      yield put(statusError(error.message));
      break;
    }
  }
}
```

### 7.3 Multi-Step Workflow

```ts
function* createJobSaga(action) {
  try {
    // Step 1: Start conversation
    yield put(setCreating(true));
    const { conversationId } = yield call(api.startConversation, action.payload);

    // Step 2: Poll for AI response
    yield put(setPolling(true));
    let status = 'processing';
    while (status === 'processing') {
      yield delay(2000);
      const result = yield call(api.checkStatus, conversationId);
      status = result.status;
    }
    yield put(setPolling(false));

    if (status === 'failed') {
      throw new Error('AI processing failed');
    }

    // Step 3: Get conversation details
    const details = yield call(api.getDetails, conversationId);
    yield put(conversationLoaded(details));

    // Step 4: Create JD
    const reply = yield select(selectCompletedReply);
    const job = yield call(api.createJd, { conversationId, prompt: reply });
    yield put(jobCreated(job));

    // Step 5: Monitor agent
    yield call(monitorAgentSaga, conversationId);

  } catch (error) {
    yield put(createJobFailed(error.message));
  } finally {
    yield put(setCreating(false));
  }
}
```

### 7.4 Login/Logout Flow

```ts
function* authFlowSaga() {
  while (true) {
    // Wait for login
    const { payload } = yield take('LOGIN_REQUEST');

    // Try to authenticate
    const task = yield fork(loginSaga, payload);

    // Wait for logout or login failure
    const action = yield take(['LOGOUT', 'LOGIN_FAILURE']);

    if (action.type === 'LOGOUT') {
      yield cancel(task);                    // cancel login if still running
    }

    yield call(api.logout);
    yield put(clearUserData());
  }
}

function* loginSaga(credentials) {
  try {
    const user = yield call(api.login, credentials);
    yield put(loginSuccess(user));
    yield put(loadUserProfile());
  } catch (error) {
    yield put(loginFailure(error.message));
  }
}
```

### 7.5 Debounced Search

```ts
function* searchSaga(action) {
  // Debounce is handled by the watcher
  const { query } = action.payload;

  if (query.length < 2) {
    yield put(clearResults());
    return;
  }

  try {
    yield put(setSearching(true));
    const results = yield call(api.search, query);
    yield put(searchSuccess(results));
  } catch (error) {
    yield put(searchFailure(error.message));
  } finally {
    yield put(setSearching(false));
  }
}

function* watchSearch() {
  yield debounce(300, 'SEARCH_INPUT_CHANGED', searchSaga);
}
```

### 7.6 Parallel and Sequential Tasks

```ts
// Parallel: all run simultaneously
function* loadDashboard() {
  const [kpis, alerts, pipeline] = yield all([
    call(api.getKPIs),
    call(api.getAlerts),
    call(api.getPipeline),
  ]);
  yield put(dashboardLoaded({ kpis, alerts, pipeline }));
}

// Sequential: each waits for the previous
function* processSteps() {
  const step1 = yield call(api.step1);
  const step2 = yield call(api.step2, step1.id);
  const step3 = yield call(api.step3, step2.id);
  yield put(processComplete(step3));
}
```

---

## 8. Channels

Channels are used for communication between sagas and for handling external event sources.

### 8.1 Action Channel (Buffered Actions)

```ts
import { actionChannel } from 'redux-saga/effects';

function* watchUpload() {
  // Buffer all UPLOAD_REQUEST actions
  const channel = yield actionChannel('UPLOAD_REQUEST');

  while (true) {
    // Process one at a time (sequential)
    const action = yield take(channel);
    yield call(uploadFileSaga, action);
  }
}
// Even if 10 uploads are dispatched at once, they process one by one
```

### 8.2 Event Channel (External Events)

```ts
import { eventChannel } from 'redux-saga';

// Create a channel from WebSocket events
function createWebSocketChannel(url) {
  return eventChannel((emit) => {
    const ws = new WebSocket(url);
    ws.onmessage = (event) => emit(JSON.parse(event.data));
    ws.onerror = (error) => emit(new Error(error.message));
    ws.onclose = () => emit(END);          // close the channel

    return () => ws.close();               // cleanup function
  });
}

function* watchWebSocket() {
  const channel = yield call(createWebSocketChannel, 'ws://localhost:8080');

  try {
    while (true) {
      const message = yield take(channel);
      yield put(messageReceived(message));
    }
  } finally {
    channel.close();
  }
}
```

---

## 9. Testing

One of the biggest advantages of sagas: they yield plain objects, making them easy to test without mocking.

### 9.1 Step-by-Step Testing

```ts
import { call, put, select } from 'redux-saga/effects';
import { fetchUsersSaga } from './users.saga';

describe('fetchUsersSaga', () => {
  it('should fetch users successfully', () => {
    const gen = fetchUsersSaga();

    // Step 1: should call API
    expect(gen.next().value).toEqual(call(api.getUsers));

    // Step 2: should dispatch success with data
    const mockUsers = [{ id: '1', name: 'Alice' }];
    expect(gen.next(mockUsers).value).toEqual(put(fetchUsersSuccess(mockUsers)));

    // Step 3: should be done
    expect(gen.next().done).toBe(true);
  });

  it('should handle errors', () => {
    const gen = fetchUsersSaga();
    gen.next();                              // advance to call

    // Throw error into the generator
    const error = new Error('Network error');
    expect(gen.throw(error).value).toEqual(
      put(fetchUsersFailure('Network error'))
    );
  });
});
```

### 9.2 Testing with redux-saga-test-plan

```ts
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import { throwError } from 'redux-saga-test-plan/providers';

describe('fetchUsersSaga', () => {
  it('should fetch users', () => {
    const mockUsers = [{ id: '1', name: 'Alice' }];

    return expectSaga(fetchUsersSaga)
      .provide([
        [matchers.call.fn(api.getUsers), mockUsers],
      ])
      .put(fetchUsersSuccess(mockUsers))
      .run();
  });

  it('should handle errors', () => {
    return expectSaga(fetchUsersSaga)
      .provide([
        [matchers.call.fn(api.getUsers), throwError(new Error('fail'))],
      ])
      .put(fetchUsersFailure('fail'))
      .run();
  });
});
```

### 9.3 Testing with Select

```ts
it('should use current user from store', () => {
  const gen = createOrderSaga();

  // Call select
  expect(gen.next().value).toEqual(select(selectCurrentUser));

  // Provide mock state
  const mockUser = { id: '1', name: 'Alice' };
  expect(gen.next(mockUser).value).toEqual(
    call(api.createOrder, { userId: mockUser.id })
  );
});
```

---

## 10. Saga vs Thunk vs Listener Middleware

### 10.1 Comparison Table

| Feature | Thunk | Saga | Listener Middleware |
|---------|-------|------|-------------------|
| Syntax | async/await | Generators (yield) | async/await |
| Bundle size | Built into RTK | ~5KB extra | Built into RTK |
| Learning curve | Low | High | Low |
| Cancellation | Manual (AbortController) | Built-in (cancel, race) | Built-in (unsubscribe) |
| Testing | Mock async functions | Assert yielded effects (no mocking) | Mock async functions |
| Complex workflows | Difficult | Excellent | Moderate |
| Debounce/throttle | Manual | Built-in effects | Manual |
| Channels/events | No | Yes | No |
| Parallel execution | Promise.all | all, fork | Promise.all |

### 10.2 When to Use What

```
Simple async (fetch + dispatch):
  → Thunk or Listener Middleware

Complex orchestration (multi-step, polling, cancellation):
  → Redux Saga

Reactive side effects (respond to state changes):
  → Listener Middleware

External event sources (WebSocket, SSE):
  → Redux Saga (channels)
```

### 10.3 Code Comparison

```ts
// THUNK
const fetchUsers = createAsyncThunk('users/fetch', async () => {
  return await api.getUsers();
});

// SAGA
function* fetchUsersSaga() {
  try {
    const users = yield call(api.getUsers);
    yield put(fetchUsersSuccess(users));
  } catch (e) {
    yield put(fetchUsersFailure(e.message));
  }
}

// LISTENER
listenerMiddleware.startListening({
  actionCreator: fetchUsersRequest,
  effect: async (action, listenerApi) => {
    try {
      const users = await api.getUsers();
      listenerApi.dispatch(fetchUsersSuccess(users));
    } catch (e) {
      listenerApi.dispatch(fetchUsersFailure(e.message));
    }
  },
});
```

---

## 11. Best Practices

### 11.1 Structure

```
src/store/
  users/
    users.slice.ts
    users.saga.ts          # feature saga
    users.selectors.ts
    users.types.ts
    index.ts
  root-saga.ts             # combines all sagas
```

```ts
// root-saga.ts
import { all, fork } from 'redux-saga/effects';

export function* rootSaga() {
  yield all([
    fork(watchAuth),
    fork(watchUsers),
    fork(watchJobs),
    fork(watchConversation),
  ]);
}
```

### 11.2 Do's and Don'ts

```
DO:
- Use takeLatest for most API fetches (prevents stale data)
- Use takeLeading for form submissions (prevents double-submit)
- Always handle errors with try/catch
- Use the cancelled() effect for cleanup in finally blocks
- Keep worker sagas focused (one responsibility)
- Use select() to read from store instead of passing data through actions

DON'T:
- Don't call store.getState() directly — use yield select()
- Don't dispatch actions directly — use yield put()
- Don't make API calls directly — use yield call()
- Don't use sagas for simple async (thunks are fine for basic fetch-dispatch)
- Don't let sagas grow too large — split into focused workers
```

---

## 12. Interview Questions & Answers

### Beginner

---

**Q1: What is Redux Saga and why use it?**

Redux Saga is a middleware library that handles side effects (API calls, timers, etc.) in Redux applications using generator functions. You use it because:
- Generators make async code look synchronous
- Built-in cancellation, debouncing, throttling
- Easy to test (yield plain objects, no mocking needed)
- Handles complex async workflows (polling, race conditions, parallel tasks)

---

**Q2: What are generator functions and how do sagas use them?**

Generator functions are functions that can pause (`yield`) and resume. In sagas:
1. You `yield` an effect (instruction like `call`, `put`, `take`)
2. The saga middleware executes the effect
3. The result is passed back into the generator via `next()`
4. The generator continues to the next `yield`

```ts
function* mySaga() {
  const data = yield call(api.fetch);      // pause, wait for API
  yield put(success(data));                // dispatch action
}
```

---

**Q3: What is the difference between `call` and `put`?**

- `call(fn, ...args)`: Calls a function (usually async) and waits for it to resolve. Used for API calls, async operations.
- `put(action)`: Dispatches a Redux action. Used to update the store.

```ts
const users = yield call(api.getUsers);    // call API, wait for response
yield put(fetchUsersSuccess(users));       // dispatch to store
```

---

**Q4: What is the difference between `takeEvery` and `takeLatest`?**

- `takeEvery`: Runs the saga for EVERY action dispatched. Multiple instances can run concurrently.
- `takeLatest`: Cancels any previous running instance and runs a new one. Only the latest matters.

```ts
yield takeEvery('FETCH', fetchSaga);    // 3 clicks = 3 API calls
yield takeLatest('FETCH', fetchSaga);   // 3 clicks = only last one runs
```

Use `takeLatest` for searches/filters. Use `takeEvery` when every action matters (analytics events).

---

**Q5: How do you handle errors in sagas?**

Use try/catch in the worker saga:

```ts
function* fetchUsersSaga() {
  try {
    const users = yield call(api.getUsers);
    yield put(fetchSuccess(users));
  } catch (error) {
    yield put(fetchFailure(error.message));
  }
}
```

The saga middleware catches errors thrown by `call()` and passes them to the catch block. Without try/catch, the saga terminates silently.

---

### Intermediate

---

**Q6: Explain the `fork` and `spawn` effects.**

Both start non-blocking tasks, but differ in error propagation:

- `fork`: Creates an **attached** task. Errors propagate to the parent (if child crashes, parent receives the error). Parent cancellation also cancels forked children.
- `spawn`: Creates a **detached** task. Errors are isolated. Parent cancellation doesn't affect spawned tasks.

```ts
function* rootSaga() {
  yield fork(watchAuth);     // attached: if watchAuth throws, rootSaga catches it
  yield spawn(analytics);    // detached: analytics crash doesn't affect rootSaga
}
```

Use `fork` for critical tasks. Use `spawn` for independent, non-critical tasks.

---

**Q7: How does the `race` effect work?**

`race` runs multiple effects in parallel and completes when the FIRST one finishes. The losers are automatically cancelled.

```ts
const { response, timeout } = yield race({
  response: call(api.fetchData),
  timeout: delay(5000),
});

if (timeout) {
  // API took too long
} else {
  // Got response
}
```

Common use cases: API timeouts, cancellation (race between fetch and cancel action), first-response-wins from multiple endpoints.

---

**Q8: How do you implement polling with a saga?**

```ts
function* pollSaga(action) {
  while (true) {
    const data = yield call(api.getStatus, action.payload.id);
    yield put(statusUpdated(data));

    if (data.status === 'completed' || data.status === 'failed') break;

    yield delay(3000);
  }
}

function* watchPoll() {
  yield takeLatest('START_POLL', pollSaga);
  // takeLatest ensures new poll cancels previous one
}
```

The saga loops, calling the API, dispatching updates, and sleeping. Using `takeLatest` means starting a new poll automatically cancels the previous one.

---

**Q9: What is `actionChannel` and when would you use it?**

`actionChannel` buffers incoming actions so you can process them one at a time:

```ts
function* uploadQueue() {
  const channel = yield actionChannel('UPLOAD_FILE');
  while (true) {
    const action = yield take(channel);
    yield call(uploadSaga, action);        // process one at a time
  }
}
```

Without `actionChannel`, if 10 files are dispatched for upload simultaneously, all 10 would run concurrently (with `takeEvery`). With `actionChannel`, they queue and process sequentially.

Use for: sequential processing, rate limiting, ordered operations.

---

**Q10: How are sagas tested differently from thunks?**

Sagas yield plain objects (effects), so you test by comparing the yielded values step-by-step:

```ts
// Saga test (no mocking needed)
const gen = fetchUsersSaga();
expect(gen.next().value).toEqual(call(api.getUsers));  // check the instruction
expect(gen.next(mockData).value).toEqual(put(success(mockData)));

// Thunk test (requires mocking)
jest.mock('../api');
api.getUsers.mockResolvedValue(mockData);
await store.dispatch(fetchUsers());
expect(store.getState().users).toEqual(mockData);
```

Saga tests are synchronous and don't need mocks — you're testing the flow logic, not the side effects. This makes them faster and more deterministic.

---

### Advanced

---

**Q11: Explain event channels and give a real-world use case.**

Event channels bridge external event sources (not Redux actions) into the saga world:

```ts
function createSocketChannel(url) {
  return eventChannel(emit => {
    const ws = new WebSocket(url);
    ws.onmessage = (e) => emit(JSON.parse(e.data));
    ws.onerror = () => emit(END);
    return () => ws.close();
  });
}

function* watchSocket() {
  const channel = yield call(createSocketChannel, 'ws://...');
  while (true) {
    const message = yield take(channel);
    yield put(messageReceived(message));
  }
}
```

Real-world use cases: WebSocket connections, SSE, Geolocation watch, BroadcastChannel, keyboard shortcuts.

---

**Q12: How would you implement a cancellable multi-step saga?**

```ts
function* processJobSaga(action) {
  try {
    // Step 1: Create
    const job = yield call(api.createJob, action.payload);
    yield put(jobCreated(job));

    // Step 2: Poll for processing
    while (true) {
      const status = yield call(api.checkStatus, job.id);
      yield put(statusUpdated(status));
      if (status.done) break;
      yield delay(2000);
    }

    // Step 3: Fetch results
    const results = yield call(api.getResults, job.id);
    yield put(jobCompleted(results));

  } catch (error) {
    yield put(jobFailed(error.message));

  } finally {
    if (yield cancelled()) {
      // Cleanup: cancel the job on the server
      yield call(api.cancelJob, action.payload.id);
      yield put(jobCancelled());
    }
  }
}

// The watcher — new process cancels old
function* watchProcess() {
  yield takeLatest('PROCESS_JOB', processJobSaga);
}

// Or manual cancel
function* watchProcess() {
  while (true) {
    const action = yield take('PROCESS_JOB');
    const task = yield fork(processJobSaga, action);
    yield take('CANCEL_PROCESS');
    yield cancel(task);
  }
}
```

---

**Q13: How do `all` and `race` handle errors?**

**`all`** (parallel, fail-fast):
- If ANY effect throws, `all` throws and cancels all remaining effects
- All effects must succeed for `all` to succeed
- Like `Promise.all`

```ts
try {
  const [a, b, c] = yield all([call(api.a), call(api.b), call(api.c)]);
  // Only reaches here if ALL succeed
} catch (error) {
  // If ANY fails, all others are cancelled
}
```

**`race`** (parallel, first-wins):
- First to complete (success or error) wins
- All losers are automatically cancelled
- If the winner throws, race throws

```ts
const { response, timeout } = yield race({
  response: call(api.fetch),
  timeout: delay(5000),
});
// One of these will be defined, the other will be undefined
```

---

**Q14: How would you implement saga composition (reusable saga helpers)?**

```ts
// Reusable retry saga
function* withRetry(saga, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return yield call(saga);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      yield delay(delayMs * Math.pow(2, attempt));
    }
  }
}

// Reusable loading wrapper
function* withLoading(saga, startAction, successAction, failureAction) {
  try {
    yield put(startAction());
    const result = yield call(saga);
    yield put(successAction(result));
    return result;
  } catch (error) {
    yield put(failureAction(error.message));
    throw error;
  }
}

// Usage
function* fetchUsersSaga() {
  yield call(withLoading,
    function*() { return yield call(withRetry, function*() { return yield call(api.getUsers); }); },
    fetchUsersStart,
    fetchUsersSuccess,
    fetchUsersFailure
  );
}
```

---

**Q15: Compare the testing approaches for sagas (step-by-step vs integration).**

**Step-by-step** (unit testing):
```ts
const gen = fetchSaga();
expect(gen.next().value).toEqual(call(api.fetch));
expect(gen.next(data).value).toEqual(put(success(data)));
```
- Pros: No mocking, fast, deterministic
- Cons: Tightly coupled to implementation (breaks if you reorder effects)

**Integration testing** (redux-saga-test-plan):
```ts
return expectSaga(fetchSaga)
  .provide([[call.fn(api.fetch), data]])
  .put(success(data))
  .run();
```
- Pros: Tests behavior (what actions are dispatched), not implementation order
- Cons: Slightly more setup, less granular

**Recommendation**: Use integration testing for most sagas. Use step-by-step only for complex flows where order matters.

---

**Q16: In what scenarios would you choose Redux Saga over other async solutions?**

Choose sagas when you need:
1. **Complex async orchestration**: Multi-step workflows with branching (conversation flow: start -> poll -> reply -> poll -> create -> monitor)
2. **Cancellation**: Built-in cancel effects, race conditions, takeLatest
3. **Channels**: WebSocket, SSE, or external event source integration
4. **Debounce/throttle**: Built-in helpers without external libraries
5. **Testing without mocks**: Generator step-testing is unique to sagas
6. **Long-running processes**: Background polling, sync, etc.

For simple fetch-dispatch patterns, thunks or React Query are sufficient and simpler.

---

## 13. Tricky Output Questions

Practice questions testing your understanding of generator execution, saga effect ordering, and concurrency helpers.

### Generator Basics

---

**Q1: Stepping through a generator with `next()`, `next("hello")`, `next("world")` — what does each call log and what object does each `next()` return?**

```js
function* gen() {
  console.log("A");
  const x = yield 1;
  console.log("B", x);
  const y = yield 2;
  console.log("C", y);
  return 3;
}

const it = gen();
console.log(it.next());
console.log(it.next("hello"));
console.log(it.next("world"));
```

**Output:**
```
A
{ value: 1, done: false }
B hello
{ value: 2, done: false }
C world
{ value: 3, done: true }
```

**Explanation:**

Calling `gen()` does *not* run the function body — it returns an iterator object that is paused before the first line. Execution only advances when you call `.next()`, and it advances up to (and pauses *at*) the next `yield` or `return`.

- The **first** `it.next()` is the "starter". The generator runs from the top: it prints `"A"`, then evaluates `yield 1`, which suspends the function. `next()` returns `{ value: 1, done: false }` — `value` is whatever was yielded out, `done: false` means the generator has not finished.
- The **second** call, `it.next("hello")`, resumes the paused `yield 1` expression. The argument `"hello"` is injected as the *result* of that `yield`, so `x = "hello"`. Execution continues: `console.log("B", x)` prints `B hello`, then it pauses at `yield 2`, returning `{ value: 2, done: false }`.
- The **third** call, `it.next("world")`, does the same: `"world"` becomes the value of `yield 2`, so `y = "world"`, `C world` is printed, and the function hits `return 3`. The iterator yields one final envelope `{ value: 3, done: true }`.

This is exactly how Redux-Saga middleware drives your sagas: it receives each yielded effect descriptor (like `{ value: callEffect, done: false }`), resolves the effect, and then calls `it.next(resolvedValue)` so the resolved value appears on the left-hand side of the `const x = yield ...` inside your saga.

**Takeaway:** `gen()` returns a paused iterator; each `next(v)` injects `v` into the currently-paused `yield` and runs until the next `yield`/`return`.

---

**Q2: When you resume a paused generator with `next()` and pass no argument, what value does the previously-paused `yield` expression evaluate to inside the generator?**

```js
function* gen() {
  const a = yield 1;
  const b = yield 2;
  console.log(a, b);
}

const it = gen();
it.next();      // runs up to `yield 1`
it.next();      // resumes — what does `a` become?
it.next();      // resumes — what does `b` become?
```

**Output:**
```
undefined undefined
```

**Explanation:**

A generator pauses *at* each `yield`. When you call `it.next(value)`, `value` is injected back into the generator and becomes the evaluation result of the paused `yield` — i.e., the right-hand side of the `const` declaration that owns that `yield`.

- The first `it.next()` is the starter call. The generator runs from the top and hits `yield 1`. The argument you pass in here is *ignored* because there is no paused `yield` waiting yet. The outside world receives `{ value: 1, done: false }`.
- The second `it.next()` resumes the generator. The paused `yield 1` expression is replaced by whatever you passed. You passed nothing, so `yield 1` → `undefined`, and `a = undefined`.
- The third `it.next()` does the same for `yield 2`, so `b = undefined`. `console.log(a, b)` then prints `undefined undefined`.

This asymmetry (the value you yield *out* is not the value that flows back *in* on resume) is the foundation of Redux-Saga's design: the saga yields an effect *description*, the middleware does the actual work, and only then does it call `it.next(result)` so the saga sees the resolved value.

**Takeaway:** `yield` evaluates to the argument of the *next* `next()` call — not to the value you yielded out.

---

**Q3: When you spread a generator into an array (`[...gen()]`), are values produced by `return` included alongside values produced by `yield`, and what happens to code after `return`?**

```js
function* gen() {
  yield 1;
  return 2;
  yield 3;
}

const results = [...gen()];
console.log(results);
```

**Output:**
```
[1]
```

**Explanation:**

Spread syntax (`...`) and `for...of` both consume an iterator by calling `.next()` in a loop and **stopping as soon as `done` becomes `true`**. Crucially, the `value` of the envelope that carries `done: true` is *not* included in the collected results — it's treated as a terminator, not a data point.

- The first `.next()` yields `1` with `done: false`, so `1` is pushed into the array.
- The second `.next()` hits `return 2`, which produces `{ value: 2, done: true }`. Because `done` is `true`, spread stops — and `2` is discarded, not included.
- `yield 3` is never reached. It's unreachable code after a `return`.

This is why idiomatic generators (and sagas) emit values with `yield` and only use `return` to signal "I'm finished, here's an optional completion value that consumers are free to ignore." In a saga, the `return` value of a forked task is accessible via `task.result()`, but during normal iteration it's not a "yielded" effect.

**Takeaway:** Spread / `for...of` collects values until `done: true` and drops the final `return` value — use `yield` for data, `return` only for termination.

---

### Saga Effects

---

**Q4: In a saga that interleaves `console.log`, `yield put(...)`, and `yield call(api.fetch)`, what is the exact order of console output vs dispatched actions, and where does execution pause?**

```js
function* saga() {
  console.log("A");
  yield put({ type: "FIRST" });
  console.log("B");
  yield call(api.fetch);
  console.log("C");
  yield put({ type: "SECOND" });
  console.log("D");
}
```

**Output (console logs and dispatched actions, in order):**
```
A
→ dispatch FIRST
B
(waits for api.fetch to resolve)
C
→ dispatch SECOND
D
```

**Explanation:**

Every `yield` in a saga hands a plain effect description to the middleware. The middleware then decides how to execute it and when to resume the saga via `next()`. Two effect types have very different blocking behavior:

- `put(action)` is effectively **synchronous** from the saga's point of view. The middleware dispatches the action through the store (reducers run, subscribers notify) and *immediately* resumes the saga on the same tick. So `"A"` prints, `FIRST` is dispatched, and `"B"` prints without any real wait.
- `call(fn, ...args)` invokes `fn` and, if it returns a Promise (as `api.fetch` does), **blocks** the saga until that Promise settles. The middleware does not call `it.next(...)` again until the Promise resolves. That's why `"C"` does not print until the fetch completes.
- After the fetch resolves, the saga resumes, logs `"C"`, `put`s `SECOND` synchronously, and finally logs `"D"`.

This ordering is what makes sagas read like synchronous code despite being asynchronous: `put` gets out of the way fast, `call` is the deliberate pause point.

**Takeaway:** `put` is synchronous and non-blocking; `call` blocks the saga until the called function's promise settles.

---

**Q5: When a parent saga uses `yield fork(childSaga)` followed by `yield call(slowTask)`, does the parent wait for the child before continuing, and in what order do the child's and parent's `console.log`s appear?**

```js
function* parentSaga() {
  console.log("1");
  yield fork(childSaga);
  console.log("2");
  yield call(slowTask);
  console.log("3");
}

function* childSaga() {
  console.log("child start");
  yield delay(1000);
  console.log("child end");
}
```

**Output:**
```
1
child start
2
(waits for slowTask)
3
child end (after 1s, concurrent with parent)
```

**Explanation:**

`fork` and `call` are the two fundamental ways to invoke another function/saga, and they differ in exactly one dimension: **blocking behavior**.

- `yield call(fn)` says "run `fn` and pause me until it finishes." The parent literally cannot advance past that `yield` until the called function resolves.
- `yield fork(saga)` says "start `saga` in a separate task, hand me back a Task handle *immediately*, and keep going." Forked sagas run concurrently with their parent on the same event loop — they're not OS threads, they're cooperatively scheduled tasks.

So the trace goes: parent logs `"1"`, forks the child. The middleware synchronously enters the child, which logs `"child start"` and hits `delay(1000)` — that suspends the child. Control returns to the parent, which logs `"2"` and then `call(slowTask)` — which blocks the parent. While the parent is blocked on `slowTask`, the child's 1-second delay elapses and it logs `"child end"`. When `slowTask` finally resolves, the parent logs `"3"`.

Note the child logs appear *before* the parent's next line when no async boundary exists — `fork` runs the child synchronously up to its first blocking yield.

**Takeaway:** `call` blocks the parent; `fork` returns immediately and lets the child run concurrently.

---

**Q6: With `takeLatest("FETCH", fetchSaga)` and three `FETCH` actions dispatched rapidly (ids 1, 2, 3) before any API call finishes, which saga instances start, which complete, and which `SUCCESS` action is dispatched?**

```js
function* fetchSaga(action) {
  console.log("fetch started:", action.id);
  const data = yield call(api.fetch, action.id);
  console.log("fetch completed:", action.id);
  yield put({ type: "SUCCESS", data });
}

function* watchFetch() {
  yield takeLatest("FETCH", fetchSaga);
}

// User dispatches rapidly:
// dispatch({ type: "FETCH", id: 1 })  // at t=0
// dispatch({ type: "FETCH", id: 2 })  // at t=50ms
// dispatch({ type: "FETCH", id: 3 })  // at t=100ms
```

**Output:**
```
fetch started: 1
fetch started: 2
fetch started: 3
fetch completed: 3
→ dispatch SUCCESS (id: 3 data)
```

**Explanation:**

`takeLatest(pattern, saga)` is essentially shorthand for "watch for actions matching `pattern`; each time one arrives, *cancel* the previously spawned instance of `saga` if it's still running, then start a new one." It's the standard cure for search-as-you-type races, double-clicked buttons, and stale responses overwriting fresh data.

Walking through the timeline:

- **t=0**: `FETCH id=1` is taken. `fetchSaga` starts, logs `"fetch started: 1"`, and blocks on `call(api.fetch, 1)`.
- **t=50ms**: `FETCH id=2` arrives. `takeLatest` cancels the still-pending saga for id 1 (it is cancelled *at* the `yield call` point, so `"fetch completed: 1"` never logs and no `SUCCESS` for id 1 is ever dispatched). A new instance starts, logs `"fetch started: 2"`, and blocks on its own `call`.
- **t=100ms**: `FETCH id=3` arrives. Instance 2 is cancelled identically. Instance 3 starts, logs `"fetch started: 3"`.
- Since no new `FETCH` arrives, instance 3 eventually resolves its `call`, logs `"fetch completed: 3"`, and `put`s `SUCCESS` with id 3's data.

Only the *latest* response is applied to the store — earlier, possibly-slower responses can never clobber it because their sagas were killed before reaching `put`.

**Takeaway:** `takeLatest` auto-cancels in-flight previous runs; use it to prevent stale async results from winning the race.

---

**Q7: If a saga does `yield put({ type: "INCREMENT" })` and then immediately `yield select(state => state.counter)`, does `select` see the state *before* or *after* the increment?**

```js
// Initial state: { counter: 0 }

function* saga() {
  yield put({ type: "INCREMENT" }); // counter becomes 1
  const count = yield select(state => state.counter);
  console.log("count:", count);
}
```

**Output:**
```
count: 1
```

**Explanation:**

This question tests whether you understand `put`'s synchronous nature. `yield put(action)` does three things before the saga is resumed:

1. The action object is handed to the store's `dispatch`.
2. All reducers run synchronously — the store's state is fully updated.
3. Subscribers (including `connect`/`useSelector`) are notified.

Only *after* all of that does the middleware call `it.next(...)` to resume your saga. So by the time control reaches the line after `yield put`, the store already reflects the new state.

`select(selector)` is also synchronous — it calls `store.getState()` and then applies your selector. Because the `INCREMENT` has already been committed, `state.counter` is `1`, not `0`. You can think of `put` + `select` back-to-back as equivalent to "dispatch, then read" in normal Redux code.

One subtle exception: if you have *another* saga that reacts to `INCREMENT` via `take`/`takeEvery`, that reactive saga is scheduled but has not necessarily completed by the time your `select` runs — so you see your reducer's output, but not necessarily the output of any follow-up sagas triggered by the same action.

**Takeaway:** `put` fully updates the store before the saga resumes, so a follow-up `select` always sees the post-dispatch state.

---

### Concurrency & Race

---

**Q8: Given `yield race({ data: call(api.slowFetch), timeout: delay(2000) })` where `slowFetch` takes 5s and `delay` is 2s, what does the destructured `{ data, timeout }` contain and what happens to the losing effect?**

```js
function* saga() {
  const { data, timeout } = yield race({
    data: call(api.slowFetch),    // takes 5 seconds
    timeout: delay(2000),          // 2 seconds
  });

  console.log("data:", data);
  console.log("timeout:", timeout);
}
```

**Output:**
```
data: undefined
timeout: true
```

**Explanation:**

`race` is the saga equivalent of `Promise.race` with an extra guarantee: **the losers are cancelled**, not just ignored. You pass an object whose keys are labels and whose values are effects; `race` resolves as soon as *any one* of them completes.

Timeline:

- At t=0, both effects are started in parallel: `api.slowFetch` kicks off (it won't settle until t=5s), and `delay(2000)` begins counting.
- At t=2s, `delay` resolves with `true` (the default result of `delay`). That makes `timeout` the winner.
- `race` immediately **cancels** every other branch. The saga driving `api.slowFetch` is killed mid-flight. If that call held resources, they leak unless the API supports cancellation (e.g., via an `AbortController` wired through) — but from the saga's perspective the branch is torn down.
- The value returned from `yield race(...)` is an object with the *winning* key set to its result and every other key set to `undefined`. Hence `{ data: undefined, timeout: true }`.

This pattern is idiomatic for timeouts, cancellable user intents (`race({ result, cancelled: take('CANCEL') })`), and "first to respond wins" scenarios.

**Takeaway:** `race` runs effects in parallel, returns an object where only the winner's key has a value, and automatically cancels every loser.

---

**Q9: With `yield all([call(api.fetchUsers), call(api.fetchPosts)])` where the two calls take 2s and 3s respectively, how long does the saga block before `"done"` is logged — 2s, 3s, or 5s?**

```js
function* saga() {
  console.log("start");

  const [users, posts] = yield all([
    call(api.fetchUsers),    // takes 2s
    call(api.fetchPosts),    // takes 3s
  ]);

  console.log("done");  // when does this log?
}
```

**Output:**
```
start
(both API calls run in parallel)
done (after 3s, not 5s)
```

**Explanation:**

`all` is the saga analog of `Promise.all`. You give it either an array or an object of effects, and it runs every branch **concurrently**, then resolves once *all* of them have resolved.

Timeline:

- At t=0, `"start"` is logged. Both `call` effects are kicked off on the same tick — `fetchUsers` and `fetchPosts` are now running in parallel (from the saga's perspective; in reality they're two Promises awaiting network I/O).
- The saga is blocked at `yield all([...])`. It is not resumed until every branch settles.
- At t=2s, `fetchUsers` resolves. `all` is still waiting — it doesn't resume the saga yet.
- At t=3s, `fetchPosts` resolves. Now `all` gathers both results into an array in the same order as the input, and the saga resumes with `[users, posts]` destructured from that array.
- Total wall clock = max(2s, 3s) = 3s, not 5s.

The failure semantics matter too: if *any* branch throws, `all` rejects immediately — the still-pending siblings are cancelled, and the error propagates to the nearest `try/catch` in the saga (this mirrors `Promise.all`'s fail-fast behavior, not `Promise.allSettled`).

**Takeaway:** `all` runs effects in parallel; total time equals the *slowest* effect and any single failure cancels the rest.

---

**Q10: If a `fork`ed child saga throws after a delay, does the error propagate to the parent's `try/catch`, and does the parent's code after the fork keep running normally until the child eventually throws?**

```js
function* childSaga() {
  yield delay(100);
  throw new Error("child error");
}

function* parentSaga() {
  try {
    yield fork(childSaga);
    console.log("parent continues");
    yield delay(500);
    console.log("parent done");
  } catch (err) {
    console.log("parent caught:", err.message);
  }
}
```

**Output:**
```
parent continues
parent caught: child error
```

**Explanation:**

`fork` creates an **attached** task. That's the key word: the child is non-blocking, but it is still tied to its parent in two ways — the parent won't actually finish until the child does, and uncaught errors in the child bubble up to the parent.

Timeline:

- At t=0, `fork(childSaga)` starts the child and returns immediately. The child logs nothing, hits `delay(100)`, and suspends.
- The parent continues past the fork, logs `"parent continues"`, then blocks on `yield delay(500)`.
- At t=100ms, the child's delay elapses, it resumes, and throws `Error("child error")`. Because the child was `fork`ed (attached), this error is re-raised *inside* the parent task, at the point where the parent is currently suspended (`yield delay(500)`). It's as if `yield delay(500)` itself threw.
- The thrown error is caught by the enclosing `try/catch`, which logs `"parent caught: child error"`. Because control left the `try` block via an exception, `"parent done"` never runs — the remaining 400ms of the delay and the log after it are skipped entirely.

If you wanted the child to be fire-and-forget — a background task whose crash shouldn't kill the parent — you'd use `spawn(childSaga)` instead. `spawn` creates a **detached** task: its errors do *not* propagate to the parent, though you lose the automatic "parent waits for child" guarantee.

**Takeaway:** `fork` is attached — child errors crash the parent; use `spawn` for truly detached background work.

---

### Key Rules

```
Redux Saga Output Cheat Sheet:
1. yield value passed to next() becomes the result of yield expression
2. Spread/for-of on generators ignores the return value
3. call is blocking, fork is non-blocking
4. put dispatches synchronously — reducers run before next yield
5. takeLatest cancels previous saga instances
6. race cancels the losing effects automatically
7. all runs in parallel, waits for ALL, fails on ANY
8. Forked task errors bubble up to parent
9. spawn creates detached tasks (errors don't propagate)
10. select reads state AFTER previous puts are processed
```

---

## References

- [Redux-Saga Documentation](https://redux-saga.js.org) — Official docs with API reference
- [Redux-Saga GitHub](https://github.com/redux-saga/redux-saga) — Source code and examples

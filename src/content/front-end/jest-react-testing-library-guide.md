# Jest & React Testing Library — Complete Guide

## Table of Contents

- [1. What is Jest?](#1-what-is-jest)
- [2. Jest Fundamentals](#2-jest-fundamentals)
- [3. Matchers (Assertions)](#3-matchers-assertions)
- [4. Mocking](#4-mocking)
- [5. Async Testing](#5-async-testing)
- [6. What is React Testing Library?](#6-what-is-react-testing-library)
- [7. Rendering & Queries](#7-rendering--queries)
- [8. User Interactions (userEvent)](#8-user-interactions-userevent)
- [9. Async Utilities (waitFor, findBy)](#9-async-utilities-waitfor-findby)
- [10. Testing Patterns — Components](#10-testing-patterns--components)
- [11. Testing Patterns — Hooks](#11-testing-patterns--hooks)
- [12. Testing Patterns — Redux](#12-testing-patterns--redux)
- [13. Testing Patterns — React Query](#13-testing-patterns--react-query)
- [14. Testing Patterns — Forms](#14-testing-patterns--forms)
- [15. Testing Patterns — Routing](#15-testing-patterns--routing)
- [16. Best Practices & Anti-Patterns](#16-best-practices--anti-patterns)
- [17. Configuration & Setup](#17-configuration--setup)
- [18. Interview Questions & Answers](#18-interview-questions--answers)

---

## 1. What is Jest?

Jest is a **zero-config JavaScript testing framework** by Meta (Facebook). It provides a test runner, assertion library, mocking utilities, and code coverage — all in one package.

```bash
npm install --save-dev jest @types/jest ts-jest
# or with Vitest (Jest-compatible, faster with Vite)
npm install --save-dev vitest
```

> **Vitest** is a drop-in replacement for Jest that's faster with Vite projects. Same API — `describe`, `it`, `expect`, `vi` (instead of `jest`). This guide uses Jest syntax; replace `jest` with `vi` for Vitest.

---

## 2. Jest Fundamentals

### 2.1 Test Structure

```ts
describe('Calculator', () => {
  // Setup — runs before each test
  beforeEach(() => {
    // reset state, mocks, etc.
  });

  // Teardown — runs after each test
  afterEach(() => {
    // cleanup
  });

  // Setup — runs once before all tests in this describe
  beforeAll(() => {
    // expensive setup (DB connection, etc.)
  });

  // Teardown — runs once after all tests
  afterAll(() => {
    // cleanup
  });

  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  it('should subtract two numbers', () => {
    expect(subtract(5, 3)).toBe(2);
  });

  // Skip a test
  it.skip('should multiply (not yet implemented)', () => {});

  // Focus on this test only
  it.only('should divide', () => {
    expect(divide(10, 2)).toBe(5);
  });
});
```

### 2.2 Test Lifecycle

```
beforeAll()          ← once before all tests
  ├── beforeEach()   ← before EACH test
  │   ├── it()       ← test 1
  │   └── afterEach()
  ├── beforeEach()
  │   ├── it()       ← test 2
  │   └── afterEach()
afterAll()           ← once after all tests
```

### 2.3 Describe Nesting

```ts
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should throw if email is invalid', () => {});
    it('should hash the password', () => {});
  });

  describe('deleteUser', () => {
    it('should delete existing user', () => {});
    it('should throw if user not found', () => {});
  });
});
```

### 2.4 Test.each (Parameterized Tests)

```ts
it.each([
  [1, 2, 3],
  [0, 0, 0],
  [-1, 1, 0],
  [100, 200, 300],
])('add(%i, %i) should return %i', (a, b, expected) => {
  expect(add(a, b)).toBe(expected);
});

// With named parameters
it.each`
  a     | b     | expected
  ${1}  | ${2}  | ${3}
  ${0}  | ${0}  | ${0}
  ${-1} | ${1}  | ${0}
`('add($a, $b) = $expected', ({ a, b, expected }) => {
  expect(add(a, b)).toBe(expected);
});
```

---

## 3. Matchers (Assertions)

### 3.1 Common Matchers

```ts
// Exact equality
expect(value).toBe(5);                          // === (primitives)
expect(value).toEqual({ a: 1, b: 2 });          // deep equality (objects/arrays)
expect(value).toStrictEqual({ a: 1 });           // deep + checks undefined properties

// Truthiness
expect(value).toBeTruthy();                      // truthy (not false, 0, '', null, undefined, NaN)
expect(value).toBeFalsy();                       // falsy
expect(value).toBeNull();                        // === null
expect(value).toBeUndefined();                   // === undefined
expect(value).toBeDefined();                     // !== undefined

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(0.3, 5);              // floating point (0.1 + 0.2)

// Strings
expect(str).toMatch(/regex/);                    // regex match
expect(str).toMatch('substring');                // substring match
expect(str).toContain('substr');                 // contains
expect(str).toHaveLength(5);                     // length check

// Arrays
expect(arr).toContain('item');                   // includes item
expect(arr).toContainEqual({ id: 1 });           // includes object (deep)
expect(arr).toHaveLength(3);                     // array length
expect(arr).toEqual(expect.arrayContaining([1, 2])); // contains these items (any order)

// Objects
expect(obj).toHaveProperty('key');               // has property
expect(obj).toHaveProperty('nested.key', 'val'); // nested property with value
expect(obj).toMatchObject({ a: 1 });             // partial match
expect(obj).toEqual(expect.objectContaining({ a: 1 })); // partial match (in assertions)

// Exceptions
expect(() => fn()).toThrow();                    // throws any error
expect(() => fn()).toThrow('message');            // throws with message
expect(() => fn()).toThrow(TypeError);            // throws specific error type

// Negation
expect(value).not.toBe(5);
expect(arr).not.toContain('x');
```

### 3.2 Jest-DOM Matchers (for DOM assertions)

```ts
// Install: @testing-library/jest-dom
import '@testing-library/jest-dom';

expect(element).toBeInTheDocument();             // exists in DOM
expect(element).toBeVisible();                   // not hidden/display:none
expect(element).toBeDisabled();                  // disabled attribute
expect(element).toBeEnabled();                   // not disabled
expect(element).toBeChecked();                   // checkbox/radio checked
expect(element).toHaveTextContent('hello');       // text content
expect(element).toHaveValue('input value');       // input/select value
expect(element).toHaveAttribute('href', '/path'); // attribute
expect(element).toHaveClass('active');            // CSS class
expect(element).toHaveStyle({ color: 'red' });   // inline style
expect(element).toBeRequired();                  // required attribute
expect(element).toHaveFocus();                   // currently focused
expect(element).toBeEmptyDOMElement();           // no children
expect(element).toContainElement(child);         // contains another element
expect(element).toContainHTML('<span>hi</span>'); // contains HTML string
```

### 3.3 Asymmetric Matchers

```ts
expect(fn).toHaveBeenCalledWith(
  expect.any(String),                            // any string
  expect.any(Number),                            // any number
  expect.anything(),                             // any non-null/undefined value
  expect.stringContaining('substr'),             // string includes
  expect.stringMatching(/regex/),                // string matches regex
  expect.arrayContaining([1, 2]),                // array includes items
  expect.objectContaining({ key: 'val' }),       // object has properties
);

// Useful in toEqual
expect(user).toEqual({
  id: expect.any(String),
  name: 'Alice',
  createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}/),
});
```

---

## 4. Mocking

### 4.1 Mock Functions (jest.fn / vi.fn)

```ts
const mockFn = jest.fn();

// Call it
mockFn('arg1', 'arg2');
mockFn('arg3');

// Assertions
expect(mockFn).toHaveBeenCalled();               // called at least once
expect(mockFn).toHaveBeenCalledTimes(2);          // called exactly twice
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2'); // called with these args
expect(mockFn).toHaveBeenLastCalledWith('arg3');  // last call's args
expect(mockFn).toHaveBeenNthCalledWith(1, 'arg1', 'arg2'); // first call's args

// Return values
const mockFn = jest.fn()
  .mockReturnValue('default')                    // always return
  .mockReturnValueOnce('first')                  // return once, then fallback
  .mockReturnValueOnce('second');

mockFn(); // 'first'
mockFn(); // 'second'
mockFn(); // 'default'

// Mock implementation
const mockFn = jest.fn((a, b) => a + b);
mockFn(2, 3); // 5

// Mock resolved value (async)
const mockAsync = jest.fn()
  .mockResolvedValue({ data: 'ok' })             // returns Promise.resolve(...)
  .mockRejectedValueOnce(new Error('fail'));      // returns Promise.reject(...)
```

### 4.2 Mock Modules (jest.mock / vi.mock)

```ts
// Mock entire module
jest.mock('./api-client', () => ({
  getUsers: jest.fn().mockResolvedValue([{ id: '1', name: 'Alice' }]),
  createUser: jest.fn().mockResolvedValue({ id: '2', name: 'Bob' }),
}));

// Mock with factory + original
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),               // keep real implementations
  formatDate: jest.fn(() => '2024-01-01'),        // override just this one
}));

// Mock node_modules
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.get.mockResolvedValue({ data: { results: [] } });
```

### 4.3 Spy (jest.spyOn / vi.spyOn)

```ts
const obj = {
  method: (x: number) => x * 2,
};

const spy = jest.spyOn(obj, 'method');

obj.method(5); // still calls real implementation

expect(spy).toHaveBeenCalledWith(5);
expect(spy).toHaveReturnedWith(10);

// Override the implementation
spy.mockImplementation((x) => x * 3);
obj.method(5); // 15

// Restore original
spy.mockRestore();

// Spy on console
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
// ... code that calls console.error
expect(consoleSpy).toHaveBeenCalledWith('something went wrong');
consoleSpy.mockRestore();
```

### 4.4 Timer Mocks

```ts
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('calls callback after 1 second', () => {
  const callback = jest.fn();
  setTimeout(callback, 1000);

  expect(callback).not.toHaveBeenCalled();

  jest.advanceTimersByTime(1000);              // fast-forward 1s

  expect(callback).toHaveBeenCalledTimes(1);
});

it('handles setInterval', () => {
  const callback = jest.fn();
  setInterval(callback, 500);

  jest.advanceTimersByTime(1500);              // 3 intervals

  expect(callback).toHaveBeenCalledTimes(3);
});

// Other timer controls
jest.runAllTimers();                           // flush all pending timers
jest.runOnlyPendingTimers();                   // run only currently pending
jest.clearAllTimers();                         // clear all timers
```

### 4.5 Clearing & Resetting Mocks

```ts
const mockFn = jest.fn();

mockFn.mockClear();                            // clears calls and instances (not implementation)
mockFn.mockReset();                            // mockClear + removes implementation + return values
mockFn.mockRestore();                          // mockReset + restores original (spyOn only)

// Clear all mocks globally
afterEach(() => {
  jest.clearAllMocks();                        // clearAll = mockClear on every mock
  // or
  jest.resetAllMocks();                        // resetAll = mockReset on every mock
  // or
  jest.restoreAllMocks();                      // restoreAll = mockRestore on every mock
});
```

---

## 5. Async Testing

### 5.1 Promises

```ts
// Approach 1: return the promise
it('fetches users', () => {
  return fetchUsers().then(users => {
    expect(users).toHaveLength(3);
  });
});

// Approach 2: async/await (preferred)
it('fetches users', async () => {
  const users = await fetchUsers();
  expect(users).toHaveLength(3);
});

// Approach 3: resolves/rejects
it('fetches users', () => {
  return expect(fetchUsers()).resolves.toHaveLength(3);
});

it('throws on invalid id', () => {
  return expect(fetchUser('invalid')).rejects.toThrow('Not found');
});
```

### 5.2 Callbacks (done)

```ts
it('calls back with data', (done) => {
  fetchData((error, data) => {
    try {
      expect(error).toBeNull();
      expect(data).toBe('peanut butter');
      done();                                    // signal test completion
    } catch (e) {
      done(e);                                   // signal failure
    }
  });
});
```

### 5.3 Async with Fake Timers

```ts
it('polls until complete', async () => {
  jest.useFakeTimers();

  const promise = pollUntilDone();             // starts polling with setInterval

  // Fast-forward timers inside a microtask
  await jest.advanceTimersByTimeAsync(5000);   // async version for promises + timers

  const result = await promise;
  expect(result).toBe('done');

  jest.useRealTimers();
});
```

---

## 6. What is React Testing Library?

React Testing Library (RTL) is a testing utility that encourages testing components **the way users interact with them** — not implementation details.

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 6.1 Core Philosophy

```
"The more your tests resemble the way your software is used,
 the more confidence they can give you."
                                    — Kent C. Dodds

✅ Test what users see and do (text, roles, interactions)
❌ Don't test implementation details (state, internal methods, component instances)
```

### 6.2 What RTL Provides

```
render()           — render a component into a virtual DOM (jsdom)
screen             — access queries (getByRole, getByText, etc.)
cleanup()          — unmount components (auto in afterEach)
fireEvent          — low-level DOM events (prefer userEvent)
userEvent          — realistic user interactions (typing, clicking)
waitFor()          — wait for async changes
within()           — scope queries to a container element
act()              — wrap state updates (usually handled by RTL)
renderHook()       — test custom hooks in isolation
```

---

## 7. Rendering & Queries

### 7.1 Render

```tsx
import { render, screen } from '@testing-library/react';

it('renders the component', () => {
  // Render returns utilities, but prefer `screen`
  const { container, unmount, rerender } = render(<MyComponent title="Hello" />);

  // Re-render with new props
  rerender(<MyComponent title="World" />);

  // Unmount
  unmount();
});
```

### 7.2 Query Types

```
              | 0 matches    | 1 match       | 1+ matches    | Async?
─────────────┼──────────────┼───────────────┼───────────────┼────────
getBy...     | ❌ throw      | ✅ return      | ❌ throw       | No
queryBy...   | ✅ return null| ✅ return      | ❌ throw       | No
findBy...    | ❌ throw      | ✅ return      | ❌ throw       | Yes ✅
getAllBy...  | ❌ throw      | ✅ return []   | ✅ return []   | No
queryAllBy..| ✅ return []  | ✅ return []   | ✅ return []   | No
findAllBy...| ❌ throw      | ✅ return []   | ✅ return []   | Yes ✅
```

**When to use which:**
- **`getBy`** — element should be present right now (most common)
- **`queryBy`** — element might NOT be present (assert absence)
- **`findBy`** — element will appear after async operation (returns Promise)

### 7.3 Query Priority (Most Important!)

```
1. getByRole        — best, mirrors accessibility tree
2. getByLabelText   — form inputs (associated label)
3. getByPlaceholderText — when no label exists
4. getByText        — non-interactive elements
5. getByDisplayValue — current input value
6. getByAltText     — images (alt text)
7. getByTitle       — title attribute (low priority)
8. getByTestId      — last resort (data-testid)
```

### 7.4 Query Examples

```tsx
render(<LoginForm />);

// By role (BEST — validates accessibility)
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });
screen.getByRole('heading', { level: 2 });
screen.getByRole('link', { name: /sign up/i });
screen.getByRole('checkbox', { name: /remember me/i });
screen.getByRole('combobox');                        // select
screen.getByRole('dialog');                          // modal
screen.getByRole('alert');                           // alert message
screen.getByRole('tab', { selected: true });         // selected tab
screen.getByRole('navigation');                      // nav element

// By label (form fields)
screen.getByLabelText(/email address/i);
screen.getByLabelText('Password');

// By text (static text)
screen.getByText(/welcome back/i);
screen.getByText('No results found');

// By placeholder
screen.getByPlaceholderText('Search...');

// By display value (current input value)
screen.getByDisplayValue('john@example.com');

// By alt text (images)
screen.getByAltText('User avatar');

// By test id (LAST RESORT)
screen.getByTestId('submit-btn');

// Assert element NOT present
expect(screen.queryByText('Error')).not.toBeInTheDocument();

// Wait for async element
const heading = await screen.findByText('Loaded!');

// Scope queries to a container
const card = screen.getByTestId('user-card');
const name = within(card).getByText('Alice');
```

### 7.5 within() — Scoped Queries

```tsx
import { within } from '@testing-library/react';

it('shows user info in the card', () => {
  render(<UserCard user={mockUser} />);

  const card = screen.getByRole('article');

  // Queries scoped to the card
  expect(within(card).getByText('Alice')).toBeInTheDocument();
  expect(within(card).getByRole('button', { name: /edit/i })).toBeInTheDocument();
});
```

---

## 8. User Interactions (userEvent)

### 8.1 Setup

```tsx
import userEvent from '@testing-library/user-event';

it('handles user input', async () => {
  const user = userEvent.setup();              // ALWAYS setup first
  render(<MyForm />);

  // Now use `user` for all interactions
  await user.click(screen.getByRole('button'));
  await user.type(screen.getByRole('textbox'), 'Hello');
});
```

### 8.2 Common Interactions

```tsx
const user = userEvent.setup();

// Click
await user.click(element);                     // single click
await user.dblClick(element);                  // double click
await user.tripleClick(element);               // triple click (select all text)

// Typing
await user.type(input, 'Hello World');         // types character by character
await user.clear(input);                       // clear input
await user.type(input, '{Enter}');             // press Enter
await user.type(input, '{Backspace}');         // press Backspace
await user.type(input, '{Escape}');            // press Escape
await user.type(input, '{ArrowDown}');         // arrow keys

// Keyboard
await user.keyboard('Hello');                  // type without focusing
await user.keyboard('{Shift>}A{/Shift}');      // hold Shift, type A, release Shift
await user.keyboard('{Control>}a{/Control}');  // Ctrl+A (select all)

// Tab
await user.tab();                              // move focus to next element
await user.tab({ shift: true });               // shift+tab (move focus back)

// Select / Dropdown
await user.selectOptions(select, 'value');     // select by value
await user.selectOptions(select, ['a', 'b']);  // multi-select
await user.deselectOptions(select, 'value');   // deselect

// Checkbox / Radio
await user.click(checkbox);                    // toggle checkbox
expect(checkbox).toBeChecked();

// Hover
await user.hover(element);
await user.unhover(element);

// Clipboard
await user.copy();
await user.paste('text');
await user.cut();

// File upload
const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
await user.upload(fileInput, file);

// Pointer (advanced)
await user.pointer({ target: element, keys: '[MouseLeft]' });
```

### 8.3 userEvent vs fireEvent

```
                userEvent                  fireEvent
─────────────────────────────────────────────────────────
Realism        Simulates real user         Dispatches single DOM event
               (focus, keydown, keyup,
               input, change, blur)

Typing         Character by character      Sets value directly
               (triggers all key events)

Async          Always async (await)        Synchronous

Focus          Handles focus/blur          Does not manage focus

Recommended    ✅ Yes (primary choice)      Only for edge cases
```

**Rule:** Always prefer `userEvent` over `fireEvent`. Use `fireEvent` only for events `userEvent` doesn't support (e.g., `scroll`, `resize`, custom events).

---

## 9. Async Utilities (waitFor, findBy)

### 9.1 waitFor

```tsx
import { waitFor } from '@testing-library/react';

// Wait for assertion to pass
await waitFor(() => {
  expect(screen.getByText('Loaded!')).toBeInTheDocument();
});

// With options
await waitFor(
  () => expect(screen.getByText('Done')).toBeInTheDocument(),
  {
    timeout: 3000,                             // max wait time (default: 1000ms)
    interval: 100,                             // polling interval (default: 50ms)
  }
);

// Wait for element to disappear
await waitFor(() => {
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

### 9.2 waitForElementToBeRemoved

```tsx
import { waitForElementToBeRemoved } from '@testing-library/react';

// Wait for loading spinner to disappear
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

// Or with getBy (throws if already removed)
await waitForElementToBeRemoved(screen.getByText('Loading...'));
```

### 9.3 findBy (getBy + waitFor)

```tsx
// These are equivalent:
const element = await screen.findByText('Loaded!');

// Same as:
const element = await waitFor(() => screen.getByText('Loaded!'));
```

### 9.4 Common Async Patterns

```tsx
// Pattern 1: Loading → Loaded
it('shows data after loading', async () => {
  render(<UserList />);

  // Initially shows loading
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for data to appear
  expect(await screen.findByText('Alice')).toBeInTheDocument();

  // Loading should be gone
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});

// Pattern 2: Form submission
it('shows success after submit', async () => {
  const user = userEvent.setup();
  render(<ContactForm />);

  await user.type(screen.getByLabelText(/name/i), 'Alice');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Wait for success message
  expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
});

// Pattern 3: Debounced search
it('searches after debounce', async () => {
  const user = userEvent.setup();
  render(<SearchBar />);

  await user.type(screen.getByRole('searchbox'), 'React');

  // Results appear after debounce
  await waitFor(() => {
    expect(screen.getByText('React Testing Library')).toBeInTheDocument();
  });
});
```

---

## 10. Testing Patterns — Components

### 10.1 Basic Component Test

```tsx
// Button.tsx
function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// Button.test.tsx
describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button label="Click me" onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button label="Click me" onClick={() => {}} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button label="Click me" onClick={handleClick} disabled />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 10.2 Conditional Rendering

```tsx
// Alert.tsx
function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div role="alert" className={type === 'error' ? 'bg-red' : 'bg-green'}>
      {type === 'error' && <ErrorIcon />}
      {message}
    </div>
  );
}

// Alert.test.tsx
describe('Alert', () => {
  it('shows error icon for error type', () => {
    render(<Alert type="error" message="Something failed" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');
    // Check for icon (depends on implementation)
  });

  it('does not show error icon for success type', () => {
    render(<Alert type="success" message="Done!" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Done!');
  });
});
```

### 10.3 List Rendering

```tsx
// UserList.test.tsx
const mockUsers = [
  { id: '1', name: 'Alice', role: 'Admin' },
  { id: '2', name: 'Bob', role: 'User' },
  { id: '3', name: 'Charlie', role: 'User' },
];

describe('UserList', () => {
  it('renders all users', () => {
    render(<UserList users={mockUsers} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('shows each user name', () => {
    render(<UserList users={mockUsers} />);

    mockUsers.forEach(user => {
      expect(screen.getByText(user.name)).toBeInTheDocument();
    });
  });

  it('shows empty state when no users', () => {
    render(<UserList users={[]} />);
    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });
});
```

### 10.4 Modal / Dialog

```tsx
describe('ConfirmDialog', () => {
  it('is not visible initially', () => {
    render(<ConfirmDialog open={false} onConfirm={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows dialog when open', () => {
    render(<ConfirmDialog open={true} onConfirm={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();

    render(<ConfirmDialog open={true} onConfirm={onConfirm} onCancel={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', async () => {
    const onCancel = jest.fn();
    const user = userEvent.setup();

    render(<ConfirmDialog open={true} onConfirm={jest.fn()} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
```

---

## 11. Testing Patterns — Hooks

### 11.1 renderHook

```tsx
import { renderHook, act } from '@testing-library/react';

// useCounter.ts
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initial);
  return { count, increment, decrement, reset };
}

// useCounter.test.ts
describe('useCounter', () => {
  it('starts with initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('defaults to 0', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('decrements', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});
```

### 11.2 Hooks with Timers

```tsx
// useDebounce.test.ts
describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'hello' } }
    );

    // Update value
    rerender({ value: 'world' });
    expect(result.current).toBe('hello');        // still old value

    // Fast-forward
    act(() => jest.advanceTimersByTime(500));
    expect(result.current).toBe('world');        // now updated
  });
});
```

### 11.3 Hooks with Context/Providers

```tsx
// Hook that uses Redux store
function renderHookWithProviders(hook: () => any, preloadedState?: Partial<RootState>) {
  const store = configureStore({ reducer: rootReducer, preloadedState });

  return renderHook(hook, {
    wrapper: ({ children }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });
}

it('reads user from store', () => {
  const { result } = renderHookWithProviders(
    () => useAppSelector(state => state.auth.user),
    { auth: { user: { name: 'Alice' }, loading: false, error: null } }
  );

  expect(result.current.name).toBe('Alice');
});
```

---

## 12. Testing Patterns — Redux

### 12.1 Testing Slices (Reducers)

```ts
import reducer, {
  increment,
  decrement,
  incrementByAmount,
  reset,
} from './counter.slice';

describe('counterSlice', () => {
  const initialState = { value: 0, step: 1 };

  it('should return initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('should handle increment', () => {
    const state = reducer(initialState, increment());
    expect(state.value).toBe(1);
  });

  it('should handle decrement', () => {
    const state = reducer({ value: 5, step: 1 }, decrement());
    expect(state.value).toBe(4);
  });

  it('should handle incrementByAmount', () => {
    const state = reducer(initialState, incrementByAmount(10));
    expect(state.value).toBe(10);
  });

  it('should handle reset', () => {
    const state = reducer({ value: 99, step: 5 }, reset());
    expect(state).toEqual(initialState);
  });
});
```

### 12.2 Testing Selectors

```ts
import { selectActiveUsers, selectUserCount } from './users.selectors';

const buildState = (overrides: Partial<RootState['users']>): RootState =>
  ({
    users: {
      items: [],
      loading: false,
      error: null,
      filter: '',
      ...overrides,
    },
  } as RootState);

describe('selectActiveUsers', () => {
  it('returns only active users', () => {
    const state = buildState({
      items: [
        { id: '1', name: 'Alice', isActive: true },
        { id: '2', name: 'Bob', isActive: false },
        { id: '3', name: 'Charlie', isActive: true },
      ],
    });

    expect(selectActiveUsers(state)).toEqual([
      expect.objectContaining({ name: 'Alice' }),
      expect.objectContaining({ name: 'Charlie' }),
    ]);
  });

  it('returns empty array when no active users', () => {
    const state = buildState({ items: [] });
    expect(selectActiveUsers(state)).toEqual([]);
  });
});
```

### 12.3 Testing Components with Redux

```tsx
// test-utils.tsx — custom render with providers
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import rootReducer from '@/store/root-reducer';

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({ reducer: rootReducer, preloadedState }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Usage in tests
it('shows user name from Redux store', () => {
  renderWithProviders(<UserProfile />, {
    preloadedState: {
      auth: { user: { name: 'Alice' }, loading: false, error: null },
    },
  });

  expect(screen.getByText('Alice')).toBeInTheDocument();
});

it('dispatches action on button click', async () => {
  const { store } = renderWithProviders(<Counter />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: /increment/i }));

  expect(store.getState().counter.value).toBe(1);
});
```

---

## 13. Testing Patterns — React Query

### 13.1 Setup QueryClient for Tests

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,                          // no retries in tests
        gcTime: 0,                             // no cache
      },
    },
  });
}

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}
```

### 13.2 Mocking API Calls

```tsx
// Mock the endpoint module
jest.mock('@/lib/endpoints/users', () => ({
  getUsers: jest.fn(),
}));

import { getUsers } from '@/lib/endpoints/users';

describe('UserList', () => {
  it('shows users after loading', async () => {
    (getUsers as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]);

    renderWithQuery(<UserList />);

    // Loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Loaded state
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows error on failure', async () => {
    (getUsers as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderWithQuery(<UserList />);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});
```

### 13.3 MSW (Mock Service Worker) — Recommended

```ts
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/users', () => {
    return HttpResponse.json({
      status: 'success',
      results: [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ],
    });
  }),

  http.post('/api/v1/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 'success',
      results: { id: '3', ...body },
    }, { status: 201 });
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// setup.ts
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Override for specific test
it('handles server error', async () => {
  server.use(
    http.get('/api/v1/users', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );
  // ... test error handling
});
```

---

## 14. Testing Patterns — Forms

### 14.1 Basic Form Test

```tsx
describe('LoginForm', () => {
  it('submits with email and password', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'secret123',
    });
  });

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  it('disables submit button while loading', () => {
    render(<LoginForm onSubmit={jest.fn()} loading />);

    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });
});
```

### 14.2 Select / Dropdown

```tsx
it('selects a department', async () => {
  const user = userEvent.setup();
  render(<DepartmentSelect onChange={jest.fn()} />);

  await user.selectOptions(
    screen.getByRole('combobox', { name: /department/i }),
    'engineering'
  );

  expect(screen.getByRole('combobox')).toHaveValue('engineering');
});
```

### 14.3 File Upload

```tsx
it('uploads a file', async () => {
  const onUpload = jest.fn();
  const user = userEvent.setup();

  render(<FileUpload onUpload={onUpload} />);

  const file = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
  const input = screen.getByLabelText(/upload/i);

  await user.upload(input, file);

  expect(onUpload).toHaveBeenCalledWith(expect.any(File));
  expect(onUpload.mock.calls[0][0].name).toBe('resume.pdf');
});
```

---

## 15. Testing Patterns — Routing

### 15.1 Components with Links/Navigation

```tsx
import { MemoryRouter } from 'react-router-dom';

it('navigates to profile on click', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<UserCard user={mockUser} />} />
        <Route path="/profile/:id" element={<div>Profile Page</div>} />
      </Routes>
    </MemoryRouter>
  );

  await user.click(screen.getByRole('link', { name: /view profile/i }));

  expect(screen.getByText('Profile Page')).toBeInTheDocument();
});
```

### 15.2 Components Using useParams

```tsx
it('shows job detail for given ID', async () => {
  render(
    <MemoryRouter initialEntries={['/jobs/123']}>
      <Routes>
        <Route path="/jobs/:id" element={<JobDetail />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByText('Job #123')).toBeInTheDocument();
});
```

---

## 16. Best Practices & Anti-Patterns

### 16.1 Do's

```
✅ Test behavior, not implementation
✅ Use getByRole as primary query
✅ Use userEvent over fireEvent
✅ Setup userEvent before render: const user = userEvent.setup()
✅ Use findBy for async elements
✅ Use queryBy to assert absence
✅ Keep tests independent (no shared state)
✅ One assertion concept per test (but multiple expect() is fine)
✅ Name tests with "should" or describe what happens
✅ Use factory helpers for complex test data
✅ Mock at the boundary (API layer, not internal functions)
```

### 16.2 Don'ts

```
❌ Don't test implementation details (state, internal methods)
❌ Don't use container.querySelector — use screen queries
❌ Don't test styles directly (test behavior that changes)
❌ Don't use cleanup() — RTL auto-cleans after each test
❌ Don't wrap every interaction in act() — userEvent handles it
❌ Don't assert on snapshot alone (combine with behavior tests)
❌ Don't test third-party library internals (trust shadcn, MUI, etc.)
❌ Don't test constants or static data
❌ Don't use getBy inside waitFor — use findBy
❌ Don't use toMatchSnapshot excessively — tests become brittle
```

### 16.3 Common Mistakes

```tsx
// ❌ BAD: Using container queries
const { container } = render(<Button />);
container.querySelector('.btn-primary');        // fragile, tied to CSS class

// ✅ GOOD: Using accessible queries
screen.getByRole('button', { name: /submit/i });

// ❌ BAD: Testing implementation detail
expect(component.state.isOpen).toBe(true);     // testing internal state

// ✅ GOOD: Testing visible behavior
expect(screen.getByRole('dialog')).toBeInTheDocument();

// ❌ BAD: getBy inside waitFor
await waitFor(() => {
  screen.getByText('Loaded');                  // throws immediately → confusing errors
});

// ✅ GOOD: Use findBy for async
await screen.findByText('Loaded');

// ❌ BAD: Unnecessary act()
act(() => {
  render(<Component />);                       // RTL's render already wraps in act
});

// ✅ GOOD: Just render
render(<Component />);

// ❌ BAD: Hardcoded waits
await new Promise(r => setTimeout(r, 2000));   // flaky, slow

// ✅ GOOD: waitFor with assertion
await waitFor(() => expect(screen.getByText('Done')).toBeInTheDocument());
```

---

## 17. Configuration & Setup

### 17.1 Jest Config (jest.config.ts)

```ts
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterSetup: ['./src/test/setup.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',            // path alias
    '\\.(css|less|scss)$': 'identity-obj-proxy', // mock CSS
    '\\.(jpg|png|svg)$': '<rootDir>/src/test/file-mock.ts', // mock assets
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
```

### 17.2 Vitest Config (vitest.config.ts)

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                             // no need to import describe, it, expect
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  resolve: {
    alias: { '@': './src' },
  },
});
```

### 17.3 Setup File (setup.ts)

```ts
import '@testing-library/jest-dom/vitest';     // or '@testing-library/jest-dom' for Jest

// Global mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});
```

### 17.4 Custom Render (test-utils.tsx)

```tsx
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import rootReducer from '@/store/root-reducer';
import userEvent from '@testing-library/user-event';

interface ExtendedRenderOptions extends RenderOptions {
  preloadedState?: Partial<RootState>;
  route?: string;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const store = configureStore({ reducer: rootReducer, preloadedState });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>
            {children}
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    );
  }

  return {
    store,
    queryClient,
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything
export * from '@testing-library/react';
export { userEvent };
```

---

## 18. Interview Questions & Answers

### Beginner

---

**Q1: What is the difference between Jest and React Testing Library?**

| Aspect | Jest | React Testing Library |
|---|---|---|
| Type | Test runner + assertion library | DOM testing utility |
| Provides | `describe`, `it`, `expect`, mocks, coverage | `render`, `screen`, queries, `userEvent` |
| Tests | Any JavaScript (functions, classes, modules) | React components specifically |
| Philosophy | General testing framework | Test components like users interact with them |

They work together: Jest runs the tests and provides assertions; RTL provides tools to render React components and query the DOM.

---

**Q2: What is the testing priority order for queries in RTL?**

```
1. getByRole        — ✅ BEST: accessible to everyone (screen readers + users)
2. getByLabelText   — great for form fields
3. getByPlaceholderText — when no label
4. getByText        — non-interactive elements
5. getByDisplayValue — current input value
6. getByAltText     — images
7. getByTitle       — title attribute
8. getByTestId      — ❌ LAST RESORT: users can't see data-testid
```

**Why this order?** Queries higher in the list test accessibility. If you can't find an element by role, your component might have an accessibility problem.

---

**Q3: What is the difference between `getBy`, `queryBy`, and `findBy`?**

```ts
// getBy — element MUST exist. Throws if not found.
screen.getByText('Hello');                     // ✅ or throws

// queryBy — element MIGHT not exist. Returns null if not found.
screen.queryByText('Hello');                   // ✅ or null (no throw)

// findBy — element will APPEAR (async). Returns Promise.
await screen.findByText('Hello');              // ✅ (waits up to 1s)
```

**Rules:**
- Use `getBy` for elements that should be there (most common).
- Use `queryBy` to assert something is NOT present: `expect(queryByText('Error')).not.toBeInTheDocument()`.
- Use `findBy` for elements that appear after async operations (API calls, state updates).

---

**Q4: Why should you prefer `userEvent` over `fireEvent`?**

`userEvent` simulates **real user behavior** — it fires the full chain of events a browser would fire.

```ts
// fireEvent.click triggers ONE event: click
fireEvent.click(button);

// userEvent.click triggers the FULL chain:
// pointerover → pointerenter → mouseover → mouseenter → pointermove →
// mousemove → pointerdown → mousedown → focus → pointerup → mouseup → click
await user.click(button);

// fireEvent.type sets value at once
fireEvent.change(input, { target: { value: 'Hello' } });

// userEvent.type types character by character
// fires: focus → keydown('H') → keypress('H') → input → keyup('H') → keydown('e') → ...
await user.type(input, 'Hello');
```

`userEvent` catches bugs that `fireEvent` misses (e.g., event handlers on `keydown`, focus management, disabled elements).

---

**Q5: How do you test that an element is NOT in the document?**

```ts
// ✅ CORRECT: Use queryBy (returns null if not found)
expect(screen.queryByText('Error message')).not.toBeInTheDocument();
expect(screen.queryByRole('dialog')).toBeNull();

// ❌ WRONG: getBy throws if not found — test crashes instead of asserting
expect(screen.getByText('Error message')).not.toBeInTheDocument(); // throws!

// For async disappearance:
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
```

---

**Q6: What is `screen` and why use it over destructured queries?**

```tsx
// ❌ Old pattern: destructure from render
const { getByText, getByRole } = render(<Component />);
getByText('Hello');

// ✅ Preferred: use screen
render(<Component />);
screen.getByText('Hello');
```

**Why `screen`?**
- No need to destructure (cleaner code, especially with many queries).
- Works the same way regardless of where you render.
- Better error messages (shows the full DOM when query fails).
- Accessible globally after any `render()` call.

---

### Intermediate

---

**Q7: How do you test async operations (API calls, loading states)?**

```tsx
// Mock the API
jest.mock('@/lib/endpoints/users');
import { getUsers } from '@/lib/endpoints/users';

it('shows loading, then data', async () => {
  (getUsers as jest.Mock).mockResolvedValue([
    { id: '1', name: 'Alice' },
  ]);

  render(<UserList />);

  // 1. Assert loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // 2. Wait for data — findBy = getBy + waitFor
  expect(await screen.findByText('Alice')).toBeInTheDocument();

  // 3. Loading should be gone
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});

it('shows error on failure', async () => {
  (getUsers as jest.Mock).mockRejectedValue(new Error('Network error'));

  render(<UserList />);

  expect(await screen.findByRole('alert')).toHaveTextContent(/error/i);
});
```

---

**Q8: What is `waitFor` and when do you use it?**

`waitFor` repeatedly calls a callback until it passes (or times out after 1000ms):

```ts
// Use when you need to wait for a DOM change caused by async code
await waitFor(() => {
  expect(screen.getByText('Updated!')).toBeInTheDocument();
});
```

**When to use:**
- After dispatching Redux actions that trigger sagas.
- After mutations that update React Query cache.
- When an assertion depends on a `useEffect` or state update.

**When NOT to use:**
- For single element appearance → use `findBy` instead (cleaner).
- For already-present elements → use `getBy`.

```ts
// ❌ Unnecessary — use findBy
await waitFor(() => screen.getByText('Hello'));

// ✅ Cleaner
await screen.findByText('Hello');

// ✅ waitFor is better for MULTIPLE assertions
await waitFor(() => {
  expect(screen.getByText('Title')).toBeInTheDocument();
  expect(screen.getByText('Subtitle')).toBeInTheDocument();
  expect(screen.queryByText('Loading')).not.toBeInTheDocument();
});
```

---

**Q9: How do you mock API calls in tests? Compare approaches.**

| Approach | How it Works | Pros | Cons |
|---|---|---|---|
| `jest.mock()` | Replace module at import time | Simple, fast | Brittle (tied to import path) |
| `jest.spyOn()` | Spy on specific methods | Keeps other methods real | Still tied to implementation |
| **MSW** | Mock at network level | Realistic, test full stack | More setup |

```ts
// Approach 1: jest.mock (most common)
jest.mock('@/lib/endpoints/users', () => ({
  getUsers: jest.fn().mockResolvedValue([{ id: '1', name: 'Alice' }]),
}));

// Approach 2: MSW (recommended for integration tests)
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';

server.use(
  http.get('/api/v1/users', () => {
    return HttpResponse.json({ results: [{ id: '1', name: 'Alice' }] });
  })
);
```

**Best practice:** Use `jest.mock` for unit tests (fast), MSW for integration tests (realistic).

---

**Q10: How do you test custom hooks?**

```tsx
import { renderHook, act } from '@testing-library/react';

// The hook
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(v => !v);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  return { value, toggle, setTrue, setFalse };
}

// The tests
describe('useToggle', () => {
  it('starts with initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current.value).toBe(true);
  });

  it('toggles value', () => {
    const { result } = renderHook(() => useToggle());

    act(() => result.current.toggle());
    expect(result.current.value).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.value).toBe(false);
  });

  it('sets true', () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);
  });
});
```

**Key rules:**
- Wrap state changes in `act()`.
- Access current values via `result.current`.
- Use `rerender()` to test prop/arg changes.
- Provide wrapper for hooks that need context (Redux, QueryClient, Router).

---

**Q11: What is `within()` and when do you use it?**

`within()` scopes queries to a specific container element:

```tsx
render(
  <div>
    <div data-testid="card-1">
      <span>Alice</span>
      <button>Edit</button>
    </div>
    <div data-testid="card-2">
      <span>Bob</span>
      <button>Edit</button>
    </div>
  </div>
);

// ❌ Ambiguous — two "Edit" buttons
screen.getByRole('button', { name: /edit/i }); // throws (multiple matches)

// ✅ Scoped to card-1
const card = screen.getByTestId('card-1');
within(card).getByRole('button', { name: /edit/i }); // Alice's edit button
```

---

**Q12: How do you test error boundaries?**

```tsx
// Suppress React error boundary console output
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

const ThrowingComponent = () => {
  throw new Error('Test crash');
};

it('shows fallback on error', () => {
  render(
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ThrowingComponent />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});

consoleSpy.mockRestore();
```

---

### Advanced

---

**Q13: How would you test a component with React.lazy and Suspense?**

```tsx
it('shows fallback while loading lazy component', async () => {
  // React.lazy wraps dynamic import
  const LazyPage = React.lazy(() => import('./HeavyPage'));

  render(
    <Suspense fallback={<div>Loading page...</div>}>
      <LazyPage />
    </Suspense>
  );

  // Initially shows fallback
  expect(screen.getByText('Loading page...')).toBeInTheDocument();

  // Eventually shows the loaded component
  expect(await screen.findByText('Heavy Page Content')).toBeInTheDocument();
});
```

---

**Q14: How do you handle `window.matchMedia` or browser APIs in tests?**

jsdom doesn't implement all browser APIs. Mock them in setup:

```ts
// setup.ts — runs before all tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// For a specific test (e.g., dark mode)
it('applies dark theme when prefers-color-scheme is dark', () => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  render(<ThemeProvider><App /></ThemeProvider>);
  expect(document.documentElement).toHaveClass('dark');
});
```

---

**Q15: How do you test accessibility (a11y) with RTL?**

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

RTL's query priority (getByRole first) already encourages accessible markup. If you can't find an element by role, the component likely has accessibility issues.

---

**Q16: How do you test components that use `IntersectionObserver` or `ResizeObserver`?**

```ts
// Mock IntersectionObserver
let intersectionCallback: IntersectionObserverCallback;

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

beforeEach(() => {
  window.IntersectionObserver = MockIntersectionObserver as any;
});

it('loads more items when scrolled into view', async () => {
  render(<InfiniteList />);

  // Simulate element coming into view
  act(() => {
    intersectionCallback(
      [{ isIntersecting: true, target: document.createElement('div') }] as any,
      {} as any
    );
  });

  expect(await screen.findByText('Item 11')).toBeInTheDocument();
});
```

---

**Q17: What is snapshot testing? When should (and shouldn't) you use it?**

```tsx
it('matches snapshot', () => {
  const { container } = render(<Button label="Click me" variant="primary" />);
  expect(container).toMatchSnapshot();         // creates/compares .snap file
});

// Inline snapshot (stored in test file)
it('matches inline snapshot', () => {
  const { container } = render(<Badge label="New" />);
  expect(container.innerHTML).toMatchInlineSnapshot(
    `"<span class=\\"badge badge-new\\">New</span>"`
  );
});
```

**When to use:** Smoke tests for component structure, detecting unintended changes.

**When NOT to use:**
- As the ONLY test (add behavior tests too).
- For frequently changing components (snapshots become noise).
- For large/complex components (diffs are unreadable).

**Better alternative:** Targeted assertions on specific elements are more resilient and readable.

---

**Q18: How do you test portals (modals rendered outside root)?**

RTL renders into a detached `div`, and `screen` queries the entire `document.body`. So portals (which render outside the root div) are automatically queryable:

```tsx
it('renders modal in portal', async () => {
  const user = userEvent.setup();

  render(<App />);

  await user.click(screen.getByRole('button', { name: /open modal/i }));

  // Works even though modal is rendered in a portal
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Modal Content')).toBeInTheDocument();
});
```

No special setup needed — `screen` queries the entire document.

---

**Q19: What is the `act()` warning and how do you fix it?**

The "not wrapped in act" warning means a state update happened outside of React's batch:

```
Warning: An update to Component inside a test was not wrapped in act(...)
```

**Common causes and fixes:**

```tsx
// Cause 1: Async state update after test finishes
it('fetches data', async () => {
  render(<UserList />);
  // ❌ Test ends before useEffect completes
});

// Fix: Wait for the async update
it('fetches data', async () => {
  render(<UserList />);
  await screen.findByText('Alice');            // ✅ waits for async update
});

// Cause 2: Timer-based updates
it('shows notification', () => {
  jest.useFakeTimers();
  render(<Notification />);

  act(() => jest.advanceTimersByTime(3000));    // ✅ wrap timer advance in act
  expect(screen.queryByText('Toast')).not.toBeInTheDocument();
});

// Cause 3: Hook state update
const { result } = renderHook(() => useCounter());
act(() => result.current.increment());         // ✅ wrap state change in act
```

**Rule:** If RTL's `userEvent` or `findBy` handle it, you don't need explicit `act()`. Only add `act()` when directly triggering state updates (timers, manual callbacks, hook methods).

---

**Q20: How do you debug failing RTL tests?**

```tsx
// 1. screen.debug() — print current DOM
render(<MyComponent />);
screen.debug();                                // logs entire DOM
screen.debug(screen.getByRole('form'));        // logs specific element

// 2. logRoles() — print accessible roles
import { logRoles } from '@testing-library/react';
const { container } = render(<MyComponent />);
logRoles(container);                           // shows all ARIA roles

// 3. prettyDOM() — formatted DOM output
import { prettyDOM } from '@testing-library/react';
console.log(prettyDOM(element));

// 4. Testing Playground — find the best query
// https://testing-playground.com
// Paste your HTML → it suggests the best RTL query

// 5. Check what's rendered
screen.debug();
// Look for: Is the element there? Correct role? Correct text? Correct attributes?
```

---

**Q21: What's the difference between unit, integration, and e2e tests? How does RTL fit?**

```
                    ┌─────────────────┐
                    │  E2E (Cypress/  │  Few — slow, expensive, high confidence
                    │   Playwright)   │
                    ├─────────────────┤
                    │  Integration    │  Many — RTL component tests with real hooks,
                    │  (RTL + Jest)   │  Redux, React Query, routing
                    ├─────────────────┤
                    │  Unit           │  Many — pure functions, reducers, selectors,
                    │  (Jest)         │  utility helpers
                    └─────────────────┘

RTL encourages INTEGRATION tests:
- Render real components (not shallow render)
- With real hooks and state management
- Mock only external boundaries (API calls)
- Test complete user flows (type → click → assert result)
```

**RTL intentionally does NOT support shallow rendering.** It renders the full component tree, testing how components work together — not in isolation.

---

**Q22: Output Question — What does this test do and will it pass?**

```tsx
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ name: 'Alice', age: 30 }),
}));

it('displays user info', async () => {
  render(<UserProfile userId="1" />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Age: 30')).toBeInTheDocument();
  });

  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

**Answer:** Yes, it passes (assuming `UserProfile` renders a loading state, then fetches and displays user data).

**Flow:**
1. Component renders → shows "Loading..." (sync).
2. `fetchUser` mock resolves → component re-renders with data.
3. `waitFor` retries until both "Alice" and "Age: 30" appear.
4. Final assertion confirms loading is gone.

**Improvement:** Replace `waitFor` + `getByText` with `findByText`:
```tsx
expect(await screen.findByText('Alice')).toBeInTheDocument();
expect(screen.getByText('Age: 30')).toBeInTheDocument();
```

---

**Q23: Output Question — What happens here?**

```tsx
it('handles form submission', async () => {
  const onSubmit = jest.fn();
  render(<SearchForm onSubmit={onSubmit} />);

  const input = screen.getByRole('searchbox');
  fireEvent.change(input, { target: { value: 'React' } });
  fireEvent.click(screen.getByRole('button', { name: /search/i }));

  expect(onSubmit).toHaveBeenCalledWith('React');
});
```

**Answer:** It works BUT has problems:
1. `fireEvent.change` sets the value in one shot (not character by character).
2. If the form validates on `keydown` or `input` events, those won't fire.
3. If the button has an `onClick` that checks focus state, it may fail because `fireEvent` doesn't manage focus.

**Better version:**
```tsx
it('handles form submission', async () => {
  const onSubmit = jest.fn();
  const user = userEvent.setup();
  render(<SearchForm onSubmit={onSubmit} />);

  await user.type(screen.getByRole('searchbox'), 'React');
  await user.click(screen.getByRole('button', { name: /search/i }));

  expect(onSubmit).toHaveBeenCalledWith('React');
});
```

---

**Q24: Output Question — Why does this test fail?**

```tsx
it('shows error message', () => {
  render(<LoginForm />);

  const button = screen.getByRole('button', { name: /login/i });
  fireEvent.click(button);

  expect(screen.getByText('Email is required')).toBeInTheDocument();
});
```

**Answer:** It likely fails because form validation may be async (e.g., React Hook Form validates asynchronously). The assertion runs before the error message appears.

**Fix:**
```tsx
it('shows error message', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.click(screen.getByRole('button', { name: /login/i }));

  expect(await screen.findByText('Email is required')).toBeInTheDocument();
});
```

---

**Q25: How would you structure tests for a real-world feature?**

```
features/users/
├── components/
│   ├── user-list.tsx
│   ├── user-list.test.tsx         ← component tests
│   ├── user-card.tsx
│   └── user-card.test.tsx
├── hooks/
│   ├── use-user-filter.ts
│   └── use-user-filter.test.ts    ← hook tests
├── lib/
│   ├── user-helpers.ts
│   └── user-helpers.test.ts       ← utility tests
└── pages/
    ├── users-page.tsx
    └── users-page.test.tsx         ← integration test (full page)
```

**Testing strategy:**
1. **`user-helpers.test.ts`** — Pure unit tests (input → output).
2. **`use-user-filter.test.ts`** — Hook tests with `renderHook`.
3. **`user-card.test.tsx`** — Component unit test (props → rendering).
4. **`user-list.test.tsx`** — Component test with mock data.
5. **`users-page.test.tsx`** — Integration test (renders page with mocked API, tests full flow).

**Coverage priority:**
- Business logic (helpers, hooks) → high coverage.
- User-facing components → test interactions and states.
- Wrappers/layout → minimal (test that children render).

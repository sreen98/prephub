# Python — Interview Guide

Python for **backend and AI-service engineers**, not data scientists. Everything here assumes you are writing services: APIs, pipelines, agent orchestration, and the concurrency and failure handling those demand.

The guide is ordered so the concepts build on each other. If you are preparing quickly, the highest-yield sections are **13 (the GIL and concurrency)**, **14 (asyncio)**, **10 (decorators)** and **18 (Python for LLM services)** — those are where senior interviews actually spend their time.

## Table of Contents

1. [Data Types & Objects](#1-data-types-objects)
2. [Functions](#2-functions)
3. [Errors & Exceptions](#3-errors-exceptions)
4. [Classes & OOP](#4-classes-oop)
5. [Modules, Packages & Imports](#5-modules-packages-imports)
6. [Environments & Dependency Management](#6-environments-dependency-management)
7. [Files & I/O](#7-files-io)
8. [Iterators & Generators](#8-iterators-generators)
9. [Context Managers](#9-context-managers)
10. [Decorators](#10-decorators)
11. [Type Hints & Static Analysis](#11-type-hints-static-analysis)
12. [Memory Management & Garbage Collection](#12-memory-management-garbage-collection)
13. [The GIL & Choosing a Concurrency Model](#13-the-gil-choosing-a-concurrency-model)
14. [asyncio in Depth](#14-asyncio-in-depth)
15. [Testing](#15-testing)
16. [Performance & Profiling](#16-performance-profiling)
17. [Structuring a Backend Service](#17-structuring-a-backend-service)
18. [Python for LLM & Agent Services](#18-python-for-llm-agent-services)
19. [PEP 8 & Code Style](#19-pep-8-code-style)
20. [Practical Exercises](#20-practical-exercises)
21. [Interview Questions & Answers](#21-interview-questions-answers)
22. [Tricky Output Questions](#22-tricky-output-questions)
23. [Cheat Sheet](#23-cheat-sheet)
24. [References](#24-references)

---

## 1. Data Types & Objects

### 1.1 The built-in containers

| Type | Ordered | Mutable | Duplicates | Lookup | Use it when |
|---|---|---|---|---|---|
| `list` | yes | **yes** | yes | O(n) by value | a sequence you will change |
| `tuple` | yes | no | yes | O(n) by value | a fixed record; a dict key |
| `dict` | yes (insertion, 3.7+) | **yes** | keys unique | **O(1)** by key | keyed lookup |
| `set` | no | **yes** | no | **O(1)** membership | dedupe, membership tests |
| `frozenset` | no | no | no | O(1) | a set used as a dict key |

`str`, `bytes`, `int`, `float`, `bool`, `None` are the scalars. `str` and `bytes` are immutable sequences — which is why `s += x` in a loop is O(n²) and `''.join(parts)` is the idiom.

```python
# The insertion-order guarantee is a language guarantee from 3.7, not an accident.
d = {'b': 1, 'a': 2}
list(d)                      # ['b', 'a'] — insertion order, not sorted
```

### 1.2 list vs tuple — the real distinction

The textbook answer is "tuples are immutable." The answer that lands is **what immutability buys you**:

- **Hashability.** A tuple of hashable items can be a `dict` key or a `set` member. A list cannot.
- **Intent.** A tuple signals a fixed-shape record (`(lat, lng)`); a list signals a homogeneous collection you will grow.
- **Safety.** It cannot be mutated by a function you pass it to.

```python
point = (12.9, 77.6)
cache = {point: 'Bangalore'}     # fine
cache[[12.9, 77.6]]              # TypeError: unhashable type: 'list'
```

The performance difference is real but small and rarely the reason to choose one.

### 1.3 Mutable vs immutable — the model that prevents bugs

Python has **names bound to objects**. Assignment rebinds a name; it never copies. Mutation changes the object every name is pointing at.

```python
a = [1, 2]
b = a            # b and a name the SAME list
b.append(3)
a                # [1, 2, 3]  — surprising only if you think b is a copy

a = [1, 2]
b = a
b = b + [3]      # rebinds b to a NEW list
a                # [1, 2]
```

Immutable objects (`int`, `str`, `tuple`, `frozenset`, `bytes`) cannot be changed in place, so this class of aliasing bug cannot occur. This is also why **mutable default arguments** are a trap — see §2.3.

A tuple is only *shallowly* immutable:

```python
t = ([1], [2])
t[0].append(99)      # legal — the tuple's binding didn't change
t                    # ([1, 99], [2])
hash(t)              # TypeError — contains an unhashable list
```

### 1.4 Comprehensions

```python
squares   = [x*x for x in range(5)]                    # list
by_len    = {w: len(w) for w in words}                 # dict
unique    = {w.lower() for w in words}                 # set
lazy      = (x*x for x in range(5))                    # GENERATOR, not a tuple
```

A **dict comprehension** builds key–value pairs and needs the `k: v` syntax; a **list comprehension** builds a sequence of single values. The other differences follow from the target type: a dict comprehension silently de-duplicates keys (last write wins), a list comprehension keeps every element.

```python
{w[0]: w for w in ['apple', 'avocado']}   # {'a': 'avocado'} — 'apple' lost
[w[0] for w in ['apple', 'avocado']]      # ['a', 'a']
```

Note the parenthesised form is a **generator expression**, not a tuple comprehension — there is no tuple comprehension. Use `tuple(x*x for x in ...)` if you want one.

### 1.5 `is` vs `==`

- `==` calls `__eq__` — **value** equality.
- `is` compares **identity** — are these the same object in memory?

```python
a = [1, 2]; b = [1, 2]
a == b      # True  — same contents
a is b      # False — two distinct objects
```

Use `is` **only** for singletons: `is None`, `is True`, `is False`, and sentinel objects. Never for numbers or strings, because interning makes it look like it works until it doesn't:

```python
x = 256; y = 256
x is y            # True  — small ints are cached
x = 257; y = 257
x is y            # False (usually) — outside the cache
```

That is an implementation detail of CPython, not a language guarantee. This is the single most common "guess the output" trap in Python interviews.

### 1.6 `copy` vs `deepcopy`

```python
import copy

original = {'name': 'a', 'tags': ['x', 'y']}

shallow = copy.copy(original)       # new dict, SAME inner list
deep    = copy.deepcopy(original)   # new dict, new inner list

shallow['tags'].append('z')
original['tags']                    # ['x', 'y', 'z']  ← leaked
deep['tags'].append('w')
original['tags']                    # unchanged by the deep copy
```

`copy` duplicates one level; nested mutable objects stay shared. `deepcopy` recurses, handles cycles via a memo dict, and is **significantly slower**. Reach for `deepcopy` when you genuinely own nested mutable state; otherwise prefer building new immutable values.

`dict(d)`, `d.copy()`, `list(l)` and `l[:]` are all shallow copies.

---

## 2. Functions

### 2.1 `*args` and `**kwargs`

`*args` collects extra positional arguments into a tuple; `**kwargs` collects extra keyword arguments into a dict.

```python
def log(level, *args, **kwargs):
    print(level, args, kwargs)

log('INFO', 1, 2, user='ana')     # INFO (1, 2) {'user': 'ana'}
```

You use them for three things:

1. **Pass-through wrappers** — a decorator that must accept any signature (§10).
2. **Genuinely variadic APIs** — `max(*values)`.
3. **Forwarding to a superclass** — `super().__init__(*args, **kwargs)`.

At the call site the same syntax *unpacks*:

```python
def connect(host, port): ...
cfg = {'host': 'db', 'port': 5432}
connect(**cfg)                    # unpack dict into keyword arguments
```

Anything after a bare `*` is **keyword-only**, which is a good way to stop callers passing booleans positionally:

```python
def render(template, *, escape=True): ...
render('x', False)                # TypeError — must be escape=False
```

### 2.2 `lambda`

A `lambda` is a single-expression anonymous function. It is useful exactly where a tiny function is passed as an argument and naming it would add noise:

```python
sorted(users, key=lambda u: u.created_at)
sorted(items, key=lambda kv: (-kv[1], kv[0]))     # by count desc, then name
```

It cannot contain statements (no `return`, no `try`, no assignment). If you find yourself wanting those, write a `def`. PEP 8 explicitly says do not assign a lambda to a name — `f = lambda x: x` should just be `def f(x): return x`, which also gives you a useful `__name__` in tracebacks.

For attribute and item access, `operator` is faster and clearer:

```python
from operator import attrgetter, itemgetter
sorted(users, key=attrgetter('created_at'))
```

### 2.3 The mutable-default-argument trap

```python
def add_item(item, basket=[]):        # BUG
    basket.append(item)
    return basket

add_item('a')      # ['a']
add_item('b')      # ['a', 'b']  ← the SAME list came back
```

**Why:** default values are evaluated **once**, when the `def` executes — not per call. That one list is stored on the function object (`add_item.__defaults__`) and shared by every call that omits the argument.

The fix is a `None` sentinel:

```python
def add_item(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket
```

The same applies to `{}`, `set()`, and to anything computed at definition time such as `datetime.now()`.

### 2.4 Closures and the late-binding trap

```python
fns = [lambda: i for i in range(3)]
[f() for f in fns]        # [2, 2, 2] — not [0, 1, 2]
```

Closures capture the **variable**, not its value at creation time. By the time the lambdas run, `i` is 2. Bind it explicitly with a default argument:

```python
fns = [lambda i=i: i for i in range(3)]
[f() for f in fns]        # [0, 1, 2]
```

`nonlocal` lets an inner function rebind an enclosing local; without it, assignment creates a new local:

```python
def counter():
    n = 0
    def inc():
        nonlocal n        # without this: UnboundLocalError
        n += 1
        return n
    return inc
```

---

## 3. Errors & Exceptions

### 3.1 `try` / `except` / `else` / `finally`

```python
try:
    resp = call_api()
except TimeoutError as exc:          # most specific first
    metrics.incr('timeout')
    raise                            # re-raise, preserving the traceback
except (ConnectionError, OSError) as exc:
    return fallback()
else:
    # runs ONLY if no exception was raised — keeps the happy path
    # out of the try block, so you don't accidentally catch its errors
    return parse(resp)
finally:
    # ALWAYS runs: success, handled error, unhandled error, even return
    session.close()
```

The parts people get wrong:

- **`else` exists** and is the right place for code that must not be inside the `try`. If you put `parse(resp)` in the `try`, a `TimeoutError` raised *by the parser* would be swallowed by your handler.
- **`finally` runs even on `return`**, and a `return` inside `finally` *replaces* the pending return or exception — a good way to lose an error silently.
- **Never write a bare `except:`** — it catches `KeyboardInterrupt` and `SystemExit`. Use `except Exception:` if you must be broad.

### 3.2 Exception chaining — `raise ... from ...`

```python
try:
    data = json.loads(raw)
except json.JSONDecodeError as exc:
    raise ConfigError('config file is not valid JSON') from exc
```

`from exc` sets `__cause__`, and the traceback reads *"The above exception was the direct cause of the following exception."* You get your clean domain-level error **and** the underlying detail.

Raising inside an `except` block without `from` still records the original as `__context__` and prints *"During handling of the above exception, another exception occurred"* — usually what you want, but `from` states the causality explicitly. Use `from None` to deliberately suppress a noisy inner cause.

### 3.3 Custom exceptions

Define a package-level base so callers can catch your whole surface with one clause:

```python
class AppError(Exception):
    """Base for every error this service raises."""

class RateLimited(AppError):
    def __init__(self, retry_after: float):
        super().__init__(f'rate limited; retry after {retry_after}s')
        self.retry_after = retry_after
```

Carry structured data as attributes (`retry_after`), not by parsing the message string.

### 3.4 EAFP over LBYL

Python idiom prefers **Easier to Ask Forgiveness than Permission**:

```python
# LBYL — racy: the key can vanish between the check and the read
if 'k' in d:
    v = d['k']

# EAFP — atomic
try:
    v = d['k']
except KeyError:
    v = default
# or simply
v = d.get('k', default)
```

---

## 4. Classes & OOP

### 4.1 Defining a class, and what `self` is

```python
class Candidate:
    # class attribute — shared by every instance
    source = 'unknown'

    def __init__(self, name: str, score: float) -> None:
        self.name = name          # instance attributes
        self.score = score

    def passed(self, threshold: float = 60.0) -> bool:
        return self.score >= threshold

    def __repr__(self) -> str:
        return f'Candidate(name={self.name!r}, score={self.score})'
```

`self` is the instance, passed **explicitly** as the first parameter. `c.passed()` is sugar for `Candidate.passed(c)` — the method is just a function on the class, and attribute access on an instance binds it.

It is explicit because of Python's "explicit is better than implicit" stance, and because it removes the ambiguity other languages solve with scoping rules: there is never a question whether `score` means the local or the attribute — `self.score` says so. It also means methods can be defined outside the class body and attached later, and that `staticmethod`/`classmethod` are ordinary decorators rather than special syntax.

**Mutable class attributes are shared**, which is the class-level version of the default-argument trap:

```python
class Bad:
    tags = []                    # ONE list for all instances
a, b = Bad(), Bad()
a.tags.append('x')
b.tags                           # ['x']
```

### 4.2 Inheritance, overriding and `super()`

```python
class Base:
    def __init__(self, name):
        self.name = name
    def describe(self):
        return f'base:{self.name}'

class Child(Base):
    def __init__(self, name, extra):
        super().__init__(name)          # cooperative — do not call Base.__init__(self, ...)
        self.extra = extra
    def describe(self):
        return f'child:{super().describe()}:{self.extra}'
```

`super()` walks the **MRO** (method resolution order), the C3 linearisation of the class graph — inspect it with `Child.__mro__`. This matters with multiple inheritance: `super()` does not mean "my parent", it means "the next class in the MRO", which may be a sibling. That is what makes cooperative multiple inheritance work, and why every class in such a hierarchy must call `super()` and accept `**kwargs`.

### 4.3 `@staticmethod` vs `@classmethod` vs instance methods

| Method type | Receives | Use for |
|---|---|---|
| instance method | `self` | behaviour needing instance state |
| `@classmethod` | `cls` | **alternative constructors**; behaviour needing the class |
| `@staticmethod` | nothing | a related helper that needs neither |

```python
class Score:
    def __init__(self, value): self.value = value

    @classmethod
    def from_dict(cls, d):            # cls, so subclasses get their own type back
        return cls(d['value'])

    @staticmethod
    def is_valid(v):
        return 0 <= v <= 100
```

The reason `from_dict` takes `cls` rather than hard-coding `Score(...)`: if `Weighted(Score)` calls `Weighted.from_dict(...)`, it gets a `Weighted`.

### 4.4 `@dataclass`

```python
from dataclasses import dataclass, field

@dataclass(frozen=True, slots=True)
class CandidateScore:
    name: str
    score: float
    tags: list[str] = field(default_factory=list)   # NOT tags: list = []
```

You get `__init__`, `__repr__`, `__eq__` generated from the annotations. Options that matter: `frozen=True` makes instances immutable **and hashable**; `slots=True` (3.10+) drops `__dict__` for lower memory and faster attribute access; `order=True` adds comparison operators.

Note `field(default_factory=list)` — a bare `= []` is a `ValueError` at class creation, because the dataclass machinery deliberately refuses the mutable-default trap.

Use a dataclass over a regular class when the type is **mostly data**. Use a regular class when behaviour dominates, or you need a custom `__init__`. Use `NamedTuple` if you want a lightweight immutable record that behaves like a tuple, and Pydantic when you need **validation and coercion at a trust boundary** (§18.4).

Validation goes in `__post_init__`:

```python
@dataclass
class CandidateScore:
    name: str
    score: float
    def __post_init__(self):
        if not 0 <= self.score <= 100:
            raise ValueError(f'score out of range: {self.score}')
```

### 4.5 `__eq__` and `__hash__`

The rule: **objects that compare equal must have equal hashes.** Break it and dicts and sets misbehave.

```python
class Point:
    def __init__(self, x, y): self.x, self.y = x, y
    def __eq__(self, other):
        if not isinstance(other, Point): return NotImplemented
        return (self.x, self.y) == (other.x, other.y)
    def __hash__(self):
        return hash((self.x, self.y))          # same fields as __eq__
```

Consequences to know:

- Defining `__eq__` **sets `__hash__` to None** — your class becomes unhashable unless you also define `__hash__`. This surprises people who add equality to a class already used in a set.
- Return `NotImplemented` (not `False`) for unknown types, so Python can try the reflected operation.
- **Never hash on mutable fields.** Mutate a key after inserting it and you can no longer find it: the lookup hashes to a different bucket.
- `@dataclass(eq=True)` (the default) also sets `__hash__ = None`; `frozen=True` restores a generated hash.

### 4.6 Duck typing and protocols

"If it walks like a duck…" — Python cares about the methods an object *has*, not its declared type:

```python
def render_all(items):
    return [i.render() for i in items]     # anything with .render() works
```

This is why explicit interfaces are rarer than in Java. When you do want the contract checked, use `typing.Protocol` for **structural** typing that mypy verifies without runtime inheritance:

```python
from typing import Protocol

class Renderable(Protocol):
    def render(self) -> str: ...

def render_all(items: list[Renderable]) -> list[str]:
    return [i.render() for i in items]
```

Use `abc.ABC` instead when you want runtime enforcement and shared implementation.

### 4.7 Metaclasses — and why you almost never need one

A metaclass is the class **of** a class: `type` is the default, and `class Foo:` is roughly `Foo = type('Foo', bases, namespace)`. A custom metaclass hooks class *creation*, letting you inspect or rewrite the class before it exists.

```python
class RegistryMeta(type):
    registry: dict[str, type] = {}
    def __new__(mcls, name, bases, ns, **kw):
        cls = super().__new__(mcls, name, bases, ns, **kw)
        if bases:                                  # skip the base itself
            RegistryMeta.registry[name.lower()] = cls
        return cls

class Agent(metaclass=RegistryMeta): ...
class ResumeParser(Agent): ...
RegistryMeta.registry          # {'resumeparser': <class ResumeParser>}
```

**When you actually need one:** framework-level work where every subclass must be transformed or registered and you cannot ask authors to add a decorator — ORMs and serialisation libraries. For everything else the simpler hooks are better and are what interviewers want to hear you reach for first:

- `__init_subclass__` — runs on each subclass; covers most registration needs.
- `__set_name__` — for descriptors that need their attribute name.
- a **class decorator** — for transforming one class.

The classic guidance holds: if you are wondering whether you need a metaclass, you don't.

---

## 5. Modules, Packages & Imports

### 5.1 Module vs package

A **module** is a single `.py` file. A **package** is a directory of modules that Python treats as one namespace.

```
app/                    ← package
  __init__.py           ← marks it a "regular" package; runs on first import
  config.py             ← module  → app.config
  agents/               ← subpackage
    __init__.py
    resume.py           → app.agents.resume
```

Since 3.3 a directory without `__init__.py` is a **namespace package** and is still importable. Keep `__init__.py` anyway: it gives you a place to define the public API, and namespace packages can silently merge directories across `sys.path` in ways that confuse tooling.

Keep `__init__.py` thin. Heavy imports there mean `import app.config` drags in the whole package — a real cold-start cost in serverless (§18.8).

### 5.2 Absolute vs relative imports

```python
from app.agents.resume import parse      # absolute — preferred (PEP 8)
from .resume import parse                # relative — only inside a package
```

Absolute imports are unambiguous and survive a file being moved less painfully. Relative imports beyond one level (`from ...pkg import x`) get hard to read fast.

### 5.3 Circular imports

`a.py` imports `b.py`, which imports `a.py`. The second import finds a **partially initialised** module and fails:

```
ImportError: cannot import name 'X' from partially initialized module 'a'
(most likely due to a circular import)
```

A circular import is almost always a **design** signal: two modules share a concern that belongs in a third. The fixes, best first:

1. **Extract the shared piece** into `types.py` / `models.py` that both import. This removes the cycle rather than hiding it.
2. **Depend on the abstraction, not the concrete module** — invert the dependency so the low-level module doesn't reach back up.
3. **Import inside the function** — defers resolution to call time. Legitimate for genuinely rare paths, but it is a workaround: it moves an import error from startup to runtime.
4. **`import a` instead of `from a import X`** — binds the module object, so attribute lookup happens later. Works because `import a` only needs the module to *exist*, not to be finished.

For type annotations only, the clean answer avoids the import entirely at runtime:

```python
from __future__ import annotations        # annotations become strings
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models import Candidate      # imported only by type checkers

def score(c: Candidate) -> float: ...
```

---

## 6. Environments & Dependency Management

### 6.1 Virtual environments

A virtual environment is an isolated directory with its own `site-packages` and its own interpreter symlink.

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
python -m pip install -r requirements.txt
```

**Why it exists:** two projects on one machine will eventually need different versions of the same library. Installing globally makes that unresolvable, and `sudo pip install` can break OS tooling that depends on the system Python. The environment also documents itself — what's installed *is* the dependency set.

Always invoke as `python -m pip` rather than `pip`: it guarantees you are installing into the interpreter you think you are.

### 6.2 `requirements.txt` vs `pyproject.toml`

| Aspect | `requirements.txt` | `pyproject.toml` |
|---|---|---|
| Standardised | no (a pip convention) | **yes** (PEP 518/621) |
| Describes | an install list | project metadata **+** dependencies |
| Typical use | pinned deploy artifact | source of truth for the project |
| Tool config | separate files | same file (`[tool.ruff]`, `[tool.pytest]`) |

The distinction that matters in interviews is **abstract vs concrete dependencies**:

- `pyproject.toml` declares what you *depend on*, loosely: `httpx>=0.27`.
- A **lockfile** (`poetry.lock`, `uv.lock`) or a fully pinned `requirements.txt` records the exact resolved graph, with hashes, for reproducible builds.

Applications should commit a lockfile. Libraries should not pin tightly, or they force conflicts on their consumers.

```toml
[project]
name = "prep-service"
requires-python = ">=3.12"
dependencies = ["fastapi>=0.115", "httpx>=0.27"]

[project.optional-dependencies]
dev = ["pytest>=8", "mypy>=1.11", "ruff>=0.6"]
```

**Tooling landscape:** `pip` + `venv` (built in, always available), `poetry` (resolver + lockfile + packaging), and `uv` (a Rust-based drop-in that is dramatically faster and now common in CI). Generate a pinned file for deploys with `pip freeze > requirements.txt` or `uv pip compile`.

---

## 7. Files & I/O

### 7.1 Reading and writing

Always use `with` — it closes the handle even if the body raises (§9):

```python
from pathlib import Path

with open('in.txt', encoding='utf-8') as f:       # ALWAYS pass encoding
    text = f.read()

with open('out.json', 'w', encoding='utf-8') as f:
    json.dump(payload, f, ensure_ascii=False, indent=2)

# pathlib for the small cases
Path('out.txt').write_text(text, encoding='utf-8')
```

Modes: `r` read, `w` truncate-and-write, `a` append, `x` create-or-fail, `+` read/write, `b` binary. Binary mode gives `bytes` and takes no `encoding`.

**Pass `encoding='utf-8'` explicitly.** Without it Python uses a locale-dependent default, so the same code reads a file correctly on your laptop and raises `UnicodeDecodeError` in a container. (3.15 makes UTF-8 the default, but being explicit remains correct and portable.)

### 7.2 Reading a large file without loading it

A file object is already a **lazy iterator of lines**:

```python
with open('huge.log', encoding='utf-8') as f:
    for line in f:                 # one line at a time, constant memory
        process(line)
```

`f.read()` and `f.readlines()` both materialise the whole file. See §8.2 for wrapping this in a generator.

### 7.3 Writing safely

A crash mid-write leaves a truncated file. Write to a temporary file and rename — `os.replace` is atomic on the same filesystem:

```python
import os, tempfile
from pathlib import Path

def write_atomic(path: Path, data: str) -> None:
    fd, tmp = tempfile.mkstemp(dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())       # durability, not just visibility
        os.replace(tmp, path)          # atomic
    except BaseException:
        os.unlink(tmp)
        raise
```

---

## 8. Iterators & Generators

### 8.1 The protocol

An **iterable** has `__iter__`. An **iterator** has `__next__` and raises `StopIteration` when exhausted. `for` calls `iter()` then `__next__()` repeatedly.

A **generator** is the easy way to write an iterator: any function containing `yield` returns a generator when called, and the body runs lazily.

```python
def countdown(n):
    while n > 0:
        yield n            # suspends here, resumes on next()
        n -= 1

g = countdown(3)
next(g)                    # 3
list(g)                    # [2, 1] — the 3 is already consumed
```

### 8.2 Generators vs returning a list

```python
def read_lines(path):                      # constant memory
    with open(path, encoding='utf-8') as f:
        for line in f:
            yield line.rstrip('\n')

def read_lines_list(path):                 # O(file size) memory
    with open(path, encoding='utf-8') as f:
        return [line.rstrip('\n') for line in f]
```

| Aspect | Generator | List |
|---|---|---|
| Memory | O(1) | O(n) |
| First result | immediate | after the whole file |
| Re-iterable | **no** (one-shot) | yes |
| `len()` | no | yes |
| Composable | yes, pipelines stay lazy | materialises each stage |

The trade-off that matters: generators are **single-pass**. If a caller needs two passes, or `len()`, or indexing, a generator forces them to build a list anyway. Return a generator for large or streaming data; return a list (or `Sequence`) for small collections a caller will poke at repeatedly.

Laziness also **moves where exceptions surface** — the body doesn't run until iteration, so an error in `read_lines` appears at the `for`, not at the call. That trips people up in tests.

### 8.3 Pipelines and `yield from`

```python
def parse(lines):  return (json.loads(l) for l in lines if l.strip())
def valid(records): return (r for r in records if r.get('id'))

for rec in valid(parse(read_lines('events.ndjson'))):
    handle(rec)                # nothing is materialised anywhere
```

`yield from` delegates to a sub-iterable, which flattens nested generators cleanly:

```python
def walk(node):
    yield node.value
    for child in node.children:
        yield from walk(child)
```

`itertools` covers most of what you'd otherwise hand-roll — `islice`, `chain`, `groupby`, `tee`, `batched` (3.12+).

### 8.4 Async generators

`async def` + `yield` gives an async generator, consumed with `async for`. This is the shape of LLM token streaming (§18.3):

```python
async def stream_tokens(client, prompt):
    async with client.stream('POST', '/v1/messages', json={...}) as resp:
        async for chunk in resp.aiter_lines():
            if chunk.startswith('data: '):
                yield json.loads(chunk[6:])['delta']

async for token in stream_tokens(client, 'hi'):
    print(token, end='', flush=True)
```

---

## 9. Context Managers

### 9.1 How `with` works internally

```python
with open('f.txt') as f:
    data = f.read()
```

desugars to roughly:

```python
mgr = open('f.txt')
f = type(mgr).__enter__(mgr)            # note: looked up on the TYPE
try:
    data = f.read()
finally:
    type(mgr).__exit__(mgr, *sys.exc_info())
```

- `__enter__` returns the value bound by `as`. It does **not** have to be the manager itself — that's how `open()` returns a file object.
- `__exit__(exc_type, exc_value, traceback)` always runs. **Returning a truthy value suppresses the exception** — powerful and easy to abuse. Return `None`/`False` unless you mean it (that is exactly how `contextlib.suppress` works).

```python
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self                      # so `as t` gives the Timer
    def __exit__(self, *exc):
        self.elapsed = time.perf_counter() - self.start
        return False                     # never swallow

with Timer() as t:
    do_work()
print(f'{t.elapsed:.3f}s')
```

### 9.2 `@contextmanager`

For the common "setup, yield, teardown" shape, the decorator is much less code. The `try/finally` is essential — without it, teardown is skipped when the body raises:

```python
from contextlib import contextmanager

@contextmanager
def rate_limit_token(bucket):
    token = bucket.acquire()
    try:
        yield token                  # the `with` body runs here
    finally:
        bucket.release(token)        # runs even on exception

with rate_limit_token(bucket) as t:
    call_api()
```

Async equivalent: `@asynccontextmanager` with `async with`.

Also useful from `contextlib`: `suppress(Exception)`, `closing(obj)`, and **`ExitStack`** for a dynamic number of managers:

```python
from contextlib import ExitStack
with ExitStack() as stack:
    files = [stack.enter_context(open(p)) for p in paths]   # all closed correctly
```

---

## 10. Decorators

### 10.1 What a decorator actually is

`@decorator` above a `def` is syntax for rebinding the name to the result of calling the decorator with the function:

```python
@timed
def work(): ...
# is exactly
def work(): ...
work = timed(work)
```

So a decorator is any callable taking a function and returning a replacement — usually a closure that wraps it.

### 10.2 `@timed` and `functools.wraps`

```python
import functools, logging, time

log = logging.getLogger(__name__)

def timed(fn):
    @functools.wraps(fn)                 # copy __name__, __doc__, __wrapped__
    def wrapper(*args, **kwargs):        # accept ANY signature
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            log.info('%s took %.3fs', fn.__qualname__, time.perf_counter() - start)
    return wrapper
```

**`functools.wraps` is not cosmetic.** Without it, `work.__name__` becomes `'wrapper'`, the docstring is lost, `help()` is useless, and — importantly — tooling that keys off `__name__` breaks. Two real cases: pytest collecting tests, and FastAPI/Flask route registration, where several decorated handlers all end up named `wrapper` and collide.

Timing goes in a `finally` so a failing call is still measured.

### 10.3 A decorator with arguments — `@retry(times=3)`

Arguments add a layer: the outer call returns the actual decorator.

```python
import functools, random, time

def retry(times=3, base=0.5, exceptions=(Exception,)):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args, **kwargs)
                except exceptions as exc:
                    if attempt == times:
                        raise                      # exhausted: propagate the last error
                    # exponential backoff with full jitter
                    sleep = random.uniform(0, base * 2 ** (attempt - 1))
                    log.warning('%s failed (%s), retry %d/%d in %.2fs',
                                fn.__qualname__, exc, attempt, times, sleep)
                    time.sleep(sleep)
        return wrapper
    return decorator

@retry(times=3, exceptions=(ConnectionError, TimeoutError))
def fetch(url): ...
```

Points interviewers probe:

- **Re-raise on the last attempt** rather than returning `None` — silently returning `None` on failure is far worse than an exception.
- **Catch narrowly.** Retrying a `ValueError` from bad input just wastes time; it will fail identically.
- **Only retry idempotent operations.** A retried `POST /charge` can double-charge — which is what idempotency keys are for.
- **Jitter matters.** Plain exponential backoff synchronises all clients into retry waves; full jitter (`uniform(0, cap)`) spreads them.

### 10.4 `functools.lru_cache`

```python
from functools import lru_cache

@lru_cache(maxsize=1024)
def embed(text: str) -> tuple[float, ...]:
    return tuple(expensive_model(text))

embed.cache_info()      # CacheInfo(hits=…, misses=…, currsize=…)
embed.cache_clear()
```

Constraints worth stating: arguments must be **hashable** (no dicts or lists), the cache is **per-process** (useless for cross-worker sharing — use Redis, §18.6), it is **unbounded** with `maxsize=None`, and caching a method keeps `self` alive in the cache, which leaks. `functools.cache` is `lru_cache(maxsize=None)`.

### 10.5 Class-based decorators and stacking

```python
class CountCalls:
    def __init__(self, fn):
        functools.update_wrapper(self, fn)
        self.fn, self.count = fn, 0
    def __call__(self, *a, **kw):
        self.count += 1
        return self.fn(*a, **kw)
```

Stacking applies **bottom-up**:

```python
@timed          # outer — sees retries as one duration
@retry(times=3) # inner — wraps the real function
def fetch(): ...
# fetch = timed(retry(times=3)(fetch))
```

Order changes meaning: swap them and you time each attempt separately. Same reasoning applies to `@app.get(...)` above `@requires_auth` in a web framework.

---

## 11. Type Hints & Static Analysis

### 11.1 Hints are not enforced at runtime

```python
def add(a: int, b: int) -> int:
    return a + b

add('x', 'y')        # runs fine, returns 'xy' — CPython ignores annotations
```

Annotations are metadata, readable via `typing.get_type_hints()`. They exist for **tools and humans**. Libraries can choose to enforce them at runtime — that is exactly what Pydantic and FastAPI do (§18.4).

### 11.2 The syntax you need

```python
from typing import Optional, Literal, TypedDict, Protocol, TypeVar, Self

ids: list[int]                       # builtin generics (3.9+), not typing.List
scores: dict[str, float]
maybe: str | None                    # 3.10+ union syntax; == Optional[str]
mode: Literal['fast', 'accurate']

class Row(TypedDict):                # a dict with a known shape
    id: int
    name: str

T = TypeVar('T')
def first(xs: list[T]) -> T | None:
    return xs[0] if xs else None
```

`Any` disables checking — use it deliberately. `object` accepts anything but permits nothing without narrowing, which is usually what you actually want.

### 11.3 How mypy uses them

```bash
mypy app/ --strict
```

mypy reads annotations and infers the rest, then reports inconsistencies without running your code — catching the `None` you forgot to handle and the branch returning the wrong type. Practical guidance:

- **Adopt gradually.** Unannotated functions are skipped by default. Turn on `--strict` per package via `pyproject.toml` as you annotate.
- **`disallow_untyped_defs`** is the flag that stops the codebase backsliding.
- **Third-party stubs:** many libraries ship types (PEP 561); otherwise install `types-requests` etc., or `ignore_missing_imports` for that module only.
- `# type: ignore[code]` should always name the specific error code.

```toml
[tool.mypy]
python_version = "3.12"
strict = true
[[tool.mypy.overrides]]
module = "legacy.*"
ignore_errors = true
```

The payoff in a service is largest at boundaries: request/response models, config, and the seams between modules.

---

## 12. Memory Management & Garbage Collection

### 12.1 Reference counting

CPython's primary mechanism. Every object carries a count of references to it; when the count hits zero the object is freed **immediately and deterministically**.

```python
import sys
a = []
sys.getrefcount(a)      # 2 — `a` plus the temporary argument reference
b = a
sys.getrefcount(a)      # 3
del b                   # back to 2
```

This is why `with` is reliable in CPython and why the file in `for line in open(p):` usually closes promptly — but do not rely on that: other implementations (PyPy) don't use reference counting, and it is not a language guarantee.

### 12.2 Reference cycles and the generational collector

Reference counting alone **cannot free cycles** — each object in the cycle keeps the other alive:

```python
a = {}; b = {}
a['b'] = b; b['a'] = a          # refcount never reaches 0
del a, b                        # unreachable, but not freed by refcounting
```

So CPython adds a **generational cyclic garbage collector**. It tracks container objects in three generations; survivors get promoted, and older generations are scanned less often — the heuristic being that most objects die young.

```python
import gc
gc.collect()             # force a full collection; returns objects freed
gc.get_stats()
gc.freeze()              # after startup: move current objects out of gen0 scanning
```

**When you'd actually call `gc.collect()`:**

- Immediately after building a large temporary graph, to return memory before a memory-heavy phase.
- In tests asserting that objects are released.
- Before `fork()`, together with `gc.freeze()`, to keep copy-on-write pages shared in pre-fork servers (a real Gunicorn/uWSGI memory win).

And when you'd **disable** it: latency-sensitive services sometimes run `gc.disable()` to avoid unpredictable pauses, accepting that cycles leak — only viable if you don't create them.

Objects with `__del__` in cycles were uncollectable before 3.4; since PEP 442 they are collected, but `__del__` remains a bad place for important cleanup (ordering is unspecified, exceptions are swallowed). Use context managers.

### 12.3 What actually leaks in Python services

Genuine leaks are almost always **unbounded growth of a live container**, not GC failure:

- a module-level `dict`/`list` cache with no eviction — the most common by far;
- `lru_cache` on a method, pinning every `self`;
- accumulating exception objects (tracebacks reference frames, which reference locals);
- a growing list of not-awaited asyncio tasks.

Diagnose with `tracemalloc`, which attributes allocations to source lines:

```python
import tracemalloc
tracemalloc.start()
snap1 = tracemalloc.take_snapshot()
run_workload()
snap2 = tracemalloc.take_snapshot()
for stat in snap2.compare_to(snap1, 'lineno')[:10]:
    print(stat)
```

Use `weakref` (or `WeakValueDictionary`) for caches that must not keep their values alive.

---

## 13. The GIL & Choosing a Concurrency Model

### 13.1 What the GIL is

The **Global Interpreter Lock** is a single mutex in CPython that allows only **one thread to execute Python bytecode at a time**. It exists because CPython's memory management (reference counting) is not thread-safe; one coarse lock was far simpler and faster for single-threaded code than fine-grained locking everywhere.

The consequence people state correctly: **threads do not give you CPU parallelism** in CPython. Two threads doing arithmetic run concurrently but not in parallel, and can be *slower* than one because of lock contention and switching.

The consequence people miss: **the GIL is released around blocking I/O**, and by C extensions that opt out. So:

```python
# 4 threads, CPU-bound  → ~no speedup (often slower)
# 4 threads, network I/O → ~4x, because each releases the GIL while waiting
# NumPy matrix ops       → parallel, the C code releases the GIL
```

So the GIL penalises **CPU-bound Python bytecode** specifically. It does not make threads useless — it makes them the wrong tool for computation and the right tool for blocking calls.

**Status in 2026:** PEP 703 free-threaded CPython (no GIL) is available as an official build from 3.13 and became a supported (still not default) build in 3.14. It removes the restriction at some single-threaded cost, and most C extensions need work. Interview-safe answer: *know it exists and is not yet the default; reason about the GIL as present.*

### 13.2 Threading vs multiprocessing vs asyncio

| Module | Parallelism | Best for | Cost |
|---|---|---|---|
| `threading` | I/O only (GIL) | blocking I/O with libraries that aren't async | shared memory → locks, races |
| `multiprocessing` | **real CPU parallelism** | CPU-bound work | process startup; data must be pickled |
| `asyncio` | I/O only, 1 thread | **thousands** of concurrent I/O waits | needs async libraries top to bottom |

The decision rule:

- **CPU-bound?** → `multiprocessing` / `ProcessPoolExecutor`. Or push the work into C (NumPy, Polars) which releases the GIL.
- **I/O-bound, and the client library is async?** → `asyncio`. Highest concurrency per unit of memory: coroutines cost ~KB, threads ~MB of stack.
- **I/O-bound, but the library is blocking** (many DB drivers, `requests`, boto3) → `threading` / `ThreadPoolExecutor`, or run it in a thread from async code via `asyncio.to_thread`.
- **Mixed** → async for the I/O, and offload CPU work to a process pool via `loop.run_in_executor`.

```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

with ThreadPoolExecutor(max_workers=16) as ex:          # I/O
    results = list(ex.map(fetch_url, urls))

with ProcessPoolExecutor() as ex:                        # CPU
    results = list(ex.map(score_resume, docs))
```

`concurrent.futures` gives one API over both, which makes swapping the model a one-line change — a good reason to prefer it over raw `Thread`/`Process` objects.

**For an agent-evaluation pipeline** (the common AI-service shape): the work is dominated by waiting on model APIs, so **asyncio** is right — one process can hold hundreds of in-flight requests with a semaphore capping concurrency. Reach for processes only for genuinely CPU-heavy local steps (parsing large PDFs, local embeddings); `ProcessPoolExecutor` there, driven from the async loop. `multiprocessing` for the whole pipeline wastes memory duplicating the interpreter and forces pickling of every payload.

### 13.3 Threads need locks

```python
from threading import Lock
counter, lock = 0, Lock()

def incr():
    global counter
    with lock:              # counter += 1 is read-modify-write: not atomic
        counter += 1
```

The GIL does **not** make your code thread-safe; it only serialises bytecode, and a single Python statement is several bytecodes. Prefer `queue.Queue` (already synchronised) for handing work between threads over shared mutable state plus locks.

---

## 14. asyncio in Depth

### 14.1 The model

One thread, one **event loop**, cooperative multitasking. A coroutine runs until it hits `await` on something not ready, hands control back to the loop, and the loop runs another ready task. Concurrency comes from **interleaving waits**, not from parallel execution.

```python
import asyncio

async def main():
    await asyncio.sleep(1)        # yields to the loop; does NOT block the thread

asyncio.run(main())               # creates the loop, runs, closes it
```

`async def` defines a coroutine function; **calling it returns a coroutine object and runs nothing**. It only executes when awaited or scheduled as a task. Forgetting to await is the most common asyncio bug — you get a `RuntimeWarning: coroutine ... was never awaited` and silently no work.

### 14.2 Running things concurrently — `gather`

Sequential awaits are *not* concurrent:

```python
a = await fetch(1)        # 200ms
b = await fetch(2)        # 200ms  → 400ms total
```

```python
async def call_llm(i: int) -> str:
    await asyncio.sleep(0.2)                 # stand-in for an API call
    return f'response-{i}'

async def main():
    results = await asyncio.gather(*(call_llm(i) for i in range(5)))
    # ~200ms total, order matches the inputs
```

`gather` preserves **input order** in its results regardless of completion order. By default one exception propagates immediately while the other tasks keep running (and may be left orphaned); `return_exceptions=True` instead collects exceptions as results, which is what you want for partial-failure pipelines (§18.5):

```python
results = await asyncio.gather(*tasks, return_exceptions=True)
ok   = [r for r in results if not isinstance(r, BaseException)]
bad  = [r for r in results if isinstance(r, BaseException)]
```

For structured concurrency with reliable cancellation, prefer `TaskGroup` (3.11+):

```python
async with asyncio.TaskGroup() as tg:         # cancels siblings on failure
    for i in range(5):
        tg.create_task(call_llm(i))
```

### 14.3 Capping concurrency — `Semaphore`

Unbounded `gather` over 10,000 items opens 10,000 connections and gets you rate-limited or OOM-killed. A semaphore bounds in-flight work:

```python
async def bounded(sem: asyncio.Semaphore, i: int) -> str:
    async with sem:                      # acquire/release around the await
        return await call_llm(i)

async def main():
    sem = asyncio.Semaphore(2)           # at most 2 concurrent calls
    return await asyncio.gather(*(bounded(sem, i) for i in range(5)))
```

Note all 5 tasks are *created* immediately; the semaphore only limits how many are inside the block. With thousands of items, also batch the creation so you aren't holding thousands of task objects.

### 14.4 Timeouts and cancellation

```python
try:
    async with asyncio.timeout(5):          # 3.11+; wraps the whole block
        data = await call_llm(0)
except TimeoutError:
    data = None
```

Cancellation is delivered as `CancelledError` **raised at the await point**. Two rules: it inherits from `BaseException`, so `except Exception` does not catch it (deliberately); and if you catch it for cleanup you must re-raise, or you break cancellation.

```python
try:
    await work()
except asyncio.CancelledError:
    await cleanup()
    raise                                    # always re-raise
```

Also: **keep a reference to tasks you create.** `asyncio.create_task(...)` without storing the result can be garbage-collected mid-flight.

### 14.5 `asyncio.Queue` — producer/consumer

```python
async def producer(q: asyncio.Queue, items):
    for it in items:
        await q.put(it)              # blocks when maxsize is reached → backpressure

async def consumer(q: asyncio.Queue, name: str):
    while True:
        item = await q.get()
        try:
            await handle(item)
        finally:
            q.task_done()            # even on failure, or join() hangs

async def main(items):
    q = asyncio.Queue(maxsize=100)                       # bounded = backpressure
    workers = [asyncio.create_task(consumer(q, f'w{i}')) for i in range(4)]
    await producer(q, items)
    await q.join()                                        # wait for the backlog
    for w in workers:
        w.cancel()                                        # consumers loop forever
    await asyncio.gather(*workers, return_exceptions=True)
```

The details that separate a working implementation from a hanging one: **bounded `maxsize`** (an unbounded queue means a fast producer buys unbounded memory), `task_done()` in a `finally`, and explicitly cancelling the infinite consumers at the end.

### 14.6 Never block the loop

One synchronous blocking call freezes **every** task in the process:

```python
async def bad():
    time.sleep(5)                    # blocks the whole loop
    requests.get(url)                # same — blocking socket

async def good():
    await asyncio.sleep(5)
    async with httpx.AsyncClient() as c:
        await c.get(url)
    result = await asyncio.to_thread(cpu_or_blocking_call, arg)   # offload
```

Use `asyncio.to_thread` for blocking libraries and `loop.run_in_executor(ProcessPoolExecutor(), ...)` for CPU work. `asyncio.run(debug=True)` logs callbacks that take too long — the fastest way to find an accidental blocking call.

---

## 15. Testing

### 15.1 pytest basics

```python
# test_scoring.py
import pytest
from app.scoring import score

def test_score_clamps_high():
    assert score(150) == 100

@pytest.mark.parametrize('raw,expected', [(0, 0), (50, 50), (150, 100)])
def test_score_table(raw, expected):
    assert score(raw) == expected

def test_rejects_negative():
    with pytest.raises(ValueError, match='out of range'):
        score(-1)
```

Plain `assert` (pytest rewrites it to show both sides), `parametrize` instead of loops so each case reports separately, and `pytest.raises` with `match` so you assert *which* error.

**Fixtures** provide dependencies with teardown:

```python
@pytest.fixture
def client():
    app = create_app(Config(testing=True))
    with TestClient(app) as c:
        yield c                        # teardown after yield
```

Scopes: `function` (default), `class`, `module`, `session`. Shared fixtures go in `conftest.py`.

### 15.2 Mocking an external API

Tests must not hit the network: it's slow, flaky and sometimes billed. Patch **where the name is looked up**, not where it's defined:

```python
from unittest.mock import patch, Mock

# app/client.py    →  import httpx ; def fetch_user(id): return httpx.get(...)
# So patch 'app.client.httpx', NOT 'httpx'.

def test_fetch_user():
    with patch('app.client.httpx') as mock_httpx:
        mock_httpx.get.return_value = Mock(
            status_code=200, json=lambda: {'id': 1, 'name': 'ana'})
        assert fetch_user(1)['name'] == 'ana'
        mock_httpx.get.assert_called_once()
```

That "patch where it's used" rule is the single most common mocking mistake. Use `autospec=True` so the mock rejects calls the real function wouldn't accept — otherwise mocks happily accept a signature you later change, and the test keeps passing while production breaks.

For async code use `AsyncMock`. Better still, mock at the **transport boundary** so your own code stays real — `respx` for httpx, `responses` for requests:

```python
import respx, httpx

@respx.mock
async def test_calls_llm():
    respx.post('https://api.example.com/v1/messages').mock(
        return_value=httpx.Response(200, json={'content': 'hi'}))
    assert await call_llm('prompt') == 'hi'
```

### 15.3 Testing nondeterministic LLM calls

You cannot assert on exact model output. Three layers, and mature teams use all three:

1. **Mock/stub the provider** for unit tests. Deterministic, free, fast — this is where the *logic around* the call (retries, parsing, fallbacks) gets tested.
2. **Cassette (VCR-style) tests** — record real responses once, replay from disk after. Catches contract drift in the provider's schema without per-run cost. Scrub API keys from cassettes, and re-record on a schedule or the cassettes become fiction.
3. **Golden / eval tests** — a fixed input set with expected *properties* rather than exact strings, scored and thresholded. Assert on invariants: valid JSON, required fields present, no PII echoed, a similarity or rubric score above a bar. Run these as a nightly gate, not in the PR loop — they cost money and have variance.

```python
# property-based assertions instead of exact-match
def test_extraction_shape(llm_response):
    parsed = extract(llm_response)
    assert set(parsed) >= {'name', 'skills'}
    assert isinstance(parsed['skills'], list)
    assert all(isinstance(s, str) for s in parsed['skills'])
```

Pin `temperature=0` and a model **version** to reduce variance, and remember that still doesn't guarantee determinism.

### 15.4 Async tests

```python
# pyproject.toml: [tool.pytest.ini_options] asyncio_mode = "auto"
async def test_gather_bounded():
    out = await bounded_map(call_llm, range(5), limit=2)
    assert len(out) == 5
```

Requires `pytest-asyncio` (or `anyio`). `asyncio_mode = "auto"` saves decorating every test.

---

## 16. Performance & Profiling

### 16.1 Measure before optimising

```python
# micro-benchmark one expression
python -m timeit -s "s=list(range(1000))" "sum(s)"

# profile a whole run: which functions cost most
python -m cProfile -s cumtime app/main.py | head -30
```

```python
import cProfile, pstats
prof = cProfile.Profile()
prof.enable(); slow_function(); prof.disable()
pstats.Stats(prof).sort_stats('cumtime').print_stats(20)
```

Read `cumtime` (function plus everything it calls) to find *where* time goes, then `tottime` (excluding callees) to find the actual hot code.

### 16.2 The workflow for "this function is slow"

1. **Reproduce** with a benchmark you can rerun — otherwise you cannot tell if you helped.
2. **cProfile** it to get the function-level breakdown. Deterministic but adds overhead and hides time inside C calls.
3. **Line-level** (`line_profiler`, `@profile`) on the one suspicious function.
4. **Distinguish CPU from waiting.** If `cumtime` is large but `tottime` is tiny, you are blocked on I/O — profiling the Python won't help; look at query counts and network calls. `py-spy` samples a *running* process without restarting it, which is how you profile production.
5. **Check the algorithm before the micro-optimisations.** The usual real causes, in frequency order: an accidental O(n²) (a `list` membership test in a loop — use a `set`), N+1 queries, repeated serialisation, and re-computing something cacheable.
6. **Then** consider the mechanical wins: `set`/`dict` lookups, avoiding attribute lookups in hot loops, `__slots__`, batching I/O, and pushing numeric work into NumPy/Polars.

```python
# O(n*m) → O(n+m)
if item in big_list:        # O(m) each time
if item in big_set:         # O(1)
```

`tracemalloc` for memory (§12.3); `py-spy top --pid <pid>` for a live flame view.

---

## 17. Structuring a Backend Service

### 17.1 Layout

```
prep-service/
  pyproject.toml
  README.md
  src/
    app/
      __init__.py
      main.py              # entrypoint: create_app(), routers wired
      config.py            # settings, loaded once
      api/                 # HTTP layer: routing, request/response models only
        __init__.py
        routes/
          candidates.py
      services/            # business logic — no HTTP, no SQL
        scoring.py
      repositories/        # data access — SQL/driver lives here
        candidates.py
      agents/              # domain-specific workers
        resume_parser.py
      core/                # cross-cutting: logging, errors, security
        logging.py
        errors.py
  tests/
    conftest.py
    unit/
    integration/
```

The `src/` layout is deliberate: it makes it impossible to import the package from the repo root by accident, so your tests exercise the **installed** package the way production will (`pip install -e .`).

The layering rule is one-directional: `api → services → repositories`. Services must not import from `api` (no framework types in business logic), which keeps the logic testable without HTTP and swappable behind a CLI or a queue consumer.

### 17.2 Configuration

Read config **once**, from the environment, validated at startup. Never scatter `os.environ` through the codebase.

```python
# app/config.py
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_prefix='APP_')

    environment: str = 'local'
    database_url: str
    llm_api_key: str = Field(repr=False)          # keep it out of logs/reprs
    llm_timeout_s: float = 30.0
    max_concurrency: int = 8

@lru_cache
def get_settings() -> Settings:
    return Settings()          # validated on first call; fails fast at startup
```

Three properties this gives you: **fail fast** (a missing variable crashes at boot, not at 3am on a rare path), **typed** (`max_concurrency` is an `int`, not `"8"`), and **injectable** (override `get_settings` in tests). `repr=False` on secrets stops them leaking into an exception dump.

12-factor principle: config comes from the environment, not committed files. `.env` is a local-development convenience and must be gitignored.

---

## 18. Python for LLM & Agent Services

### 18.1 A concurrent pipeline over many model calls

The canonical shape: bounded concurrency, per-call timeout, retry with jitter, and **no single failure killing the run**.

```python
import asyncio, random

async def call_with_policy(client, prompt, sem, *, attempts=3, timeout_s=30):
    async with sem:                                    # global concurrency cap
        for attempt in range(1, attempts + 1):
            try:
                async with asyncio.timeout(timeout_s):
                    return await client.complete(prompt)
            except (TimeoutError, TransientProviderError):
                if attempt == attempts:
                    raise
                await asyncio.sleep(random.uniform(0, 0.5 * 2 ** (attempt - 1)))

async def run_pipeline(client, prompts, limit=8):
    sem = asyncio.Semaphore(limit)
    tasks = [call_with_policy(client, p, sem) for p in prompts]
    return await asyncio.gather(*tasks, return_exceptions=True)
```

Why each piece: the **semaphore** protects the provider's rate limit and your memory; the **timeout** stops a hung socket occupying a slot forever; **jittered backoff** avoids retry storms; `return_exceptions=True` turns a failure into a *result* you can inspect rather than an exception that abandons the batch.

### 18.2 Rate limiting across many workers

A `Semaphore` bounds concurrency, not **rate**. Providers limit requests *and tokens* per minute, so you need a token bucket — and if you run multiple workers or pods, it must be **shared**:

```python
# Local: refill lazily, no background task needed.
class TokenBucket:
    def __init__(self, rate_per_s: float, capacity: float):
        self.rate, self.capacity = rate_per_s, capacity
        self.tokens, self.updated = capacity, time.monotonic()
        self._lock = asyncio.Lock()

    async def take(self, n: float = 1.0) -> None:
        while True:
            async with self._lock:
                now = time.monotonic()
                self.tokens = min(self.capacity,
                                  self.tokens + (now - self.updated) * self.rate)
                self.updated = now
                if self.tokens >= n:
                    self.tokens -= n
                    return
                deficit = (n - self.tokens) / self.rate
            await asyncio.sleep(deficit)
```

Across processes, keep the counter in **Redis** (an atomic Lua script, or `INCR` on a per-window key). Also: **respect `Retry-After`** on a 429 instead of your own backoff, and reserve headroom — aim for ~80% of the documented limit so retries have room.

### 18.3 Streaming responses

Stream so the user sees tokens immediately rather than waiting for the full completion. Async generators (§8.4) are the natural fit, and the generator must propagate cancellation so a disconnect stops the upstream call:

```python
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

@app.post('/chat')
async def chat(req: Request, body: ChatIn):
    async def gen():
        try:
            async for delta in llm.stream(body.prompt):
                if await req.is_disconnected():
                    break                      # stop paying for tokens
                yield f'data: {json.dumps({"delta": delta})}\n\n'
            yield 'data: [DONE]\n\n'
        except Exception as exc:
            log.exception('stream failed')
            # errors mid-stream cannot use a status code — headers are already sent
            yield f'data: {json.dumps({"error": str(exc)})}\n\n'
    return StreamingResponse(gen(), media_type='text/event-stream',
                             headers={'X-Accel-Buffering': 'no'})
```

Two things bite in production: **an error after the first byte cannot change the HTTP status** — it must be sent in-band, and clients must handle it; and **buffering proxies** (nginx, some load balancers) will hold your chunks until the response ends, which looks exactly like a broken stream. `X-Accel-Buffering: no` disables it for nginx.

### 18.4 Pydantic in a high-throughput service

Pydantic v2's core is compiled Rust, so validation is roughly 5–50× faster than v1 — but it is **not free**, and in a high-QPS service it can show up in profiles. Where the cost concentrates and what to do:

- **Large nested payloads** cost the most; validation is proportional to the data you validate.
- **`model_validate` on every request** is usually worth it at the trust boundary — it is your input sanitisation, and skipping it trades a known cost for unknown corruption.
- **Don't re-validate internally.** Construct once at the edge, then pass the typed object down. `model_construct()` skips validation for data you already trust.
- **Response models double the work** — FastAPI validates your *output* too. If a handler returns data you just built, `response_model` is often pure overhead; return a plain dict or use `response_model_exclude_unset`.
- Prefer `TypeAdapter` for repeated validation of the same non-model shape, and `model_dump_json()` (Rust) over `json.dumps(model.model_dump())` (two passes).
- Avoid expensive custom validators on hot fields; regex-heavy validators are a common hidden cost.

Rule of thumb: validate at the boundary, trust internally, and profile before assuming Pydantic is your bottleneck — it usually isn't, the model API call is.

### 18.5 Partial-failure recovery across many agents

With dozens of independent agents, the requirement is that **one failure degrades the result, never the run**. The pattern:

```python
from dataclasses import dataclass
from typing import Any

@dataclass
class AgentResult:
    name: str
    ok: bool
    value: Any = None
    error: str | None = None
    duration_s: float = 0.0

async def run_agent(agent, ctx, sem) -> AgentResult:
    start = time.perf_counter()
    async with sem:
        try:
            async with asyncio.timeout(agent.timeout_s):
                value = await agent.run(ctx)
            return AgentResult(agent.name, True, value,
                               duration_s=time.perf_counter() - start)
        except Exception as exc:                       # per-agent boundary
            log.exception('agent %s failed', agent.name)
            return AgentResult(agent.name, False, error=repr(exc),
                               duration_s=time.perf_counter() - start)

async def run_all(agents, ctx, limit=8) -> list[AgentResult]:
    sem = asyncio.Semaphore(limit)
    return await asyncio.gather(*(run_agent(a, ctx, sem) for a in agents))
```

The design points: each agent is wrapped in its **own** try/except so it returns a *result object* rather than raising; the run always produces one result per agent, so the caller can report "31 of 35 succeeded"; failures carry enough detail to debug. Then layer on **criticality** (mark agents required vs optional and fail the run only if a required one fails), **dependencies** (topologically order and skip downstream agents whose input is missing, recording `skipped` rather than `failed`), and **idempotency + checkpointing** so a rerun resumes rather than repeating paid calls.

Note this deliberately does **not** use `TaskGroup`: TaskGroup cancels siblings on failure, which is the opposite of what a best-effort fan-out wants.

### 18.6 Caching expensive model calls

LLM calls are slow and metered, and identical inputs recur far more than people expect. A Redis cache in front pays for itself immediately:

```python
import hashlib, json

def cache_key(model: str, prompt: str, **params) -> str:
    # The key must cover EVERYTHING that changes the output.
    payload = json.dumps({'m': model, 'p': prompt, **params}, sort_keys=True)
    return 'llm:' + hashlib.sha256(payload.encode()).hexdigest()

async def cached_complete(redis, client, model, prompt, ttl=86_400, **params):
    key = cache_key(model, prompt, **params)
    if (hit := await redis.get(key)) is not None:
        return json.loads(hit)
    result = await client.complete(model=model, prompt=prompt, **params)
    await redis.set(key, json.dumps(result), ex=ttl)
    return result
```

What to get right: **hash the full request** including model version, temperature and system prompt — a key that ignores parameters returns wrong answers; **only cache deterministic calls** (`temperature=0`), since caching a creative generation makes it stale-but-plausible; **set a TTL** because model versions change; **never cache across users** if the prompt embeds user data — namespace the key or you have a data-leak bug; and consider **semantic caching** (embed the prompt, reuse on high similarity) only where approximate matches are acceptable, because it will occasionally serve a wrong-but-similar answer.

### 18.7 A plugin architecture for agents

A decorator-based registry gives you dynamic dispatch with a single enforced interface:

```python
from typing import Protocol, Callable, Awaitable

class Agent(Protocol):
    async def __call__(self, ctx: dict) -> dict: ...

REGISTRY: dict[str, Agent] = {}

def register_agent(name: str) -> Callable[[Agent], Agent]:
    def decorator(fn: Agent) -> Agent:
        if name in REGISTRY:
            raise ValueError(f'duplicate agent: {name}')     # catch typos at import
        REGISTRY[name] = fn
        return fn                                            # return unchanged
    return decorator

@register_agent('resume_parser')
async def resume_parser(ctx: dict) -> dict:
    return {'skills': extract_skills(ctx['text'])}

async def dispatch(name: str, ctx: dict) -> dict:
    try:
        agent = REGISTRY[name]
    except KeyError:
        raise ValueError(f'unknown agent {name!r}; known: {sorted(REGISTRY)}') from None
    return await agent(ctx)
```

The subtlety: **registration happens on import**, so a module nobody imports registers nothing. Either import the package's agents explicitly in `__init__.py`, or discover them — `pkgutil.iter_modules` for a directory, or **entry points** (`importlib.metadata.entry_points`) if plugins ship as separate installable packages, which is how real plugin ecosystems do it. Keep the interface narrow (one `ctx` in, one dict out) so agents stay independently testable.

### 18.8 Secrets, and serverless concerns

**Secrets on AWS Lambda.** Never in code or in the repo. Ranked:

1. **Secrets Manager / SSM Parameter Store (SecureString)**, fetched at cold start and cached in a module-level variable for the container's life. Supports rotation, and access is IAM-scoped and auditable via CloudTrail. Use the **Parameters and Secrets Lambda Extension** to cache locally and avoid an API call per invocation.
2. **Lambda environment variables encrypted with a customer-managed KMS key** — simpler, but the value is visible to anyone with `GetFunctionConfiguration` and does not rotate.
3. **Plain environment variables** — acceptable only for non-secrets.

Give the function its own execution role with least privilege, scoped to the specific secret ARN.

```python
import boto3, functools

@functools.cache                                  # once per container, not per call
def get_secret(name: str) -> str:
    return boto3.client('secretsmanager').get_secret_value(SecretId=name)['SecretString']
```

**Sync vs async DB drivers in serverless.** `psycopg` (sync) vs `asyncpg` (async) changes two things:

- **Cold start:** async stacks pull in more machinery, and an event loop plus pool must be created. Modest, but real — keep the import graph small (§5.1) since import time dominates cold start.
- **Concurrency:** a Lambda invocation handles **one request**, so in-request async concurrency buys you nothing unless a single request makes several I/O calls. Async pays off when one handler fans out (three model calls plus a DB read); it does not turn one container into a multi-request server.
- **Connection pooling is the real trap.** Each container holds its own pool, so N concurrent Lambdas open N pools and exhaust Postgres `max_connections`. Fix with **RDS Proxy** (or pgbouncer), pool size **1–2** per container, and a short idle timeout. Create the pool at module scope so it's reused across invocations in the same container, and never assume the container survives.

### 18.9 Structured logging & correlation IDs

Multi-step pipelines are undebuggable with unstructured logs. Emit **JSON**, one event per line, and stamp every line with an ID that ties the whole run together.

```python
import contextvars, json, logging

request_id: contextvars.ContextVar[str] = contextvars.ContextVar('request_id', default='-')

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            'ts': self.formatTime(record, '%Y-%m-%dT%H:%M:%S%z'),
            'level': record.levelname,
            'logger': record.name,
            'msg': record.getMessage(),
            'request_id': request_id.get(),           # pulled from context
        }
        if record.exc_info:
            payload['exc'] = self.formatException(record.exc_info)
        payload.update(getattr(record, 'extra_fields', {}))
        return json.dumps(payload)

log.info('agent finished', extra={'extra_fields': {'agent': 'resume_parser', 'ms': 812}})
```

**`contextvars` is the key mechanism** — unlike thread-locals it is coroutine-aware, so each concurrent task carries its own value and the ID follows the logical flow across `await` points without threading a parameter through every function.

Set it once at the edge (middleware), honouring an inbound header so the ID spans services:

```python
@app.middleware('http')
async def add_request_id(request, call_next):
    rid = request.headers.get('X-Request-ID') or str(uuid.uuid4())
    request_id.set(rid)
    response = await call_next(request)
    response.headers['X-Request-ID'] = rid            # give it back to the caller
    return response
```

For a pipeline, add a `run_id` for the whole run plus a `step_id`/`agent` per stage — then one query returns the full story of a single run. Graduate to **OpenTelemetry** spans when you need timing waterfalls and cross-service traces; the correlation ID becomes the trace ID.

---

## 19. PEP 8 & Code Style

**PEP 8** is the style guide for Python code: 4-space indents, `snake_case` for functions and variables, `PascalCase` for classes, `UPPER_SNAKE` for constants, two blank lines between top-level definitions, imports grouped standard-library / third-party / local.

Why style matters is worth answering properly: it is not aesthetics, it is **reducing the cost of reading**. A consistent codebase lets a reviewer spend attention on logic instead of formatting, makes diffs show real changes rather than reflowed lines, and removes an entire category of pointless review argument. PEP 8 itself says consistency **within a project** outranks the guide, and that readability beats rule-following — "know when to be inconsistent."

In practice nobody applies it by hand:

```bash
ruff format .          # formatter (Black-compatible)
ruff check . --fix     # linter: pycodestyle, pyflakes, isort, pyupgrade and more
mypy src/
```

`ruff` has largely consolidated the old stack (`black` + `isort` + `flake8` + plugins) into one fast tool. Wire it into pre-commit and CI so style is never a review comment.

```toml
[tool.ruff]
line-length = 100
target-version = "py312"
[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B", "SIM", "ASYNC"]
```

Docstrings follow **PEP 257**. Type hints (§11) do the job old docstring type annotations used to.

---

## 20. Practical Exercises

Work these by hand before reading the solution. Several are expanded in the sections above — the cross-references point at the fuller discussion.

### 20.1 Basic

**Exercise 1 — `@timed` and `@retry(times=3)`.**
Full implementations and the reasoning are in [§10.2](#10-decorators) and [§10.3](#10-decorators). The gradeable points: `functools.wraps`, `*args/**kwargs` pass-through, timing in a `finally`, re-raising on the final attempt, and jittered backoff.

**Exercise 2 — an LRU cache, twice.**

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def slow_square(n: int) -> int:
    time.sleep(0.1)
    return n * n
```

Now by hand. A `dict` gives O(1) lookup; a **doubly linked list** gives O(1) move-to-front and O(1) eviction of the tail — a list or deque would make one of those O(n).

```python
class Node:
    __slots__ = ('key', 'value', 'prev', 'next')
    def __init__(self, key=None, value=None):
        self.key, self.value = key, value
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        if capacity <= 0:
            raise ValueError('capacity must be positive')
        self.capacity = capacity
        self.map: dict[object, Node] = {}
        # Sentinel head/tail remove every null check from the link surgery.
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node: Node) -> None:
        node.prev.next, node.next.prev = node.next, node.prev

    def _push_front(self, node: Node) -> None:
        node.next, node.prev = self.head.next, self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        node = self.map.get(key)
        if node is None:
            return None
        self._remove(node); self._push_front(node)      # mark most-recent
        return node.value

    def put(self, key, value) -> None:
        if (node := self.map.get(key)) is not None:
            node.value = value
            self._remove(node); self._push_front(node)
            return
        if len(self.map) >= self.capacity:
            lru = self.tail.prev                        # evict least-recent
            self._remove(lru)
            del self.map[lru.key]
        node = Node(key, value)
        self.map[key] = node
        self._push_front(node)
```

A shortcut worth knowing: `collections.OrderedDict` already has `move_to_end` and `popitem(last=False)`, and a plain `dict` preserves insertion order in 3.7+, so you can implement the same thing in ~10 lines. Interviewers usually want the linked list to see whether you can reason about the pointers.

**Exercise 3 — five concurrent "LLM" calls, then cap at 2.**
See [§14.2](#14-asyncio-in-depth) for `gather` and [§14.3](#14-asyncio-in-depth) for the `Semaphore`. The insight to state: `gather` gives you concurrency, the semaphore gives you *bounded* concurrency, and with `Semaphore(2)` the five calls complete in roughly three waves rather than one.

**Exercise 4 — `with Timer() as t`.**
See [§9.1](#9-context-managers). Use `time.perf_counter()` (monotonic, high resolution), not `time.time()` which can jump when the clock is adjusted. Set `elapsed` in `__exit__` and return `False`.

**Exercise 5 — lazily yield lines from a large file.**
See [§8.2](#8-iterators-generators). The point is constant memory: the file object is already a lazy line iterator, so the generator just wraps it and keeps the `with` block alive across the whole iteration.

### 20.2 Intermediate

**Exercise 1 — exponential backoff with jitter over a flaky function.**

```python
import random, time

def flaky(fail_rate: float = 0.7) -> str:
    if random.random() < fail_rate:
        raise ConnectionError('simulated API failure')
    return 'ok'

def call_with_backoff(fn, *, attempts=5, base=0.2, cap=5.0):
    for attempt in range(1, attempts + 1):
        try:
            return fn()
        except ConnectionError:
            if attempt == attempts:
                raise
            backoff = min(cap, base * 2 ** (attempt - 1))
            time.sleep(random.uniform(0, backoff))     # FULL jitter
```

`min(cap, ...)` stops the delay growing without bound. **Full jitter** (`uniform(0, backoff)`) rather than `backoff ± noise` is what actually decorrelates many clients retrying together.

**Exercise 2 — `@dataclass` with validation, then the Pydantic version.**

```python
from dataclasses import dataclass, field

@dataclass
class CandidateScore:
    name: str
    score: float
    tags: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError('name must not be empty')
        if not 0 <= self.score <= 100:
            raise ValueError(f'score out of range: {self.score}')
        self.score = float(self.score)          # you coerce by hand
```

```python
from pydantic import BaseModel, Field, field_validator

class CandidateScore(BaseModel):
    name: str = Field(min_length=1)
    score: float = Field(ge=0, le=100)
    tags: list[str] = []                        # safe: Pydantic deep-copies defaults

    @field_validator('name')
    @classmethod
    def strip_name(cls, v: str) -> str:
        return v.strip()
```

**The comparison, which is the actual question:**

| Aspect | `@dataclass` | Pydantic |
|---|---|---|
| Validation | whatever you write in `__post_init__` | declarative, from the types |
| Coercion | none — `"85"` stays a string | `"85"` → `85.0` |
| Dependency | standard library | third party |
| Speed to construct | **faster** (no validation) | slower, but Rust-fast in v2 |
| Serialisation | `asdict()` | `model_dump()`, `model_dump_json()`, JSON Schema |

Use a dataclass for **internal** objects you already trust — it is lighter and has no dependency. Use Pydantic at a **trust boundary** (HTTP body, config, LLM output) where the data is untyped and hostile until proven otherwise. Note `tags: list[str] = []` is a `ValueError` in a dataclass but fine in Pydantic, which copies the default per instance.

**Exercise 3 — pytest with the API mocked.**
See [§15.2](#15-testing). The two things graded: patch the name **where it is used** (`app.client.httpx`, not `httpx`), and use `autospec=True` so the mock enforces the real signature.

**Exercise 4 — producer/consumer with `asyncio.Queue`.**
See [§14.5](#14-asyncio-in-depth). Graded: a bounded `maxsize` for backpressure, `task_done()` in a `finally`, and cancelling the consumers so the program can exit.

**Exercise 5 — process a folder of resumes concurrently, write JSON per file.**

File reading and parsing is blocking, so this is a **thread** problem, not an asyncio one — unless you switch to `aiofiles`. `asyncio.to_thread` lets you keep one async driver:

```python
import asyncio, json
from pathlib import Path

def parse_resume(path: Path) -> dict:            # blocking, CPU + file I/O
    text = path.read_text(encoding='utf-8', errors='replace')
    return {'file': path.name, 'chars': len(text),
            'skills': sorted({w.lower() for w in text.split() if w.istitle()})}

async def process_one(path: Path, out_dir: Path, sem: asyncio.Semaphore) -> dict:
    async with sem:
        try:
            data = await asyncio.to_thread(parse_resume, path)
            await asyncio.to_thread(
                (out_dir / f'{path.stem}.json').write_text,
                json.dumps(data, indent=2), 'utf-8')
            return {'file': path.name, 'ok': True}
        except Exception as exc:                  # one bad file must not stop the batch
            return {'file': path.name, 'ok': False, 'error': repr(exc)}

async def main(in_dir: str, out_dir: str, limit: int = 8) -> None:
    src, dst = Path(in_dir), Path(out_dir)
    dst.mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(limit)
    results = await asyncio.gather(
        *(process_one(p, dst, sem) for p in src.glob('*.txt')))
    failed = [r for r in results if not r['ok']]
    print(f'{len(results) - len(failed)}/{len(results)} succeeded')
```

If parsing were genuinely CPU-heavy (real PDF extraction), swap `to_thread` for a `ProcessPoolExecutor` — threads would serialise on the GIL.

**Exercise 6 — a rate-limit-token context manager.**
See [§9.2](#9-context-managers). Graded: the `try/finally` around the `yield`, so the token is released even when the body raises.

### 20.3 Advanced

**Exercise 1 — deep-merge two nested dicts without mutating either.**

```python
from copy import deepcopy
from typing import Any, Mapping

def deep_merge(a: Mapping, b: Mapping) -> dict:
    """Merge b into a. b wins on conflict. Neither input is mutated."""
    out: dict[Any, Any] = deepcopy(dict(a))
    for key, b_val in b.items():
        a_val = out.get(key)
        if isinstance(a_val, Mapping) and isinstance(b_val, Mapping):
            out[key] = deep_merge(a_val, b_val)      # recurse on nested dicts
        else:
            out[key] = deepcopy(b_val)               # b wins; copy so no shared refs
    return out

base     = {'llm': {'model': 'a', 'params': {'temp': 0.0, 'top_p': 1}}, 'retries': 3}
override = {'llm': {'params': {'temp': 0.7}}, 'debug': True}
deep_merge(base, override)
# {'llm': {'model': 'a', 'params': {'temp': 0.7, 'top_p': 1}},
#  'retries': 3, 'debug': True}
```

Three things get this marked correct: **recursing only when both sides are mappings** (otherwise `b` replaces wholesale), **`deepcopy` on the values you take from `b`** so the result shares no mutable state with the inputs, and deciding explicitly what happens to **lists** — this version replaces them, which is usually right for config; concatenating is a different, defensible choice you should state rather than leave implicit.

**Exercise 2 — a plugin registry and dispatcher.**
See [§18.7](#18-python-for-llm-agent-services). Graded: the decorator returns the function **unchanged**, duplicate names raise at import time, and you can explain that registration only happens if the module is imported.

**Exercise 3 — batch into chunks of N and process each chunk rate-limited.**

```python
import asyncio
from itertools import islice
from typing import Iterable, Iterator, TypeVar

T = TypeVar('T')

def chunked(items: Iterable[T], size: int) -> Iterator[list[T]]:
    if size <= 0:
        raise ValueError('size must be positive')       # else infinite loop
    it = iter(items)
    while chunk := list(islice(it, size)):
        yield chunk

async def process_chunks(items, size=10, rate_per_s=5.0, limit=3):
    bucket = TokenBucket(rate_per_s, capacity=rate_per_s)   # §18.2
    sem = asyncio.Semaphore(limit)

    async def one(chunk: list) -> dict:
        await bucket.take(len(chunk))       # cost proportional to the work
        async with sem:
            try:
                return {'ok': True, 'value': await call_api(chunk)}
            except Exception as exc:
                return {'ok': False, 'error': repr(exc), 'size': len(chunk)}

    return await asyncio.gather(*(one(c) for c in chunked(items, size)))
```

`islice` keeps the batching lazy, so this works on a generator of ten million items without materialising them. Python 3.12 has `itertools.batched` built in. Note the bucket is charged `len(chunk)` — rate limits are usually about items or tokens, not requests.

**Exercise 4 — find and fix the mutable-default bug.**

```python
def add_tag(tag, tags=[]):        # BUG
    tags.append(tag)
    return tags
```

The full explanation is in [§2.3](#2-functions). Say three things: the default is evaluated **once at function definition**, not per call; the same list object is therefore shared by every call that omits the argument (you can prove it with `add_tag.__defaults__`); and the fix is a `None` sentinel with the list created inside the body. Add that the same trap applies to `{}`, `set()`, and to defaults like `datetime.now()` which freeze at import time.

---

## 21. Interview Questions & Answers

### Basic

**Q1: What are Python's built-in data types, and when do you reach for each?**

The scalars are `int`, `float`, `bool`, `str`, `bytes` and `None`; the containers are `list`, `tuple`, `dict`, `set` and `frozenset`. The choice comes down to two questions: do I need to mutate it, and how will I look things up? Use a `list` for an ordered sequence you will change, a `tuple` for a fixed-shape record (and because it is hashable, so it can be a dict key), a `dict` for O(1) keyed lookup, and a `set` for O(1) membership tests and de-duplication. The common performance mistake is using a `list` for membership checks in a loop — that is O(n) per check and turns into an accidental O(n·m); a `set` makes it O(1).

**Q2: What is the difference between a list and a tuple?**

A list is mutable, a tuple is not — but the interesting part is what immutability buys. A tuple is **hashable** (if its contents are), so it can be a `dict` key or a `set` member, which a list can never be. It also signals intent: a tuple says "a fixed-shape record", a list says "a homogeneous collection I will grow". And it is safe to pass to code you don't control, because that code cannot mutate it. Tuples are marginally smaller and faster to construct, but that is rarely the deciding factor. Note the immutability is shallow — a tuple containing a list still lets you mutate that list, and such a tuple is not hashable.

**Q3: How does Python handle mutable vs immutable objects?**

Python binds **names to objects**. Assignment rebinds a name and never copies, so two names can reference the same object; mutating through one is visible through the other. Immutable objects (`int`, `str`, `tuple`, `frozenset`, `bytes`) cannot be changed in place, so this aliasing is invisible and safe — `x += 1` on an int creates a new object. Mutable objects (`list`, `dict`, `set`, most class instances) can, which is the source of the classic bugs: mutable default arguments, mutable class attributes shared across instances, and functions that modify their caller's data. The practical rule is to treat arguments as read-only unless mutation is the documented purpose, and return new values instead.

**Q4: What is a dictionary comprehension, and how does it differ from a list comprehension?**

A dict comprehension builds a dict with `{k: v for ... }`; a list comprehension builds a list with `[expr for ...]`. Beyond syntax the differences follow from the target type: a dict comprehension **de-duplicates keys silently** with last-write-wins, so `{w[0]: w for w in ['apple','avocado']}` yields just `{'a': 'avocado'}`, whereas the list version keeps both elements. Both support `if` filters and nested `for` clauses. Worth knowing: the parenthesised form `(x for x in ...)` is a **generator expression**, not a tuple comprehension — there is no tuple comprehension, you write `tuple(...)` around a genexp.

**Q5: What is the difference between `is` and `==`?**

`==` invokes `__eq__` and asks about **value**; `is` compares **identity** — whether two names point at the same object. Use `is` only for singletons: `is None`, `is True`, `is False`, and your own sentinel objects. Never use it for numbers or strings, because CPython caches small integers (roughly −5 to 256) and interns some strings, so `256 is 256` is `True` while `257 is 257` is usually `False`. That is an implementation detail, not a guarantee, and relying on it produces code that works in the REPL and fails in a loop. `is None` is also correct rather than merely idiomatic, since a class can define `__eq__` such that `x == None` is `True`.

**Q6: How do you handle exceptions using try/except/finally?**

`try` wraps the risky code; `except` handles specific exception types, most specific first; `else` runs only if nothing was raised; `finally` always runs. Two parts people miss: `else` exists and is where the happy path belongs, because code inside `try` has its own exceptions caught by your handlers — put `parse(resp)` in the `try` and a parser bug gets swallowed by your `TimeoutError` clause. And `finally` runs even on `return`, so a `return` inside `finally` silently discards a pending exception or return value. Never write a bare `except:`, which also catches `KeyboardInterrupt` and `SystemExit`; use `except Exception:` if you must be broad, and re-raise with a bare `raise` to preserve the traceback.

**Q7: What are `*args` and `**kwargs`, and when would you use them?**

In a definition, `*args` collects surplus positional arguments into a tuple and `**kwargs` collects surplus keyword arguments into a dict. At a call site the same syntax unpacks — `f(*seq)`, `f(**mapping)`. The three legitimate uses are pass-through wrappers (a decorator that must accept any signature), genuinely variadic APIs, and forwarding to a superclass in cooperative inheritance. Use them sparingly otherwise: they erase the signature, so callers and type checkers lose the contract. Related and useful: anything after a bare `*` is keyword-only, which stops callers passing bare booleans positionally.

**Q8: How does Python's dynamic typing work compared to static typing?**

Names in Python have no declared type; **objects** carry the type, and it is checked when an operation is attempted at runtime. So `x = 1; x = 'a'` is legal, and errors like calling a missing method surface only when that line executes. Static languages check types at compile time and reject the program. The trade-off is real: dynamic typing gives faster iteration and duck typing, static typing catches whole classes of bug before running and enables better tooling. Python's answer is **gradual typing** — annotations plus mypy give you static checking without changing runtime semantics, since CPython ignores annotations entirely. That is why `add('x','y')` on a function annotated `int` still runs and returns `'xy'`.

**Q9: What is a virtual environment, and why is it used?**

An isolated directory containing its own interpreter link and `site-packages`, created with `python -m venv .venv`. It exists because two projects on one machine will eventually need incompatible versions of the same library, which is unresolvable with a single global install; and because `sudo pip install` can break OS tooling that depends on the system Python. It also makes the dependency set self-documenting and reproducible. Always invoke pip as `python -m pip` so you install into the interpreter you think you are using.

**Q10: What is the difference between a module and a package?**

A module is a single `.py` file; a package is a directory of modules exposed as one namespace. Traditionally a package contained `__init__.py`, which runs on first import — since Python 3.3 a directory without it is still importable as a **namespace package**. Keep `__init__.py` anyway: it gives you a place to declare the public API, and namespace packages can silently merge same-named directories across `sys.path`. Keep it thin, because heavy imports there mean importing any submodule drags in the whole package — a measurable cold-start cost in serverless.

**Q11: How do you read and write files in Python?**

Use `open()` inside a `with` block so the handle closes even if the body raises, and **always pass `encoding='utf-8'`** — without it Python picks a locale-dependent default, so the same code works on your laptop and raises `UnicodeDecodeError` in a container. Modes are `r`, `w` (truncates), `a`, `x` (create-or-fail), with `b` for binary and `+` for read/write. For large files iterate the file object directly (`for line in f:`) which is a lazy line iterator with constant memory, rather than `read()` or `readlines()` which materialise everything. `pathlib.Path.read_text/write_text` is neater for small whole-file cases, and for durability write to a temp file and `os.replace` it atomically.

**Q12: What are lambda functions, and when are they useful?**

A `lambda` is a single-expression anonymous function, useful exactly where a tiny function is passed as an argument and naming it would add noise — most often `key=` in `sorted`, `min`, `max`. It cannot contain statements, so no `return`, `try`, or assignment; if you want those, write a `def`. PEP 8 says explicitly not to assign a lambda to a name, because `def` gives you a real `__name__` in tracebacks for free. For plain attribute or item access, `operator.attrgetter`/`itemgetter` is faster and reads better than a lambda.

**Q13: How do you define and use a class in Python?**

`class Name:` with methods taking `self` first and `__init__` for initialisation. Attributes assigned on `self` are per-instance; attributes in the class body are shared by all instances — which makes a mutable class attribute the class-level version of the mutable-default bug. Implement `__repr__` for debuggable output. Instantiate by calling the class; Python calls `__new__` to allocate then `__init__` to initialise. If the type is mostly data, a `@dataclass` generates `__init__`, `__repr__` and `__eq__` from annotations and is the better default.

**Q14: What is `self`, and why is it explicitly passed in methods?**

`self` is the instance, and it is the first parameter of every instance method. `c.method()` is sugar for `type(c).method(c)` — methods are ordinary functions on the class, and attribute access on an instance binds the instance as the first argument. It is explicit for consistency with "explicit is better than implicit", and because it removes ambiguity that other languages need scoping rules to resolve: there is never a question whether `score` means a local or an attribute, since `self.score` says so. It also falls out of the object model — functions can be attached to classes after the fact, and `staticmethod`/`classmethod` are ordinary decorators rather than special syntax. Note `self` is a convention, not a keyword.

**Q15: How does Python manage memory?**

CPython's primary mechanism is **reference counting**: every object tracks how many references point at it, and it is freed immediately when that hits zero. This is why cleanup in CPython feels deterministic. Reference counting alone cannot free **reference cycles**, so CPython adds a generational cyclic garbage collector that scans container objects in three generations, promoting survivors and scanning older generations less often. Allocation itself goes through pymalloc, which manages small objects in arenas and pools rather than calling `malloc` per object. Note reference counting is a CPython implementation detail — PyPy does not use it — so never rely on prompt finalisation for correctness; use context managers.

**Q16: What is the difference between `copy` and `deepcopy`?**

`copy.copy` is shallow: it makes a new outer object whose elements are the **same** objects, so mutating a nested list is visible through both copies. `copy.deepcopy` recurses and duplicates the whole object graph, using a memo dict so shared references stay shared and cycles don't loop forever. `deepcopy` is substantially slower and can be surprising with objects holding file handles, sockets or locks. `dict(d)`, `d.copy()`, `list(l)` and `l[:]` are all shallow. In practice, prefer building new immutable values over deep-copying mutable ones.

**Q17: What is PEP 8, and why does code style matter?**

PEP 8 is Python's style guide: 4-space indents, `snake_case` functions, `PascalCase` classes, `UPPER_SNAKE` constants, grouped imports, two blank lines between top-level definitions. It matters because it lowers the **cost of reading** — a reviewer spends attention on logic instead of formatting, diffs show real changes instead of reflowed lines, and an entire category of pointless review argument disappears. PEP 8 also says consistency within a project outranks the guide and that readability beats rule-following. Nobody applies it by hand: `ruff format` and `ruff check --fix` (which absorbed black, isort and flake8) run in pre-commit and CI so style never appears in review.

### Intermediate

**Q18: What is the Global Interpreter Lock, and how does it affect multi-threaded programs?**

The GIL is a single mutex in CPython permitting only one thread to execute Python bytecode at a time. It exists because reference counting is not thread-safe, and one coarse lock was simpler and faster for single-threaded code than locking every object. The effect: threads give you **no CPU parallelism**, and CPU-bound threaded code can be slower than sequential because of contention and switching. The crucial nuance is that the GIL is **released around blocking I/O** and by C extensions that opt out, so threads do scale for network and disk work, and NumPy operations genuinely run in parallel. So the GIL penalises CPU-bound *Python bytecode* specifically. PEP 703's free-threaded build exists as an official non-default option from 3.13, but reason about the GIL as present.

**Q19: What is the difference between multithreading and multiprocessing, and when would you choose each?**

Threads share one address space and one GIL: cheap to create, trivial to share data, no CPU parallelism, and you need locks because a statement like `counter += 1` is several bytecodes. Processes each get their own interpreter and memory: real CPU parallelism, but startup cost and every argument and result must be **pickled**, so passing large objects is expensive. Choose threads for blocking I/O with libraries that aren't async; choose processes for CPU-bound work, or push the computation into C. Prefer `concurrent.futures` — `ThreadPoolExecutor` and `ProcessPoolExecutor` share an API, so switching models is a one-line change.

**Q20: How do decorators work, and how would you write one?**

`@d` above `def f` simply rebinds the name: `f = d(f)`. So a decorator is any callable that takes a function and returns a replacement, usually a closure. A correct one accepts `*args, **kwargs` to preserve any signature and applies `functools.wraps` to copy `__name__`, `__doc__` and set `__wrapped__`. `wraps` is not cosmetic — without it every decorated function is named `wrapper`, which breaks `help()`, confuses tracebacks, and actively breaks tools that key off `__name__`, such as pytest collection and Flask/FastAPI route registration where several handlers collide. A decorator taking arguments needs one more layer: `retry(times=3)` is called first and returns the real decorator. Stacking applies bottom-up, and the order changes behaviour.

**Q21: What are generators, and how do they differ from returning a list?**

A generator is a function containing `yield`; calling it returns an iterator and runs no body until iterated, suspending and resuming at each `yield`. Compared with returning a list: memory is O(1) instead of O(n), the first result arrives immediately instead of after the whole computation, and stages compose without materialising intermediates. The costs are that generators are **single-pass** — no `len()`, no indexing, no second iteration — so a caller needing those has to build a list anyway; and laziness moves where exceptions surface, since the body only runs on iteration, which surprises people writing tests. Return a generator for large or streaming data, a list for small collections callers will poke at repeatedly.

**Q22: How do `async def`/`await` work, and how does asyncio differ from threads?**

`async def` creates a coroutine function; calling it returns a coroutine object and executes nothing until it is awaited or scheduled. `await` suspends the coroutine and hands control back to the **event loop**, which runs another ready task — so concurrency comes from interleaving waits in a single thread, cooperatively. Against threads: scheduling is explicit (only at `await` points) rather than pre-emptive, so you rarely need locks; coroutines cost about a kilobyte against a thread's megabyte of stack, so you can hold tens of thousands of concurrent waits; but a single blocking call freezes **every** task in the process, and you need async-aware libraries end to end. Use `asyncio.to_thread` to bridge to blocking code.

**Q23: What are context managers, and how does `with` work internally?**

A context manager is an object implementing `__enter__` and `__exit__`. `with expr as x:` evaluates `expr`, calls `__enter__` (looked up on the *type*) and binds the result to `x`, then runs the body inside an implicit `try/finally` whose `finally` calls `__exit__(exc_type, exc_value, traceback)`. So cleanup happens on success, on a handled error, on an unhandled error, and on `return`. Two details matter: `__enter__` need not return the manager — that is how `open()` hands back a file object — and **returning a truthy value from `__exit__` suppresses the exception**, which is exactly how `contextlib.suppress` works and is easy to abuse by accident. For the common setup/teardown shape, `@contextlib.contextmanager` with a `try/finally` around a single `yield` is far less code.

**Q24: How do you handle dependency management?**

`pyproject.toml` (PEP 518/621) is the standardised source of truth for metadata, dependencies and tool config; `requirements.txt` is a pip convention holding an install list. The distinction that matters is **abstract vs concrete**: `pyproject.toml` declares loose constraints like `httpx>=0.27`, while a lockfile (`poetry.lock`, `uv.lock`) or fully pinned `requirements.txt` with hashes records the exact resolved graph for reproducible builds. Applications should commit a lockfile; libraries should not pin tightly or they force conflicts on consumers. Tooling: `pip`+`venv` always available, `poetry` for resolver plus packaging, and `uv` as a much faster drop-in now common in CI.

**Q25: What is duck typing, and how does it relate to Python's dynamic nature?**

Duck typing means an object's suitability is determined by the methods it has, not the type it declares — if it has `.render()`, `render_all` can use it. It works because attribute lookup happens at runtime, so no shared base class or interface declaration is needed, which is why explicit interfaces are far rarer in Python than in Java. The cost is that mistakes surface at call time rather than compile time. Modern Python lets you have both: `typing.Protocol` gives **structural** typing that mypy checks statically without requiring inheritance, while `abc.ABC` gives runtime enforcement and shared implementation when you want it.

**Q26: How do you implement inheritance and method overriding, including `super()`?**

Subclass with `class Child(Base):` and override by redefining the method. Call the parent implementation with `super().method(...)` rather than `Base.method(self, ...)`. The reason matters: `super()` does not mean "my parent", it means "the **next class in the MRO**", the C3 linearisation of the class graph (`Child.__mro__`). With multiple inheritance that next class may be a sibling, which is exactly what makes cooperative multiple inheritance work — and why every class in such a hierarchy must call `super()` and accept `**kwargs`. Prefer composition to deep hierarchies; if you do inherit, respect Liskov, so a subclass must not strengthen preconditions or weaken postconditions.

**Q27: What are dataclasses, and when would you use them over regular classes?**

`@dataclass` generates `__init__`, `__repr__` and `__eq__` from annotations. Useful options: `frozen=True` for immutability plus a generated `__hash__`, `slots=True` for lower memory and faster attribute access, `order=True` for comparisons, and `field(default_factory=list)` for mutable defaults — a bare `= []` raises at class creation because the machinery deliberately refuses that trap. Use a dataclass when the type is **mostly data**; use a regular class when behaviour dominates or you need a custom `__init__`; use `NamedTuple` for a lightweight immutable tuple-like record; use Pydantic when you need validation and coercion at a trust boundary. Note `eq=True` sets `__hash__` to `None`, so a plain dataclass is unhashable unless frozen.

**Q28: How do you handle circular imports?**

A circular import fails because the second import finds a partially initialised module, giving "cannot import name X from partially initialized module". It is almost always a **design** signal that two modules share a concern belonging in a third. Fixes, best first: extract the shared piece into `models.py`/`types.py` both import; invert the dependency so the low-level module doesn't reach back up; use `import a` instead of `from a import X`, which binds the module and defers attribute lookup; or import inside the function, which is a legitimate workaround for rare paths but moves an import error from startup to runtime. If the cycle exists **only** for type annotations, `from __future__ import annotations` plus a `TYPE_CHECKING` guard removes it entirely at runtime.

**Q29: What is the difference between `@staticmethod`, `@classmethod`, and instance methods?**

An instance method receives `self` and is for behaviour needing instance state. A `@classmethod` receives `cls` and is the idiomatic home for **alternative constructors** — `from_dict`, `from_json` — because using `cls(...)` rather than hard-coding the class name means a subclass gets its own type back. A `@staticmethod` receives neither and is a plain function namespaced on the class for discoverability; if it never touches the class at all, a module-level function is often the better choice. Mechanically both are descriptors that change how the function binds on attribute access.

**Q30: How would you structure a Python project for a backend service?**

Use a `src/` layout so the package cannot be imported accidentally from the repo root and your tests exercise the installed package as production will. Inside, layer one-directionally: `api/` (routing and request/response models only) → `services/` (business logic, no HTTP or SQL) → `repositories/` (data access), plus `core/` for logging, errors and security. Services must not import from `api`, which keeps logic testable without HTTP and reusable from a CLI or queue consumer. Config is read **once** at startup from the environment into a validated settings object (`pydantic-settings`) and injected, never scattered `os.environ` calls — that gives fail-fast startup, typed values, and easy overriding in tests. `pyproject.toml` at the root, `tests/` split into unit and integration.

**Q31: How do you write and run unit tests in Python?**

pytest with plain `assert` (it rewrites assertions to show both sides), test files named `test_*.py`, and functions named `test_*`. Use `@pytest.mark.parametrize` instead of looping so each case reports independently, and `pytest.raises(ValueError, match='...')` to assert *which* error. Dependencies come from **fixtures**, which support teardown via `yield` and scopes from `function` to `session`; shared fixtures live in `conftest.py`. Mock at the network boundary and patch **where the name is looked up**, not where it is defined — patch `app.client.httpx`, not `httpx` — and pass `autospec=True` so the mock rejects calls the real function wouldn't accept. Run with `pytest -q`, add `-x` to stop at the first failure and `--cov` for coverage.

**Q32: What is type hinting, and how do tools like mypy use it?**

Annotations declare intended types (`def f(a: int) -> str:`) and are **not enforced at runtime** — CPython stores them as metadata and ignores them, so an annotated function happily accepts the wrong type. mypy reads them, infers the rest, and reports inconsistencies without executing your code, catching the unhandled `None` and the branch returning the wrong type. Adoption is gradual: unannotated functions are skipped by default, so turn on `disallow_untyped_defs` or `--strict` per package to stop backsliding. Third-party types come from inline annotations (PEP 561) or `types-*` stub packages. Libraries can choose to enforce annotations at runtime, which is exactly what Pydantic and FastAPI do.

**Q33: How does exception chaining work?**

`raise NewError(...) from exc` sets `__cause__`, and the traceback prints "The above exception was the direct cause of the following exception" — so you can raise a clean domain error while preserving the underlying detail. Raising inside an `except` block without `from` still records the original in `__context__` and prints "During handling of the above exception, another exception occurred"; `from` states the causality explicitly rather than implicitly. `from None` suppresses a noisy inner cause deliberately. The practical value is that you expose a stable error type at your API boundary without destroying the diagnostic trail underneath it.

**Q34: How would you profile a slow Python function to find the bottleneck?**

First get a reproducible benchmark, or you cannot tell whether a change helped. Then `cProfile` sorted by `cumtime` to see where time goes, and `tottime` to find the code actually burning CPU. If `cumtime` is large while `tottime` is tiny, you are **waiting on I/O** and profiling Python won't help — look at query and network call counts. Narrow to a single function with `line_profiler`; use `py-spy` to sample a live production process without restarting it, and `tracemalloc` for memory. Check the algorithm before micro-optimising: the usual real causes are an accidental O(n²) from a `list` membership test in a loop, N+1 queries, repeated serialisation, and recomputing something cacheable.

### Advanced

**Q35: How would you design a concurrent pipeline using asyncio to call multiple LLM APIs in parallel with a concurrency limit?**

Wrap each call in a coroutine that acquires an `asyncio.Semaphore` before awaiting, create one task per item, and `gather` them. The semaphore is what makes it production-safe: without it, `gather` over 10,000 items opens 10,000 connections and you get rate-limited or OOM-killed. Inside the semaphore, add a **per-call timeout** (`async with asyncio.timeout(30)`) so a hung socket cannot occupy a slot forever, and **retry with jittered exponential backoff** for transient failures. Pass `return_exceptions=True` to `gather` so one failure becomes an inspectable result rather than abandoning the batch. For very large inputs, batch task *creation* too rather than holding a million task objects. Note all tasks are created immediately — the semaphore limits only how many are inside the block, not how many exist. See [§18.1](#18-python-for-llm-agent-services).

**Q36: What are the trade-offs of asyncio vs multiprocessing vs concurrent.futures for an AI agent evaluation pipeline?**

The workload is dominated by **waiting on model APIs**, so asyncio is the right default: one process holds hundreds of in-flight requests at roughly a kilobyte each, with a semaphore capping concurrency and a shared connection pool. Multiprocessing would give real CPU parallelism but is the wrong shape here — it duplicates the interpreter per worker, forces every prompt and response through pickling, and buys nothing while you are blocked on the network. `concurrent.futures` is the pragmatic middle: `ThreadPoolExecutor` gets you concurrency over **blocking** SDKs without rewriting anything, and it shares an API with `ProcessPoolExecutor` so switching is one line. The realistic answer is hybrid: asyncio drives the I/O, and genuinely CPU-heavy local steps (PDF extraction, local embeddings) go to a `ProcessPoolExecutor` via `run_in_executor`.

**Q37: How does Python's garbage collector handle reference cycles, and when would you need `gc.collect()`?**

Reference counting frees objects the moment their count hits zero, but a cycle keeps every member's count above zero, so it never fires. CPython therefore adds a **generational cyclic collector** that tracks container objects in three generations, promoting survivors and scanning older generations progressively less often, on the assumption that most objects die young. You rarely call `gc.collect()` manually. The legitimate cases: after building a large temporary object graph, to return memory before a memory-heavy phase; in tests asserting objects are released; and before `fork()` in a pre-fork server, paired with `gc.freeze()`, to keep copy-on-write pages shared — a real memory win under Gunicorn. Latency-sensitive services sometimes `gc.disable()` to avoid unpredictable pauses, which is only safe if they genuinely create no cycles. Note that real "leaks" in Python are almost always unbounded growth of a live container, not GC failure.

**Q38: How would you implement retry logic with exponential backoff and jitter for a flaky external API?**

Loop up to N attempts, catch **only** transient exceptions, and sleep `random.uniform(0, min(cap, base * 2 ** (attempt - 1)))` between them. Four things make it correct. **Re-raise on the final attempt** — silently returning `None` on failure is far worse than an exception. **Catch narrowly**: retrying a `ValueError` from malformed input just burns time, since it will fail identically. **Only retry idempotent operations**, or use an idempotency key, otherwise a retried charge double-charges. And **jitter matters**: plain exponential backoff synchronises every client into retry waves, so full jitter is what actually decorrelates them. Additionally, honour a `Retry-After` header when the provider sends one rather than guessing, and cap total elapsed time so a caller's deadline isn't blown by retries. See [§10.3](#10-decorators).

**Q39: What are metaclasses, and when would you actually need one?**

A metaclass is the class of a class — `type` by default — and `class Foo:` is roughly `Foo = type('Foo', bases, namespace)`. A custom metaclass hooks class **creation**, so you can inspect, validate or rewrite a class before it exists, typically by overriding `__new__` or `__init__`. You genuinely need one only for framework-level work where every subclass must be transformed or registered and you cannot ask authors to add a decorator — ORMs turning class attributes into columns, and serialisation libraries. For nearly everything else the simpler hooks are better and are what an interviewer wants to hear you reach for: **`__init_subclass__`** covers subclass registration and validation, `__set_name__` handles descriptors needing their attribute name, and a plain **class decorator** transforms a single class. The old guidance still holds: if you are wondering whether you need a metaclass, you don't.

**Q40: How would you design a plugin-style architecture where each agent is dynamically loaded and executed through a standard interface?**

Define the contract as a `typing.Protocol` — say an async callable taking a context dict and returning a dict — so agents are structurally checked without inheriting anything. Provide a `@register_agent("name")` decorator that inserts the function into a module-level registry and returns it unchanged, raising on duplicate names so typos fail at import rather than at dispatch. A `dispatch(name, ctx)` function looks the agent up and raises a helpful error listing known names. The subtlety that decides whether this works: **registration happens on import**, so a module nobody imports registers nothing — either import agents explicitly in the package `__init__`, discover them with `pkgutil.iter_modules`, or use **entry points** via `importlib.metadata` if plugins ship as separately installed packages, which is how real plugin ecosystems do it. Keep the interface narrow so agents stay independently testable, and version it, since plugins outlive refactors. See [§18.7](#18-python-for-llm-agent-services).

**Q41: How do you handle streaming responses from an LLM API in Python?**

Model it as an **async generator**: consume the provider's stream with `async for`, parse each server-sent-event chunk, and `yield` the delta; the web layer wraps that in a `StreamingResponse` with `media_type='text/event-stream'`. Three production concerns. **Cancellation must propagate** — check `await request.is_disconnected()` (or let `CancelledError` bubble) so a client closing the tab stops the upstream call and stops billing you. **An error after the first byte cannot change the HTTP status**, because headers are already sent, so mid-stream failures must be signalled in-band as a data event and clients must handle it. And **buffering proxies** will hold chunks until the response completes, which looks identical to a broken stream — send `X-Accel-Buffering: no` for nginx. Also handle chunk boundaries: a JSON payload can split across reads, so buffer until you have a complete line. See [§18.3](#18-python-for-llm-agent-services).

**Q42: What are the performance implications of using Pydantic for validation in a high-throughput FastAPI service?**

Pydantic v2's core is compiled Rust, so it is roughly 5–50× faster than v1, but validation is proportional to the data you validate and does show up in profiles on large nested payloads. The judgement is where to spend it: **validate at the trust boundary**, because that is your input sanitisation and skipping it trades a known cost for unknown corruption; then **trust internally** and pass the typed object down rather than re-validating, using `model_construct()` for data you already trust. The overlooked cost is **response models** — FastAPI validates your output too, so a `response_model` over data you just constructed is often pure overhead. Prefer `model_dump_json()` (one Rust pass) over `json.dumps(model.model_dump())` (two), use `TypeAdapter` for repeated non-model shapes, and avoid regex-heavy custom validators on hot fields. In practice the model API call dominates end-to-end latency by orders of magnitude, so profile before blaming Pydantic.

**Q43: How would you structure error handling and partial-failure recovery across a pipeline of 35 independent agents?**

Give each agent its **own** try/except boundary and have it return a **result object** — `AgentResult(name, ok, value, error, duration)` — rather than raising. Then the run always produces 35 results and the caller can report "31 of 35 succeeded" with per-agent diagnostics, instead of losing everything to one exception. Use `gather(..., return_exceptions=True)` as a second net, and deliberately **not** `TaskGroup`, which cancels siblings on failure — the opposite of what a best-effort fan-out wants. Layer on **criticality** (required vs optional agents, so only a required failure fails the run), **dependencies** (topologically order and mark downstream agents `skipped` rather than `failed` when their input is missing), per-agent **timeouts** so one hang cannot stall the batch, and **idempotency plus checkpointing** so a rerun resumes rather than repeating paid calls. Log one structured event per agent with the shared run ID so a single query reconstructs the run. See [§18.5](#18-python-for-llm-agent-services).

**Q44: How do you manage secrets and API keys securely in a Python service deployed to AWS Lambda?**

Never in code or the repository. Best is **Secrets Manager or SSM Parameter Store (SecureString)**, fetched at cold start and cached in a module-level variable for the container's lifetime — that supports rotation, is IAM-scoped, and is auditable through CloudTrail; the Parameters and Secrets Lambda Extension caches locally so you avoid an API call per invocation. Second best is **environment variables encrypted with a customer-managed KMS key**: simpler, but the value is readable by anyone with `GetFunctionConfiguration` and does not rotate. Plain environment variables are acceptable only for non-secrets. Give the function its own least-privilege execution role scoped to the specific secret ARN, keep secrets out of logs (mark the field `repr=False` in your settings model), and never bake them into the deployment package or a container image layer. See [§18.8](#18-python-for-llm-agent-services).

**Q45: What is the difference between synchronous and asynchronous database drivers, and how does that affect a serverless function's cold start and concurrency?**

A sync driver (`psycopg`) blocks the thread on every query; an async driver (`asyncpg`) yields to the event loop. In Lambda the framing is unusual because **one invocation serves one request**, so in-request async concurrency buys nothing unless a single handler fans out to several I/O calls — three model calls plus a DB read is where it pays; async does not turn one container into a multi-request server. On cold start, async stacks pull in more machinery and need a loop and pool created, so keep the import graph small since import time dominates. The real trap is **connection pooling**: each container holds its own pool, so N concurrent Lambdas open N pools and exhaust Postgres `max_connections`. Fix it with RDS Proxy or pgbouncer, pool size 1–2 per container, and short idle timeouts. Create the pool at module scope so it is reused across invocations, and never assume the container survives.

**Q46: How would you implement structured logging and correlation IDs across a multi-step Python pipeline?**

Emit **JSON, one event per line**, through a custom `logging.Formatter`, so logs are queryable rather than grepped. Carry the correlation ID in a **`contextvars.ContextVar`**, which is the key mechanism: unlike thread-locals it is coroutine-aware, so each concurrent task carries its own value and the ID follows the logical flow across `await` points without threading a parameter through every function. Set it once at the edge in middleware, honouring an inbound `X-Request-ID` so the ID spans services, and echo it back on the response. For a pipeline, add a `run_id` for the whole run plus `step`/`agent` per stage, so one query returns the complete story of a single run, and log durations to spot the slow stage. Graduate to **OpenTelemetry** spans when you need timing waterfalls and cross-service traces, where the correlation ID becomes the trace ID. Never log secrets or full prompts containing user data. See [§18.9](#18-python-for-llm-agent-services).

**Q47: How do you handle rate limiting when calling a third-party LLM API from many concurrent workers?**

Distinguish the two limits: a `Semaphore` caps **concurrency**, while providers limit **rate** — requests *and tokens* per minute. So you need a **token bucket** that refills over time, charged by the actual cost of the call (token count, not just one per request). If you run more than one worker or pod, that bucket must be **shared**, which means Redis with an atomic Lua script or `INCR` on a per-window key — a per-process bucket silently allows N× the limit. Then: respect **`Retry-After`** on a 429 instead of your own backoff, reserve headroom by targeting roughly 80% of the documented limit so retries have room, add jittered backoff for the 429s that still happen, and give different workloads separate buckets or priorities so a bulk backfill cannot starve interactive traffic. Track rejections as a metric — silent throttling looks like slowness. See [§18.2](#18-python-for-llm-agent-services).

**Q48: What is the difference between `__eq__` and `__hash__` customisation, and how does it affect using custom objects in sets and dicts?**

`__eq__` defines value equality; `__hash__` returns the integer that determines the bucket. The contract: **objects that compare equal must hash equal** — a dict looks up by hash first, then confirms with `==`, so violating it means equal keys land in different buckets and lookups fail. Consequences to know: defining `__eq__` **sets `__hash__` to `None`**, making your class unhashable unless you define `__hash__` too, which surprises anyone adding equality to a class already used in a set. Hash the **same fields** you compare, typically `hash((self.x, self.y))`. Return `NotImplemented` rather than `False` for unknown types so Python can try the reflected operation. And **never hash on mutable fields** — mutate a key after insertion and you can no longer find it, because it now hashes to a different bucket. `@dataclass(frozen=True)` gets all of this right for you.

**Q49: How would you design a caching layer around expensive LLM calls to avoid redundant API costs?**

Hash the **entire request** — model *and version*, full prompt including the system prompt, temperature and every parameter that changes the output — into a stable key (`sort_keys=True` on the JSON, then SHA-256), and store the response in Redis with a TTL. Get four things right. **Only cache deterministic calls** (`temperature=0`); caching a creative generation serves stale-but-plausible output. **Always set a TTL**, because model versions change underneath you. **Never share cache entries across users** when the prompt embeds user data — namespace the key by tenant or you have a data-leak bug, not just a correctness bug. And measure the hit rate, since a cache nobody hits is pure latency. Redis rather than `lru_cache` because the cache must be shared across workers and survive restarts. **Semantic caching** — embed the prompt and reuse on high cosine similarity — extends the hit rate but will occasionally serve a wrong-but-similar answer, so it needs a high threshold and only suits approximate use cases. See [§18.6](#18-python-for-llm-agent-services).

**Q50: How would you test a Python module that depends on a nondeterministic LLM API call?**

Three layers, and mature teams use all of them. **Mock or stub the provider** for unit tests, ideally at the transport boundary (`respx` for httpx) so your own parsing, retry and fallback logic stays real while the network does not — this is where the logic *around* the call is tested, deterministically and free. **Cassette (VCR-style) tests** record real responses once and replay from disk, which catches schema and contract drift without per-run cost; scrub API keys from the cassettes and re-record on a schedule or they become fiction. **Golden/eval tests** run a fixed input set and assert on **properties rather than exact strings** — valid JSON, required fields present, no PII echoed, a rubric or similarity score above a threshold — reporting an aggregate pass rate; run these as a nightly gate rather than in the PR loop, because they cost money and have variance. Pin `temperature=0` and an explicit model version to reduce variance, while remembering that still does not guarantee determinism. See [§15.3](#15-testing).

---

## 22. Tricky Output Questions

**Q1: What does this print, and why?**

```python
def add(item, target=[]):
    target.append(item)
    return target

print(add(1))
print(add(2))
```

**Output:** `[1]` then `[1, 2]`.

The default value is evaluated **once**, when the `def` statement executes — not on each call. That single list is stored on the function object (inspect it with `add.__defaults__`) and shared by every call that omits the argument, so the second call appends to the same list the first one returned. This is the single most common Python bug in interviews. Fix with a `None` sentinel and create the list inside the body. The same applies to `{}`, `set()`, and to defaults like `datetime.now()` which freeze at import time.

**Q2: What does this print?**

```python
fns = [lambda: i for i in range(3)]
print([f() for f in fns])
```

**Output:** `[2, 2, 2]`.

Closures capture the **variable**, not the value at the moment the lambda was created. All three lambdas close over the same `i`, and by the time any of them runs the comprehension has finished with `i == 2`. This is late binding, not a comprehension quirk — a `for` loop building the same list behaves identically. Bind the current value explicitly with a default argument, `lambda i=i: i`, which is evaluated at definition time and gives `[0, 1, 2]`. (Note the loop variable does not leak out of a comprehension in Python 3, but the closure still shares it.)

**Q3: What does this print?**

```python
a = 256; b = 256
print(a is b)
c = 257; d = 257
print(c is d)
```

**Output:** `True` then `False` (in CPython, typically).

CPython pre-allocates and caches small integers from −5 to 256, so `a` and `b` name the same cached object. 257 is outside that range, so each literal creates a distinct object and `is` compares identity to `False`. This is an **implementation detail**, not a language guarantee — and it is exactly why you must never use `is` for numbers or strings. Confusingly, if both assignments are on one line or inside one function body, the compiler may fold them into a single constant and even 257 will report `True`, which makes the bug intermittent. Use `==` for values, `is` only for `None`, `True`, `False` and sentinels.

**Q4: What does this print?**

```python
class Box:
    items = []
    def add(self, x):
        self.items.append(x)

a, b = Box(), Box()
a.add(1)
print(b.items)
```

**Output:** `[1]`.

`items` is a **class attribute**, so there is exactly one list shared by every instance. `self.items.append(x)` looks the attribute up — finding it on the class since no instance attribute shadows it — and mutates that shared list. Note that `self.items = []` or `self.items += [x]` would *rebind* and create a genuine instance attribute, which is why the bug appears only with in-place mutation. The fix is to assign in `__init__` (`self.items = []`), or use `field(default_factory=list)` in a dataclass.

**Q5: What does this print?**

```python
def f():
    try:
        return 'try'
    finally:
        return 'finally'

print(f())
```

**Output:** `finally`.

`finally` always runs, and a `return` inside it **replaces** the pending return value. The `try` block's `'try'` is computed and queued, then discarded when `finally` returns its own value. The genuinely dangerous version of this is with an exception: if the `try` raises and `finally` returns, the exception is **silently swallowed** and the caller sees a normal return. Never `return` (or `break`, or `continue`) from a `finally` block — use it only for cleanup.

**Q6: What does this print?**

```python
print([x for x in range(5) if x % 2] == [x for x in range(5) if x % 2])
g = (x for x in range(3))
print(list(g), list(g))
```

**Output:** `True` then `[0, 1, 2] []`.

The first line is two independent lists with equal contents, so `==` is `True`. The second demonstrates that a generator is a **one-shot iterator**: the first `list(g)` consumes it to exhaustion, and the second gets an empty list because there is nothing left — no error, just silently empty. Note the arguments evaluate left to right, so the order of the two results is deterministic. This is the practical cost of laziness and the reason to return a list when callers may iterate twice.

**Q7: What does this print?**

```python
t = ([1], [2])
t[0].append(99)
print(t)
try:
    print(hash(t))
except TypeError as e:
    print('TypeError')
```

**Output:** `([1, 99], [2])` then `TypeError`.

A tuple's immutability is **shallow**: it fixes which objects the tuple references, not the contents of those objects. Appending to the inner list never rebinds a slot, so it is perfectly legal. Hashing then fails because `hash` of a tuple is derived from the hashes of its elements, and `list` is unhashable — which is the whole reason tuples-of-lists cannot be dict keys. It also explains why `t[0] += [1]` raises `TypeError` *after* successfully mutating the list: `+=` mutates in place, then attempts the forbidden reassignment to the tuple slot.

**Q8: What does this print?**

```python
import asyncio

async def work():
    return 'done'

async def main():
    r = work()
    print(type(r).__name__)
    print(await r)

asyncio.run(main())
```

**Output:** `coroutine` then `done`.

Calling an `async def` function **does not run it** — it constructs and returns a coroutine object, and the body executes only when it is awaited or scheduled as a task. That is why forgetting an `await` produces no work and a `RuntimeWarning: coroutine 'work' was never awaited` rather than an error. It is also why `asyncio.gather(work(), work())` is concurrent while `await work(); await work()` is sequential: `gather` schedules the coroutine objects as tasks, whereas consecutive awaits each run to completion before the next begins.

---

## 23. Cheat Sheet

**Objects and types**

1. Names are bound to objects; assignment rebinds and never copies.
2. Immutable: `int`, `float`, `str`, `bytes`, `tuple`, `frozenset`, `bool`, `None`.
3. `==` for value, `is` only for `None`/`True`/`False`/sentinels.
4. Small ints (−5..256) and some strings are cached — never `is` on them.
5. Tuple immutability is shallow; a tuple containing a list is unhashable.
6. `copy.copy` is one level; `copy.deepcopy` recurses and is much slower.
7. `dict(d)`, `d.copy()`, `l[:]`, `list(l)` are all shallow copies.
8. Dicts preserve insertion order (guaranteed from 3.7).

**Functions**

9. Default arguments evaluate **once at definition** — never use `[]`, `{}`, or `datetime.now()`.
10. Closures capture the variable, not the value; bind with `lambda x=x:`.
11. `nonlocal` to rebind an enclosing local; `global` for module level.
12. Anything after a bare `*` is keyword-only.
13. `lambda` is expression-only; PEP 8 says don't assign one to a name.

**Errors**

14. `else` runs only on success; keep the happy path out of `try`.
15. `finally` always runs — never `return` from it, it discards exceptions.
16. Never bare `except:`; use `except Exception:` and re-raise with bare `raise`.
17. `raise X from exc` for chaining; `from None` to suppress the cause.
18. Prefer EAFP (`try`/`except`) over LBYL for race-free lookups.

**Classes**

19. `self` is explicit; `c.m()` is `type(c).m(c)`.
20. Mutable **class** attributes are shared across instances.
21. `super()` follows the MRO, not "the parent".
22. `@classmethod` for alternative constructors (use `cls`, not the class name).
23. Defining `__eq__` sets `__hash__ = None`; define both, over the same fields.
24. Never hash on mutable fields.
25. `@dataclass(frozen=True, slots=True)`; mutable defaults need `default_factory`.
26. Use `Protocol` for structural typing, `ABC` for runtime enforcement.
27. You don't need a metaclass — use `__init_subclass__` or a class decorator.

**Iteration**

28. Generators are lazy, O(1) memory and **single-pass**.
29. A file object is already a lazy line iterator.
30. `yield from` to delegate; `itertools` before hand-rolling.
31. Laziness moves where exceptions surface — the body runs on iteration.

**Context managers**

32. `__enter__` returns the `as` value; `__exit__` always runs.
33. A truthy return from `__exit__` **suppresses** the exception.
34. `@contextmanager` needs `try/finally` around the `yield`.
35. `ExitStack` for a dynamic number of managers.

**Decorators**

36. `@d` means `f = d(f)`; with arguments it's one extra layer.
37. Always `functools.wraps` — pytest and web routing break without it.
38. Stacking applies bottom-up; order changes behaviour.
39. `lru_cache` needs hashable args, is per-process, and pins `self` on methods.

**Concurrency**

40. The GIL serialises **bytecode**; it is released around I/O and by C extensions.
41. Threads for blocking I/O, processes for CPU, asyncio for many concurrent waits.
42. The GIL does not make code thread-safe — `x += 1` is not atomic.
43. Calling an `async def` returns a coroutine and runs nothing.
44. Sequential `await`s are not concurrent; use `gather` or `TaskGroup`.
45. Always bound concurrency with a `Semaphore`; bound queues for backpressure.
46. One blocking call freezes every task — use `asyncio.to_thread`.
47. `CancelledError` derives from `BaseException`; if you catch it, re-raise.
48. `gather(return_exceptions=True)` for best-effort fan-out; `TaskGroup` cancels siblings.
49. `contextvars`, not thread-locals, for per-task state in async code.

**Practices**

50. Always `encoding='utf-8'` on `open()`.
51. Annotations are not enforced at runtime; mypy checks them.
52. Validate at the trust boundary, trust internally.
53. Read config once at startup into a validated settings object.
54. Patch where a name is **used**, not where it's defined; `autospec=True`.
55. Profile before optimising: `cProfile` for cumtime, `py-spy` for live, `tracemalloc` for memory.
56. Real leaks are unbounded live containers, not GC failure.
57. Retry only idempotent operations, with full jitter, and re-raise at the end.
58. `ruff format` + `ruff check --fix` + `mypy` in pre-commit and CI.

---

## 24. References

- [Python Language Reference](https://docs.python.org/3/reference/) and [Standard Library](https://docs.python.org/3/library/) — the primary sources.
- [PEP 8 — Style Guide for Python Code](https://peps.python.org/pep-0008/)
- [PEP 703 — Making the GIL Optional](https://peps.python.org/pep-0703/)
- [PEP 621 — Project metadata in pyproject.toml](https://peps.python.org/pep-0621/)
- [`asyncio` documentation](https://docs.python.org/3/library/asyncio.html) — especially "Developing with asyncio".
- [`functools`](https://docs.python.org/3/library/functools.html), [`contextlib`](https://docs.python.org/3/library/contextlib.html), [`itertools`](https://docs.python.org/3/library/itertools.html), [`dataclasses`](https://docs.python.org/3/library/dataclasses.html), [`contextvars`](https://docs.python.org/3/library/contextvars.html)
- [Python Developer's Guide — Garbage Collector design](https://devguide.python.org/internals/garbage-collector/)
- [pytest documentation](https://docs.pytest.org/) and [mypy documentation](https://mypy.readthedocs.io/)
- [Pydantic v2 documentation](https://docs.pydantic.dev/latest/) — see the performance notes.
- [Ruff](https://docs.astral.sh/ruff/) and [uv](https://docs.astral.sh/uv/)
- [AWS — Using secrets in Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/configuration-secrets.html)

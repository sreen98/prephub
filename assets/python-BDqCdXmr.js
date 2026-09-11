const n=`# Python Cheat Sheet

## Containers
\`\`\`python
lst = [1, 2, 3]          # ordered, mutable
tup = (1, 2)             # immutable, hashable → usable as a dict key
dct = {'a': 1}           # insertion-ordered (3.7+), O(1) by key
st  = {1, 2}             # unique, O(1) membership
frozenset({1, 2})        # hashable set
\`\`\`

## Comprehensions
\`\`\`python
[x*x for x in r if x % 2]          # list
{k: v for k, v in pairs}           # dict — duplicate keys: last wins
{w.lower() for w in words}         # set
(x*x for x in r)                   # GENERATOR, not a tuple
\`\`\`

## Slicing & Unpacking
\`\`\`python
s[1:5]  s[::2]  s[::-1]            # start:stop:step
a, *rest = [1, 2, 3]               # rest == [2, 3]
a, b = b, a                        # swap
{**d1, **d2}   [*l1, *l2]          # merge / concat
d1 | d2                            # dict union (3.9+)
\`\`\`

## Functions
\`\`\`python
def f(a, b=0, *args, kw=None, **kwargs): ...
def g(a, *, flag=False): ...        # flag is keyword-only
f(*seq, **mapping)                  # unpack at the call site
lambda x: x + 1                     # expression only
\`\`\`

## Classes
\`\`\`python
class A:
    kind = 'base'                              # class attr — SHARED
    def __init__(self, n): self.n = n          # instance attr
    def __repr__(self): return f'A({self.n!r})'
    @classmethod
    def from_dict(cls, d): return cls(d['n'])  # alt constructor
    @staticmethod
    def valid(v): return v > 0
    @property
    def double(self): return self.n * 2

from dataclasses import dataclass, field
@dataclass(frozen=True, slots=True)
class P:
    x: int
    tags: list[str] = field(default_factory=list)   # never = []
\`\`\`

## Errors
\`\`\`python
try:    risky()
except (ValueError, KeyError) as e: handle(e)
except Exception: raise                  # bare raise keeps the traceback
else:   done()                           # only if no exception
finally: cleanup()                       # always — never \`return\` here
raise AppError('bad config') from exc    # chain the cause
\`\`\`

## Generators & Iterators
\`\`\`python
def gen(n):
    while n: yield n; n -= 1
yield from sub_iter()                    # delegate
next(it, default)
for line in open(p, encoding='utf-8'):   # already lazy, O(1) memory
    ...
\`\`\`

## Context Managers
\`\`\`python
with open('f', encoding='utf-8') as f: ...
from contextlib import contextmanager, suppress, ExitStack
@contextmanager
def token(bucket):
    t = bucket.acquire()
    try: yield t
    finally: bucket.release(t)           # try/finally is mandatory
\`\`\`

## Decorators
\`\`\`python
import functools
def timed(fn):
    @functools.wraps(fn)                 # NOT optional
    def w(*a, **kw):
        t0 = time.perf_counter()
        try: return fn(*a, **kw)
        finally: log(time.perf_counter() - t0)
    return w

@functools.lru_cache(maxsize=256)        # args must be hashable; per-process
def slow(x): ...
\`\`\`

## asyncio
\`\`\`python
import asyncio
async def main():
    r = await coro()                                  # calling coro() runs nothing
    rs = await asyncio.gather(*tasks, return_exceptions=True)   # order preserved
    async with asyncio.TaskGroup() as tg:             # cancels siblings on error
        tg.create_task(work())
    async with asyncio.Semaphore(8): ...              # bound concurrency
    async with asyncio.timeout(30): ...               # 3.11+
    await asyncio.to_thread(blocking_fn, arg)         # offload blocking work
asyncio.run(main())
\`\`\`

## Typing
\`\`\`python
from typing import Protocol, TypedDict, Literal, Self
ids: list[int]; m: dict[str, float]; maybe: str | None
mode: Literal['fast', 'slow']
class Row(TypedDict): id: int
class Renderable(Protocol):
    def render(self) -> str: ...
\`\`\`

## Files & Paths
\`\`\`python
from pathlib import Path
Path('a/b.txt').write_text(s, encoding='utf-8')
Path('d').mkdir(parents=True, exist_ok=True)
list(Path('d').glob('*.json'))
os.replace(tmp, final)              # atomic rename
\`\`\`

## Useful stdlib
\`\`\`python
from collections import defaultdict, Counter, deque, OrderedDict
from itertools import chain, islice, groupby, batched   # batched: 3.12+
from functools import reduce, cache, partial
import json, re, uuid, hashlib, contextvars, secrets
\`\`\`

## Gotchas
- **Mutable default args** are evaluated once: use \`None\` and build inside.
- Closures capture the **variable**, not its value — bind with \`lambda x=x:\`.
- \`is\` only for \`None\`/\`True\`/\`False\`/sentinels; small ints are cached.
- Mutable **class** attributes are shared across instances.
- \`finally\` with \`return\` discards a pending exception.
- Generators are **one-shot** — no \`len()\`, no second pass.
- The GIL blocks CPU parallelism in threads; it is released around I/O.
- Calling an \`async def\` returns a coroutine and runs nothing until awaited.
- Always pass \`encoding='utf-8'\` to \`open()\`.
`;export{n as default};

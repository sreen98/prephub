# FastAPI — Interview Guide

FastAPI is an **ASGI** web framework built on Starlette (routing, middleware) and Pydantic (validation). Its distinguishing idea is that **type hints are the source of truth**: the same annotation drives validation, serialisation, dependency injection and the OpenAPI schema.

Assumes the [Python guide](/backend/python) for asyncio and Pydantic fundamentals. The two things interviews probe hardest: **`async def` vs `def`** (§4) and **dependency injection** (§5).

## Table of Contents

1. [ASGI vs WSGI](#1-asgi-vs-wsgi)
2. [Routing and Parameters](#2-routing-and-parameters)
3. [Request and Response Models](#3-request-and-response-models)
4. [async def vs def — the Threadpool Trap](#4-async-def-vs-def-the-threadpool-trap)
5. [Dependency Injection](#5-dependency-injection)
6. [Authentication and Authorization](#6-authentication-and-authorization)
7. [Error Handling](#7-error-handling)
8. [Middleware and CORS](#8-middleware-and-cors)
9. [Background Tasks and Lifespan](#9-background-tasks-and-lifespan)
10. [Streaming Responses](#10-streaming-responses)
11. [Databases](#11-databases)
12. [Testing](#12-testing)
13. [Project Structure](#13-project-structure)
14. [Performance and Deployment](#14-performance-and-deployment)
15. [FastAPI vs Django vs Flask](#15-fastapi-vs-django-vs-flask)
16. [Interview Questions and Answers](#16-interview-questions-and-answers)
17. [Tricky Questions](#17-tricky-questions)
18. [Cheat Sheet](#18-cheat-sheet)
19. [References](#19-references)

---

## 1. ASGI vs WSGI

**WSGI** (Flask, Django ≤2) is a synchronous protocol: one request occupies one worker thread from start to finish. A request waiting 200 ms on a database holds that thread doing nothing.

**ASGI** is the async successor. A single event-loop worker can hold thousands of in-flight requests, because each one yields the loop while awaiting I/O. It also supports WebSockets and server-sent events, which WSGI structurally cannot.

```
client → uvicorn (ASGI server) → Starlette (routing/middleware) → your handler
                                        ↑ Pydantic validates in and out
```

So FastAPI's throughput advantage is **not** that Python got faster — it is that an I/O-bound request stops occupying a thread while it waits. For CPU-bound work ASGI buys nothing; you still need processes.

---

## 2. Routing and Parameters

Where a parameter comes from is inferred from its type and the path:

```python
from fastapi import FastAPI, Path, Query, Body, Header, Cookie
from pydantic import BaseModel

app = FastAPI()

@app.get('/candidates/{candidate_id}')
async def get_candidate(
    candidate_id: int = Path(ge=1),                    # in the path → path param
    include: list[str] = Query(default=[]),            # not in path, scalar → query
    x_request_id: str | None = Header(default=None),   # x_request_id → X-Request-Id
):
    ...

@app.post('/candidates', status_code=201)
async def create(payload: CandidateIn):                # Pydantic model → request BODY
    ...
```

The inference rule: a parameter named in the path is a path param; a Pydantic model (or `= Body(...)`) is the body; anything else scalar is a query param.

Routers keep large apps organised:

```python
from fastapi import APIRouter
router = APIRouter(prefix='/candidates', tags=['candidates'],
                   dependencies=[Depends(require_auth)])   # applies to every route
app.include_router(router)
```

**Route order matters** — the first match wins, so `/candidates/me` must be declared **before** `/candidates/{candidate_id}`, or `me` gets parsed as an int and 422s.

---

## 3. Request and Response Models

```python
from pydantic import BaseModel, Field, EmailStr

class CandidateIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    score: float = Field(ge=0, le=100)

class CandidateOut(BaseModel):
    id: int
    name: str
    # note: no email → it cannot leak even if the ORM object has it
    model_config = {'from_attributes': True}   # allows returning an ORM object

@app.post('/candidates', response_model=CandidateOut, status_code=201)
async def create(payload: CandidateIn) -> CandidateOut:
    row = await db.insert(payload)
    return row          # filtered through CandidateOut
```

**`response_model` is a security control, not just documentation.** It filters the outgoing object to the declared fields, so returning an ORM row with `password_hash` on it cannot leak — the field isn't in the schema. Separate input and output models for exactly this reason: an input model with `id` lets clients set their own IDs, and an output model reusing the input leaks whatever the input accepted.

Useful options: `response_model_exclude_unset=True` to omit defaults, and `Annotated[str, Field(...)]` as the modern way to attach metadata.

---

## 4. async def vs def — the Threadpool Trap

This is the most-asked FastAPI question, and getting it wrong destroys throughput.

```python
@app.get('/a')
async def a():
    return await async_db.fetch(...)     # runs ON the event loop

@app.get('/b')
def b():
    return sync_db.fetch(...)            # runs in a THREADPOOL, loop stays free
```

- **`async def`** runs directly on the event loop. Correct when everything you await is genuinely async.
- **`def`** (plain) is run by FastAPI in an external threadpool via `run_in_threadpool`, so a blocking call does not stall the loop.

The catastrophic combination is **`async def` containing a blocking call**:

```python
@app.get('/bad')
async def bad():
    time.sleep(1)                 # blocks the ENTIRE event loop
    return requests.get(url)      # so does this
```

One such handler freezes every concurrent request in that worker process. The fixes: use an async client (`httpx.AsyncClient`), offload with `await asyncio.to_thread(...)`, or simply declare the handler `def` and let FastAPI's threadpool handle it.

Rule of thumb: **if your libraries are async, use `async def`; if they're blocking, use plain `def`.** The dangerous choice is `async def` with blocking code inside. Note the threadpool is bounded (40 threads by default), so `def` handlers cap out — for high concurrency, go async end to end.

---

## 5. Dependency Injection

FastAPI's DI system is its most distinctive feature. A dependency is any callable; its own parameters are resolved recursively.

```python
from fastapi import Depends, HTTPException, status
from typing import Annotated

async def get_db():
    async with SessionLocal() as session:
        yield session                     # teardown after the response

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    user = await lookup(db, token)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
                            headers={'WWW-Authenticate': 'Bearer'})
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]   # reusable alias

@app.get('/me')
async def me(user: CurrentUser):
    return user
```

What it buys you:

- **`yield` dependencies** give setup/teardown per request — the canonical database-session pattern.
- **Caching within a request**: the same dependency requested by several places is resolved **once** per request by default (`use_cache=True`). So `get_db` returning a session gives every dependency the *same* session, which is what makes a per-request transaction work.
- **Overriding in tests** — `app.dependency_overrides[get_db] = fake_db` replaces it globally without patching.
- **Router- and app-level dependencies** for cross-cutting checks: `dependencies=[Depends(require_admin)]` runs it without injecting the value.

```python
def require_role(role: str):                  # a parameterised dependency
    async def checker(user: CurrentUser):
        if role not in user.roles:
            raise HTTPException(403)
    return checker

@app.delete('/candidates/{id}', dependencies=[Depends(require_role('admin'))])
async def delete(id: int): ...
```

---

## 6. Authentication and Authorization

FastAPI ships the *plumbing* (extracting and documenting credentials), not an auth system — you implement verification.

```python
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import jwt
from passlib.context import CryptContext

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')   # also wires up Swagger auth
pwd = CryptContext(schemes=['argon2'])

@app.post('/token')
async def login(form: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await get_user(form.username)
    if not user or not pwd.verify(form.password, user.hash):
        raise HTTPException(401, 'incorrect username or password')  # same message for both
    return {'access_token': make_jwt(user), 'token_type': 'bearer'}

def decode(token: str) -> dict:
    return jwt.decode(token, SECRET, algorithms=['HS256'],   # NEVER accept alg from the token
                      audience=AUD, issuer=ISS)
```

Points that get probed: return an **identical error** for unknown user and wrong password (otherwise it's a user-enumeration oracle); **pin the algorithm** list when decoding, because accepting the token's own `alg` allows the `alg: none` and HS/RS confusion attacks; verify `exp`, `aud` and `iss`; hash with argon2 or bcrypt, never a bare SHA; and for browser clients prefer httpOnly cookies plus CSRF protection over `localStorage`. Authorization belongs in a dependency or the service layer, and object-level checks must verify **ownership**, not just existence.

---

## 7. Error Handling

```python
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

raise HTTPException(status_code=404, detail='candidate not found')

class AppError(Exception):
    def __init__(self, code: str, message: str, status: int = 400): ...

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(status_code=exc.status,
                        content={'code': exc.code, 'message': exc.message})

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422,
                        content={'code': 'VALIDATION_ERROR', 'errors': exc.errors()})
```

Validation failures return **422** by default, not 400 — a frequent surprise. Raise `HTTPException` for expected HTTP outcomes; define domain exceptions with a registered handler so business logic never imports HTTP types. Never let an unhandled exception leak a traceback: FastAPI returns a bare 500, so log the exception with a correlation ID and return a safe code.

---

## 8. Middleware and CORS

```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=['https://app.example.com'],   # NEVER ['*'] with credentials
    allow_credentials=True,
    allow_methods=['*'], allow_headers=['*'],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.middleware('http')
async def add_request_id(request: Request, call_next):
    rid = request.headers.get('X-Request-ID') or str(uuid4())
    request_id.set(rid)                     # a contextvar — see the Python guide §18.9
    response = await call_next(request)
    response.headers['X-Request-ID'] = rid
    return response
```

`allow_origins=['*']` together with `allow_credentials=True` is **invalid per the CORS spec** and browsers reject it — list explicit origins. Middleware runs in reverse registration order on the way out. Note that middleware sees the whole request/response, so heavy work there costs every route; prefer a dependency when only some routes need it.

---

## 9. Background Tasks and Lifespan

```python
from fastapi import BackgroundTasks
from contextlib import asynccontextmanager

@app.post('/candidates')
async def create(payload: CandidateIn, tasks: BackgroundTasks):
    row = await db.insert(payload)
    tasks.add_task(send_welcome_email, row.email)    # runs AFTER the response
    return row

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pool = await create_pool()      # startup
    app.state.http = httpx.AsyncClient()
    yield
    await app.state.http.aclose()             # shutdown
    await app.state.pool.close()

app = FastAPI(lifespan=lifespan)              # replaces the deprecated on_event
```

**`BackgroundTasks` is in-process and gives no durability guarantee** — if the worker restarts, the task is gone, and it competes for the same event loop or threadpool. Use it only for short, non-critical work like sending an email. Anything that must not be lost belongs in a real queue (Celery, ARQ, SQS) with retries.

The `lifespan` context manager is where long-lived clients are created **once** per process — a new `httpx.AsyncClient` per request destroys connection pooling and is a common performance bug.

---

## 10. Streaming Responses

The shape LLM APIs need — see the [Python guide §18.3](/backend/python) for the full discussion:

```python
from fastapi.responses import StreamingResponse

@app.post('/chat')
async def chat(request: Request, body: ChatIn):
    async def gen():
        try:
            async for delta in llm.stream(body.prompt):
                if await request.is_disconnected():
                    break                                  # stop paying for tokens
                yield f'data: {json.dumps({"delta": delta})}\n\n'
            yield 'data: [DONE]\n\n'
        except Exception as exc:
            log.exception('stream failed')
            yield f'data: {json.dumps({"error": str(exc)})}\n\n'   # in-band: headers are sent
    return StreamingResponse(gen(), media_type='text/event-stream',
                             headers={'X-Accel-Buffering': 'no'})
```

Once the first byte is sent you **cannot change the status code**, so mid-stream errors must be signalled in the body. Buffering proxies (nginx) will hold chunks until completion, which looks exactly like a broken stream — hence `X-Accel-Buffering: no`.

WebSockets are first-class too:

```python
@app.websocket('/ws')
async def ws(socket: WebSocket):
    await socket.accept()
    try:
        while True:
            msg = await socket.receive_text()
            await socket.send_text(msg)
    except WebSocketDisconnect:
        ...
```

---

## 11. Databases

FastAPI is database-agnostic. The pattern that matters is the session-per-request dependency:

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

engine = create_async_engine(DSN, pool_size=10, max_overflow=0, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with SessionLocal() as session:
        async with session.begin():        # one transaction per request
            yield session                  # commits on success, rolls back on exception
```

Because dependencies are cached per request, every dependent shares one session and therefore one transaction. Use an **async driver** (`asyncpg`, `aiomysql`) with `async def` handlers; a sync driver inside `async def` blocks the loop (§4). `expire_on_commit=False` matters because otherwise attribute access after commit triggers a lazy refresh — which raises in async code. Watch pool sizing: pool size × worker processes must stay under the database's connection limit (see the [PostgreSQL guide](/backend/postgresql)).

---

## 12. Testing

```python
import pytest
from httpx import AsyncClient, ASGITransport

@pytest.fixture
async def client():
    app.dependency_overrides[get_db] = override_get_db     # no patching needed
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as c:
        yield c
    app.dependency_overrides.clear()

async def test_create(client):
    r = await client.post('/candidates', json={'name': 'Ana', 'email': 'a@b.c', 'score': 90})
    assert r.status_code == 201
    assert 'email' not in r.json()          # response_model must filter it out
```

`dependency_overrides` is the feature that makes FastAPI pleasant to test — you swap the database, the clock or the current user without `unittest.mock.patch`. `TestClient` (sync, built on httpx) is fine for simple cases, but `AsyncClient` + `ASGITransport` is required to test async dependencies properly, and both bypass the network so tests stay fast. **Remember `TestClient` as a context manager triggers `lifespan`** — outside one, your startup code never runs and `app.state` is empty.

---

## 13. Project Structure

```
app/
  main.py            # create_app(), lifespan, router wiring
  config.py          # pydantic-settings, read once
  api/
    deps.py          # shared dependencies (CurrentUser, get_db)
    routes/
      candidates.py  # APIRouter only — no business logic
  services/          # business logic; no FastAPI imports
  repositories/      # data access
  models/            # SQLAlchemy models
  schemas/           # Pydantic request/response models
  core/              # logging, errors, security
```

Keep `schemas` (Pydantic, the API contract) separate from `models` (ORM, the database). Conflating them couples your API shape to your table shape, so every migration becomes a breaking API change. **Services must not import FastAPI** — that keeps business logic callable from a CLI, a queue consumer or a test without HTTP.

---

## 14. Performance and Deployment

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
# or, with process supervision:
gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 4
```

**Workers give you CPU parallelism** (one process each, sidestepping the GIL); **async gives concurrency within a worker**. Rule of thumb: workers ≈ CPU cores for CPU-bound, fewer with high async concurrency. Remember every worker holds its own connection pool.

Where the time actually goes, in order:

1. **Blocking calls in `async def`** (§4) — the single biggest self-inflicted wound.
2. **A new HTTP client per request** — create it in `lifespan` (§9).
3. **Pydantic validation of large payloads.** v2 is Rust-fast, but validation is proportional to data size. Validate at the boundary, don't re-validate internally, and consider dropping `response_model` when you're returning data you just built.
4. **N+1 queries** from lazy ORM relationships — eager-load explicitly.
5. **Sync ORM inside async handlers.**

Deployment: run behind a reverse proxy for TLS and buffering control, set `--proxy-headers` and `forwarded-allow-ips` so client IPs and scheme are correct, expose `/healthz` (liveness) and `/readyz` (readiness — see the [Docker & K8s guide](/backend/docker-kubernetes)), and **disable the interactive docs in production** if the API isn't public: `FastAPI(docs_url=None, redoc_url=None, openapi_url=None)`.

---

## 15. FastAPI vs Django vs Flask

| | FastAPI | Django | Flask |
|---|---|---|---|
| Protocol | ASGI (async-first) | ASGI-capable, sync-rooted | WSGI (ASGI via extensions) |
| Validation | **built in** (Pydantic) | forms / DRF serializers | manual or extensions |
| OpenAPI docs | **automatic** | DRF add-on | extensions |
| ORM | bring your own | **built in**, mature migrations | bring your own |
| Admin UI | none | **built in** | none |
| Auth | plumbing only | **full system** | extensions |
| Best for | APIs, ML/LLM services, high-concurrency I/O | full products, CRUD-heavy apps | small services, full control |

Choose **FastAPI** for an API-only service, high I/O concurrency, or anything wrapping model calls — the automatic validation and OpenAPI are the productivity win. Choose **Django** when you want batteries included: ORM, migrations, admin and auth out of the box. Choose **Flask** for something small where you want to assemble the pieces yourself. Note FastAPI deliberately gives you no ORM, no admin and no auth system, so a full product means assembling more yourself.

---

## 16. Interview Questions and Answers

**Q1: What is FastAPI built on, and where does its performance come from?**

It is built on **Starlette** for the ASGI web layer (routing, middleware, WebSockets) and **Pydantic** for validation and serialisation, with the type-hint layer on top that generates OpenAPI. The performance comes from **ASGI**, not from Python being faster: under WSGI one request occupies one worker thread for its whole lifetime, so a handler waiting 200 ms on a database holds a thread doing nothing, whereas an ASGI worker yields the event loop at each `await` and can hold thousands of in-flight requests. Pydantic v2's Rust core also makes validation much cheaper than v1. The important caveat is that this only helps **I/O-bound** work — for CPU-bound handlers the event loop buys nothing and you still need multiple worker processes to escape the GIL.

**Q2: What is the difference between `async def` and `def` handlers, and what's the dangerous combination?**

An `async def` handler runs **directly on the event loop**; a plain `def` handler is run by FastAPI in an **external threadpool**, so blocking code inside it doesn't stall the loop. The dangerous combination is `async def` **containing a blocking call** — `time.sleep`, `requests.get`, or a synchronous database driver — because that freezes the entire event loop and therefore every concurrent request in that worker process. The rule is: if your libraries are async use `async def`; if they're blocking, either declare the handler plain `def` and let the threadpool absorb it, or keep `async def` and offload with `await asyncio.to_thread(...)`. One nuance worth adding: the threadpool is bounded (40 threads by default), so `def` handlers have a concurrency ceiling — for genuinely high concurrency you want async drivers end to end.

**Q3: How does FastAPI's dependency injection work, and why is it more than a convenience?**

A dependency is any callable declared with `Depends()`; FastAPI resolves its parameters recursively, so dependencies compose. Four properties make it structural rather than cosmetic. **`yield` dependencies** provide per-request setup and teardown, which is the canonical database-session pattern. **Caching within a request** means the same dependency is resolved once per request, so every consumer of `get_db` shares one session and therefore one transaction — that's what makes request-scoped transactions work. **`app.dependency_overrides`** replaces a dependency wholesale in tests without `mock.patch`, which is the single biggest testability win. And **router- or app-level dependencies** let you apply a check like `require_admin` across many routes without injecting a value. You can also parameterise them by returning a closure, as in `Depends(require_role('admin'))`.

**Q4: Why should you separate request and response models, and what does `response_model` actually do?**

`response_model` filters the outgoing object down to the declared schema, so it is a **security control, not documentation**. If a handler returns an ORM row carrying `password_hash` or `internal_notes`, those fields cannot leak because they aren't in the response schema. Reusing one model for both directions creates two bugs: input-side, an `id` or `role` field lets a client set values they shouldn't control (mass assignment); output-side, you leak whatever the input model happened to accept. So `CandidateIn` takes name and email while `CandidateOut` returns id and name and simply omits email. The trade-off to mention is cost — FastAPI validates the response too, so on a hot path returning data you just constructed, `response_model` can be pure overhead, and `response_model_exclude_unset` or returning a plain dict is sometimes the right call.

**Q5: How do you handle errors, and why do validation failures return 422?**

Raise `HTTPException(status_code, detail)` for expected HTTP outcomes. For domain errors, define your own exception types and register an `@app.exception_handler`, which keeps business logic free of HTTP imports and gives you one place to map internal errors to safe, machine-readable codes. Request validation failures return **422 Unprocessable Entity** rather than 400, because the request was syntactically valid JSON but semantically wrong — you can override that with a `RequestValidationError` handler if your API contract requires 400. Two production concerns: never let an unhandled exception surface, since FastAPI returns a bare 500 and you lose the diagnostic unless you log it with a correlation ID; and don't put internal detail in `detail`, because it goes straight to the client.

**Q6: What is `BackgroundTasks` good for, and what is it not?**

It schedules a function to run **after the response is sent**, in the same process — good for short, non-critical follow-ups like sending a welcome email or writing an audit line. What it is not is durable: there is **no retry, no persistence and no visibility**, so if the worker restarts or crashes the task is simply lost, and it competes for the same event loop or threadpool as your request handling, so a slow task degrades throughput. Anything that must not be lost — payment reconciliation, webhook delivery, report generation — belongs in a real queue such as Celery, ARQ or SQS with retries and a dead-letter queue. The honest framing is that `BackgroundTasks` is a convenience for fire-and-forget side effects, not a job system.

**Q7: How do you manage startup and shutdown resources?**

With the **`lifespan` async context manager** passed to `FastAPI(lifespan=...)` — everything before the `yield` runs at startup, everything after at shutdown. This is where long-lived resources belong: the database pool, an `httpx.AsyncClient`, a Redis client, a warmed model. Creating an `httpx.AsyncClient` per request is a common and expensive bug, because you lose connection pooling and pay TCP and TLS setup every call. `lifespan` replaces the deprecated `@app.on_event('startup')` hooks and has the advantage of being a single scope, so setup and its matching teardown sit together and teardown still runs if startup partially succeeded. Note it runs **per worker process**, so four uvicorn workers create four pools — size them accordingly.

**Q8: How do you test a FastAPI application?**

Use `httpx.AsyncClient` with `ASGITransport(app=app)`, which calls the app in-process without a network socket, and override dependencies via `app.dependency_overrides[get_db] = fake` rather than patching — that is the cleanest seam FastAPI gives you, and it works for the database, the clock and the current user. `TestClient` (sync) is fine for straightforward cases, but async dependencies need the async client. Two things people trip on: `TestClient` only triggers **`lifespan`** when used as a context manager, so outside one your startup never runs and `app.state` is empty; and you should assert that `response_model` actually filtered sensitive fields (`assert 'email' not in body`), because that's a security property worth a test. Clear the overrides in fixture teardown, since they're global to the app object.

**Q9: When would you choose FastAPI over Django or Flask?**

FastAPI for an **API-only service**, for high I/O concurrency, and for anything wrapping model or third-party calls — the automatic validation, serialisation and OpenAPI documentation from type hints is a genuine productivity multiplier, and ASGI plus streaming and WebSockets suits LLM-backed services. **Django** when you want batteries included: a mature ORM with migrations, an admin UI, and a full auth system, which makes it far faster for a CRUD-heavy product. **Flask** for something small where you want to choose every component yourself. The trade-off to state plainly is that FastAPI deliberately provides **no ORM, no admin and no auth system** — you assemble those, so a large full-stack product carries more integration work than the equivalent Django app.

**Q10: What are the main performance pitfalls in a FastAPI service?**

In order of how often they actually bite: **blocking calls inside `async def`**, which stall the whole loop; **creating an HTTP client or database connection per request** instead of once in `lifespan`, which throws away pooling; **Pydantic validation of large payloads**, especially double work from a `response_model` over data you just built — validate at the boundary and trust internally; **N+1 queries** from lazy ORM relationships, which need explicit eager loading; and **a sync ORM inside async handlers**. Beyond the code, get the process model right: worker processes give CPU parallelism while async gives concurrency inside a worker, and each worker holds its own pool, so pool size times workers must stay under the database's connection limit. Profile before guessing — in a model-backed service the API call usually dominates everything else by orders of magnitude.

---

## 17. Tricky Questions

**Q1: You add `async def` to a handler that calls a synchronous ORM, and throughput collapses under load — it was fine as a plain `def`. Why?**

**Because as a plain `def` FastAPI ran it in a threadpool, and as `async def` the blocking ORM call now runs on the event loop and stalls every other request.** With `def`, each request occupied one of the threadpool's threads while blocking, and the loop stayed free to accept and progress other requests. Marking it `async def` told FastAPI "this never blocks", so it is awaited directly on the loop — and a synchronous database call holds the loop for its whole duration, meaning requests that could have been interleaved are now fully serialised, and unrelated endpoints in the same worker also stall. Under load that shows up as latency climbing across the whole service, not just this route. Fixes: revert to plain `def`, wrap the call in `await asyncio.to_thread(...)`, or move to an async driver such as `asyncpg`. The general lesson is that `async def` is a **promise** about your code, and FastAPI trusts it.

**Q2: Two dependencies both `Depends(get_db)`. Do they get one session or two, and why does it matter?**

**One — dependencies are cached per request by default.** FastAPI resolves each unique dependency (callable plus parameters) once per request and reuses the result, so both dependants receive the same session object. This is the mechanism that makes a request-scoped transaction work: a write performed via one dependency is visible to the other, and a single commit or rollback covers both. If you actually want separate instances, pass `Depends(get_db, use_cache=False)`. The failure mode people hit is the reverse: they assume isolation, wrap two operations in what they think are independent transactions, and are surprised that one exception rolls back both — or that a partial write is visible mid-request. Note the cache key includes the parameters, so a parameterised dependency called with different arguments is resolved separately.

**Q3: Your endpoint returns a user object and the response includes `password_hash`, even though your Pydantic model doesn't declare it. What happened?**

**The `response_model` is missing, or the return type annotation was ignored.** Without a declared response schema, FastAPI serialises whatever you return using `jsonable_encoder`, which walks the object's attributes — so an ORM row hands over every column, including secrets. Adding `response_model=UserOut` (or a `-> UserOut` return annotation, which FastAPI now honours) filters the output to the declared fields and the hash cannot escape. Two related traps: reusing the **input** model as the response model leaks whatever the input accepted; and `model_config = {'from_attributes': True}` is what lets the output model read from an ORM object at all. This is why `response_model` should be understood as a security boundary — the fix is declarative, and a test asserting `'password_hash' not in response.json()` is worth writing.

**Q4: A route `/candidates/me` returns `422 Unprocessable Entity` instead of the current user. Why?**

**A `/candidates/{candidate_id}` route is declared before it, so `me` is being parsed as the `int` path parameter.** FastAPI matches routes in **declaration order** and the first match wins, so the parameterised route swallows the literal one; `me` then fails `int` validation and you get a 422 listing a type error on `candidate_id`. The fix is ordering: declare the specific literal route **before** the parameterised one. The same class of bug hits `/items/search` versus `/items/{id}`, and it's easy to introduce by moving code or by including routers in a different order. If the parameter were typed `str` you'd get something worse than an error — the handler would run with `candidate_id="me"` and quietly look up a candidate that doesn't exist.

**Q5: Your `httpx.AsyncClient` works in tests but the service leaks connections and slows down in production. What's wrong?**

**The client is being constructed per request instead of once in `lifespan`.** Each `AsyncClient()` owns its own connection pool, so creating one per request means a fresh TCP and TLS handshake for every outbound call, no keep-alive reuse, and — if it isn't closed via `async with` or `aclose()` — sockets accumulate until you hit file-descriptor limits. Tests hide this because they make few calls and the process exits promptly. The fix is to create the client in the `lifespan` context manager, store it on `app.state`, inject it via a dependency, and close it on shutdown. Remember `lifespan` runs **per worker process**, so four workers hold four pools and your connection limits must account for that. The same reasoning applies to database pools and Redis clients.

---

## 18. Cheat Sheet

**Foundations**

1. FastAPI = Starlette (ASGI) + Pydantic (validation) + type-hint-driven OpenAPI.
2. ASGI's win is I/O concurrency; CPU-bound work still needs worker processes.
3. Interactive docs at `/docs` (Swagger) and `/redoc`; schema at `/openapi.json`.
4. Disable docs in production for non-public APIs.

**Routing**

5. Path params come from the path, Pydantic models from the body, other scalars from the query.
6. **Declare literal routes before parameterised ones** — first match wins.
7. `APIRouter(prefix=, tags=, dependencies=)` for structure and shared checks.

**async vs def**

8. `async def` runs on the event loop; plain `def` runs in a threadpool.
9. **Never block inside `async def`** — it freezes every request in the worker.
10. Blocking library? Use plain `def`, or `await asyncio.to_thread(...)`.
11. The threadpool is bounded (~40 threads) — async end-to-end for high concurrency.

**Models**

12. `response_model` **filters output** — it is a security control.
13. Separate `In` and `Out` models: prevents mass assignment and field leakage.
14. `from_attributes: True` to return ORM objects.
15. Validation errors are **422**, not 400.

**Dependencies**

16. `Depends()` resolves recursively; `yield` gives per-request teardown.
17. Dependencies are **cached per request** — one `get_db` = one shared session.
18. `use_cache=False` for a fresh instance.
19. `app.dependency_overrides` is the testing seam — no patching.
20. `dependencies=[...]` on a route/router runs a check without injecting.

**Lifecycle**

21. `lifespan` for pools and HTTP clients — created **once per worker**.
22. Never create an `httpx.AsyncClient` per request.
23. `BackgroundTasks` is in-process, no retries, no durability — use a real queue for anything important.

**Security**

24. Identical error for unknown user and wrong password.
25. Pin JWT `algorithms=[...]` when decoding; verify `exp`, `aud`, `iss`.
26. Hash with argon2/bcrypt; httpOnly cookies over `localStorage` for browsers.
27. `allow_origins=['*']` with `allow_credentials=True` is invalid and browser-rejected.
28. Authorize ownership, not just existence.

**Streaming**

29. `StreamingResponse` + `text/event-stream`; check `request.is_disconnected()`.
30. After the first byte the status can't change — signal errors in-band.
31. `X-Accel-Buffering: no` to stop nginx buffering the stream.

**Testing**

32. `AsyncClient` + `ASGITransport` for async; `TestClient` for simple sync cases.
33. `TestClient` only runs `lifespan` as a context manager.
34. Assert sensitive fields are absent from responses.

**Performance & deployment**

35. Workers ≈ cores for CPU parallelism; async for in-worker concurrency.
36. Pool size × workers must stay under the database connection limit.
37. Don't re-validate internally; `response_model` on hot paths can be pure cost.
38. Eager-load ORM relationships to avoid N+1.
39. Run behind a proxy with `--proxy-headers`; expose `/healthz` and `/readyz`.
40. Keep `services/` free of FastAPI imports so logic is reusable and testable.

---

## 19. References

- [FastAPI documentation](https://fastapi.tiangolo.com/) — the tutorial is genuinely the best source.
- [Concurrency and async/await](https://fastapi.tiangolo.com/async/) — the `async def` vs `def` decision, from the author.
- [Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/) and [Dependencies with yield](https://fastapi.tiangolo.com/tutorial/dependencies/dependencies-with-yield/)
- [Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/) — routers and project layout.
- [Security](https://fastapi.tiangolo.com/tutorial/security/) — OAuth2 password flow with JWT.
- [Lifespan Events](https://fastapi.tiangolo.com/advanced/events/) and [Testing](https://fastapi.tiangolo.com/advanced/async-tests/)
- [Starlette](https://www.starlette.io/) for middleware, WebSockets and responses.
- [Pydantic v2](https://docs.pydantic.dev/latest/) — validation and the performance notes.
- [ASGI specification](https://asgi.readthedocs.io/en/latest/)

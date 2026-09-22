import type { BuildExplanation } from './playgroundExplanations';

// Build-order walkthroughs for the React Machine Coding templates.
//
// These templates are 100-250 line reference implementations. Their teaching
// content was already good, but it lived as comments inside the editor — so it
// arrived as one undifferentiated wall, and the Explain button did not appear
// at all, because the algorithm model (Big-O, pseudocode, array frames) does
// not fit a UI component.
//
// Each entry breaks a template into the order you would actually build it in,
// with only the relevant snippet per step, the trap that step avoids, and the
// points an interviewer grades. Keep `code` to the lines the step is ABOUT —
// pasting the whole component back defeats the purpose.

const responsiveImages: BuildExplanation = {
  kind: 'build',
  problem: 'Responsive Images (srcset / AVIF)',
  problemStatement:
    'Serve the right resolution and format per device, reserve the space before the bytes arrive, and get loading priority right. The image is the LCP element on most pages, so these four decisions are usually the difference between a good and a bad Largest Contentful Paint.',
  buildOrder: [
    {
      title: 'List the candidates the browser may choose from',
      excerpt: { from: "src=\"/img/hero-800.jpg\"", lines: 6 },
      detail:
        'srcset is a menu, not an instruction. Each entry declares the file and its intrinsic width in pixels with the `w` descriptor. You are handing the browser options and letting it pick — it knows the viewport and the device pixel ratio, and you do not.',
      pitfall: 'The `w` value is the image\'s real pixel width, not the CSS width you want. Guessing it makes every selection wrong.',
    },
    {
      title: 'Tell the browser how wide it will actually display',
      excerpt: { from: "sizes=\"(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 6", lines: 3 },
      detail:
        'This is the half people leave out. srcset says what exists; sizes says how wide the image will render at a given viewport. The browser multiplies that by the device pixel ratio to pick a candidate — and it decides during preload scanning, before any CSS has been applied, so it genuinely cannot work the layout out for itself.',
      pitfall: 'Omit sizes and the browser assumes 100vw. On a 400px-wide phone at DPR 3 it will happily fetch the 1600w file for a 600px slot.',
    },
    {
      title: 'Offer modern formats with a fallback',
      excerpt: { from: "</picture>", lines: 5 },
      detail:
        'The browser takes the first `<source>` whose type it supports, so order runs smallest-format-first: AVIF (~50% smaller than JPEG), then WebP (~30%), then the `<img>` as the universal fallback. This is a different job from srcset — picture switches format or art direction, srcset switches resolution.',
      pitfall: 'The `<img>` inside `<picture>` is not optional. It is where alt, width, height and loading live, and it is what renders if no source matches.',
    },
    {
      title: 'Reserve the space before the bytes arrive',
      excerpt: { from: "function AspectRatioBox() {", lines: 8 },
      detail:
        'width and height are not sizing here — CSS overrides both. They give the browser the aspect ratio so it can reserve a correctly shaped box immediately. Without it the image occupies 0px until it loads, and everything below jumps down when it arrives.',
      pitfall: 'That jump is Cumulative Layout Shift, and it is scored on every page view — not just the first load where you happened to notice it.',
    },
    {
      title: 'Get loading priority right — and treat the hero as special',
      excerpt: { from: "//    regresses LCP; use loading=\"eager\" + fetchpriority=\"hi", lines: 4 },
      detail:
        'Lazy loading below the fold saves real bytes. For the hero it does the opposite: it delays the very element LCP is measured against. decoding="async" keeps the decode off the main thread in both cases.',
      pitfall: 'If the hero is a CSS background or inserted by JavaScript, the preload scanner never sees it and the fix is a `<link rel="preload">`, not a priority attribute.',
    },
  ],
  graded: [
    { point: 'You can state the difference between srcset and sizes without hedging', why: 'srcset lists candidates with their intrinsic widths; sizes declares the rendered width so the browser can choose. This is the most common thing people get wrong, and it is asked precisely because it separates copied snippets from understanding.' },
    { point: 'You know srcset and <picture> solve different problems', why: 'srcset + sizes is resolution switching — the same image at several sizes. <picture> + type is format negotiation or art direction. Reaching for <picture> to do resolution switching signals you have only seen one recipe.' },
    { point: 'Layout shift is prevented structurally, not visually', why: 'Dimensions or aspect-ratio reserve the box up front. A fixed height that happens to look right is not the same thing and breaks the moment the image is responsive.' },
    { point: 'You never lazy-load the LCP image, and you say so unprompted', why: 'It is a one-attribute regression to the metric you are being judged on, and volunteering it shows you think about loading order rather than reciting attributes.' },
    { point: 'alt text describes purpose, and decorative images get alt=""', why: 'An empty alt tells a screen reader to skip the image; a missing alt makes it read the filename. They are opposites, not degrees of the same thing.' },
  ],
};

const protectedRoute: BuildExplanation = {
  kind: 'build',
  problem: 'Protected Route (Auth + RBAC)',
  problemStatement:
    'Gate a page behind login, gate an admin page behind a role, and return the user to where they were going once they sign in. Authentication is who you are; authorization is what you may do — two different checks that fail differently.',
  buildOrder: [
    {
      title: 'Model the session as three states, not a boolean',
      excerpt: { from: "const [status, setStatus] = React.useState('loading');", lines: 3 },
      detail:
        'Before the token has been validated you are neither logged in nor logged out. A boolean cannot say that, so it defaults to false — which reads as "logged out" for the few hundred milliseconds the check takes.',
      pitfall: 'That default is the single most common bug in this exercise: every user gets bounced to login on every refresh, and it only reproduces when the session check is slow enough to notice.',
    },
    {
      title: 'Write one declarative gate, not a check per page',
      excerpt: { from: "const { status, user } = useAuth();", lines: 7 },
      detail:
        'One component expresses the whole policy, and the three branches are in priority order. Pages then declare their requirement rather than implementing it: `<Protected roles={["admin"]}><AdminPage /></Protected>`.',
      pitfall: 'Scattering `if (!user) navigate(...)` through fifty components means fifty places to get the loading state wrong, and no single place to read the policy.',
    },
    {
      title: 'Render the redirect — never perform it during render',
      excerpt: { from: "function Redirect({ to, onRedirect }) {", lines: 9 },
      detail:
        'Calling the parent\'s setState inside the gate\'s render produces "Cannot update a component while rendering a different component" — React is part-way through one component and cannot honour an update to another. This is exactly why react-router gives you `<Navigate />` as a COMPONENT rather than a navigate() you call inline: it runs in an effect, after commit.',
      pitfall: 'The fire-once ref is load-bearing. Without it, a redirect that does not immediately unmount re-fires on every render — an infinite loop.',
    },
    {
      title: 'Distinguish 401 from 403',
      excerpt: { from: "if (status === 'anonymous') return <Redirect to=\"login\" onRe", lines: 3 },
      detail:
        'Unauthenticated means "we do not know who you are" — sending them to log in is the fix. Authenticated-but-wrong-role means "we know exactly who you are, and the answer is no" — logging in again changes nothing.',
      pitfall: 'Sending a logged-in user with the wrong role back to login produces the loop where they sign in successfully and land right back where they started.',
    },
    {
      title: 'Remember the destination and return to it',
      detail:
        'Carry the intended path through the redirect so login is a detour rather than a reset. `replace` keeps the guarded URL out of history, so Back does not walk into the gate again.',
      pitfall: 'Only honour an internal path. Taking the redirect target from a query string without validating it is an open-redirect bug.',
    },
  ],
  graded: [
    { point: 'The loading state is handled explicitly', why: 'It is the difference between a route guard that works and one that logs everyone out on refresh. Interviewers watch for it, because the naive version passes a quick manual test on a fast connection.' },
    { point: 'A redirect is treated as a side effect', why: 'Rendered, not called. Getting this wrong produces a console warning that most candidates cannot explain, and the fix is the same reason <Navigate /> exists at all.' },
    { point: '401 and 403 lead to different places', why: 'It shows you understand the two checks are independent. A single "not allowed" branch collapses them and produces the sign-in loop.' },
    { point: 'You volunteer that this is UX only, not security', why: 'Client state is editable by anyone with devtools, so a hidden button is not a permission. Every protected route must be backed by server-side authorization — saying it unprompted is the senior signal here.' },
    { point: 'The policy lives in one component', why: 'Role checks duplicated across pages drift, and when the rule changes you cannot enumerate the places to update. One gate is also the thing you can test.' },
  ],
};

const miniReduxStore: BuildExplanation = {
  kind: 'build',
  problem: 'Mini Redux Store',
  problemStatement:
    'Implement the store Redux actually gives you — getState, dispatch, subscribe — then bind it to React so a component re-renders only when its own slice changes. The point is being able to explain why this exists alongside Context rather than being replaced by it.',
  buildOrder: [
    {
      title: 'The store is about twenty lines and has three methods',
      excerpt: { from: "const listeners = new Set();", lines: 9 },
      detail:
        'That is the entire contract. The reducer must be pure — same input, same output, no mutation, no side effects — because dispatch replaces the state wholesale and every equality check downstream depends on a new reference appearing only when something actually changed.',
      pitfall: 'subscribe must return its own unsubscribe. Returning nothing leaks a listener for every component that ever mounted.',
    },
    {
      title: 'Bind to React with useSyncExternalStore',
      excerpt: { from: "function useSelector(selector) {", lines: 6 },
      detail:
        'This is the purpose-built primitive for reading an external mutable source. It subscribes, reads a snapshot, and — the part that matters — prevents tearing, where a concurrent render lets two components read different versions of the same state within one frame.',
      pitfall: 'useState + useEffect looks equivalent and is not: the effect runs after paint, so the first frame can render stale state, and nothing protects against tearing.',
    },
    {
      title: 'Make the selector the unit of subscription',
      excerpt: { from: "const count = useSelector(s => s.count);", lines: 3 },
      detail:
        'This is the real answer to "why not just Context?". A Context value change re-renders every consumer, no matter which field moved. A selector re-renders only the components whose slice actually changed — which is why Redux and Zustand still exist next to Context.',
      pitfall: 'A selector returning a fresh object each call fails the reference check every time and re-renders on every dispatch. That is what reselect and useShallow are for.',
    },
    {
      title: 'Add middleware by wrapping dispatch',
      excerpt: { from: "const logger = (store) => (next) => (action) => {", lines: 6 },
      detail:
        'Middleware is function composition around dispatch, and that store => next => action signature is exactly how thunk, saga and the devtools hook in. Once you have seen it, "how does redux-thunk work?" stops being mysterious — it is one middleware that calls the action if it happens to be a function.',
      pitfall: 'Forgetting to call next(action) silently swallows every action downstream of your middleware.',
    },
  ],
  graded: [
    { point: 'You can state the three-method contract and why the reducer is pure', why: 'getState, dispatch, subscribe is the whole store. Purity is what makes time-travel debugging, replay and reference-equality checks possible — mutating state inside a reducer breaks all three at once.' },
    { point: 'useSyncExternalStore, and you can say what tearing is', why: 'Reaching for useState + useEffect works by accident until concurrent rendering interrupts a render, at which point two components can display different values of the same state. Naming that failure is the senior signal.' },
    { point: 'Selector isolation is your answer to "why not Context?"', why: 'Context re-renders every consumer on any change; a selector re-renders one. That single difference is the reason this whole category of library exists, and it is what the question is really probing.' },
    { point: 'You know what you would actually reach for', why: 'Redux Toolkit for large shared client state, Zustand for something lighter, TanStack Query for server state — which is most of what people wrongly keep in Redux. Building it by hand is the exercise, not the recommendation.' },
  ],
};

const clientCache: BuildExplanation = {
  kind: 'build',
  problem: 'Client Cache (stale-while-revalidate)',
  problemStatement:
    'Build the caching behaviour TanStack Query and SWR give you: serve the cached value instantly on a revisit, refresh it in the background, and make sure two components asking for the same key share one request rather than firing two.',
  buildOrder: [
    {
      title: 'Keep two maps — the data, and the requests in flight',
      excerpt: { from: "const cached = cache.get(key);", lines: 3 },
      detail:
        'The second map is the one people forget. Without it, two components mounting at the same time with the same key each start their own request, and N consumers means N identical network calls.',
      pitfall: 'Delete the inflight entry when the promise settles, or a failed request is cached as permanently pending and the key can never be refetched.',
    },
    {
      title: 'Initialise state from the cache, not from null',
      excerpt: { from: "const [data, setData] = React.useState(entry ? entry.data : ", lines: 3 },
      detail:
        'The lazy initialiser runs during the first render, so a revisit paints real data on frame one. Starting at null and filling it in an effect means a loading flash over data you already had.',
      pitfall: 'That flash is the whole reason this pattern exists — a spinner covering content the user just saw reads as slower than no cache at all.',
    },
    {
      title: 'Render the stale value AND refetch',
      excerpt: { from: "let cancelled = false;", lines: 9 },
      detail:
        'Stale-while-revalidate in one effect: show what you have, ask for what is current, swap when it lands. Exposing isStale lets the UI show a quiet "refreshing" hint instead of blocking.',
      pitfall: 'The cancelled flag is not optional. Switch keys quickly and a slow first response can land after a fast second one and overwrite it — the out-of-order race.',
    },
    {
      title: 'Know the boundary of what you built',
      detail:
        'Forty lines gets you caching, dedup and background refresh. TanStack Query adds retries with backoff, revalidation on window focus and reconnect, garbage collection of unused keys, pagination and infinite-query helpers, mutation invalidation, and devtools.',
      pitfall: 'Claiming the hook replaces the library is the answer that loses points. Naming what is missing is the one that gains them.',
    },
  ],
  graded: [
    { point: 'Stale-while-revalidate, stated as a deliberate trade', why: 'You are choosing to show possibly-old data immediately rather than correct data eventually. That is the right default for most reads and the wrong one for a balance or a stock level — knowing which is which is the point.' },
    { point: 'Request de-duplication via an inflight map', why: 'It is the difference between one request and one per consumer. Naive hooks that fire N requests for N components are a very common production bug and this is the two-line fix.' },
    { point: 'State initialised from the cache during render', why: 'Filling it in an effect guarantees a loading flash on every revisit, which defeats the cache visually even though it technically worked.' },
    { point: 'The out-of-order response race is handled', why: 'Any component that refetches on a changing key has this bug latent in it. Interviewers probe by asking what happens if you switch tabs fast.' },
  ],
};

const webSocketFeed: BuildExplanation = {
  kind: 'build',
  problem: 'WebSocket Live Feed',
  problemStatement:
    'Connect on mount, show connection status, reconnect sensibly after a drop, and keep the message buffer bounded. The connection lifecycle is the whole exercise — rendering the messages is the easy part.',
  buildOrder: [
    {
      title: 'Open on mount and close on unmount',
      excerpt: { from: "socketRef.current = socket;", lines: 5 },
      detail:
        'The cleanup stops a socket leaking per mount. The flag matters just as much: your own close() fires the same onclose handler a real drop does, so without it navigating away starts an endless reconnect loop against a component that no longer exists.',
      pitfall: 'In StrictMode the effect runs twice in development. If cleanup is missing you will see it immediately — which is exactly what StrictMode is for.',
    },
    {
      title: 'Reconnect with exponential backoff and full jitter',
      excerpt: { from: "const delay = Math.random() * Math.min(30000, 500 * 2 ** (at", lines: 3 },
      detail:
        'Backoff stops you hammering a server that is already struggling. Jitter stops every client retrying at the same instant — without it a server restart brings every client back in lockstep and the stampede knocks it over again.',
      pitfall: 'Reset the attempt counter inside onopen. Leave it climbing and a long-lived tab eventually waits the full cap after a one-second blip.',
    },
    {
      title: 'Bound the buffer',
      excerpt: { from: "setMessages(prev => [msg, ...prev].slice(0, MAX_MESSAGES));", lines: 3 },
      detail:
        'A real feed runs for hours. An unbounded array grows until the tab is slow and then until it dies — a leak that never shows up in a five-minute demo but always shows up in production.',
      pitfall: 'Slicing the wrong end keeps the oldest 200 messages and silently stops showing new ones.',
    },
    {
      title: 'Make the connection state visible and announced',
      excerpt: { from: "<span aria-live=\"polite\" style={{ fontSize: 13 }}>{status}</", lines: 3 },
      detail:
        'Users need to know whether what they are looking at is current. A live region announces the change to screen readers instead of communicating it only through a coloured dot.',
      pitfall: 'Colour alone fails both colour-blind users and anyone not looking at that corner of the screen.',
    },
  ],
  graded: [
    { point: 'Cleanup, plus a flag so your own close does not trigger a reconnect', why: 'This is the classic version of the bug: navigate away and the page keeps opening sockets forever. It is invisible locally and obvious in production connection counts.' },
    { point: 'Backoff with jitter, capped, and the counter reset on open', why: 'Each of those three is a separate incident waiting to happen — hammering, thundering herd, and a tab that takes 30 seconds to recover from a blip.' },
    { point: 'The buffer is bounded', why: 'It shows you are thinking about a session that lasts hours rather than a demo that lasts a minute. Unbounded accumulation is the most common React memory leak after uncleaned listeners.' },
    { point: 'You can name what comes next', why: 'Heartbeats to detect a half-open connection where TCP thinks it is fine but nothing flows; sequence numbers to detect gaps and replay after a reconnect; batching high-frequency messages into a rAF flush so 1000 msg/sec is not 1000 renders.' },
  ],
};

const optimisticUI: BuildExplanation = {
  kind: 'build',
  problem: 'Optimistic UI Updates',
  problemStatement:
    'Show the result of an action immediately, then reconcile with the server. Anyone can render early — the graded half is the failure path: what the UI does when the request loses.',
  buildOrder: [
    {
      title: 'Render the pending item alongside the real ones',
      excerpt: { from: "const [optimisticTodos, addOptimistic] = React.useOptimistic", lines: 4 },
      detail:
        'useOptimistic derives a view of state that includes whatever is in flight. React discards the optimistic layer automatically once the underlying state updates or the action settles, so there is no manual teardown.',
      pitfall: 'It must be called inside a transition or a form action. Outside one, React warns and drops the update — and the symptom is simply that nothing appears.',
    },
    {
      title: 'Mark it visibly as not-yet-saved',
      excerpt: { from: "<li key={t.id} style={{ opacity: t.pending ? 0.45 : 1 }}>", lines: 3 },
      detail:
        'An optimistic row that looks identical to a saved one is a lie the user cannot detect. A dimmed row or a small spinner keeps the UI honest about what is still in flight.',
      pitfall: 'Disabling the input while the request runs throws away most of the benefit — the point was to let the user keep going.',
    },
    {
      title: 'Snapshot before mutating, restore on failure',
      excerpt: { from: "setTodos(prev => prev.map(t => (t.id === tempId ? saved : t)", lines: 9 },
      detail:
        'This is the manual rollback useOptimistic replaces, and you should be able to write it. Note the success path replaces the temp item by id rather than appending the server response.',
      pitfall: 'Appending the saved item instead of replacing the temp one leaves a duplicate on screen — the most common bug in the manual version.',
    },
    {
      title: 'Decide where optimism is appropriate',
      detail:
        'It suits high-success, low-stakes, reversible actions: likes, todos, reordering, marking read. The user loses little if the rare failure rolls back.',
      pitfall: 'For a payment or an irreversible action, show a real pending state. A charge that appears to succeed and then silently reverts is far worse than a spinner.',
    },
  ],
  graded: [
    { point: 'The rollback exists and is exercised', why: 'Rendering early is trivial. Interviewers ask what happens when the request fails, and an implementation with no snapshot leaves the UI permanently showing something the server never accepted.' },
    { point: 'The temp item is replaced by id, not appended to', why: 'It is the bug that reliably appears in the manual version, and spotting it shows you have actually run this code rather than recited the pattern.' },
    { point: 'Pending state is visible', why: 'Otherwise the UI claims work is saved when it is not, and the user closes the tab. Honesty about in-flight state is part of the feature, not decoration.' },
    { point: 'You know when NOT to be optimistic', why: 'The judgement is the senior part of the answer. Applying it to a payment flow is a worse outcome than never using it at all.' },
  ],
};

const suspenseLazy: BuildExplanation = {
  kind: 'build',
  problem: 'Suspense + Lazy (Code Splitting)',
  problemStatement:
    'Load a component only when it is needed, show something useful while it arrives, and handle the case where it never does. Suspense covers the pending state only — the failure half is yours.',
  buildOrder: [
    {
      title: 'Split at the import, not in the component',
      excerpt: { from: "//     const Heavy = React.lazy(() => import('./HeavyChart')", lines: 3 },
      detail:
        'The dynamic import is what makes the bundler emit a separate chunk; React.lazy is just the wrapper that lets you render the result. Both halves are required — lazy around a static import splits nothing.',
      pitfall: 'React.lazy expects a module with a default export. For a named one: () => import("./x").then(m => ({ default: m.Named })).',
    },
    {
      title: 'Put the boundary around the part that is loading',
      excerpt: { from: "</React.Suspense>", lines: 3 },
      detail:
        'A boundary at the root blanks the whole page for one lazy panel. Scope it to the region that is actually pending so the rest of the UI stays interactive, and make the fallback roughly the size of what replaces it so nothing jumps.',
      pitfall: 'A tiny spinner standing in for a 600px chart causes a layout shift the moment it resolves.',
    },
    {
      title: 'Add an error boundary — Suspense will not catch this',
      excerpt: { from: "</LoadErrorBoundary>", lines: 5 },
      detail:
        'A failed chunk load throws. Suspense handles pending, not rejected, so without a boundary the throw unmounts the tree. The common cause is not an exception in your code — it is a deploy replacing hashed files under an open tab, producing ChunkLoadError.',
      pitfall: 'Offer a reload rather than a generic error. For a stale-chunk failure a reload genuinely fixes it, and anything else strands the user.',
    },
    {
      title: 'Use a transition when you would rather not show the fallback',
      detail:
        'Inside a transition React keeps the current UI on screen while the new one loads, and gives you isPending to show a subtle indicator instead of tearing the page down to a skeleton.',
    },
  ],
  graded: [
    { point: 'You split at route boundaries first', why: 'That is where the payoff is. Splitting a small component adds a network round trip to save a couple of kilobytes, which is usually a net loss.' },
    { point: 'Suspense is paired with an error boundary', why: 'Suspense covers only the pending state. Without a boundary, a chunk that 404s after a deploy blanks the app — and that is a routine event, not an edge case.' },
    { point: 'The boundary is scoped, and the fallback is sized', why: 'A root-level boundary makes one lazy panel blank the page; an unsized fallback trades a loading state for a layout shift.' },
    { point: 'You know the default-export requirement', why: 'It is the first thing that breaks when someone adopts React.lazy in a codebase full of named exports, and the fix is not obvious from the error message.' },
  ],
};

const displayJsonProp: BuildExplanation = {
  kind: 'build',
  problem: 'Display Data from a JSON Prop',
  problemStatement:
    'You are handed a JSON blob, pass it to a component as a prop, and render what is asked for. It is short enough that the interviewer is grading habits rather than difficulty.',
  buildOrder: [
    {
      title: 'Destructure the prop at the signature',
      excerpt: { from: "function TeamDirectory({ data }) {", lines: 3 },
      detail:
        'Destructuring documents what the component consumes right where a reader looks for it, and the defaults mean a missing field produces an empty list rather than a crash on .map.',
      pitfall: 'Reaching through props.data.members.length in JSX gives you a TypeError the first time the shape is not what you assumed, and no clue which link in the chain was missing.',
    },
    {
      title: 'Key by identity, never by index',
      excerpt: { from: "{members.map(({ id, name, role, location }) => (", lines: 3 },
      detail:
        'The key tells React which item is which across renders. An index says "the thing in position 3", so inserting at the top renumbers everything and React reuses the wrong DOM nodes — losing input state and animation position.',
      pitfall: 'Index keys look completely correct until the list is reordered or filtered, which is why this is such a reliable interview probe.',
    },
    {
      title: 'Derive the count rather than storing it',
      excerpt: { from: "{members.length} {members.length === 1 ? 'member' : 'members", lines: 3 },
      detail:
        'Anything computable from props during render should be computed, not held in state. State would need syncing on every data change and can be wrong; a derived value cannot.',
    },
    {
      title: 'Handle empty before you handle full',
      excerpt: { from: "if (members.length === 0) {", lines: 3 },
      detail:
        'An empty array renders as nothing at all, which looks identical to a broken component. An explicit empty state is the difference between "there is no data" and "something failed".',
      pitfall: 'This is the step most candidates skip, and it is noticed precisely because it takes one line.',
    },
  ],
  graded: [
    { point: 'A stable key that is not the array index', why: 'It is the most reliable signal in this exercise. Index keys pass a static demo and break on the first insertion, so interviewers use it to tell recall from understanding.' },
    { point: 'Props destructured, access defensive', why: 'It shows you write components that state their contract and fail readably when the data does not match, rather than crashing three levels into a JSX expression.' },
    { point: 'The empty state exists', why: 'Most candidates render only the happy path. Handling empty unprompted signals you think about what the user sees when the data is not there.' },
    { point: 'Counts are derived, not stored', why: 'Duplicating derivable data in state is the root of a whole class of out-of-sync bugs, and it is the same instinct that leads to storing filtered lists in state later on.' },
  ],
};

const jsonApiFetch: BuildExplanation = {
  kind: 'build',
  problem: 'JSON → API → React fetch',
  problemStatement:
    'Serve a JSON file from an endpoint and render it in React. The interesting half is on the client: every state the request can be in, and the two races that make naive fetching wrong.',
  buildOrder: [
    { title: 'Model the request as one status, not three booleans', excerpt: { from: "const [state, setState] = React.useState({ status: 'loading'", lines: 3 }, detail: 'isLoading plus isError can represent states that cannot happen — both true, or both false with no data. A single field makes the impossible combinations unrepresentable and the render a clean switch.', pitfall: 'Three booleans is how you end up with a spinner and an error message on screen at the same time.' },
    { title: 'Throw on a non-2xx response yourself', excerpt: { from: "if (!res.ok) throw new Error(`HTTP ${res.status}`);", lines: 3 }, detail: 'fetch rejects only on network failure. A 500 with an HTML error page resolves perfectly happily, and .json() then throws something unrelated about an unexpected token — or worse, parses and you render garbage.', pitfall: 'This catches more real bugs than any other line in the function, and it is absent from most first drafts.' },
    { title: 'Abort on cleanup, and do not treat the abort as an error', excerpt: { from: "if (err.name === 'AbortError') return;", lines: 8 }, detail: 'Without this, changing the URL leaves the old request running — so a slow first response can land after a fast second one and overwrite it. The AbortError guard stops your own cleanup rendering as a failure.', pitfall: 'Showing "Something went wrong" every time the user navigates away quickly is the signature of a missing AbortError check.' },
    { title: 'Render every branch, including empty', excerpt: { from: "if (status === 'loading') return <p style={{ color: '#888' }", lines: 4 }, detail: 'Four outcomes, four branches. Empty is distinct from loading and from error, and conflating them is what produces a blank panel with no explanation.' },
  ],
  graded: [
    { point: 'Four states, not one: loading, error, empty, success', why: 'Most candidates render only success. The others are where real users spend their frustrating moments, and each needs a different thing from the UI.' },
    { point: 'You know fetch does not reject on HTTP errors', why: 'It is the most common misconception about fetch, and it means a 500 renders as success. The `if (!res.ok) throw` line is the whole fix.' },
    { point: 'AbortController on cleanup, with AbortError excluded', why: 'It fixes the out-of-order race and the state-update-after-unmount warning at once. Half the implementation — aborting but reporting the abort as an error — is worse than neither.' },
    { point: 'You say this belongs in TanStack Query in production', why: 'Caching, dedup, retries and stale-while-revalidate are exactly the things a hand-rolled hook gets wrong over time. Writing it by hand is the exercise; shipping it by hand is the mistake.' },
  ],
};

const fetchUsersApi: BuildExplanation = {
  kind: 'build',
  problem: 'Fetch Users from an API',
  problemStatement:
    'Call a real endpoint — jsonplaceholder.typicode.com/users — and render the list, handling every state the request can be in, with a retry when it fails. This one actually hits the network, so every state is reachable.',
  buildOrder: [
    { title: 'Name the states before writing the request', excerpt: { from: "const [users, setUsers] = useState([]);", lines: 3 }, detail: 'Four outcomes are possible — loading, failed, succeeded-but-empty, succeeded-with-data — and each needs something different on screen. One status field makes them mutually exclusive.', pitfall: 'Rendering only the success path is the most common omission, and an interviewer checks it by throttling the network.' },
    { title: 'With fetch, check res.ok yourself', excerpt: { from: "fetch(API, { signal: ac.signal })", lines: 5 }, detail: 'fetch rejects only on a network failure. A 404 or a 500 resolves with ok === false, so without the check you carry on and try to parse an error page as JSON.', pitfall: 'The symptom is an error about an unexpected token that points nowhere near the actual problem.' },
    { title: 'Abort on cleanup, and make retry go through the same path', excerpt: { from: "return () => ac.abort();", lines: 3 }, detail: 'The cleanup cancels an in-flight request when the component unmounts or before a retry, which removes both the update-after-unmount warning and the out-of-order race. Driving retry through the same effect means it inherits all of that for free.', pitfall: 'A retry that calls fetch directly, outside the effect, bypasses the cancellation you just built.' },
    { title: 'Key from the data, and render the four branches', excerpt: { from: "{users.map(u => (", lines: 3 }, detail: 'u.id is right there in the response, so there is no excuse for an index key. Each of loading, error, empty and success gets its own return, which keeps the render flat and readable.' },
  ],
  graded: [
    { point: 'All four request states are rendered', why: 'Loading, error, empty and success each need something different, and empty is distinct from both loading and failure. A blank panel with no explanation is what the user gets when they are conflated.' },
    { point: 'You know fetch resolves on 4xx and 5xx', why: 'It is the defining gotcha of the API and the reason `if (!res.ok) throw` exists. Someone who omits it has usually only called endpoints that worked.' },
    { point: 'A failed request is recoverable without a page reload', why: 'A retry button is the difference between a dead end and a transient problem. Routing it through the same effect keeps cancellation intact.' },
    { point: 'A stable key from the data', why: 'Falling back to the array index in a list that will eventually be sorted or filtered is the habit this exercise is watching for.' },
  ],
};

const pagination: BuildExplanation = {
  kind: 'build',
  problem: 'Pagination',
  problemStatement:
    'Fetch and display one page at a time, with prev/next and numbered controls, a loading state, and the current page marked. The controls are easy; the edges and the accessibility are what is being watched.',
  buildOrder: [
    { title: 'Make the page number the single source of truth', excerpt: { from: "const [page, setPage] = React.useState(1);", lines: 3 }, detail: 'Everything else — which items to show, whether prev is disabled, which button is active — derives from page and total. Storing the current slice in state as well gives you two things that can disagree.', pitfall: 'Clamp when total changes. Filtering down to two pages while sitting on page 7 leaves you on an empty page with no obvious way back.' },
    { title: 'Fetch on page change, and cancel the previous request', excerpt: { from: "}, [page]);", lines: 5 }, detail: 'Clicking 3 then 4 quickly can land page 3 last and show the wrong content under a "4" highlight. Aborting the superseded request removes the race.', pitfall: 'Blanking the list while loading makes the page jump. Keeping the old rows dimmed preserves scroll position and reads as faster.' },
    { title: 'Disable the edges rather than hiding them', excerpt: { from: "<button disabled={page === 1} onClick={() => setPage(p => p ", lines: 3 }, detail: 'A disabled control keeps the layout stable and tells the user where they are. Removing it shifts everything sideways at the boundaries.', pitfall: 'Disabling is not enough on its own — guard the handler too, or a fast double-click can still push page past the end.' },
    { title: 'Make the control set announce itself',  detail: 'aria-current is what tells a screen reader which page is active; a coloured background says nothing. Wrapping in a labelled nav lets users jump straight to it.' },
  ],
  graded: [
    { point: 'Page is the only state; everything else derives', why: 'Storing the visible slice too is how the highlight and the content drift apart. The derived version cannot enter that state.' },
    { point: 'Out-of-order responses are handled', why: 'Any paged fetch has this race. Clicking through pages quickly is the first thing an interviewer tries, and the wrong-content-under-the-right-number bug is immediately visible.' },
    { point: 'Boundaries are handled in state, not just visually', why: 'Disabled buttons plus a guarded handler plus clamping on a total change — miss any one and there is a route to an empty page.' },
    { point: 'aria-current marks the active page', why: 'Without it the component is unusable without sight of the highlight, and it is a one-attribute fix that most implementations omit.' },
  ],
};

const searchFilter: BuildExplanation = {
  kind: 'build',
  problem: 'Search Filter',
  problemStatement:
    'Filter a list as the user types, then answer the follow-up every interviewer asks: "now add debouncing". The template shows both side by side with counters, because the honest answer is that this list does not need it.',
  buildOrder: [
    { title: 'Store the query, derive the results', excerpt: { from: "const filtered = useMemo(() => {", lines: 7 }, detail: 'The filtered list is a function of the query and the data, so it belongs in the render path. Putting it in state means an effect to keep it in sync, one render where the two disagree, and a stale list whenever the source data changes.', pitfall: 'setFiltered inside a useEffect watching query is the canonical "you did not need an effect" mistake, and it re-renders twice per keystroke.' },
    { title: 'When asked to debounce, debounce the VALUE', excerpt: { from: "const [query, setQuery] = useState(\"\");", lines: 3 }, detail: 'The field stays controlled by the immediate state so typing is never laggy; only the value that triggers the expensive work trails behind. Debouncing the input itself is the version that makes a search box feel broken.', pitfall: 'While the debounce is pending, the list on screen belongs to an older query — say so with a "waiting…" hint rather than presenting stale results as current.' },
    { title: 'The cleanup is the algorithm', excerpt: { from: "useEffect(() => {", lines: 4 }, detail: 'That return is not tidy-up — it is the debounce. Each render with a new value tears down the previous timer before setting a new one, so only the final keystroke of a burst survives to fire.' },
    { title: 'Say why this list does not need it', detail: 'Filtering twelve local objects costs about 0.0025 ms; a frame is 16.67 ms. A 400 ms debounce adds 400 ms of lag to save a fraction of a microsecond — the counters in the template make that visible. Debouncing belongs where a keystroke costs something you do not control, usually a network request.', pitfall: 'For expensive local RENDERING — tens of thousands of rows — the answer is useDeferredValue, not debounce: it yields on real work rather than a guessed timer.' },
  ],
  graded: [
    { point: 'The filtered list is derived, never stored', why: 'This is the real subject of the question. Storing it is the mistake that generalises into a whole category of sync bugs, and the React docs call it out explicitly.' },
    { point: 'You debounce the value and not the input', why: 'It is what keeps typing instant. Debouncing the controlled value is a common misreading and makes the component feel worse than no debounce at all.' },
    { point: 'You can say when debouncing is NOT warranted', why: 'Applying it to a local filter shows pattern-matching; explaining that it belongs where the keystroke costs a request shows judgement, which is what the follow-up is testing.' },
    { point: 'Debouncing is not confused with cancellation', why: 'It reduces how many requests you send and says nothing about the order they return in. A slow response for an earlier query can still overwrite a later one — that needs an AbortController.' },
  ],
};

const chatApp: BuildExplanation = {
  kind: 'build',
  problem: 'Chat App',
  problemStatement:
    'Send messages, switch between users, and keep the newest message in view. The list-management is routine; the scroll behaviour and the message identity are where this is won or lost.',
  buildOrder: [
    { title: 'Give every message an id at creation, not at render', excerpt: { from: "setMessages(prev => [...prev, {", lines: 3 }, detail: 'The id is the React key and, later, the thing you reconcile a server response against. Generating it when the message is created means the optimistic row and the confirmed row are the same row.', pitfall: 'Keying by index means every insertion reorders the keys, so React reuses the wrong DOM nodes and a half-typed edit jumps to a different message.' },
    { title: 'Append with a functional update', excerpt: { from: "setMessages(prev => [...prev, {", lines: 3 }, detail: 'A bot reply arriving from a setTimeout closes over the messages array as it was when the timer was scheduled. The functional form always reads current state, so two replies landing close together cannot overwrite each other.', pitfall: 'This is the stale-closure bug in its most common disguise — it only shows up when two async appends overlap.' },
    { title: 'Scroll to the bottom in a layout effect', excerpt: { from: "}, [messages]);", lines: 3 }, detail: 'useLayoutEffect runs after the DOM is updated but before the browser paints, so the user never sees the pre-scroll frame. In a plain useEffect the list visibly jumps.', pitfall: 'Auto-scrolling unconditionally yanks the view away from someone reading history. Check whether they were already near the bottom first.' },
    { title: 'Reset per-conversation state with key',  detail: 'Switching users must not carry the draft, scroll position or message list across. A key makes React discard and rebuild the subtree, which is far more reliable than an effect trying to clear each piece of state.' },
  ],
  graded: [
    { point: 'Messages have stable ids generated at creation', why: 'It is what makes keys correct, optimistic sending possible, and edits or deletes addressable. Index keys work only for an append-only list that is never filtered.' },
    { point: 'Functional updates for anything async', why: 'Any append scheduled from a timer, socket or fetch has a stale closure over state. This is the single most common React bug in real-time UI.' },
    { point: 'Auto-scroll respects the user', why: 'Always scrolling makes reading history impossible; never scrolling means new messages are missed. The near-bottom check is what every real chat client implements.' },
    { point: 'You reach for key to reset state on switch', why: 'The alternative is an effect that clears four pieces of state and forgets the fifth. Resetting by key is idiomatic and cannot go stale.' },
  ],
};

const modalComponent: BuildExplanation = {
  kind: 'build',
  problem: 'Modal Component',
  problemStatement:
    'A reusable dialog that takes arbitrary content, closes on the backdrop, the close button and Escape, and animates in and out. The reuse is the design question; the dismissal paths are the correctness one.',
  buildOrder: [
    { title: 'Take content as children, not as props', excerpt: { from: "<Modal isOpen={activeModal === \"form\"} onClose={close} title", lines: 4 }, detail: 'A body string prop forces every new use case into a new prop. Children make the modal responsible for the shell — backdrop, focus, dismissal — and the caller responsible for the content, which is the split that lets one component serve text, forms and confirmations.', pitfall: 'Passing a component type and having the modal render it re-invents children with fewer capabilities and worse types.' },
    { title: 'Render nothing when closed', excerpt: { from: "if (!isOpen) return null;", lines: 3 }, detail: 'Mounting it hidden keeps its effects running, leaves its content in the accessibility tree, and lets a hidden form field still receive Tab. Returning null is the simplest way to be sure the dialog is genuinely absent.', pitfall: 'Hiding with CSS only is why hidden modals end up in screen-reader output and in the tab order.' },
    { title: 'Close on Escape from a document listener', excerpt: { from: "return () => document.removeEventListener(\"keydown\", handleK", lines: 6 }, detail: 'Escape must work wherever focus is, which is why the listener goes on the document rather than the dialog element. The early return keeps it off entirely while closed.', pitfall: 'Omitting the cleanup leaves a listener per open, so after five opens one Escape fires onClose five times.' },
    { title: 'Separate backdrop clicks from content clicks', excerpt: { from: "{children}", lines: 5 }, detail: 'The backdrop handler would otherwise also fire for clicks that started inside the panel, so selecting text and releasing outside closes the dialog mid-action.', pitfall: 'stopPropagation fixes it but also blocks any document-level click handling the app relies on — check what else listens before reaching for it.' },
  ],
  graded: [
    { point: 'Content comes in as children', why: 'It is the difference between a reusable component and one that grows a prop per use case. Interviewers ask for "different content types" to see whether you reach for composition.' },
    { point: 'All three dismissal paths work', why: 'Escape, backdrop and the close button are what users try in that order. A dialog that only closes via its own button is the one people get stuck in.' },
    { point: 'Listeners are cleaned up and scoped to the open state', why: 'This is where the leak lives, and it compounds — every open adds another handler that never goes away.' },
    { point: 'You know what is still missing', why: 'Focus trapping, focus return, aria-modal, scroll lock and a portal are what separate this from a production dialog. Naming them — or reaching for the native <dialog> — is the senior answer.' },
  ],
};

const imageGallery: BuildExplanation = {
  kind: 'build',
  problem: 'Image Gallery + Lazy Load',
  problemStatement:
    'A responsive grid that only loads an image once it is near the viewport, with a placeholder holding the space until then. IntersectionObserver is the tool; what you observe and when you stop are the interesting parts.',
  buildOrder: [
    { title: 'Observe a per-image element, not the scroll event', excerpt: { from: "return () => observer.disconnect();", lines: 7 }, detail: 'A scroll listener fires dozens of times a second and forces a layout read on every call. The observer is asynchronous, off the main thread, and tells you exactly which elements crossed the threshold.', pitfall: 'Disconnect after the first hit. An image that stays observed keeps firing callbacks for the rest of the session for no benefit.' },
    { title: 'Start loading before it is on screen',  detail: 'Loading exactly at the viewport edge means the user watches every image appear. A margin gives the request a head start so the image is usually decoded by the time it scrolls in.', pitfall: 'Too large a margin loads the whole gallery and removes the point of lazy loading.' },
    { title: 'Reserve the space before the image exists',  detail: 'The placeholder must occupy the final dimensions, or every image that loads pushes the grid around — and in a gallery that means the item under the cursor moves as you are about to click it.', pitfall: 'Zero-height placeholders also break the observer: all of them are in view at once, so everything loads immediately.' },
    { title: 'Consider the native attribute first',  detail: 'Browsers have supported native lazy loading for years, and for a plain grid it is the whole feature in one attribute. Reach for IntersectionObserver when you need a custom placeholder, a fade-in, or analytics on what was seen.' },
  ],
  graded: [
    { point: 'IntersectionObserver rather than a scroll handler', why: 'Scroll handlers run on the main thread at high frequency and typically read layout, which is a guaranteed jank source. Knowing the purpose-built API exists is the baseline here.' },
    { point: 'The observer is disconnected', why: 'Both after a hit and on unmount. Observers hold references to elements, so leaving them connected leaks detached nodes.' },
    { point: 'Space is reserved before load', why: 'Otherwise you have traded bandwidth for layout shift, and in a grid that is worse — every row moves as images resolve.' },
    { point: 'You mention loading="lazy" exists', why: 'Reaching straight for an observer when one attribute would do is over-engineering, and the follow-up is always "could the platform do this?".' },
  ],
};

const dragAndDrop: BuildExplanation = {
  kind: 'build',
  problem: 'Drag and Drop',
  problemStatement:
    'Reorder items inside a list and move them between two lists, with visible feedback while dragging. The HTML drag-and-drop API is quirky by design — the graded part is moving data immutably and keeping the drop target obvious.',
  buildOrder: [
    { title: 'Carry the identity of what is being dragged',  detail: 'This template keeps the dragged item in React state — `setDragItem({ ...item, source })` on dragStart — which is the simplest thing that works inside one component, and it is what makes the opacity and highlight below possible. The platform alternative is `e.dataTransfer.setData(...)`, which survives drags between windows and between apps.', pitfall: 'dataTransfer is deliberately NOT readable during dragover, only on drop — which is exactly why a component that needs to style the target while dragging ends up keeping its own state anyway, as this one does.' },
    { title: 'preventDefault on dragover, or nothing can drop', excerpt: { from: "onDragOver={e => { e.preventDefault(); setDragOver(listId); ", lines: 3 }, detail: 'The default behaviour of a dragover is to reject the drop. Calling preventDefault is what marks an element as a valid target — it is the single most common reason a drag-and-drop implementation silently does nothing.', pitfall: 'dragleave fires when the pointer crosses into a child too, so a naive handler flickers the highlight. Count enter/leave pairs or check relatedTarget.' },
    { title: 'Move immutably — remove, then insert', excerpt: { from: "else setDone(prev => prev.filter(i => i.id !== item.id));", lines: 6 }, detail: 'Splicing the existing arrays mutates state React is still holding, so the re-render may not happen or may render a half-moved list. Build new arrays and hand them back.', pitfall: 'When source and target are the same list, remove before computing the insert index or the item lands one position off.' },
    { title: 'Make the target obvious while dragging', excerpt: { from: "opacity: dragItem?.id === item.id ? 0.5 : 1,", lines: 3 }, detail: 'Dimming the source and outlining the target is the minimum feedback that makes a drop predictable. Without it the user is guessing where the item will land.' },
  ],
  graded: [
    { point: 'preventDefault on dragover', why: 'Without it the drop event never fires and everything else you wrote is unreachable. It is the first thing to check when a drag silently does nothing.' },
    { point: 'State is moved immutably', why: 'splice on the array in state is the mutation bug in its most tempting form — the data looks right in the console and the UI does not update.' },
    { point: 'Feedback during the drag', why: 'A drag with no indication of the target is a guess. Interviewers ask for visual feedback because it is the part that gets skipped.' },
    { point: 'You flag that this is not accessible on its own', why: 'Native HTML drag-and-drop is mouse-only. A production implementation needs a keyboard path — or a library like dnd-kit that provides one — and saying so is the mark of someone who has shipped it.' },
  ],
};

const productListSortFilter: BuildExplanation = {
  kind: 'build',
  problem: 'Product List Sort & Filter',
  problemStatement:
    'Sort by price or rating in either direction, filter by category and price range, show which filters are active and offer a way to clear them. Several controls feeding one derived list — designing that pipeline is the exercise.',
  buildOrder: [
    { title: 'Hold the controls in state; derive the list', excerpt: { from: "const [category, setCategory] = React.useState(\"all\");", lines: 3 }, detail: 'Three small pieces of control state, one derived result. The alternative — keeping a visibleProducts array in state — needs an effect that watches all three and will eventually miss one.', pitfall: 'Grouping the controls into a useReducer pays off as soon as one change has to reset another, which is where filter combinations usually go wrong.' },
    { title: 'Filter first, then sort, and never sort in place', excerpt: { from: "const filtered = React.useMemo(() => {", lines: 6 }, detail: 'Filtering first means sorting a smaller array. The spread is load-bearing: Array.prototype.sort mutates, so sorting the source would reorder the prop you were given and make the result depend on render order.', pitfall: 'Default sort compares strings, so [10, 9, 100] becomes [10, 100, 9]. A numeric comparator is required, not optional.' },
    { title: 'Show what is active, and make each one removable', excerpt: { from: "<button onClick={clearFilters}", lines: 4 }, detail: 'Filter state that is not visible is how users end up staring at an empty list convinced the data is broken. Chips make the current state legible and each one individually reversible.', pitfall: 'Clear-all must reset every dimension. The forgotten one is the filter the user cannot find.' },
    { title: 'Treat the empty result as a state with a way out', excerpt: { from: "{filtered.length === 0 ? (", lines: 3 }, detail: 'It is the state combinations of filters reliably produce, and an empty grid tells the user nothing about why or what to do next.' },
  ],
  graded: [
    { point: 'One derived list from several pieces of control state', why: 'It is the scalable shape: adding a fourth filter is one more clause, not another effect to keep in sync. Storing the result instead is where multi-filter UIs rot.' },
    { point: 'sort() is not called on the source array', why: 'It mutates in place, so sorting props or state directly is a real bug that hides behind a UI that looks correct until something else re-renders.' },
    { point: 'A numeric comparator', why: 'The default lexicographic sort on numbers is one of the most reliable traps in JavaScript, and it produces plausible-looking wrong output.' },
    { point: 'Active filters are visible and clearable', why: 'Interviewers ask for it explicitly because hidden filter state is the most common usability failure in this component.' },
  ],
};

const responsiveNavbar: BuildExplanation = {
  kind: 'build',
  problem: 'Responsive Navbar',
  problemStatement:
    'A full menu on desktop that collapses to a hamburger on mobile, with a slide-in panel and the current page marked. Most of this is CSS — the parts worth React are the open state and the keyboard behaviour.',
  buildOrder: [
    { title: 'Let CSS decide the layout, not JavaScript',  detail: 'A media query responds the moment the viewport changes, with no listener and no re-render. Tracking window.innerWidth in state re-renders the tree on every resize frame and is wrong on the first paint during SSR.', pitfall: 'This template toggles a menuOpen flag and lets layout follow from it. If you genuinely need the breakpoint as a value in JavaScript, `matchMedia` is the right tool — a resize listener is not.' },
    { title: 'Keep one piece of state: is the mobile menu open', excerpt: { from: "<button onClick={() => setMenuOpen(m => !m)}", lines: 4 }, detail: 'aria-expanded communicates the state to assistive technology and aria-controls links the button to the panel it toggles. An icon-only button also needs an accessible name, which is why the hidden label flips with the state.', pitfall: 'A static label like "Menu" announces the same thing open or closed, which is worse than no label at all.' },
    { title: 'Close it when navigation happens',  detail: 'Tapping a link in a single-page app changes the route without unmounting the navbar, so the panel stays over the page the user just asked for. Closing on pathname change is the fix.', pitfall: 'Escape should close it too, and focus should return to the hamburger — otherwise keyboard users are left in a panel that is no longer visible.' },
    { title: 'Mark the current page semantically',  detail: 'The template marks the active link with a background colour only. The missing piece — and the thing to add unprompted — is `aria-current="page"`: it is the semantic marker, and the colour is presentation layered on top. Styling alone leaves the state invisible to anyone not looking at it.' },
  ],
  graded: [
    { point: 'The breakpoint lives in CSS', why: 'Reaching for a resize listener is the tell that someone reaches for JavaScript first. It costs re-renders on every frame of a drag-resize and is wrong before hydration.' },
    { point: 'aria-expanded and an accessible name on the toggle', why: 'An icon-only button with no name announces as "button", and without aria-expanded the user cannot tell whether pressing it will open or close anything.' },
    { point: 'The menu closes on navigation and on Escape', why: 'Leaving it open over the new page is the bug every user hits immediately, and it is two lines to fix.' },
    { point: 'Focus is managed when the panel opens and closes', why: 'A slide-in panel that leaves focus behind means Tab walks through the page underneath. Moving focus in and returning it on close is what makes it usable without a mouse.' },
  ],
};

const infiniteScroll: BuildExplanation = {
  kind: 'build',
  problem: 'Infinite Scroll',
  problemStatement:
    'Load the next page as the user approaches the bottom, using an observer rather than a scroll handler, with an end state and — the half most implementations skip — a failure state with a retry.',
  buildOrder: [
    { title: 'Observe a sentinel below the list',  detail: 'An empty element after the last item is what the observer watches. It is simpler and cheaper than measuring scrollTop against scrollHeight, and it keeps working when the container is not the window.', pitfall: 'If the sentinel has zero height inside a flex container it can end up permanently intersecting, which fires the loader in a loop.' },
    { title: 'Guard the trigger on every state that should stop it', excerpt: { from: "([entry]) => { if (entry.isIntersecting) loadMore(); },", lines: 3 }, detail: 'Four conditions, and each prevents a different failure: re-entering while a request is in flight, fetching past the end, and — the important one — retrying in a tight loop while an error is on screen and the sentinel is still visible.', pitfall: 'Omitting the error guard turns one failed request into a self-inflicted request storm against a server that is already unhappy.' },
    { title: 'Distinguish "no more data" from "it broke"',  detail: 'To a user, a list that silently stops loading looks exactly like a list that has ended. That makes a swallowed error a much worse bug here than elsewhere — they never know to retry.', pitfall: 'Clearing the error is enough to retry: the observer fires again because the sentinel is still on screen, so no separate fetch call is needed.' },
    { title: 'Re-observe when the dependencies change', excerpt: { from: "return () => observer.disconnect();", lines: 5 }, detail: 'The callback closes over loading, hasMore and error, so it has to be rebuilt when they change — wrap it in useCallback and let the effect re-run. Otherwise the observer keeps calling a stale function that thinks it is still loading.' },
  ],
  graded: [
    { point: 'IntersectionObserver rather than a scroll listener', why: 'Scroll handlers fire at high frequency on the main thread and typically read layout. The observer is the purpose-built API and it is what the question is checking for.' },
    { point: 'The failure path exists and is recoverable', why: 'This is the part most implementations skip entirely. Silently stopping is indistinguishable from reaching the end, so the user never retries and simply thinks the list was short.' },
    { point: 'The trigger is guarded against re-entry and error loops', why: 'Without the loading guard, one scroll fires several page loads; without the error guard, one failure becomes a request storm. Both are visible immediately in the network panel.' },
    { point: 'You mention virtualisation as the next step', why: 'Infinite scroll grows the DOM without bound — ten thousand rows will be slow no matter how well the loading works. Pairing it with windowing is the answer for a real list.' },
  ],
};

const notifications: BuildExplanation = {
  kind: 'build',
  problem: 'Notifications',
  problemStatement:
    'A toast system: several types, stacked, auto-dismissing after a timeout, each manually dismissible. It arrives from anywhere in the app, so the API design matters as much as the rendering.',
  buildOrder: [
    { title: 'Own the queue in one provider', excerpt: { from: "const dismiss = React.useCallback((id) => {", lines: 4 }, detail: 'Any component can call useToast().push(...) without threading props. Exporting the hook rather than the context means consumers cannot accidentally use it outside the provider, and you can add a helpful error there.', pitfall: 'Memoise the context value, or every provider re-render re-renders every consumer in the app.' },
    { title: 'Give each toast its own timer, and clear it', excerpt: { from: "const dismiss = React.useCallback((id) => {", lines: 5 }, detail: 'Putting the timer inside the toast component means it is created and cleaned up with the toast itself. One shared timer in the provider has to be rescheduled every time the queue changes, which is where double-dismissals come from.', pitfall: 'Errors usually should not auto-dismiss. A message the user needs to act on disappearing after four seconds is a real accessibility problem.' },
    { title: 'Announce them without stealing focus',  detail: 'A toast that is only visual is invisible to a screen reader. polite queues the announcement until the user is idle; assertive interrupts, which is right for errors and wrong for everything else.', pitfall: 'Moving focus to the toast is worse than not announcing it — it yanks the user out of whatever they were typing.' },
    { title: 'Bound the stack',  detail: 'A burst of events otherwise fills the screen with toasts and covers the UI they describe. Keeping the most recent few is almost always the right behaviour.' },
  ],
  graded: [
    { point: 'The API is a hook, callable from anywhere', why: 'Toasts are triggered from event handlers deep in the tree. A component you have to render locally with props threaded to it defeats the purpose.' },
    { point: 'Timers are per-toast and cleaned up', why: 'A shared timer rescheduled on every queue change is how toasts dismiss early, dismiss twice, or never dismiss. The cleanup is also what makes a manual dismiss safe.' },
    { point: 'Live regions, with the right politeness', why: 'This is the accessibility half of the component and it is usually missing entirely. Getting assertive-for-errors and polite-for-everything-else right shows you know what the attribute does.' },
    { point: 'The context value is memoised and the stack is bounded', why: 'Without memoisation the provider re-renders the whole app on every toast; without a bound, a burst of events hides the page behind its own notifications.' },
  ],
};

const starRating: BuildExplanation = {
  kind: 'build',
  problem: 'Star Rating',
  problemStatement:
    'Five stars, click to set a value, hover to preview it. Small enough that the interviewer is looking at two things: how you model the preview, and whether it works without a mouse.',
  buildOrder: [
    { title: 'Keep the committed value and the preview separate', excerpt: { from: "const [rating, setRating] = React.useState(0);", lines: 3 }, detail: 'Two pieces of state with one derived display value. Writing the hover value into rating and restoring it on mouse-out means an interrupted interaction — the pointer leaving the window mid-hover — leaves the wrong rating committed.', pitfall: '`hover || rating` treats 0 as "not hovering", which is what you want when there is no zeroth star. Clearing to zero by hover would need an explicit null instead.' },
    { title: 'Reset the preview on the container, not per star', excerpt: { from: "onMouseLeave={() => setHover(0)}", lines: 5 }, detail: 'Per-star mouse-leave handlers fight each other as the pointer crosses between stars, producing a flicker. One handler on the wrapper fires only when the pointer leaves the whole control.' },
    { title: 'Make it a real form control', excerpt: { from: "<StarRating onChange={setRating} />", lines: 6 }, detail: 'Radio inputs give you arrow-key navigation, focus, form participation and the correct announcement for free. A row of divs with click handlers gives you none of it and has to reimplement all four.', pitfall: 'Hiding the input with display:none removes it from the tab order entirely — use a visually-hidden class that keeps it focusable.' },
    { title: 'Mirror hover with focus', excerpt: { from: "onMouseLeave={() => setHover(0)}", lines: 3 }, detail: 'A keyboard user arrowing through the stars should see the same preview a mouse user gets. It is two handlers, and without them the control is usable but silent about what it is about to do.' },
  ],
  graded: [
    { point: 'Preview and committed value are separate state', why: 'Overwriting the rating on hover and restoring on leave is the version that loses the user\'s actual rating when the pointer exits unexpectedly.' },
    { point: 'It works from the keyboard', why: 'A rating is an input. Built from divs it cannot be reached by Tab, set by arrow keys, or submitted with a form — and that is what the follow-up question will be.' },
    { point: 'Each star has an accessible name', why: 'A screen reader must announce "3 stars", not "button". Marking the glyph aria-hidden and labelling the input is how you get exactly one sensible announcement.' },
    { point: 'Mouse-leave is handled once, on the container', why: 'Per-star handlers produce a visible flicker as the pointer crosses boundaries — a small detail, but the one that shows whether you ran it.' },
  ],
};

const tabs: BuildExplanation = {
  kind: 'build',
  problem: 'Tabs',
  problemStatement:
    'Tabs built as compound components — <Tabs>, <Tabs.Tab>, <Tabs.Panel> — sharing state through context so the consumer composes the markup and the library wires up the behaviour.',
  buildOrder: [
    { title: 'Put the shared state in a context owned by the parent', excerpt: { from: "const [active, setActive] = React.useState(defaultIndex);", lines: 6 }, detail: 'Context is what lets the children be arbitrarily nested inside the consumer\'s own markup. The alternative — a tabs={[...]} array prop — means every layout variation becomes a new prop on your component.', pitfall: 'Without useMemo the value object is new every render, so every tab and panel re-renders on any parent update.' },
    { title: 'Every part must RETURN its JSX', excerpt: { from: "Tabs.Tab = function Tab({ index, children }) {", lines: 4 }, detail: 'React 19 allows a component to return undefined, and renders nothing — silently. React 18 threw "Nothing was returned from render" and named the component. A missing return is now an invisible empty subtree rather than an error.', pitfall: 'Destructuring setActive and never wiring onClick is the other half of the same slip: the tab renders but does nothing.' },
    { title: 'Wire the ARIA relationships',  detail: 'The ids connect a tab to the panel it controls in both directions. aria-selected is the state; the styling is a consequence of it, not a substitute.', pitfall: 'This template does not generate ids at all, which is the gap to name: real tabs need `useId` so two instances on one page do not share ids and point at the wrong panel.' },
    { title: 'Implement roving tabindex for the keyboard',  detail: 'The expected behaviour is one Tab stop for the whole tablist, with arrows moving between tabs. That is what tabIndex={-1} on the inactive tabs buys you, and why the pattern is called roving tabindex.', pitfall: 'Leaving every tab tabbable means a ten-tab bar costs ten Tab presses to get past — technically operable, practically not.' },
  ],
  graded: [
    { point: 'Compound components with context, not a config array', why: 'It is the whole point of the question. The array version cannot express "a tab with an icon and a badge" without growing a prop for each, which is the flexibility problem the pattern solves.' },
    { point: 'The context value is memoised', why: 'Otherwise every consumer re-renders whenever the provider does, which is the standard Context performance trap and the thing this pattern is accused of.' },
    { point: 'Roving tabindex, with arrow keys and Home/End', why: 'It is the documented ARIA tabs pattern and the difference between "has role attributes" and "actually works from the keyboard".' },
    { point: 'ids come from useId', why: 'Hard-coded or counter-based ids collide when the component is used twice on a page, and the mis-association is invisible until someone uses a screen reader.' },
  ],
};

const accordion: BuildExplanation = {
  kind: 'build',
  problem: 'Accordion',
  problemStatement:
    'Expand and collapse panels, supporting both a single-open mode that behaves like radio buttons and a multi-open mode. One prop changes the state model, which is the design decision worth getting right.',
  buildOrder: [
    { title: 'Pick a state shape that covers both modes', excerpt: { from: "const next = new Set(prev);", lines: 8 }, detail: 'A Set handles both cases without a second state shape — single-open is simply a Set that never holds more than one. Branching between a number and an array instead means two code paths through every render.', pitfall: 'Always return a new Set. Mutating and returning the same reference means React sees no change and skips the re-render.' },
    { title: 'Consider whether the platform already does this',  detail: '<details> and <summary> give you the disclosure behaviour, the keyboard support and the correct semantics with no JavaScript. Reach for a custom build when you need single-open coordination, animation, or controlled state — and say that is why.' },
    { title: 'Use a button, and connect it to its region',  detail: 'The heading provides document structure so users can navigate by heading; the button inside it is what is focusable and announces the expanded state. The panel points back at its header so its purpose is announced when entered.', pitfall: 'A div with onClick is not focusable and does not respond to Enter or Space. Using a real button removes three problems at once.' },
    { title: 'Unmount closed content, unless you are animating it',  detail: 'Content hidden with CSS alone remains focusable and readable by screen readers — a closed panel whose links are still in the tab order is a common bug.', pitfall: 'If you animate height you have to keep it mounted; then use inert or toggle hidden after the transition so it is not reachable while closed.' },
  ],
  graded: [
    { point: 'One state shape serves both modes', why: 'The naive version keeps an index for single mode and an array for multiple, and the toggle logic forks. A Set collapses that into one path and makes allowMultiple genuinely a prop.' },
    { point: 'The trigger is a button with aria-expanded', why: 'Focusability, Enter and Space, and the announced state all come from using the right element. It is also the answer to "why not a div?", which is the usual follow-up.' },
    { point: 'Closed content is genuinely hidden', why: 'Hiding with opacity or height leaves links tabbable inside a collapsed panel, so keyboard focus disappears into invisible content.' },
    { point: 'You mention <details>', why: 'Knowing when the platform already solves the problem is part of the judgement being tested, and it reframes the custom build as a deliberate choice rather than a default.' },
  ],
};

const otpInput: BuildExplanation = {
  kind: 'build',
  problem: 'OTP Input',
  problemStatement:
    'Six single-character boxes that auto-advance as you type, step back on backspace, accept digits only, and distribute a pasted code across all six. Almost all the difficulty is in focus movement and paste.',
  buildOrder: [
    { title: 'One array of values, one array of refs', excerpt: { from: "const refs = React.useRef([]);", lines: 3 }, detail: 'The refs array is how you move focus between boxes imperatively — one of the cases where focus genuinely is imperative and a ref is the right tool rather than an escape hatch.', pitfall: 'In React 19 a ref callback that returns a value is treated as a cleanup function, so the arrow needs a block body, not `el => refs.current[i] = el`.' },
    { title: 'Filter input, then advance', excerpt: { from: "refs.current[i - 1]?.focus();", lines: 4 }, detail: 'Taking the last character rather than the first means typing over a filled box replaces it, which is what users expect. The optional chaining handles the final box, where there is nothing to advance to.', pitfall: 'inputMode="numeric" brings up the number pad on mobile; type="number" brings spinners and lets in "e" and "-".' },
    { title: 'Backspace has two behaviours', excerpt: { from: "refs.current[i - 1]?.focus();", lines: 5 }, detail: 'Clearing a filled box, then stepping back from an empty one, is what makes deleting a wrong code feel right. Doing both at once skips a digit.', pitfall: 'Handle arrow keys too — without it, Left and Right move the caret inside a one-character box and appear to do nothing.' },
    { title: 'Handle paste as a whole-code event', excerpt: { from: "const pasted = e.clipboardData.getData(\"text\").replace(/\\D/g", lines: 3 }, detail: 'Copying the code from an SMS is how most people enter it, so without this the component fails its most common real interaction — a six-character paste lands entirely in box one.', pitfall: 'Strip non-digits first: codes are routinely copied as "123 456" or with a trailing newline.' },
  ],
  graded: [
    { point: 'Paste works across all six boxes', why: 'It is the primary way users enter an OTP and the requirement most candidates skip. Testing it is the first thing an interviewer does.' },
    { point: 'Backspace distinguishes clearing from stepping back', why: 'Doing both in one press deletes two digits, which makes correcting a typo infuriating. It is a two-line branch that shows you actually used it.' },
    { point: 'Digits are enforced, with the right mobile keyboard', why: 'inputMode="numeric" and a regex filter are the correct pair. type="number" is the plausible-looking wrong answer — it permits "e", "+" and "-" and adds spinners.' },
    { point: 'Refs are used deliberately for focus', why: 'Focus management is one of the legitimate uses of a ref. Knowing that — rather than trying to express it through state — is what the exercise is probing.' },
  ],
};

const ticTacToe: BuildExplanation = {
  kind: 'build',
  problem: 'Tic-Tac-Toe',
  problemStatement:
    'A 3x3 grid, two players alternating, winner detection across rows, columns and diagonals, a draw, and a reset. Deliberately easy, so the interviewer can watch what you store versus what you compute.',
  buildOrder: [
    { title: 'Store the board and whose turn it is — nothing else', excerpt: { from: "const [xIsNext, setXIsNext] = React.useState(true);", lines: 3 }, detail: 'A flat array of nine is easier to check and to reset than nested rows. Everything else — the winner, whether it is a draw, the status line — is a function of these two.', pitfall: 'Storing `winner` in state means updating it on every move and keeping it in sync with the board. Deriving it cannot go stale.' },
    { title: 'Derive the winner from the eight lines', excerpt: { from: "if (squares[a] && squares[a] === squares[b] && squares[a] ==", lines: 4 }, detail: 'Eight lines as data rather than an if-chain. The `squares[a] &&` guard is what stops three nulls counting as a win, which is the classic bug here.', pitfall: 'A draw is "board full AND no winner" — checking only for a full board declares a draw on a winning final move.' },
    { title: 'Guard the click', excerpt: { from: "if (squares[i] || winner) return;", lines: 5 }, detail: 'Two conditions, both necessary: overwriting an occupied square, and continuing to play after someone has won. The map produces a new array rather than mutating the one in state.', pitfall: '`squares[i] = value` then `setSquares(squares)` is the mutation bug — same reference, so React bails out and the board does not update.' },
    { title: 'Reset by replacing state, not clearing it piecemeal', excerpt: { from: "setSquares(Array(9).fill(null));", lines: 3 }, detail: 'Two setters, or one key bump on the component if the state grows. Both are safer than trying to mutate the board back to empty.' },
  ],
  graded: [
    { point: 'Winner and draw are derived, never stored', why: 'It is the main thing this exercise tests. Stored derived state is the bug class that scales — the same instinct later stores filtered lists and totals.' },
    { point: 'The null guard in the line check', why: 'Without it three empty squares satisfy the equality test and the game announces a winner before anyone has played. It is the specific bug interviewers look for.' },
    { point: 'State updates are immutable', why: 'Mutating the array and calling the setter with the same reference means React skips the render. The board simply does not change, and the cause is not visible in the code that looks wrong.' },
    { point: 'Play is blocked once the game is over', why: 'It is one condition and it is routinely missed, so the board keeps accepting moves after a win — the fastest thing for an interviewer to check.' },
  ],
};

const stopwatch: BuildExplanation = {
  kind: 'build',
  problem: 'Stopwatch',
  problemStatement:
    'Start, pause, resume and reset, displaying time down to milliseconds. The trap is how you measure elapsed time — counters that add a fixed interval drift, and they drift worst on the slowest machines.',
  buildOrder: [
    { title: 'Measure against a clock, never accumulate ticks', excerpt: { from: "const startRef = React.useRef(0);", lines: 3 }, detail: 'setInterval does not fire exactly on schedule — a busy main thread, a background tab or a slow frame all delay it. Adding 10ms per tick loses time steadily, and a stopwatch seconds slow after a minute is simply wrong.', pitfall: 'performance.now() is monotonic and immune to the system clock changing, which makes it the better source for a duration.' },
    { title: 'Drive the display with requestAnimationFrame', excerpt: { from: "if (!running) return;", lines: 7 }, detail: 'You only need a repaint per frame — updating faster renders states nobody sees. rAF also pauses automatically in a background tab, which a timer does not, and the elapsed value stays correct because it is computed from the clock.', pitfall: 'The cleanup is what stops the loop. Without cancelAnimationFrame, pausing leaves it running forever and it survives unmount.' },
    { title: 'Make pause and resume bank the elapsed time',  detail: 'The accumulated ref holds everything from previous runs; the start timestamp covers the current one. Two numbers make resume exact no matter how many times it is paused.', pitfall: 'Forgetting to bank on pause means resume restarts from the current segment and silently discards the earlier time.' },
    { title: 'Format from the elapsed milliseconds', excerpt: { from: "const hours = Math.floor(ms / 3600000);", lines: 4 }, detail: 'Formatting is a pure function of the number, so it belongs outside the component and is trivially testable. Use tabular-nums in the CSS or the digits jitter as they change width.' },
  ],
  graded: [
    { point: 'Elapsed time comes from timestamps, not from counting ticks', why: 'It is the whole point of the exercise. Accumulating interval callbacks drifts under load and in background tabs, and the error grows without bound.' },
    { point: 'rAF for the display, with cleanup', why: 'Thirty renders a second is enough for a human eye; a 10ms interval is three times the work for no visible benefit, and it keeps running in a hidden tab.' },
    { point: 'Pause banks the elapsed segment', why: 'It is what makes resume correct, and getting it wrong is silent — the clock simply reads low and nobody notices until they check.' },
    { point: 'The timing values are refs, not state', why: 'They change every frame but nothing renders directly from them. Putting them in state would schedule a render per write on top of the one rAF already causes.' },
  ],
};

const calculator: BuildExplanation = {
  kind: 'build',
  problem: 'Calculator',
  problemStatement:
    'A four-function calculator with a display, digits, operators, equals and clear. It looks trivial and is not: the state machine behind chained operations and repeated equals is where implementations fall apart.',
  buildOrder: [
    { title: 'Name the four things a calculator remembers', excerpt: { from: "const [display, setDisplay] = React.useState(\"0\");", lines: 4 }, detail: 'That fourth flag is the one people miss. After pressing an operator or equals the next digit must replace the display rather than append to it — without it, 5 + 3 shows "53".', pitfall: 'Trying to infer overwrite from the other fields works until repeated equals or a second operator press, at which point the special cases multiply.' },
    { title: 'Make the operator press perform the pending operation', excerpt: { from: "const value = parseFloat(display);", lines: 9 }, detail: 'This is what makes chaining work: 2 + 3 + shows 5 before you type the next number, because pressing the second operator resolves the first. A calculator that only computes on equals gets 2 + 3 + 4 wrong.', pitfall: 'The !overwrite check stops pressing two operators in a row from applying the operation twice against the same operand.' },
    { title: 'Guard the display itself', excerpt: { from: "if (overwrite) { setDisplay(\"0.\"); setOverwrite(false); retu", lines: 3 }, detail: 'Three rules: a leading zero is replaced rather than appended to, a second decimal point is rejected, and a decimal typed first becomes "0.". Each is a visible bug if missed.', pitfall: 'Division by zero yields Infinity, and 0/0 yields NaN — both render as-is unless you check and show "Error".' },
    { title: 'Separate clear-entry from clear-all', excerpt: { from: "setDisplay(\"0\"); setPrevious(null); setOp(null); setOverwrit", lines: 3 }, detail: 'Users expect to fix the number they are typing without losing the calculation. Having only one clear makes every mistyped digit cost the whole expression.' },
  ],
  graded: [
    { point: 'You identified it as a state machine', why: 'Candidates who treat it as string manipulation get 2 + 3 + 4 wrong or show "53". Naming the four pieces of state up front is what makes the rest fall out.' },
    { point: 'Chained operators resolve the pending operation', why: 'Pressing an operator has to compute, not just record. It is the first thing an interviewer tries after the happy path.' },
    { point: 'The overwrite flag exists', why: 'Without it every digit after an operator appends to the previous result. It is the most visible bug in this component and it is one boolean.' },
    { point: 'Division by zero and the decimal rules are handled', why: 'Infinity and NaN on the display, or "1.2.3" being typeable, are the details that separate a demo from something you would ship.' },
  ],
};

const autoComplete: BuildExplanation = {
  kind: 'build',
  problem: 'Auto-Complete (ARIA combobox)',
  problemStatement:
    'Suggestions as you type. This one question combines four separate skills — debouncing, request cancellation, keyboard navigation and the ARIA combobox pattern — and interviewers grade all four.',
  buildOrder: [
    { title: 'Debounce the query, not the input', excerpt: { from: "const debounced = useDebouncedValue(query, 250);", lines: 3 }, detail: 'The field updates on every keystroke so typing feels instant; only the value that triggers a request is delayed. Debouncing the input itself is what makes a search box feel broken.', pitfall: '250ms is about the limit before the delay is perceptible. Debouncing a purely local filter adds lag for no benefit.' },
    { title: 'Cancel the previous request', excerpt: { from: "}, [debounced]);", lines: 6 }, detail: 'Debouncing reduces the number of requests; it does not order them. Without cancellation a slow response for "re" can land after a fast one for "react" and replace the correct results with stale ones.', pitfall: 'This race is intermittent and looks like a caching bug. It is why cancellation is graded separately from debouncing.' },
    { title: 'Keep DOM focus in the input and move a virtual focus', excerpt: { from: "aria-activedescendant={active >= 0 ? `ac-opt-${active}` : un", lines: 5 }, detail: 'This is the mechanism that matters. aria-activedescendant points at the highlighted option while real focus never leaves the input — which is what lets the user keep typing while arrowing through suggestions.', pitfall: 'Calling .focus() on the <li> is the single most common way this component is built wrong: typing stops working the moment you press Down.' },
    { title: 'Implement the whole key set', excerpt: { from: "// First Esc closes the list; a second clears the input.", lines: 5 }, detail: 'Down on a closed list should reopen it, and the two-stage Escape is what users expect from a native control. These small behaviours make it feel like a real combobox rather than a styled input.', pitfall: 'Use onMouseDown rather than onClick to commit a suggestion — a click fires after blur, by which time the list may already have closed.' },
  ],
  graded: [
    { point: 'aria-activedescendant, with DOM focus staying in the input', why: 'It is the defining detail of the combobox pattern. Moving real focus to the options breaks typing, and it is how interviewers tell someone has implemented this before.' },
    { point: 'Debouncing and cancellation are both present', why: 'They solve different problems — request volume and result ordering. Doing only the first leaves a race that shows the wrong suggestions intermittently.' },
    { point: 'The full keyboard set, including two-stage Escape', why: 'Arrow keys alone are the minimum. Reopening on Down, Home/End, and Escape-then-Escape are what distinguish a complete implementation.' },
    { point: 'onMouseDown to select, and the active option scrolled into view', why: 'Both are bugs you only find by using it: clicking a suggestion does nothing, and arrowing past the fifth option moves a highlight nobody can see.' },
  ],
};

const toastSnackbar: BuildExplanation = {
  kind: 'build',
  problem: 'Toast / Snackbar',
  problemStatement:
    'A queue of transient messages triggered by calling a function from anywhere, stacking, auto-dismissing, and individually closeable. The API shape is the design question; the timers are the correctness one.',
  buildOrder: [
    { title: 'Expose it as a hook, not a component you render', excerpt: { from: "const { toasts, show, dismiss } = useToast();", lines: 3 }, detail: 'Toasts fire from event handlers deep in the tree — a save button, a failed request. Anything that requires rendering a component locally and threading an open prop upward defeats the purpose.', pitfall: 'Export the hook rather than the raw context so you can throw a clear "useToast must be used inside ToastProvider" instead of a null dereference.' },
    { title: 'Key each toast by a generated id', excerpt: { from: "setToasts((prev) => [...prev, { id, message, type }]);", lines: 5 }, detail: 'The id is the React key and the dismissal handle. Returning it lets a caller replace a "Saving…" toast with "Saved" rather than stacking a second one.', pitfall: 'Index keys break the exit animation: dismissing the middle toast renumbers the rest and React animates the wrong elements out.' },
    { title: 'Own the timer inside the toast component', excerpt: { from: "setTimeout(() => {", lines: 5 }, detail: 'Colocating the timer with the toast means mount starts it and unmount clears it, so a manual dismiss can never leave a timer that fires later against an id that is gone.', pitfall: 'Pause on hover, or a message the user is reading disappears mid-sentence.' },
    { title: 'Give the container a live region and a stable position', excerpt: { from: "{toasts.map((t) => {", lines: 6 }, detail: 'A column with gap means stacking needs no positional maths — each toast is a flex child. The role on each toast is what gets it announced; role=alert interrupts, which is right only for errors.' },
  ],
  graded: [
    { point: 'The trigger is a function, callable from anywhere', why: 'It is the difference between a toast system and a component. Interviewers phrase it as "trigger it from a button three levels down" for exactly this reason.' },
    { point: 'Timers are per-toast and cleaned up', why: 'A single shared timer has to be rescheduled on every queue change, and that is where toasts that dismiss early, twice, or never come from.' },
    { point: 'Stable ids, not indexes', why: 'Dismissal and exit animation both depend on React tracking the right element. With index keys, removing one toast animates out its neighbour.' },
    { point: 'Announced, and pausable', why: 'A purely visual toast does not exist for a screen-reader user, and a four-second auto-dismiss is not enough time to read a sentence — pause on hover is the standard fix.' },
  ],
};

const carousel: BuildExplanation = {
  kind: 'build',
  problem: 'Carousel / Slider',
  problemStatement:
    'Previous and next controls, position dots, keyboard navigation and auto-play. The index arithmetic is trivial; auto-play interacting with user intent is where this gets interesting.',
  buildOrder: [
    { title: 'Wrap the index with modulo, in both directions', excerpt: { from: "const next = React.useCallback(() => setIndex((i) => (i + 1)", lines: 3 }, detail: 'The `+ count` in prev is what stops JavaScript\'s modulo returning a negative number — -1 % 5 is -1, not 4. It is a one-token fix and a guaranteed blank slide on the first backwards click without it.', pitfall: 'If the slide list can change length, clamp the index when count changes or you are left pointing past the end.' },
    { title: 'Drive auto-play from an effect that depends on the index', excerpt: { from: "const id = setInterval(next, 3000);", lines: 5 }, detail: 'Depending on index means the timer restarts from zero whenever the slide changes — so clicking next gives you a full interval on the new slide rather than a jump moments later. A setInterval set up once does the opposite.', pitfall: 'The stale-closure version — one interval with an empty dep array calling next — captures the first index forever and the carousel sticks on slide two.' },
    { title: 'Pause on hover, focus and hidden tabs',  detail: 'Content that moves while the user is reading or tabbing through it is the complaint every auto-playing carousel generates. Pausing on focus is what makes it usable from the keyboard at all.', pitfall: 'WCAG 2.2.2 requires a way to stop content that moves for more than five seconds, so a visible pause control is a requirement rather than a nicety.' },
    { title: 'Make the dots real controls and announce the change', excerpt: { from: "{SLIDES.map((s, i) => (", lines: 5 }, detail: 'Dots are navigation, so they must be buttons with names. The live region is off while auto-playing — announcing every four seconds unprompted is worse than silence.' },
  ],
  graded: [
    { point: 'Negative modulo is handled', why: 'The first click on prev exposes it, and the symptom — a blank carousel — looks unrelated to the arithmetic that caused it.' },
    { point: 'Auto-play restarts the timer on slide change', why: 'It is the difference between a carousel that feels considered and one that skips a beat after every manual click. The empty-dep interval version also has a stale closure.' },
    { point: 'It pauses for the user', why: 'Hover, focus and a visible control. Moving content with no way to stop it is an accessibility failure with a specific WCAG criterion attached, not a matter of taste.' },
    { point: 'Dots are buttons with accessible names', why: 'Unlabelled dot divs are unreachable and unannounced — the most common accessibility gap in this component after the auto-play itself.' },
  ],
};

const todoList: BuildExplanation = {
  kind: 'build',
  problem: 'Todo List (localStorage + memo)',
  problemStatement:
    'The classic list, with the follow-up that actually matters: persist it, then make sure typing in the input does not re-render all five hundred rows. Four techniques have to work together for that to hold.',
  buildOrder: [
    { title: 'Read storage once, in a lazy initialiser', excerpt: { from: "const parsed = JSON.parse(raw);", lines: 7 }, detail: 'The function form runs only on the first render rather than every one. The try/catch is not padding — the storage accessor itself throws in a private window, and this runs during render, so an uncaught throw unmounts the tree.', pitfall: 'JSON.parse of whatever is in storage is untrusted input. Without the Array.isArray check, one bad value makes the app crash on every load with no way for the user to recover.' },
    { title: 'Keep the input state out of the list component', excerpt: { from: "const [draft, setDraft] = React.useState(\"\");", lines: 4 }, detail: 'This is the single biggest win. If the draft text lives in the parent, every keystroke re-renders the parent and therefore every row. Pushing it down means typing re-renders one small component.', pitfall: 'Doing only this and skipping memo still re-renders the rows whenever the parent updates for any other reason.' },
    { title: 'Memo the row and keep its props stable', excerpt: { from: "const TodoItem = React.memo(function TodoItem({ todo, onTogg", lines: 4 }, detail: 'memo compares props shallowly, so it only helps if every prop is referentially stable. The functional setState form is what lets the dep array stay empty — depend on todos and the callback is new on every change, defeating the memo.', pitfall: 'One unstable prop — an inline arrow, an object literal — is enough to make memo do nothing while looking like it works.' },
    { title: 'Write back in a debounced effect', excerpt: { from: "}, [todos]);", lines: 6 }, detail: 'Writing synchronously in the handler makes every toggle a serialise-and-write of the whole list. Debouncing batches a burst of edits into one write, and the catch covers a full or disabled quota.' },
  ],
  graded: [
    { point: 'All four techniques, and you can say what each one fixes', why: 'Isolated input state, memoised rows, stable callbacks and functional updates. Reciting memo alone is the common answer and it does nothing on its own, because the callbacks are still new every render.' },
    { point: 'The storage read is wrapped and validated', why: 'The accessor throws in private mode and the read happens during render, so this is a blank-page bug rather than a warning. Validating the parsed shape covers the other half.' },
    { point: 'Functional updates so the dep arrays stay empty', why: 'It is the mechanism that makes the callbacks stable. Depending on todos looks equivalent and quietly re-creates every handler on every change.' },
    { point: 'You can say what you would do at 10,000 rows', why: 'None of this changes the fact that every row is in the DOM. Virtualisation is the next step, and the React Compiler removes the need for the manual memoisation — both are the right follow-up answers.' },
  ],
};

const counterOptimized: BuildExplanation = {
  kind: 'build',
  problem: 'Counter (optimized re-renders)',
  problemStatement:
    'A counter is the smallest component that can demonstrate the whole re-render story: functional updates, stable handlers, memoised children, and the stale closure that catches everyone inside setInterval.',
  buildOrder: [
    { title: 'Update from the previous value, not the captured one', excerpt: { from: "() => setCount((c) => Math.min(max, c + step)),", lines: 3 }, detail: 'The functional form reads the value React is about to commit rather than the one captured when this render ran. Two calls in one handler increment by two; the captured form increments by one, because both calls saw the same count.', pitfall: 'It is also what lets the handler have an empty dep array, which is the precondition for everything below.' },
    { title: 'Stabilise the handler so memo can work', excerpt: { from: "const reset = React.useCallback(() => setCount(initial), [in", lines: 3 }, detail: 'memo does a shallow compare of props. A new arrow function each render fails that compare every time, so the child re-renders regardless — the memo is pure overhead. Empty deps are possible only because of the functional update above.', pitfall: 'Passing an object or array literal alongside has the same effect. One unstable prop defeats the whole comparison.' },
    { title: 'Show the effect rather than asserting it', excerpt: { from: "renders.current++;", lines: 3 }, detail: 'A render counter in the child makes the optimisation visible — click the parent and watch the number stay still. It is also how you check a memo is actually working rather than assuming it is.', pitfall: 'A ref, not state: incrementing state during render is an infinite loop.' },
    { title: 'Demonstrate the stale closure in setInterval', excerpt: { from: "const id = setInterval(() => setN((prev) => prev + 1), 500);", lines: 4 }, detail: 'With an empty dep array the callback closes over count from the first render forever, so the captured form computes 0 + 1 every second and the counter freezes at 1. The functional form has nothing stale to capture.', pitfall: 'The other fix — adding count to the deps — works but tears the interval down and rebuilds it every second, which is rarely what you want.' },
  ],
  graded: [
    { point: 'You know why the functional update matters', why: 'It is correctness, not style: two updates in one handler, or any update from an async callback, is wrong with the captured value. Everything else here depends on it.' },
    { point: 'useCallback and memo are described as one mechanism', why: 'Either alone does nothing. Candidates who list them as separate optimisations usually have not watched a memoised child re-render because of an inline arrow.' },
    { point: 'You can explain the setInterval stale closure', why: 'It is the most commonly hit React bug in the wild, and the two available fixes have different costs. Knowing both, and which you would pick, is the senior signal.' },
    { point: 'You mention the React Compiler', why: 'It memoises automatically and makes most of this manual work unnecessary — but only for components that follow the Rules of React, and it bails out silently when they do not.' },
  ],
};

const searchDebounceCancel: BuildExplanation = {
  kind: 'build',
  problem: 'Search with Debounce + Cancel',
  problemStatement:
    'Search that fires a request as the user types without firing one per keystroke, and without letting a slow early response overwrite a fast later one. Two separate problems that are routinely confused for one.',
  buildOrder: [
    { title: 'Debounce the value, keep the input instant', excerpt: { from: "return () => clearTimeout(id);", lines: 8 }, detail: 'The cleanup is the debounce: every new keystroke clears the pending timer before it fires, so only a pause actually commits a value. The input itself stays controlled by the immediate state, so typing never feels delayed.', pitfall: 'Debouncing the input value instead makes the field lag behind the keyboard, which users read as the page being broken.' },
    { title: 'Cancel the in-flight request when the query changes', excerpt: { from: "const controller = new AbortController();", lines: 8 }, detail: 'Debouncing reduces how many requests you send; it does nothing about the order they come back in. Without cancellation, "re" can resolve after "react" and replace correct results with stale ones.', pitfall: 'Treating AbortError as a failure means the error state flashes every time the user keeps typing.' },
    { title: 'Make the status honest about which query it describes',  detail: 'Between the last keystroke and the debounce firing, the results on screen belong to an older query. Showing that explicitly stops the UI claiming stale results are the answer to what was just typed.', pitfall: 'Clearing the results while typing is the other option, but it makes the list flicker on every character.' },
    { title: 'Announce the result count',  detail: 'The list updating silently is invisible to a screen reader — the user has no way to know the search completed. A polite live region announces it without interrupting typing.' },
  ],
  graded: [
    { point: 'Debouncing and cancellation are named as separate fixes', why: 'They solve request volume and result ordering respectively. Candidates who implement only debouncing still have the race, and it shows up intermittently as the wrong results.' },
    { point: 'The input is not debounced, only the query', why: 'It is what keeps typing instant. Debouncing the controlled value is a common misreading and makes the component feel worse than no debounce at all.' },
    { point: 'AbortError is excluded from the error path', why: 'Your own cleanup is not a failure. Without the guard, every continued keystroke flashes an error message.' },
    { point: 'The UI is honest while results are stale', why: 'Showing an old list under a new query with no indication is a small lie the user acts on. A pending indicator costs one boolean.' },
  ],
};

const modalPortalFocusTrap: BuildExplanation = {
  kind: 'build',
  problem: 'Modal (Portal + Focus Trap)',
  problemStatement:
    'The production version of a dialog: rendered through a portal, trapping focus, restoring it on close, announcing itself correctly and locking the background scroll. Each piece exists because of a specific failure without it.',
  buildOrder: [
    { title: 'Portal out of the layout, not out of the React tree',  detail: 'A dialog nested inside a transformed or overflow-hidden ancestor gets clipped or positioned against the wrong containing block. The portal moves the DOM node to the body while context, state and event bubbling still follow the React tree.', pitfall: 'Because events bubble through the React tree, a click inside the portal still fires handlers on the React parent — surprising exactly when you are trying to close on outside-click.' },
    { title: 'Move focus in, and remember where it came from', excerpt: { from: "openerRef.current = document.activeElement;", lines: 6 }, detail: 'Opening without moving focus leaves the keyboard user behind the dialog, tabbing through content they cannot see. Restoring on close is the other half — otherwise focus falls back to the body and the next Tab starts from the top of the page.', pitfall: 'Focus the first meaningful control, not the close button — and for a destructive confirmation, deliberately not the destructive one.' },
    { title: 'Trap Tab by wrapping at the ends', excerpt: { from: "const focusables = panelRef.current?.querySelectorAll(", lines: 4 }, detail: 'Query the focusable elements at keydown rather than caching them — the dialog content can change while it is open, and a cached list sends focus to an element that no longer exists.', pitfall: 'A trap with no exit is worse than none. Escape must always close, or a keyboard user is stuck in the dialog with no way out.' },
    { title: 'Announce it, and lock the background', excerpt: { from: "const prev = document.body.style.overflow;", lines: 6 }, detail: 'aria-modal tells assistive technology that content outside is inert. Restoring the previous overflow value rather than setting it to empty means nested dialogs and pages with their own overflow rules survive.', pitfall: 'The native <dialog> element with showModal() gives you the trap, the inertness and the backdrop for free — say so, and explain why you are or are not using it.' },
  ],
  graded: [
    { point: 'Focus is moved in and restored on close', why: 'It is the difference between a dialog and a div that looks like one. Without restoration the user is dropped at the top of the page every time they close something.' },
    { point: 'The trap wraps, and Escape always escapes', why: 'A trap is only acceptable because there is a guaranteed way out. Interviewers check by tabbing to the end and by pressing Escape from inside a text field.' },
    { point: 'You can say what the portal is for', why: 'Not "it renders elsewhere" but specifically: it escapes overflow and transform ancestors, while context and event bubbling still follow the React tree. That second half is what people get wrong.' },
    { point: 'You mention the native <dialog>', why: 'It solves most of this in the platform. Knowing when the custom implementation is still justified — styling the backdrop, animation, nested dialogs — is the judgement being assessed.' },
  ],
};

const formValidation: BuildExplanation = {
  kind: 'build',
  problem: 'Form with Validation',
  problemStatement:
    'Validate required fields and formats, show errors at the right moment, and connect them to their inputs so they are announced. When an error appears is what separates a pleasant form from an aggressive one.',
  buildOrder: [
    { title: 'Derive errors; store only values and touched', excerpt: { from: "const isValid = Object.keys(errors).length === 0;", lines: 4 }, detail: 'Errors are a pure function of the values, so keeping them in state means an effect to resync and a window where the two disagree. `touched` is the separate concern — not whether a field is wrong, but whether the user has finished with it.', pitfall: 'Storing errors is how you get a form that reports a field as invalid after the user has already fixed it.' },
    { title: 'Show an error on blur, then update live', excerpt: { from: "const showError = (key) => Boolean(touched[key] && errors[ke", lines: 3 }, detail: 'Validating on every keystroke shouts "invalid email" at someone who has typed one character. Waiting for blur is respectful; switching to live updates after that first blur means the error clears as soon as they fix it.', pitfall: 'Validating only on submit is the other extreme — the user fills in eight fields and then finds out about the second one.' },
    { title: 'Connect the message to the input', excerpt: { from: "aria-describedby={show ? errorId : undefined}", lines: 3 }, detail: 'aria-describedby is what makes a screen reader read the error when focus lands on the field; aria-invalid is what marks the state. A red border communicates neither.', pitfall: 'Point aria-describedby at the error only while it exists, or you leave a dangling id reference that some screen readers announce oddly.' },
    { title: 'On submit, mark everything touched and focus the first problem', excerpt: { from: "f.setSubmitting(true);", lines: 4 }, detail: 'Marking every field touched reveals all the errors at once. Moving focus to the first one means the user does not have to scroll a long form hunting for what went wrong.', pitfall: 'Disabling the submit button until the form is valid looks tidy and is hostile — the user gets no explanation of what is missing, and screen readers skip disabled controls.' },
  ],
  graded: [
    { point: 'Errors are derived, not stored', why: 'It is the same state-duplication question as everywhere else, and here the stale version is user-visible: a field still flagged after being corrected.' },
    { point: 'Blur-then-live timing', why: 'It is the detail that makes a form feel considered. Validating per keystroke from the first character is the most common and most irritating implementation.' },
    { point: 'aria-invalid, aria-describedby and role="alert"', why: 'Without them the error exists only as colour and position. This is the half of form work that is invisible in a screenshot and obvious with a screen reader.' },
    { point: 'Submit reveals everything and focuses the first error', why: 'It is what turns a failed submit into something actionable. A disabled submit button instead is the anti-pattern interviewers probe for.' },
  ],
};

const themeSwitcher: BuildExplanation = {
  kind: 'build',
  problem: 'Theme Switcher (dark/light)',
  problemStatement:
    'Light, dark and — the one people forget — follow the system. Persisted across reloads, applied without a flash of the wrong theme, and reacting when the OS setting changes while the page is open.',
  buildOrder: [
    { title: 'Model three states, not a boolean',  detail: '"Follow the system" is a distinct choice from "dark", and it behaves differently: it has to keep tracking. A boolean forces the first visit to pick one and loses the user\'s actual preference, which was "whatever my OS says".', pitfall: 'Storing the resolved value rather than the choice means a user who picked "system" is pinned to whatever it was that day.' },
    { title: 'Kill the flash with a blocking inline script', excerpt: { from: "//         document.documentElement.dataset.theme = dark ? '", lines: 8 }, detail: 'React applies the theme after the bundle parses and mounts — hundreds of milliseconds during which a dark-mode user stares at a white page. A synchronous script in the head runs before first paint, so there is no wrong frame to see.', pitfall: 'It must be inline and synchronous. An external or deferred script is exactly the delay you are trying to remove.' },
    { title: 'Express the theme as CSS variables on the root', excerpt: { from: ":root[data-theme=\"dark\"] {", lines: 3 }, detail: 'One attribute swap re-themes the whole page, and nothing re-renders — it is a style recalculation, not a React update. Passing a theme object through context means every consumer re-renders on toggle.' },
    { title: 'Keep tracking the system while "system" is selected', excerpt: { from: "return () => mq.removeEventListener(\"change\", onChange);", lines: 7 }, detail: 'Reading the media query once at startup means the page stops following the OS the moment it flips at sunset. The listener is what makes "system" mean system.', pitfall: 'Wrap the localStorage write in try/catch — the accessor throws in a private window, and a theme toggle is not worth crashing the app for.' },
  ],
  graded: [
    { point: 'Three states, with "system" persisted as the choice', why: 'It is the requirement candidates miss, and it is the default every OS-aware app should ship with. Storing the resolved value instead quietly breaks it.' },
    { point: 'The blocking inline script, and why it must be inline', why: 'The flash of wrong theme is the visible bug here, and it cannot be fixed from inside React because React runs too late. Knowing that is the point of the question.' },
    { point: 'CSS variables rather than a theme object in context', why: 'One attribute change re-themes the page with no re-render. Threading a theme object through context re-renders every consumer on every toggle.' },
    { point: 'The media query is listened to, not just read', why: 'Without the listener, "follow the system" works until the system actually changes — which is the one moment it was supposed to handle.' },
  ],
};

const dynamicFields: BuildExplanation = {
  kind: 'build',
  problem: 'Form with Dynamic Fields',
  problemStatement:
    'Let the user add and remove rows in a form, validate each row independently, and keep the whole thing submittable only when every row is valid. The interesting part is not the UI — it is that the list changes shape while React is trying to track it.',
  buildOrder: [
    { title: 'Make the array the form state, with a stable id per row', excerpt: { from: 'const [rows, setRows] = React.useState([', lines: 4 }, detail: 'One array is the single source of truth. Each row owns an id generated when it is created, so identity comes from the data rather than from where the row happens to sit. Everything else — add, remove, update, validate — is an operation on that array.', pitfall: 'Deriving the id from the index recreates the exact problem the id exists to solve, because the index changes the moment a row is removed.' },
    { title: 'Add and remove by id, never by index', excerpt: { from: 'const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));', lines: 1 }, detail: 'Filtering by id is immune to how the array is ordered or how many removals happened first. Index-based splicing works until two removals race in the same tick, or until you sort the list, at which point it deletes the wrong row.', pitfall: 'Mutating the array with splice and setting the same reference back means React sees no change and never re-renders.' },
    { title: 'Update one field without touching the others', excerpt: { from: 'setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));', lines: 1 }, detail: 'map returns a new array, and the spread returns a new object only for the row that changed — every other row keeps its reference, so a memoised row component does not re-render. The computed key lets one handler serve every field.', pitfall: 'Editing the row object in place keeps the old reference, so memoised children skip the update and the input appears frozen.' },
    { title: 'Derive errors per row on every render', excerpt: { from: 'const allErrors = rows.map(errorsFor);', lines: 2 }, detail: 'Validation is a pure function of the row, so errors are computed rather than stored — there is no second copy to resync after an edit or a removal. Validity of the whole form falls out of it as one every() call.', pitfall: 'Storing an errors array alongside the rows means removing a row has to remove its errors too, and the two drift the first time you forget.' },
    { title: 'Key by id so React tracks the right row', excerpt: { from: '<div key={row.id} style={rowStyle}>', lines: 1 }, detail: 'This is the line the whole design exists to support. React uses the key to decide which DOM node belongs to which item; with an id it moves nodes correctly, and with an index it reuses position 0 for whatever is now first.', pitfall: 'Remove the first row while the second has text in it and an index key leaves the old text in the input — the wrong row appears to have been deleted.' },
  ],
  graded: [
    { point: 'Stable ids rather than array indices as keys', why: 'It is the single most common React list bug, and a dynamic form is where it actually bites rather than staying theoretical, because rows are removed from the middle.' },
    { point: 'Errors derived, not stored', why: 'Storing them means a second structure that must be kept in step with the rows through every add, remove and edit, and the stale version is visible to the user as a field flagged after being fixed.' },
    { point: 'Immutable updates with functional setState', why: 'It keeps unchanged rows referentially equal so memoisation works, and it avoids the batching bug where two updates in one tick both read the same stale array.' },
    { point: 'Accessible per-row errors', why: 'Rows repeat, so a generic label like "Email" is ambiguous with a screen reader — the label has to identify which member it belongs to, and role="alert" is what makes the message announced.' },
  ],
};

const multiStepForm: BuildExplanation = {
  kind: 'build',
  problem: 'Multi-Step Form (Wizard)',
  problemStatement:
    'Split a long form across steps, validate each step before advancing, and make Back preserve everything already typed. The whole design question is where the data lives, because each step unmounts when you move on.',
  buildOrder: [
    { title: 'Own all the data in the parent', excerpt: { from: 'const [data, setData] = React.useState({', lines: 3 }, detail: 'One object holds every field from every step. The steps are unmounted as you navigate, so any state kept inside them is destroyed the moment you press Next — which is exactly the bug users report as "it lost my answers when I went back".', pitfall: 'Keeping each step self-contained feels tidier and is the wrong call here; the parent has to own the data because the parent is the thing that survives.' },
    { title: 'Put validation in a per-step table', excerpt: { from: 'const validators = [', lines: 2 }, detail: 'One validator per step index turns "can I advance?" into a single lookup instead of a switch that grows a branch per step. Adding a step is adding a row, and the rule for a step sits next to the step it belongs to.', pitfall: 'A single validator for the whole form blocks step one on fields the user has not reached yet.' },
    { title: 'Gate Next on the current step only', excerpt: { from: 'const errors = validators[step](data);', lines: 2 }, detail: 'Errors are recomputed each render from the current step and the shared data, so the Next button reflects the live state with nothing to keep in sync. Validity is derived, never stored.', pitfall: 'Validating every step on every render means the user sees errors for fields they have not seen yet, which reads as the form being broken.' },
    { title: 'Reveal errors on the attempt, not on arrival', excerpt: { from: 'if (!canAdvance) { setShowErrors(true); return; }', lines: 2 }, detail: 'A step opens clean; pressing Next with something invalid is what turns the messages on. That keeps the first impression calm while still making the blocker obvious the moment the user tries to move past it.', pitfall: 'Showing errors as soon as a step mounts greets the user with red text about fields they have not touched.' },
    { title: 'Let Back retreat without validating', excerpt: { from: 'const back = () => { setShowErrors(false); setStep(s => Math.max(s - 1, 0)); };', lines: 1 }, detail: 'Going backwards is not a commitment, so it must never be blocked by the current step being incomplete — otherwise a user who mistypes something is trapped and cannot return to fix an earlier answer.', pitfall: 'Applying the same guard to Back as to Next is a genuine trap: the user cannot leave the step in either direction.' },
  ],
  graded: [
    { point: 'State lifted to the parent, not held per step', why: 'It is the question the exercise is really asking. Steps unmount on navigation, so state inside them cannot survive Back, and candidates who miss it produce a wizard that silently loses data.' },
    { point: 'Per-step validation rather than whole-form', why: 'It is what lets the user progress at all, and it keeps the rule beside the step it governs so adding a step does not mean editing a growing conditional.' },
    { point: 'Errors shown on the advance attempt', why: 'Timing is the difference between a form that guides and one that nags, and it is the same blur-then-live judgement as a single-page form applied at step granularity.' },
    { point: 'Back is never blocked', why: 'A wizard that will not let you go back to correct an earlier answer is unusable, and it is an easy bug to ship if the same guard is copied onto both buttons.' },
  ],
};

const buttonVariants: BuildExplanation = {
  kind: 'build',
  problem: 'Button (variants + sizes)',
  problemStatement:
    'Build the Button every design system starts with: a closed set of visual variants and sizes, a loading state that is not the same thing as disabled, and enough pass-through that it can stand in for a native <button> anywhere. The CSS is the easy half — what is being graded is the prop API, and specifically what a consumer cannot get wrong by accident.',
  buildOrder: [
    {
      title: 'Close the sets before writing any styling',
      excerpt: { from: 'const VARIANTS = {', lines: 6 },
      detail:
        'A variant is a closed set, so it belongs in a lookup keyed by that set — not an if-chain and not a switch. Adding a variant is then one line, and in the TypeScript version the map is typed Record<Variant, CSSProperties>, which makes "added a variant and forgot to style it" a compile error rather than a silent fall-through to the default.',
      pitfall: 'An if-chain has a final else, so a typo in the variant name renders as primary and nobody notices until a designer does.',
    },
    {
      title: 'Decide what the component owns and what it passes through',
      excerpt: { from: '  as: Tag = "button",', lines: 8 },
      detail:
        'Every prop the component understands is destructured by name; everything else collects into rest and reaches the DOM node untouched. That single line is what lets the Button accept data-testid, onMouseEnter, form, aria-describedby and every other attribute you did not think of. ref is an ordinary prop in React 19, so it is destructured here too rather than needing forwardRef.',
      pitfall: 'A Button that swallows unknown props gets forked within a month, because the first person who needs an attribute you did not anticipate has no way to pass it.',
    },
    {
      title: 'Spread rest first, then the props you refuse to let a consumer break',
      excerpt: { from: '      {...rest}', lines: 1 },
      detail:
        'Order in JSX is last-wins, so rest is spread BEFORE the guarded handler and the type default. Spread it last instead and a consumer passing onClick silently replaces the guard, which means clicking a disabled non-native Button fires the handler. The props after the spread are exactly the ones the component is responsible for.',
      pitfall: 'This is the bug that makes disabled look like it works: a native <button disabled> blocks the click for you, so the broken guard only shows up once someone uses as="a".',
    },
    {
      title: 'Default type to "button"',
      excerpt: { from: 'type={isNative ? type ||', lines: 1 },
      detail:
        'A <button> inside a <form> defaults to type="submit". Every secondary action in a form — Cancel, Add row, Show more — therefore submits the form unless the type is set. It is the single most common defect in a hand-rolled Button, and it is invisible until the component is used inside a form for the first time.',
      pitfall: 'The default must still be overridable, so it reads type || "button" rather than hard-coding it — a real submit button needs to say so.',
    },
    {
      title: 'Separate loading from disabled',
      excerpt: { from: 'const inert = disabled || loading;', lines: 1 },
      detail:
        'They look identical and mean opposite things. Disabled means "not available to you"; loading means "your click was accepted, wait". Both must block activation, which is why they collapse into one inert flag for behaviour — but only loading gets aria-busy, and the label should stay stable so the button does not change width underneath the pointer.',
      pitfall: 'Announcing a loading button as merely disabled tells a screen-reader user the action is unavailable, when in fact it is already running.',
    },
    {
      title: 'Make it polymorphic without throwing away semantics',
      excerpt: { from: 'const isNative = Tag === "button";', lines: 1 },
      detail:
        'Navigation is a link, and a <button onClick={navigate}> loses middle-click, open-in-new-tab, the status bar and the browser\'s own handling. The as prop keeps one visual component across both. Everything that differs between them keys off isNative: only a real button has a disabled attribute, so anything else needs aria-disabled plus the guarded handler to stand in for it.',
      pitfall: 'aria-disabled is announcement only — it does not block anything. Ship it without the handler guard and the control announces as disabled while still firing.',
    },
    {
      title: 'Force a label on the icon-only case',
      excerpt: { from: 'iconOnly aria-label="Add item"', lines: 2 },
      detail:
        'An icon-only button has no text content, so its accessible name is empty and it announces as just "button". The glyph itself is aria-hidden because it carries no meaning to a screen reader. In TypeScript this is worth encoding in the type: iconOnly: true can require aria-label through a discriminated union, so omitting it fails to compile.',
      pitfall: 'A label that describes the icon rather than the action ("plus") is barely better than none — it should say what happens.',
    },
  ],
  graded: [
    { point: 'variant and size are resolved by lookup, not by conditionals', why: 'It shows you treat them as closed sets rather than as strings, which is what makes the component extensible without a growing branch and what lets the type system catch an unstyled variant at compile time.' },
    { point: 'The component forwards rest props and ref', why: 'This is the difference between a Button that substitutes for the native element and one that has to be forked the first time someone needs an attribute you did not anticipate. Interviewers read it as knowing how a component gets consumed.' },
    { point: 'type="button" is the default', why: 'It is a one-line detail that separates people who have shipped a design system from people who have built a button once, because the failure only appears inside a form and looks like a routing bug.' },
    { point: 'loading and disabled are different states', why: 'Collapsing them loses the distinction between "unavailable" and "in progress", which matters to every screen-reader user and is the moment to mention aria-busy without being prompted.' },
    { point: 'You can say why "as" is a compromise', why: 'Radix and friends use asChild or a render prop instead, because as cannot merge props onto a component the consumer already built. Naming that limit shows you know the pattern rather than having copied it.' },
  ],
};

export const playgroundBuildExplanations: Record<string, BuildExplanation> = {
  'Form with Dynamic Fields': dynamicFields,
  'Multi-Step Form (Wizard)': multiStepForm,
  'Responsive Images (srcset / AVIF)': responsiveImages,
  'Protected Route (Auth + RBAC)': protectedRoute,
  'Mini Redux Store': miniReduxStore,
  'Client Cache (stale-while-revalidate)': clientCache,
  'WebSocket Live Feed': webSocketFeed,
  'Optimistic UI Updates': optimisticUI,
  'Suspense + Lazy (Code Splitting)': suspenseLazy,
  'Display Data from a JSON Prop': displayJsonProp,
  'JSON → API → React fetch': jsonApiFetch,
  'Fetch Users from an API': fetchUsersApi,
  'Pagination': pagination,
  'Search Filter': searchFilter,
  'Chat App': chatApp,
  'Modal Component': modalComponent,
  'Image Gallery + Lazy Load': imageGallery,
  'Drag and Drop': dragAndDrop,
  'Product List Sort & Filter': productListSortFilter,
  'Responsive Navbar': responsiveNavbar,
  'Infinite Scroll': infiniteScroll,
  'Notifications': notifications,
  'Star Rating': starRating,
  'Tabs': tabs,
  'Accordion': accordion,
  'OTP Input': otpInput,
  'Tic-Tac-Toe': ticTacToe,
  'Stopwatch': stopwatch,
  'Calculator': calculator,
  'Auto-Complete (ARIA combobox)': autoComplete,
  'Toast / Snackbar': toastSnackbar,
  'Carousel / Slider': carousel,
  'Todo List (localStorage + memo)': todoList,
  'Counter (optimized re-renders)': counterOptimized,
  'Search with Debounce + Cancel': searchDebounceCancel,
  'Modal (Portal + Focus Trap)': modalPortalFocusTrap,
  'Form with Validation': formValidation,
  'Theme Switcher (dark/light)': themeSwitcher,
  'Button (variants + sizes)': buttonVariants,
};

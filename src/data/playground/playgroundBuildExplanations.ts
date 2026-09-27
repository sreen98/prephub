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
    'Serve the right resolution and format per device, reserve the space before the bytes arrive, and get loading priority right. On most pages an image is the LCP element (Largest Contentful Paint: the time until the biggest visible element has rendered, a Core Web Vitals score Google measures), so these decisions usually decide whether that score is good or bad.',
  buildOrder: [
    {
      title: 'List the candidates the browser may choose from',
      excerpt: { from: 'srcSet="/img/hero-400.jpg 400w', lines: 1 },
      detail:
        'srcset is a menu, not an instruction. Each entry names a file and its real width in pixels with the `w` descriptor (`400w` means the file is 400 pixels wide). You hand the browser options and let it pick, because it knows the viewport width and the device pixel ratio (DPR: how many physical pixels one CSS pixel covers, 2 or 3 on most phones), and you do not.',
      pitfall: 'The `w` value is the file\'s real pixel width, not the CSS width you want it shown at. Guessing it makes every selection wrong.',
    },
    {
      title: 'Tell the browser how wide it will actually display',
      excerpt: { from: 'sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 6', lines: 1 },
      detail:
        'srcset says what exists; sizes says how wide the image will be shown. This one reads: full viewport width up to 600px, half the viewport up to 1200px, otherwise 600px. The browser multiplies that width by the DPR and typically picks the smallest candidate that covers it, and it does this while the HTML is still being scanned, before any CSS has been applied, so it cannot work the layout out for itself.',
      pitfall: 'Omit sizes and the browser assumes 100vw (the whole viewport width). On a 1400px-wide desktop that means it fetches the 1600w file for an image your CSS shows at 600px, where the 800w file would have been enough.',
    },
    {
      title: 'Give the img its intrinsic width and height',
      excerpt: { from: 'fetchPriority="high"', lines: 4 },
      detail:
        'width={800} and height={450} are not what sizes the image on screen; the style with `width: 100%` and `height: auto` does that. The attributes give the browser the aspect ratio (16:9 here), so it can reserve a correctly shaped box before a single byte has arrived.',
      pitfall: 'Without them the image is 0px tall until it loads, and everything below it jumps down when it arrives. That jump is CLS (Cumulative Layout Shift, another Core Web Vitals score), and it counts on every page view.',
    },
    {
      title: 'Offer modern formats with a fallback',
      excerpt: { from: '<source type="image/avif"', lines: 3 },
      detail:
        'Inside `<picture>` the browser takes the first `<source>` whose type it supports, so the order runs smallest file first: AVIF (roughly half the size of the same JPEG), then WebP (roughly a third smaller), then the `<img>` as the universal fallback. This is a different job from srcset: picture switches format (or crops for different screens, called art direction), srcset switches resolution.',
      pitfall: 'The `<img>` inside `<picture>` is not optional. It is where alt, width, height and loading live, and it is what renders if no source matches.',
    },
    {
      title: 'Lazy-load images below the fold, and decode off the main thread',
      excerpt: { from: '  loading="lazy"', lines: 2 },
      detail:
        'loading="lazy" tells the browser not to fetch this image until the user scrolls near it, which saves bytes for images that start below the fold (outside the first screenful). decoding="async" lets the browser turn the file into pixels without holding up the main thread, which also runs your JavaScript.',
      pitfall: 'Lazy is right for this image because it is not the hero. On the hero it is a regression, covered in the last step.',
    },
    {
      title: 'Reserve the space with CSS aspect-ratio when there is no img yet',
      excerpt: { from: 'function AspectRatioBox() {', lines: 8 },
      detail:
        'When the box is a plain container rather than an img with width and height, CSS `aspect-ratio: 16 / 9` does the same job: the browser gives it a height from its width straight away. It is the same layout-shift fix as the width and height attributes, expressed in CSS.',
      pitfall: 'A fixed pixel height that happens to look right on your screen is not the same thing; it breaks as soon as the image is shown at a different width.',
    },
    {
      title: 'Treat the hero image as special',
      excerpt: { from: '<strong>For the LCP image specifically:</strong>', lines: 3 },
      detail:
        'The hero in the first component has loading="eager" and fetchPriority="high", which tells the browser to start downloading it ahead of other images. Lazy-loading the hero does the opposite: it delays the very element LCP is measured against.',
      pitfall: 'The preload scanner (the part of the browser that reads ahead in the HTML to start downloads early) never sees an image set as a CSS background or inserted by JavaScript. For those the fix is `<link rel="preload" as="image">` in the head, not a priority attribute.',
    },
  ],
  graded: [
    { point: 'You can state the difference between srcset and sizes without hedging', why: 'srcset lists candidates with their real pixel widths; sizes declares the width the image will be shown at, so the browser can choose. This is the most common thing people get wrong, and it is asked precisely because it separates copied snippets from understanding.' },
    { point: 'You know srcset and <picture> solve different problems', why: 'srcset + sizes is resolution switching: the same image at several sizes. <picture> + type is format negotiation or art direction. Reaching for <picture> to do resolution switching signals you have only seen one recipe.' },
    { point: 'Layout shift is prevented structurally, not visually', why: 'width and height attributes, or CSS aspect-ratio, reserve the box up front. A fixed height that happens to look right is not the same thing and breaks the moment the image is responsive.' },
    { point: 'You never lazy-load the LCP image, and you say so unprompted', why: 'It is a one-attribute regression to the metric you are being judged on, and volunteering it shows you think about loading order rather than reciting attributes.' },
    { point: 'alt text describes purpose, and decorative images get alt=""', why: 'An empty alt tells a screen reader to skip the image; a missing alt makes many screen readers read out the file name instead. They are opposites, not degrees of the same thing.' },
  ],
};

const protectedRoute: BuildExplanation = {
  kind: 'build',
  problem: 'Protected Route (Auth + RBAC)',
  problemStatement:
    'Gate a page behind login, gate an admin page behind a role (RBAC, role-based access control: permissions granted by role such as "admin" rather than per user), and return the user to where they were going once they sign in. Authentication is who you are; authorization is what you may do. They are two different checks that fail differently.',
  buildOrder: [
    {
      title: 'Model the session as three states, not a boolean',
      excerpt: { from: "const [status, setStatus] = React.useState('loading');", lines: 2 },
      detail:
        'Until the saved session has been checked you are neither logged in nor logged out, so status starts as \'loading\' and only later becomes \'authenticated\' or \'anonymous\'. A boolean cannot say "not known yet", so it defaults to false, which reads as "logged out" for the few hundred milliseconds the check takes.',
      pitfall: 'That default is the single most common bug in this exercise: every user gets bounced to login on every refresh, and it only reproduces when the session check is slow enough to notice.',
    },
    {
      title: 'Restore the session once, on mount',
      excerpt: { from: 'restoreSession().then(session => {', lines: 6 },
      detail:
        'restoreSession stands in for asking the server whether the stored token is still valid; here it waits 700 ms and resolves with no session. When it answers, status moves out of \'loading\'. The cancelled flag, flipped by the cleanup, stops a late answer updating a provider that has already unmounted.',
      pitfall: 'Setting status before the check finishes (for example defaulting to \'anonymous\') brings back the refresh-logs-you-out bug from the previous step.',
    },
    {
      title: 'Share the session through context',
      excerpt: { from: 'const value = React.useMemo(() => ({ status, user, login, logout }), [status, user]);', lines: 4 },
      detail:
        'The provider puts status, user and the login/logout functions on context, and useAuth is a one-line hook for reading it. useMemo keeps the same value object until status or user changes, so consumers do not re-render just because the provider did. In React 19 the context object itself can be rendered as the provider, which is what `<AuthContext value={value}>` does.',
      pitfall: 'Building a new `{ status, user }` object inline on every render gives every consumer a "changed" value each time, re-rendering the whole tree under the provider.',
    },
    {
      title: 'Render the redirect as a component, never perform it during render',
      excerpt: { from: 'function Redirect({ to, onRedirect }) {', lines: 14 },
      detail:
        'Calling the parent\'s setState while the gate is rendering produces "Cannot update a component while rendering a different component": React is part-way through one component and cannot take an update to another. Redirect instead does its work in an effect, which runs after React has finished putting the render on screen. This is why react-router gives you `<Navigate />` as a component rather than a navigate() you call inline.',
      pitfall: 'The fire-once ref is load-bearing. onRedirect is a new function on every parent render, so without the ref a redirect that does not unmount immediately would fire again on every render, an infinite loop.',
    },
    {
      title: 'Gate step 1: while the session is unknown, decide nothing',
      excerpt: { from: "if (status === 'loading') return <p style={{ color: '#888' }}>Checking session…</p>;", lines: 1 },
      detail:
        'Protected reads the session from useAuth and checks three things in priority order. The first is "we do not know yet", and the only correct answer to that is a neutral placeholder: neither the page nor a redirect.',
      pitfall: 'Scattering `if (!user) navigate(...)` through fifty page components means fifty places to get this loading case wrong, and no single place to read the policy.',
    },
    {
      title: 'Gate step 2: not signed in, so redirect to login (the 401 case)',
      excerpt: { from: "if (status === 'anonymous') return <Redirect to=\"login\" onRedirect={onRedirect} />;", lines: 1 },
      detail:
        'Anonymous means "we do not know who you are", which HTTP calls 401 Unauthorized. Logging in fixes it, so the gate renders a Redirect to the login page.',
    },
    {
      title: 'Gate step 3: signed in with the wrong role, so show Forbidden (the 403 case)',
      excerpt: { from: 'if (requireRole && user.role !== requireRole) {', lines: 11 },
      detail:
        'Signed in but missing the role means "we know exactly who you are, and the answer is no", which HTTP calls 403 Forbidden. Logging in again changes nothing, so the gate shows a Forbidden message naming the role the page needs. Only if all three checks pass does it render its children.',
      pitfall: 'Sending a signed-in user with the wrong role back to login produces the loop where they sign in successfully and land right back where they started.',
    },
    {
      title: 'Remember the destination and return to it after login',
      excerpt: { from: 'const redirectToLogin = (target) => { setIntended(page); setPage(target); };', lines: 1 },
      detail:
        'Before switching to the login page, redirectToLogin saves the page the user was trying to reach in `intended`. The login buttons then call `setPage(intended || \'home\')`, so login is a detour rather than a reset. With a real router you would also pass `replace` so the guarded URL is replaced in history and Back does not walk into the gate again.',
      pitfall: 'Only honour an internal path. Taking the return target from a query string without checking it lets an attacker craft a login link that sends users to their site afterwards (an open-redirect bug).',
    },
    {
      title: 'Declare each page\'s requirement where it is rendered',
      excerpt: { from: '<Protected requireRole="admin" onRedirect={redirectToLogin}>', lines: 3 },
      detail:
        'Pages do not implement the policy, they declare it: the dashboard wraps itself in `<Protected>` and the admin panel in `<Protected requireRole="admin">`. The rules live in one component, so changing them is a one-place edit.',
    },
  ],
  graded: [
    { point: 'The loading state is handled explicitly', why: 'It is the difference between a route guard that works and one that logs everyone out on refresh. Interviewers watch for it, because the naive version passes a quick manual test on a fast connection.' },
    { point: 'A redirect is treated as a side effect', why: 'Rendered, not called. Getting this wrong produces a console warning that most candidates cannot explain, and the fix is the same reason <Navigate /> exists at all.' },
    { point: '401 and 403 lead to different places', why: 'It shows you understand the two checks are independent. A single "not allowed" branch collapses them and produces the sign-in loop.' },
    { point: 'You volunteer that this is UX only, not security', why: 'Anyone with devtools can edit client state, so a hidden button is not a permission. Every protected route must be backed by the server checking authorization on each API call; saying it unprompted is the senior signal here.' },
    { point: 'The policy lives in one component', why: 'Role checks duplicated across pages drift, and when the rule changes you cannot list every place to update. One gate is also the thing you can test.' },
  ],
};

const miniReduxStore: BuildExplanation = {
  kind: 'build',
  problem: 'Mini Redux Store',
  problemStatement:
    'Implement the store Redux actually gives you (getState, dispatch, subscribe), then bind it to React so a component re-renders only when its own slice of the state (the part of the state object it reads, such as `count`) changes. The point is being able to explain why this exists alongside React Context rather than being replaced by it.',
  buildOrder: [
    {
      title: 'Hold the state, the listeners, and a dispatch that runs the reducer',
      excerpt: { from: 'function createStore(reducer, initialState, middleware) {', lines: 9 },
      detail:
        'The state lives in a closure variable, so the only way to read or change it is through the store\'s methods. Calling the reducer once with a dummy `@@INIT` action fills in its defaults. dispatch replaces the state with whatever the reducer returns, then calls every listener with no arguments; listeners read the new state themselves.',
      pitfall: 'Passing the state to listeners looks convenient, but then a listener holding an old copy has no way to ask for the current one.',
    },
    {
      title: 'Expose the three-method contract',
      excerpt: { from: 'const store = {', lines: 5 },
      detail:
        'getState returns the current state, dispatch sends an action, and subscribe adds a listener and returns a function that removes it again. That is the entire public API of a Redux store.',
      pitfall: 'subscribe must return its own unsubscribe. Returning nothing leaks a listener for every component that ever mounted.',
    },
    {
      title: 'Write a pure reducer',
      excerpt: { from: 'function reducer(state = initial, action) {', lines: 8 },
      detail:
        'A reducer takes the current state and an action and returns the next state. It is pure: same input, same output, no mutation and no side effects. Each case spreads the old state into a new object, and an unknown action returns the same object, which tells everything downstream "nothing changed".',
      pitfall: 'Mutating (`state.count++; return state`) returns the same reference, so every equality check downstream decides nothing changed and the UI never updates.',
    },
    {
      title: 'Add middleware by wrapping dispatch',
      excerpt: { from: 'if (middleware) store.dispatch = middleware(store)(baseDispatch);', lines: 1 },
      detail:
        'Middleware is a function that receives the store, then the next dispatch in the chain, and returns a new dispatch. createStore swaps the store\'s dispatch for the wrapped one, so every action passes through the middleware before reaching the reducer.',
    },
    {
      title: 'Write the logger middleware',
      excerpt: { from: 'const logger = (store) => (next) => (action) => {', lines: 4 },
      detail:
        'The store => next => action shape is exactly how redux-thunk, redux-saga and the devtools hook in. This one logs the action and a preview of the next state, then calls next(action) to pass it on. redux-thunk is the same idea: one middleware that calls the action instead of passing it on when the action is a function.',
      pitfall: 'Forgetting to call next(action) silently swallows every action: nothing reaches the reducer.',
    },
    {
      title: 'Bind to React with useSyncExternalStore',
      excerpt: { from: 'function useSelector(selector) {', lines: 8 },
      detail:
        'useSyncExternalStore is React\'s built-in hook for reading a store that lives outside React. It subscribes, reads a snapshot, and re-renders when the snapshot changes. It also prevents tearing: during concurrent rendering (where React can pause a render part-way and resume later) two components could otherwise show different versions of the same state in one frame. The third argument is the snapshot used for server rendering.',
      pitfall: 'useState + useEffect looks equivalent and is not: a dispatch that lands between the render and the effect subscribing is missed, and nothing protects against tearing.',
    },
    {
      title: 'Give dispatch its own hook',
      excerpt: { from: 'function useDispatch() {', lines: 3 },
      detail:
        'Components that only send actions should not subscribe to anything, so useDispatch reads the store from context and returns its dispatch. The store object itself never changes, so reading it from context never causes a re-render.',
    },
    {
      title: 'Make the selector the unit of subscription',
      excerpt: { from: 'const count = useSelector(s => s.count);', lines: 3 },
      detail:
        'Every listener runs on every dispatch, but React compares the selector\'s result with the last one using Object.is and skips the re-render when it is the same. Adding a todo leaves `s.count` unchanged, so Counter\'s render count does not move. That is the real answer to "why not just Context?": a Context value change re-renders every consumer, whichever field moved.',
      pitfall: 'A selector that returns a new object on every call (`s => ({ c: s.count })`) never compares equal. With this binding React warns "The result of getSnapshot should be cached" and throws "Maximum update depth exceeded"; the fix is to select primitives, memoise the selector (reselect), or compare shallowly (Zustand\'s useShallow).',
    },
    {
      title: 'Provide the store at the top',
      excerpt: { from: '<StoreContext value={store}>', lines: 4 },
      detail:
        'Context carries the store object, not the state. The value never changes, so the provider itself triggers no re-renders; all updates arrive through the selector subscriptions.',
    },
  ],
  graded: [
    { point: 'You can state the three-method contract and why the reducer is pure', why: 'getState, dispatch, subscribe is the whole store. Purity is what makes time-travel debugging (stepping back through past states), replay and reference-equality checks possible, and mutating state inside a reducer breaks all three at once.' },
    { point: 'useSyncExternalStore, and you can say what tearing is', why: 'useState + useEffect works by accident until concurrent rendering interrupts a render, at which point two components can display different values of the same state. Naming that failure is the senior signal.' },
    { point: 'Selector isolation is your answer to "why not Context?"', why: 'Context re-renders every consumer on any change; a selector re-renders only the components whose slice changed. That single difference is the reason this whole category of library exists, and it is what the question is really probing.' },
    { point: 'You know what you would actually reach for', why: 'Redux Toolkit for large shared client state, Zustand for something lighter, TanStack Query for server state (data fetched from an API), which is most of what people wrongly keep in Redux. Building it by hand is the exercise, not the recommendation.' },
  ],
};

const clientCache: BuildExplanation = {
  kind: 'build',
  problem: 'Client Cache (stale-while-revalidate)',
  problemStatement:
    'Build the caching behaviour TanStack Query and SWR give you: serve the cached value instantly on a revisit, refresh it in the background (stale-while-revalidate: show the possibly-old copy now and fetch a fresh one behind it), and make sure two components asking for the same key share one request rather than firing two.',
  buildOrder: [
    {
      title: 'Keep two maps: the data, and the requests in flight',
      excerpt: { from: 'const queryCache = new Map();', lines: 4 },
      detail:
        'queryCache stores each key\'s data together with the time it was fetched. inflight stores the promise of any request that has started but not finished. STALE_MS says how long an entry counts as fresh: 5 seconds here.',
      pitfall: 'Naming the map `cache` would not compile in the playground, because React exports a function called cache and every React export is in scope.',
    },
    {
      title: 'Share one request per key',
      excerpt: { from: 'function getOrFetch(key, fetcher) {', lines: 9 },
      detail:
        'If a request for this key is already running, the caller gets the same promise instead of starting another. Otherwise the request starts, its result is written to queryCache with a timestamp, and the promise is recorded in inflight. `finally` removes the inflight entry whether the request succeeded or failed.',
      pitfall: 'Leave the inflight entry in place and the key is stuck forever: every later caller gets the same finished promise, so a failure is never retried and a success is never refreshed.',
    },
    {
      title: 'Initialise state from the cache, not from null',
      excerpt: { from: 'const [data, setData] = React.useState(entry ? entry.data : null);', lines: 3 },
      detail:
        'The hook reads the cache during render and uses the cached data as the initial state, so a revisit shows real data on the very first frame. Starting at null and filling it in an effect would show a loading message over data you already had.',
      pitfall: 'That flash is the whole reason this pattern exists: a spinner covering content the user just saw feels slower than no cache at all.',
    },
    {
      title: 'On key change, show what the cache has and decide whether to refetch',
      excerpt: { from: 'let cancelled = false;', lines: 8 },
      detail:
        'The effect runs on mount and whenever the key changes. It shows whatever the cache has for the new key (or null), then checks the age: an entry younger than STALE_MS is fresh, so the effect returns without any request.',
      pitfall: 'Skipping `setData` here would leave the previous user\'s data on screen after switching id, because useState only uses its initial value on the first render.',
    },
    {
      title: 'Revalidate in the background, and ignore answers for an old key',
      excerpt: { from: 'setRevalidating(true);', lines: 7 },
      detail:
        'For a stale or missing entry it flags isRevalidating and asks getOrFetch, which may join a request already in flight. When the answer lands it replaces the data, or records the error. The cleanup sets `cancelled`, so a response for a key the user has already left is ignored.',
      pitfall: 'The cancelled flag is not optional. Switch users quickly and a slow first response can land after a fast second one and overwrite it (the out-of-order race).',
    },
    {
      title: 'Render stale data with a quiet refreshing hint',
      excerpt: { from: '{isRevalidating && <span', lines: 1 },
      detail:
        'UserPanel shows the loading message only when there is no data at all. While a background refresh runs, the cached data stays on screen and a small "refreshing…" note appears beside it. The template mounts UserPanel twice with the same id to show that both share one request.',
    },
    {
      title: 'Know the boundary of what you built',
      detail:
        'About forty lines gets you caching, de-duplication and background refresh. TanStack Query adds retries with backoff (waiting longer after each failure), revalidation when the window regains focus or the network reconnects, garbage collection of unused keys, pagination and infinite-query helpers, invalidating queries after a mutation, and devtools.',
      pitfall: 'Claiming the hook replaces the library is the answer that loses points. Naming what is missing is the one that gains them.',
    },
  ],
  graded: [
    { point: 'Stale-while-revalidate, stated as a deliberate trade', why: 'You are choosing to show possibly-old data immediately rather than correct data a moment later. That is the right default for most reads and the wrong one for a bank balance or a stock level; knowing which is which is the point.' },
    { point: 'Request de-duplication via an inflight map', why: 'It is the difference between one request and one per consumer. Naive hooks that fire N requests for N components are a very common production bug, and this map is the fix.' },
    { point: 'State initialised from the cache during render', why: 'Filling it in an effect guarantees a loading flash on every revisit, which defeats the cache visually even though it technically worked.' },
    { point: 'The out-of-order response race is handled', why: 'Any component that refetches on a changing key has this bug latent in it. Interviewers probe by asking what happens if you switch fast.' },
  ],
};

const webSocketFeed: BuildExplanation = {
  kind: 'build',
  problem: 'WebSocket Live Feed',
  problemStatement:
    'Connect on mount, show connection status, reconnect sensibly after a drop, and keep the message buffer bounded. A WebSocket is a connection that stays open so the server can push messages at any time. Its lifecycle (open, message, close, reconnect) is the whole exercise; rendering the messages is the easy part.',
  buildOrder: [
    {
      title: 'Keep the connection details in refs',
      excerpt: { from: 'const socketRef = React.useRef(null);', lines: 4 },
      detail:
        'status and messages are state because the screen shows them. The socket, the retry attempt count, the pending retry timer and the "we closed it ourselves" flag are refs: values that survive re-renders but do not cause one when they change, which is right for bookkeeping the UI never displays.',
      pitfall: 'Holding the attempt count in state would re-render on every retry and, worse, the onclose handler would read the value from the render it was created in, not the current one.',
    },
    {
      title: 'Open the socket and reset the backoff when it connects',
      excerpt: { from: 'const connect = () => {', lines: 10 },
      detail:
        'connect sets the status to "connecting" on the first try and "reconnecting" after that, creates the socket (a FakeSocket here, with the same surface as a real WebSocket), and keeps it in a ref so cleanup can find it. When the connection opens, the attempt count goes back to 0 and the status becomes "open".',
      pitfall: 'Reset the attempt counter inside onopen. Leave it climbing and a tab that has been open for days waits the full 30-second cap after a one-second blip.',
    },
    {
      title: 'Keep the message buffer bounded',
      excerpt: { from: 'socket.onmessage = (event) => {', lines: 5 },
      detail:
        'Each message arrives as a JSON string, is parsed, and is put at the front of the list; slice then keeps only the newest MAX_MESSAGES (8). A real feed runs for hours, and an unbounded array grows until the tab slows down and then crashes, a leak that never shows in a five-minute demo.',
      pitfall: 'Slicing the wrong end keeps the oldest messages and silently stops showing new ones.',
    },
    {
      title: 'Reconnect after a drop with exponential backoff and full jitter',
      excerpt: { from: 'socket.onclose = () => {', lines: 9 },
      detail:
        'On an unexpected close the status becomes "closed" and a retry is scheduled. Exponential backoff doubles the maximum wait each attempt (500 ms, 1 s, 2 s, capped at 30 s) so a struggling server is not hammered. Full jitter then picks a random delay between 0 and that maximum, so thousands of clients dropped by the same server restart do not all reconnect at the same instant and knock it over again.',
      pitfall: 'Without the `closedByUs` check at the top, your own close() during unmount would look like a drop and start reconnecting a component that no longer exists.',
    },
    {
      title: 'Connect on mount, and clean up on unmount without triggering a reconnect',
      excerpt: { from: 'connect();', lines: 7 },
      detail:
        'The effect has an empty dependency list, so it connects once when the component mounts. The cleanup sets closedByUs first, so the close it is about to cause is not treated as a failure, then cancels any pending retry timer and closes the socket.',
      pitfall: 'In development, StrictMode (React\'s checking mode) runs every effect, its cleanup, and the effect again on mount. If cleanup is missing you see two sockets straight away, which is exactly what StrictMode is for.',
    },
    {
      title: 'Make the connection state visible and announced',
      excerpt: { from: '<span aria-live="polite" style={{ fontSize: 13 }}>{status}</span>', lines: 1 },
      detail:
        'The coloured dot shows the state at a glance, and the status word next to it sits in an aria-live="polite" region, which a screen reader announces whenever its text changes, after it finishes what it is currently saying. Users need to know whether what they are looking at is current.',
      pitfall: 'Colour alone fails colour-blind users and anyone not looking at that corner of the screen.',
    },
    {
      title: 'Key the messages by their id',
      excerpt: { from: '{messages.map(m => (', lines: 5 },
      detail:
        'New messages are added at the top, which shifts every index. Keying by the message id lets React keep each existing row\'s DOM node and add only one new node per message.',
      pitfall: 'An index key would make React rewrite the text of every row on each message, because every row\'s index changes.',
    },
  ],
  graded: [
    { point: 'Cleanup, plus a flag so your own close does not trigger a reconnect', why: 'This is the classic version of the bug: navigate away and the page keeps opening sockets forever. It is invisible locally and obvious in production connection counts.' },
    { point: 'Backoff with jitter, capped, and the counter reset on open', why: 'Each of those three is a separate incident waiting to happen: hammering a struggling server, every client retrying at once, and a tab that takes 30 seconds to recover from a blip.' },
    { point: 'The buffer is bounded', why: 'It shows you are thinking about a session that lasts hours rather than a demo that lasts a minute. Unbounded accumulation is the most common React memory leak after listeners that are never removed.' },
    { point: 'You can name what comes next', why: 'Heartbeats (a small ping every few seconds) to detect a half-open connection, where the network still thinks it is fine but nothing flows; sequence numbers on messages to detect gaps and replay after a reconnect; and batching high-frequency messages into one update per animation frame (requestAnimationFrame) so 1000 messages a second is not 1000 renders.' },
  ],
};

const optimisticUI: BuildExplanation = {
  kind: 'build',
  problem: 'Optimistic UI Updates',
  problemStatement:
    'Show the result of an action immediately, before the server has confirmed it (that is what "optimistic" means), then reconcile with the server\'s answer. Anyone can render early; the graded half is the failure path: what the UI does when the request fails.',
  buildOrder: [
    {
      title: 'Fake a server that can fail on demand',
      excerpt: { from: 'function saveTodo(text) {', lines: 8 },
      detail:
        'saveTodo waits 900 ms and then either resolves with a saved todo (with a server id) or rejects when the text contains "fail". Being able to trigger the failure on purpose is what lets you test the rollback, which is the half that matters.',
    },
    {
      title: 'React 19: derive a list that includes the pending item',
      excerpt: { from: 'const [optimisticTodos, addOptimistic] = React.useOptimistic(', lines: 4 },
      detail:
        'useOptimistic takes the real state and a function that says how to add a pending value to it, and returns a view of the list with the pending item included. React throws that optimistic layer away by itself once the action finishes, so there is no rollback code to write.',
      pitfall: 'The optimistic update must happen inside a transition or a form action (work React tracks as pending until it finishes). Outside one, React warns and does not keep the optimistic value, so nothing appears to happen.',
    },
    {
      title: 'React 19: add the pending item, then save for real',
      excerpt: { from: 'async function onSubmit(formData) {', lines: 14 },
      detail:
        'Passed as `<form action>`, onSubmit receives the form\'s data rather than an event, and React runs it as an action, which is the transition useOptimistic needs. It shows the pending item, awaits the server, and on success appends the saved todo to the real list. On failure it only records the error; the pending item vanishes by itself when the action ends.',
      pitfall: 'Appending here is correct only because the optimistic entry is discarded automatically. In the manual version below the same line would leave a duplicate.',
    },
    {
      title: 'Mark pending items visibly as not yet saved',
      excerpt: { from: '{optimisticTodos.map(t => (', lines: 4 },
      detail:
        'An optimistic row that looks identical to a saved one is a lie the user cannot detect. Dimming it and adding "(saving…)" keeps the UI honest about what is still in flight.',
      pitfall: 'Disabling the input while the request runs throws away most of the benefit; the point was to let the user keep going.',
    },
    {
      title: 'Manual version: snapshot, then add a temporary item',
      excerpt: { from: 'async function add(text) {', lines: 5 },
      detail:
        'This is what useOptimistic replaces, and you should be able to write it for React 18. Keep a copy of the list as it was, then add the new item straight away with a temporary id and a pending flag.',
      pitfall: 'The snapshot is the list at the moment of this click. If two adds are in flight and the first fails, restoring its snapshot also removes the second one; a sturdier rollback removes just the temp id.',
    },
    {
      title: 'Manual version: replace the temp item on success, restore on failure',
      excerpt: { from: '// Replace the temp entry rather than appending', lines: 6 },
      detail:
        'On success, the temporary entry is swapped for the saved one by matching the temp id, so the list keeps its order and the server id takes over. On failure, the snapshot is put back and the error is shown.',
      pitfall: 'Appending the saved item instead of replacing the temp one leaves a duplicate on screen, the most common bug in the manual version.',
    },
    {
      title: 'Decide where optimism is appropriate',
      detail:
        'Optimistic updates suit actions that almost always succeed, are low-stakes and can be undone: likes, todos, reordering, marking as read. The user loses little if the rare failure rolls back.',
      pitfall: 'For a payment or anything irreversible, show a real pending state. A charge that appears to succeed and then silently reverts is far worse than a spinner.',
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
    'Load a component only when it is needed (code splitting: shipping it in a separate file, a chunk, that downloads on demand), show something useful while it arrives, and handle the case where it never does. Suspense covers the waiting state only; the failure half is yours.',
  buildOrder: [
    {
      title: 'Split at the import, not in the component',
      excerpt: { from: "//     const Heavy = React.lazy(() => import('./HeavyChart'));", lines: 3 },
      detail:
        'In a real app the dynamic `import()` is what makes the bundler (Vite, webpack) put the component in its own chunk; React.lazy is only the wrapper that lets you render the result. Both halves are required, because lazy around a component you already imported normally splits nothing.',
      pitfall: 'React.lazy expects a module with a default export. For a named one: `() => import("./x").then(m => ({ default: m.Named }))`.',
    },
    {
      title: 'Wrap a promise of { default: Component } in React.lazy',
      excerpt: { from: 'const LazyPanel = React.lazy(() =>', lines: 3 },
      detail:
        'The playground has no module system, so a 1.2-second timer stands in for the network and resolves with `{ default: HeavyPanel }`, the same shape `import()` gives you. React calls this function the first time LazyPanel renders and remembers the result, so the load happens once.',
    },
    {
      title: 'Write an error boundary, because Suspense will not catch a failed load',
      excerpt: { from: 'class LoadErrorBoundary extends React.Component {', lines: 14 },
      detail:
        'An error boundary is a class component with getDerivedStateFromError; when anything below it throws during render, React calls that method and the boundary renders its error UI instead of unmounting the whole app. Suspense handles "not ready yet", not "failed". The usual cause is not a bug in your code but a deploy replacing the chunk files under an open tab, which fails with ChunkLoadError.',
      pitfall: 'This Retry only clears the boundary\'s error. React.lazy remembers a failed load and throws the same error again without calling its function, so a real retry needs a fresh lazy() or, for a stale-chunk failure, a page reload.',
    },
    {
      title: 'Put the boundaries around the part that is loading',
      excerpt: { from: '{show && (', lines: 7 },
      detail:
        'The error boundary sits outside Suspense, and both wrap only the lazy panel, which is only mounted once "Load panel" is clicked. While the chunk loads, just this region shows "Loading panel…" and everything else on the page stays interactive.',
      pitfall: 'A boundary at the root blanks the whole page for one lazy panel. Make the fallback roughly the size of what replaces it, too; a tiny spinner standing in for a 600px chart shifts the layout the moment it resolves.',
    },
    {
      title: 'Suspense for data: a resource that throws while it is pending',
      excerpt: { from: 'function createResource(promise) {', lines: 14 },
      detail:
        'createResource tracks a promise\'s status. read() throws the promise itself while it is pending, which is how a component tells the nearest Suspense "not ready": React shows the fallback and retries the render when that promise settles. After that, read() either returns the value or throws the error for the error boundary.',
      pitfall: 'Create the resource outside the component (as userResource is here). Creating it during render makes a new promise every render, so the component suspends forever. React 19\'s `use(promise)` is the supported version of this pattern, and it has the same rule.',
    },
    {
      title: 'Read the resource as if the data were already there',
      excerpt: { from: 'function UserCard() {', lines: 4 },
      detail:
        'UserCard has no loading state of its own: it calls read() and renders the user. The waiting is handled by the Suspense boundary around it and the failure by the error boundary, which is the whole appeal of the pattern.',
    },
    {
      title: 'Use a transition when you would rather not show the fallback',
      detail:
        'When an update would suspend something already on screen, wrapping it in startTransition (or useTransition) tells React the update is not urgent. React then keeps the current UI visible while the new one loads and gives you isPending to show a subtle indicator, instead of replacing the content with a fallback.',
    },
  ],
  graded: [
    { point: 'You split at route boundaries first', why: 'That is where the payoff is. Splitting a small component adds a network round trip to save a couple of kilobytes, which is usually a net loss.' },
    { point: 'Suspense is paired with an error boundary', why: 'Suspense covers only the pending state. Without a boundary, a chunk that returns 404 after a deploy blanks the app, and that is a routine event, not an edge case.' },
    { point: 'The boundary is scoped, and the fallback is sized', why: 'A root-level boundary makes one lazy panel blank the page; a fallback of the wrong size trades a loading state for a layout shift.' },
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
      title: 'Start from the data you were given',
      excerpt: { from: 'const data = {', lines: 8 },
      detail:
        'The "JSON file" is a team name plus an array of members, and each member has an id. Read the shape before writing JSX: the id is what will make a good key, and `members` is the array you will map over.',
    },
    {
      title: 'Destructure the prop at the signature, and read it defensively',
      excerpt: { from: 'function TeamDirectory({ data }) {', lines: 3 },
      detail:
        '`{ data }` in the parameter list documents what the component consumes right where a reader looks for it. `data?.members` returns undefined instead of throwing when data is missing, and `?? []` turns undefined or null into an empty array, so the code below can always call .map and .length.',
      pitfall: 'Reaching through `props.data.members.length` in JSX throws a TypeError the first time the shape is not what you assumed, with no clue which link in the chain was missing.',
    },
    {
      title: 'Handle empty before you handle full',
      excerpt: { from: 'if (members.length === 0) {', lines: 3 },
      detail:
        'An empty array would otherwise render a heading and an empty list, which looks much like a broken component. An explicit message tells the user "there is no data" rather than leaving them to guess whether something failed. App renders a second directory with no members to prove this branch works.',
      pitfall: 'This is the step most candidates skip, and it is noticed precisely because it takes one line.',
    },
    {
      title: 'Derive the count rather than storing it',
      excerpt: { from: "{members.length} {members.length === 1 ? 'member' : 'members'}", lines: 1 },
      detail:
        'Anything computable from props during render should be computed, not copied into state. State would need updating every time the data changed and can fall out of step; a value worked out from the array on each render cannot. The ternary picks "member" or "members" so the label reads correctly for one person.',
    },
    {
      title: 'Key each row by its id, never by index',
      excerpt: { from: "{members.map(({ id, name, role, location }) => (", lines: 3 },
      detail:
        'The key tells React which item is which across renders. An index only says "the thing in position 3", so inserting at the top renumbers everything and React pairs the wrong data with each existing row, losing things like typed input or focus. Destructuring each member in the map callback keeps the JSX short.',
      pitfall: 'Index keys look correct until the list is reordered, filtered or inserted into, which is why this is such a reliable interview probe.',
    },
  ],
  graded: [
    { point: 'A stable key that is not the array index', why: 'It is the most reliable signal in this exercise. Index keys pass a static demo and break on the first insertion, so interviewers use it to tell recall from understanding.' },
    { point: 'Props destructured, access defensive', why: 'It shows you write components that state their contract and fail readably when the data does not match, rather than crashing three levels deep inside a JSX expression.' },
    { point: 'The empty state exists', why: 'Most candidates render only the happy path. Handling empty unprompted signals you think about what the user sees when the data is not there.' },
    { point: 'Counts are derived, not stored', why: 'Duplicating derivable data in state is the root of a whole class of out-of-sync bugs, and it is the same instinct that leads to storing filtered lists in state later on.' },
  ],
};

const jsonApiFetch: BuildExplanation = {
  kind: 'build',
  problem: 'JSON → API → React fetch',
  problemStatement:
    'Serve a JSON file from an endpoint and render it in React. The server half is a few lines; the interesting half is on the client: every state the request can be in, and the two ways a naive fetch goes wrong (a failed response treated as success, and a request that outlives its component).',
  buildOrder: [
    { title: 'Server: read the file once and return it from a route', excerpt: { from: "// const jobs = JSON.parse(await readFile('./data/jobs.json', 'utf-8'));", lines: 8 }, detail: 'The commented-out Express server (Express is the usual minimal Node.js web framework) reads jobs.json once at startup, so a broken file fails immediately rather than on the first request. `/api/jobs` returns the whole list, and `/api/jobs/:id` returns one job or a 404 with a JSON error body.', pitfall: 'Reading the file inside the route handler re-reads the disk on every request. The cors line above it matters too: without it the browser blocks the React dev server, which runs on a different port, from reading the response.' },
    { title: 'Stand in for the network with the same shape', excerpt: { from: 'function fakeFetch(url, { signal } = {}) {', lines: 11 }, detail: 'The playground cannot run the server, so fakeFetch resolves after 700 ms with an object shaped like a real fetch response: `ok`, `status`, and a `json()` that returns a promise. It also listens for the abort signal and rejects with an AbortError, exactly as a real fetch does when cancelled.' },
    { title: 'Model the request as one status, not three booleans', excerpt: { from: "const [state, setState] = React.useState({ status: 'loading'", lines: 1 }, detail: 'isLoading plus isError can represent states that cannot happen: both true, or both false with no data. A single status field ("loading", "success" or "error") makes those combinations impossible, and the render becomes a simple switch on it.', pitfall: 'Three booleans is how you end up with a spinner and an error message on screen at the same time.' },
    { title: 'Throw on a non-2xx response yourself', excerpt: { from: "if (!res.ok) throw new Error(`HTTP ${res.status}`);", lines: 2 }, detail: 'fetch rejects only on a network failure. A 500 with an HTML error page resolves normally with `ok: false`, and `.json()` then throws a confusing "unexpected token" error, or parses something you render as if it were data. Throwing sends the bad status into the same catch as a network failure.', pitfall: 'This catches more real bugs than any other line in the function, and it is absent from most first drafts.' },
    { title: 'Abort on cleanup, and do not treat the abort as an error', excerpt: { from: "if (err.name === 'AbortError') return;", lines: 6 }, detail: 'The cleanup aborts the request if the component unmounts before it finishes, so no state update lands on an unmounted component. If the effect had dependencies (a URL or an id), the same cleanup would cancel the old request before the new one starts, so a slow first response could not overwrite a fast second one. The AbortError check stops your own cancellation showing up as a failure.', pitfall: 'Showing "Something went wrong" every time the user navigates away quickly is the signature of a missing AbortError check.' },
    { title: 'Render every branch, including empty', excerpt: { from: "if (status === 'loading') return <p style={{ color: '#888' }}>Loading jobs…</p>;", lines: 3 }, detail: 'Four outcomes, four branches: loading, error, an empty list, and the list itself. Empty is different from loading and from error, and treating them as one is what produces a blank panel with no explanation.' },
    { title: 'Key each job by its id', excerpt: { from: '{data.map(job => (', lines: 2 }, detail: 'The server data already has a stable id per job, so the list uses it as the key. That keeps each row matched to the same DOM node if the list is later sorted or filtered.' },
  ],
  graded: [
    { point: 'Four states, not one: loading, error, empty, success', why: 'Most candidates render only success. The others are where real users spend their frustrating moments, and each needs a different thing from the UI.' },
    { point: 'You know fetch does not reject on HTTP errors', why: 'It is the most common misconception about fetch, and it means a 500 renders as success. The `if (!res.ok) throw` line is the whole fix.' },
    { point: 'AbortController on cleanup, with AbortError excluded', why: 'It fixes the out-of-order race and the state-update-after-unmount problem at once. Half the implementation (aborting, but reporting the abort as an error) is worse than neither.' },
    { point: 'You say this belongs in TanStack Query in production', why: 'Caching, de-duplication, retries and stale-while-revalidate (showing cached data while refetching behind it) are exactly the things a hand-rolled hook gets wrong over time. Writing it by hand is the exercise; shipping it by hand is the mistake.' },
  ],
};

const fetchUsersApi: BuildExplanation = {
  kind: 'build',
  problem: 'Fetch Users from an API',
  problemStatement:
    'Call a real endpoint, jsonplaceholder.typicode.com/users (a free public test API), and render the list, handling every state the request can be in, with a retry when it fails. This one actually hits the network, so every state is reachable.',
  buildOrder: [
    { title: 'Name the states before writing the request', excerpt: { from: "const [status, setStatus] = useState('loading');", lines: 4 }, detail: 'One status field ("loading", "error" or "done") can only hold one value, so the screen can never show a spinner and an error together. users and error hold the payload for each outcome, and `attempt` is a counter whose only job is to trigger a refetch when it changes.', pitfall: 'Rendering only the success path is the most common omission, and an interviewer checks it by throttling the network in devtools.' },
    { title: 'Start each attempt from a clean loading state', excerpt: { from: 'const ac = new AbortController();', lines: 3 }, detail: 'Every run of the effect creates a fresh AbortController (the browser object that can cancel a fetch) and resets status and error, so a retry after a failure shows "Loading users…" again instead of the old error.' },
    { title: 'With fetch, check res.ok yourself', excerpt: { from: "fetch(API, { signal: ac.signal })", lines: 7 }, detail: 'fetch rejects only on a network failure. A 404 or a 500 resolves with `ok === false`, so the check throws to send it to the catch below. Parsing the body with res.json() is a second asynchronous step, so it is returned and handled in the next .then.', pitfall: 'Without the check the symptom is an error about an unexpected token "<", because the code tried to parse an HTML error page as JSON.' },
    { title: 'Store the data, or the error, but never report your own abort', excerpt: { from: '.then(data => {', lines: 11 }, detail: 'On success the users are stored and status becomes "done". In the catch, an AbortError means the cleanup cancelled the request, which is not a failure, so it returns without touching state. Anything else is a real failure and is shown.', pitfall: 'Leaving out the AbortError check flashes an error message every time the user navigates away mid-request.' },
    { title: 'Abort on cleanup, and make retry go through the same effect', excerpt: { from: "return () => ac.abort();", lines: 2 }, detail: 'The effect depends on `attempt`, so bumping it re-runs the effect; the cleanup first cancels any request still in flight. That removes both the update-after-unmount problem and the race where a slow first response lands after a fast second one.', pitfall: 'A retry that calls fetch directly, outside the effect, bypasses the cancellation you just built.' },
    { title: 'Render the error with a way out', excerpt: { from: "if (status === 'error') {", lines: 10 }, detail: 'The error branch shows the message and a Try again button that increments attempt, which re-runs the effect above. A failed request the user cannot retry means a page reload is the only way out.' },
    { title: 'Render empty as its own outcome', excerpt: { from: 'if (users.length === 0) {', lines: 3 }, detail: 'A successful response can still contain no users. An empty list with no message looks identical to a broken component, so it gets its own "No users found." branch.' },
    { title: 'Key each user from the data', excerpt: { from: '{users.map(u => (', lines: 3 }, detail: '`u.id` is right there in the response, so there is no reason for an index key. Each branch above returns early, which keeps this final success render flat and readable.' },
  ],
  graded: [
    { point: 'All four request states are rendered', why: 'Loading, error, empty and success each need something different, and empty is distinct from both loading and failure. A blank panel with no explanation is what the user gets when they are treated as one.' },
    { point: 'You know fetch resolves on 4xx and 5xx', why: 'It is the defining gotcha of the API and the reason `if (!res.ok) throw` exists. Someone who omits it has usually only called endpoints that worked.' },
    { point: 'A failed request is recoverable without a page reload', why: 'A retry button is the difference between a dead end and a temporary problem. Routing it through the same effect keeps cancellation intact.' },
    { point: 'A stable key from the data', why: 'Falling back to the array index in a list that will later be sorted or filtered is the habit this exercise is watching for.' },
  ],
};

const pagination: BuildExplanation = {
  kind: 'build',
  problem: 'Pagination',
  problemStatement:
    'Fetch and display one page at a time, with Prev/Next and numbered controls, a loading state, and the current page marked. The controls are easy; the edges (first page, last page, requests that return out of order) and the accessibility are what is being watched.',
  buildOrder: [
    { title: 'Fake a paged API', excerpt: { from: 'function fakeFetch(page, perPage = 5) {', lines: 7 }, detail: 'The server returns one page of items plus the total item count, which is the shape most paged APIs use. Page 1 is items 0 to 4, page 2 is items 5 to 9, and so the slice starts at `(page - 1) * perPage`.', pitfall: 'Pages are numbered from 1 for the user but arrays from 0; forgetting the `- 1` skips the first five items.' },
    { title: 'Make the page number the one thing you choose', excerpt: { from: 'const [page, setPage] = React.useState(1);', lines: 3 }, detail: 'page is what the user controls. items and totalPages come back from the server for that page, and which button is highlighted or disabled is worked out from page and totalPages during render, so there is no second copy of "where am I" to fall out of step.', pitfall: 'If the total can shrink (say a filter leaves only two pages while you are on page 7), clamp page to the new total, or the user is stranded on an empty page. This template\'s total never changes, so it does not need to.' },
    { title: 'Fetch whenever the page changes', excerpt: { from: 'React.useEffect(() => {', lines: 8 }, detail: 'The effect depends on page, so every page change sets loading, fetches that page, and stores the items and the page count. totalPages is the item total divided by the page size, rounded up: 50 items at 5 per page is 10 pages.', pitfall: 'This effect has no cleanup, which is fine here because the fake API always answers in 300 ms. Against a real API, clicking 3 then 4 quickly can let page 3\'s answer land last and show page 3\'s items under a highlighted "4". The fix is an AbortController aborted in the cleanup, or an `ignore` flag set there.' },
    { title: 'Build the list of page numbers from the total', excerpt: { from: 'const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1);', lines: 1 }, detail: 'Array.from with a length and a mapping function produces [1, 2, …, totalPages], one entry per numbered button. Deriving it during render means it is always in step with the total.', pitfall: 'Rendering every page number works for 10 pages and breaks the layout at 500. Real pagers show the first, last and a window around the current page, with gaps marked by an ellipsis.' },
    { title: 'Show a loading state while the page arrives', excerpt: { from: '{loading ? (', lines: 3 }, detail: 'While a page is loading the list is replaced with "Loading...", otherwise the items are rendered with their id as the key.', pitfall: 'Swapping the whole list for one line of text makes the controls below jump up and down on every page change. Keeping the old rows on screen, dimmed, avoids the jump and feels faster.' },
    { title: 'Disable Prev and Next at the edges rather than hiding them', excerpt: { from: '<button disabled={page === 1} onClick={() => setPage(p => p - 1)}', lines: 3 }, detail: 'Prev is disabled on page 1 and Next on the last page (`page === totalPages`). A disabled control keeps the layout stable and still tells the user where they are; removing it would shift every button sideways at the boundaries.', pitfall: 'A disabled attribute is only as good as its condition. Before the first response totalPages is 0, so Next is briefly enabled; guarding the handler as well (`p => Math.min(p + 1, totalPages)`) closes that gap.' },
    { title: 'Mark the active page for screen readers, not just visually', excerpt: { from: 'aria-label={"Page " + n} aria-current={n === page ? "page" : undefined}', lines: 1 }, detail: 'aria-label makes each button read as "Page 3" rather than a bare "3". aria-current="page" is what tells a screen reader which one is active; the coloured background and bold text say nothing to someone who cannot see them.', pitfall: 'Wrapping the controls in `<nav aria-label="Pagination">` would also let screen-reader users jump straight to them; this template leaves that out.' },
  ],
  graded: [
    { point: 'Page is the state you choose; everything else derives', why: 'Storing the highlighted button or the visible slice as separate state is how the highlight and the content drift apart. Values worked out from page and the total during render cannot disagree.' },
    { point: 'You can name the out-of-order race and its fix', why: 'Any paged fetch has this race. Clicking through pages quickly is the first thing an interviewer tries, and the wrong-content-under-the-right-number bug is immediately visible against a real API. Aborting the old request in the effect cleanup fixes it.' },
    { point: 'Boundaries are handled in state, not just visually', why: 'Disabled buttons, a handler that cannot go past the ends, and clamping when the total changes: miss any one and there is a route to an empty page.' },
    { point: 'aria-current marks the active page', why: 'Without it the component cannot be used without seeing the highlight, and it is a one-attribute fix that most implementations omit.' },
  ],
};

const searchFilter: BuildExplanation = {
  kind: 'build',
  problem: 'Search Filter',
  problemStatement:
    'Filter a list as the user types, then answer the follow-up every interviewer asks: "now add debouncing" (waiting until the user pauses typing before doing the work). The template shows both side by side with counters, because the honest answer is that this list does not need it.',
  buildOrder: [
    { title: 'Write the filter as one shared pure function', excerpt: { from: 'function filterProducts(query) {', lines: 8 }, detail: 'filterProducts lower-cases and trims the query, returns every product for an empty query, and otherwise keeps products whose name or category contains it. Both versions call this same function, so they differ only in when they run it.' },
    { title: 'Store the query, derive the results', excerpt: { from: 'const runs = useRef(0);                    // instrumentation only', lines: 6 }, detail: 'The filtered list is a function of the query and the data, so it is computed during render rather than stored. useMemo re-runs the filter only when the query changes; `runs` is a ref (a value that persists across renders without causing one) used purely to count how often that happens.', pitfall: 'Calling setFiltered inside a useEffect that watches query is the classic "you did not need an effect" mistake: it renders twice per keystroke, and for one of those renders the list and the query disagree.' },
    { title: 'Count keystrokes next to filter runs', excerpt: { from: 'title="1 · Instant"', lines: 4 }, detail: 'Each change updates the query and bumps a keystroke counter. Panel shows both numbers, so you can see that the instant version runs the filter once per keystroke that changes the query.' },
    { title: 'When asked to debounce, debounce the value in a hook', excerpt: { from: 'function useDebouncedValue(value, delay) {', lines: 2 }, detail: 'useDebouncedValue returns a copy of `value` that only catches up after `delay` milliseconds without a change. It starts equal to the value, so the first render is not empty.' },
    { title: 'The cleanup is the debounce', excerpt: { from: 'useEffect(() => {', lines: 5 }, detail: 'Each new value starts a timer that will copy it into `debounced`. Before the effect runs again for the next keystroke, React runs the cleanup, which cancels the previous timer. So only the last keystroke of a burst survives long enough to fire.', pitfall: 'Without the cleanup every keystroke fires after the delay, which just postpones the work instead of reducing it.' },
    { title: 'Let the input use the live query, and the work use the debounced one', excerpt: { from: 'const [query, setQuery] = useState("");           // drives the INPUT', lines: 3 }, detail: '`query` controls the text box, so typing is never laggy. `debounced` trails behind it and is the only thing the filter\'s useMemo depends on, so the expensive part waits for a pause.', pitfall: 'Debouncing the state that drives the input itself makes the text box drop or delay characters, which is the version that makes a search box feel broken.' },
    { title: 'Say when the list on screen is out of date', excerpt: { from: 'stale={query !== debounced}', lines: 1 }, detail: 'While the debounce is pending, the list belongs to an older query. When the two differ, Panel shows a "waiting…" hint rather than presenting old results as current.' },
    { title: 'Render both versions through one presentation component', excerpt: { from: 'function Panel({ title, subtitle, query, onChange, keystrokes, runs, filtered, stale }) {', lines: 1 }, detail: 'Panel draws the input, the counters, the result count, the list, and an empty message ("No products match …"). Both versions use it, so any difference you see comes from the logic, not the markup.' },
    { title: 'Say why this list does not need a debounce', detail: 'Filtering twelve local objects takes well under a microsecond (about 0.4 µs measured in Node on a laptop), and one frame at 60 frames per second is 16.67 ms. A 400 ms debounce adds 400 ms of lag to save almost nothing, and the counters make that visible. Debouncing belongs where a keystroke costs something you do not control, usually a network request.', pitfall: 'For expensive local rendering (tens of thousands of rows) the answer is useDeferredValue, not a debounce: React renders the list at lower priority and keeps the input responsive, based on the real work rather than a guessed timer.' },
  ],
  graded: [
    { point: 'The filtered list is derived, never stored', why: 'This is the real subject of the question. Storing it is the mistake that generalises into a whole category of out-of-sync bugs, and the React docs call it out explicitly.' },
    { point: 'You debounce the value and not the input', why: 'It is what keeps typing instant. Debouncing the state the text box reads makes the component feel worse than no debounce at all.' },
    { point: 'You can say when debouncing is NOT warranted', why: 'Applying it to a local filter shows pattern-matching; explaining that it belongs where the keystroke costs a request shows judgement, which is what the follow-up is testing.' },
    { point: 'Debouncing is not confused with cancellation', why: 'It reduces how many requests you send and says nothing about the order they return in. A slow response for an earlier query can still overwrite a later one; that needs an AbortController.' },
  ],
};

const chatApp: BuildExplanation = {
  kind: 'build',
  problem: 'Chat App',
  problemStatement:
    'A live chat with message history, messages that go from "sending" to "sent" or "failed", incoming messages without duplicates, and a typing indicator in both directions. The question asks WebSocket or polling, and how to manage message state, loading and typing status.',
  buildOrder: [
    {
      title: 'Choose the transport',
      detail:
        'Polling asks the server "anything new?" every few seconds: simple and it works through every proxy, but messages arrive late and most requests come back empty. A WebSocket keeps one connection open in both directions, so the server pushes messages and typing events as they happen, and the client can send typing events cheaply. Chat sends often in both directions, which is exactly what WebSockets are for; polling stays as a fallback. The template uses a FakeSocket with the same send/onmessage shape, so swapping in new WebSocket(url) changes nothing else.',
    },
    {
      title: 'Treat "still loading" as its own state',
      excerpt: { from: 'const [messages, setMessages] = React.useState(null);   // null = still loading', lines: 1 },
      detail:
        'null means the history has not arrived yet, which is different from an empty conversation ([]). The list shows "Loading messages…" while it is null, and the input is disabled until there is a list to add to.',
    },
    {
      title: 'Open the socket and load the history in one effect',
      excerpt: { from: 'const socket = new FakeSocket();', lines: 6 },
      detail:
        'On mount the effect opens the socket, keeps it in a ref so send can reach it, and fetches the history over a normal request. When the history arrives it is merged into whatever is already in the list rather than replacing it.',
      pitfall: '`setMessages(history)` would wipe out any message pushed over the socket while the history was still loading.',
    },
    {
      title: 'Merge incoming messages by id',
      excerpt: { from: 'function mergeById(existing, incoming) {', lines: 4 },
      detail:
        'mergeById collects the ids already in the list, adds only incoming messages with a new id, and sorts everything by time. A pushed message that beat the history, or a message replayed after a reconnect, is therefore never shown twice.',
    },
    {
      title: 'Add a message pushed by the other person',
      excerpt: { from: 'if (data.type === "message") {', lines: 4 },
      detail:
        'Every socket event arrives as a JSON string with a `type`, and onmessage branches on it. A new message from Alex clears the typing indicator (he has finished typing) and is merged in as "sent".',
    },
    {
      title: 'Send: show the message straight away with a client id and a status',
      excerpt: { from: 'const send = (text, retryOf) => {', lines: 9 },
      detail:
        'The message appears immediately as "sending", identified by a clientId made on this device, because the server has not given it an id yet. A new message is appended; a retry reuses the failed message\'s clientId and replaces that bubble instead of adding a second one. Then the message goes to the server over the socket.',
    },
    {
      title: 'Match the server\'s acknowledgement by client id',
      excerpt: { from: 'if (data.type === "ack") {', lines: 5 },
      detail:
        'When the server confirms (an "ack"), it echoes the clientId back along with its own id. The clientId is the only thing that links the confirmation to the bubble, so the matching message takes the server id and becomes "sent".',
    },
    {
      title: 'Mark a failed send and offer a retry',
      excerpt: { from: 'if (data.type === "error") {', lines: 4 },
      detail:
        'An error event marks the matching message "failed". Under a failed bubble the template renders "Not sent." with a Retry button that calls `send(m.text, m)`, which goes back through the send step with the same clientId. The "Make the next message fail" link lets you try it.',
    },
    {
      title: 'Throttle outgoing typing events',
      excerpt: { from: 'const notifyTyping = () => {', lines: 6 },
      detail:
        'notifyTyping runs on every keystroke, but it only sends a typing event if at least two seconds have passed since the last one (throttling: at most one call per interval). That keeps the other person\'s indicator alive while you type without flooding the connection.',
    },
    {
      title: 'Let the incoming typing indicator expire on its own',
      excerpt: { from: 'if (data.type === "typing") {', lines: 7 },
      detail:
        'A typing event shows "Alex is typing…" and restarts a three-second timer that hides it again. If the "stopped typing" event is lost, or Alex closes his laptop mid-sentence, the indicator would otherwise stay forever.',
    },
    {
      title: 'Key each bubble by client id so it survives the server id',
      excerpt: { from: '<div key={m.clientId || m.id}', lines: 1 },
      detail:
        'Your own messages are keyed by clientId, which never changes; messages from others only have a server id. If the key switched to the server id on acknowledgement, React would treat it as a new element, remounting the bubble and restarting any animation.',
    },
    {
      title: 'Announce new messages and keep the latest in view',
      excerpt: { from: 'if (endRef.current) endRef.current.scrollIntoView({ block: "end" });', lines: 2 },
      detail:
        'After every change to the messages or the typing indicator, the effect scrolls an empty div at the end of the list into view. The list itself has role="log" with aria-live="polite", which makes a screen reader read out new messages as they are added.',
      pitfall: 'Always scrolling yanks the view away from someone who has scrolled up to read. Production chats only auto-scroll when the user is already near the bottom and show a "New messages" button otherwise.',
    },
    {
      title: 'Clean up the socket and the timer on unmount',
      excerpt: { from: 'return () => {', lines: 5 },
      detail:
        'The cleanup sets `cancelled` so a history response that arrives late is ignored, cancels the typing timer, and closes the socket. Without it every remount would leave an extra connection pushing messages into a component that no longer exists.',
    },
  ],
  graded: [
    { point: 'You justify WebSocket over polling for this case', why: 'The question asks directly. The graded part is the reason: frequent traffic in both directions, plus keeping polling as a fallback, rather than just "WebSockets are real-time".' },
    { point: 'Messages have a lifecycle: sending, sent, failed', why: 'Message state management is the core of the question. A client id, a status and a retry that reuses the bubble show you have handled real network failure.' },
    { point: 'Nothing is shown twice', why: 'Merging by id handles the race between history and pushed messages and makes replays after a reconnect safe. Interviewers probe it with "what if the history loads after a new message arrives?".' },
    { point: 'Typing status is throttled going out and expires coming in', why: 'Both halves are small and both are usually missed. Together they show you think about bandwidth and about events that never arrive.' },
  ],
};

const modalComponent: BuildExplanation = {
  kind: 'build',
  problem: 'Modal Component',
  problemStatement:
    'A reusable dialog that takes arbitrary content, closes on the backdrop (the dimmed layer behind it), the close button and Escape, and animates in. The reuse is the design question; the ways to dismiss it are the correctness one.',
  buildOrder: [
    { title: 'Let the caller own which modal is open', excerpt: { from: 'const [activeModal, setActiveModal] = React.useState(null);', lines: 4 }, detail: 'App keeps one piece of state naming the open modal ("info", "form", "confirm" or null), so opening one closes any other. `close` sets it back to null and is passed to each Modal as onClose. The form\'s values also live in App, so they survive the modal closing and reopening.' },
    { title: 'Take content as children, not as props', excerpt: { from: '<Modal isOpen={activeModal === "form"} onClose={close} title', lines: 4 }, detail: 'Anything between `<Modal>` and `</Modal>` arrives as the children prop. The modal is responsible for the shell (backdrop, title, dismissal) and the caller for the content, which is the split that lets one component serve text, a form and a confirmation.', pitfall: 'A `body` string prop forces every new use case into a new prop, and passing a component type for the modal to render re-invents children with fewer capabilities.' },
    { title: 'Render nothing when closed', excerpt: { from: 'if (!isOpen) return null;', lines: 1 }, detail: 'Returning null takes the dialog out of the page entirely, so its content is not in the accessibility tree (what screen readers read) and nothing inside it can receive focus.', pitfall: 'Hiding it with opacity or by moving it off-screen leaves it readable by screen readers and reachable with Tab.' },
    { title: 'Close on Escape from a document listener, only while open', excerpt: { from: 'React.useEffect(() => {', lines: 5 }, detail: 'Escape must work wherever focus is, which is why the keydown listener goes on the document rather than the dialog. It is only added while isOpen is true, and the cleanup removes it when the modal closes or unmounts.', pitfall: 'Omitting the cleanup leaves one more listener on the document every time the modal opens, so after five opens one Escape calls onClose five times.' },
    { title: 'Close on a backdrop click, but not on clicks inside the panel', excerpt: { from: '<div onClick={e => e.stopPropagation()} role="dialog"', lines: 1 }, detail: 'The backdrop div calls onClose when clicked. Clicks inside the panel would bubble up to it (click events travel from the clicked element up through its ancestors) and close the dialog too, so the panel stops propagation at its own edge.', pitfall: 'This still closes the modal if the user drags a text selection from inside the panel and releases on the backdrop, because that click fires on the backdrop. A sturdier check closes only when `e.target === e.currentTarget` for both mousedown and click.' },
    { title: 'Give the panel a dialog role and a name', excerpt: { from: '<div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}', lines: 1 }, detail: 'role="dialog" tells assistive technology this is a dialog, aria-modal="true" says the page behind it is inert while it is open, and aria-label gives it the title as its name, so a screen reader announces "Contact Form, dialog".' },
    { title: 'Add a labelled close button', excerpt: { from: '<button onClick={onClose} aria-label="Close"', lines: 4 }, detail: 'The visible text is just "x", which a screen reader would read as the letter x. aria-label="Close" gives the icon-only button a proper name.' },
    { title: 'Animate it in with CSS keyframes', excerpt: { from: '@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }', lines: 2 }, detail: 'The backdrop fades in and the panel slides up by 20px over 0.2 s when the modal mounts. Because closing returns null, the modal disappears instantly; animating it out would require keeping it mounted until the exit animation finishes.' },
  ],
  graded: [
    { point: 'Content comes in as children', why: 'It is the difference between a reusable component and one that grows a prop per use case. Interviewers ask for "different content types" to see whether you reach for composition.' },
    { point: 'All three dismissal paths work', why: 'Escape, backdrop and the close button are what users try, roughly in that order. A dialog that only closes via its own button is the one people get stuck in.' },
    { point: 'Listeners are cleaned up and scoped to the open state', why: 'This is where the leak lives, and it compounds: every open adds another handler that never goes away.' },
    { point: 'You know what is still missing', why: 'Keeping Tab inside the dialog (a focus trap), returning focus to the button that opened it, locking the page scroll behind it, and rendering it through a portal (so a parent\'s overflow or z-index cannot clip it) are what separate this from a production dialog. aria-modal alone does not trap focus. Naming them, or reaching for the native <dialog> element, is the senior answer.' },
  ],
};

const imageGallery: BuildExplanation = {
  kind: 'build',
  problem: 'Image Gallery + Lazy Load',
  problemStatement:
    'A responsive grid that only loads an image once it scrolls into view, with a placeholder holding the space until then. IntersectionObserver (a browser API that tells you when an element enters or leaves the visible area) is the tool; what you observe and when you stop are the interesting parts.',
  buildOrder: [
    { title: 'Give each image two flags: in view, and loaded', excerpt: { from: 'const [loaded, setLoaded] = React.useState(false);', lines: 3 }, detail: 'inView decides whether the img tag exists at all, so no request is made until the tile is visible. loaded decides when to hide the placeholder and fade the image in. The ref points at the tile\'s wrapper div, which is what gets observed.' },
    { title: 'Observe each tile instead of listening to scroll', excerpt: { from: 'const observer = new IntersectionObserver(', lines: 6 }, detail: 'The callback runs when at least 10% of the tile (`threshold: 0.1`) is visible. It sets inView and disconnects straight away, because once the image has started loading there is nothing left to watch. The cleanup disconnects too, in case the tile unmounts before it was ever seen.', pitfall: 'A scroll listener fires dozens of times a second and makes you measure every tile\'s position on each call. The observer lets the browser do that work as part of rendering and only calls you when a tile crosses the threshold.' },
    { title: 'Hold the space with a placeholder of the final size', excerpt: { from: '<div ref={ref} style={{', lines: 8 }, detail: 'The wrapper always has its final height (120px, passed in from the gallery), and shows a grey background and "Loading..." until the image arrives. Nothing moves when an image loads, so the tile under the cursor stays put.', pitfall: 'Zero-height placeholders also break the observer: every one of them fits in view at once, so the whole gallery loads immediately.' },
    { title: 'Mount the img only once it is in view, and fade it in on load', excerpt: { from: '{inView && (', lines: 9 }, detail: 'The img is only rendered after inView becomes true, which is what actually delays the download. It starts at opacity 0; onLoad sets loaded, and the CSS transition fades it in over 0.4 s. objectFit: "cover" fills the tile without stretching the photo.' },
    { title: 'Lay out the tiles in a responsive grid', excerpt: { from: 'display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",', lines: 2 }, detail: '`repeat(auto-fill, minmax(140px, 1fr))` fits as many columns of at least 140px as the width allows and shares out the leftover space, so the grid reflows from one column on a phone to many on a desktop without a single media query. The grid scrolls inside a 400px-high box.' },
    { title: 'Start loading a little before the tile is visible', detail: 'This template waits until a tile is 10% visible, so on a fast scroll you watch the placeholders fill in. Passing `rootMargin: "200px"` to the IntersectionObserver grows the area it watches by 200px on each side, so each request gets a head start and the image is usually ready by the time it scrolls in.', pitfall: 'Too large a margin loads the whole gallery and removes the point of lazy loading.' },
    { title: 'Consider the native attribute first', detail: 'Every modern browser supports `<img loading="lazy">`, and for a plain grid it is the whole feature in one attribute, with the browser choosing a sensible margin itself. Reach for IntersectionObserver when you need a custom placeholder, a fade-in like this one, or analytics on what was seen.' },
  ],
  graded: [
    { point: 'IntersectionObserver rather than a scroll handler', why: 'Scroll handlers run at high frequency and usually measure layout on every call, which is a reliable source of jank (stuttering scroll). Knowing the purpose-built API exists is the baseline here.' },
    { point: 'The observer is disconnected', why: 'Both after the first hit and on unmount. An observer left running keeps calling back and keeps a reference to elements that may already have been removed from the page.' },
    { point: 'Space is reserved before load', why: 'Otherwise you have traded bandwidth for layout shift, and in a grid that is worse: every row moves as images arrive.' },
    { point: 'You mention loading="lazy" exists', why: 'Reaching straight for an observer when one attribute would do is over-engineering, and the follow-up is always "could the platform do this?".' },
  ],
};

const dragAndDrop: BuildExplanation = {
  kind: 'build',
  problem: 'Drag and Drop',
  problemStatement:
    'Move items between two lists by dragging them, with visible feedback while dragging. The browser\'s built-in drag-and-drop API (the `draggable` attribute plus dragstart, dragover and drop events) is quirky by design; the graded part is moving data immutably and keeping the drop target obvious.',
  buildOrder: [
    { title: 'Keep each list, and the drag in progress, in state', excerpt: { from: 'const [dragItem, setDragItem] = React.useState(null);', lines: 2 }, detail: 'todo and done are two arrays of items with string ids. dragItem is the item currently being dragged, and dragOver is the id of the list the pointer is over, which drives the highlight.' },
    { title: 'Make items draggable and record what is being dragged', excerpt: { from: 'draggable', lines: 3 }, detail: 'The `draggable` attribute lets the browser pick the element up. On dragstart the template stores the item plus the list it came from in React state, which is the simplest thing that works inside one component and is what makes the dimming and highlight possible. onDragEnd clears both, so a drag dropped outside any list leaves nothing behind.', pitfall: 'The platform alternative, `e.dataTransfer.setData(...)`, works across windows and apps, but its data can only be read on drop, not during dragover. A component that needs to style the target while dragging ends up keeping its own state anyway, as this one does.' },
    { title: 'Call preventDefault on dragover, or nothing can drop', excerpt: { from: 'onDragOver={e => { e.preventDefault(); setDragOver(listId); }}', lines: 3 }, detail: 'By default the browser refuses drops on an element; calling preventDefault in dragover is what marks it as a valid target. It is the single most common reason a drag-and-drop implementation silently does nothing. The same handler records which list is under the pointer, and onDrop hands that list id to handleDrop.', pitfall: 'dragleave also fires when the pointer moves onto a child element of the list. Here the next dragover (which bubbles up from the child) sets the highlight straight back, so it only blinks; a sturdier version counts dragenter/dragleave pairs.' },
    { title: 'Move the item immutably: remove from the source, add to the target', excerpt: { from: 'const handleDrop = (target) => {', lines: 16 }, detail: 'handleDrop filters the item out of the list it came from and appends it to the target list, building new arrays each time with functional updates. Then it clears the drag state. Dropping onto the list it came from removes and re-appends it, so it moves to the bottom.', pitfall: 'Splicing the arrays in state mutates what React is still holding, so the re-render may not happen or may show a half-moved list.' },
    { title: 'Make the dragged item and the target obvious', excerpt: { from: 'opacity: dragItem?.id === item.id ? 0.5 : 1,', lines: 1 }, detail: 'The item being dragged is dimmed to half opacity, and the list under the pointer gets a tinted background and a coloured dashed border from `dragOver === listId`. Without that feedback the user is guessing where the item will land.' },
    { title: 'Show an empty list as a drop zone', excerpt: { from: '{items.length === 0 && (', lines: 5 }, detail: 'Once a list is emptied it shows "Drop items here", and the item area keeps a minimum height of 60px, so there is still something to aim at.', pitfall: 'A list that collapses to zero height when empty cannot be dropped on at all.' },
  ],
  graded: [
    { point: 'preventDefault on dragover', why: 'Without it the drop event never fires and everything else you wrote is unreachable. It is the first thing to check when a drag silently does nothing.' },
    { point: 'State is moved immutably', why: 'splice on the array in state is the mutation bug in its most tempting form: the data looks right in the console and the UI does not update.' },
    { point: 'Feedback during the drag', why: 'A drag with no indication of the target is a guess. Interviewers ask for visual feedback because it is the part that gets skipped.' },
    { point: 'You flag that this is not accessible on its own', why: 'Native HTML drag-and-drop needs a pointer; there is no way to use it from the keyboard. A production implementation needs a keyboard path, or a library like dnd-kit that provides one, and saying so is the mark of someone who has shipped it.' },
  ],
};

const productListSortFilter: BuildExplanation = {
  kind: 'build',
  problem: 'Product List Sort & Filter',
  problemStatement:
    'Sort by name, price or rating in either direction, filter by category and maximum price, show which sort is active, and offer a way to clear everything. Several controls feed one list that is worked out from them; designing that pipeline is the exercise.',
  buildOrder: [
    { title: 'Build the category options from the data', excerpt: { from: 'const categories = [...new Set(PRODUCTS.map(p => p.category))];', lines: 1 }, detail: 'Mapping every product to its category and passing the result through a Set removes duplicates, leaving ["Audio", "Accessories", "Peripherals"] in first-seen order. A new category in the data then appears in the dropdown with no code change.' },
    { title: 'Hold the four controls in state', excerpt: { from: 'const [sortBy, setSortBy] = React.useState("name");', lines: 4 }, detail: 'Sort field, sort direction, category and maximum price are the only things the user chooses. The visible list is not stored anywhere; it is worked out from these four on every render.', pitfall: 'Keeping a visibleProducts array in state as well needs an effect that watches all four controls, and the first time one is left out of it the list and the controls disagree.' },
    { title: 'Filter first, then sort the filtered copy', excerpt: { from: 'const filtered = React.useMemo(() => {', lines: 10 }, detail: 'The list keeps products at or under the max price, then narrows to one category unless "all" is selected. filter() returns a new array, so calling sort() on it is safe even though sort rearranges an array in place; PRODUCTS itself is never touched. useMemo recomputes only when one of the four controls changes.', pitfall: 'Sorting PRODUCTS (or a prop) directly would rearrange the source data itself. Here filter() already makes the copy; without a filter you would need `[...items].sort(...)`.' },
    { title: 'Compare strings and numbers differently', excerpt: { from: 'const cmp = typeof va === "string" ? va.localeCompare(vb) : va - vb;', lines: 2 }, detail: 'Names are compared with localeCompare, which orders text the way people expect; prices and ratings are subtracted, which gives a negative, zero or positive number as sort requires. For descending order the result is simply negated.', pitfall: 'sort() with no comparator compares everything as text, so the prices [10, 9, 100] come out as [10, 100, 9]. A numeric comparator is required, not optional.' },
    { title: 'Click a sort button once to choose it, again to flip it', excerpt: { from: 'const toggleSort = (field) => {', lines: 4 }, detail: 'Clicking the field that is already active flips between ascending and descending; clicking a different field switches to it and starts ascending. The active button is highlighted and shows an up or down arrow for the direction.' },
    { title: 'Wire the category dropdown and the price slider', excerpt: { from: '<select value={category} onChange={e => setCategory(e.target.value)}', lines: 9 }, detail: 'Both controls are controlled inputs: they show the state value and write changes straight back. The slider\'s value arrives as a string, so it is converted with Number before being stored, and the current maximum is printed beside it.', pitfall: 'Storing the slider value as a string makes `p.price <= maxPrice` compare a number with a string. JavaScript converts it for you here, but a later "+ 10" would glue text together instead of adding.' },
    { title: 'Reset every control with one Clear button', excerpt: { from: 'const clearFilters = () => {', lines: 1 }, detail: 'Clear puts all four controls back to their starting values. Because the list is worked out from them, resetting the state is all it takes to show everything again.', pitfall: 'Clear must reset every control. The one it forgets is the filter the user cannot find.' },
    { title: 'Treat the empty result as its own state', excerpt: { from: '{filtered.length === 0 ? (', lines: 2 }, detail: 'Combinations of filters regularly match nothing, and an empty area tells the user nothing about why. "No products match your filters" names the cause, and the Clear button is right above it as the way out. The count below the list shows how many are visible.' },
  ],
  graded: [
    { point: 'One derived list from several pieces of control state', why: 'It is the shape that scales: adding a fifth filter is one more line in the useMemo, not another effect to keep in sync. Storing the result instead is where multi-filter UIs rot.' },
    { point: 'sort() is never called on the source array', why: 'It rearranges the array in place, so sorting props or state directly is a real bug that hides behind a UI that looks correct until something else re-renders.' },
    { point: 'A numeric comparator', why: 'The default text-based sort on numbers is one of the most reliable traps in JavaScript, and it produces plausible-looking wrong output.' },
    { point: 'Active controls are visible and clearable', why: 'Interviewers ask for it explicitly because hidden filter state is the most common usability failure in this component. Showing each active filter as a removable chip is the next step up from a single Clear button.' },
  ],
};

const responsiveNavbar: BuildExplanation = {
  kind: 'build',
  problem: 'Responsive Navbar',
  problemStatement:
    'A full menu on desktop that collapses to a hamburger (a ☰ button that opens the menu) on mobile, with a sliding panel and the current page marked. In a real app most of this is CSS; the parts worth React are the open state and the keyboard behaviour.',
  buildOrder: [
    { title: 'Simulate the viewport width, because the preview cannot be resized', excerpt: { from: '<input type="range" min={280} max={700} value={width}', lines: 2 }, detail: 'The playground preview has a fixed size, so a slider stands in for resizing the browser, and `isMobile = width < 500` stands in for a breakpoint. Moving it also closes the menu, so the panel never stays open when switching layouts.', pitfall: 'This is a demo harness, not the pattern to copy. In a real app a CSS media query (`@media (max-width: 500px)`) switches the layout the moment the viewport changes, with no listener and no re-render.' },
    { title: 'Let CSS decide the layout in production, not JavaScript', detail: 'Tracking window.innerWidth in state re-renders the tree on every frame of a resize, and during server-side rendering (SSR: building the HTML on the server, where there is no window) it has no value at all, so the first paint can show the wrong layout. If you genuinely need the breakpoint as a value in JavaScript, `window.matchMedia` fires only when the query flips, not on every pixel.' },
    { title: 'Show the links in a row on desktop', excerpt: { from: '{!isMobile && (', lines: 4 }, detail: 'On a wide viewport every link is a button in one row, and clicking one sets it as the active page. The active one gets the purple background.' },
    { title: 'Keep one piece of state for the mobile menu: open or closed', excerpt: { from: '<button onClick={() => setMenuOpen(m => !m)}', lines: 2 }, detail: 'On mobile the hamburger toggles menuOpen. aria-expanded tells assistive technology whether the menu is currently open, and because the button shows only an icon, aria-label gives it a name that flips between "Open menu" and "Close menu" with the state.', pitfall: 'A static label like "Menu" announces the same thing open or closed. Adding aria-controls with the panel\'s id would also link the button to what it opens; this template leaves that out.' },
    { title: 'Slide the panel open, and make it inert while closed', excerpt: { from: '<div inert={!menuOpen} style={{', lines: 5 }, detail: 'The panel animates its max-height between 0 and enough for every link, with overflow hidden so the links are clipped while it is closed. The `inert` attribute makes everything inside ignore clicks, focus and screen readers while the menu is closed.', pitfall: 'A height of 0 only hides the links visually. Without inert they can still be reached with Tab and are read out by a screen reader.' },
    { title: 'Close the menu when a link is chosen', excerpt: { from: 'onClick={() => { setActive(link); setMenuOpen(false); }}', lines: 1 }, detail: 'Choosing a link in a single-page app changes the page without unmounting the navbar, so the panel would otherwise stay open over the page the user just asked for. Each mobile link sets the active page and closes the menu in one handler.', pitfall: 'This template does not handle Escape. A production menu closes on Escape too and returns focus to the hamburger, otherwise keyboard users are left inside a panel that is no longer visible.' },
    { title: 'Mark the current page for screen readers, not just visually', detail: 'The template marks the active link with a background colour only. The missing piece, and the thing to add unprompted, is `aria-current="page"` on the active link: it is the marker assistive technology reads, and the colour is presentation layered on top. Styling alone leaves the state invisible to anyone who cannot see it.' },
  ],
  graded: [
    { point: 'The breakpoint lives in CSS', why: 'Reaching for a resize listener is the tell that someone reaches for JavaScript first. It costs a re-render on every frame of a drag-resize and has no value before the page reaches the browser.' },
    { point: 'aria-expanded and an accessible name on the toggle', why: 'An icon-only button with no name is announced as just "button", and without aria-expanded the user cannot tell whether pressing it will open or close anything.' },
    { point: 'The menu closes on navigation and on Escape', why: 'Leaving it open over the new page is the bug every user hits immediately, and each fix is a line or two.' },
    { point: 'Hidden links are really hidden, and focus is managed', why: 'A collapsed panel that is not inert lets Tab walk through links you cannot see. Moving focus into the panel when it opens and back to the button when it closes is what makes it usable without a mouse.' },
  ],
};

const infiniteScroll: BuildExplanation = {
  kind: 'build',
  problem: 'Infinite Scroll',
  problemStatement:
    'Load the next page as the user nears the bottom, using IntersectionObserver (a browser API that reports when an element becomes visible) rather than a scroll handler, with an end state and, the half most implementations skip, a failure state with a retry.',
  buildOrder: [
    { title: 'Fake a paged API that fails once', excerpt: { from: 'if (page === 3 && !fakeAPI.failedOnce) {', lines: 4 }, detail: 'fakeAPI returns 10 posts per page for 8 pages, then reports hasMore: false. Page 3 fails the first time it is asked for, so the error and retry path is actually reachable in the demo.' },
    { title: 'Track the page, the items, and three stop conditions', excerpt: { from: 'const [items, setItems] = React.useState([]);', lines: 6 }, detail: 'items is everything loaded so far and page is the next page to ask for. loading, hasMore and error are the three reasons not to fetch right now. sentinelRef will point at an empty element placed after the last item.' },
    { title: 'Guard loadMore on every state that should stop it', excerpt: { from: 'const loadMore = React.useCallback(() => {', lines: 15 }, detail: 'loadMore returns early while a request is already running, once there are no more pages, and while an error is showing. Otherwise it fetches the next page, appends the new items, records whether more exist, and moves page on by one; `finally` clears loading whether it worked or not.', pitfall: 'Omitting the error guard turns one failed request into a request storm: the sentinel is still visible, so the observer asks again immediately, against a server that is already failing.' },
    { title: 'Load the first page on mount', excerpt: { from: 'React.useEffect(() => { loadMore(); }, []);', lines: 1 }, detail: 'Before any items exist there is nothing to scroll, so the first page is requested directly when the component mounts.' },
    { title: 'Observe a sentinel below the list', excerpt: { from: 'const observer = new IntersectionObserver(', lines: 6 }, detail: 'The observer calls loadMore when at least 10% of the sentinel is visible. It is simpler and cheaper than comparing scrollTop with scrollHeight on every scroll event, and it works inside a scrolling div, not just the window.', pitfall: 'If the sentinel has zero height it can sit permanently "in view" and fire the loader in a loop; this one has 20px of padding.' },
    { title: 'Rebuild the observer whenever loadMore changes', excerpt: { from: '}, [loadMore]);', lines: 1 }, detail: 'loadMore is a useCallback that depends on page, loading, hasMore and error, so it becomes a new function whenever any of them changes. The effect then disconnects the old observer and creates a new one, and a new observer reports straight away if the sentinel is already visible. That is what keeps loading page after page while the list is still too short to scroll.', pitfall: 'An observer created once with an empty dependency list keeps calling the first loadMore, which still thinks it is on page 1.' },
    { title: 'Show the error with a retry, and hide the sentinel meanwhile', excerpt: { from: '{error && (', lines: 6 }, detail: 'The error is shown with role="alert", so a screen reader announces it, and a Retry button. The sentinel is only rendered when `hasMore && !error`, so nothing can trigger another fetch while the error is on screen.', pitfall: 'To a user, a list that silently stops loading looks exactly like a list that has ended. A swallowed error is worse here than elsewhere, because they never know to retry.' },
    { title: 'Retry by clearing the error, not by fetching again', excerpt: { from: 'const retry = React.useCallback(() => setError(null), []);', lines: 1 }, detail: 'Clearing the error renders the sentinel again and changes loadMore, so a new observer is created; the sentinel is visible, so it fires and loadMore requests the failed page. The retry needs no fetch call of its own.' },
    { title: 'Tell the user when they have reached the end', excerpt: { from: '{!hasMore && items.length > 0 && (', lines: 3 }, detail: 'Once the API says there are no more pages, the sentinel disappears and "You\'ve reached the end!" replaces it. While a page is loading, "Loading more..." sits in an aria-live region, so a screen-reader user hears that more is arriving.' },
  ],
  graded: [
    { point: 'IntersectionObserver rather than a scroll listener', why: 'Scroll handlers fire many times a second and usually measure layout on each call. The observer is the purpose-built API, and it is what the question is checking for.' },
    { point: 'The failure path exists and is recoverable', why: 'This is the part most implementations skip entirely. Silently stopping is indistinguishable from reaching the end, so the user never retries and simply thinks the list was short.' },
    { point: 'The trigger is guarded against re-entry and error loops', why: 'Without the loading guard, one scroll starts several page loads; without the error guard, one failure becomes a request storm. Both are visible immediately in the network panel.' },
    { point: 'You mention virtualisation as the next step', why: 'Infinite scroll grows the page without limit, and ten thousand rows will be slow however well the loading works. Virtualisation (also called windowing: rendering only the rows currently on screen) is the answer for a really long list.' },
  ],
};

const notifications: BuildExplanation = {
  kind: 'build',
  problem: 'Notifications',
  problemStatement:
    'A toast system (small messages that pop up and go away on their own): several types, stacked, auto-dismissing after a timeout, each dismissible by hand. Notifications arrive from anywhere in the app, so the API design matters as much as the rendering.',
  buildOrder: [
    { title: 'Keep the queue in a hook with add and dismiss', excerpt: { from: 'const [notifications, setNotifications] = React.useState([]);', lines: 1 }, detail: 'useNotifications owns an array of notifications and returns it with two functions. Here App calls the hook directly, which is enough for one screen; the production shape puts this state in a context provider at the root so any component can call add without passing props down.' },
    { title: 'Add a toast with a unique id and schedule its removal', excerpt: { from: 'const add = React.useCallback((message, type = "info", duration = 3000) => {', lines: 9 }, detail: 'Each toast gets an id (the time plus a random number, so two added in the same millisecond still differ) and is appended to the stack. If duration is above 0, a timer removes that id after duration milliseconds; a duration of 0 makes the toast stay until dismissed. useCallback with no dependencies keeps add the same function across renders.', pitfall: 'The removal filters by id rather than removing "the first toast", so a toast dismissed by hand, or one added later, is never removed by someone else\'s timer.' },
    { title: 'Dismiss by id', excerpt: { from: 'const dismiss = React.useCallback((id) => {', lines: 3 }, detail: 'dismiss filters the toast out immediately. If its auto-dismiss timer fires later, that filter finds nothing to remove, so the late timer is harmless.', pitfall: 'The timers are never cancelled. It is harmless here, but a provider that lives for the whole session should keep the timer ids and clear them on dismiss and on unmount.' },
    { title: 'Style each type from one lookup table', excerpt: { from: 'const colors = {', lines: 7 }, detail: 'Each type maps to a background, a border colour and an icon, and an unknown type falls back to info. Adding a type is one line, and the icon means the type is not signalled by colour alone.' },
    { title: 'Render the stack, keyed by id', excerpt: { from: 'notifications.map(n => <Toast key={n.id} notification={n} onDismiss={dismiss} />)', lines: 1 }, detail: 'Toasts render in the order they were added. Keying by id means removing a toast from the middle removes exactly that toast\'s DOM node; with index keys React would delete the last node instead and shift every later message into its neighbour\'s node.' },
    { title: 'Simulate notifications arriving from elsewhere', excerpt: { from: 'const interval = setInterval(() => {', lines: 8 }, detail: 'Every 4 seconds a counter local to the effect goes up, and for the first three ticks a sample event is added, so you can watch toasts stack and expire without clicking. The buttons above add one of each type, plus a persistent one.', pitfall: 'Keep add() out of state updaters. An updater must be pure, and StrictMode (React\'s development checking mode) calls updaters twice, so an add() inside one would show each notification twice. That is why the count is a plain variable in the effect rather than state.' },
    { title: 'Announce toasts to screen readers', detail: 'This template shows toasts visually only, and its "x" button has no accessible name. A production container is a live region (an element whose text changes a screen reader announces): aria-live="polite" waits until the user is idle and suits most toasts, while role="alert" interrupts, which is right for errors only. The close button needs aria-label="Dismiss".', pitfall: 'Moving focus to the toast is worse than not announcing it: it pulls the user out of whatever they were typing.' },
    { title: 'Bound the stack, and do not auto-dismiss errors', detail: 'Nothing here limits how many toasts can stack, so a burst of events fills the screen and covers the UI they describe; keeping only the most recent few is almost always right. Errors usually should not disappear on a timer either, because a message the user needs to act on vanishing after three seconds is a real accessibility problem.' },
  ],
  graded: [
    { point: 'The API is a hook, callable from anywhere', why: 'Toasts are triggered from event handlers deep in the tree. Putting the state in a context provider at the root, with a hook to reach it, is what makes that possible without threading props.' },
    { point: 'Each toast is removed by id', why: 'Filtering by id is what makes auto-dismiss and manual dismiss safe together: a late timer or a double click can never remove the wrong toast.' },
    { point: 'Live regions, with the right politeness', why: 'This is the accessibility half of the component and it is usually missing entirely, as it is here. Knowing that polite suits most toasts and alert suits errors shows you know what the attributes do.' },
    { point: 'The context value is memoised and the stack is bounded', why: 'In the provider version, an unmemoised value re-renders every consumer on every toast; without a limit, a burst of events hides the page behind its own notifications.' },
  ],
};

const starRating: BuildExplanation = {
  kind: 'build',
  problem: 'Star Rating',
  problemStatement:
    'Five stars, click to set a value, hover to preview it. Small enough that the interviewer is looking at two things: how you model the preview, and whether it works without a mouse.',
  buildOrder: [
    { title: 'Keep the committed value and the preview separate', excerpt: { from: 'const [rating, setRating] = React.useState(initialRating);', lines: 2 }, detail: 'rating is what the user chose; hover is the star under the pointer, with 0 meaning "not hovering". Keeping them apart means the preview can never overwrite the real value.', pitfall: 'Writing the hover value into rating and restoring it on mouse-out means an interrupted interaction (the pointer leaving the window mid-hover) leaves the wrong rating committed.' },
    { title: 'Commit a click and tell the parent', excerpt: { from: 'function handleSelect(value) {', lines: 4 }, detail: 'Clicking a star stores its value and calls onChange if the parent passed one; `?.()` calls the function only when it exists. App passes setRating, so it can show "Current rating: 3/5".' },
    { title: 'Work out which stars are filled from the preview or the rating', excerpt: { from: 'const value = i + 1;', lines: 2 }, detail: 'Array.from builds one star per position, numbered from 1. A star is filled when its number is at or below the hovered star, or, when nothing is hovered, the committed rating. `hover || rating` picks the hover value unless it is 0.', pitfall: 'That shortcut works because there is no star 0. A control that allowed clearing to zero by hover would need null for "not hovering" instead.' },
    { title: 'Preview on hover, and clear the preview on leave', excerpt: { from: 'onMouseEnter={() => setHover(value)}', lines: 2 }, detail: 'Entering a star previews it and leaving sets hover back to 0, which shows the committed rating again. Here both handlers are on each star.', pitfall: 'Because each star has its own onMouseLeave, crossing the 4px gap between two stars briefly drops the preview back to the committed rating, a visible flicker. One onMouseLeave on the wrapper div fires only when the pointer leaves the whole control.' },
    { title: 'Use buttons with a name for each star', excerpt: { from: 'aria-label={`Rate ${value} of ${totalStars}`}', lines: 1 }, detail: 'Each star is a real button, so it can be reached with Tab and pressed with Enter or Space. The ★ character alone would be read as "black star" or nothing useful, so aria-label names each one "Rate 3 of 5".', pitfall: 'The buttons do not say which star is currently chosen. A radio group (role="radiogroup" with one role="radio" per star, or real radio inputs) announces "3 of 5, selected" and gives arrow-key movement with a single Tab stop.' },
    { title: 'Show the same preview to keyboard users', detail: 'A keyboard user tabbing through the stars gets no preview here, because the preview only listens to the mouse. Adding onFocus={() => setHover(value)} and onBlur={() => setHover(0)} to each star gives them the same "this is what you are about to pick" feedback a mouse user gets.' },
  ],
  graded: [
    { point: 'Preview and committed value are separate state', why: 'Overwriting the rating on hover and restoring on leave is the version that loses the user\'s actual rating when the pointer exits unexpectedly.' },
    { point: 'It works from the keyboard', why: 'A rating is an input. Built from divs it cannot be reached by Tab or set from the keyboard; buttons fix that, and a radio group adds arrow keys and form-style selection, which is what the follow-up question will be.' },
    { point: 'Each star has an accessible name', why: 'A screen reader must announce something like "Rate 3 of 5", not "button" or "black star". The label, not the glyph, is what it reads.' },
    { point: 'Mouse-leave is handled once, on the container', why: 'Per-star handlers, as in this template, flicker as the pointer crosses the gaps between stars. It is a small detail, but the one that shows whether you ran the code.' },
  ],
};

const tabs: BuildExplanation = {
  kind: 'build',
  problem: 'Tabs',
  problemStatement:
    'Tabs rendered from data, with the keyboard behaviour and roles a screen reader expects, an underline that slides to the active tab and a panel that fades in. The question also asks which animation tool you would use, and the answer is a trade-off, not a favourite.',
  buildOrder: [
    {
      title: 'Drive the tabs from an array',
      excerpt: { from: 'const INITIAL_TABS = [', lines: 5 },
      detail:
        'Each tab is { id, label, content }. Tabs can then be added and removed at runtime, which the template does, and every id-based lookup keeps working. Keying by id rather than position is what makes removal safe.',
    },
    {
      title: 'Fall back when the active tab disappears',
      excerpt: { from: 'const safeActiveId = tabs.some((t) => t.id === activeId) ? activeId : tabs[0] && tabs[0].id;', lines: 1 },
      detail:
        '"Remove active tab" filters the active tab out of the array, which would otherwise leave nothing selected. safeActiveId uses activeId if that tab still exists and the first tab if not. It is derived during render, so the fallback is correct on the very first frame, rather than fixed up afterwards in an effect.',
    },
    {
      title: 'Generate unique ids and keep a ref to every tab button',
      excerpt: { from: 'const base = React.useId();', lines: 2 },
      detail:
        'useId returns an id that is unique per component instance, so two Tabs on one page never produce duplicate element ids for aria-controls and aria-labelledby to point at. tabRefs is a Map from tab id to its button element, filled by a ref callback on each button, so the keyboard handler can move focus and the underline can be measured.',
    },
    {
      title: 'Give it the tab roles and a single Tab stop',
      excerpt: { from: 'role="tab"', lines: 5 },
      detail:
        'The wrapper has role="tablist", each button role="tab" with aria-selected and aria-controls pointing at its panel, and the panel role="tabpanel" with aria-labelledby pointing back at its tab. Only the selected tab has tabIndex 0; the others have -1, which removes them from the Tab order. This is called a roving tabindex: Tab enters the list once, and the arrow keys move inside it.',
      pitfall: 'Plain buttons pass an automated audit and are still wrong: a keyboard user has to Tab through every tab, and a screen reader never hears "tab, 2 of 3".',
    },
    {
      title: 'Handle Left, Right, Home and End',
      excerpt: { from: 'const onKeyDown = (e) => {', lines: 12 },
      detail:
        'The handler sits on the tablist and works out the next index: the arrows wrap around with the remainder operator (%), and Home and End jump to the first and last tab. It selects that tab and moves focus to it, so focus follows the selection. preventDefault stops Home and End from scrolling the page.',
    },
    {
      title: 'Measure the active tab before paint, then slide the underline',
      excerpt: { from: 'React.useLayoutEffect(() => {', lines: 4 },
      detail:
        'A sliding underline needs the active tab\'s position and width. useLayoutEffect runs after the DOM updates but before the browser paints, so the underline never flashes in its old spot. The underline span then moves with a transform, which the browser can animate without recalculating the page layout on every frame, as animating left would.',
    },
    {
      title: 'Replay the panel fade with a key',
      excerpt: { from: 'key={active.id}', lines: 1 },
      detail:
        'A CSS keyframe plays when an element is created. Keying the panel by tab id makes React create a new panel on every switch, so the fade plays each time. Without it React reuses the same div and the animation only ever runs once.',
    },
    {
      title: 'Choose the animation tool, and switch it off for reduced motion',
      detail:
        'CSS transitions and keyframes cover a slide and a fade at zero JavaScript cost, so they are used here. Framer Motion (now Motion) earns its size when you need exit animations, so the old panel can fade out before it unmounts, or layout animation with layoutId. react-transition-group\'s CSSTransition is the older way to animate an unmounting element with plain CSS. Whatever you pick, the prefers-reduced-motion query in the style tag turns it off for people who asked for less motion.',
    },
  ],
  graded: [
    { point: 'The tabs follow the ARIA tabs pattern, keyboard included', why: 'Roving tabindex, arrow keys and the three roles are exactly what an accessibility-aware interviewer checks, and exactly what a quick implementation leaves out.' },
    { point: 'The animation choice is a trade-off', why: 'The question names three tools. Choosing CSS by default and explaining what would make you pick Motion (exit and layout animations) shows judgement rather than habit.' },
    { point: 'The underline is measured before paint and moved with transform', why: 'It shows you know why useLayoutEffect exists and which CSS properties are cheap to animate, which is more interesting than the animation itself.' },
    { point: 'Tabs are data, keyed by id', why: 'Dynamic tab rendering is part of the question. Being able to add and remove tabs, with a correct fallback, is the proof.' },
  ],
};

const accordion: BuildExplanation = {
  kind: 'build',
  problem: 'Accordion',
  problemStatement:
    'Sections that expand and collapse, in single-open or multi-open mode, with a smooth height transition, correct screen-reader state and keyboard movement between headers. The question asks how you manage the active sections and whether to allow several open.',
  buildOrder: [
    {
      title: 'Store the open sections as a Set of ids',
      excerpt: { from: 'const [openIds, setOpenIds] = React.useState(() => new Set(defaultOpenIds));', lines: 1 },
      detail:
        'A Set of ids handles both modes with the same code: single-open is just a Set that never holds more than one. Ids rather than indexes mean items can be reordered or filtered without the wrong section opening.',
    },
    {
      title: 'Make single-open a one-line difference',
      excerpt: { from: 'if (!allowMultiple) next.clear();     // the ONLY line that differs between the modes', lines: 1 },
      detail:
        'toggle copies the Set (React needs a new object to notice the change), then deletes the id if it was open or adds it if it was not. In single-open mode it empties the copy before adding, so every other section closes. Choosing between the modes is a product question: single-open keeps an FAQ short and focused, multi-open suits settings or filters where people compare sections. One prop supports both.',
    },
    {
      title: 'Put the button inside a heading and wire up the ARIA',
      excerpt: { from: 'aria-expanded={isOpen}', lines: 2 },
      detail:
        'The header is a real button, inside an h3 so screen-reader users who jump between headings still find each section. aria-expanded announces "expanded" or "collapsed", aria-controls points at the panel, and the panel is a region labelled by its header. The ids come from useId, so two accordions on one page never clash.',
    },
    {
      title: 'Animate the height without measuring',
      excerpt: { from: 'display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr",', lines: 3 },
      detail:
        'height: auto cannot be transitioned. A one-row grid going from 0fr to 1fr can, with an overflow: hidden child, so the panel animates to exactly its content height with no JavaScript measurement. The panel stays mounted so it has something to animate when closing.',
      pitfall: 'Unmounting the panel on close (isOpen && …) makes a closing animation impossible, because the element is gone before it can shrink.',
    },
    {
      title: 'Hide closed panels from the keyboard',
      excerpt: { from: 'visibility: isOpen ? "visible" : "hidden",', lines: 1 },
      detail:
        'The grid trick makes a closed panel look empty, but its links are still in the Tab order, so focus disappears into invisible content. visibility: hidden removes them from Tab and from the accessibility tree, and because visibility switches at the end of the transition, the close animation still plays.',
    },
    {
      title: 'Move between headers with the arrow keys',
      excerpt: { from: 'const onHeaderKeyDown = (e, index) => {', lines: 8 },
      detail:
        'Each header button registers itself in headerRefs by index through a ref callback. Up and Down move focus between headers and wrap at the ends; Home and End jump to the first and last. Tab still moves out of the accordion normally, so keyboard users are never trapped.',
    },
    {
      title: 'Turn the animation off for people who asked for less motion',
      excerpt: { from: '<style>{"@media (prefers-reduced-motion: reduce)', lines: 1 },
      detail:
        'prefers-reduced-motion is an operating-system setting people turn on when animation makes them unwell. Every animated element carries the acc-anim class, and this one rule removes their transitions, so sections open and close instantly for those users.',
    },
  ],
  graded: [
    { point: 'One state shape serves both modes', why: 'The question asks how you manage active sections. A Set of ids, with single-open as a one-line rule, is clean and extensible, and shows you designed it rather than branched it.' },
    { point: 'The height animates without measuring', why: 'Transition effects are part of the question. Knowing why height: auto cannot animate, and the grid-rows technique that avoids it, is a strong answer.' },
    { point: 'Closed panels are out of the Tab order', why: 'Being able to Tab into a closed panel and lose focus is the most common failure of animated accordions; the Accessibility guide\'s tricky Q2 is exactly this bug.' },
    { point: 'You mention <details> as the native alternative', why: 'It gives open and close, keyboard support and screen-reader state for free. Knowing when not to build the component is a senior signal.' },
  ],
};

const otpInput: BuildExplanation = {
  kind: 'build',
  problem: 'OTP Input',
  problemStatement:
    'Six single-character boxes for a one-time passcode (OTP, the code a site texts or emails you) that move to the next box as you type, step back on backspace, accept digits only, and spread a pasted code across all six. Almost all the difficulty is in moving focus and handling paste.',
  buildOrder: [
    { title: 'One array of digits, one array of input refs', excerpt: { from: 'const [digits, setDigits] = React.useState(Array(length).fill(""));', lines: 2 }, detail: 'digits holds one string per box, all empty to start. refs holds the six input elements, because moving focus from one box to the next is something you do to the DOM directly; that is one of the cases where a ref is the right tool rather than an escape hatch.' },
    { title: 'Register each input in the refs array', excerpt: { from: 'ref={el => refs.current[i] = el}', lines: 1 }, detail: 'React calls the ref callback with the input element when it mounts (and with null when it unmounts), so refs.current[i] always points at box i.', pitfall: 'In React 19 a function returned from a ref callback is treated as its cleanup. This arrow returns the element, not a function, so it works, but TypeScript rejects the return value; the block body `el => { refs.current[i] = el; }` is the safer habit.' },
    { title: 'Accept one digit, store it, and advance', excerpt: { from: 'function handleChange(i, value) {', lines: 7 }, detail: 'The regex `^\\d?$` allows exactly one digit or an empty string, so letters are ignored and clearing a box still works. The new digit goes into a copy of the array, and if there is a next box, focus moves to it.', pitfall: 'type="number" looks right and is not: it adds spinner arrows and lets in "e", "+" and "-". This template uses type="text" with inputMode="numeric", which still brings up the number pad on phones.' },
    { title: 'Select the digit on focus so typing replaces it', excerpt: { from: 'onFocus={e => e.target.select()}', lines: 1 }, detail: 'Each box has maxLength 1, so typing into a filled box would normally do nothing. Selecting its contents when it gains focus means the next keypress replaces the old digit, which is what users expect when correcting one box.' },
    { title: 'Backspace in an empty box steps back', excerpt: { from: 'function handleKeyDown(i, e) {', lines: 5 }, detail: 'In a filled box, Backspace just deletes the digit through the normal change handler. In an empty box there is nothing to delete, so focus moves to the previous box, where its digit is selected, ready to be deleted or typed over.', pitfall: 'This template does not handle the arrow keys. In a one-character box Left and Right only move the caret, so they appear to do nothing; a production version moves focus to the neighbouring box.' },
    { title: 'Handle paste as a whole-code event', excerpt: { from: 'function handlePaste(e) {', lines: 9 }, detail: 'Copying the code from a message is how most people enter it. The handler sits on the wrapper div, which receives the paste event from whichever box is focused. It blocks the default paste, keeps only digits (up to six), fills the boxes from the start, and focuses the box after the last pasted digit.', pitfall: 'Strip non-digits first: codes are routinely copied as "123 456" or with a trailing newline. Without this handler a paste would put only the first character in the focused box, because of maxLength.' },
    { title: 'Report the code once every box is filled', excerpt: { from: 'if (digits.every(d => d !== "")) onComplete?.(digits.join(""));', lines: 1 }, detail: 'After every change to digits the effect checks whether all six are filled, and if so passes the joined code to onComplete. App uses that to show "Submitted: 123456".' },
  ],
  graded: [
    { point: 'Paste works across all six boxes', why: 'It is the main way users enter an OTP and the requirement most candidates skip. Testing it is the first thing an interviewer does.' },
    { point: 'Backspace steps back from an empty box', why: 'Without it, correcting a typo means clicking back into the previous box by hand. It is a two-line branch that shows you actually used the component.' },
    { point: 'Digits are enforced, with the right mobile keyboard', why: 'inputMode="numeric" plus a regex filter is the correct pair. type="number" is the plausible-looking wrong answer: it permits "e", "+" and "-" and adds spinners.' },
    { point: 'Refs are used deliberately for focus', why: 'Moving focus is one of the legitimate uses of a ref. Knowing that, rather than trying to express it through state, is what the exercise is probing.' },
  ],
};

const ticTacToe: BuildExplanation = {
  kind: 'build',
  problem: 'Tic-Tac-Toe',
  problemStatement:
    'A 3x3 grid, two players alternating, winner detection across rows, columns and diagonals, a draw, and a reset. Deliberately easy, so the interviewer can watch what you store versus what you compute.',
  buildOrder: [
    { title: 'Store the board and whose turn it is, nothing else', excerpt: { from: 'const [squares, setSquares] = React.useState(Array(9).fill(null));', lines: 2 }, detail: 'The board is a flat array of nine cells, numbered 0 to 8 left to right and top to bottom, each null, "X" or "O". A flat array is easier to check and to reset than nested rows. The winner, the draw and the status line are all worked out from these two values.', pitfall: 'Storing `winner` in state means updating it on every move and keeping it in step with the board. A value derived from the board cannot go stale.' },
    { title: 'List the eight winning lines as data', excerpt: { from: 'const LINES = [', lines: 5 }, detail: 'Three rows, three columns and two diagonals, each as the three cell indexes that make it. Writing them as data means the check is one loop rather than eight hand-written if statements.' },
    { title: 'Check each line for three matching marks', excerpt: { from: 'function calculateWinner(squares) {', lines: 8 }, detail: 'For each line, if the first cell has a mark and the other two match it, that player has won, and the function returns the winner plus the line so it can be highlighted. If no line matches it returns null.', pitfall: 'The `squares[a] &&` guard is what stops three empty cells (null === null === null) counting as a win, the classic bug here.' },
    { title: 'Derive the result, the draw and the status line during render', excerpt: { from: 'const result = calculateWinner(squares);', lines: 3 }, detail: 'Every render recomputes the winner from the board. A draw is "every cell filled and no winner"; the status line then picks between winner, draw and whose turn it is.', pitfall: 'Checking only for a full board declares a draw when the final move is a winning one.' },
    { title: 'Guard the click, then place the mark on a copy', excerpt: { from: 'if (squares[i] || winner) return;', lines: 5 }, detail: 'Both conditions are necessary: one stops a player overwriting an occupied square, the other stops play after someone has won. slice() makes a new array, the mark goes into the copy, and the turn flips.', pitfall: '`squares[i] = value` then `setSquares(squares)` is the mutation bug: the same array reference, so React decides nothing changed and the board does not update.' },
    { title: 'Highlight the winning line', excerpt: { from: 'highlight={result?.line.includes(i)}', lines: 1 }, detail: 'Each Square is told whether its index is in the winning line, and a highlighted square turns green. `result?.` stops this throwing while there is no winner yet.' },
    { title: 'Reset by replacing state, not clearing it piecemeal', excerpt: { from: 'function reset() {', lines: 4 }, detail: 'Reset puts a fresh empty board in place and gives X the first move. If the game grows more state, changing the component\'s `key` remounts it with every piece reset at once.' },
  ],
  graded: [
    { point: 'Winner and draw are derived, never stored', why: 'It is the main thing this exercise tests. Stored derived state is the bug class that scales: the same instinct later stores filtered lists and totals.' },
    { point: 'The null guard in the line check', why: 'Without it three empty squares pass the equality test and the game announces a winner before anyone has played. It is the specific bug interviewers look for.' },
    { point: 'State updates are immutable', why: 'Mutating the array and calling the setter with the same reference means React skips the render. The board simply does not change, and the line that looks wrong is not where the bug is.' },
    { point: 'Play is blocked once the game is over', why: 'It is one condition and it is routinely missed, so the board keeps accepting moves after a win, which is the fastest thing for an interviewer to check.' },
  ],
};

const stopwatch: BuildExplanation = {
  kind: 'build',
  problem: 'Stopwatch',
  problemStatement:
    'Start, pause, resume and reset, displaying time down to hundredths of a second. The trap is how you measure elapsed time: counters that add a fixed amount per tick drift, and they drift worst on the slowest machines.',
  buildOrder: [
    { title: 'Keep the displayed time in state and the timing values in refs', excerpt: { from: 'const [elapsed, setElapsed] = React.useState(0);', lines: 5 }, detail: 'elapsed is what the screen shows, so it is state. startRef is the clock time when the current run began, baseRef is the time banked from earlier runs, and rafRef is the id of the pending animation frame; none of them are shown directly, so they are refs and changing them causes no render.' },
    { title: 'Measure against a clock, never add up ticks', excerpt: { from: 'setElapsed(baseRef.current + (Date.now() - startRef.current));', lines: 1 }, detail: 'Elapsed time is always "time banked before + (now - when this run started)". Timers do not fire exactly on schedule: a busy main thread, a background tab or a slow frame all delay them, so adding 10 ms per tick loses time steadily. Reading the clock each time cannot drift.', pitfall: 'Date.now() follows the system clock, which can jump if it is corrected. performance.now() only ever moves forward, which makes it the better source for a duration.' },
    { title: 'Drive the display with requestAnimationFrame', excerpt: { from: 'if (!running) return;', lines: 7 }, detail: 'requestAnimationFrame (rAF) asks the browser to call you just before its next repaint, usually 60 times a second, so the display updates exactly as often as anyone can see. tick reschedules itself each frame. The effect only runs the loop while running is true.', pitfall: 'The cleanup is what stops the loop. Without cancelAnimationFrame, pausing leaves it running and it survives unmount.' },
    { title: 'Start and resume from the current clock time', excerpt: { from: 'function start() {', lines: 4 }, detail: 'Start records the clock time and flips running, which starts the effect\'s loop. The same function serves Resume, because baseRef still holds the time from earlier runs; the button reads "Resume" once elapsed is above zero.' },
    { title: 'Pause banks the elapsed time', excerpt: { from: 'function pause() {', lines: 4 }, detail: 'Pause stores everything shown so far in baseRef and stops the loop. On resume the new run adds on top of it, so the total is exact however many times you pause.', pitfall: 'Forgetting to bank on pause means resume counts only the new run and silently discards the earlier time.' },
    { title: 'Reset clears both the banked time and the display', excerpt: { from: 'function reset() {', lines: 5 }, detail: 'Reset zeroes baseRef and elapsed and stops the loop, so the next Start begins from nothing.' },
    { title: 'Format from the elapsed milliseconds', excerpt: { from: 'function formatTime(ms) {', lines: 8 }, detail: 'Hours, minutes, seconds and hundredths are each carved out with division and the remainder operator (%), then padded to two digits. It is a pure function of one number, so it lives outside the component and is easy to test. The display uses a monospace font so the digits do not jiggle as their widths change.' },
  ],
  graded: [
    { point: 'Elapsed time comes from timestamps, not from counting ticks', why: 'It is the whole point of the exercise. Adding up interval callbacks drifts under load and in background tabs, and the error keeps growing.' },
    { point: 'rAF for the display, with cleanup', why: 'rAF updates once per screen refresh, which is as often as anyone can see, and it pauses in a hidden tab. A 10 ms interval asks for 100 renders a second, more than the screen can show.' },
    { point: 'Pause banks the elapsed segment', why: 'It is what makes resume correct, and getting it wrong is silent: the clock simply reads low and nobody notices until they check.' },
    { point: 'The timing values are refs, not state', why: 'They change every run but nothing renders directly from them. Putting them in state would schedule extra renders on top of the one per frame the display already needs.' },
  ],
};

const calculator: BuildExplanation = {
  kind: 'build',
  problem: 'Calculator',
  problemStatement:
    'A four-function calculator with a display, digits, operators, equals and clear. It looks trivial and is not: it is a small state machine (a fixed set of remembered values that each key press moves between), and chained operations are where implementations fall apart.',
  buildOrder: [
    { title: 'Name the four things a calculator remembers', excerpt: { from: 'const [display, setDisplay] = React.useState("0");', lines: 4 }, detail: 'display is the text on screen, previous is the number entered before the operator, op is the pending operator, and overwrite says whether the next digit should replace the display. That fourth flag is the one people miss: without it, 5 + 3 shows "53".', pitfall: 'Trying to infer overwrite from the other fields works until a second operator press or an equals, at which point the special cases multiply.' },
    { title: 'Type digits, replacing a lone zero or a finished result', excerpt: { from: 'function inputDigit(d) {', lines: 8 }, detail: 'If overwrite is on (just after an operator or equals), the digit starts a fresh number. Otherwise it is appended, except that a display of "0" is replaced so you never see "07".' },
    { title: 'Allow one decimal point, and start a new number with "0."', excerpt: { from: 'function inputDot() {', lines: 4 }, detail: 'A dot typed as the first key of a new number becomes "0.". Otherwise it is added only if the display does not already contain one, so "1.2.3" cannot be typed (those keys give 1.23).' },
    { title: 'Make the operator press perform the pending operation', excerpt: { from: 'function chooseOp(nextOp) {', lines: 12 }, detail: 'The first operator just remembers the number. A later one first computes the pending operation and shows its result, which is what makes chaining work: 2 + 3 + shows 5 before you type the next number, and 2 + 3 + 4 = gives 9. Either way the new operator is stored and overwrite is turned on.', pitfall: 'Nothing here stops two operator presses in a row: 5 + + computes 5 + 5 and shows 10. Skipping the compute when overwrite is already on (no new number typed yet) fixes it.' },
    { title: 'Keep the arithmetic in one pure function', excerpt: { from: 'function compute(a, b, op) {', lines: 8 }, detail: 'compute takes two numbers and an operator and returns the answer, with no state involved, so chooseOp and equals share it. Here division by zero returns 0 rather than Infinity.', pitfall: 'Returning 0 hides the mistake from the user; showing "Error" is more honest. Floating-point numbers also leak through: 0.1 + 0.2 = shows 0.30000000000000004 unless you round the result for display.' },
    { title: 'Equals finishes the calculation and starts fresh', excerpt: { from: 'function equals() {', lines: 7 }, detail: 'Equals does nothing unless an operation is pending. Otherwise it shows the result and clears previous and op, and overwrite makes the next digit start a new number. Pressing = again does nothing, because nothing is pending any more.', pitfall: 'Many real calculators repeat the last operation on a second =, so 2 + 3 = = gives 8. Supporting that means remembering the last operator and operand instead of clearing them.' },
    { title: 'Clear everything with C', excerpt: { from: 'setDisplay("0"); setPrevious(null); setOp(null); setOverwrite(false);', lines: 1 }, detail: 'C resets all four pieces of state to where they started. This template has no separate "clear entry" key, so fixing one mistyped number means starting the whole calculation again; a CE key that resets only display is the usual addition.' },
    { title: 'Render the keypad from one button helper', excerpt: { from: 'const btn = (label, onClick, bg = "#1e293b") => (', lines: 2 }, detail: 'btn returns a styled button for a label and a handler, so the keypad is a 4-column grid of one-line calls. Operators and equals get their own colours.' },
  ],
  graded: [
    { point: 'You identified it as a state machine', why: 'Candidates who treat it as string manipulation get 2 + 3 + 4 wrong or show "53". Naming the four pieces of state up front is what makes the rest fall out.' },
    { point: 'Chained operators resolve the pending operation', why: 'Pressing an operator has to compute, not just record. It is the first thing an interviewer tries after the happy path, and pressing two operators in a row is the second.' },
    { point: 'The overwrite flag exists', why: 'Without it every digit after an operator appends to the previous result. It is the most visible bug in this component and it is one boolean.' },
    { point: 'Division by zero and the decimal rules are handled', why: 'Infinity or NaN on the display, or "1.2.3" being typeable, are the details that separate a demo from something you would ship.' },
  ],
};

const autoComplete: BuildExplanation = {
  kind: 'build',
  problem: 'Auto-Complete (ARIA combobox)',
  problemStatement:
    'Suggestions as you type. This one question combines four separate skills (debouncing, request cancellation, keyboard navigation, and the ARIA combobox pattern, which is the standard set of roles and attributes that tells a screen reader "this input has a list of suggestions"), and interviewers grade all four.',
  buildOrder: [
    { title: 'Model the request as five states', excerpt: { from: 'const [status, setStatus] = React.useState("idle");', lines: 1 }, detail: 'status is "idle" (nothing typed), "loading", "success", "empty" (the search worked but matched nothing) or "error". Each needs something different in the list, and a single field means two of them can never show at once. `active` is the index of the highlighted option, with -1 meaning none.' },
    { title: 'Debounce the query, not the input', excerpt: { from: 'const debounced = useDebouncedValue(query, 250);', lines: 1 }, detail: 'query updates on every keystroke, so the text box always feels instant; debounced copies it only after 250 ms without typing, and only debounced triggers a search. The hook\'s cleanup cancels the pending timer on each keystroke, so a burst of typing produces one request.', pitfall: 'Debouncing the input itself (delaying the text box) is what makes a search box feel broken.' },
    { title: 'Search when the debounced query changes, and cancel the previous search', excerpt: { from: 'const controller = new AbortController();', lines: 19 }, detail: 'An empty query clears the list without a request. Otherwise the effect starts a search with an AbortController, and on success stores the options, sets success or empty, opens the list and clears the highlight. The cleanup aborts the search when the query changes again, and the catch ignores that AbortError so a cancellation is never shown as a failure.', pitfall: 'Debouncing reduces the number of requests; it does not order them. Without the abort, a slow response for "l" can land after a fast one for "lo" and replace the right results with stale ones.' },
    { title: 'Keep real focus in the input and move a virtual focus', excerpt: { from: 'aria-activedescendant={active >= 0 ? `ac-opt-${active}` : undefined}', lines: 1 }, detail: 'role="combobox", aria-expanded and aria-controls describe the input and its list. aria-activedescendant holds the id of the highlighted option, so a screen reader announces it, while the browser\'s focus never leaves the input, which is what lets the user keep typing while arrowing through suggestions.', pitfall: 'Calling .focus() on an option is the single most common way this component is built wrong: typing stops working the moment you press Down.' },
    { title: 'Give every option an id, a role and a selected state', excerpt: { from: 'id={`ac-opt-${i}`}', lines: 3 }, detail: 'Each li gets the id that aria-activedescendant points at, role="option", and aria-selected on the highlighted one. The list itself has role="listbox" and a label.' },
    { title: 'Move the highlight with the arrow keys, Home and End', excerpt: { from: 'case "ArrowDown":', lines: 10 }, detail: 'Down and Up move the highlight and wrap around at the ends; Home and End jump to the first and last option. preventDefault stops the caret jumping to the start or end of the text while you navigate. Pressing Down or Up while the list is closed reopens it if there are options.' },
    { title: 'Commit with Enter, close with Escape or Tab', excerpt: { from: 'case "Enter":', lines: 9 }, detail: 'Enter picks the highlighted option, filling the input and closing the list. Escape closes the list, and Tab closes it and lets focus move on normally, so the keyboard is never trapped.', pitfall: 'A second Escape, on the now-closed list, should clear the input. That case has to be handled before the `if (!open) return;` early exit at the top of onKeyDown; inside the switch it would never run, because a closed list never reaches the switch.' },
    { title: 'Commit a mouse choice on mousedown, not click', excerpt: { from: 'onMouseDown={(e) => { e.preventDefault(); commit(i); }}', lines: 2 }, detail: 'Pressing the mouse on an option makes the input lose focus, and onBlur closes the list. A click event only fires after the button is released, by which time the option is gone. mousedown runs first, and preventDefault stops the blur from happening at all. Hovering an option also moves the highlight.' },
    { title: 'Keep the highlighted option scrolled into view', excerpt: { from: 'listRef.current.children[active]?.scrollIntoView?.({ block: "nearest" });', lines: 1 }, detail: 'The list is at most 200px tall and scrolls. Whenever active changes, this scrolls the highlighted option into view, and "nearest" moves the list as little as possible.', pitfall: 'Without it, arrowing past the fifth option moves a highlight nobody can see.' },
    { title: 'Announce how many suggestions there are', excerpt: { from: '<div aria-live="polite" aria-atomic="true"', lines: 3 }, detail: 'A sighted user sees the list appear; a screen-reader user has to be told. This live region (text a screen reader announces when it changes) says "5 suggestions available" or "No suggestions", and aria-atomic makes it read the whole sentence each time.' },
  ],
  graded: [
    { point: 'aria-activedescendant, with DOM focus staying in the input', why: 'It is the defining detail of the combobox pattern. Moving real focus to the options breaks typing, and it is how interviewers tell someone has implemented this before.' },
    { point: 'Debouncing and cancellation are both present', why: 'They solve different problems: how many requests you send, and what order the answers arrive in. Doing only the first leaves a race that shows the wrong suggestions now and then.' },
    { point: 'The full keyboard set', why: 'Arrow keys alone are the minimum. Reopening on Down, Home and End, Enter to commit, and Escape and Tab to leave are what distinguish a complete implementation.' },
    { point: 'onMouseDown to select, and the active option scrolled into view', why: 'Both are bugs you only find by using it: clicking a suggestion does nothing, and arrowing past the fifth option moves a highlight nobody can see.' },
  ],
};

const toastSnackbar: BuildExplanation = {
  kind: 'build',
  problem: 'Toast / Snackbar',
  problemStatement:
    'Build a toast system any part of the app can call: a queue so toasts never overlap, a timeout per toast that pauses on hover, and announcements for screen readers. The graded decision is where the state lives, because it decides who can call toast() and what re-renders.',
  buildOrder: [
    {
      title: 'Put the toasts in a tiny store outside React',
      excerpt: { from: 'function createToastStore() {', lines: 12 },
      detail:
        'The list lives in a closure (a variable only the returned functions can reach), exposed through subscribe, getSnapshot, add and dismiss. That answers "Context, Redux or an event system?" directly: it is the event system, and it means an API helper or an axios interceptor can raise a toast without being a component. getSnapshot returns the same array until something changes, which is what lets React skip re-rendering when nothing happened.',
      pitfall: 'With Context, toast() only works inside the tree, and every component that reads the context re-renders on every toast.',
    },
    {
      title: 'Expose plain functions as the public API',
      excerpt: { from: 'const toast = {', lines: 6 },
      detail:
        'Callers never touch the store: they call toast.success or toast.error, and each type sets its own sensible duration. Errors stay on screen twice as long (6 seconds instead of 3), because people read them more carefully and may need to act.',
    },
    {
      title: 'Call toast() from plain code, outside any component',
      excerpt: { from: 'function saveProfile(shouldFail) {', lines: 5 },
      detail:
        'saveProfile is an ordinary async function, not a component or a hook, and it still raises a toast when the save succeeds or fails. That is the payoff of keeping the list outside React: request helpers and error handlers can report results directly.',
    },
    {
      title: 'Refuse duplicates when adding',
      excerpt: { from: 'if (toasts.some((t) => t.message === message && t.type === type)) return null;', lines: 1 },
      detail:
        'A failing request that retries three times should not stack three identical toasts. Checking both showing and queued toasts keeps the screen honest: one problem, one message.',
    },
    {
      title: 'Read the store with useSyncExternalStore',
      excerpt: { from: 'return React.useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);', lines: 1 },
      detail:
        'This is the hook React provides for subscribing to state that lives outside it. It re-renders only the component that reads it, the Toaster, and it cannot show two different versions of the list in one render during concurrent rendering (where React may pause a render and resume it later), which a hand-written useEffect subscription can.',
    },
    {
      title: 'Show at most three; later toasts wait in order',
      excerpt: { from: 'const visible = toasts.slice(0, MAX_VISIBLE);', lines: 2 },
      detail:
        'The queue is what stops overlap, not CSS. Only the first three are rendered, and a "+2 waiting" line tells the user more are coming. When one is dismissed, the next one in line moves up by itself because the slice is recomputed.',
    },
    {
      title: 'Start each countdown only once the toast is visible, and pause on hover',
      excerpt: { from: 'React.useEffect(() => {', lines: 9 },
      detail:
        'The timer lives in the ToastItem, and only visible toasts are mounted, so a queued toast cannot expire before anyone saw it. On hover the effect cleans up, clears the timer and records how much time was left in a ref; on leave it starts again with only the remainder.',
      pitfall: 'A setTimeout started when the toast is ADDED (the usual first version) runs down while the toast is still queued, and is never cleared if the component unmounts.',
    },
    {
      title: 'Keep the live region mounted even when it is empty',
      excerpt: { from: 'role="status"', lines: 2 },
      detail:
        'role="status" with aria-live="polite" makes this a live region: screen readers announce text added inside it once they finish what they are saying. If the region itself appears at the same moment as its text, most of them announce nothing. Rendering the Toaster permanently, empty or not, is what makes the announcements work.',
    },
  ],
  graded: [
    { point: 'You can justify the store over Context or Redux', why: 'The question asks it outright. The strong answer names the two costs of Context (callable only in the tree, re-renders every consumer) and the smell of Redux (timers and throwaway UI in global state), then picks an external store.' },
    { point: 'The queue, not CSS, prevents overlap', why: 'Stacking toasts with position rules still lets twenty cover the page. Capping the visible count and queueing the rest is the actual answer to "how do you avoid overlapping".' },
    { point: 'Timers are owned by the visible toast and cleaned up', why: 'It shows you think about the lifecycle: nothing expires unseen, hover pauses rather than resets, and no timeout fires after its toast is gone.' },
    { point: 'The live region exists before the first toast', why: 'It is the accessibility detail that separates a component that passes review from one that is actually announced, and interviewers rarely hear it volunteered.' },
  ],
};

const carousel: BuildExplanation = {
  kind: 'build',
  problem: 'Carousel / Slider',
  problemStatement:
    'Previous and next controls, position dots, keyboard navigation and auto-play. The index arithmetic is small; auto-play fighting with what the user is doing is where this gets interesting.',
  buildOrder: [
    { title: 'Wrap the index with the remainder operator, in both directions', excerpt: { from: 'const next = React.useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);', lines: 2 }, detail: 'next adds one and wraps from the last slide back to 0 with `%` (the remainder after division). prev adds SLIDES.length before taking the remainder, because in JavaScript -1 % 5 is -1, not 4. Both use the functional form of setIndex, so they never depend on a captured index and useCallback can keep them the same function forever.', pitfall: 'Without the `+ SLIDES.length`, the first backwards click sets the index to -1 and the track slides off to a blank space.' },
    { title: 'Lay the slides out in a row and slide the row', excerpt: { from: 'transform: `translateX(${-index * 100}%)`,', lines: 2 }, detail: 'Every slide is 100% wide inside a flex row, so moving the row left by index × 100% brings slide `index` into the frame, and the wrapper\'s overflow: hidden clips the others. The transform transition animates the move over 0.4 s.' },
    { title: 'Auto-play with one interval that calls next', excerpt: { from: 'const id = setInterval(next, 3000);', lines: 2 }, detail: 'While autoPlay is on, an interval advances every 3 seconds, and the cleanup stops it when autoPlay turns off. Because next uses a functional update, this one interval never goes stale.', pitfall: 'The interval does not restart when the user clicks, so a manual click can be followed by an automatic advance moments later. Adding index to the effect\'s dependencies restarts the timer on every slide change and gives each slide a full 3 seconds.' },
    { title: 'Add keyboard shortcuts, including Space to pause', excerpt: { from: 'const onKey = (e) => {', lines: 5 }, detail: 'Left and Right arrows move between slides and Space toggles auto-play. The listener is added on mount and removed in the cleanup.', pitfall: 'A listener on window catches these keys everywhere on the page: typing a space in any text box would pause the carousel, and Space no longer scrolls the page. Attaching it to the carousel region (with tabIndex so it can take focus) scopes it properly.' },
    { title: 'Label the carousel and each slide for screen readers', excerpt: { from: '<div key={i} role="group" aria-roledescription="slide"', lines: 2 }, detail: 'The wrapper is a region described as a "carousel" and named "Featured". Each slide is a group described as a "slide" and named "1 of 5", and every slide except the current one has aria-hidden, so a screen reader hears one slide rather than all five at once.' },
    { title: 'Name the arrow buttons', excerpt: { from: '<button onClick={prev} aria-label="Previous slide" style={{', lines: 1 }, detail: 'The buttons show only ‹ and ›, which a screen reader cannot make sense of, so each has an aria-label saying what it does.' },
    { title: 'Make the dots real buttons with names', excerpt: { from: 'aria-label={"Go to slide " + (i + 1)}', lines: 2 }, detail: 'The dots are navigation, so they are buttons that jump straight to a slide. Each is named "Go to slide 3", and aria-current marks the one on screen, so the position is not shown by colour alone.' },
    { title: 'Give auto-play a visible Pause button', excerpt: { from: 'onClick={() => setAutoPlay(!autoPlay)}', lines: 1 }, detail: 'The button toggles auto-play and its label flips between "Pause" and "Play". WCAG 2.2.2 (the accessibility guideline on moving content) requires a way to pause anything that moves on its own for more than five seconds, so this is a requirement rather than a nicety.', pitfall: 'This template does not pause on hover, on keyboard focus, or when the tab is hidden. Content that moves while someone is reading it or tabbing through it is the main complaint about auto-playing carousels, so those pauses are the next thing to add.' },
  ],
  graded: [
    { point: 'Negative remainder is handled', why: 'The first click on prev exposes it, and the symptom, a blank carousel, looks unrelated to the arithmetic that caused it.' },
    { point: 'Auto-play and manual navigation cooperate', why: 'Restarting the timer on a manual change is the difference between a carousel that feels considered and one that jumps again right after you clicked. Functional updates are what keep a single interval from going stale.' },
    { point: 'It pauses for the user', why: 'A visible control at minimum, and ideally hover and focus too. Moving content with no way to stop it is an accessibility failure with a specific WCAG criterion attached, not a matter of taste.' },
    { point: 'Dots are buttons with accessible names', why: 'Unlabelled dot divs cannot be reached from the keyboard or announced, the most common accessibility gap in this component after the auto-play itself.' },
  ],
};

const todoList: BuildExplanation = {
  kind: 'build',
  problem: 'Todo List (localStorage + memo)',
  problemStatement:
    'The classic list, with the follow-ups that actually matter: persist it in localStorage (the browser\'s small per-site key-value store), and make sure typing in the input does not re-render every row. Four techniques have to work together for the second part to hold.',
  buildOrder: [
    { title: 'Load saved todos defensively', excerpt: { from: 'function loadTodos() {', lines: 15 }, detail: 'loadTodos reads the saved string, falls back to the seed list if there is none, and parses it. It then checks the shape (an array of items with a numeric id and a string text), because saved data can come from an older version of the app. The try/catch covers localStorage throwing outright, which it does in some private windows and when storage is blocked.', pitfall: 'JSON.parse of whatever is in storage is untrusted input. Without the Array.isArray check, one bad value makes the app crash on every load with no way for the user to recover.' },
    { title: 'Read storage once, with a lazy initialiser', excerpt: { from: 'const [todos, setTodos] = React.useState(loadTodos);', lines: 1 }, detail: 'Passing the function itself (`loadTodos`, not `loadTodos()`) makes React call it only on the first render. This runs during render, so without the try/catch above a storage error would take down the whole component tree.', pitfall: '`useState(loadTodos())` looks the same but reads and parses storage on every render and throws the result away.' },
    { title: 'Hand out ids from a ref that starts past the highest saved id', excerpt: { from: 'const nextId = React.useRef(', lines: 3 }, detail: 'The next id starts one above the largest id already in the list, so reloaded todos and new ones never collide. It is a ref because changing it should not cause a render.' },
    { title: 'Write back whenever the list changes, and say when you cannot', excerpt: { from: 'localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));', lines: 5 }, detail: 'The effect runs after every change to todos and saves the whole list, so there is one place that writes rather than one per handler. If the write throws (storage full or blocked), storageOk turns false and a warning tells the user their changes will not survive a reload.', pitfall: 'Every toggle rewrites the whole list. That is fine for a todo list; for large or fast-changing data, debounce the write so a burst of edits becomes one save.' },
    { title: 'Keep the draft text inside the input component', excerpt: { from: 'const TodoInput = React.memo(function TodoInput({ onAdd }) {', lines: 10 }, detail: 'This is the single biggest win. If the draft text lived in TodoApp, every keystroke would re-render TodoApp and with it every row. Kept in TodoInput, typing re-renders one small component, and the parent hears about the text only when the form is submitted.', pitfall: 'Doing only this and skipping memo still re-renders every row whenever the parent updates for any other reason.' },
    { title: 'Memoise the row, and count its renders to prove it', excerpt: { from: 'const TodoItem = React.memo(function TodoItem({ todo, onToggle, onDelete }) {', lines: 3 }, detail: 'React.memo skips re-rendering a component when every prop is the same reference as last time (a shallow compare). The render counter in each row shows it: toggle one todo and only that row\'s count goes up.', pitfall: 'One unstable prop, such as an inline arrow function or an object literal, is enough to make memo do nothing while looking like it works.' },
    { title: 'Keep the callbacks stable with functional updates', excerpt: { from: 'const toggleTodo = React.useCallback((id) => {', lines: 5 }, detail: 'useCallback with an empty dependency list returns the same function on every render, so the rows\' onToggle and onDelete props never change. That only works because the updater receives the latest list as `prev` instead of reading `todos` from the render it was created in.', pitfall: 'Reading `todos` directly would force it into the dependency list, create a new function on every change, and defeat the memo on every row.' },
    { title: 'Derive the visible list and the count, never store them', excerpt: { from: 'const visible = React.useMemo(() => {', lines: 5 }, detail: 'The filtered list and the "left" count are computed from todos and filter during render. useMemo only skips repeating the filter when neither has changed; the design would be correct without it.', pitfall: 'Keeping a filtered copy in state gives you two sources of truth that drift apart after the first edit.' },
    { title: 'Render the rows keyed by id, with pressed-state filter buttons', excerpt: { from: 'aria-pressed={filter === f}', lines: 1 }, detail: 'Each filter button says whether it is the active one with aria-pressed, which a screen reader announces as "pressed". Rows are keyed by todo id, so deleting one removes exactly its DOM node and memo can match each row to its previous props.' },
  ],
  graded: [
    { point: 'All four techniques, and you can say what each one fixes', why: 'Isolated input state, memoised rows, stable callbacks and functional updates. Reciting memo alone is the common answer, and it does nothing on its own, because the callbacks are still new every render.' },
    { point: 'The storage read is wrapped and validated', why: 'The accessor can throw, and the read happens during render, so this is a blank-page bug rather than a warning. Validating the parsed shape covers the other half.' },
    { point: 'Functional updates so the dependency arrays stay empty', why: 'It is the mechanism that makes the callbacks stable. Depending on todos looks equivalent and quietly re-creates every handler on every change.' },
    { point: 'You can say what you would do at 10,000 rows', why: 'None of this changes the fact that every row is in the DOM. Virtualisation (rendering only the rows on screen) is the next step, and the React Compiler, which inserts memoisation automatically, removes the need for the manual memo and useCallback. Both are the right follow-up answers.' },
  ],
};

const counterOptimized: BuildExplanation = {
  kind: 'build',
  problem: 'Counter (optimized re-renders)',
  problemStatement:
    'A counter is the smallest component that can show the whole re-render story: functional updates, stable handlers, memoised children (components wrapped in React.memo so they skip re-rendering when their props have not changed), and the stale closure that catches everyone inside setInterval.',
  buildOrder: [
    { title: 'Update from the previous value, not the captured one', excerpt: { from: '() => setCount((c) => Math.min(max, c + step)),', lines: 2 }, detail: 'The functional form receives the latest value React has, rather than the `count` captured when this render ran. Two calls in one handler therefore add two; with `setCount(count + 1)` both calls read the same count and it goes up by one. Math.min keeps the value at or below max.', pitfall: 'It is also what lets the dependency list leave out count: it lists only step and max, which change only if the props do.' },
    { title: 'Keep the handlers stable so memo can work', excerpt: { from: 'const decrement = React.useCallback(', lines: 5 }, detail: 'useCallback returns the same function until a dependency changes, so decrement and reset keep their identity while count changes. memo does a shallow compare of props, and a new arrow function each render would fail that compare every time, making the memo pure overhead.', pitfall: 'Passing an object or array literal as a prop has the same effect. One unstable prop defeats the whole comparison.' },
    { title: 'Pass booleans, not the count, to the memoised child', excerpt: { from: 'canIncrement={count + step <= max}', lines: 2 }, detail: 'The controls need to know whether + and − are allowed, not the count itself. These booleans only change at the edges of the range, so the controls re-render only when a button has to switch between enabled and disabled.' },
    { title: 'Show the effect with a render counter', excerpt: { from: 'onIncrement, onDecrement, onReset, canIncrement, canDecrement,', lines: 4 }, detail: 'A counter in the memoised child makes the optimisation visible: click + and the parent\'s render count climbs while the controls\' count stays still. It is also how you check that a memo is actually working rather than assuming it is.', pitfall: 'The counter is a ref, not state: updating state during render would trigger another render, forever.' },
    { title: 'Announce the value and disable the bounds', excerpt: { from: 'aria-live="polite" aria-atomic="true">', lines: 2 }, detail: 'The number sits in a live region, so a screen reader announces each new value. The + and − buttons are disabled when the next step would leave the range from min to max.' },
    { title: 'Avoid the stale closure in setInterval', excerpt: { from: 'const id = setInterval(() => setN((prev) => prev + 1), 500);', lines: 2 }, detail: 'The effect runs once per Start, so its callback is created once. Written as `setN(n + 1)` it would keep reading the `n` from that one render, compute 0 + 1 every half second, and freeze at 1. The functional form has nothing stale to read, and the cleanup stops intervals stacking up.', pitfall: 'The other fix, adding n to the dependencies, works but tears the interval down and rebuilds it every tick, which is rarely what you want.' },
  ],
  graded: [
    { point: 'You know why the functional update matters', why: 'It is correctness, not style: two updates in one handler, or any update from a timer or async callback, is wrong with the captured value. Everything else here depends on it.' },
    { point: 'useCallback and memo are described as one mechanism', why: 'Either alone does nothing. Candidates who list them as separate optimisations usually have not watched a memoised child re-render because of an inline arrow.' },
    { point: 'You can explain the setInterval stale closure', why: 'It is one of the most commonly hit React bugs, and the two available fixes have different costs. Knowing both, and which you would pick, is the senior signal.' },
    { point: 'You mention the React Compiler', why: 'It memoises automatically and makes most of this manual work unnecessary, but only for components that follow the Rules of React, and it silently skips components that do not.' },
  ],
};

const searchDebounceCancel: BuildExplanation = {
  kind: 'build',
  problem: 'Search with Debounce + Cancel',
  problemStatement:
    'Search that sends a request as the user types, without sending one per keystroke (debouncing: waiting for a pause in typing), and without letting a slow early response overwrite a fast later one (cancellation). Two separate problems that are routinely confused for one.',
  buildOrder: [
    { title: 'Debounce the value in a custom hook', excerpt: { from: 'function useDebouncedValue(value, delay = 300) {', lines: 11 }, detail: 'Every change to value starts a timer that will copy it into debounced after 300 ms. The cleanup is the debounce: before the effect runs again for the next keystroke, React runs the cleanup, which clears the pending timer. Only a pause of 300 ms lets a value through.', pitfall: 'Without the cleanup every keystroke fires after the delay, which just postpones the requests instead of reducing them.' },
    { title: 'Keep the input instant and search on the debounced copy', excerpt: { from: 'const debouncedQuery = useDebouncedValue(query, 300);', lines: 1 }, detail: 'query controls the text box and updates on every keystroke, so typing never feels delayed. Only debouncedQuery, which trails behind it, triggers a search.', pitfall: 'Debouncing the state the input reads instead makes the field lag behind the keyboard, which users read as the page being broken.' },
    { title: 'Model five states, and skip the request for an empty query', excerpt: { from: 'if (!debouncedQuery.trim()) {', lines: 5 }, detail: 'status is idle, loading, success, empty or error, and each renders something different. A blank query goes straight back to idle with no request.', pitfall: '"No results" rendered as a blank panel is a bug report waiting to happen; empty is its own state.' },
    { title: 'Cancel the in-flight request when the query changes', excerpt: { from: 'const controller = new AbortController();', lines: 4 }, detail: 'Each search gets its own AbortController, and the effect\'s cleanup (`return () => controller.abort()`) cancels it as soon as the debounced query changes or the component unmounts. Debouncing reduces how many requests you send; it does nothing about the order they come back in. Without the abort, "re" can resolve after "rea" and replace the right results with stale ones.' },
    { title: 'Store results, and ignore your own aborts', excerpt: { from: 'fakeSearch(debouncedQuery, controller.signal)', lines: 13 }, detail: 'On success the results are stored and status becomes success or empty. In the catch, an AbortError means the cleanup cancelled this request on purpose, so it returns without touching state; anything else is a real error.', pitfall: 'Treating AbortError as a failure makes the error message flash every time the user keeps typing, and fills your error metrics with cancelled requests.' },
    { title: 'Show what the results describe', excerpt: { from: 'keystrokes: {query.length} · API calls: {callCount} · debounced to “{debouncedQuery || "—"}”', lines: 1 }, detail: 'The hint shows how much has been typed, how many requests were actually sent, and which query the results on screen belong to. Between the last keystroke and the debounce firing, that query is older than what is in the box, and saying so stops the UI presenting stale results as current.', pitfall: 'The "keystrokes" figure is really the query length, so Backspace makes it go down. A true keystroke count needs its own counter.' },
    { title: 'Announce the results', excerpt: { from: '<div aria-live="polite" aria-atomic="true" style={{ marginTop: 12, minHeight: 120 }}>', lines: 1 }, detail: 'Results updating silently are invisible to a screen reader, so the whole results area is a polite live region: it is read out when it changes, after the user pauses. aria-atomic reads the region as a whole rather than just the part that changed.' },
  ],
  graded: [
    { point: 'Debouncing and cancellation are named as separate fixes', why: 'They solve request volume and result ordering respectively. Candidates who implement only debouncing still have the race, and it shows up now and then as the wrong results.' },
    { point: 'The input is not debounced, only the query', why: 'It is what keeps typing instant. Debouncing the state the text box reads makes the component feel worse than no debounce at all.' },
    { point: 'AbortError is excluded from the error path', why: 'Your own cleanup is not a failure. Without the guard, every continued keystroke flashes an error message.' },
    { point: 'The UI is honest while results are stale', why: 'Showing an old list under a new query with no indication is a small lie the user acts on. A pending indicator costs one boolean.' },
  ],
};

const modalPortalFocusTrap: BuildExplanation = {
  kind: 'build',
  problem: 'Modal (Portal + Focus Trap)',
  problemStatement:
    'The production version of a dialog: rendered through a portal (React\'s way of putting a component\'s DOM somewhere else on the page), trapping focus inside it, restoring focus on close, announcing itself correctly and locking the background scroll. Each piece exists because of a specific failure without it.',
  buildOrder: [
    { title: 'Remember what had focus, move focus in, and give it back on close', excerpt: { from: 'openerRef.current = document.activeElement;', lines: 7 }, detail: 'When the modal opens, the effect saves the element that had focus (usually the button that opened it) and focuses the panel itself, which has tabIndex={-1} so it can take focus. The cleanup runs on close or unmount and puts focus back on the saved element.', pitfall: 'Without restoring, focus falls back to the page body when the dialog closes, and the next Tab starts from the top of the page.' },
    { title: 'Close on Escape, from a listener added only while open', excerpt: { from: 'function onKeyDown(e) {', lines: 3 }, detail: 'One keydown listener on the document handles both Escape and Tab. Escape calls onClose straight away; any key other than Tab is ignored.', pitfall: 'A focus trap with no exit is worse than none. Escape must always close, or a keyboard user is stuck in the dialog.' },
    { title: 'Find the focusable elements each time Tab is pressed', excerpt: { from: 'const focusables = panelRef.current?.querySelectorAll(', lines: 3 }, detail: 'The selector matches links, enabled buttons and inputs, textareas, selects and anything with a non-negative tabindex. It runs on every Tab press rather than once, because the dialog\'s content can change while it is open.', pitfall: 'A list cached when the dialog opened can send focus to an element that no longer exists, or skip one that was added.' },
    { title: 'Trap Tab by wrapping at the ends', excerpt: { from: 'if (e.shiftKey && document.activeElement === first) {', lines: 7 }, detail: 'Shift+Tab on the first element jumps to the last, and Tab on the last jumps to the first; preventDefault stops the browser moving focus out of the dialog. In between, the browser\'s normal Tab order does the work.' },
    { title: 'Lock the background scroll, and restore what was there', excerpt: { from: 'const prev = document.body.style.overflow;', lines: 3 }, detail: 'Setting overflow: hidden on the body stops the page behind the dialog scrolling. The cleanup restores the previous value rather than an empty string, so a page that set its own overflow, or a second dialog, is left as it was.' },
    { title: 'Render through a portal into document.body', excerpt: { from: 'return createPortal(', lines: 1 }, detail: 'In the demo, the button lives inside a box with transform and overflow: hidden. A transformed ancestor becomes the reference box for position: fixed, so without a portal the backdrop would be clipped to that box. createPortal puts the DOM nodes at the end of the body while keeping them in the same place in the React tree, so context and state still flow in.', pitfall: 'Because React events bubble through the React tree, not the DOM, a click inside the portal still reaches onClick handlers on React ancestors of the Modal, which surprises people writing an outside-click handler.' },
    { title: 'Close on a backdrop click, but not on clicks inside the panel', excerpt: { from: 'onClick={(e) => e.stopPropagation()}', lines: 1 }, detail: 'The backdrop div calls onClose when clicked. A click inside the panel would bubble up to it and close the dialog too, so the panel stops propagation at its own edge.' },
    { title: 'Announce it as a modal dialog with a name', excerpt: { from: 'role="dialog"', lines: 4 }, detail: 'role="dialog" and aria-modal="true" tell assistive technology this is a dialog and that the page behind it is out of bounds. aria-labelledby points at the heading, so it is announced as "Delete project?, dialog" when focus moves in.' },
    { title: 'Know the native version: <dialog> with showModal()', excerpt: { from: 'function NativeDialog({ title, children }) {', lines: 8 }, detail: 'showModal() puts the dialog in the browser\'s top layer (above everything, so no z-index or portal is needed), makes everything behind it inert, traps focus and closes on Escape. `<form method="dialog">` closes it with no JavaScript. You still add scroll lock yourself.', pitfall: 'Know when the custom version is still justified, such as a heavily styled backdrop, enter and exit animations or nested dialogs, and say why you chose one over the other.' },
  ],
  graded: [
    { point: 'Focus is moved in and restored on close', why: 'It is the difference between a dialog and a div that looks like one. Without restoring it, the user is dropped at the top of the page every time they close something.' },
    { point: 'The trap wraps, and Escape always escapes', why: 'A trap is only acceptable because there is a guaranteed way out. Interviewers check by tabbing to the end and by pressing Escape from inside a text field.' },
    { point: 'You can say what the portal is for', why: 'Not "it renders elsewhere" but specifically: it escapes overflow and transform ancestors, while context and event bubbling still follow the React tree. That second half is what people get wrong.' },
    { point: 'You mention the native <dialog>', why: 'It solves most of this in the platform. Knowing when the custom implementation is still justified is the judgement being assessed.' },
  ],
};

const formValidation: BuildExplanation = {
  kind: 'build',
  problem: 'Form with Validation',
  problemStatement:
    'Validate required fields and formats, show errors at the right moment, and connect them to their inputs so screen readers announce them. When an error appears is what separates a pleasant form from an aggressive one.',
  buildOrder: [
    { title: 'Write one validator per field', excerpt: { from: 'const validators = {', lines: 15 }, detail: 'Each validator takes the field\'s value (and, for confirm, all the values) and returns an error message, or an empty string when the value is fine. The messages say how to fix the problem ("Use at least 8 characters"), not just that something is wrong.', pitfall: 'A "complete" email regex is a red flag. A loose check plus a confirmation email is the honest answer, because only sending one proves the address works.' },
    { title: 'Derive errors from the values; store only values and touched', excerpt: { from: 'const errors = React.useMemo(() => {', lines: 10 }, detail: 'Every render runs each validator over the current values and collects the messages, so errors can never disagree with what is typed. `touched` is a separate question: not whether a field is wrong, but whether the user has finished with it yet.', pitfall: 'Storing errors in state is how you get a form that still reports a field as invalid after the user has fixed it.' },
    { title: 'Update values on change, mark touched on blur', excerpt: { from: 'const handleChange = (key) => (e) =>', lines: 5 }, detail: '`handleChange("email")` returns an onChange handler for that field, which copies the values and overwrites one key. `handleBlur("email")` returns an onBlur handler that marks the field touched when focus leaves it.' },
    { title: 'Show an error on blur, then keep it live', excerpt: { from: 'const showError = (key) => Boolean(touched[key] && errors[key]);', lines: 1 }, detail: 'An error shows only for a touched field that currently has one. Nothing appears while someone types their first few characters, and after the first blur, because errors are recomputed on every render, the message disappears the moment they fix it.', pitfall: 'Validating only on submit is the other extreme: the user fills in eight fields and only then finds out about the second one.' },
    { title: 'Use a real label and connect the message to the input', excerpt: { from: 'aria-invalid={show || undefined}', lines: 2 }, detail: 'Each Field has a `<label htmlFor>`, so clicking the label focuses the input and a screen reader reads the label. aria-invalid marks the field as failing, and aria-describedby points at the error paragraph, so its text is read when focus lands on the field. A red border communicates neither.', pitfall: 'Point aria-describedby at the error only while it exists, as here; a reference to an id that is not on the page is at best ignored.' },
    { title: 'Announce the error when it appears', excerpt: { from: '<p id={errorId} role="alert"', lines: 1 }, detail: 'role="alert" makes a screen reader read the message as soon as it is rendered, and the ⚠ symbol means colour is not the only signal.' },
    { title: 'On a failed submit, reveal every error and focus the first', excerpt: { from: 'if (!f.isValid) {', lines: 7 }, detail: 'Submitting an invalid form marks every field touched, so all the errors appear at once, then finds the first field with an error and focuses it. The user does not have to scroll a long form hunting for what went wrong. noValidate on the form turns off the browser\'s own error bubbles so they do not compete with these.', pitfall: 'Disabling Submit until the form is valid looks tidy and is hostile: the user gets no explanation of what is missing, and a disabled button cannot even be focused to find out.' },
    { title: 'Show how many fields need attention', excerpt: { from: '{errorCount > 0 && (', lines: 4 }, detail: 'A summary at the top counts the touched fields with errors and sits in a polite live region, so a screen-reader user hears "2 fields need attention" before reaching the fields themselves.' },
    { title: 'Keep the submit button focusable while submitting', excerpt: { from: '<button type="submit" aria-disabled={f.submitting} style={{', lines: 1 }, detail: 'aria-disabled announces the button as unavailable but, unlike disabled, leaves it focusable, and the label changes to "Creating…" while the request runs.', pitfall: 'aria-disabled does not stop clicks. Without the `if (f.submitting) return;` guard at the top of onSubmit, pressing the button again during the 700 ms wait would submit twice.' },
  ],
  graded: [
    { point: 'Errors are derived, not stored', why: 'It is the same state-duplication question as everywhere else, and here the stale version is visible to the user: a field still flagged after being corrected.' },
    { point: 'Blur-then-live timing', why: 'It is the detail that makes a form feel considered. Validating on every keystroke from the first character is the most common and most irritating implementation.' },
    { point: 'aria-invalid, aria-describedby and role="alert"', why: 'Without them the error exists only as colour and position. This is the half of form work that is invisible in a screenshot and obvious with a screen reader.' },
    { point: 'Submit reveals everything and focuses the first error', why: 'It is what turns a failed submit into something actionable. A disabled submit button instead is the anti-pattern interviewers probe for.' },
  ],
};

const themeSwitcher: BuildExplanation = {
  kind: 'build',
  problem: 'Theme Switcher (dark/light)',
  problemStatement:
    'Light, dark and, the one people forget, follow the system. Persisted across reloads, applied without a flash of the wrong theme (FOUC, "flash of unstyled content"), and reacting when the operating system\'s setting changes while the page is open.',
  buildOrder: [
    { title: 'Model three states, not a boolean, and read the saved one safely', excerpt: { from: 'function readStored() {', lines: 8 }, detail: 'The stored preference is "light", "dark" or "system"; anything else, including nothing, counts as "system". "Follow the system" is a different choice from "dark" because it has to keep tracking the OS. The try/catch is there because localStorage can throw outright, for example when storage is blocked.', pitfall: 'A boolean isDark cannot represent "system", so the first visit has to pick one and the user\'s real preference, "whatever my OS says", is lost.' },
    { title: 'Read the preference and the OS setting once, on the first render', excerpt: { from: 'const [preference, setPreference] = React.useState(readStored);', lines: 4 }, detail: 'Both states use lazy initialisers (a function passed to useState), so storage and the media query are read only on the first render. `matchMedia("(prefers-color-scheme: dark)").matches` says whether the OS is currently in dark mode.' },
    { title: 'Keep tracking the OS while "system" is selected', excerpt: { from: 'const mq = window.matchMedia?.("(prefers-color-scheme: dark)");', lines: 5 }, detail: 'The effect subscribes to the media query\'s change event, so when the OS flips (at sunset, say) systemDark updates, and the cleanup unsubscribes. Without the listener the theme is only right at page load.' },
    { title: 'Resolve the preference to an actual theme', excerpt: { from: 'const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;', lines: 1 }, detail: 'resolved is what is actually shown: the OS\'s choice when the preference is "system", otherwise the preference itself. It is derived during render, never stored.', pitfall: 'Storing the resolved value instead of the preference pins a user who chose "system" to whatever the OS said that day.' },
    { title: 'Apply the theme as one attribute on the root, and save the choice', excerpt: { from: 'document.documentElement.dataset.theme = resolved;', lines: 3 }, detail: 'Setting data-theme on the html element swaps every CSS variable at once. color-scheme tells the browser to draw its own scrollbars and form controls in the matching style. The preference, not the resolved theme, is what gets saved.' },
    { title: 'Express the theme as CSS variables', excerpt: { from: ':root[data-theme="dark"] {', lines: 3 }, detail: 'Colours are defined once on :root and redefined under [data-theme="dark"], and components use the semantic names (--bg, --text) rather than raw colours. Switching theme is then a style recalculation, not a React update, so nothing re-renders.', pitfall: 'Passing a theme object through context re-renders every component that reads it on each toggle, and cannot reach into shadow DOM the way CSS variables do.' },
    { title: 'Kill the flash with a blocking inline script in the head', excerpt: { from: '//   <script>', lines: 11 }, detail: 'The effect above runs after the first paint, so on a real site a dark-mode user would see a white page first. This script, placed inline in the head of index.html, reads the same storage key and media query and sets data-theme before anything is painted, so there is no wrong frame.', pitfall: 'It must be inline and synchronous. An external, async or deferred script reintroduces exactly the delay you are trying to remove.' },
    { title: 'Share the theme through a memoised context with a strict hook', excerpt: { from: 'function useTheme() {', lines: 6 }, detail: 'The provider memoises { preference, resolved, setPreference }, so consumers only re-render when one of them changes. useTheme throws a clear error when used outside the provider, instead of returning undefined and failing somewhere confusing later.' },
    { title: 'Offer the three choices as a radio group', excerpt: { from: '<div role="radiogroup" aria-label="Colour theme"', lines: 6 }, detail: 'Exactly one of the three options is chosen, which is what a radio group means. role="radio" with aria-checked lets a screen reader say "Dark, radio button, checked", and the "resolved" label shows what "System" currently means.' },
  ],
  graded: [
    { point: 'Three states, with "system" persisted as the choice', why: 'It is the requirement candidates miss, and it is the default every OS-aware app should ship with. Storing the resolved value instead quietly breaks it.' },
    { point: 'The blocking inline script, and why it must be inline', why: 'The flash of the wrong theme is the visible bug here, and it cannot be fixed from inside React because React runs too late. Knowing that is the point of the question.' },
    { point: 'CSS variables rather than a theme object in context', why: 'One attribute change re-themes the page with no re-render. Threading a theme object through context re-renders every consumer on every toggle.' },
    { point: 'The media query is listened to, not just read', why: 'Without the listener, "follow the system" works until the system actually changes, which is the one moment it was supposed to handle.' },
  ],
};

const dynamicFields: BuildExplanation = {
  kind: 'build',
  problem: 'Form with Dynamic Fields',
  problemStatement:
    'Let the user add and remove rows in a form, validate each row independently, and keep the whole thing submittable only when every row is valid. The interesting part is not the UI — it is that the list changes shape while React is trying to track which row is which.',
  buildOrder: [
    { title: 'Make the array the form state, with a stable id per row', excerpt: { from: 'const [rows, setRows] = React.useState([', lines: 4 }, detail: 'One array is the single source of truth. Each row carries an id that is assigned once, when the row is created, so a row\'s identity comes from the data rather than from where it happens to sit in the list. Add, remove, update and validate are all operations on this one array.', pitfall: 'Using the array index as the id recreates the exact problem the id exists to solve, because every index after a removed row shifts down by one.' },
    { title: 'Add a row with a fresh id from a counter', excerpt: { from: 'const addRow = () => setRows(prev => [...prev, { id: nextId++, name: "", email: "" }]);', lines: 1 }, detail: '`nextId` is a counter declared outside the component (it starts at 3, after the two seed rows) and only ever goes up, so an id is never handed out twice, even after rows are removed. The spread builds a new array with the empty row on the end instead of pushing into the old one.', pitfall: 'Using `rows.length + 1` as the id collides after a removal: delete row 1 of 2 and the next new row gets id 2, which already exists.' },
    { title: 'Remove a row by id, never by index', excerpt: { from: 'const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));', lines: 1 }, detail: 'filter keeps every row except the one with that id, and it does not care how the list is ordered. Removing by index deletes the wrong row once the list has been sorted, or when two removals are queued before React re-renders, because the second index was captured against the old array.', pitfall: 'Mutating the array with splice and passing the same array back means React sees the same reference, decides nothing changed, and never re-renders.' },
    { title: 'Update one field without touching the others', excerpt: { from: 'const updateRow = (id, field, value) =>', lines: 2 }, detail: 'map returns a new array, and the spread creates a new object only for the row that changed; every other row keeps its old reference. `[field]` is a computed property name, so the same function updates `name` or `email` depending on the string passed in.', pitfall: 'Editing the row object in place (`row.name = value`) keeps the old reference, so a memoised row component (one wrapped in React.memo, which skips re-rendering when its props are the same reference) would never show the edit.' },
    { title: 'Write validation as a pure function of one row', excerpt: { from: 'const errorsFor = (row) => {', lines: 7 }, detail: 'errorsFor takes a row and returns an object with a message per broken field, or an empty object when the row is valid. It reads nothing but its argument, so the same row always produces the same errors.', pitfall: 'Checking the email pattern before checking for empty gives a blank field the confusing message "Enter a valid email"; the `else if` puts "required" first.' },
    { title: 'Derive errors and overall validity on every render', excerpt: { from: 'const allErrors = rows.map(errorsFor);', lines: 2 }, detail: 'Errors are recomputed from the rows each render rather than stored, so there is no second copy to keep in step after an edit or a removal. The form is valid when every row\'s error object has no keys and there is at least one row.', pitfall: 'Storing an errors array alongside the rows means removing a row has to remove its errors too, and the two drift apart the first time you forget.' },
    { title: 'Key each row by its id', excerpt: { from: '<div key={row.id} style={rowStyle}>', lines: 1 }, detail: 'React uses the key to match each item to the DOM node it rendered last time. With an id, removing the first row deletes that row\'s node and leaves the others where they are. With an index, React keeps nodes 0 and 1, deletes the last node, and feeds the second row\'s data into the first row\'s node.', pitfall: 'Remove the first row while typing in the second and an index key deletes the node you were typing in, so focus is lost. Anything the DOM holds rather than state (focus, cursor position, an uncontrolled input\'s text) ends up on the wrong row.' },
    { title: 'Label each input with its row number', excerpt: { from: 'aria-label={"Name for member " + (i + 1)}', lines: 2 }, detail: 'The rows repeat, so a screen reader hearing "Name" five times cannot tell them apart; "Name for member 2" can. aria-invalid tells assistive technology the field currently fails validation, and it is only set once the field has been touched.', pitfall: 'Leaving the placeholder as the only label fails once the user types, because the placeholder disappears and so does the only description of the field.' },
    { title: 'Mark a field touched on blur, and show its error only then', excerpt: { from: 'onBlur={() => setTouched(t => ({ ...t, [row.id + ":name"]: true }))}', lines: 5 }, detail: '`touched` is an object keyed by `"<row id>:<field>"`, so each field in each row remembers on its own whether the user has left it (blur is the event fired when focus leaves an input). The error paragraph renders only for a touched field that has an error, and role="alert" makes a screen reader announce it as soon as it appears.', pitfall: 'Showing errors from the first render greets the user with red text on a row they just added and have not typed in yet.' },
    { title: 'On submit, reveal every error and submit only if valid', excerpt: { from: 'const handleSubmit = (e) => {', lines: 8 }, detail: 'preventDefault stops the browser\'s own form submission, which would reload the page. The loop marks every field of every row as touched, so someone who submits without visiting a field still sees what is missing, and the rows are only accepted when isValid is true.', pitfall: 'Keying touched by index instead of id would make a removed row\'s "touched" flag jump onto the row that slides into its position.' },
    { title: 'Disable Remove on the last row and Submit until valid', excerpt: { from: '<button type="submit" disabled={!isValid} style={submitStyle(isValid)}>', lines: 3 }, detail: 'The Submit button is disabled while any row has an error, and its label counts the rows so the user can see what they are about to send. The Remove button uses the same idea with `disabled={rows.length === 1}`, so the form can never be emptied to zero rows.', pitfall: 'type="button" on Add and Remove matters: a button inside a form defaults to type="submit", so without it every click would try to submit the form.' },
  ],
  graded: [
    { point: 'Stable ids rather than array indices as keys', why: 'It is the single most common React list bug, and a dynamic form is where it actually bites rather than staying theoretical, because rows are removed from the middle.' },
    { point: 'Errors derived, not stored', why: 'Storing them means a second structure that must be kept in step with the rows through every add, remove and edit, and the stale version is visible to the user as a field still flagged after it was fixed.' },
    { point: 'Immutable updates with functional setState', why: 'Passing a function to setRows means each update receives the latest array, so two updates queued before a re-render do not both start from the same stale copy. Returning new objects also keeps unchanged rows referentially equal, which is what memoisation relies on.' },
    { point: 'Accessible per-row errors', why: 'Rows repeat, so a generic label like "Email" is ambiguous with a screen reader; the label has to say which member it belongs to, and role="alert" is what makes the error announced when it appears.' },
  ],
};

const multiStepForm: BuildExplanation = {
  kind: 'build',
  problem: 'Multi-Step Form (Wizard)',
  problemStatement:
    'Split a long form across steps, validate each step before advancing, and make Back preserve everything already typed. The whole design question is where the data lives, because only the current step\'s fields are on screen, and the others are unmounted (removed from the tree, along with any state they held).',
  buildOrder: [
    { title: 'Own all the data in the parent', excerpt: { from: 'const [data, setData] = React.useState({', lines: 3 }, detail: 'One object in the Wizard holds every field from every step. Each step\'s fields are only rendered while that step is current, so any state kept inside them would be destroyed the moment you press Next, which is exactly the bug users report as "it lost my answers when I went back".', pitfall: 'Keeping each step self-contained feels tidier and is the wrong call here; the parent has to own the data because the parent is the thing that stays mounted.' },
    { title: 'Write one change handler that works for any field', excerpt: { from: 'const set = (field) => (e) => setData(d => ({ ...d, [field]: e.target.value }));', lines: 1 }, detail: '`set("email")` returns a handler that copies the data object and overwrites just that field. The functional form of setData always starts from the latest data, and the spread keeps every other step\'s answers untouched.', pitfall: 'Writing `setData({ [field]: value })` without the spread replaces the whole object, wiping every field except the one being typed in.' },
    { title: 'Put validation in a table with one entry per step', excerpt: { from: 'const validators = [', lines: 15 }, detail: '`validators[0]` checks the Account step, `validators[1]` the Profile step, and the Review step has nothing to check, so it returns an empty object. Each validator returns an object of messages keyed by field; an empty object means the step is valid. Adding a step is adding an entry.', pitfall: 'A single validator for the whole form blocks step one on fields the user has not reached yet.' },
    { title: 'Check only the current step, on every render', excerpt: { from: 'const errors = validators[step](data);', lines: 2 }, detail: 'Errors are recomputed each render from the current step\'s validator and the shared data, so they always match what is typed right now. canAdvance is true when that step has no errors; it is derived, never stored.', pitfall: 'Running every step\'s validator here would make step one\'s Next depend on fields on step two, which the user has not seen yet.' },
    { title: 'Advance on Next only when the step is valid', excerpt: { from: 'const next = () => {', lines: 5 }, detail: 'If the step has errors, Next turns showErrors on and stops there. Otherwise it hides the errors and moves forward one step; Math.min stops it running past the last step.', pitfall: 'Showing errors as soon as a step appears greets the user with red text about fields they have not touched; pressing Next is the moment they asked to be told.' },
    { title: 'Let Back retreat without validating', excerpt: { from: 'const back = () => { setShowErrors(false); setStep(s => Math.max(s - 1, 0)); };', lines: 1 }, detail: 'Going backwards is not a commitment, so it is never blocked by the current step being incomplete. Otherwise a user who realises an earlier answer is wrong is trapped and cannot return to fix it. Math.max stops it going below step 0.', pitfall: 'Applying the same guard to Back as to Next is a genuine trap: the user cannot leave the step in either direction.' },
    { title: 'Render only the current step\'s fields, fed from the shared data', excerpt: { from: '{step === 0 && (', lines: 8 }, detail: 'Each step is a `step === n &&` block, so only one is mounted at a time. Every Field reads its value from `data` and writes back through `set`, and an error is passed only when showErrors is on, so a step opens clean.', pitfall: 'Leaving an input\'s value out (making it uncontrolled) means it starts empty when you come back to the step, even though the parent still has the answer.' },
    { title: 'Show a progress bar that marks the current step', excerpt: { from: '{STEPS.map((label, i) => (', lines: 5 }, detail: 'The bar lists every step with its number. aria-current="step" tells a screen reader which one the user is on; the colour change only helps sighted users.', pitfall: 'Marking the current step with colour alone leaves colour-blind and screen-reader users without any sign of where they are.' },
    { title: 'Swap Next for Submit on the last step', excerpt: { from: '<button onClick={back} disabled={step === 0} style={btn(step !== 0)}>Back</button>', lines: 5 }, detail: 'Back is disabled on the first step, where there is nowhere to go. On the Review step the Next button becomes Submit, which marks the wizard done and shows the collected data.', pitfall: 'Submitting from an earlier step skips the Review step, which exists so the user can check everything in one place before sending.' },
  ],
  graded: [
    { point: 'State lifted to the parent, not held per step', why: 'It is the question the exercise is really asking. Steps unmount on navigation, so state inside them cannot survive Back, and candidates who miss it produce a wizard that silently loses data.' },
    { point: 'Per-step validation rather than whole-form', why: 'It is what lets the user progress at all, and it keeps the rule beside the step it governs so adding a step does not mean editing a growing conditional.' },
    { point: 'Errors shown on the advance attempt', why: 'Timing is the difference between a form that guides and one that nags. It is the same judgement as waiting until a field loses focus before showing its error on a one-page form, applied to a whole step at a time.' },
    { point: 'Back is never blocked', why: 'A wizard that will not let you go back to correct an earlier answer is unusable, and it is an easy bug to ship if the same guard is copied onto both buttons.' },
  ],
};

const buttonVariants: BuildExplanation = {
  kind: 'build',
  problem: 'Button (variants + sizes)',
  problemStatement:
    'Build the Button every design system starts with: a closed set of visual variants and sizes, a loading state that is not the same thing as disabled, and enough pass-through that it can stand in for a native <button> anywhere. The CSS is the easy half; what is being graded is the prop API, and specifically what a consumer cannot get wrong by accident.',
  buildOrder: [
    {
      title: 'Close the sets before writing any styling',
      excerpt: { from: 'const VARIANTS = {', lines: 6 },
      detail:
        'A variant is a closed set (primary, secondary, ghost, danger), so it belongs in an object keyed by that set rather than an if-chain or a switch, and the same goes for sizes. Adding a variant is then one line. In a TypeScript version the map would be typed Record<Variant, CSSProperties>, which makes "added a variant and forgot to style it" a compile error rather than a silent fall-through to the default.',
      pitfall: 'An if-chain has a final else, so a typo in the variant name renders as primary and nobody notices until a designer does.',
    },
    {
      title: 'Decide what the component owns and what it passes through',
      excerpt: { from: 'function Button({', lines: 14 },
      detail:
        'Every prop the component understands is destructured by name, with defaults; everything else collects into rest and reaches the DOM node untouched. That single line is what lets the Button accept data-testid, onMouseEnter, form, aria-describedby and every other attribute you did not think of. ref is an ordinary prop in React 19, so it is destructured here too rather than needing forwardRef.',
      pitfall: 'A Button that swallows unknown props gets forked within a month, because the first person who needs an attribute you did not anticipate has no way to pass it.',
    },
    {
      title: 'Spread rest first, then the props you refuse to let a consumer break',
      excerpt: { from: '      {...rest}', lines: 1 },
      detail:
        'In JSX the last value for an attribute wins, so rest is spread before the attributes the component is responsible for: type, disabled, aria-disabled, aria-busy and the guarded onClick. onClick, type and style are already destructured by name, so they never travel in rest; the ordering protects the others, such as a stray aria-disabled or aria-busy passed by a consumer.',
      pitfall: 'The classic version of this bug is `onClick` left inside rest and spread last: it silently replaces the guard, and because a native <button disabled> blocks clicks by itself, the broken guard only shows up once someone uses as="a".',
    },
    {
      title: 'Guard the click for anything that has no disabled attribute',
      excerpt: { from: 'onClick={(e) => {', lines: 4 },
      detail:
        'When the button is inert (disabled or loading), the handler cancels the event and returns without calling the consumer\'s onClick. For a native button the disabled attribute already blocks the click; for an `<a>` this guard is the only thing that does, and preventDefault also stops the link navigating.',
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
      pitfall: 'A label that describes the icon rather than the action ("plus") is barely better than none; it should say what happens.',
    },
    {
      title: 'Merge the styles in a fixed order, and show a spinner while loading',
      excerpt: { from: 'style={{ ...base, ...v, ...style }}', lines: 4 },
      detail:
        'The shared base styles come first, then the variant\'s colours, then any style the consumer passed, so a consumer can always override. While loading, a small spinner sized from the font size sits before the label; it is aria-hidden because aria-busy already tells assistive technology the button is busy. An icon-only button uses the vertical padding on all four sides, which keeps it roughly square.',
      pitfall: 'The demo\'s Save button changes its label to "Saving" and gains a spinner, so its width jumps under the pointer. Keeping the label fixed, or reserving the spinner\'s space, avoids that.',
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

const nestedComments: BuildExplanation = {
  kind: 'build',
  problem: 'Nested Comments (recursive replies)',
  problemStatement:
    'Render a comment thread where any comment can have replies to any depth, let people reply and collapse branches, and make sure a reply in one branch does not re-render the whole thread. The data shape is the decision everything else follows from.',
  buildOrder: [
    {
      title: 'Store comments flat, keyed by id',
      excerpt: { from: 'function normalise(list) {', lines: 10 },
      detail:
        'Servers usually send a flat list where each comment names its parent. normalise turns it into byId (every comment, looked up by id, each with a childIds array) plus rootIds (the top-level comments), a shape often called "normalised". Any comment is then one lookup away, and adding a reply changes exactly two entries: the new comment and its parent.',
      pitfall: 'A nested tree (replies inside replies) looks natural, but adding a reply then means copying every object on the path from the root, and finding a comment means searching the whole tree.',
    },
    {
      title: 'Wrap the data in a small store with subscribe',
      excerpt: { from: 'function createCommentStore(list) {', lines: 12 },
      detail:
        'The store holds the normalised state and a set of listeners. getComment and getRootIds read it; subscribe adds a listener and returns the function that removes it. Keeping the thread outside React state lets each comment subscribe to just its own entry.',
    },
    {
      title: 'Add a reply by replacing only two entries',
      excerpt: { from: 'addReply(parentId, author, text) {', lines: 14 },
      detail:
        'addReply builds the new comment, then a new state where byId is copied, the reply is added, and only the parent gets a new object with the reply\'s id appended to childIds. Every other entry keeps its old reference. Then every listener is told something changed.',
    },
    {
      title: 'Let each comment subscribe to its own entry',
      excerpt: { from: 'return React.useSyncExternalStore(store.subscribe, () => store.getComment(id));', lines: 1 },
      detail:
        'useSyncExternalStore is React\'s hook for reading an outside store. Every listener runs on every change, but React compares each comment\'s snapshot with the last one and re-renders only when it is a different object, which after addReply is only the parent.',
      pitfall: 'Passing the whole byId object down as a prop hands every comment a new prop on every change, so nothing can be skipped and the full thread re-renders.',
    },
    {
      title: 'Render recursively with one memoised component',
      excerpt: { from: '<Comment key={childId} id={childId} depth={depth + 1} />', lines: 1 },
      detail:
        'A Comment renders its children as Comments, passing depth down. Memo plus a single string id prop means a comment re-renders only when its own entry in the store or its own local state changes, so posting a reply renders only the parent and the new reply.',
      pitfall: 'Name the inner function something other than Comment. In `React.memo(function Comment(...) {...})`, the name Comment inside the body means the inner function, not the memo wrapper, so the children would render unmemoised and opening a reply box would re-render the whole subtree. The template uses `function CommentItem` for this reason.',
    },
    {
      title: 'Use the comment id as the key',
      excerpt: { from: '// key = the comment\'s id, never the array index. With index keys,', lines: 3 },
      detail:
        'Each Comment holds local state: collapsed, and an open reply box with a draft. With index keys, a reply inserted above others shifts the indexes, and React hands that state to whichever comment now sits at the old position.',
    },
    {
      title: 'Reply in place, and collapse a branch',
      excerpt: { from: 'const submit = (e) => {', lines: 7 },
      detail:
        'The Reply button opens a small form under the comment; submitting it adds the reply to the store, clears the draft and closes the form. A comment with replies also gets a Hide/Show button whose aria-expanded tells a screen reader whether the branch is open.',
    },
    {
      title: 'Render the top level from rootIds',
      excerpt: { from: 'const rootIds = React.useSyncExternalStore(store.subscribe, store.getRootIds);', lines: 1 },
      detail:
        'Thread subscribes only to the list of top-level ids, which addReply never changes, so Thread itself does not re-render when someone replies.',
    },
    {
      title: 'Stop indenting at a maximum depth',
      excerpt: { from: 'const MAX_INDENT_DEPTH = 4;', lines: 1 },
      detail:
        'Past a few levels, indentation squeezes the text into a narrow column, worst of all on a phone. Replies still nest in the data; after depth 4 they just stop moving right. Reddit goes further and shows "Continue this thread", loading that branch on its own page.',
    },
  ],
  graded: [
    { point: 'You choose a normalised shape and say why', why: 'It is the decision the question is really about. Naming the cost of the nested shape (deep copies, searching the tree) shows you have maintained a thread, not just rendered one.' },
    { point: 'Only the changed branch re-renders', why: 'The question asks how you would optimise rendering. Per-comment subscriptions plus memo, and being able to prove it with a render log, is a far stronger answer than "wrap it in React.memo". The proof also catches the trap of a recursive component that refers to itself rather than to its memo wrapper.' },
    { point: 'Keys are stable ids, with the reason', why: 'The question asks about unique keys directly. The graded part is the failure: local state jumping between comments when an index shifts.' },
    { point: 'You mention the depth and size limits', why: 'Depth caps, loading replies on demand and virtualising the top level (rendering only what is on screen) show you have thought past the demo to a thread with thousands of comments.' },
  ],
};

const sidebarNavigation: BuildExplanation = {
  kind: 'build',
  problem: 'Sidebar Navigation (responsive + submenus)',
  problemStatement:
    'A sidebar that sits beside the content on desktop and becomes a drawer on mobile, with sections that open submenus, the current page highlighted, and the right submenu open when you arrive. Graded: what is CSS and what is JavaScript, and whether collapsed links stay out of the keyboard\'s way.',
  buildOrder: [
    {
      title: 'Describe the navigation as data',
      excerpt: { from: 'const NAV = [', lines: 8 },
      detail:
        'Items with a path are links; items with children are sections. The components just walk this array, so adding a page is one line, and the same data can drive a breadcrumb or a search of the menu later.',
    },
    {
      title: 'Find which section a path belongs to',
      excerpt: { from: 'function sectionFor(path) {', lines: 4 },
      detail:
        'sectionFor looks for the section whose children include the path and returns its label, or null for a top-level page. Both "open the right submenu on arrival" and "open it when you navigate" use it.',
    },
    {
      title: 'Subscribe to the screen size only where behaviour differs',
      excerpt: { from: 'function useMediaQuery(query) {', lines: 10 },
      detail:
        'Widths and hiding belong in CSS media queries. This hook exists because the mobile drawer has behaviour the desktop sidebar does not: open state, a backdrop, Escape. subscribe listens for the media query\'s change event, getSnapshot reads whether it currently matches, and useSyncExternalStore re-renders when the answer flips. The typeof checks cover environments with no matchMedia.',
      pitfall: 'The server cannot know the screen width. If the server and the first browser render produced different HTML, React would report a hydration mismatch (hydration: attaching React to server-rendered HTML), so the third argument, the server snapshot, always says "desktop" and the browser switches after mounting.',
    },
    {
      title: 'Open the current page\'s section on arrival',
      excerpt: { from: 'const [openSections, setOpenSections] = React.useState(() => new Set([sectionFor(currentPath)]));', lines: 1 },
      detail:
        'A deep link to /team/roles should show the Team submenu already open with Roles highlighted. The lazy initial state (a function passed to useState) computes that once, and the open sections are a Set so several can be open at once.',
    },
    {
      title: 'Toggle a section open or closed',
      excerpt: { from: 'const toggle = (label) =>', lines: 7 },
      detail:
        'toggle copies the Set, because React only notices a new object, then removes the label if the section was open or adds it if it was not.',
    },
    {
      title: 'Give each section header its expanded state',
      excerpt: { from: 'aria-expanded={open}', lines: 2 },
      detail:
        'The section header is a button. aria-expanded says whether its submenu is open and aria-controls points at the submenu\'s id, so a screen reader announces "Projects, collapsed, button". The arrow glyph rotates for sighted users and is aria-hidden.',
    },
    {
      title: 'Open the new section in the click handler, not an effect',
      excerpt: { from: 'const navigate = (path) => {', lines: 6 },
      detail:
        'When you navigate, the section containing the new page opens as part of the same event. An effect that watches the path would do the same thing one render later, which means a visible flicker and an extra render for no benefit.',
    },
    {
      title: 'Animate the submenu height, and hide it from Tab when closed',
      excerpt: { from: 'display: "grid", gridTemplateRows: open ? "1fr" : "0fr",', lines: 3 },
      detail:
        'height: auto cannot be animated, but a one-row grid going from 0fr to 1fr can, with no measuring, because the inner list has overflow: hidden. visibility: hidden is the half people forget: without it the collapsed links are still in the Tab order, and keyboard focus disappears into something invisible. Visibility only switches to hidden at the end of the transition, so the closing slide still shows.',
    },
    {
      title: 'Mark the active link with aria-current',
      excerpt: { from: 'aria-current={active ? "page" : undefined}', lines: 1 },
      detail:
        'Colour alone tells a screen-reader user nothing. aria-current="page" announces which link is the page you are on. The click handler calls preventDefault, so there is no full page load, and hands the path to onNavigate the way a router would. React Router\'s NavLink adds aria-current for you, which is a good reason to use NavLink over Link in navigation.',
    },
    {
      title: 'Make the sidebar a drawer on mobile, hidden from Tab when closed',
      excerpt: { from: 'position: isDesktop ? "relative" : "absolute", top: 0, bottom: 0, left: 0,', lines: 4 },
      detail:
        'On desktop the aside is part of the layout. On mobile it is positioned over the page and slid off to the left with translateX(-100%) until opened. visibility: hidden while closed keeps its off-screen links out of the Tab order, the same fix as the submenus.',
    },
    {
      title: 'Close the drawer with Escape, only while it is open',
      excerpt: { from: 'if (isDesktop || !drawerOpen) return;', lines: 4 },
      detail:
        'The keydown listener only exists while the mobile drawer is open, and the cleanup removes it when the drawer closes or the layout changes.',
    },
    {
      title: 'Close it on navigation and on a backdrop click',
      excerpt: { from: 'setDrawerOpen(false);            // on mobile, picking a page closes the drawer', lines: 1 },
      detail:
        'Picking a page closes the drawer, because on a phone the drawer covers the page the user just asked for. While it is open, a full-size button with aria-label="Close menu" sits behind it as the backdrop, so clicking outside the drawer also closes it.',
    },
    {
      title: 'Reset the drawer when the layout switches',
      excerpt: { from: '<Layout key={isDesktop ? "desktop" : "mobile"}', lines: 1 },
      detail:
        'Changing a component\'s key makes React discard it and mount a fresh one, so switching between desktop and mobile always starts with the drawer closed. The current path lives above Layout in App, so it survives the reset. The auto/desktop/mobile buttons exist because the preview pane is narrower than your window.',
    },
  ],
  graded: [
    { point: 'You split CSS and JavaScript responsibilities', why: 'The question asks about responsiveness and conditional rendering. Saying layout is CSS and only the drawer behaviour needs JavaScript, and naming the hydration risk, is the senior answer.' },
    { point: 'Collapsed and off-screen links are out of the Tab order', why: 'It is the most common accessibility bug in animated menus, and the fix is one property. Volunteering it shows you have tabbed through your own UI.' },
    { point: 'The active route drives both the highlight and the open submenu', why: 'Route linking is part of the question. Deriving both from the current path, and opening sections in the event rather than an effect, shows you understand where state belongs.' },
    { point: 'Animations respect reduced motion', why: 'prefers-reduced-motion is an operating-system setting for people who find animation uncomfortable. Turning the transitions off for them is a one-line media query, and it shows the animation was designed for everyone rather than bolted on.' },
  ],
};

const dataTable: BuildExplanation = {
  kind: 'build',
  problem: 'Data Table (sort + filter + paginate)',
  problemStatement:
    'A table with column sorting, a search box, a status filter and pagination, split into header, rows and pagination components. The question asks how you would handle large datasets and whether to filter on the client or the server; the answer is that the same state works for both.',
  buildOrder: [
    {
      title: 'Keep all table state in one reducer',
      excerpt: { from: 'function tableReducer(state, action) {', lines: 5 },
      detail:
        'Query, status, sort, page and page size change together, so they live together in one object updated by a reducer (a function that takes the current state and an action and returns the next state). Every action that changes the result set also resets page to 1 in the same update, so "filtered to 3 rows but still on page 5" cannot happen.',
      pitfall: 'Five separate useState calls invite the classic bug: someone adds a filter and forgets to reset the page in that one handler.',
    },
    {
      title: 'Cycle each column through ascending, descending and off',
      excerpt: { from: 'case "sort": {', lines: 6 },
      detail:
        'Clicking a new column starts it ascending; clicking the same one again reverses it, then clears it. Clearing matters: without an "off" state there is no way back to the original order.',
    },
    {
      title: 'Filter first, memoised on the filter inputs',
      excerpt: { from: 'const filtered = React.useMemo(() => {', lines: 7 },
      detail:
        'A row stays if its status matches (or the filter is "all") and its name or team contains the search text, ignoring case. This memo only re-runs when the rows, the query or the status change. Filtering first means the sort below has fewer rows to order.',
    },
    {
      title: 'Sort a copy of the filtered rows',
      excerpt: { from: 'const sorted = React.useMemo(() => {', lines: 9 },
      detail:
        'With no sort chosen the filtered list passes straight through. Otherwise numbers are subtracted and text is compared with localeCompare, and multiplying by -1 flips the order for descending.',
      pitfall: 'sort() changes the array it is called on. Sorting `filtered` directly would rearrange the memoised array from the previous step; the template copies it with `[...filtered]` first.',
    },
    {
      title: 'Slice out one page, clamped to the last page',
      excerpt: { from: 'const pageCount = Math.max(1, Math.ceil(sorted.length / state.pageSize));', lines: 4 },
      detail:
        'pageCount is at least 1, so an empty result still shows "Page 1 of 1". The page actually shown is clamped to pageCount, so a result that shrinks can never leave you past the end. Changing only the page or the page size re-runs this slice without filtering or sorting again.',
    },
    {
      title: 'Make the header accessible as well as clickable',
      excerpt: { from: '<th key={col.key} aria-sort=', lines: 7 },
      detail:
        'Each header holds a real button, so it is focusable and works with Enter and Space for free. aria-sort on the sorted column tells a screen reader which column is sorted and in which direction; the arrow glyph is aria-hidden because it means nothing read aloud.',
    },
    {
      title: 'Split the table into components that only get props',
      excerpt: { from: 'const TableRow = React.memo(function TableRow({ row, columns }) {', lines: 11 },
      detail:
        'TableHeader, TableRow and Pagination receive data and report events; none of them knows where the rows came from. That is what makes them reusable across tables, and what lets the same components serve a server-side table unchanged. TableRow is memoised and keyed by row id, so after a sort React moves the existing rows instead of re-rendering them.',
    },
    {
      title: 'Wire the search box and status filter to the reducer',
      excerpt: { from: 'onChange={(e) => dispatch({ type: "query", value: e.target.value })}', lines: 1 },
      detail:
        'The inputs only dispatch actions; the reducer decides what changes, including the page reset. The status select works the same way with a "status" action, and both have labels a screen reader can read.',
    },
    {
      title: 'Show an empty state, and announce the page',
      excerpt: { from: '<span aria-live="polite">Page {page} of {pageCount} ({total} rows)</span>', lines: 1 },
      detail:
        'When nothing matches, the table body shows one full-width row saying "No rows match these filters." The page summary is a polite live region, so a screen-reader user hears the new page and row count after filtering or paging. Previous and Next are disabled at the ends.',
    },
    {
      title: 'Turn the same state into a server request',
      excerpt: { from: 'function toQueryString(state) {', lines: 9 },
      detail:
        'Past a few thousand rows you stop sending everything to the browser. The state object does not change; it becomes query parameters, and the server returns one page and a total. The template prints the request it would send, so you can see the two modes are one design.',
    },
  ],
  graded: [
    { point: 'You state when to move filtering to the server', why: 'The question asks about large datasets. A threshold (roughly thousands of rows), plus the observation that the state shape stays the same, is the answer interviewers want.' },
    { point: 'Changing a filter resets the page, by construction', why: 'It is the most common data-table bug. Putting the reset inside the reducer transition shows you design state so the bug cannot happen, rather than remembering to avoid it.' },
    { point: 'The pipeline order and memoisation are deliberate', why: 'Filter before sort, memoise each stage on its own inputs, copy before sorting. Each is small, and together they show you know where the cost is.' },
    { point: 'Header, rows and pagination are modular', why: 'The question asks for it explicitly. Props-in, events-out components that do not know the data source are what "modular" actually means.' },
  ],
};

const likeButton: BuildExplanation = {
  kind: 'build',
  problem: 'Like Button (optimistic + rollback)',
  problemStatement:
    'A like button that updates the instant it is clicked (an optimistic update: showing the result before the server confirms it), rolls back if the server rejects it, and stays correct when someone clicks five times in a second. The rollback is the obvious part; rapid clicking is where most implementations quietly break.',
  buildOrder: [
    {
      title: 'Update the screen before the server answers',
      excerpt: { from: 'const toggle = () => {', lines: 7 },
      detail:
        'A click flips what the user wants and changes the heart and the count straight away. The functional update means each click builds on the previous shown value, so several fast clicks in a row still add up correctly. A request only starts if none is running; otherwise the running loop in the next steps picks the new wish up.',
    },
    {
      title: 'Keep the async bookkeeping in refs',
      excerpt: { from: 'const confirmed = React.useRef(initial);        // last state the server confirmed', lines: 3 },
      detail:
        'Three values drive the logic: what the server last confirmed, what the user wants right now, and whether a request is running. They are refs because an async loop reads them after every await, and it must see the value as it is now, not as it was in the render that started the loop.',
      pitfall: 'State captured in the closure is a snapshot. A loop reading wanted from state would compare against a value that is already out of date.',
    },
    {
      title: 'Allow only one request in flight, and catch up at the end',
      excerpt: { from: 'while (wanted.current !== confirmed.current.liked) {', lines: 4 },
      detail:
        'Clicks made while a request runs only change what the user wants. When the request returns, the loop checks whether the server state still differs from that, and sends one more if so. Five fast clicks become at most two requests, and because they run one after another, a slow old response can never overwrite a newer click.',
      pitfall: 'One request per click means responses can arrive in any order, and a failed early request can "roll back" a click the user made after it.',
    },
    {
      title: 'Send the state, not the action',
      excerpt: { from: 'confirmed.current = await api.setLiked(wanted.current);', lines: 1 },
      detail:
        'The request says "liked is now true", not "toggle". Repeating a state is harmless, which matters for retries; repeating a toggle flips it back. The server also returns its own count, which includes other people\'s likes, so the screen settles on the truth rather than on our arithmetic.',
    },
    {
      title: 'Roll back to what you KNOW is saved',
      excerpt: { from: 'wanted.current = confirmed.current.liked;   // roll back to what we KNOW is saved', lines: 3 },
      detail:
        'On failure, the button goes back to the last state the server confirmed, not to "whatever it was before this click", which may itself have been optimistic. An alert says what happened, because a like that silently un-likes itself looks like a bug.',
    },
    {
      title: 'Announce the state, not a changing label',
      excerpt: { from: 'aria-pressed={shown.liked}', lines: 1 },
      detail:
        'The accessible name stays "Like" and aria-pressed carries the state, so a screen reader says "Like, toggle button, pressed". Swapping the label between "Like" and "Unlike" makes it unclear whether the word describes the state or the action.',
    },
  ],
  graded: [
    { point: 'The UI changes before the response, and settles on the server\'s truth', why: 'That is the definition of optimistic UI, plus the detail that the final count comes from the server. Both halves are expected.' },
    { point: 'Rollback targets the last confirmed state', why: 'It shows you understand that the "previous" value might itself be optimistic, which is the subtle part of the rollback question.' },
    { point: 'Rapid clicks cannot produce the wrong final state', why: 'This is where interviewers push. Serialising requests, or at least ignoring stale responses, is what separates a demo from something you could ship.' },
    { point: 'The request is idempotent', why: 'Sending the desired state rather than "toggle" makes retries safe, and naming idempotency here shows you connect frontend state to backend behaviour.' },
  ],
};

const rateLimitedButton: BuildExplanation = {
  kind: 'build',
  problem: 'Rate-Limited Button (throttle vs lock)',
  problemStatement:
    'Stop rapid clicks from hitting the API repeatedly, and choose between debounce, throttle and a custom guard. The honest answer is that they solve different problems, and for a Submit or Pay button the right tool is usually neither debounce nor throttle.',
  buildOrder: [
    {
      title: 'Pick the tool from what the button does',
      detail:
        'Debounce waits for the clicks to stop, which is right for a search box but makes a button feel broken, because the first click does nothing visible. Throttle runs the first click and ignores later ones for a fixed time, which suits Refresh or Load more. An in-flight lock runs the first click and ignores later ones until that request finishes, which suits Submit, Pay and Save, where the goal is "exactly once" and no fixed window can promise that.',
    },
    {
      title: 'Start from the unguarded button',
      excerpt: { from: 'const onClick = () => { api.save(); bump(); };', lines: 1 },
      detail:
        'Every click calls the API; bump forces a re-render so the call counter on screen updates. Five fast clicks give five calls, which is the baseline the other two buttons are measured against. Each button gets its own fake API from a lazy useState, so their counters are independent.',
    },
    {
      title: 'Make the throttled function once, not once per render',
      excerpt: { from: 'return React.useCallback(() => {', lines: 6 },
      detail:
        'This is a leading-edge throttle: the first click runs at once, and any click within the next ms milliseconds of it is dropped. The function is created with useCallback and depends only on ms, so every render gets the same function and the same lastRun timestamp. The latest callback is copied into a ref after each render, so the throttle always calls current code without being recreated.',
      pitfall: 'Calling lodash.throttle(fn, 1000) directly in the component body makes a new throttled function on every render, each with a fresh timer, which throttles nothing at all.',
    },
    {
      title: 'Guard the lock with a ref, not with state',
      excerpt: { from: 'if (busyRef.current) return;', lines: 3 },
      detail:
        'Two clicks can arrive before React re-renders. Both would read busy state as false and both would send. The ref changes the instant it is set, so the second click sees it. The busy state still exists, but only to show "Saving…" on screen.',
      pitfall: '`if (busy) return` looks correct and passes every slow manual test. This project\'s tests for the template click twice in the same tick (before React can re-render) to prove the difference.',
    },
    {
      title: 'Release the lock in finally',
      excerpt: { from: '} finally {', lines: 3 },
      detail:
        'Whether the request succeeds or throws, the lock is released. Releasing it only after success would leave the button permanently dead after the first network error.',
    },
    {
      title: 'Show the busy state without breaking focus',
      excerpt: { from: '<button style={{ ...btn, opacity: busy ? 0.6 : 1 }} onClick={run} aria-disabled={busy} aria-busy={busy}>', lines: 1 },
      detail:
        'aria-busy tells assistive technology that the action is running, and the label changes to "Saving…". aria-disabled is used instead of disabled because a disabled button can drop keyboard focus, and the lock already ignores extra clicks.',
    },
    {
      title: 'Back it up on the server with an idempotency key',
      excerpt: { from: '// THE PART THAT IS NOT A FRONTEND PROBLEM', lines: 9 },
      detail:
        'Every guard here lives in one tab. Two tabs, a retry after a timeout or a flaky network can still send the same request twice. An idempotency key, generated once per user action and resent on every retry, lets the server recognise the repeat and return the first result.',
    },
  ],
  graded: [
    { point: 'You match the technique to the button', why: 'The question offers throttle, debounce or custom. Explaining why debounce is wrong for buttons and why a payment needs an in-flight lock shows you understand the behaviour, not just the utilities.' },
    { point: 'The lock uses a ref and explains why', why: 'Two clicks in one tick is the edge that breaks the obvious state-based guard, and knowing that React state updates are not immediate is the underlying concept being tested.' },
    { point: 'Throttled functions are stable across renders', why: 'Recreating lodash.throttle on every render is one of the most common React bugs with these utilities, and naming it earns credit on the "lodash or custom" part of the question.' },
    { point: 'The server is the real guarantee', why: 'Saying the frontend guard is for experience and the idempotency key is the guarantee shows you think about the whole system, which is what a senior answer sounds like.' },
  ],
};

const shoppingCart: BuildExplanation = {
  kind: 'build',
  problem: 'Shopping Cart (reducer + derived totals)',
  problemStatement:
    'A cart where adding a product twice increases its quantity, quantities respect stock, a discount code applies, totals are always right, the header badge and the cart page agree, and the cart survives a refresh. What is graded is what you store, and what you calculate instead.',
  buildOrder: [
    {
      title: 'Store only the product id and the quantity',
      excerpt: { from: 'return { ...state, items: [...state.items, { productId: action.productId, quantity: 1 }] };', lines: 1 },
      detail:
        'A cart line is { productId, quantity } and nothing else. The price comes from the catalogue when it is needed, so a price change shows up everywhere at once, and there is no stored total that can disagree with the items it is supposed to add up.',
      pitfall: 'Storing price and total in the cart gives you two sources of truth. The first time one is updated and the other is not, the cart shows a total that does not match its lines.',
    },
    {
      title: 'Adding a product twice increases its quantity, up to the stock',
      excerpt: { from: 'case "add": {', lines: 13 },
      detail:
        'The reducer (a function that takes the cart and an action and returns the next cart) first looks for the product. If it is already in the cart, that line\'s quantity goes up by one but never past the stock; otherwise a new line with quantity 1 is appended. Either way a new items array is returned rather than changing the old one.',
    },
    {
      title: 'Clamp every quantity change in the same place',
      excerpt: { from: 'const quantity = Math.max(1, Math.min(action.quantity, stock));   // clamp: 1 .. stock', lines: 1 },
      detail:
        'The + and − buttons both dispatch setQuantity, and the reducer clamps the result between 1 and the stock level. Because every change goes through the reducer, the "never more than stock" rule is written once, not in each button.',
      pitfall: 'Because the minimum is 1, pressing − on a quantity of 1 does nothing; only the × button removes a line. That is a product decision worth saying out loud.',
    },
    {
      title: 'Remove, apply a code, and clear as their own actions',
      excerpt: { from: 'case "remove":', lines: 6 },
      detail:
        'remove filters the line out, applyCode keeps the code only if it exists in DISCOUNT_CODES (otherwise it stores null), and clear empties the cart.',
      pitfall: 'An unknown code is silently dropped, so the user gets no message saying it was not accepted. A real cart reports that.',
    },
    {
      title: 'Derive the totals, and do the maths in cents',
      excerpt: { from: 'function computeTotals(cart) {', lines: 14 },
      detail:
        'Each line looks up its product (skipping any that no longer exist) and multiplies price by quantity. The subtotal adds the lines, the discount is a percentage of the subtotal, tax is 8% of what is left, and the total combines them. Prices are whole numbers of cents and each percentage is rounded once, so the total never drifts by a fraction of a cent; formatMoney divides by 100 only for display.',
      pitfall: 'In floating point, 0.1 + 0.2 is 0.30000000000000004. Adding prices like 19.99 as decimals produces totals that are a cent out, and a cart that is a cent out loses trust instantly.',
    },
    {
      title: 'Share one cart through context',
      excerpt: { from: 'const CartContext = React.createContext(null);', lines: 1 },
      detail:
        'The header badge and the cart page both call useCart, so they read the same state and can never disagree. The provider computes the totals with useMemo and memoises the context value, so consumers only re-render when the cart actually changes. useCart throws a clear error if someone forgets the provider, instead of failing later on a null.',
    },
    {
      title: 'Disable Add at the stock limit',
      excerpt: { from: 'const atLimit = inCart && inCart.quantity >= p.stock;', lines: 1 },
      detail:
        'The product list checks each product against the cart and swaps "Add to cart" for a disabled "Max in cart" button once the stock is reached. The reducer would refuse anyway; this just tells the user why nothing happens.',
    },
    {
      title: 'Load from storage once, and validate what you load',
      excerpt: { from: 'const [cart, dispatch] = React.useReducer(cartReducer, undefined, loadCart);   // lazy: read storage once', lines: 1 },
      detail:
        'The third argument to useReducer is a lazy initialiser, so localStorage is read once, not on every render. loadCart checks the shape of what it finds, because saved data can be from an older version of the app, or edited by hand, and a crash on load is the worst possible cart bug. An effect then saves the cart after every change, inside its own try/catch.',
      pitfall: 'localStorage can THROW (private mode, blocked site data), and here the read happens during the first render. Without the try/catch, one throw unmounts the whole app.',
    },
    {
      title: 'Treat the client total as a preview',
      excerpt: { from: '//   - Prices change while the item sits in the cart: the server recalculates', lines: 3 },
      detail:
        'The browser can be edited by anyone, so the price actually charged must be calculated by the server at checkout. The client total is there so the user knows roughly what to expect, and the UI should say so when the server total differs.',
    },
  ],
  graded: [
    { point: 'The cart stores ids and quantities, not prices or totals', why: 'It is the single decision that makes the rest correct. Explaining why a stored total is a bug waiting to happen shows you think in terms of a single source of truth.' },
    { point: 'Money is handled in integer cents', why: 'Interviewers ask about floating point here on purpose. Knowing that 0.1 + 0.2 is not 0.3, and designing around it, is an expected senior detail.' },
    { point: 'All rules live in one reducer', why: 'Stock limits, merging duplicate adds and removal become testable pure functions, and no button can bypass them. This is also why the same reducer moves to Redux unchanged.' },
    { point: 'Persistence is safe and the server is the authority', why: 'Validated, try/catch-wrapped storage, plus the merge-at-login and recalculate-at-checkout follow-ups, show you have thought past the demo to a real store.' },
  ],
};

const fileUpload: BuildExplanation = {
  kind: 'build',
  problem: 'File Upload (progress + cancel)',
  problemStatement:
    'Upload one or more files with a progress percentage for each, validate them first, and support cancel and retry. The template\'s notes mention Spring Boot (a Java web framework) as the server. The question behind it is usually "how do you show upload progress?", and the answer starts with why fetch cannot.',
  buildOrder: [
    {
      title: 'Use XMLHttpRequest, because fetch has no upload progress',
      excerpt: { from: 'xhr.upload.onprogress = (event) => {', lines: 3 },
      detail:
        'xhr.upload fires progress events as the request body is sent, with loaded and total in bytes, and the handler turns them into a whole percentage. lengthComputable says whether the total is known. fetch can report download progress by reading the response stream, but it has no upload progress event, which is why axios uses XHR in the browser for onUploadProgress. The playground has no server, so a FakeXHR with the same surface reports progress in five steps.',
      pitfall: '100% means the bytes were sent, not that the server has finished with them. Show "Processing…" until the response arrives.',
    },
    {
      title: 'Turn the response into success or a readable error',
      excerpt: { from: 'xhr.onload = () => (xhr.status >= 200 && xhr.status < 300', lines: 5 },
      detail:
        'Unlike fetch\'s promise, XHR reports through callbacks, so they are wired to the promise: any 2xx status resolves, anything else rejects with a message. 413 (Payload Too Large, what a server sends when the file exceeds its limit) gets its own wording. A network failure and a cancellation reject too, the cancellation as an AbortError.',
    },
    {
      title: 'Send the file as multipart form data',
      excerpt: { from: 'form.append("file", file);                 // the field name Spring\'s @RequestParam expects', lines: 1 },
      detail:
        'FormData is what a Spring Boot controller reads with @RequestParam("file") MultipartFile, and the field name must match. The browser sets the Content-Type header itself, including the boundary string that separates the parts.',
      pitfall: 'Setting Content-Type: multipart/form-data by hand drops the boundary, and the server cannot find the file in the request.',
    },
    {
      title: 'Wrap it in a promise, and cancel it like fetch',
      excerpt: { from: 'signal.addEventListener("abort", () => xhr.abort());', lines: 1 },
      detail:
        'uploadFile takes an AbortSignal, exactly as fetch does, and aborting it calls xhr.abort(). Other code in the app therefore cancels uploads and ordinary requests the same way. A cancelled upload rejects with an AbortError, which the UI shows as "cancelled", not as a failure.',
    },
    {
      title: 'Validate before sending anything',
      excerpt: { from: 'function validate(file) {', lines: 5 },
      detail:
        'Checking type and size first means the user finds out instantly, instead of after waiting for a 20 MB upload to be rejected. The limit matches the server\'s, and Spring Boot\'s defaults are low (1 MB per file), so agree on it with the backend.',
      pitfall: 'Client-side checks are for the user\'s convenience only. Anyone can bypass them, so the server must validate type, size and contents again.',
    },
    {
      title: 'Keep one row of state per file',
      excerpt: { from: 'const update = (id, patch) =>', lines: 2 },
      detail:
        'Each file has its own id, status (queued, uploading, done, failed, cancelled, rejected), progress and error, so several uploads run independently. update merges a change into one file\'s row by id. The AbortControllers live in a ref keyed by id, because they are not something the UI renders.',
    },
    {
      title: 'Add files: validate each one, then start the valid ones',
      excerpt: { from: 'const addFiles = (files) => {', lines: 11 },
      detail:
        'Every chosen file gets a row. A file that fails validation is marked "rejected" with its message and never sent; the valid ones start uploading straight away. The file input\'s value is reset after each choice, so picking the same file again still fires onChange.',
    },
    {
      title: 'Start an upload with its own controller, and settle its row',
      excerpt: { from: 'const start = (id, file) => {', lines: 14 },
      detail:
        'start creates an AbortController for this file, marks the row uploading, and passes progress updates into the row. When the promise settles the row becomes done, cancelled (for an AbortError) or failed with the message, and the controller is removed. Retry simply calls start again for the same row.',
    },
    {
      title: 'Cancel one upload, or all of them on unmount',
      excerpt: { from: 'const map = controllers.current;', lines: 2 },
      detail:
        'Cancel looks up the file\'s controller and aborts it. The effect\'s cleanup aborts every upload still running when the component unmounts, so leaving the page does not leave requests going in the background.',
    },
    {
      title: 'Expose progress to assistive technology',
      excerpt: { from: 'role="progressbar"', lines: 5 },
      detail:
        'role="progressbar" with aria-valuenow, min and max lets a screen reader report "Uploading photo.png, 60 percent". A coloured bar with no role is invisible to anyone who cannot see it.',
    },
  ],
  graded: [
    { point: 'You know fetch cannot report upload progress', why: 'It is the fact the question hinges on. Naming xhr.upload.onprogress, and that this is what axios uses under the hood, answers it directly.' },
    { point: 'Uploads can be cancelled and retried', why: 'Using the AbortController pattern shows consistency with the rest of the data layer, and treating cancellation as its own outcome avoids a false error message.' },
    { point: 'Validation happens first and again on the server', why: 'Instant feedback for the user plus the statement that the server is the real check is the balanced answer interviewers look for.' },
    { point: 'You mention the backend limits and large-file strategies', why: 'Spring Boot\'s 1 MB default, 413 handling, chunked uploads and pre-signed URLs show you have shipped uploads against a real server, not just a demo.' },
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
  'Nested Comments (recursive replies)': nestedComments,
  'Sidebar Navigation (responsive + submenus)': sidebarNavigation,
  'Data Table (sort + filter + paginate)': dataTable,
  'Like Button (optimistic + rollback)': likeButton,
  'Rate-Limited Button (throttle vs lock)': rateLimitedButton,
  'Shopping Cart (reducer + derived totals)': shoppingCart,
  'File Upload (progress + cancel)': fileUpload,
};

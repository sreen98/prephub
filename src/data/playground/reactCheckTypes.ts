// The script format for React challenge behaviour checks. Lives in data/ so the
// check data can be typed without data/ importing upward; the runner is
// src/lib/reactChecks.ts.

/** How to find an element. Every given field must match. Text matches are case-insensitive substrings. */
export interface Target {
  role?: string;
  /** Accessible name: aria-label, aria-labelledby, <label>, alt, then text content. */
  name?: string;
  text?: string;
  label?: string;
  placeholder?: string;
  /** Last resort, for things with no role or name (a canvas, a drop zone). */
  selector?: string;
  /** Which match, when several do (0-based, default 0). */
  nth?: number;
  /** Also match elements that are hidden (display:none, hidden, aria-hidden). */
  includeHidden?: boolean;
}

export type CheckStep =
  | { click: Target }
  | { fill: Target; text: string }
  | { typeKeys: string }
  | { press: string; on?: Target }
  | { hover: Target }
  | { unhover: Target }
  | { focus: Target }
  | { wait: number }
  /** Move focus away (fires blur/focusout), e.g. to trigger validate-on-blur. */
  | { blur: Target }
  /** Paste text into the target (or the focused element), as a clipboard paste event. */
  | { paste: string; into?: Target }
  /** HTML5 drag and drop: dragstart on `drag`, dragenter/dragover/drop on `to`, then dragend. */
  | { drag: Target; to: Target }
  /** Scroll the target into view (fires IntersectionObserver in a browser): infinite scroll, lazy images. */
  | { scrollTo: Target }
  | { expectText: string }
  | { expectNoText: string }
  | {
      expect: Target;
      count?: number;
      attr?: string;
      equals?: string | null;
      value?: string;
      focused?: boolean;
      checked?: boolean;
      disabled?: boolean;
      visible?: boolean;
    };

/** A canned network response, so a check can test loading / error / success without the real network. */
export interface FetchMock {
  status?: number;
  body?: unknown;
  /** How long the response takes, so the loading state is observable. */
  delayMs?: number;
}

export interface ReactCheck {
  /** What the reader should see working ("Next moves to the second slide"). */
  label: string;
  /**
   * Replace `fetch` for this check only, installed BEFORE the component mounts
   * (most components fetch on mount). An array answers successive calls in
   * order, the last one repeating: `[{ status: 500 }, { body: [...] }]` tests Retry.
   */
  fetch?: FetchMock | FetchMock[];
  steps: CheckStep[];
}


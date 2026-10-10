/**
 * Guides that were split into a series (React in v1.7.14; JavaScript and TypeScript in v1.7.15).
 * Everything here exists so that nothing a user saved before a split is lost; see
 * src/lib/guideSplitMigration.ts. GENERATED from the original single-file guides by
 * scripts/dev/gen-guide-splits.cjs. Renaming a heading in a moved section means updating its
 * entry in `movedAnchors`; guideSplitMigration.test.ts pins every entry to the files.
 */

export interface GuideSplit {
  /** Guide name and route before the split. Question ids were `<oldName>-qN`. */
  oldName: string;
  oldRoute: string;
  /**
   * How many Interview Q&A questions the deployed single guide had. Its Tricky questions
   * restarted at Q1, so a Tricky Qn got the dedupe suffix (`-qN-2`) only when n <= qaMax;
   * a Tricky question numbered above qaMax kept the plain `-qN` id.
   */
  qaMax: number;
  qa: { name: string; route: string };
  tricky: { name: string; route: string };
  /** Guide name for each route a section moved to. */
  routeNames: Readonly<Record<string, string>>;
  /** Heading anchor -> the route that now owns it. */
  movedAnchors: Readonly<Record<string, string>>;
}

export const GUIDE_SPLITS: readonly GuideSplit[] = [
  {
    oldName: 'React Guide',
    oldRoute: '/frontend/react',
    qaMax: 86,
    qa: { name: 'React Interview Questions', route: '/frontend/react-interview-questions' },
    tricky: { name: 'React Tricky Questions', route: '/frontend/react-tricky-questions' },
    routeNames: {
      '/frontend/react-performance': 'React Performance & Internals',
      '/frontend/react-19-patterns': 'React 19 & Patterns',
      '/frontend/react-interview-questions': 'React Interview Questions',
      '/frontend/react-tricky-questions': 'React Tricky Questions',
    },
    movedAnchors: {
      '13-performance-optimization': '/frontend/react-performance',
      '131-reactmemo': '/frontend/react-performance',
      '1310-bundle-analyzers': '/frontend/react-performance',
      '1311-tree-shaking-and-code-splitting-at-build-time': '/frontend/react-performance',
      '1312-server-components-ssr-and-streaming': '/frontend/react-performance',
      '1313-performance-rules': '/frontend/react-performance',
      '132-usememo-and-usecallback': '/frontend/react-performance',
      '133-code-splitting-lazy-loading': '/frontend/react-performance',
      '134-virtualization-large-lists': '/frontend/react-performance',
      '135-concurrent-features-usetransition-usedeferredvalue': '/frontend/react-performance',
      '136-profiling-and-measuring-performance': '/frontend/react-performance',
      '137-common-re-render-causes-and-fixes': '/frontend/react-performance',
      '138-image-and-asset-optimization': '/frontend/react-performance',
      '139-build-tools-webpack-vs-vite': '/frontend/react-performance',
      '14-reconciliation-and-fiber': '/frontend/react-performance',
      '141-the-render-reconcile-commit-pipeline': '/frontend/react-performance',
      '142-the-diffing-algorithm-three-rules': '/frontend/react-performance',
      '143-type-matching-when-components-survive-props-changes-vs-get-destroyed': '/frontend/react-performance',
      '144-why-list-keys-matter-at-the-algorithm-level': '/frontend/react-performance',
      '145-fiber-the-data-structure-that-makes-interruption-possible': '/frontend/react-performance',
      '146-the-work-loop-how-react-actually-traverses': '/frontend/react-performance',
      '147-practical-implications': '/frontend/react-performance',
      '15-patterns-and-best-practices': '/frontend/react-19-patterns',
      '151-compound-components': '/frontend/react-19-patterns',
      '1510-internationalisation-i18n': '/frontend/react-19-patterns',
      '1511-events-delegation-and-the-synthetic-system': '/frontend/react-19-patterns',
      '1512-cicd-lint-type-check-and-test-on-every-pull-request': '/frontend/react-19-patterns',
      '152-render-props': '/frontend/react-19-patterns',
      '153-custom-hook-pattern-preferred-over-render-props': '/frontend/react-19-patterns',
      '154-higher-order-components-hocs': '/frontend/react-19-patterns',
      '155-presentational-vs-container-components': '/frontend/react-19-patterns',
      '156-flux-and-one-way-data-flow': '/frontend/react-19-patterns',
      '157-portals': '/frontend/react-19-patterns',
      '158-fragments-and-node-vs-element-vs-component': '/frontend/react-19-patterns',
      '159-strictmode': '/frontend/react-19-patterns',
      '16-react-19-features': '/frontend/react-19-patterns',
      '161-react-compiler-stable-since-10': '/frontend/react-19-patterns',
      '1610-where-react-actually-is-versions-and-experimental-status': '/frontend/react-19-patterns',
      '1611-react-193-whats-new-september-2026': '/frontend/react-19-patterns',
      '162-actions-and-useactionstate': '/frontend/react-19-patterns',
      '163-useformstatus': '/frontend/react-19-patterns',
      '164-use-hook': '/frontend/react-19-patterns',
      '165-useoptimistic': '/frontend/react-19-patterns',
      '166-activity-hide-ui-without-destroying-it': '/frontend/react-19-patterns',
      '167-useeffectevent-non-reactive-logic-inside-effects': '/frontend/react-19-patterns',
      '168-react-192s-rendering-and-ssr-changes': '/frontend/react-19-patterns',
      '169-what-react-19-changed-removals-migrations-and-behaviour': '/frontend/react-19-patterns',
      '17-interview-questions-answers': '/frontend/react-interview-questions',
      '18-tricky-output-questions': '/frontend/react-tricky-questions',
      'advanced': '/frontend/react-interview-questions',
      'beginner': '/frontend/react-interview-questions',
      'behavioural-improvements': '/frontend/react-19-patterns',
      'browser-client-only-components-without-hydration-errors': '/frontend/react-19-patterns',
      'closures-refs': '/frontend/react-tricky-questions',
      'code-splitting-the-theory': '/frontend/react-performance',
      'delivery-and-scale': '/frontend/react-interview-questions',
      'deprecated-by-replacement': '/frontend/react-19-patterns',
      'fixing-it-in-the-order-you-should-try': '/frontend/react-interview-questions',
      'fragment-refs-reach-a-group-of-elements-without-a-wrapper': '/frontend/react-19-patterns',
      'hooks-rules-gotchas': '/frontend/react-tricky-questions',
      'intermediate': '/frontend/react-interview-questions',
      'key-rules': '/frontend/react-tricky-questions',
      'no-lifecycle-methods-were-removed': '/frontend/react-19-patterns',
      'performance-pitfalls': '/frontend/react-tricky-questions',
      'performance-tooling': '/frontend/react-interview-questions',
      'rapid-fire-fundamentals': '/frontend/react-interview-questions',
      'react-192-apis': '/frontend/react-tricky-questions',
      'real-world-api-data-scenarios': '/frontend/react-interview-questions',
      'ref-cleanup-functions': '/frontend/react-19-patterns',
      'removed': '/frontend/react-19-patterns',
      'rendering-patterns-and-everyday-pitfalls': '/frontend/react-interview-questions',
      'rendering-reconciliation': '/frontend/react-tricky-questions',
      'smaller-changes-worth-knowing': '/frontend/react-19-patterns',
      'state-batching': '/frontend/react-tricky-questions',
      'the-fix-that-is-not-a-fix': '/frontend/react-interview-questions',
      'the-four-places-it-breaks-down': '/frontend/react-interview-questions',
      'tree-shaking-the-theory': '/frontend/react-performance',
      'trusted-types': '/frontend/react-19-patterns',
      'upgrade-order-that-works': '/frontend/react-19-patterns',
      'useeffect-lifecycle': '/frontend/react-tricky-questions',
      'viewtransition-animate-ui-changes': '/frontend/react-19-patterns',
    },
  },
  {
    oldName: 'JavaScript Guide',
    oldRoute: '/javascript/guide',
    qaMax: 45,
    qa: { name: 'JavaScript Interview Questions', route: '/javascript/interview-questions' },
    tricky: { name: 'JavaScript Tricky Questions', route: '/javascript/tricky-questions' },
    routeNames: {
      '/javascript/interview-questions': 'JavaScript Interview Questions',
      '/javascript/tricky-questions': 'JavaScript Tricky Questions',
    },
    movedAnchors: {
      '15-interview-questions-answers': '/javascript/interview-questions',
      '16-tricky-output-questions': '/javascript/tricky-questions',
      'about-the-language-itself': '/javascript/interview-questions',
      'advanced': '/javascript/interview-questions',
      'async-event-loop-advanced': '/javascript/tricky-questions',
      'async-performance': '/javascript/tricky-questions',
      'beginner': '/javascript/interview-questions',
      'equality-numbers-arrays': '/javascript/tricky-questions',
      'functions-classes-control-flow': '/javascript/tricky-questions',
      'how-javascript-works-under-the-hood': '/javascript/interview-questions',
      'intermediate': '/javascript/interview-questions',
      'key-rules': '/javascript/tricky-questions',
      'modern-javascript-es2022es2026': '/javascript/tricky-questions',
      'numbers-types-coercion': '/javascript/tricky-questions',
      'objects-references-deep-dive': '/javascript/tricky-questions',
      'operators-names': '/javascript/tricky-questions',
      'promises-generators': '/javascript/tricky-questions',
      'reference-equality': '/javascript/tricky-questions',
      'scope-hoisting-closures': '/javascript/tricky-questions',
      'shared-state-across-the-event-loop': '/javascript/tricky-questions',
      'syntax-gotchas': '/javascript/tricky-questions',
      'this': '/javascript/tricky-questions',
      'type-coercion-comparisons': '/javascript/tricky-questions',
      'where-each-one-is-the-right-answer': '/javascript/interview-questions',
    },
  },
  {
    oldName: 'TypeScript Guide',
    oldRoute: '/javascript/typescript',
    qaMax: 29,
    qa: { name: 'TypeScript Interview Questions', route: '/javascript/typescript-interview-questions' },
    tricky: { name: 'TypeScript Tricky Questions', route: '/javascript/typescript-tricky-questions' },
    routeNames: {
      '/javascript/typescript-interview-questions': 'TypeScript Interview Questions',
      '/javascript/typescript-tricky-questions': 'TypeScript Tricky Questions',
    },
    movedAnchors: {
      '15-interview-questions-answers': '/javascript/typescript-interview-questions',
      '16-tricky-output-questions': '/javascript/typescript-tricky-questions',
      'advanced': '/javascript/typescript-interview-questions',
      'beginner': '/javascript/typescript-interview-questions',
      'generics-utility-types': '/javascript/typescript-tricky-questions',
      'intermediate': '/javascript/typescript-interview-questions',
      'key-rules': '/javascript/typescript-tricky-questions',
      'modern-typescript-5x70': '/javascript/typescript-tricky-questions',
      'structural-typing-compatibility': '/javascript/typescript-tricky-questions',
      'tricky-edges': '/javascript/typescript-tricky-questions',
      'type-inference-widening': '/javascript/typescript-tricky-questions',
      'type-narrowing': '/javascript/typescript-tricky-questions',
      'types-that-behave-differently-than-they-look': '/javascript/typescript-tricky-questions',
      'types-vs-runtime': '/javascript/typescript-tricky-questions',
    },
  },
];

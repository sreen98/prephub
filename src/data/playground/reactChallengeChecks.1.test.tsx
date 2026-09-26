// @vitest-environment jsdom
// One quarter of the React behaviour checks (see reactChallengeChecks.harness.tsx).
import { installJsdomStubs, registerShard } from './reactChallengeChecks.harness';

installJsdomStubs();
registerShard(0, 4);

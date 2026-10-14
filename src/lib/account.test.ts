import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { describeSignInError } from './account';

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${e.name}`;
    if (e.isDirectory()) sourceFiles(full, out);
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

describe('Firebase stays off the first-paint path', () => {
  it('no file imports firebase statically (only `import type` and `import()` are allowed)', () => {
    const staticImport = /^\s*(?:import|export)\s+(?!type\b)[^;]*?\bfrom\s+['"](?:firebase|@firebase)\//m;
    const offenders = sourceFiles('src').filter((f) => staticImport.test(readFileSync(f, 'utf8')));
    expect(offenders, 'load Firebase with import() in lib/account.ts, so guests never download it').toEqual([]);
  });
});

describe('the production feature flag', () => {
  // Sign-in is switched on and off in production by the repository variable
  // ACCOUNTS, with no code change; losing either line silently removes the switch.
  const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8').replace(/\r\n/g, '\n');

  it('the deploy build reads VITE_ACCOUNTS from the ACCOUNTS repository variable', () => {
    expect(workflow).toMatch(/run: npm run build\n\s+env:\n\s+VITE_ACCOUNTS: \$\{\{ vars\.ACCOUNTS \}\}/);
  });

  it('the deploy can be re-run by hand after flipping the variable', () => {
    expect(workflow).toMatch(/\n\s+workflow_dispatch:/);
  });
});

describe('describeSignInError', () => {
  it('says nothing when the reader closed the Google window themselves', () => {
    expect(describeSignInError({ code: 'auth/popup-closed-by-user' })).toBeNull();
    expect(describeSignInError({ code: 'auth/cancelled-popup-request' })).toBeNull();
  });

  it('explains a blocked pop-up and a lost connection', () => {
    expect(describeSignInError({ code: 'auth/popup-blocked' })).toMatch(/pop-ups/);
    expect(describeSignInError({ code: 'auth/network-request-failed' })).toMatch(/connection/);
  });

  it('treats an error with no Firebase code as the SDK failing to download', () => {
    expect(describeSignInError(new TypeError('Failed to fetch dynamically imported module'))).toMatch(/couldn't load/);
  });

  it('falls back to a generic message for anything else', () => {
    expect(describeSignInError({ code: 'auth/internal-error' })).toBe('Sign-in failed. Please try again.');
  });
});

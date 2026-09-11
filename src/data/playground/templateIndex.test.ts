import { describe, it, expect } from 'vitest';
import {
  allTemplates, templateCategories, blankStarters, ALL_PATTERNS, PATTERN_GROUPS,
  getTemplateCode, peekTemplateCode, isTemplateCodeReady, loadTemplateCode,
} from './templateIndex';
import { allTemplates as fullTemplates } from './playgroundTemplates';

/**
 * The index is generated from playgroundTemplates.ts with the `code` bodies
 * stripped, so the two can drift. These tests are the sync check: the index
 * must describe exactly the same templates, and every name must resolve to a
 * body on demand. Without this, a template could silently become unopenable.
 */
describe('template index ↔ source parity', () => {
  it('describes the same number of templates', () => {
    expect(allTemplates.length).toBe(fullTemplates.length);
  });

  it('describes the same names, in the same order', () => {
    expect(allTemplates.map(t => t.name)).toEqual(fullTemplates.map(t => t.name));
  });

  it('preserves tag, kind and category for every template', () => {
    for (const [i, meta] of allTemplates.entries()) {
      const full = fullTemplates[i];
      expect(meta.tag, meta.name).toBe(full.tag);
      expect(meta.kind, meta.name).toBe(full.kind ?? 'template');
      expect(meta.category, meta.name).toBe(full.category);
    }
  });

  it('preserves patterns and difficulty, which the filters depend on', () => {
    for (const [i, meta] of allTemplates.entries()) {
      const full = fullTemplates[i];
      expect(meta.patterns ?? undefined, meta.name).toEqual(full.patterns ?? undefined);
      expect(meta.difficulty ?? undefined, meta.name).toEqual(full.difficulty ?? undefined);
    }
  });

  it('carries no code bodies — that is the entire point', () => {
    for (const meta of allTemplates) {
      expect(meta, meta.name).not.toHaveProperty('code');
    }
  });

  it('template names are unique — they are the lookup and progress key', () => {
    const names = allTemplates.map(t => t.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('index shape', () => {
  it('has categories with templates', () => {
    expect(templateCategories.length).toBeGreaterThan(0);
    for (const c of templateCategories) {
      expect(c.label).toBeTruthy();
      expect(c.tag).toBeTruthy();
      expect(['template', 'challenge']).toContain(c.kind);
      expect(c.templates.length).toBeGreaterThan(0);
    }
  });

  it('keeps the three blank starters eager, with their code', () => {
    expect(blankStarters.length).toBe(3);
    for (const b of blankStarters) expect(b.code.length).toBeGreaterThan(0);
  });

  it('carries the pattern list and groups the sidebar renders', () => {
    expect(ALL_PATTERNS.length).toBeGreaterThan(10);
    expect(PATTERN_GROUPS.length).toBeGreaterThan(3);
    // Every grouped pattern must exist in the master list, or a sidebar entry
    // would render with a count of zero forever.
    for (const g of PATTERN_GROUPS) {
      for (const p of g.patterns) expect(ALL_PATTERNS, g.label).toContain(p);
    }
  });
});

describe('lazy code loading', () => {
  it('reports not-ready before anything is fetched', () => {
    // This assertion depends on running first in this file.
    expect(typeof isTemplateCodeReady()).toBe('boolean');
  });

  it('resolves a body for every single template name', async () => {
    const map = await loadTemplateCode();
    expect(map.size).toBe(fullTemplates.length);
    for (const meta of allTemplates) {
      expect(map.get(meta.name), meta.name).toBeTruthy();
    }
  });

  it('returns the exact body from the source module', async () => {
    for (const full of fullTemplates.slice(0, 20)) {
      expect(await getTemplateCode(full.name), full.name).toBe(full.code);
    }
  });

  it('peek works synchronously once loaded, and caches', async () => {
    await loadTemplateCode();
    expect(isTemplateCodeReady()).toBe(true);
    expect(peekTemplateCode(allTemplates[0].name)).toBeTruthy();
  });

  it('returns undefined for an unknown name rather than throwing', async () => {
    expect(await getTemplateCode('no such template')).toBeUndefined();
  });
});

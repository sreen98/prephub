import { describe, it, expect } from 'vitest';
import { canRunInPlayground, importedPackages } from './tryItEligibility';

describe('canRunInPlayground — which guide blocks get a Try it button', () => {
  it('keeps plain JavaScript and React', () => {
    expect(canRunInPlayground('console.log(1 + 1);')).toBe(true);
    expect(canRunInPlayground("import { useState } from 'react';\nfunction A() { return <p/>; }")).toBe(true);
    expect(canRunInPlayground("import { createPortal } from 'react-dom';")).toBe(true);
    expect(canRunInPlayground("import { createRoot } from 'react-dom/client';")).toBe(true);
  });

  it('ignores imports that need nothing at runtime', () => {
    expect(canRunInPlayground("import type { FC } from 'some-lib';\nconst A = 1;")).toBe(true);
    expect(canRunInPlayground("import './styles.css';\nconst A = 1;")).toBe(true);
  });

  it('drops blocks that need another package or another file', () => {
    expect(canRunInPlayground("import { useQuery } from '@tanstack/react-query';")).toBe(false);
    expect(canRunInPlayground("import { Link } from 'react-router-dom';")).toBe(false);
    expect(canRunInPlayground("import { redirect } from 'next/navigation';")).toBe(false);
    expect(canRunInPlayground("import Button from './Button';")).toBe(false);
    expect(canRunInPlayground("const express = require('express');")).toBe(false);
  });

  it('drops React Native, even without an import line', () => {
    expect(canRunInPlayground('function A() { return <View><Text>hi</Text></View>; }')).toBe(false);
    expect(canRunInPlayground('const styles = StyleSheet.create({});')).toBe(false);
  });

  it('drops async Server Components', () => {
    expect(canRunInPlayground('export default async function Page() { return <main/>; }')).toBe(false);
    expect(canRunInPlayground('async function ProductGrid() { return <ul/>; }')).toBe(false);
    expect(canRunInPlayground("'use server';\nexport async function save() {}")).toBe(false);
    // an async HELPER is fine: only a capitalised async function is a component
    expect(canRunInPlayground('async function load() { return 1; }')).toBe(true);
  });

  it('lists runtime imports in order', () => {
    expect(importedPackages("import a from 'x';\nimport type { B } from 'y';\nimport 'z';\nimport './a.css';"))
      .toEqual(['x', 'z']);
  });
});

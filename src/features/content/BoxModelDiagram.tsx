import type { ReactNode } from 'react';
import type { BoxModel, Sides } from '../../lib/liveCss';

// The DevTools-style box-model diagram under a live CSS demo: margin, border, padding
// and content as nested boxes, each labelled with its four measured sides. The fills
// are light in both themes, so the text on them is always dark.

const LAYERS = [
  { key: 'margin', label: 'margin', fill: '#f9cc9d' },
  { key: 'border', label: 'border', fill: '#fddd9b' },
  { key: 'padding', label: 'padding', fill: '#c3d08b' },
] as const;

const fmt = (n: number) => (n === 0 ? '–' : String(n));

function Layer({ name, fill, sides, children }: { name: string; fill: string; sides: Sides; children: ReactNode }) {
  return (
    <div className="relative px-6 py-5 sm:px-8" style={{ background: fill }}>
      <span className="absolute left-1.5 top-0.5 text-[10px] uppercase tracking-wide">{name}</span>
      <span className="absolute inset-x-0 top-0.5 text-center">{fmt(sides.top)}</span>
      <span className="absolute inset-x-0 bottom-0.5 text-center">{fmt(sides.bottom)}</span>
      <span className="absolute left-1 top-1/2 -translate-y-1/2">{fmt(sides.left)}</span>
      <span className="absolute right-1 top-1/2 -translate-y-1/2">{fmt(sides.right)}</span>
      {children}
    </div>
  );
}

export default function BoxModelDiagram({ box }: { box: BoxModel }) {
  const content = (
    <div className="px-3 py-2 text-center" style={{ background: '#8cb6c0' }}>
      {box.contentWidth} × {box.contentHeight}
    </div>
  );
  const diagram = LAYERS.reduceRight<ReactNode>(
    (inner, layer) => <Layer key={layer.key} name={layer.label} fill={layer.fill} sides={box[layer.key]}>{inner}</Layer>,
    content,
  );
  return (
    <div className="mt-2 inline-block max-w-full font-mono text-xs" style={{ color: "#0f172a" }} aria-label={
      `Box model: margin ${sideText(box.margin)}, border ${sideText(box.border)}, padding ${sideText(box.padding)}, content ${box.contentWidth} by ${box.contentHeight}`
    } role="img">
      {diagram}
    </div>
  );
}

function sideText(s: Sides): string {
  return `${s.top} ${s.right} ${s.bottom} ${s.left}`;
}

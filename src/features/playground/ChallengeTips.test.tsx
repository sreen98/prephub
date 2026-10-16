import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import TipsButton, { TipsDialog } from './ChallengeTips';
import { playgroundBuildExplanations } from '../../data/playground/playgroundBuildExplanations';

describe('Tips dialog', () => {
  it('shows the graded points, then every tip section', () => {
    const ex = playgroundBuildExplanations['Tabs'];
    const html = renderToStaticMarkup(<TipsDialog tips={ex} onClose={() => {}} />);
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-labelledby="tips-title"');
    for (const g of ex.graded) expect(html).toContain(g.point.replace(/`/g, '').slice(0, 20));
    expect(ex.tips?.length).toBeGreaterThan(0);
    for (const s of ex.tips ?? []) expect(html).toContain(s.title);
    expect(html).toContain('aria-label="Close the tips"');
  });

  it('renders only the button until it is clicked', () => {
    const html = renderToStaticMarkup(<TipsButton name="Tabs" />);
    expect(html).toContain('Tips');
    expect(html).not.toContain('role="dialog"');
  });
});

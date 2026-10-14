import { useMemo } from 'react';
import { menuStructure } from '../../data';

/**
 * The small label above a guide's title ("Front End · React & State"), so a reader
 * landing from search sees where the guide sits before the first heading.
 */
export default function GuideEyebrow({ filePath }: { filePath: string }) {
  const label = useMemo(() => {
    for (const section of menuStructure) {
      const item = section.items?.find(i => i.file === filePath);
      if (item) return [section.name, item.group].filter(Boolean).join(' · ');
    }
    return null;
  }, [filePath]);

  if (!label) return null;
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{label}</p>;
}

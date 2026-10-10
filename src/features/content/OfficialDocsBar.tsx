import { useMemo } from 'react';
import { menuStructure } from '../../data';
import { BookOpen, ExternalLink } from 'lucide-react';


export const OfficialDocsBar = ({ filePath }: { filePath: string }) => {
  const guide = useMemo(() => {
    for (const section of menuStructure) {
      if (!section.items) continue;
      const item = section.items.find(i => i.file === filePath);
      if (item) return item;
    }
    return null;
  }, [filePath]);

  if (!guide?.officialDocs?.length) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 mb-6 rounded-md bg-accent-soft border border-accent/30 text-sm flex-wrap">
      <div className="flex items-center gap-2 text-muted shrink-0">
        <BookOpen size={15} className="text-accent" />
        <span>Official docs:</span>
      </div>
      {guide.officialDocs.map((doc, i) => (
        <a
          key={i}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:text-accent-strong font-medium hover:underline"
        >
          {doc.label}
          <ExternalLink size={12} />
        </a>
      ))}
    </div>
  );
};

export default OfficialDocsBar;

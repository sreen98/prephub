import { Link } from 'react-router-dom';
import { FLAVORS, type PlaygroundFlavor } from '../../lib/playgroundFlavor';

// The playground's title doubles as the switch between the JavaScript and
// React playgrounds: two links, because each is its own route (and its own
// browser-history entry), not a toggle inside one page.
export default function PlaygroundFlavorSwitch({ flavor }: { flavor: PlaygroundFlavor }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <h1 className="text-lg font-bold text-white">{FLAVORS[flavor].title}</h1>
      <nav aria-label="Playground language" className="flex items-center p-0.5 rounded-lg bg-[#2d333b] border border-[#3d444d]">
        {(['js', 'react'] as const).map((f) => (
          <Link
            key={f}
            to={FLAVORS[f].path}
            aria-current={f === flavor ? 'page' : undefined}
            className={
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors ' +
              (f === flavor ? 'bg-[#1c2028] text-white shadow-sm' : 'text-slate-300 hover:text-white')
            }
          >
            {f === 'js' ? 'JavaScript' : 'React'}
          </Link>
        ))}
      </nav>
    </div>
  );
}

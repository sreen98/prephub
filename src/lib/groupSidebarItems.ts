import type { MenuItem } from '../data';

// Groups a category's sidebar items by their optional `group` label, keeping
// first-appearance order. Items with no group come first under no heading, so
// categories that don't use grouping render exactly as before.
export function groupSidebarItems(items: MenuItem[]): { label: string | null; items: MenuItem[] }[] {
  const buckets: { label: string | null; items: MenuItem[] }[] = [];
  for (const item of items) {
    const label = typeof item.group === 'string' ? item.group : null;
    const bucket = buckets.find(b => b.label === label);
    if (bucket) bucket.items.push(item);
    else buckets.push({ label, items: [item] });
  }
  return buckets;
}

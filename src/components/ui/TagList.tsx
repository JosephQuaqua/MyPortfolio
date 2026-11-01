export function TagList({ items, label }: { items: string[]; label?: string }) {
  if (items.length === 0) return null;
  return (
    <ul className="tag-list" aria-label={label}>
      {items.map((item) => (
        <li key={item} className="tag">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function TechList({ items, label = 'Tech' }: { items: string[]; label?: string }) {
  return (
    <div className="tech">
      <span className="tech__label">{label}</span>
      <ul className="chips">
        {items.map((item) => (
          <li className="chip" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface Props {
  id: string;
  title: string;
}

export function SectionHeading({ id, title }: Props) {
  return (
    <header className="heading" data-reveal="slash">
      <h2 id={id} className="heading__text">
        {title}
      </h2>
      <span className="heading__rule" aria-hidden="true" />
    </header>
  );
}

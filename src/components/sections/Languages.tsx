import { languages } from '../../content/portfolio';
import { SectionHeading } from '../ui/SectionHeading';

export function Languages() {
  return (
    <section id="languages" className="records__block" aria-labelledby="languages-title">
      <SectionHeading id="languages-title" title={languages.title} />
      <dl className="panel tongues" data-reveal>
        {languages.items.map((language) => (
          <div key={language.name}>
            <dt>{language.name}</dt>
            <dd>{language.level}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

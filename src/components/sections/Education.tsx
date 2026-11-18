import { education } from '../../content/portfolio';
import { SectionHeading } from '../ui/SectionHeading';

export function Education() {
  return (
    <section id="education" className="records__block" aria-labelledby="education-title">
      <SectionHeading id="education-title" title={education.title} />
      <ol className="panel training" data-reveal>
        {education.entries.map((entry) => (
          <li key={entry.qualification} data-active={entry.active}>
            <p className="kick">{entry.status}</p>
            <h3>{entry.qualification}</h3>
            <p className="training__where">{entry.institution}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

import { experience } from '../../content/portfolio';
import { Rich } from '../ui/Rich';
import { SectionHeading } from '../ui/SectionHeading';
import { TechList } from '../ui/TechList';

export function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="container">
        <SectionHeading id="experience-title" title={experience.title} />

        <article className="panel panel--crimson mission" data-reveal>
          <i className="panel__edge" aria-hidden="true" />

          <div className="mission__top">
            <div>
              <h3 className="mission__company">{experience.company}</h3>
              <p className="mission__role">{experience.role}</p>
            </div>
            <p className="mission__when">
              <span>{experience.mode}</span>
              <i aria-hidden="true" />
              <span>{experience.period}</span>
            </p>
          </div>

          <div className="mission__grid">
            <ul className="ticks">
              {experience.points.map((point) => (
                <li key={point}>
                  <Rich text={point} />
                </li>
              ))}
            </ul>

            <aside className="assistant" aria-labelledby="assistant-title">
              <h4 id="assistant-title" className="assistant__title">
                {experience.assistant.title}
              </h4>
              <ol className="chain" aria-hidden="true">
                {experience.assistant.chain.map((step) => (
                  <li key={step.name}>
                    <span className="chain__role">{step.role}</span>
                    <span className="chain__name">{step.name}</span>
                  </li>
                ))}
              </ol>
              {experience.assistant.notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </aside>
          </div>

          <TechList items={experience.tech} />
        </article>
      </div>
    </section>
  );
}

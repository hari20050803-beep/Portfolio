import { about } from '../../content/portfolio';
import { asset } from '../../lib/assets';
import { Rich } from '../ui/Rich';
import { SectionHeading } from '../ui/SectionHeading';

function Portrait() {
  return (
    <figure className="portrait" data-reveal>
      <picture>
        <source
          type="image/webp"
          srcSet={`${asset('images/portrait-360.webp')} 360w, ${asset('images/portrait-720.webp')} 720w`}
          sizes="(max-width: 720px) 62vw, 320px"
        />
        <img
          src={asset('images/portrait-720.jpg')}
          alt={about.portraitAlt}
          width={720}
          height={720}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <svg className="portrait__ring" viewBox="0 0 173 173" fill="none" aria-hidden="true">
        <circle cx="86.500" cy="86.500" r="77" />
        <path d="M112 8.500A82 82 0 0 1 166 72" />
      </svg>
    </figure>
  );
}

export function About() {
  const showPortrait = __PUBLIC_CONTACT__.showPortrait;

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container">
        <SectionHeading id="about-title" title={about.title} />

        <div className={`panel about${showPortrait ? '' : ' about--text-only'}`} data-reveal>
          <i className="panel__edge" aria-hidden="true" />
          {showPortrait ? <Portrait /> : null}

          <div className="about__body">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>
                <Rich text={paragraph} />
              </p>
            ))}

            <dl className="facts">
              {about.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

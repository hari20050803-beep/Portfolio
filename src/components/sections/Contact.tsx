import { contact } from '../../content/portfolio';
import { CvLink } from '../ui/CvLink';
import { Icon } from '../ui/Icon';
import { SectionHeading } from '../ui/SectionHeading';
import { CopyEmail } from './CopyEmail';

const details = __PUBLIC_CONTACT__;

/** The closing scene: the page ends on the lone figure under the moon. */
export function Contact() {
  return (
    <section id="contact" className="finale" aria-labelledby="contact-title">
      <div className="finale__scrim" aria-hidden="true" />
      <div className="container finale__inner">
        <SectionHeading id="contact-title" title={contact.title} />

        <div className="finale__body" data-reveal>
          <p className="finale__lede">{contact.lede}</p>

          {details.email ? (
            <div className="finale__email-row">
              <a className="finale__email" href={`mailto:${details.email}`}>
                {details.email}
              </a>
              <CopyEmail email={details.email} />
            </div>
          ) : null}

          {details.phone ? (
            <a className="finale__phone" href={`tel:${details.phone.replace(/\s+/g, '')}`}>
              <Icon name="phone" />
              {details.phone}
            </a>
          ) : null}

          <div className="finale__actions">
            <CvLink className="btn btn--primary finale__cv" />
            {details.github ? (
              <a
                className="btn btn--ghost"
                href={details.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile (opens in a new tab)"
              >
                <Icon name="github" />
                GitHub
              </a>
            ) : null}
            {details.linkedin ? (
              <a
                className="btn btn--ghost"
                href={details.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile (opens in a new tab)"
              >
                <Icon name="linkedin" />
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

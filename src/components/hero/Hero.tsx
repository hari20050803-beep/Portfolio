import type { CSSProperties } from 'react';
import { profile } from '../../content/portfolio';
import { Icon } from '../ui/Icon';
import { SocialLinks } from '../ui/SocialLinks';

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

export function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-name">
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__inner container" data-parallax="-0.12">
        <div className="hero__copy">
          <h1 id="hero-name" className="hero__name rise" style={delay(0)}>
            {profile.name}
          </h1>

          <p className="hero__role rise" style={delay(70)}>
            {profile.roles.map((role) => (
              <span key={role}>{role} </span>
            ))}
          </p>

          <h2 className="hero__headline">
            <span>{profile.headline}</span>
          </h2>

          <p className="hero__support rise" style={delay(260)}>
            {profile.support}
          </p>

          <ul className="hero__meta rise" style={delay(320)}>
            <li>
              <Icon name="pin" />
              {profile.location}
            </li>
            <li>
              <Icon name="briefcase" />
              {profile.currentRole}
            </li>
          </ul>

          <div className="hero__actions rise" style={delay(380)}>
            <a className="btn btn--primary" href="#projects">
              View Projects
            </a>
            <a className="btn btn--ghost" href="#contact">
              Contact Me
            </a>
            <SocialLinks className="socials--hero" />
          </div>
        </div>
      </div>

      <a className="scroll-cue" href="#about">
        <span>Scroll</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}

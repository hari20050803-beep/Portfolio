import type { CSSProperties } from 'react';
import { skills } from '../../content/portfolio';
import { SectionHeading } from '../ui/SectionHeading';

export function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading id="skills-title" title={skills.title} />
        <div className="skill-grid">
          {skills.groups.map((group, index) => (
            <div
              className="skill-group"
              key={group.label}
              data-reveal
              style={{ '--i': index % 3 } as CSSProperties}
            >
              <h3>{group.label}</h3>
              <ul className="chips">
                {group.items.map((item) => (
                  <li className="chip" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

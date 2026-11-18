import { achievement } from '../../content/portfolio';
import { SectionHeading } from '../ui/SectionHeading';

export function Achievement() {
  return (
    <section id="achievement" className="records__block" aria-labelledby="achievement-title">
      <SectionHeading id="achievement-title" title={achievement.title} />
      <div className="panel honour" data-reveal>
        <span className="honour__seal" aria-hidden="true">
          {achievement.badge}
        </span>
        <div>
          <h3>{achievement.placement}</h3>
          <p>{achievement.venue}</p>
        </div>
      </div>
    </section>
  );
}

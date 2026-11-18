import type { ProjectMedia as Media } from '../../content/portfolio';
import { asset } from '../../lib/assets';

/** The project's screenshot or logo from its repository, or a drawing when there is none. */
export function ProjectMedia({ media }: { media: Media }) {
  if (media.kind === 'waveform') {
    return (
      <div className="project__media project__media--art" aria-hidden="true">
        <Waveform />
      </div>
    );
  }

  const src = (width: number) => asset(`images/projects/${media.image}-${width}.webp`);

  return (
    <figure className={`project__media project__media--${media.kind}`}>
      {media.kind === 'screenshot' ? (
        <span className="project__chrome" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : null}
      <img
        src={src(1120)}
        srcSet={`${src(560)} 560w, ${src(1120)} 1120w`}
        sizes="(max-width: 960px) 92vw, 520px"
        width={1120}
        height={700}
        alt={media.alt}
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}

/** A voice waveform drawing, for FRIDAY. The bars come alive on hover. */
function Waveform() {
  const heights = [14, 26, 40, 22, 58, 34, 76, 48, 92, 62, 100, 70, 88, 44, 66, 30, 50, 20, 34, 12];
  return (
    <svg viewBox="0 0 200 120" fill="none" aria-hidden="true" focusable="false">
      {heights.map((height, index) => (
        <rect
          key={index}
          x={8 + index * 9.500}
          y={60 - height / 2}
          width="4"
          height={height}
          rx="2"
          className="art__bar"
          style={{ animationDelay: `${index * -70}ms` }}
        />
      ))}
    </svg>
  );
}

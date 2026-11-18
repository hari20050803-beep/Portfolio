import { projects, projectsSection, type Project, type ProjectSignature } from '../../content/portfolio';
import { Icon } from '../ui/Icon';
import { Rich } from '../ui/Rich';
import { SectionHeading } from '../ui/SectionHeading';
import { TechList } from '../ui/TechList';
import { ProjectMedia } from './ProjectMedia';

function Signature({ signature }: { signature: ProjectSignature }) {
  // The feature list carries information not given elsewhere, so it stays
  // readable to screen readers. The others restate the bullet points.
  const decorative = signature.kind !== 'features';

  return (
    <div className={`signature signature--${signature.kind}`} aria-hidden={decorative || undefined}>
      <span className="signature__label">{signature.label}</span>
      <ul>
        {signature.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function RepositoryLink({ project }: { project: Project }) {
  if (!project.repository) {
    return <span className="project__no-repo">No public repository</span>;
  }
  return (
    <a
      className="btn btn--ghost btn--small project__repo"
      href={project.repository}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View Repository for ${project.name} on GitHub (opens in a new tab)`}
    >
      <Icon name="github" />
      View Repository
      <Icon name="arrowUpRight" />
    </a>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const titleId = `project-${project.id}`;

  return (
    <div className="project-slot" data-reveal>
      <article className={`project project--${project.id}`} aria-labelledby={titleId} data-tilt>
        <i className="project__glow" aria-hidden="true" />

        <div className="project__layout">
          <ProjectMedia media={project.media} />

          <div className="project__content">
            <header className="project__header">
              <p className="kick">{project.category}</p>
              <h3 id={titleId} className="project__name">
                {project.name}
              </h3>
              <p className="project__summary">{project.summary}</p>
            </header>

            <p className="project__description">{project.description}</p>

            <div className="project__body">
              <ul className="ticks">
                {project.points.map((point) => (
                  <li key={point}>
                    <Rich text={point} />
                  </li>
                ))}
              </ul>
              <Signature signature={project.signature} />
            </div>
          </div>
        </div>

        <footer className="project__footer">
          <TechList items={project.tech} />
          <RepositoryLink project={project} />
        </footer>
      </article>
    </div>
  );
}

export function Projects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading id="projects-title" title={projectsSection.title} />
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

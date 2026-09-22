import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { projects } from '../../data/projects'
import type { Project } from '../../data/types'
import { cn } from '../../lib/cn'
import { useReducedMotion, useStackLayout } from '../../lib/hooks'
import { EASE_OUT, inView, stagger } from '../../lib/motion'
import { Link } from '../../lib/navigation'
import { ProjectVisual } from '../projects/Visuals'
import { GitHubIcon } from '../ui/BrandIcons'
import { Button } from '../ui/Button'
import { Serif } from '../ui/Motifs'
import { SectionHeading } from '../ui/SectionHeading'

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } },
}

function ProjectCard({
  project,
  index,
  total,
  progress,
  stacked,
}: {
  project: Project
  index: number
  total: number
  progress: MotionValue<number>
  stacked: boolean
}) {
  // Card N locks in place at progress N / (total - 1); from then on it recedes
  // (scales down, dims) while the cards after it slide over.
  const depth = total - 1 - index
  const start = total > 1 ? Math.min(index / (total - 1), 0.999) : 0
  const scale = useTransform(progress, [start, 1], [1, 1 - depth * 0.05])
  const dim = useTransform(progress, [start, 1], [0, depth * 0.28])
  const titleId = `project-${project.slug}`

  return (
    <div className="mb-6 last:mb-0 stack:sticky stack:top-0 stack:mb-0 stack:flex stack:h-[100svh] stack:items-start stack:pt-[calc(var(--header-h)+2.25rem)]">
      <motion.article
        aria-labelledby={titleId}
        className="panel relative w-full origin-top overflow-hidden rounded-[1.25rem] stack:h-[min(calc(100svh-var(--header-h)-5rem),48rem)]"
        style={stacked ? { scale, top: index * 16 } : undefined}
        initial={stacked ? false : { opacity: 0, y: 40 }}
        whileInView={stacked ? undefined : { opacity: 1, y: 0 }}
        viewport={inView}
        transition={{ duration: 1.1, ease: EASE_OUT }}
      >
        <div className="grid h-full lg:grid-cols-12">
          <motion.div
            className="flex min-w-0 flex-col p-6 sm:p-10 lg:col-span-6 lg:p-[clamp(2rem,4.2vh,2.75rem)]"
            initial="hidden"
            whileInView="visible"
            viewport={inView}
            variants={stagger(0.07)}
          >
            <motion.div variants={item} className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="eyebrow flex min-w-0 items-center gap-3 text-fog-400">
                <span className="text-fog-200">{project.number}</span>
                <span aria-hidden="true" className="h-px w-6 shrink-0 bg-fog-600" />
                <span className="min-w-0">{project.assessment}</span>
              </p>
              {project.featured && (
                <span className="eyebrow rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[0.625rem] text-accent">
                  Featured
                </span>
              )}
            </motion.div>

            <motion.h3
              id={titleId}
              variants={item}
              className="mt-[clamp(1.25rem,3vh,1.75rem)] text-[clamp(2.2rem,min(3.8vw,6.4vh),3.6rem)] leading-[0.95] font-medium tracking-[-0.045em] text-fog-50"
            >
              {project.title}
            </motion.h3>
            {project.subtitle && (
              <motion.p variants={item} className="mt-2 font-serif text-[clamp(1.25rem,min(1.9vw,3.1vh),1.6rem)] text-fog-300 italic">
                {project.subtitle}
              </motion.p>
            )}

            <motion.p variants={item} className="mt-[clamp(0.75rem,2vh,1.25rem)] max-w-lg text-[0.9375rem] leading-relaxed text-fog-400">
              {project.summary}
            </motion.p>

            <motion.ul variants={item} aria-label="Technologies" className="mt-[clamp(0.75rem,2.2vh,1.5rem)] flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-white/10 px-3 py-1 font-mono text-[0.6875rem] tracking-wide text-fog-300"
                >
                  {tech}
                </li>
              ))}
            </motion.ul>

            <motion.div variants={item} className="mt-[clamp(1rem,2.6vh,1.75rem)]">
              <p className="eyebrow text-fog-500">Key features</p>
              <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm text-fog-300 sm:grid-cols-2">
                {project.highlights.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span aria-hidden="true" className="mt-[0.55em] size-1 shrink-0 rounded-full bg-accent/80" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={item} className="mt-8 flex flex-wrap gap-3 pt-2 lg:mt-auto">
              <Button to={`/work/${project.slug}`} aria-label={`View project: ${project.title}`}>
                View Project
              </Button>
              {project.repo?.visibility === 'public' && (
                <Button
                  href={project.repo.url}
                  external
                  variant="secondary"
                  leading={<GitHubIcon size={16} />}
                  aria-label={`${project.title} on GitHub (opens in a new tab)`}
                >
                  GitHub
                </Button>
              )}
            </motion.div>
          </motion.div>

          <div
            className={cn(
              'relative min-w-0 border-t border-white/[0.06] lg:col-span-6 lg:min-h-0 lg:border-t-0 lg:border-l',
              project.device === 'phone' ? 'min-h-[30rem] sm:min-h-[34rem]' : 'min-h-[16rem] sm:min-h-[24rem]',
            )}
          >
            <Link
              to={`/work/${project.slug}`}
              tabIndex={-1}
              aria-hidden="true"
              data-cursor-label="View"
              className="group/visual absolute inset-0 block bg-ink-900/60"
            >
              <ProjectVisual project={project} />
            </Link>
          </div>
        </div>

        {stacked && (
          <motion.div aria-hidden="true" style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink-950" />
        )}
      </motion.article>
    </div>
  )
}

export function Projects() {
  const container = useRef<HTMLDivElement>(null)
  const stackLayout = useStackLayout()
  const reduced = useReducedMotion()
  const stacked = stackLayout && !reduced
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] })

  return (
    <section
      id="work"
      tabIndex={-1}
      aria-labelledby="work-title"
      className="relative py-[clamp(6rem,12vw,10rem)] outline-none"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/4 h-[60%] bg-[radial-gradient(50%_50%_at_50%_50%,rgb(155_179_214/0.05),transparent_70%)]"
      />
      <div className="shell">
        <SectionHeading
          index="03"
          label="Selected Work"
          id="work-title"
          title={['Featured', <Serif key="p">projects.</Serif>]}
          description="My academic software engineering projects, each built for a module assessment, with Learnova AI, my final-year project, as the featured build."
        />

        <div ref={container} className={cn('relative mt-16 lg:mt-20', stacked && 'stack:mt-8')}>
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              total={projects.length}
              progress={scrollYProgress}
              stacked={stacked}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

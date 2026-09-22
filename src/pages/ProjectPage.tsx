import { motion } from 'motion/react'
import { useMemo, type ReactNode } from 'react'
import { Architecture } from '../components/projects/Architecture'
import { ProjectVisual } from '../components/projects/Visuals'
import { GitHubIcon, LinkedInIcon } from '../components/ui/BrandIcons'
import { Button } from '../components/ui/Button'
import { Serif, SwapArrow } from '../components/ui/Motifs'
import { Reveal, RevealLines } from '../components/ui/Reveal'
import { profile } from '../data/profile'
import { getProject, projects } from '../data/projects'
import { projectMeta } from '../data/seo'
import { cn } from '../lib/cn'
import { useDocumentMeta } from '../lib/hooks'
import { EASE_IN_OUT, EASE_OUT, inView, stagger } from '../lib/motion'
import { Link } from '../lib/navigation'
import { useNavigation } from '../lib/router'

const pad = (n: number) => String(n).padStart(2, '0')

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="eyebrow text-fog-500">{label}</dt>
      <dd className="mt-3 leading-relaxed text-fog-100">{children}</dd>
    </div>
  )
}

function Block({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('shell mt-28 md:mt-40', className)} aria-label={label}>
      <div className="grid gap-y-10 border-t border-white/[0.08] pt-10 md:grid-cols-12">
        <h2 className="eyebrow text-fog-300 md:col-span-3">{label}</h2>
        <div className="md:col-span-9">{children}</div>
      </div>
    </section>
  )
}

export function ProjectPage({ slug }: { slug: string }) {
  const { ready } = useNavigation()
  const project = getProject(slug) ?? projects[0]
  const index = projects.indexOf(project)
  const next = projects[(index + 1) % projects.length]
  const meta = useMemo(() => projectMeta(project), [project])
  useDocumentMeta(meta)

  const groupCols =
    { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2' }[project.featureGroups.length] ??
    'md:grid-cols-3'
  const publicRepo = project.repo?.visibility === 'public' ? project.repo.url : undefined
  const emailSubject = encodeURIComponent(`About ${project.title}`)

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <article aria-labelledby="case-title">
        <header className="shell pt-[calc(var(--header-h)+4rem)] md:pt-[calc(var(--header-h)+6rem)]">
          <motion.div initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: 1, delay: 0.4 }}>
            <Link
              to="/#work"
              className="group eyebrow inline-flex items-center gap-3 text-fog-400 transition-colors hover:text-fog-50"
            >
              <SwapArrow direction="left" />
              All work
            </Link>
          </motion.div>

          <motion.p
            className="eyebrow mt-14 flex flex-wrap items-center gap-3 text-fog-500 md:mt-20"
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.25 }}
          >
            <span className="text-fog-200">
              Case study {project.number} / {pad(projects.length)}
            </span>
            <span aria-hidden="true" className="h-px w-8 bg-fog-600" />
            <span>{project.assessment}</span>
            {project.featured && (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[0.625rem] text-accent">
                Featured
              </span>
            )}
          </motion.p>

          <h1
            id="case-title"
            data-page-focus
            tabIndex={-1}
            className="mt-8 text-[clamp(3rem,10.5vw,10.5rem)] leading-[0.88] font-semibold tracking-[-0.055em] outline-none"
          >
            <RevealLines play={ready} delay={0.2} lines={[project.title]} lineClassName="text-metal" />
          </h1>
          {project.subtitle && (
            <motion.p
              className="mt-4 font-serif text-[clamp(1.6rem,3.2vw,2.75rem)] text-fog-300 italic"
              initial={{ opacity: 0, y: 16 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.5 }}
            >
              {project.subtitle}
            </motion.p>
          )}

          <motion.div
            className="mt-14 grid gap-12 border-t border-white/[0.08] pt-10 md:grid-cols-12"
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.65 }}
          >
            <p className="text-xl leading-relaxed text-fog-200 md:col-span-6 md:text-2xl">{project.summary}</p>
            <dl className="grid gap-8 sm:grid-cols-2 md:col-span-5 md:col-start-8">
              <Meta label="Module">{project.module}</Meta>
              <Meta label="Platform">{project.platform}</Meta>
              <Meta label="Stack">{project.tech.join(' · ')}</Meta>
              {publicRepo && (
                <Meta label="Repository">
                  <a href={publicRepo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline decoration-white/30 underline-offset-4 hover:decoration-white">
                    <GitHubIcon size={15} /> View on GitHub
                  </a>
                </Meta>
              )}
              {project.liveUrl && (
                <Meta label="Live">
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
                    Open the live project
                  </a>
                </Meta>
              )}
            </dl>
          </motion.div>
        </header>

        <div className="shell mt-16 md:mt-24">
          <motion.div
            className={cn(
              'panel relative overflow-hidden rounded-[1.5rem]',
              project.device === 'phone' ? 'aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/9]' : 'aspect-[4/3] lg:aspect-[16/10]',
            )}
            initial={{ clipPath: 'inset(12% 6% 12% 6% round 1.5rem)', opacity: 0 }}
            animate={ready ? { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)', opacity: 1 } : {}}
            transition={{ duration: 1.5, ease: EASE_IN_OUT, delay: 0.5 }}
          >
            <ProjectVisual project={project} variant="hero" />
          </motion.div>
        </div>

        <Block label="Overview">
          <div className="max-w-3xl space-y-6 text-xl leading-relaxed text-fog-300 md:text-2xl md:leading-[1.5]">
            {project.overview.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className={i === 0 ? 'text-fog-100' : undefined}>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </Block>

        <Block label="Key features">
          <motion.div
            className={cn('grid gap-10', groupCols)}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
            variants={stagger(0.1)}
          >
            {project.featureGroups.map((group) => (
              <motion.div
                key={group.title}
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE_OUT } } }}
              >
                <h3 className="eyebrow border-b border-white/[0.08] pb-4 text-accent">{group.title}</h3>
                <ul>
                  {group.items.map((feature, i) => (
                    <li key={feature} className="flex items-baseline gap-4 border-b border-white/[0.06] py-4 text-lg text-fog-100">
                      <span className="font-mono text-xs text-fog-600">{pad(i + 1)}</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </Block>

        <Block label={project.engineering.title}>
          <motion.dl
            className="grid gap-x-10 gap-y-8 md:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={inView}
            variants={stagger(0.08)}
          >
            {project.engineering.points.map((point) => (
              <motion.div
                key={point.label}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } } }}
                className="border-t border-white/[0.08] pt-5"
              >
                <dt className="text-lg font-medium tracking-[-0.01em] text-fog-50">{point.label}</dt>
                <dd className="mt-2 leading-relaxed text-fog-400">{point.detail}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </Block>

        <Block label={project.architecture.title}>
          <Architecture project={project} />
        </Block>

        <section className="shell mt-28 md:mt-40" aria-labelledby="case-cta">
          <Reveal>
            <div className="panel relative grid gap-10 overflow-hidden rounded-[1.5rem] p-8 md:grid-cols-12 md:items-end md:p-14">
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_80%_at_0%_0%,rgb(155_179_214/0.12),transparent_70%)]" />
              <div className="relative md:col-span-7">
                <p className="eyebrow text-fog-500">Get in touch</p>
                <h2 id="case-cta" className="mt-6 text-[clamp(2rem,4vw,3.5rem)] leading-[1.02] font-medium tracking-[-0.04em] text-fog-50">
                  Want to know more about <Serif>{project.title}?</Serif>
                </h2>
              </div>
              <div className="relative flex flex-wrap gap-3 md:col-span-5 md:justify-end">
                <Button href={`mailto:${profile.email}?subject=${emailSubject}`} magnetic>
                  Email me
                </Button>
                <Button
                  href={profile.links.linkedin}
                  external
                  variant="secondary"
                  leading={<LinkedInIcon size={15} />}
                  aria-label="LinkedIn (opens in a new tab)"
                >
                  LinkedIn
                </Button>
              </div>
            </div>
          </Reveal>
        </section>

        <nav aria-label="Next project" className="mt-28 border-t border-white/[0.06] md:mt-40">
          <Link to={`/work/${next.slug}`} data-cursor-label="Next" className="group block">
            <div className="shell py-20 md:py-28">
              <p className="eyebrow text-fog-500">
                Next project — {next.number} / {pad(projects.length)}
              </p>
              <p className="mt-6 flex items-center justify-between gap-6 text-[clamp(2.5rem,8.5vw,8.5rem)] leading-[0.9] font-semibold tracking-[-0.055em] text-fog-400 transition-colors duration-700 group-hover:text-fog-50">
                <span>{next.title}</span>
                <SwapArrow direction="right" className="size-[0.45em] shrink-0" />
              </p>
            </div>
          </Link>
        </nav>
      </article>
    </main>
  )
}

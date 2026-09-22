import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { journey } from '../../data/content'
import { projects } from '../../data/projects'
import { useReducedMotion } from '../../lib/hooks'
import { EASE_OUT, inView } from '../../lib/motion'
import { Link } from '../../lib/navigation'
import { Serif, SwapArrow } from '../ui/Motifs'
import { SectionHeading } from '../ui/SectionHeading'

type Step = (typeof journey)[number]

function JourneyStep({ step, index, progress }: { step: Step; index: number; progress: MotionValue<number> }) {
  const reduced = useReducedMotion()
  const threshold = index / journey.length
  const lit = useTransform(progress, [threshold, threshold + 0.08], [0, 1])
  const isCurrent = 'current' in step && step.current
  const isBuilding = index === journey.length - 1

  return (
    <motion.li
      className="relative pl-10 md:pt-14 md:pl-0"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: 1.1, ease: EASE_OUT, delay: index * 0.12 }}
    >
      <span aria-hidden="true" className="absolute top-1 left-0 flex size-[15px] items-center justify-center md:top-0">
        <span className="absolute inset-0 rounded-full border border-white/20 bg-ink-950" />
        <motion.span
          style={reduced ? undefined : { opacity: lit }}
          className="absolute inset-[3px] rounded-full bg-accent shadow-[0_0_18px_rgb(155_179_214/0.8)]"
        />
        {isCurrent && <span className="absolute -inset-1 animate-pulse-ring rounded-full border border-accent/70" />}
      </span>

      <span
        aria-hidden="true"
        className="text-outline pointer-events-none absolute -top-2 right-0 text-[6.5rem] leading-none font-semibold tracking-[-0.06em] select-none md:-top-6 md:right-4"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <p className="eyebrow flex items-center gap-3 text-accent">
        {step.status}
        {isCurrent && <span className="rounded-full border border-accent/30 px-2 py-0.5 text-[0.625rem] tracking-[0.18em] text-accent">Now</span>}
      </p>
      <h3 className="mt-5 max-w-xs text-[1.75rem] leading-tight font-medium tracking-[-0.03em] text-fog-50 md:text-[2rem]">
        {step.title}
      </h3>
      <p className="mt-4 max-w-sm leading-relaxed text-fog-400">{step.description}</p>

      {isBuilding && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Projects built so far">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link
                to={`/work/${project.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-fog-300 transition-colors duration-500 hover:border-white/30 hover:text-fog-50"
              >
                {project.title}
                <SwapArrow className="size-3.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </motion.li>
  )
}

export function Journey() {
  const listRef = useRef<HTMLOListElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.8', 'end 0.55'] })

  return (
    <section
      id="journey"
      tabIndex={-1}
      aria-labelledby="journey-title"
      className="relative py-[clamp(6rem,12vw,10rem)] outline-none"
    >
      <div className="shell">
        <SectionHeading
          index="04"
          label="Journey"
          id="journey-title"
          title={[
            'The journey',
            <>
              so <Serif>far.</Serif>
            </>,
          ]}
          description="Education and hands-on building, side by side."
        />

        <div className="relative mt-20 md:mt-28">
          {/* Track: vertical on mobile, horizontal from md up. */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[7px] w-px bg-white/10 md:top-[7px] md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto"
          />
          <motion.span
            aria-hidden="true"
            style={reduced ? undefined : { scaleY: scrollYProgress }}
            className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-gradient-to-b from-accent via-accent/60 to-white/10 md:hidden"
          />
          <motion.span
            aria-hidden="true"
            style={reduced ? undefined : { scaleX: scrollYProgress }}
            className="absolute top-[7px] right-0 left-0 hidden h-px origin-left bg-gradient-to-r from-accent via-accent/60 to-white/10 md:block"
          />
          <ol ref={listRef} className="relative grid gap-16 md:grid-cols-3 md:gap-10">
            {journey.map((step, index) => (
              <JourneyStep key={step.title} step={step} index={index} progress={scrollYProgress} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

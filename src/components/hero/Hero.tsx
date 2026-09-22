import { motion, useScroll, useTransform, type Variants } from 'motion/react'
import { useRef } from 'react'
import { profile } from '../../data/profile'
import { useReducedMotion } from '../../lib/hooks'
import { EASE_OUT } from '../../lib/motion'
import { useNavigation } from '../../lib/router'
import { Button } from '../ui/Button'
import { StatusDot } from '../ui/Motifs'
import { SignalField } from './SignalField'

const [firstName, lastName] = profile.name.toUpperCase().split(' ')

const letter: Variants = {
  hidden: { y: '108%', rotate: 4 },
  visible: { y: '0%', rotate: 0, transition: { duration: 1.25, ease: EASE_OUT } },
}

function SplitLine({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="line-mask" aria-hidden="true">
      <motion.span
        className="flex"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.045, delayChildren: delay } } }}
      >
        {text.split('').map((char, index) => (
          <motion.span key={index} variants={letter} className="text-metal inline-block origin-bottom-left">
            {char}
          </motion.span>
        ))}
      </motion.span>
    </span>
  )
}

const rise = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: EASE_OUT, delay } },
})

export function Hero() {
  const { ready } = useNavigation()
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  // Cinematic exit: the frame recedes and the field sinks as you scroll away.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '32%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const fieldScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const fieldOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.15])

  const state = ready ? 'visible' : 'hidden'

  return (
    <section
      id="top"
      ref={ref}
      tabIndex={-1}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden outline-none"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={reduced ? undefined : { scale: fieldScale, opacity: fieldOpacity }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(90%_55%_at_60%_78%,rgb(155_179_214/0.11),transparent_65%)]" />
        <SignalField active={ready} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-ink-950 via-ink-950/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink-950 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgb(5_5_6/0.85)_100%)]" />
      </motion.div>

      <motion.div
        className="shell relative flex flex-1 flex-col pt-[calc(var(--header-h)+2.5rem)] pb-7"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        initial="hidden"
        animate={state}
      >
        <motion.div variants={rise(0.2)} className="eyebrow flex items-center justify-between gap-6 text-fog-400">
          <span className="flex items-center gap-3">
            <StatusDot />
            <span>Open to internships &amp; software engineering opportunities</span>
          </span>
          <span className="hidden text-fog-500 md:block">
            {profile.location.city}, {profile.location.country}
          </span>
        </motion.div>

        <div className="my-auto py-12">
          <h1
            id="hero-title"
            data-page-focus
            tabIndex={-1}
            aria-label={`${profile.displayName} — ${profile.roles.join(', ')}`}
            className="text-[clamp(2.5rem,12.4vw,12.75rem)] leading-[0.84] font-semibold tracking-[-0.055em] outline-none"
          >
            <SplitLine text={firstName} delay={0.15} />
            <SplitLine text={lastName} delay={0.3} />
          </h1>

          <motion.p
            variants={rise(0.75)}
            aria-hidden="true"
            className="mt-8 font-mono text-[0.8125rem] tracking-[0.2em] text-fog-300 uppercase sm:text-sm"
          >
            Software Engineering Student <span className="px-2 text-accent">•</span> AI &amp; Software Developer
          </motion.p>

          <div className="mt-10 grid gap-8 border-t border-white/[0.08] pt-8 lg:grid-cols-12 lg:items-end">
            <motion.p
              variants={rise(0.9)}
              className="max-w-md text-lg leading-relaxed text-fog-300 lg:col-span-6 lg:text-xl"
            >
              {profile.tagline}
            </motion.p>
            <motion.div variants={rise(1.02)} className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end">
              <Button to="/#work" icon="down" magnetic size="lg">
                View My Work
              </Button>
              <Button to="/#contact" variant="secondary" magnetic size="lg">
                Contact Me
              </Button>
            </motion.div>
          </div>
        </div>

        <motion.div variants={rise(1.2)} className="eyebrow flex items-end justify-between text-fog-500">
          <span className="flex items-center gap-4">
            <span aria-hidden="true" className="relative block h-10 w-px overflow-hidden bg-white/10">
              <span className="absolute inset-0 animate-scroll-cue bg-fog-200" />
            </span>
            Scroll to explore
          </span>
          <span className="tabular-nums">{profile.location.coordinates}</span>
        </motion.div>
      </motion.div>
    </section>
  )
}

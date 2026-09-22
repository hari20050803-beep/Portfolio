import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { profile } from '../../data/profile'
import { EASE_IN_OUT, EASE_OUT } from '../../lib/motion'
import { useNavigation, type CurtainLabel } from '../../lib/router'

// Letters are grouped per word so narrow screens only wrap between words.
// Each word keeps its original per-letter animation slot (spaces count as one).
const TITLE_WORDS = profile.displayName
  .toUpperCase()
  .split(' ')
  .reduce<{ word: string; offset: number }[]>((words, word) => {
    const previous = words[words.length - 1]
    const offset = previous ? previous.offset + previous.word.length + 1 : 0
    return [...words, { word, offset }]
  }, [])

/** Waits for web fonts (capped) so the title card never reflows mid-animation. */
function useFontsReady(cap: number) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    const timeout = new Promise((resolve) => window.setTimeout(resolve, cap))
    Promise.race([document.fonts?.ready ?? Promise.resolve(), timeout]).then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [cap])
  return ready
}

function IntroCard({ variant, active, onDone }: { variant: 'full' | 'short'; active: boolean; onDone: () => void }) {
  const fontsReady = useFontsReady(variant === 'full' ? 1400 : 700)

  useEffect(() => {
    if (!active || !fontsReady) return
    const id = window.setTimeout(onDone, variant === 'full' ? 1250 : 120)
    return () => window.clearTimeout(id)
  }, [active, fontsReady, variant, onDone])

  if (variant === 'short') return null

  return (
    <div className="flex flex-col items-center gap-6 px-6 text-center">
      <motion.p
        className="eyebrow text-fog-500"
        initial={{ opacity: 0 }}
        animate={fontsReady ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: EASE_OUT }}
      >
        Software Engineering · AI
      </motion.p>
      <p
        className="flex flex-wrap justify-center gap-x-[0.6em] text-sm font-medium tracking-[0.34em] text-fog-100 sm:text-base"
        aria-hidden="true"
      >
        {TITLE_WORDS.map(({ word, offset }) => (
          <span key={offset} className="inline-flex whitespace-nowrap">
            {word.split('').map((char, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%', opacity: 0 }}
                  animate={fontsReady ? { y: '0%', opacity: 1 } : {}}
                  transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 + (offset + i) * 0.028 }}
                >
                  {char}
                </motion.span>
              </span>
            ))}
          </span>
        ))}
      </p>
      <motion.span
        className="h-px w-40 origin-left bg-gradient-to-r from-transparent via-accent to-transparent"
        initial={{ scaleX: 0 }}
        animate={fontsReady ? { scaleX: 1 } : {}}
        transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.3 }}
      />
    </div>
  )
}

function TransitionLabel({ label }: { label: CurtainLabel }) {
  return (
    <div className="px-6 text-center">
      <motion.p
        className="eyebrow text-fog-500"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 }}
      >
        {label.kicker}
      </motion.p>
      <span className="line-mask mt-4">
        <motion.span
          className="block font-serif text-[clamp(2.5rem,7vw,5.5rem)] leading-none text-fog-50 italic"
          initial={{ y: '110%' }}
          animate={{ y: '0%' }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 }}
        >
          {label.title}
        </motion.span>
      </span>
    </div>
  )
}

/**
 * Full-screen curtain: plays the intro title card on first load and covers the
 * page during route changes. Purely decorative, so hidden from assistive tech.
 */
export function Curtain() {
  const { phase, label, introVariant, onCovered, onRevealed } = useNavigation()
  if (phase === 'idle') return null

  const revealing = phase === 'reveal'
  const showIntro = phase === 'intro' || (revealing && !label)

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-ink-900"
      initial={{ y: phase === 'cover' ? '100%' : '0%' }}
      animate={{ y: revealing ? '-100%' : '0%' }}
      transition={{ duration: revealing ? 1.05 : 0.75, ease: EASE_IN_OUT, delay: revealing ? 0.05 : 0 }}
      onAnimationComplete={() => {
        if (phase === 'cover') onCovered()
        else if (phase === 'reveal') onRevealed()
      }}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      <span className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgb(155_179_214/0.07),transparent_70%)]" />
      <motion.div
        className="relative"
        animate={revealing ? { y: '40vh', opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 1.05, ease: EASE_IN_OUT }}
      >
        {showIntro ? (
          <IntroCard variant={introVariant} active={phase === 'intro'} onDone={onCovered} />
        ) : (
          label && <TransitionLabel label={label} />
        )}
      </motion.div>
    </motion.div>
  )
}

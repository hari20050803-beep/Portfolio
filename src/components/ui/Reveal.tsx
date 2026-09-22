import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { EASE_OUT, inView, lineRise, stagger } from '../../lib/motion'

/**
 * Lines that rise out of a mask. Plays once in view, or when `play` flips to
 * true (used for entrance sequences that wait for the page curtain).
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  step = 0.09,
  play,
}: {
  lines: readonly ReactNode[]
  className?: string
  lineClassName?: string
  delay?: number
  step?: number
  play?: boolean
}) {
  const trigger =
    play === undefined
      ? { whileInView: 'visible', viewport: inView }
      : { animate: play ? 'visible' : 'hidden' }
  return (
    <motion.span className={cn('block', className)} initial="hidden" {...trigger} variants={stagger(step, delay)}>
      {lines.map((line, index) => (
        <span key={index} className="line-mask">
          <motion.span className={cn('block', lineClassName)} variants={lineRise}>
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/** Fade-and-rise wrapper for blocks of content. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  play,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  play?: boolean
}) {
  const trigger =
    play === undefined
      ? { whileInView: { opacity: 1, y: 0 }, viewport: inView }
      : { animate: play ? { opacity: 1, y: 0 } : { opacity: 0, y } }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...trigger}
      transition={{ duration: 1.1, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Hairline that draws itself from the left when it enters the viewport. */
export function DrawLine({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className={cn('block h-px origin-left bg-white/[0.08]', className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={inView}
      transition={{ duration: 1.4, ease: EASE_OUT, delay }}
    />
  )
}

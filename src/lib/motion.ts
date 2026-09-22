import type { Variants } from 'motion/react'

/** Long, soft deceleration used for most reveals. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const
/** Symmetric ease for curtains and large surface moves. */
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: EASE_OUT } },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: EASE_OUT } },
}

export const lineRise: Variants = {
  hidden: { y: '112%' },
  visible: { y: '0%', transition: { duration: 1.15, ease: EASE_OUT } },
}

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
})

/** Standard in-view trigger: play once, slightly before the element is fully visible. */
export const inView = { once: true, margin: '0px 0px -12% 0px' } as const

import { motion, useSpring } from 'motion/react'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { useFinePointer, useReducedMotion } from '../../lib/hooks'

const spring = { stiffness: 170, damping: 15, mass: 0.35 }

/** Pulls its child gently towards the pointer. Inert on touch and reduced-motion. */
export function Magnetic({
  children,
  strength = 0.32,
  className,
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const finePointer = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = finePointer && !reduced
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)

  const onPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      className={cn('inline-flex', className)}
      style={enabled ? { x, y } : undefined}
      onPointerMove={enabled ? onPointerMove : undefined}
      onPointerLeave={enabled ? reset : undefined}
    >
      {children}
    </motion.span>
  )
}

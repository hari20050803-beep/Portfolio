import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ArrowDirection = 'up-right' | 'right' | 'down' | 'left'

const arrowIcons = { 'up-right': ArrowUpRight, right: ArrowRight, down: ArrowDown, left: ArrowLeft }

// Exit / enter offsets for the hover "arrow swap".
const arrowMotion: Record<ArrowDirection, { exit: string; enter: string }> = {
  'up-right': {
    exit: 'group-hover:translate-x-full group-hover:-translate-y-full group-focus-visible:translate-x-full group-focus-visible:-translate-y-full',
    enter: '-translate-x-full translate-y-full',
  },
  right: {
    exit: 'group-hover:translate-x-full group-focus-visible:translate-x-full',
    enter: '-translate-x-full',
  },
  down: {
    exit: 'group-hover:translate-y-full group-focus-visible:translate-y-full',
    enter: '-translate-y-full',
  },
  left: {
    exit: 'group-hover:-translate-x-full group-focus-visible:-translate-x-full',
    enter: 'translate-x-full',
  },
}

/** Arrow that slides out and back in on hover of the closest `.group`. */
export function SwapArrow({ direction = 'up-right', className }: { direction?: ArrowDirection; className?: string }) {
  const Icon = arrowIcons[direction]
  const { exit, enter } = arrowMotion[direction]
  const base = 'absolute inset-0 h-full w-full transition-transform duration-500 ease-cinematic'
  return (
    <span aria-hidden="true" className={cn('relative inline-block size-4 shrink-0 overflow-hidden', className)}>
      <Icon strokeWidth={1.6} className={cn(base, exit)} />
      <Icon
        strokeWidth={1.6}
        className={cn(base, enter, 'group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0')}
      />
    </span>
  )
}

/** Label that rolls up to a duplicate of itself on hover of the closest `.group`. */
export function RollText({ children, className }: { children: string; className?: string }) {
  return (
    <span className={cn('relative inline-flex overflow-hidden', className)}>
      <span className="block transition-transform duration-500 ease-cinematic group-hover:-translate-y-full group-focus-visible:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-cinematic group-hover:translate-y-0 group-focus-visible:translate-y-0"
      >
        {children}
      </span>
    </span>
  )
}

/** Editorial serif accent inside sans headings. */
export function Serif({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('font-serif text-[1.08em] font-normal italic leading-none tracking-[-0.02em]', className)}>
      {children}
    </span>
  )
}

export function StatusDot({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('relative inline-flex size-2 shrink-0', className)}>
      <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent" />
      <span className="relative size-2 rounded-full bg-accent" />
    </span>
  )
}

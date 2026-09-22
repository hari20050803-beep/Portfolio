import { useInView } from 'motion/react'
import { useRef } from 'react'
import { cn } from '../../lib/cn'

/** Slow, decorative ticker. Hidden from assistive tech; pauses off-screen. */
export function Marquee({ items, className }: { items: readonly string[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { margin: '120px 0px' })

  const group = (copy: number) => (
    <div className="flex shrink-0 items-center">
      {items.map((item) => (
        <span key={`${copy}-${item}`} className="flex items-center">
          <span className="px-[0.45em]">{item}</span>
          <span className="px-[0.5em] font-serif text-[0.32em] text-fog-700 [-webkit-text-stroke:0]">✦</span>
        </span>
      ))}
    </div>
  )

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        'relative flex overflow-hidden select-none [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]',
        className,
      )}
    >
      <div className="flex w-max animate-marquee will-change-transform" style={{ animationPlayState: visible ? 'running' : 'paused' }}>
        {group(0)}
        {group(1)}
      </div>
    </div>
  )
}

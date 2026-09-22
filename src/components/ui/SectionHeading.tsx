import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { EASE_OUT, inView } from '../../lib/motion'
import { Reveal, RevealLines } from './Reveal'

export function Eyebrow({
  index,
  label,
  as: Tag = 'p',
  id,
  className,
}: {
  index: string
  label: string
  as?: 'p' | 'h2'
  id?: string
  className?: string
}) {
  return (
    <Tag id={id} className={cn('eyebrow flex items-center gap-4 text-fog-300', className)}>
      <span className="text-fog-500">{index}</span>
      <motion.span
        aria-hidden="true"
        className="h-px w-10 origin-left bg-fog-600"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={inView}
        transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.1 }}
      />
      <span>{label}</span>
    </Tag>
  )
}

export const headingClass =
  'text-[clamp(2.75rem,6.6vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.045em] text-fog-50'

export function SectionHeading({
  index,
  label,
  id,
  title,
  description,
  className,
}: {
  index: string
  label: string
  id: string
  title: readonly ReactNode[]
  description?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('grid gap-y-10 lg:grid-cols-12', className)}>
      <div className="lg:col-span-3 lg:pt-4">
        <Eyebrow index={index} label={label} />
      </div>
      <div className="lg:col-span-9">
        <h2 id={id} className={headingClass}>
          <RevealLines lines={title} />
        </h2>
        {description && (
          <Reveal delay={0.25} className="mt-8 max-w-xl text-lg leading-relaxed text-fog-400">
            <p>{description}</p>
          </Reveal>
        )}
      </div>
    </header>
  )
}

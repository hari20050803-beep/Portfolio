import { BrainCircuit, Globe, GraduationCap, Smartphone, Workflow, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { services, type ServiceIcon } from '../../data/content'
import { cn } from '../../lib/cn'
import { EASE_OUT, inView } from '../../lib/motion'
import { Serif } from '../ui/Motifs'
import { RevealLines } from '../ui/Reveal'
import { Eyebrow, headingClass } from '../ui/SectionHeading'

const icons: Record<ServiceIcon, LucideIcon> = {
  ai: BrainCircuit,
  mobile: Smartphone,
  web: Globe,
  engineering: Workflow,
  learning: GraduationCap,
}

const pad = (n: number) => String(n).padStart(2, '0')

export function WhatIDo() {
  const [active, setActive] = useState(0)
  const rowsRef = useRef<Array<HTMLLIElement | null>>([])

  // The row crossing the middle of the viewport becomes the active one.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    rowsRef.current.forEach((row) => row && observer.observe(row))
    return () => observer.disconnect()
  }, [])

  const ActiveIcon = icons[services[active].icon]

  return (
    <section
      id="what-i-do"
      tabIndex={-1}
      aria-labelledby="what-title"
      className="relative py-[clamp(6rem,12vw,10rem)] outline-none"
    >
      <div className="shell grid gap-y-16 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+3.5rem)]">
            <Eyebrow index="05" label="What I Do" />
            <h2 id="what-title" className={cn(headingClass, 'mt-10')}>
              <RevealLines lines={['What I', <Serif key="d">do.</Serif>]} />
            </h2>

            <div aria-hidden="true" className="mt-14 hidden items-end gap-6 lg:flex">
              <div className="panel relative flex size-36 items-center justify-center overflow-hidden rounded-[1.5rem]">
                <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgb(155_179_214/0.18),transparent_70%)]" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={active}
                    initial={{ opacity: 0, y: 18, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -18, scale: 0.9 }}
                    transition={{ duration: 0.55, ease: EASE_OUT }}
                    className="relative"
                  >
                    <ActiveIcon className="size-14 text-fog-50" strokeWidth={1.1} />
                  </motion.span>
                </AnimatePresence>
              </div>
              <p className="font-mono text-sm text-fog-500 tabular-nums">
                <span className="text-fog-50">{pad(active + 1)}</span> / {pad(services.length)}
              </p>
            </div>
          </div>
        </div>

        <ol className="lg:col-span-7">
          {services.map((service, index) => {
            const Icon = icons[service.icon]
            const isActive = index === active
            return (
              <motion.li
                key={service.title}
                ref={(node) => {
                  rowsRef.current[index] = node
                }}
                data-index={index}
                data-active={isActive}
                onPointerEnter={() => setActive(index)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={inView}
                transition={{ duration: 1, ease: EASE_OUT }}
                className="group relative border-t border-white/[0.08] py-9 last:border-b md:py-11"
              >
                <div className="flex items-start gap-5 md:gap-8">
                  <span className="eyebrow pt-2.5 text-fog-600 transition-colors duration-500 group-data-[active=true]:text-accent">
                    {pad(index + 1)}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-[clamp(1.75rem,3.3vw,2.9rem)] leading-[1.05] font-medium tracking-[-0.035em] text-fog-400 transition-colors duration-700 group-data-[active=true]:text-fog-50">
                      {service.title}
                    </h3>
                    <p className="mt-4 max-w-lg leading-relaxed text-fog-500 transition-colors duration-700 group-data-[active=true]:text-fog-300">
                      {service.description}
                    </p>
                  </div>
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.3}
                    className="mt-1 size-7 shrink-0 text-fog-600 transition-colors duration-700 group-data-[active=true]:text-accent lg:hidden"
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-gradient-to-r from-accent/70 via-white/25 to-transparent transition-transform duration-1000 ease-cinematic group-data-[active=true]:scale-x-100"
                />
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

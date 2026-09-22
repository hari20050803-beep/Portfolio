import { motion } from 'motion/react'
import { stack } from '../../data/content'
import { EASE_OUT, inView, stagger } from '../../lib/motion'
import { Marquee } from '../ui/Marquee'
import { Serif } from '../ui/Motifs'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

const marqueeItems = stack.categories.flatMap((category) => category.items).filter((item) => item !== 'AI-assisted development')

const row = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE_OUT } },
}

const chip = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
}

export function TechStack() {
  return (
    <section
      id="stack"
      tabIndex={-1}
      aria-labelledby="stack-title"
      className="relative overflow-hidden py-[clamp(6rem,12vw,10rem)] outline-none"
    >
      <div className="shell">
        <SectionHeading
          index="02"
          label="Tech Stack"
          id="stack-title"
          title={[
            'Technologies',
            <>
              I <Serif>work with.</Serif>
            </>,
          ]}
          description="Technologies and tools I've worked with or am currently learning."
        />
      </div>

      <Marquee
        items={marqueeItems}
        className="text-outline mt-20 py-2 text-[clamp(3rem,8vw,7.5rem)] leading-none font-semibold tracking-[-0.04em] lg:mt-28"
      />

      <div className="shell mt-16 lg:mt-24">
        <motion.ul initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.09)}>
          {stack.categories.map((category, index) => (
            <motion.li
              key={category.title}
              variants={row}
              className="group relative grid gap-5 border-t border-white/[0.08] py-7 last:border-b md:grid-cols-12 md:items-center md:py-9"
            >
              <div className="flex items-baseline gap-5 md:col-span-4">
                <span className="eyebrow text-fog-600 transition-colors duration-500 group-hover:text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-2xl font-medium tracking-[-0.03em] text-fog-100 transition-transform duration-700 ease-cinematic group-hover:translate-x-2 md:text-[1.75rem]">
                  {category.title}
                </h3>
              </div>
              <motion.ul className="flex flex-wrap gap-2.5 md:col-span-8" variants={stagger(0.05, 0.15)}>
                {category.items.map((item) => (
                  <motion.li
                    key={item}
                    variants={chip}
                    className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-fog-300 transition-colors duration-500 group-hover:border-white/20 group-hover:text-fog-100"
                  >
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-gradient-to-r from-accent/70 via-white/25 to-transparent transition-transform duration-1000 ease-cinematic group-hover:scale-x-100"
              />
            </motion.li>
          ))}
        </motion.ul>

        <Reveal className="mt-10 flex flex-col gap-3 text-sm text-fog-500 md:flex-row md:items-baseline md:gap-8">
          <p className="eyebrow shrink-0 text-fog-500">Also used in my projects</p>
          <p className="text-fog-400">{stack.alsoUsed.join(' · ')}</p>
        </Reveal>
      </div>
    </section>
  )
}

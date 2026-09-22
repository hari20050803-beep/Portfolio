import { motion, useScroll, useTransform } from 'motion/react'
import { useRef, type PointerEvent } from 'react'
import portrait1120Avif from '../../assets/images/portrait-1120.avif'
import portrait1120Webp from '../../assets/images/portrait-1120.webp'
import portrait640Avif from '../../assets/images/portrait-640.avif'
import portrait640Webp from '../../assets/images/portrait-640.webp'
import portrait840Avif from '../../assets/images/portrait-840.avif'
import portrait840Webp from '../../assets/images/portrait-840.webp'
import { about } from '../../data/content'
import { profile } from '../../data/profile'
import { useReducedMotion } from '../../lib/hooks'
import { EASE_IN_OUT, EASE_OUT, inView, stagger } from '../../lib/motion'
import { Reveal } from '../ui/Reveal'
import { ScrollLitText } from '../ui/ScrollLitText'
import { Eyebrow } from '../ui/SectionHeading'

// The portrait column's rendered width at each breakpoint, so the browser always
// picks a file at least as sharp as the screen needs (never an upscaled one).
const sizes = [
  '(min-width: 1536px) 568px',
  '(min-width: 1280px) calc(41.7vw - 72px)',
  '(min-width: 1024px) calc(41.7vw - 58px)',
  '(min-width: 640px) 512px',
  '(min-width: 488px) 448px',
  'calc(100vw - 40px)',
].join(', ')
const avifSet = `${portrait640Avif} 640w, ${portrait840Avif} 840w, ${portrait1120Avif} 1120w`
const webpSet = `${portrait640Webp} 640w, ${portrait840Webp} 840w, ${portrait1120Webp} 1120w`

function Portrait() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // Parallax moves only the backlight behind the subject; the photo itself stays still and sharp.
  const lightY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  // A soft light that follows the pointer across the backdrop.
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`)
    event.currentTarget.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`)
  }

  return (
    // z-[45]: sits above the page's film-grain layer (z-40) so no noise lies over the face,
    // and below the fixed header (z-50).
    <motion.figure initial="hidden" whileInView="visible" viewport={inView} className="relative z-[45]">
      <motion.div
        ref={ref}
        onPointerMove={onPointerMove}
        className="group relative aspect-[4/5] overflow-hidden rounded-[6px] bg-ink-850 [--mx:50%] [--my:30%]"
        variants={{
          hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
          visible: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.6, ease: EASE_IN_OUT } },
        }}
      >
        {/* Studio backlight — background only, it never lies over the subject. */}
        <motion.div aria-hidden="true" className="absolute inset-x-0 -inset-y-[10%]" style={reduced ? undefined : { y: lightY }}>
          <div className="absolute inset-0 bg-[radial-gradient(70%_48%_at_50%_34%,rgb(155_179_214/0.26),transparent_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(36%_26%_at_51%_30%,rgb(255_255_255/0.1),transparent_70%)]" />
        </motion.div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_30%_at_var(--mx)_var(--my),rgb(255_255_255/0.08),transparent_70%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />

        {/* The photo: native resolution, exact 4:5 fit (no zoom, no crop), no filters or transforms. */}
        <picture>
          <source type="image/avif" srcSet={avifSet} sizes={sizes} />
          <img
            src={portrait1120Webp}
            srcSet={webpSet}
            sizes={sizes}
            width={1120}
            height={1400}
            loading="lazy"
            decoding="async"
            alt={`Portrait of ${profile.name} in a navy blazer`}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </picture>

        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/[0.07] ring-inset" />
      </motion.div>

      {/* Caption sits under the card so nothing covers the photo. */}
      <figcaption className="eyebrow mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="whitespace-nowrap text-fog-300">{profile.name}</span>
        <span className="whitespace-nowrap text-fog-500">{profile.location.coordinates}</span>
      </figcaption>
    </motion.figure>
  )
}

export function About() {
  return (
    <section
      id="about"
      tabIndex={-1}
      aria-labelledby="about-title"
      className="relative py-[clamp(7rem,14vw,12rem)] outline-none"
    >
      <div className="shell">
        <div className="grid gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-3 lg:pt-4">
            <Eyebrow as="h2" id="about-title" index="01" label="About" />
          </div>
          <div className="lg:col-span-9">
            <ScrollLitText
              text={about.statement}
              className="text-[clamp(1.85rem,3.9vw,3.6rem)] leading-[1.12] font-medium tracking-[-0.035em] text-fog-50"
            />
          </div>
        </div>

        <div className="mt-20 grid gap-14 lg:mt-28 lg:grid-cols-12 lg:gap-8">
          <div className="mx-auto w-full max-w-md sm:max-w-lg lg:col-span-5 lg:max-w-none">
            <Portrait />
          </div>

          <div className="flex flex-col justify-end lg:col-span-6 lg:col-start-7">
            <div className="space-y-6 text-lg leading-relaxed text-fog-300">
              {about.paragraphs.map((paragraph, index) => (
                <Reveal key={index} delay={index * 0.08}>
                  <p>{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <motion.dl
              className="mt-12 border-t border-white/[0.08]"
              initial="hidden"
              whileInView="visible"
              viewport={inView}
              variants={stagger(0.07, 0.1)}
            >
              {about.facts.map((fact) => (
                <motion.div
                  key={fact.label}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE_OUT } },
                  }}
                  className="grid grid-cols-[7.5rem_1fr] items-baseline gap-6 border-b border-white/[0.08] py-4 sm:grid-cols-[9rem_1fr]"
                >
                  <dt className="eyebrow text-fog-500">{fact.label}</dt>
                  <dd className="text-fog-100">{fact.value}</dd>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </div>
      </div>
    </section>
  )
}

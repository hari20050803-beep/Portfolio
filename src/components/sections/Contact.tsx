import { Mail, Phone } from 'lucide-react'
import { motion, useScroll } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { profile } from '../../data/profile'
import { EASE_OUT, inView, stagger } from '../../lib/motion'
import { GitHubIcon, LinkedInIcon } from '../ui/BrandIcons'
import { SwapArrow } from '../ui/Motifs'
import { Reveal, RevealLines } from '../ui/Reveal'
import { Eyebrow } from '../ui/SectionHeading'
import { ContactForm } from './ContactForm'
import { CopyButton } from './CopyButton'

const channelVariant = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } },
}

function Channel({
  label,
  value,
  href,
  icon,
  external = false,
  action,
}: {
  label: string
  value: string
  href: string
  icon: ReactNode
  external?: boolean
  action?: ReactNode
}) {
  return (
    <motion.li variants={channelVariant} className="flex items-center gap-4 border-b border-white/[0.08] py-5">
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group flex min-w-0 flex-1 items-center gap-4"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-fog-300 transition-colors duration-500 group-hover:border-white/30 group-hover:text-fog-50">
          {icon}
        </span>
        <span className="min-w-0">
          <span className="eyebrow block text-fog-500">{label}</span>
          <span className="mt-1 block truncate text-lg text-fog-100 transition-colors duration-500 group-hover:text-white">
            {value}
          </span>
        </span>
        <SwapArrow className="ml-auto text-fog-400 group-hover:text-fog-50" />
        {external && <span className="sr-only">(opens in a new tab)</span>}
      </a>
      {action}
    </motion.li>
  )
}

export function Contact() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.2'] })

  return (
    <section
      id="contact"
      ref={ref}
      tabIndex={-1}
      aria-labelledby="contact-title"
      className="relative overflow-hidden py-[clamp(7rem,14vw,12rem)] outline-none"
    >
      {/* The lights come up for the finale. */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: scrollYProgress }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_0%,rgb(155_179_214/0.13),transparent_70%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="shell relative">
        <Eyebrow index="06" label="Contact" />
        <h2
          id="contact-title"
          className="mt-10 text-[clamp(3rem,11.5vw,11.5rem)] leading-[0.86] font-semibold tracking-[-0.055em]"
        >
          <RevealLines lines={["LET'S BUILD", 'SOMETHING.']} lineClassName="text-metal" step={0.12} />
        </h2>
        <Reveal delay={0.2}>
          <p className="mt-10 max-w-lg text-xl leading-relaxed text-fog-300 md:text-2xl">
            Have an idea, opportunity, or project? Let&rsquo;s connect.
          </p>
        </Reveal>

        <div className="mt-20 grid gap-16 lg:mt-28 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <motion.ul
              className="border-t border-white/[0.08]"
              initial="hidden"
              whileInView="visible"
              viewport={inView}
              variants={stagger(0.08)}
              aria-label="Contact details"
            >
              <Channel
                label="Email"
                value={profile.email}
                href={`mailto:${profile.email}`}
                icon={<Mail aria-hidden="true" className="size-[18px]" strokeWidth={1.5} />}
                action={<CopyButton value={profile.email} label="Copy" />}
              />
              <Channel
                label="Phone"
                value={profile.phone.display}
                href={profile.phone.href}
                icon={<Phone aria-hidden="true" className="size-[18px]" strokeWidth={1.5} />}
              />
              <Channel
                label="LinkedIn"
                value="linkedin.com/in/harenthira"
                href={profile.links.linkedin}
                external
                icon={<LinkedInIcon size={17} />}
              />
              {profile.links.github && (
                <Channel
                  label="GitHub"
                  value={profile.links.github.replace(/^https?:\/\/(www\.)?/, '')}
                  href={profile.links.github}
                  external
                  icon={<GitHubIcon size={17} />}
                />
              )}
            </motion.ul>
            <Reveal delay={0.3} className="mt-8">
              <p className="text-sm leading-relaxed text-fog-500">
                Based in {profile.location.city}, {profile.location.country} ({profile.location.utcOffset}). Open to
                internships and software engineering opportunities.
              </p>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-7">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

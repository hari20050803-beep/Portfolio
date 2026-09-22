import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { navigation } from '../../data/content'
import { profile } from '../../data/profile'
import { useReducedMotion, useZonedTime } from '../../lib/hooks'
import { Link } from '../../lib/navigation'
import { useNavigation } from '../../lib/router'
import { scrollToTarget, useLenis } from '../../lib/scroll'
import { GitHubIcon, LinkedInIcon } from '../ui/BrandIcons'
import { Magnetic } from '../ui/Magnetic'
import { RollText, SwapArrow } from '../ui/Motifs'

const footerNav = [...navigation, { id: 'contact', label: 'Contact' }]

export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const lenis = useLenis()
  const { route, navigate } = useNavigation()
  const reduced = useReducedMotion()
  const time = useZonedTime(profile.location.timeZone)
  const year = new Date().getFullYear()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const wordmarkY = useTransform(scrollYProgress, [0, 1], ['35%', '0%'])

  const backToTop = () => {
    if (route.name === 'home') scrollToTarget(lenis, 0, { immediate: reduced })
    else navigate('/')
  }

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-white/[0.06] bg-ink-950">
      <div className="shell pt-20 pb-10 lg:pt-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-xl font-semibold tracking-[0.14em] text-fog-50">{profile.name.toUpperCase()}</p>
            <p className="mt-4 max-w-xs leading-relaxed text-fog-400">
              {profile.roles.join(' • ')}
            </p>
            <p className="mt-2 text-fog-500">
              {profile.location.city}, {profile.location.country}
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <p className="eyebrow text-fog-500">Index</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-1">
              {footerNav.map((item) => (
                <li key={item.id}>
                  <Link to={`/#${item.id}`} className="group inline-flex text-fog-300 transition-colors hover:text-fog-50">
                    <RollText>{item.label}</RollText>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className="eyebrow text-fog-500">Connect</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href={profile.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 text-fog-300 transition-colors hover:text-fog-50"
                >
                  <LinkedInIcon size={15} />
                  <RollText>LinkedIn</RollText>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
              {profile.links.github && (
                <li>
                  <a
                    href={profile.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-fog-300 transition-colors hover:text-fog-50"
                  >
                    <GitHubIcon size={15} />
                    <RollText>GitHub</RollText>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              )}
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="group inline-flex text-fog-300 transition-colors hover:text-fog-50"
                >
                  <RollText>Email</RollText>
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-between gap-8 md:col-span-2 md:items-end md:text-right">
            <div>
              <p className="eyebrow text-fog-500">Local time</p>
              <p className="mt-5 text-sm text-fog-300">
                <span className="text-fog-50 tabular-nums">{time}</span> · {profile.location.city} ({profile.location.utcOffset})
              </p>
            </div>
            <Magnetic>
              <button
                type="button"
                onClick={backToTop}
                className="group inline-flex h-11 items-center gap-3 rounded-full border border-white/15 px-5 text-sm text-fog-100 transition-colors duration-500 hover:border-white/35 hover:bg-white/[0.04]"
              >
                <RollText>Back to top</RollText>
                <span className="-rotate-90">
                  <SwapArrow direction="right" />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none select-none">
        <motion.p
          style={reduced ? undefined : { y: wordmarkY }}
          className="text-center text-[clamp(1.5rem,7.6vw,9.25rem)] leading-[0.8] font-semibold tracking-[-0.055em] whitespace-nowrap [background-image:linear-gradient(180deg,rgb(255_255_255/0.13),rgb(255_255_255/0.015)_85%)] bg-clip-text text-transparent"
        >
          {profile.name.toUpperCase()}
        </motion.p>
      </div>

      <div className="shell">
        <div className="flex flex-col gap-2 border-t border-white/[0.06] py-6 text-xs text-fog-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {profile.name}</p>
          <p>Built with React, TypeScript, Tailwind CSS &amp; Motion</p>
        </div>
      </div>
    </footer>
  )
}

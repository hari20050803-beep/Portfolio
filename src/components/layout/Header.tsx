import { motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { navigation } from '../../data/content'
import { profile } from '../../data/profile'
import { cn } from '../../lib/cn'
import { useActiveSection } from '../../lib/hooks'
import { EASE_OUT } from '../../lib/motion'
import { Link } from '../../lib/navigation'
import { useNavigation } from '../../lib/router'
import { useLenis } from '../../lib/scroll'
import { RollText, SwapArrow } from '../ui/Motifs'
import { MobileMenu } from './MobileMenu'

const sectionIds = ['top', ...navigation.map((item) => item.id), 'contact']

export function Header() {
  const { route, ready } = useNavigation()
  const lenis = useLenis()
  const isHome = route.name === 'home'
  const active = useActiveSection(isHome ? sectionIds : [])

  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(y > 40)
    if (y < 480) setHidden(false)
    else if (y > previous + 4) setHidden(true)
    else if (y < previous - 4) setHidden(false)
  })

  const openMenu = () => {
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    setMenuOpen(true)
  }

  const closeMenu = useCallback(
    (restoreFocus = true) => {
      document.documentElement.style.overflow = ''
      lenis?.start()
      setMenuOpen(false)
      if (restoreFocus) menuButtonRef.current?.focus()
    },
    [lenis],
  )

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ opacity: 0, y: -16 }}
        animate={ready ? { opacity: 1, y: hidden && !menuOpen ? '-110%' : '0%' } : { opacity: 0, y: -16 }}
        transition={{ duration: ready && !scrolled ? 1.1 : 0.6, ease: EASE_OUT, delay: ready && !scrolled ? 0.6 : 0 }}
      >
        <div className="shell">
          <div
            className={cn(
              'mt-3 flex h-14 items-center justify-between rounded-full border pr-2 pl-5 transition-[background-color,border-color,backdrop-filter,box-shadow] duration-700 ease-cinematic lg:mt-4',
              scrolled
                ? 'border-white/[0.08] bg-ink-900/60 shadow-[0_20px_40px_-24px_rgb(0_0_0/0.8)] backdrop-blur-xl backdrop-saturate-150'
                : 'border-transparent bg-transparent',
            )}
          >
            <Link
              to="/"
              className="group flex items-center gap-2 text-[clamp(0.625rem,2.9vw,0.9375rem)] font-semibold tracking-[0.08em] whitespace-nowrap text-fog-50 min-[400px]:tracking-[0.14em] sm:tracking-[0.18em]"
              aria-label={`${profile.name}, home`}
            >
              <RollText>{profile.name.toUpperCase()}</RollText>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            </Link>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {navigation.map((item) => {
                  const isActive = active === item.id
                  return (
                    <li key={item.id}>
                      <Link
                        to={`/#${item.id}`}
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(
                          'group relative flex h-10 items-center px-4 text-sm transition-colors duration-500',
                          isActive ? 'text-fog-50' : 'text-fog-400 hover:text-fog-50',
                        )}
                      >
                        <RollText>{item.label}</RollText>
                        {isActive && (
                          <motion.span
                            layoutId="nav-indicator"
                            aria-hidden="true"
                            className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/#contact"
                className="group hidden h-10 items-center gap-2.5 rounded-full border border-white/15 px-4 text-sm text-fog-100 transition-colors duration-500 hover:border-white/35 hover:bg-white/[0.04] sm:inline-flex"
              >
                <RollText>Let&rsquo;s talk</RollText>
                <SwapArrow />
              </Link>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={openMenu}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className="group inline-flex h-10 items-center gap-3 rounded-full px-4 text-sm text-fog-100 lg:hidden"
              >
                <span className="max-[359px]:sr-only">
                  <RollText>Menu</RollText>
                </span>
                <span aria-hidden="true" className="flex w-4 flex-col gap-[5px]">
                  <span className="h-px w-full bg-current" />
                  <span className="h-px w-2/3 bg-current transition-[width] duration-500 group-hover:w-full" />
                </span>
              </button>
            </div>
          </div>
        </div>
        {isHome && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-accent/0 via-accent/70 to-white/60"
            style={{ scaleX: progress }}
          />
        )}
      </motion.header>

      <MobileMenu open={menuOpen} onClose={closeMenu} active={active} />
    </>
  )
}

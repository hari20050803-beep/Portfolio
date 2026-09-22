import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { navigation } from '../../data/content'
import { profile } from '../../data/profile'
import { cn } from '../../lib/cn'
import { EASE_IN_OUT, EASE_OUT } from '../../lib/motion'
import { Link } from '../../lib/navigation'
import { LinkedInIcon, GitHubIcon } from '../ui/BrandIcons'

const items = [...navigation, { id: 'contact', label: 'Contact' }] as const

export function MobileMenu({
  open,
  onClose,
  active,
}: {
  open: boolean
  onClose: (restoreFocus?: boolean) => void
  active: string | null
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Keep keyboard focus inside the open menu.
  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          onKeyDown={trapFocus}
          className="fixed inset-0 z-[60] flex flex-col bg-ink-950/95 backdrop-blur-2xl lg:hidden"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.8, ease: EASE_IN_OUT }}
        >
          <div className="shell flex h-[4.25rem] items-center justify-between pt-3">
            <span className="pl-5 text-[clamp(0.625rem,2.9vw,0.9375rem)] font-semibold tracking-[0.08em] whitespace-nowrap text-fog-50 min-[400px]:tracking-[0.14em] sm:tracking-[0.18em]">
              {profile.name.toUpperCase()}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => onClose()}
              className="mr-2 inline-flex h-10 items-center gap-3 rounded-full px-4 text-sm text-fog-100"
            >
              <span className="max-[359px]:sr-only">Close</span>
              <span aria-hidden="true" className="relative size-4">
                <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-current" />
                <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <nav aria-label="Mobile" className="shell mt-10 flex-1">
            <ul className="flex flex-col">
              {items.map((item, index) => (
                <li key={item.id} className="line-mask border-b border-white/[0.06]">
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.25 + index * 0.06 }}
                  >
                    <Link
                      to={`/#${item.id}`}
                      onClick={() => onClose(false)}
                      className={cn(
                        'flex items-baseline justify-between py-4 text-[clamp(2rem,9vw,3.25rem)] font-medium tracking-[-0.04em] transition-colors',
                        active === item.id ? 'text-fog-50' : 'text-fog-300 active:text-fog-50',
                      )}
                    >
                      {item.label}
                      <span className="eyebrow text-fog-600">0{index + 1}</span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="shell flex flex-col gap-4 pb-[max(2rem,env(safe-area-inset-bottom))] text-sm text-fog-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a href={`mailto:${profile.email}`} className="text-fog-100">
              {profile.email}
            </a>
            <div className="flex items-center gap-5">
              <a href={profile.phone.href}>{profile.phone.display}</a>
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in a new tab)">
                <LinkedInIcon />
              </a>
              {profile.links.github && (
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in a new tab)">
                  <GitHubIcon />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

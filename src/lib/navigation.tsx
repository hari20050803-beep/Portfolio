import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react'
import { useReducedMotion } from './hooks'
import {
  appPath,
  curtainLabelFor,
  NavigationContext,
  parseRoute,
  routeKey,
  useNavigation,
  withBase,
  type CurtainLabel,
  type Phase,
  type Route,
} from './router'
import { scrollToTarget, useLenis } from './scroll'

interface HistoryState {
  idx: number
  scrollY: number
}

interface Pending {
  href: string
  mode: 'push' | 'pop'
  scrollY: number
}

const INTRO_KEY = 'harenthira:intro-seen'

function readHistoryState(): HistoryState | null {
  const state = window.history.state as Partial<HistoryState> | null
  return state && typeof state.idx === 'number' ? { idx: state.idx, scrollY: state.scrollY ?? 0 } : null
}

function rememberScroll() {
  const state = readHistoryState() ?? { idx: 0, scrollY: 0 }
  window.history.replaceState({ ...state, scrollY: window.scrollY } satisfies HistoryState, '')
}

/**
 * A small client router for the portfolio's routes that sequences every route
 * change as a cinematic curtain: cover the page → swap route & scroll position
 * → reveal. Users who prefer reduced motion get instant, curtain-free changes.
 */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const lenis = useLenis()
  const reduced = useReducedMotion()

  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname))
  const [phase, setPhase] = useState<Phase>(() => (reduced ? 'idle' : 'intro'))
  const [label, setLabel] = useState<CurtainLabel | null>(null)
  const [commitId, setCommitId] = useState(0)
  const [introVariant] = useState<'full' | 'short'>(() => {
    try {
      return window.sessionStorage.getItem(INTRO_KEY) ? 'short' : 'full'
    } catch {
      return 'full'
    }
  })

  const phaseRef = useRef(phase)
  const routeRef = useRef(route)
  const lenisRef = useRef(lenis)
  const reducedRef = useRef(reduced)
  const pendingRef = useRef<Pending | null>(null)
  const afterCommitRef = useRef<{ hash: string; scrollY: number } | null>(null)

  useLayoutEffect(() => {
    phaseRef.current = phase
    routeRef.current = route
    lenisRef.current = lenis
    reducedRef.current = reduced
  })

  const scrollToHash = useCallback((hash: string, immediate: boolean) => {
    const id = decodeURIComponent(hash.replace(/^#/, ''))
    const element = id ? document.getElementById(id) : null
    if (!element) return false
    scrollToTarget(lenisRef.current, element, { immediate })
    element.focus({ preventScroll: true })
    return true
  }, [])

  const commit = useCallback((pending: Pending) => {
    const url = new URL(pending.href, window.location.href)
    if (pending.mode === 'push') {
      const idx = (readHistoryState()?.idx ?? 0) + 1
      window.history.pushState({ idx, scrollY: 0 } satisfies HistoryState, '', pending.href)
    }
    afterCommitRef.current = { hash: url.hash, scrollY: pending.scrollY }
    setRoute(parseRoute(url.pathname))
    setCommitId((id) => id + 1)
  }, [])

  // Runs after the new route has rendered (while the curtain still covers it).
  useLayoutEffect(() => {
    const job = afterCommitRef.current
    if (!job) return
    afterCommitRef.current = null
    const scrolledToHash = job.hash ? scrollToHash(job.hash, true) : false
    if (!scrolledToHash) {
      scrollToTarget(lenisRef.current, job.scrollY, { immediate: true })
      document.querySelector<HTMLElement>('[data-page-focus]')?.focus({ preventScroll: true })
    }
    if (!reducedRef.current) setPhase('reveal')
  }, [commitId, scrollToHash])

  const navigate = useCallback(
    (to: string) => {
      const url = new URL(withBase(to), window.location.href)
      if (url.origin !== window.location.origin) {
        window.location.assign(url.href)
        return
      }
      if (appPath(url.pathname) === appPath(window.location.pathname)) {
        if (url.hash) scrollToHash(url.hash, reducedRef.current)
        else scrollToTarget(lenisRef.current, 0, { immediate: reducedRef.current })
        return
      }
      if (phaseRef.current !== 'idle') return
      rememberScroll()
      const pending: Pending = { href: url.pathname + url.search + url.hash, mode: 'push', scrollY: 0 }
      if (reducedRef.current) {
        commit(pending)
        return
      }
      pendingRef.current = pending
      setLabel(curtainLabelFor(url))
      setPhase('cover')
    },
    [commit, scrollToHash],
  )

  const onCovered = useCallback(() => {
    if (phaseRef.current === 'intro') {
      try {
        window.sessionStorage.setItem(INTRO_KEY, '1')
      } catch {
        /* storage unavailable: the full intro simply plays again next time */
      }
      if (window.location.hash) scrollToHash(window.location.hash, true)
      setPhase('reveal')
      return
    }
    const pending = pendingRef.current
    pendingRef.current = null
    if (pending) commit(pending)
    else setPhase('reveal')
  }, [commit, scrollToHash])

  const onRevealed = useCallback(() => setPhase('idle'), [])

  // Browser back / forward.
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const href = window.location.pathname + window.location.search + window.location.hash
      const url = new URL(href, window.location.href)
      if (routeKey(parseRoute(url.pathname)) === routeKey(routeRef.current)) {
        if (url.hash) scrollToHash(url.hash, reducedRef.current)
        return
      }
      const state = event.state as Partial<HistoryState> | null
      const pending: Pending = { href, mode: 'pop', scrollY: state?.scrollY ?? 0 }
      if (reducedRef.current || phaseRef.current === 'reveal') {
        commit(pending)
        return
      }
      pendingRef.current = pending
      if (phaseRef.current === 'idle') {
        setLabel(curtainLabelFor(url))
        setPhase('cover')
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [commit, scrollToHash])

  // Initial setup: manual scroll restoration + an initial history entry.
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    if (!readHistoryState()) window.history.replaceState({ idx: 0, scrollY: 0 } satisfies HistoryState, '')
    if (reducedRef.current && window.location.hash) scrollToHash(window.location.hash, true)
  }, [scrollToHash])

  // Freeze scrolling while the curtain is closed.
  useEffect(() => {
    if (!lenis) return
    if (phase === 'intro' || phase === 'cover') lenis.stop()
    else lenis.start()
  }, [lenis, phase])

  const value = useMemo(
    () => ({
      route,
      phase,
      ready: phase === 'reveal' || phase === 'idle',
      label,
      introVariant,
      navigate,
      onCovered,
      onRevealed,
    }),
    [route, phase, label, introVariant, navigate, onCovered, onRevealed],
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: string }

/** Internal link: plain `<a href>` for crawlers and new tabs, curtain transition on click. */
export function Link({ to, onClick, target, ...rest }: LinkProps) {
  const { navigate } = useNavigation()
  return (
    <a
      {...rest}
      href={withBase(to)}
      target={target}
      onClick={(event) => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          (target && target !== '_self')
        )
          return
        event.preventDefault()
        navigate(to)
      }}
    />
  )
}

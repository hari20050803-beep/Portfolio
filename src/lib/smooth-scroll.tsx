import Lenis from 'lenis'
import { useEffect, useState, type ReactNode } from 'react'
import { useReducedMotion } from './hooks'
import { LenisContext } from './scroll'

/**
 * Smooth scrolling with Lenis. Disabled entirely for users who prefer reduced
 * motion, so they keep the browser's native scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return
    const instance = new Lenis({ autoRaf: true, lerp: 0.09, smoothWheel: true })
    // Lenis is an external system; consumers need the instance once it exists.
    // oxlint-disable-next-line react/set-state-in-effect
    setLenis(instance)
    return () => {
      instance.destroy()
      setLenis(null)
    }
  }, [reduced])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

import type Lenis from 'lenis'
import { createContext, useContext } from 'react'

export const LenisContext = createContext<Lenis | null>(null)

export const useLenis = () => useContext(LenisContext)

const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2)

/** Scrolls with Lenis when it is running, otherwise with the native scroll. */
export function scrollToTarget(
  lenis: Lenis | null,
  target: HTMLElement | number,
  { immediate = false, offset = 0 }: { immediate?: boolean; offset?: number } = {},
) {
  if (lenis) {
    // Page content may have just changed (route swap); make sure the scroll limit is current.
    lenis.resize()
    lenis.scrollTo(
      target,
      immediate ? { immediate: true, force: true, offset } : { duration: 1.5, easing: easeInOutQuart, offset },
    )
    return
  }
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + offset
  window.scrollTo({ top, behavior: 'auto' })
}

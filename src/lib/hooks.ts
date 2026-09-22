import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** True on devices with a precise, hover-capable pointer (mouse / trackpad). */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

/** Enables the sticky, scroll-driven layouts. Mirrors the `stack:` CSS variant. */
export const useStackLayout = () => useMediaQuery('(min-width: 64rem) and (min-height: 47.5rem)')

export function useDocumentMeta(meta: { title: string; description: string }) {
  useEffect(() => {
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description)
  }, [meta.title, meta.description])
}

/** Id of the section crossing the middle of the viewport. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join(',')
  useEffect(() => {
    if (!key) return
    const elements = key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-48% 0px -51% 0px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [key])
  return key ? active : null
}

/** Current time in a given IANA time zone, refreshed every 20 seconds. */
export function useZonedTime(timeZone: string) {
  const format = useCallback(
    () =>
      new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(
        new Date(),
      ),
    [timeZone],
  )
  const [time, setTime] = useState(format)
  useEffect(() => {
    const id = window.setInterval(() => setTime(format()), 20_000)
    return () => window.clearInterval(id)
  }, [format])
  return time
}

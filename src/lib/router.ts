import { createContext, useContext } from 'react'
import { navigation } from '../data/content'
import { getProject } from '../data/projects'

export type Route = { name: 'home' } | { name: 'project'; slug: string } | { name: 'not-found' }

/**
 * intro  – first paint, curtain covers the page while the title card plays
 * cover  – curtain is closing over the current page before a route change
 * reveal – curtain is lifting off the new page (entrance animations run)
 * idle   – no transition in progress
 */
export type Phase = 'intro' | 'cover' | 'reveal' | 'idle'

export interface CurtainLabel {
  kicker: string
  title: string
}

export interface NavigationValue {
  route: Route
  phase: Phase
  /** True once the page is (being) revealed; entrance animations wait for it. */
  ready: boolean
  label: CurtainLabel | null
  introVariant: 'full' | 'short'
  navigate: (to: string) => void
  onCovered: () => void
  onRevealed: () => void
}

export const NavigationContext = createContext<NavigationValue | null>(null)

export function useNavigation() {
  const value = useContext(NavigationContext)
  if (!value) throw new Error('useNavigation must be used inside <NavigationProvider>')
  return value
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Prefixes an app path (e.g. `/work/x`) with the deployment base path. */
export const withBase = (path: string) => (path.startsWith('/') ? `${BASE}${path}` : path)

export function appPath(pathname: string) {
  let path = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname
  path = path.replace(/\/index\.html$/, '/').replace(/\/+$/, '')
  return path || '/'
}

export function parseRoute(pathname: string): Route {
  const path = appPath(pathname)
  if (path === '/') return { name: 'home' }
  const match = /^\/work\/([a-z0-9-]+)$/.exec(path)
  if (match && getProject(match[1])) return { name: 'project', slug: match[1] }
  return { name: 'not-found' }
}

export const routeKey = (route: Route) => (route.name === 'project' ? `project:${route.slug}` : route.name)

const sectionLabels: Record<string, string> = {
  ...Object.fromEntries(navigation.map((item) => [item.id, item.label])),
  work: 'Selected work',
  contact: 'Contact',
}

export function curtainLabelFor(url: URL): CurtainLabel {
  const route = parseRoute(url.pathname)
  if (route.name === 'project') {
    const project = getProject(route.slug)
    return { kicker: `Case study ${project?.number ?? ''}`.trim(), title: project?.title ?? '' }
  }
  if (route.name === 'home') {
    return { kicker: 'Back to', title: sectionLabels[url.hash.slice(1)] ?? 'Home' }
  }
  return { kicker: 'Error 404', title: 'Page not found' }
}

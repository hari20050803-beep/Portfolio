export interface Profile {
  name: string
  displayName: string
  roles: readonly string[]
  tagline: string
  location: {
    city: string
    country: string
    coordinates: string
    timeZone: string
    utcOffset: string
  }
  email: string
  phone: { display: string; href: string }
  links: {
    linkedin: string
    /** Leave undefined until a real GitHub profile URL is available. */
    github?: string
  }
}

export interface ArchitectureNode {
  name: string
  detail: string
  role: string
}

export interface Project {
  slug: string
  number: string
  title: string
  /** Secondary title line, shown in the editorial serif. */
  subtitle?: string
  /** The academic assessment this project was built for, e.g. "SOC — Main Assessment". */
  assessment: string
  /** Module code and title, e.g. "CSE5013 Service Oriented Computing". */
  module: string
  /** Marks the headline project. */
  featured?: boolean
  type: string
  platform: string
  /** Frame used around the project screenshot. */
  device: 'phone' | 'browser' | 'desktop'
  /** One or two sentences, used on the card and as the case-study meta description. */
  summary: string
  overview: readonly string[]
  tech: readonly string[]
  /** Features shown on the project card. */
  highlights: readonly string[]
  featureGroups: readonly { title: string; items: readonly string[] }[]
  architecture: {
    kind: 'flow' | 'layers'
    title: string
    nodes: readonly ArchitectureNode[]
  }
  /** Verified implementation details (or OOP concepts) shown on the case study. */
  engineering: {
    title: string
    points: readonly { label: string; detail: string }[]
  }
  /**
   * The project's real GitHub repository. The GitHub button is only shown when the
   * repository is public, so visitors never land on a 404 page.
   */
  repo?: { url: string; visibility: 'public' | 'private' }
  /** Only set when a real live URL exists. */
  liveUrl?: string
}

export interface PageMeta {
  title: string
  description: string
}

export const seo = {
  siteName: 'Harenthira Ravishangar',
  home: {
    title: 'Harenthira Ravishangar — Software Engineering Student · AI & Software Developer',
    description:
      'Portfolio of Harenthira Ravishangar, a Software Engineering student from Jaffna, Sri Lanka, building mobile, web and AI-powered applications.',
  },
  notFound: {
    title: 'Page not found — Harenthira Ravishangar',
    description: 'This page does not exist. Head back to the portfolio of Harenthira Ravishangar.',
  },
} satisfies Record<string, unknown>

export function projectMeta(project: { title: string; summary: string }): PageMeta {
  return {
    title: `${project.title} — Case study · Harenthira Ravishangar`,
    description: project.summary,
  }
}

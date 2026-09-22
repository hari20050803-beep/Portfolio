# Harenthira Ravishangar — Portfolio

Personal portfolio of **Harenthira Ravishangar**, Software Engineering Student and AI & Software Developer based in Jaffna, Sri Lanka.

A dark, cinematic single-page experience with case-study pages for three academic software engineering projects:

| Project | Assessment | Stack |
|---|---|---|
| **KMC Event Platform** | SOC main assessment (CSE5013) | ASP.NET MVC 5 · Web API 2 · Entity Framework 6 · SQL Server |
| **Learnova AI** | Final-year project (CSE5015) | Flutter · Dart · Firebase · Gemini 2.5 Flash |
| **Cupcake Management System** | OOP assessment (CSE4006) | Java 21 · Java Swing · MySQL · JDBC · [source](https://github.com/hari20050803-beep/Cupcake-Management-System) |

## Built with

- **React 19** and **TypeScript**, bundled with **Vite**
- **Tailwind CSS v4** for styling
- **Motion** for reveal, parallax and page-transition animations
- **Lenis** for smooth scrolling
- A hand-written **WebGL** "signal field" in the hero (no Three.js)
- Self-hosted fonts: Geist, Geist Mono and Instrument Serif

## Features

- Cinematic intro, curtain page transitions and scroll-driven reveals
- Real case-study pages at `/work/<project>`, each pre-rendered with its own title and description for SEO
- Sticky, stacking project cards on desktop and a clean single-column flow on mobile
- Custom cursor, magnetic buttons and a cursor-lit hero, all switched off for touch devices
- Full `prefers-reduced-motion` support: no smooth scrolling, no parallax and a static hero
- Accessible navigation: skip link, focus management on page change, keyboard-friendly mobile menu
- Contact form that opens the visitor's email app pre-filled (there is no backend)

## Getting started

Requires Node.js 20 or later.

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
npm run lint       # oxlint
```

### Deploying

`dist/` is a static site that works on any host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). Every case-study route is written as its own `index.html`, plus a `404.html`, so deep links work without server rewrites.

Set `SITE_URL` when building to emit absolute social-preview image URLs, canonical links, `sitemap.xml` and `robots.txt`:

```bash
SITE_URL=https://your-domain.com npm run build
```

## Editing the content

All text lives in `src/data/`:

| File | Contents |
|---|---|
| `profile.ts` | Name, roles, contact details, social links |
| `content.ts` | About, tech stack, journey, what-I-do copy, navigation |
| `projects.ts` | Project case studies (a GitHub button appears for public repositories) |
| `projectMedia.ts` | The screenshot shown for each project |
| `seo.ts` | Page titles and meta descriptions |

## License

© Harenthira Ravishangar. The source is shared for reference; the personal content, photos and project screenshots are not licensed for reuse.

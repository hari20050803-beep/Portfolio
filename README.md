# Ravishangar Harenthira: Portfolio

A cinematic developer portfolio with a moving 3D world behind the whole page: an original floating katana and metal fragments, drifting fog, embers, light rays, and a final scene at Contact. Built with React, TypeScript, Vite and Three.js.

## Install and run

You need [Node.js](https://nodejs.org) 20.19 or newer. Open a terminal in this `portfolio` folder, then run:

```bash
npm install
```

```bash
npm run dev
```

Open the address it prints, usually http://localhost:5173.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server with live reload. |
| `npm run build` | Type-checks, builds and prerenders the site into `dist/`. |
| `npm run preview` | Serves the built `dist/` folder so you can check it before deploying. |
| `npm run typecheck` | Runs the TypeScript checks only. |
| `npm run images` | Regenerates the portrait crops (from `../source/photo.jpg`) and the favicon sizes. |
| `npm run poster` | Re-renders the fallback artwork and social image from the live scene. See below. |
| `npm run deploy` | Publishes the built `dist/` folder to GitHub Pages. See Deploying. |

## Where to edit your details

| You want to change | Edit this file |
| --- | --- |
| **Email, phone, GitHub, LinkedIn, CV, photo, site address** | `contact.config.ts` |
| Any text on the page: hero, about, experience, projects, skills, education | `src/content/portfolio.ts` |
| Colours, fonts and spacing | `src/styles/tokens.css` |
| Page title, search description and social tags | `index.html` |
| The 3D scene | `src/scene/` |

To hide a contact detail, set it to `enabled: false` in `contact.config.ts` and rebuild. It then disappears from the built site completely.

**If you push this project to a public repository, everything in `contact.config.ts` is public**, including your phone number, even if you've hidden it on the site.

### Your CV

The Download CV button (header, phone menu and Contact section) serves `public/Ravishangar-Harenthira-CV.pdf`. Its size is read from the file when you build.

- **To update your CV:** replace that file with the new PDF, keeping the same name, and rebuild.
- **To remove it:** set `cv.enabled` to `false` in `contact.config.ts` and delete the file from `public/`.

### Projects: links, descriptions and images

Each project in `src/content/portfolio.ts` has a short `description` (taken from its GitHub README), a `repository` link, and a `media` entry for the image beside it.

- **Images** live in `public/images/projects`, two sizes each: `<name>-560.webp` and `<name>-1120.webp`, cropped to 16:10. The KMC and Cupcake Shop images are screenshots from their repositories, and Learnova uses its logo because its repository has no app screenshots yet.
- **To change an image,** replace both files with the same names, or add new ones and point `media.image` at the new name.
- **No image?** Use `media: { kind: 'waveform' }` to show a drawing instead, as FRIDAY does.
- **No public repository?** Leave out `repository` and the card says "No public repository" instead of showing a button.

## How the page is put together

```
contact.config.ts      Contact details, CV and site settings (read at build time)
index.html             SEO tags, favicon links, fonts to preload
public/                Fonts, images, icons and your CV, served as-is
scripts/               Image and artwork generators, and the prerender step
src/
  content/portfolio.ts All the text on the site
  components/
    hero/              The opening screen
    layout/            Header and footer
    scene/             Loads the 3D backdrop and its fallback
    sections/          One file per section
    ui/                Headings, icons, CV link and other small shared pieces
  scene/               The Three.js scene, built entirely in code
  lib/                 Scroll effects, pointer tracking and device checks
  styles/              CSS, split by area
```

UI animation uses a small custom layer (`src/lib/motion.ts` plus CSS) rather than an animation library. It keeps the prerendered content visible if scripts fail and saves roughly 40 KB.

## Performance and accessibility

- The page is prerendered at build time, so text appears before any JavaScript runs and search engines can read it.
- The 3D code is a separate download that starts once the page has settled. Sections below the hero load their JavaScript separately too, and images load lazily.
- The scene stops drawing when the tab is hidden, and draws at half rate behind the page content. If a device can't keep up, it lowers its quality and then switches to the fallback.
- **Fallback:** when WebGL is unavailable, on low-memory devices and in data-saver mode, you get still artwork with fog, embers and light rays animated in CSS.
- **Reduced motion:** if the visitor's system asks for reduced motion, everything stays still. On Windows that setting is under Accessibility > Visual effects > Animation effects.
- Full keyboard navigation, visible focus states, a skip link, and a pause button for the background.

To preview the fallback or force the scene on, add `?scene=static` or `?scene=webgl` to the address.

## If you change the 3D scene

The fallback artwork is a set of screenshots of the live scene, so it needs refreshing to match. Build and serve the site:

```bash
npm run build
```

```bash
npm run preview -- --port 5192
```

Then, in a second terminal (needs Chrome or Edge installed):

```bash
npm run poster
```

## Deploying

The site is published on GitHub Pages at **https://hari20050803-beep.github.io/**, from the repository `hari20050803-beep.github.io`. To publish your latest changes:

```bash
npm run build
```

```bash
npm run deploy
```

The first deploy opens a GitHub sign-in window. The live site updates a minute or two after the push.

To host somewhere else instead (Netlify, Vercel, Cloudflare Pages), upload the `dist/` folder and change `siteUrl` in `contact.config.ts` to the new address so social share previews work.

If the site won't be at the root of its domain (for example `username.github.io/portfolio/`), set `base: '/portfolio/'` in `vite.config.ts` before building.

## Dependencies

- **Runtime:** React, React DOM, Three.js
- **Build:** Vite, TypeScript, @vitejs/plugin-react
- **Asset scripts only:** sharp, playwright-core

## Credits

- Fonts: [Shippori Mincho](https://fonts.google.com/specimen/Shippori+Mincho) and [Inter](https://rsms.me/inter/), both under the SIL Open Font License
- Icons adapted from [Lucide](https://lucide.dev) (ISC licence)
- The 3D scene, project illustrations and favicon are original and generated in this project's code

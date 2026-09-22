import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { projects } from './src/data/projects.ts'
import { projectMeta, seo, type PageMeta } from './src/data/seo.ts'

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function setMetaContent(html: string, selector: RegExp, value: string) {
  return html.replace(selector, (_match, start: string, end: string) => `${start}${escapeAttr(value)}${end}`)
}

function applyPageMeta(html: string, meta: PageMeta, url?: string) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeAttr(meta.title)}</title>`)
  out = setMetaContent(out, /(<meta name="description" content=")[^"]*(")/, meta.description)
  out = setMetaContent(out, /(<meta property="og:title" content=")[^"]*(")/, meta.title)
  out = setMetaContent(out, /(<meta property="og:description" content=")[^"]*(")/, meta.description)
  out = setMetaContent(out, /(<meta name="twitter:title" content=")[^"]*(")/, meta.title)
  out = setMetaContent(out, /(<meta name="twitter:description" content=")[^"]*(")/, meta.description)
  if (url) {
    out = out.replace(
      '</head>',
      () => `  <link rel="canonical" href="${url}" />\n    <meta property="og:url" content="${url}" />\n  </head>`,
    )
  }
  return out
}

/**
 * Writes a real HTML file for every case-study route (with its own title and
 * description), plus a 404 page, so deep links work on any static host.
 * Set SITE_URL (e.g. https://your-domain.com) to also emit absolute social
 * image URLs, canonical links and a sitemap.
 */
function staticRoutes(siteUrl: string): Plugin {
  let outDir = 'dist'
  let isBuild = false
  return {
    name: 'portfolio:static-routes',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
      isBuild = config.command === 'build'
    },
    transformIndexHtml(html) {
      let out = applyPageMeta(html, seo.home)
      if (siteUrl) out = out.replaceAll('content="/og-image.jpg"', `content="${siteUrl}/og-image.jpg"`)
      return out
    },
    async closeBundle() {
      if (!isBuild) return
      const indexFile = path.join(outDir, 'index.html')
      const html = await readFile(indexFile, 'utf8')
      const pageUrl = (route: string) => (siteUrl ? `${siteUrl}${route}` : undefined)

      await writeFile(indexFile, applyPageMeta(html, seo.home, pageUrl('/')))

      for (const project of projects) {
        const dir = path.join(outDir, 'work', project.slug)
        await mkdir(dir, { recursive: true })
        await writeFile(
          path.join(dir, 'index.html'),
          applyPageMeta(html, projectMeta(project), pageUrl(`/work/${project.slug}`)),
        )
      }

      await writeFile(path.join(outDir, '404.html'), applyPageMeta(html, seo.notFound))

      if (siteUrl) {
        const routes = ['/', ...projects.map((project) => `/work/${project.slug}`)]
        const sitemap = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...routes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`),
          '</urlset>',
          '',
        ].join('\n')
        await writeFile(path.join(outDir, 'sitemap.xml'), sitemap)
        await writeFile(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.SITE_URL || env.VITE_SITE_URL || '').replace(/\/+$/, '')

  return {
    plugins: [react(), tailwindcss(), staticRoutes(siteUrl)],
    server: {
      // The VS Code debug launch keeps Chrome's profile in .vscode/; Chrome locks those
      // files, and watching them crashes the dev server on Windows (EBUSY).
      watch: { ignored: ['**/.vscode/**'] },
    },
    build: {
      target: 'es2022',
      cssMinify: true,
    },
  }
})

import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { contactConfig, toPublicContact, type PublicContact } from './contact.config.ts';

/** Adds the URL-dependent SEO tags once `siteUrl` is set in contact.config.ts. */
function seoTags(siteUrl: string): Plugin {
  const url = siteUrl.replace(/\/+$/, '');
  return {
    name: 'portfolio-seo-tags',
    transformIndexHtml(html) {
      const tags = url
        ? `<link rel="canonical" href="${url}/" />\n    <meta property="og:url" content="${url}/" />`
        : '';
      return html
        .replace('<!--seo-url-tags-->', tags)
        .replaceAll('%OG_IMAGE%', `${url}/og-image.jpg`);
    },
  };
}

/** Reads the CV's size for its button, or hides the button if the file is missing. */
function withCvSize(contact: PublicContact): PublicContact {
  if (!contact.cvFile) return contact;
  const file = fileURLToPath(new URL(`./public/${contact.cvFile}`, import.meta.url));
  if (!existsSync(file)) {
    console.warn(`contact.config.ts: public/${contact.cvFile} was not found, so the Download CV button is hidden.`);
    return { ...contact, cvFile: null, cvSize: null };
  }
  return { ...contact, cvSize: `${(statSync(file).size / (1024 * 1024)).toFixed(1)} MB` };
}

export default defineConfig({
  plugins: [react(), seoTags(contactConfig.siteUrl)],
  define: {
    // Only enabled contact details are exposed to the site. See contact.config.ts.
    __PUBLIC_CONTACT__: JSON.stringify(withCvSize(toPublicContact(contactConfig))),
  },
  build: {
    target: 'es2022',
    // One stylesheet, linked from the prerendered HTML, so nothing flashes unstyled.
    cssCodeSplit: false,
    chunkSizeWarningLimit: 800,
  },
});

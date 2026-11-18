/**
 * ============================================================================
 *  YOUR CONTACT DETAILS, CV AND SITE SETTINGS
 * ============================================================================
 *
 *  This is the only file that holds your email, phone number, LinkedIn URL
 *  and CV. Change a value here and it updates everywhere on the site.
 *
 *  How it works:
 *  - This file is read at build time by vite.config.ts. It is never bundled.
 *  - Only entries with `enabled: true` are passed to the website.
 *  - While an entry is `enabled: false`, its value does not appear anywhere
 *    in the built site, not in the page and not in the JavaScript.
 *
 *  Watch out: this file is part of the source code. If you push this project
 *  to a PUBLIC repository, anyone can read the values below, even disabled ones.
 *
 *  After changing anything here, restart `npm run dev` or run `npm run build`.
 * ============================================================================
 */

export interface ContactConfig {
  /**
   * The final address of the site, with no trailing slash,
   * for example 'https://your-domain.com'. Used for the canonical link and for
   * the absolute preview image in social shares. Leave '' until you know it.
   */
  siteUrl: string;
  github: { enabled: boolean; url: string };
  email: { enabled: boolean; value: string };
  phone: { enabled: boolean; value: string };
  linkedin: { enabled: boolean; url: string };
  /**
   * Your CV: a PDF inside the public/ folder, offered as a Download CV button
   * in the header, the phone menu and the Contact section.
   * To update it, replace that file and keep the same name.
   * To stop publishing it, set `enabled: false` AND delete the file from public/.
   */
  cv: { enabled: boolean; file: string };
  /** Shows your photo in the About section. */
  portrait: { enabled: boolean };
}

export const contactConfig: ContactConfig = {
  siteUrl: 'https://hari20050803-beep.github.io',

  github: {
    enabled: true,
    url: 'https://github.com/hari20050803-beep',
  },

  email: {
    enabled: true, // <- set to false to hide it
    value: 'hari2005.08.03@gmail.com',
  },

  phone: {
    enabled: true, // <- set to false to hide it
    value: '+94 76 900 2783',
  },

  linkedin: {
    enabled: true, // <- set to false to hide it
    url: 'https://www.linkedin.com/in/harenthira-ravishangar-830031427/',
  },

  cv: {
    enabled: true,
    file: 'Ravishangar-Harenthira-CV.pdf',
  },

  portrait: {
    enabled: true,
  },
};

/** The only part of the config that reaches the browser. */
export interface PublicContact {
  github: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  cvFile: string | null;
  /** Filled in at build time from the file itself, for example "1.5 MB". */
  cvSize: string | null;
  showPortrait: boolean;
}

export function toPublicContact(config: ContactConfig): PublicContact {
  return {
    github: config.github.enabled ? config.github.url : null,
    email: config.email.enabled ? config.email.value : null,
    phone: config.phone.enabled ? config.phone.value : null,
    linkedin: config.linkedin.enabled ? config.linkedin.url : null,
    cvFile: config.cv.enabled ? config.cv.file : null,
    cvSize: null,
    showPortrait: config.portrait.enabled,
  };
}

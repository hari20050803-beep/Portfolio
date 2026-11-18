/// <reference types="vite/client" />

import type { PublicContact } from '../contact.config';

declare global {
  /** Injected at build time by vite.config.ts. Contains enabled values only. */
  const __PUBLIC_CONTACT__: PublicContact;
}

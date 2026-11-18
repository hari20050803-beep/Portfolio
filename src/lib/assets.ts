/** Builds a URL for a file in `public/`, respecting Vite's `base` setting. */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

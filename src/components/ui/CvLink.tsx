import { asset } from '../../lib/assets';
import { Icon } from './Icon';

const { cvFile, cvSize } = __PUBLIC_CONTACT__;

/** True when a CV is configured in contact.config.ts and its file exists. */
export const hasCv = Boolean(cvFile);

/**
 * A link that downloads the CV. `compact` shows just "CV" with an icon, for the
 * header; screen readers still hear the full "Download CV".
 */
export function CvLink({ className, compact = false }: { className?: string; compact?: boolean }) {
  if (!cvFile) return null;
  return (
    <a
      className={className}
      href={asset(cvFile)}
      download
      aria-label={compact ? `Download CV (PDF, ${cvSize})` : undefined}
    >
      <Icon name="download" />
      {compact ? 'CV' : 'Download CV'}
      {compact ? null : <span className="cv-size">PDF, {cvSize}</span>}
    </a>
  );
}

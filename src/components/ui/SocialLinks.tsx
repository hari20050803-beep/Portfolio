import { Icon } from './Icon';

const { github, linkedin } = __PUBLIC_CONTACT__;

/** Icon-only GitHub and LinkedIn links, used in the header and the hero. */
export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={`socials ${className ?? ''}`}>
      {github ? (
        <a href={github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile (opens in a new tab)">
          <Icon name="github" />
        </a>
      ) : null}
      {linkedin ? (
        <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">
          <Icon name="linkedin" />
        </a>
      ) : null}
    </div>
  );
}

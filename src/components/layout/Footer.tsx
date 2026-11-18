import { profile } from '../../content/portfolio';
import { SocialLinks } from '../ui/SocialLinks';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__name">{profile.name}</p>
        <SocialLinks />
        <a className="site-footer__top" href="#top">
          Back to top
        </a>
      </div>
    </footer>
  );
}

import { useEffect, useRef, useState } from 'react';
import { navigation, profile } from '../../content/portfolio';
import { CvLink, hasCv } from '../ui/CvLink';
import { Icon } from '../ui/Icon';
import { SocialLinks } from '../ui/SocialLinks';

const SECTION_IDS = navigation.map((item) => item.id);

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Header background, reading progress and the current section, once per frame.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const scrollable = root.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;

      headerRef.current?.toggleAttribute('data-scrolled', window.scrollY > 24);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;

      let current: string | null = null;
      if (progress > 0.995) {
        current = SECTION_IDS[SECTION_IDS.length - 1];
      } else {
        for (const id of SECTION_IDS) {
          const section = document.getElementById(id);
          if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.35) {
            current = id;
          }
        }
      }
      setActiveId(current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  // Escape closes the phone menu and returns focus to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header
      className="site-header"
      ref={headerRef}
      onBlur={(event) => {
        // Tabbing out of the menu closes it.
        if (open && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <div className="site-header__inner">
        <a className="brand" href="#top">
          <span className="brand__stamp" aria-hidden="true">
            {profile.initials}
          </span>
          <span className="brand__name">{profile.name}</span>
          <span className="sr-comma">, back to top</span>
        </a>

        <div className="site-header__right">
          <nav id="primary-nav" className="site-nav" data-open={open} aria-label="Primary">
            <ul>
              {navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={activeId === item.id ? 'location' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              {hasCv ? (
                <li className="site-nav__cv">
                  <CvLink />
                </li>
              ) : null}
            </ul>
          </nav>

          <SocialLinks className="socials--header" />
          <CvLink className="header-cv" compact />

          <button
            ref={toggleRef}
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="primary-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      <span className="site-header__progress" ref={progressRef} aria-hidden="true" />
    </header>
  );
}

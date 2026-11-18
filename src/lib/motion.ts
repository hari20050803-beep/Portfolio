/**
 * Scroll-triggered reveals and parallax, using plain DOM APIs.
 *
 * Mark an element with `data-reveal` to fade it in once, or `data-parallax="0.1"`
 * to drift it with the scroll (positive values run ahead of the scroll, negative
 * values lag behind it). Safe to call repeatedly: tracked elements are skipped.
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

let revealObserver: IntersectionObserver | undefined;
let parallaxObserver: IntersectionObserver | undefined;
const parallaxSeen = new WeakSet<Element>();
const parallaxActive = new Set<HTMLElement>();
let frame = 0;
let scrollListening = false;
let tiltListening = false;
let tiltCard: HTMLElement | null = null;

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches;
}

function watchReveals(): void {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)');

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  revealObserver ??= new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.04 },
  );

  targets.forEach((el) => revealObserver?.observe(el));
}

function applyParallax(): void {
  frame = 0;
  if (prefersReducedMotion()) {
    parallaxActive.forEach((el) => {
      el.style.transform = '';
    });
    return;
  }

  const viewportMiddle = window.innerHeight / 2;
  parallaxActive.forEach((el) => {
    const speed = Number(el.dataset.parallax) || 0;
    // Measure the parent so the element's own transform can't feed back into it.
    const box = (el.parentElement ?? el).getBoundingClientRect();
    const offset = (box.top + box.height / 2 - viewportMiddle) * speed;
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
  });
}

function requestParallax(): void {
  if (!frame) frame = requestAnimationFrame(applyParallax);
}

function watchParallax(): void {
  if (!('IntersectionObserver' in window) || prefersReducedMotion()) return;

  parallaxObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) parallaxActive.add(el);
        else parallaxActive.delete(el);
      }
      requestParallax();
    },
    { rootMargin: '20% 0px' },
  );

  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    if (parallaxSeen.has(el)) return;
    parallaxSeen.add(el);
    parallaxObserver?.observe(el);
  });

  if (!scrollListening) {
    scrollListening = true;
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax, { passive: true });
  }
}

function resetTilt(card: HTMLElement): void {
  card.style.removeProperty('--tilt-x');
  card.style.removeProperty('--tilt-y');
}

/** Passes the pointer position to cards marked `data-tilt`: their art leans and a soft glow follows. */
function watchTilt(): void {
  if (tiltListening || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  tiltListening = true;

  document.addEventListener(
    'pointermove',
    (event) => {
      if (prefersReducedMotion()) return;
      const card = (event.target as Element | null)?.closest?.<HTMLElement>('[data-tilt]') ?? null;
      if (tiltCard && tiltCard !== card) resetTilt(tiltCard);
      tiltCard = card;
      if (!card) return;

      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      card.style.setProperty('--tilt-x', `${((0.5 - y) * 2.4).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${((x - 0.5) * 3).toFixed(2)}deg`);
      card.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
    },
    { passive: true },
  );
}

export function initMotion(): void {
  document.documentElement.setAttribute('data-motion', '');
  watchReveals();
  watchParallax();
  watchTilt();
}

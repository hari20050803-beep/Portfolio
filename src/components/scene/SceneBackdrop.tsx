import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { asset } from '../../lib/assets';
import { decideScene } from '../../lib/sceneSupport';
import type { BackdropSceneHandle } from '../../scene/createBackdropScene';
import { Icon } from '../ui/Icon';

type Phase = 'pending' | 'loading' | 'live' | 'static';

/** How many CSS embers the lightweight fallback gets. */
const CSS_EMBERS = Array.from({ length: 14 }, (_, index) => index);

/**
 * The moving world behind the whole page. The artwork and CSS atmosphere are
 * always in the page, so something is on screen straight away. The 3D scene
 * then loads and fades in on top, and any failure leaves the fallback showing.
 */
export function SceneBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BackdropSceneHandle | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>('pending');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const decision = decideScene(reducedMotion);
    if (decision.mode === 'static') {
      setPhase('static');
      return;
    }

    setPhase('loading');
    let cancelled = false;

    const teardown = () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };

    const fallBack = () => {
      teardown();
      if (!cancelled) setPhase('static');
    };

    const load = async () => {
      try {
        const { createBackdropScene } = await import('../../scene/createBackdropScene');
        if (cancelled || !canvasRef.current) return;
        sceneRef.current = createBackdropScene(canvasRef.current, {
          quality: decision.quality,
          watchPerformance: decision.watchPerformance,
          onReady: () => {
            if (!cancelled) setPhase('live');
          },
          onFailure: fallBack,
        });
      } catch {
        fallBack();
      }
    };

    // Wait until the page has settled so the scene never competes with first paint.
    const idle = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const idleId = idle(() => void load());

    return () => {
      cancelled = true;
      cancelIdle(idleId);
      teardown();
    };
  }, [reducedMotion]);

  useEffect(() => {
    sceneRef.current?.setPaused(paused);
    document.documentElement.toggleAttribute('data-paused', paused);
  }, [paused, phase]);

  // Lets the stylesheet swap in the still of the final scene when there is no 3D.
  useEffect(() => {
    document.documentElement.dataset.scene = phase;
  }, [phase]);

  // Darkens the fallback artwork behind the page content as you scroll past the hero.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.min(window.scrollY / Math.max(window.innerHeight * 0.8, 1), 1);
      if (veilRef.current) veilRef.current.style.opacity = String(progress * 0.66);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
    };
  }, []);

  return (
    <>
      <div className="stage" data-phase={phase} data-paused={paused} aria-hidden="true">
        <picture className="stage__poster">
          <source media="(max-aspect-ratio: 1/1)" srcSet={asset('images/hero-poster-tall.webp')} />
          <img
            src={asset('images/hero-poster-wide.webp')}
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        <div className="stage__veil" ref={veilRef} />
        <div className="stage__rays" />
        <div className="stage__mist stage__mist--far" />
        <div className="stage__mist stage__mist--near" />
        <div className="stage__embers">
          {CSS_EMBERS.map((index) => (
            <i key={index} />
          ))}
        </div>

        <canvas ref={canvasRef} className="stage__canvas" />
        <p className="stage__loading">Loading 3D scene</p>
      </div>

      {reducedMotion ? null : (
        <button
          className="motion-toggle"
          type="button"
          aria-label={paused ? 'Play background animation' : 'Pause background animation'}
          title={paused ? 'Play background animation' : 'Pause background animation'}
          onClick={() => setPaused((value) => !value)}
        >
          <Icon name={paused ? 'play' : 'pause'} />
          <span>{paused ? 'Play' : 'Pause'}</span>
        </button>
      )}
    </>
  );
}

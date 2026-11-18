/** Decides whether the visitor gets the live 3D scene or the lightweight animated fallback. */

export type StaticReason = 'reduced-motion' | 'no-webgl' | 'low-power' | 'requested';

export type SceneDecision =
  | { mode: 'static'; reason: StaticReason }
  | { mode: 'live'; quality: 'full' | 'lite'; watchPerformance: boolean };

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function hasWebGL2(allowSoftware: boolean): boolean {
  try {
    const context = document.createElement('canvas').getContext('webgl2', {
      failIfMajorPerformanceCaveat: !allowSoftware,
    });
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function isApplePhoneOrTablet(): boolean {
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * `?scene=static` shows the fallback and `?scene=webgl` skips the device checks.
 * Reduced-motion always wins, including over `?scene=webgl`.
 *
 * Most devices get the live scene: it measures its own frame rate and steps
 * down if it can't keep up, which is more reliable than guessing from specs.
 */
export function decideScene(prefersReducedMotion: boolean): SceneDecision {
  if (prefersReducedMotion) return { mode: 'static', reason: 'reduced-motion' };

  const requested = new URLSearchParams(window.location.search).get('scene');
  if (requested === 'static') return { mode: 'static', reason: 'requested' };

  const forced = requested === 'webgl';
  if (!hasWebGL2(forced)) return { mode: 'static', reason: 'no-webgl' };
  if (forced) return { mode: 'live', quality: 'full', watchPerformance: false };

  const hints = navigator as NavigatorHints;
  const saveData =
    hints.connection?.saveData === true ||
    window.matchMedia('(prefers-reduced-data: reduce)').matches;
  const lowMemory = (hints.deviceMemory ?? 8) <= 2;
  // iPhones under-report their cores, so this check only applies elsewhere.
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 2 && !isApplePhoneOrTablet();

  if (saveData || lowMemory || fewCores) return { mode: 'static', reason: 'low-power' };

  const isPhoneOrTablet =
    window.matchMedia('(pointer: coarse)').matches &&
    Math.min(window.screen.width, window.screen.height) < 900;

  return { mode: 'live', quality: isPhoneOrTablet ? 'lite' : 'full', watchPerformance: true };
}

import {
  ColorManagement,
  Group,
  LinearSRGBColorSpace,
  Material,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import { addDust, addLightRays, addVeil } from './atmosphere';
import {
  addDistantCity,
  addEmbers,
  addFog,
  addMoon,
  addSky,
  buildRoof,
  MOON_DIAMETER,
  MOON_Z,
} from './environment';
import { buildFigure } from './figure';
import { bakeNoiseTexture } from './geometry';
import { buildFragments, buildKatana, KATANA_CENTRE } from './katana';
import type { SharedUniforms } from './materials';

// All shaders here write display colours directly, so three's colour conversion stays off.
ColorManagement.enabled = false;

export interface BackdropSceneOptions {
  quality: 'full' | 'lite';
  /** Lowers quality on slow devices and gives up if that doesn't help. */
  watchPerformance: boolean;
  /** Called after the first frame has been drawn. */
  onReady: () => void;
  /** Called when the scene can't run. The fallback underneath stays on show. */
  onFailure: () => void;
}

export interface BackdropSceneHandle {
  setPaused: (paused: boolean) => void;
  dispose: () => void;
}

const SLOW_FRAME_MS = 40;
/** Too slow to rescue by lowering quality: go straight to the fallback. */
const VERY_SLOW_FRAME_MS = 90;
const SAMPLE_FRAMES = 45;
const WARM_UP_FRAMES = 10;

/** Where the camera sits along the rooftop at the start, middle and end of the page. */
const CAMERA_X_HERO = -13;
const CAMERA_X_MIDDLE = -5.5;
const CAMERA_X_FINALE = 0;
const CAMERA_HEIGHT = 1.05;

const clamp01 = (value: number) => MathUtils.clamp(value, 0, 1);
const ease = (low: number, high: number, value: number) => MathUtils.smoothstep(value, low, high);

export function createBackdropScene(canvas: HTMLCanvasElement, options: BackdropSceneOptions): BackdropSceneHandle {
  const lite = options.quality === 'lite';
  const host = canvas.parentElement;
  let renderer: WebGLRenderer;

  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
  } catch {
    queueMicrotask(options.onFailure);
    return { setPaused: () => undefined, dispose: () => undefined };
  }

  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.debug.onShaderError = () => queueMicrotask(options.onFailure);

  const shared: SharedUniforms = {
    uTime: { value: 0 },
    uMoonDir: { value: new Vector3(-0.38, 0.46, -0.8).normalize() },
    uNoise: { value: bakeNoiseTexture() },
    uPixelRatio: { value: 1 },
  };

  const scene = new Scene();
  addSky(scene);
  const moon = addMoon(scene, shared);
  const rays = addLightRays(scene, shared);
  addDistantCity(scene);
  const fog = addFog(scene, shared, lite ? 3 : 6);
  const veil = addVeil(scene);
  const dust = addDust(scene, shared, lite ? 26 : 70);
  const embers = addEmbers(scene, shared, lite ? 60 : 170);

  const roof = buildRoof(shared);
  roof.rotation.y = -0.22;
  scene.add(roof);

  const figure = buildFigure(shared);
  figure.rotation.y = 0.24;
  scene.add(figure);

  // The floating sword: the root moves it, yaw turns it, tilt leans it.
  const swordRoot = new Group();
  const swordYaw = new Group();
  const swordTilt = new Group();
  const katana = buildKatana(shared);
  katana.position.x = -KATANA_CENTRE;
  swordTilt.add(katana);
  swordYaw.add(swordTilt);
  swordRoot.add(swordYaw);

  const fragmentOrbit = new Group();
  const fragments = buildFragments(shared, lite ? 14 : 34);
  fragmentOrbit.add(fragments.mesh);
  swordRoot.add(fragmentOrbit);
  scene.add(swordRoot);

  const camera = new PerspectiveCamera(30, 1, 0.1, 140);

  // ---- Sizing and composition ----

  const maxPixelRatio = lite ? 1.5 : 1.75;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
  let distance = 9;
  let portrait = false;
  const sword = { y: 1.32, z: 0.6, scale: 0.55, tilt: 1.14 };

  const resize = () => {
    const width = host?.clientWidth ?? window.innerWidth;
    const fullHeight = host?.clientHeight ?? window.innerHeight;
    const aspect = width / Math.max(fullHeight, 1);
    portrait = aspect < 1;

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, fullHeight, false);
    shared.uPixelRatio.value = pixelRatio;
    camera.aspect = aspect;

    if (portrait) {
      // The subject sits in the top of the screen with the text below it.
      const openness = clamp01((aspect - 0.45) / 0.55);
      distance = 18 - 8 * openness;
      camera.setViewOffset(width, fullHeight, 0, fullHeight * (0.29 - 0.09 * openness), width, fullHeight);
      sword.z = distance - (10.5 + 2.5 * openness);
      sword.y = 1.0;
      sword.scale = 0.44 + 0.16 * openness;
      sword.tilt = 0.5 + 0.42 * openness;
    } else {
      // The subject sits to the right, clear of the text column.
      distance = 9;
      camera.setViewOffset(width, fullHeight, -width * 0.2, 0, width, fullHeight);
      sword.z = 0.6;
      sword.y = 1.32;
      sword.scale = 0.55;
      sword.tilt = 1.14;
    }

    fragmentOrbit.rotation.z = sword.tilt;
    camera.updateProjectionMatrix();
  };

  // ---- Interaction ----

  const pointer = { x: 0, y: 0, currentX: 0, currentY: 0 };
  const scrollTarget = { hero: 0, finale: 0, page: 0 };
  const scrollNow = { hero: 0, finale: 0, page: 0 };
  let scrollDirty = true;

  const onPointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };

  const markScrollDirty = () => {
    scrollDirty = true;
  };

  const readScroll = () => {
    scrollDirty = false;
    const y = window.scrollY;
    const viewport = window.innerHeight;
    const heroHeight = document.getElementById('top')?.offsetHeight || viewport;
    const finale = document.getElementById('contact');
    const finaleTop = finale ? finale.getBoundingClientRect().top + y : Number.POSITIVE_INFINITY;
    const scrollable = document.documentElement.scrollHeight - viewport;

    scrollTarget.hero = clamp01(y / heroHeight);
    scrollTarget.finale = clamp01((y - (finaleTop - viewport)) / (viewport * 0.85));
    scrollTarget.page = scrollable > 0 ? clamp01(y / scrollable) : 0;
  };

  // ---- Loop ----

  let frameId = 0;
  let frameCount = 0;
  let disposed = false;
  let paused = false;
  let onScreen = true;
  let readySent = false;
  let lastNow = 0;
  let clock = 0;
  let warmUp = WARM_UP_FRAMES;
  let sampleTotal = 0;
  let sampleCount = 0;
  let qualityStep = 0;
  let middleAmount = 0;

  const draw = (delta: number) => {
    shared.uTime.value = clock;
    if (scrollDirty) readScroll();

    const smoothing = 1 - Math.exp(-delta * 6);
    scrollNow.hero += (scrollTarget.hero - scrollNow.hero) * smoothing;
    scrollNow.finale += (scrollTarget.finale - scrollNow.finale) * smoothing;
    scrollNow.page += (scrollTarget.page - scrollNow.page) * smoothing;
    pointer.currentX += (pointer.x - pointer.currentX) * (1 - Math.exp(-delta * 3));
    pointer.currentY += (pointer.y - pointer.currentY) * (1 - Math.exp(-delta * 3));

    // How far we are from the two clear, cinematic moments: the hero and the finale.
    const middle = ease(0.22, 0.9, scrollNow.hero) * (1 - ease(0.15, 0.9, scrollNow.finale));
    middleAmount = middle;

    const travelled = MathUtils.lerp(CAMERA_X_HERO, CAMERA_X_MIDDLE, clamp01(scrollNow.page / 0.85));
    const cameraX = MathUtils.lerp(travelled, CAMERA_X_FINALE, ease(0, 1, scrollNow.finale));

    camera.position.set(
      cameraX + pointer.currentX * 0.3,
      CAMERA_HEIGHT - pointer.currentY * 0.12 + middle * 0.55,
      distance - middle,
    );
    camera.lookAt(cameraX, CAMERA_HEIGHT + middle * 0.2, 0);
    camera.rotateZ(0.018);

    // The moon is effectively at infinity, so it travels with the camera.
    const moonDistance = distance - MOON_Z;
    if (portrait) {
      const visibleWidth = 2 * moonDistance * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect;
      const openness = clamp01((camera.aspect - 0.45) / 0.55);
      moon.scale.setScalar(Math.min(1, ((0.68 - 0.13 * openness) * visibleWidth) / MOON_DIAMETER));
      moon.position.x = cameraX + (-0.25 * moonDistance) / distance;
    } else {
      moon.scale.setScalar(1);
      moon.position.x = cameraX - 1.7;
    }
    moon.position.y = CAMERA_HEIGHT + ((1.33 - CAMERA_HEIGHT) * moonDistance) / distance;
    (moon.material as ShaderMaterial).uniforms.uGain.value = 1 - 0.6 * middle;
    rays.mesh.position.set(moon.position.x, moon.position.y, MOON_Z + 0.5);
    rays.setStrength(1 - 0.5 * middle);

    veil.setOpacity(0.44 * middle);

    // Embers and dust follow the camera, shifted so they stay put in the world.
    embers.position.x = cameraX;
    embers.setShift(cameraX / 15);
    dust.points.position.x = cameraX;
    dust.setShift(cameraX / 18);

    figure.visible = cameraX > -9;

    // The sword turns slowly, leans toward the pointer, and leaves as the page moves on.
    const exit = ease(0, 0.85, scrollNow.hero);
    swordRoot.visible = scrollNow.hero < 0.9;
    if (swordRoot.visible) {
      swordRoot.position.set(
        cameraX + exit * 2.4,
        sword.y + exit * 4.6 + Math.sin(clock * 0.6) * 0.05,
        sword.z - exit * 2.5,
      );
      swordRoot.scale.setScalar(sword.scale * (1 - 0.25 * exit));
      swordYaw.rotation.y = Math.sin(clock * 0.24) * 0.85 + pointer.currentX * 0.3 + exit * 2.4;
      swordTilt.rotation.z = sword.tilt + pointer.currentY * 0.07 + exit * 0.9;
      swordTilt.rotation.x = Math.sin(clock * 0.19) * 0.14;
      fragmentOrbit.rotation.x = clock * 0.05;
      fragments.update(clock, exit);
    }

    renderer.render(scene, camera);

    if (!readySent) {
      readySent = true;
      options.onReady();
    }
  };

  const adjustQuality = (averageMs: number) => {
    if (averageMs <= SLOW_FRAME_MS) return;
    if (averageMs > VERY_SLOW_FRAME_MS) {
      options.onFailure();
      return;
    }
    qualityStep += 1;
    if (qualityStep === 1) {
      pixelRatio = Math.max(1, pixelRatio * 0.7);
      resize();
    } else if (qualityStep === 2) {
      pixelRatio = 0.85;
      fog.slice(3).forEach((layer) => {
        layer.visible = false;
      });
      resize();
    } else {
      options.onFailure();
    }
  };

  const tick = (now: number) => {
    if (disposed) return;
    frameId = requestAnimationFrame(tick);

    const elapsed = lastNow ? now - lastNow : 16;
    lastNow = now;
    frameCount += 1;
    // Ignore long gaps, such as returning from another tab.
    const counted = elapsed < 250;
    if (counted) clock += elapsed / 1000;

    // Behind the page content the scene only drifts, so half the frames are plenty.
    const throttled = middleAmount > 0.92 && frameCount % 2 === 1;
    if (!throttled) draw(counted ? Math.min(elapsed * (middleAmount > 0.92 ? 2 : 1), 100) / 1000 : 0.016);

    if (options.watchPerformance && counted) {
      if (warmUp > 0) {
        warmUp -= 1;
        return;
      }
      sampleTotal += elapsed;
      sampleCount += 1;
      if (sampleCount >= SAMPLE_FRAMES) {
        adjustQuality(sampleTotal / sampleCount);
        sampleTotal = 0;
        sampleCount = 0;
      }
    }
  };

  const syncLoop = () => {
    const shouldRun = !disposed && !paused && onScreen && document.visibilityState === 'visible';
    if (shouldRun && !frameId) {
      lastNow = 0;
      frameId = requestAnimationFrame(tick);
    } else if (!shouldRun && frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    options.onFailure();
  };

  const onResize = () => {
    resize();
    markScrollDirty();
    // Keep the picture when the canvas is resized while the loop is stopped.
    if (!frameId && !disposed) draw(0.016);
  };

  const resizeObserver = new ResizeObserver(onResize);
  if (host) resizeObserver.observe(host);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    syncLoop();
  });
  visibilityObserver.observe(canvas);

  const canUsePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canUsePointer) window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', markScrollDirty, { passive: true });
  document.addEventListener('visibilitychange', syncLoop);
  canvas.addEventListener('webglcontextlost', onContextLost);

  // Start at the right place if the page loads part-way down.
  resize();
  readScroll();
  Object.assign(scrollNow, scrollTarget);
  syncLoop();

  return {
    setPaused(value) {
      paused = value;
      syncLoop();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(frameId);
      frameId = 0;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', markScrollDirty);
      document.removeEventListener('visibilitychange', syncLoop);
      canvas.removeEventListener('webglcontextlost', onContextLost);

      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof Points) {
          object.geometry.dispose();
          (object.material as Material).dispose();
        }
      });
      shared.uNoise.value.dispose();
      renderer.dispose();
    },
  };
}

import {
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Vector2,
  Vector3,
} from 'three';
import { seededRandom, taperedTube } from './geometry';
import {
  emberMaterial,
  fogMaterial,
  inkMaterial,
  moonMaterial,
  rgb,
  roofMaterial,
  skyMaterial,
  skylineMaterial,
  type SharedUniforms,
} from './materials';

export const MOON_Z = -40;

export function addSky(scene: Scene): void {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  const sky = new Mesh(geometry, skyMaterial());
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  scene.add(sky);
}

/** Diameter of the moon in world units at scale 1. */
export const MOON_DIAMETER = 13.2;

export function addMoon(scene: Scene, shared: SharedUniforms): Mesh {
  const moon = new Mesh(new PlaneGeometry(44, 44), moonMaterial(shared, MOON_DIAMETER / 44));
  moon.position.set(-1.7, 2.45, MOON_Z);
  moon.renderOrder = -5;
  scene.add(moon);
  return moon;
}

/** One curved-eave roof, traced left to right onto a silhouette. */
function traceRoof(shape: Shape, x: number, width: number, wall: number, rise: number): void {
  const flare = width * 0.1;
  shape.lineTo(x + width * 0.06, wall - 0.15);
  shape.lineTo(x - flare, wall + rise * 0.14);
  shape.quadraticCurveTo(x + width * 0.2, wall + rise * 0.2, x + width * 0.27, wall + rise);
  shape.lineTo(x + width * 0.73, wall + rise);
  shape.quadraticCurveTo(x + width * 0.8, wall + rise * 0.2, x + width + flare, wall + rise * 0.14);
  shape.lineTo(x + width * 0.94, wall - 0.15);
}

/** A tiered tower silhouette. */
function tracePagoda(shape: Shape, centre: number, base: number, tiers: number, width: number, tierHeight: number): void {
  const tierWidth = (tier: number) => width * (1 - tier * 0.15);

  for (let tier = 0; tier < tiers; tier++) {
    const half = tierWidth(tier) / 2;
    const y = base + tier * tierHeight;
    shape.lineTo(centre - half * 0.62, y);
    shape.lineTo(centre - half * 0.62, y + tierHeight * 0.3);
    shape.lineTo(centre - half * 1.12, y + tierHeight * 0.36);
    shape.quadraticCurveTo(centre - half * 0.74, y + tierHeight * 0.42, centre - half * 0.56, y + tierHeight * 0.74);
  }

  const top = base + tiers * tierHeight;
  shape.lineTo(centre - 0.03, top - tierHeight * 0.36);
  shape.lineTo(centre - 0.012, top + tierHeight * 0.55);
  shape.lineTo(centre + 0.012, top + tierHeight * 0.55);
  shape.lineTo(centre + 0.03, top - tierHeight * 0.36);

  for (let tier = tiers - 1; tier >= 0; tier--) {
    const half = tierWidth(tier) / 2;
    const y = base + tier * tierHeight;
    shape.lineTo(centre + half * 0.56, y + tierHeight * 0.74);
    shape.quadraticCurveTo(centre + half * 0.74, y + tierHeight * 0.42, centre + half * 1.12, y + tierHeight * 0.36);
    shape.lineTo(centre + half * 0.62, y + tierHeight * 0.3);
    shape.lineTo(centre + half * 0.62, y);
  }
}

interface SkylineOptions {
  seed: number;
  z: number;
  from: number;
  to: number;
  wall: [number, number];
  width: [number, number];
  rise: [number, number];
  color: number;
  mist: number;
  fade: [number, number];
  pagoda?: { centre: number; base: number; tiers: number; width: number; tierHeight: number };
}

function addSkyline(scene: Scene, options: SkylineOptions): void {
  const random = seededRandom(options.seed);
  const between = ([low, high]: [number, number]) => low + random() * (high - low);
  const floor = options.wall[0] - 18;
  const shape = new Shape();
  shape.moveTo(options.from, floor);

  let x = options.from;
  let pagodaDone = !options.pagoda;
  while (x < options.to) {
    if (options.pagoda && !pagodaDone && x + 3 > options.pagoda.centre - options.pagoda.width / 2) {
      const { centre, base, tiers, width, tierHeight } = options.pagoda;
      tracePagoda(shape, centre, base, tiers, width, tierHeight);
      x = centre + width / 2 + 0.8;
      pagodaDone = true;
      continue;
    }
    const width = between(options.width);
    traceRoof(shape, x, width, between(options.wall), between(options.rise));
    x += width + 0.3 + random() * 1.1;
  }

  shape.lineTo(options.to + 6, floor);
  shape.closePath();

  const mesh = new Mesh(
    new ShapeGeometry(shape, 8),
    skylineMaterial(rgb(options.color), rgb(options.mist), options.fade[0], options.fade[1]),
  );
  mesh.position.z = options.z;
  scene.add(mesh);
}

export function addDistantCity(scene: Scene): void {
  addSkyline(scene, {
    seed: 21,
    z: -30,
    from: -44,
    to: 44,
    wall: [-3.4, -1.3],
    width: [3.4, 7],
    rise: [0.9, 1.6],
    color: 0x262e38,
    mist: 0x303944,
    fade: [-6, 0.2],
    pagoda: { centre: -24, base: -4, tiers: 4, width: 5.4, tierHeight: 1.65 },
  });
  addSkyline(scene, {
    seed: 5,
    z: -18,
    from: -48,
    to: 32,
    wall: [-3.5, -2.3],
    width: [2.4, 5],
    rise: [0.6, 1.1],
    color: 0x151a21,
    mist: 0x2a323c,
    fade: [-5.2, -0.7],
  });
  addSkyline(scene, {
    seed: 17,
    z: -9,
    from: -44,
    to: 24,
    wall: [-3.2, -2.5],
    width: [1.8, 3.6],
    rise: [0.42, 0.75],
    color: 0x0c0e13,
    mist: 0x20262e,
    fade: [-3.6, -1.3],
  });
}

/**
 * The rooftop the figure stands on. The ridge runs along X through the origin
 * and ends just past the figure, in an upswept corner.
 */
export function buildRoof(shared: SharedUniforms): Group {
  const roof = new Group();
  const slope = (t: number) => -3.25 * t + 1.25 * t * t;
  const ridgeEnd = 1.9;
  const hipRun = (t: number) => ridgeEnd + t * 2.5;

  const geometry = new PlaneGeometry(1, 1, 16, 28);
  const position = geometry.getAttribute('position') as BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const u = position.getX(i) + 0.5;
    const t = 0.5 - position.getY(i);
    const x = -22 + u * (hipRun(t) + 22);
    const corner = Math.max(0, (x - hipRun(t) + 3.6) / 3.6) ** 2;
    position.setXYZ(i, x, slope(t) + corner * t * t * 0.9, t * 7.5);
  }
  geometry.computeVertexNormals();
  roof.add(new Mesh(geometry, roofMaterial(shared)));

  const ridgeMaterial = inkMaterial(shared, { base: rgb(0x0e1014), rimStrength: 1.05 });

  // Ridge cap, with a lifted ornament where it ends.
  const cap = new Mesh(new CylinderGeometry(0.1, 0.1, 24, 12, 1), ridgeMaterial);
  cap.rotation.z = Math.PI / 2;
  cap.scale.z = 1.5;
  cap.position.set(-10.1, -0.1, 0);
  roof.add(cap);

  const crest = new Mesh(new CylinderGeometry(0.04, 0.04, 24, 8, 1), ridgeMaterial);
  crest.rotation.z = Math.PI / 2;
  crest.position.set(-10.1, -0.015, 0);
  roof.add(crest);

  roof.add(
    new Mesh(
      taperedTube(
        [new Vector3(1.75, -0.1, 0), new Vector3(2.05, -0.05, 0), new Vector3(2.32, 0.08, 0), new Vector3(2.46, 0.34, 0)],
        [0.13, 0.13, 0.09, 0.02],
        14,
        10,
      ),
      ridgeMaterial,
    ),
  );

  // The diagonal hip running down from the end of the ridge.
  const hipPoints: Vector3[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    hipPoints.push(new Vector3(hipRun(t), slope(t) + t * t * 0.9 - 0.02, t * 7.5));
  }
  roof.add(new Mesh(taperedTube(hipPoints, [0.1, 0.11], 26, 10), ridgeMaterial));

  return roof;
}

export interface FogLayer {
  z: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  color: number;
  scale: [number, number];
  drift: [number, number];
}

const FOG_LAYERS: FogLayer[] = [
  { z: -24, y: -1.5, width: 92, height: 15, opacity: 0.62, color: 0x3d4855, scale: [2.6, 0.9], drift: [0.0075, 0.0009] },
  { z: -22, y: 8.2, width: 80, height: 7.5, opacity: 0.5, color: 0x3a4552, scale: [2.8, 0.55], drift: [-0.006, 0.0005] },
  { z: -13, y: -2.4, width: 76, height: 10, opacity: 0.66, color: 0x333d49, scale: [3, 0.8], drift: [-0.0105, 0.0012] },
  { z: 0.9, y: -0.75, width: 70, height: 4.4, opacity: 0.44, color: 0x6c7a8a, scale: [4.4, 0.75], drift: [0.0135, 0.0015] },
  { z: 2.4, y: 2.6, width: 70, height: 5, opacity: 0.16, color: 0x7d8b9b, scale: [4, 0.6], drift: [-0.0085, 0.001] },
  { z: 4.2, y: -1.15, width: 70, height: 4, opacity: 0.22, color: 0x7d8b9b, scale: [4.2, 0.7], drift: [-0.017, 0.0018] },
];

export function addFog(scene: Scene, shared: SharedUniforms, count: number): Mesh[] {
  return FOG_LAYERS.slice(0, count).map((layer, index) => {
    const mesh = new Mesh(
      new PlaneGeometry(layer.width, layer.height),
      fogMaterial(shared, {
        color: rgb(layer.color),
        opacity: layer.opacity,
        scale: new Vector2(...layer.scale),
        drift: new Vector2(...layer.drift),
        overlay: layer.z > 0,
      }),
    );
    mesh.position.set(0, layer.y, layer.z);
    mesh.renderOrder = layer.z > 0 ? 16 + index : index;
    scene.add(mesh);
    return mesh;
  });
}

export interface Embers {
  position: Vector3;
  setShift: (shift: number) => void;
}

export function addEmbers(scene: Scene, shared: SharedUniforms, count: number): Embers {
  const random = seededRandom(99);
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < seeds.length; i++) seeds[i] = random();

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 3));

  const embers = new Points(
    geometry,
    emberMaterial(shared, new Vector3(-8.5, -2.2, -3.5), new Vector3(15, 7.5, 9)),
  );
  embers.frustumCulled = false;
  embers.renderOrder = 20;
  scene.add(embers);

  return {
    position: embers.position,
    setShift: (shift) => {
      (embers.material as ShaderMaterial).uniforms.uShift.value = shift;
    },
  };
}

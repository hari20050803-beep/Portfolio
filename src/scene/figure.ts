import {
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  SphereGeometry,
  Vector3,
} from 'three';
import { loft, seededRandom, taperedTube, type Ring } from './geometry';
import {
  bladeMaterial,
  inkMaterial,
  ribbonMaterial,
  rgb,
  type SharedUniforms,
} from './materials';

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

/** A curved blade drawn as a flat three-column strip: spine, centre and cutting edge. */
function bladeGeometry(length: number): BufferGeometry {
  const samples = 40;
  const positions: number[] = [];
  const along: number[] = [];
  const across: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = t * length;
    // The cutting edge sits on the outside of the gentle curve.
    const centre = -0.042 * Math.sin(t * Math.PI);
    const shoulder = t < 0.94 ? 1 : Math.max(0, 1 - ((t - 0.94) / 0.06) ** 1.6);
    const width = (0.036 - 0.01 * t) * shoulder;

    [0.5, 0, -0.5].forEach((side, column) => {
      positions.push(x, centre + side * width, 0);
      along.push(t);
      across.push(column / 2);
    });

    if (i < samples) {
      const a = i * 3;
      indices.push(a, a + 3, a + 1, a + 1, a + 3, a + 4, a + 1, a + 4, a + 2, a + 2, a + 4, a + 5);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('aAlong', new BufferAttribute(new Float32Array(along), 1));
  geometry.setAttribute('aAcross', new BufferAttribute(new Float32Array(across), 1));
  geometry.setIndex(indices);
  return geometry;
}

export function ribbonGeometry(segments: number): BufferGeometry {
  const count = (segments + 1) * 2;
  const along = new Float32Array(count);
  const side = new Float32Array(count);
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    along[i * 2] = along[i * 2 + 1] = i / segments;
    side[i * 2] = -1;
    side[i * 2 + 1] = 1;
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }

  const geometry = new BufferGeometry();
  // The vertex shader computes positions; three still expects the attribute to exist.
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('aAlong', new BufferAttribute(along, 1));
  geometry.setAttribute('aSide', new BufferAttribute(side, 1));
  geometry.setIndex(indices);
  return geometry;
}

/** A jagged, torn edge for the bottom of the cloak and mantle. */
function tornHem(seed: number, depth: number): (theta: number) => number {
  const random = seededRandom(seed);
  const phases = [random() * 6.28, random() * 6.28, random() * 6.28];
  return (theta) =>
    (Math.abs(Math.sin(theta * 5 + phases[0])) * 0.55 +
      Math.abs(Math.sin(theta * 11 + phases[1])) * 0.3 +
      Math.abs(Math.sin(theta * 23 + phases[2])) * 0.15) *
    depth;
}

/**
 * An original hooded figure standing with a drawn sword, built entirely from
 * code. Its feet sit at y = 0 and it stands about 1.9 units tall.
 */
export function buildFigure(shared: SharedUniforms): Group {
  const figure = new Group();

  const cloth = inkMaterial(shared, { base: rgb(0x0c0d11), rimStrength: 1.15 });
  const clothWind = inkMaterial(shared, { base: rgb(0x0c0d11), rimStrength: 1.2, wind: true });
  const fittings = inkMaterial(shared, { base: rgb(0x121318), rimStrength: 1.3 });
  const grip = inkMaterial(shared, { base: rgb(0x2c0a0f), rimStrength: 0.9 });

  const add = (geometry: BufferGeometry, material: typeof cloth, animated = false) => {
    const mesh = new Mesh(geometry, material);
    // Wind moves vertices in the shader, outside the geometry's bounds.
    if (animated) mesh.frustumCulled = false;
    figure.add(mesh);
    return mesh;
  };

  // Legs: a wide, settled stance along the ridge.
  add(
    taperedTube([v(-0.11, 0.98, 0), v(-0.27, 0.56, 0.09), v(-0.34, 0.08, 0.03)], [0.14, 0.135, 0.078], 14, 12),
    cloth,
  );
  add(
    taperedTube([v(0.11, 0.98, 0), v(0.22, 0.56, -0.06), v(0.3, 0.08, -0.02)], [0.14, 0.13, 0.078], 14, 12),
    cloth,
  );
  for (const [x, z] of [
    [-0.34, 0.0],
    [0.3, -0.05],
  ]) {
    const foot = new Mesh(new SphereGeometry(1, 12, 8), fittings);
    foot.scale.set(0.078, 0.046, 0.14);
    foot.position.set(x, 0.042, z);
    figure.add(foot);
  }

  // Long cloak, flaring and pulled downwind toward the hem.
  const cloakRings: Ring[] = [
    { y: 0.3, rx: 0.54, rz: 0.38, cx: -0.2, cz: 0.04 },
    { y: 0.62, rx: 0.39, rz: 0.29, cx: -0.09, cz: 0.02 },
    { y: 0.88, rx: 0.315, rz: 0.23, cx: -0.03, cz: 0 },
    { y: 1.14, rx: 0.285, rz: 0.195 },
    { y: 1.36, rx: 0.3, rz: 0.185 },
    { y: 1.47, rx: 0.27, rz: 0.16 },
    { y: 1.54, rx: 0.16, rz: 0.12 },
  ];
  add(
    loft(cloakRings, { radial: 44, steps: 5, folds: { count: 9, amount: 0.075 }, hem: tornHem(3, -0.14) }),
    clothWind,
    true,
  );

  // Short mantle layered over the shoulders.
  const mantleRings: Ring[] = [
    { y: 1.1, rx: 0.4, rz: 0.26, cx: -0.04 },
    { y: 1.26, rx: 0.37, rz: 0.235, cx: -0.02 },
    { y: 1.42, rx: 0.325, rz: 0.2 },
    { y: 1.52, rx: 0.22, rz: 0.15 },
    { y: 1.58, rx: 0.12, rz: 0.105 },
  ];
  add(
    loft(mantleRings, { radial: 40, steps: 4, folds: { count: 7, amount: 0.05 }, hem: tornHem(8, -0.09) }),
    clothWind,
    true,
  );

  // Hood: rounded at the crown, drawing to a soft point at the back.
  const hoodRings: Ring[] = [
    { y: 1.52, rx: 0.12, rz: 0.115 },
    { y: 1.6, rx: 0.138, rz: 0.15, cz: 0.01 },
    { y: 1.7, rx: 0.145, rz: 0.168, cz: 0.02 },
    { y: 1.79, rx: 0.125, rz: 0.15, cz: 0.04 },
    { y: 1.86, rx: 0.075, rz: 0.1, cz: 0.07 },
    { y: 1.905, rx: 0.012, rz: 0.018, cz: 0.1 },
  ];
  add(loft(hoodRings, { radial: 28, steps: 4 }), cloth);

  // Sword arm reaching out and down, in a loose sleeve.
  add(
    taperedTube([v(0.1, 1.42, 0.0), v(0.4, 1.24, 0.04), v(0.63, 0.98, 0.1)], [0.1, 0.092, 0.082], 18, 12),
    cloth,
  );
  const hand = new Mesh(new SphereGeometry(0.044, 12, 10), fittings);
  hand.position.set(0.665, 0.945, 0.115);
  figure.add(hand);

  // Sword, held low and out to the side.
  const sword = new Group();
  sword.position.copy(hand.position);
  sword.rotation.z = -0.72;
  sword.rotation.y = 0.14;

  const blade = new Mesh(bladeGeometry(1.06), bladeMaterial(shared));
  blade.position.x = 0.075;
  sword.add(blade);

  const guard = new Mesh(new CylinderGeometry(0.056, 0.056, 0.012, 24), fittings);
  guard.rotation.z = Math.PI / 2;
  guard.position.x = 0.07;
  sword.add(guard);

  const handle = new Mesh(new CylinderGeometry(0.0175, 0.0195, 0.2, 10), grip);
  handle.rotation.z = Math.PI / 2;
  handle.position.x = -0.03;
  sword.add(handle);
  figure.add(sword);

  // Empty scabbard angled off the left hip.
  add(taperedTube([v(-0.24, 1.0, 0.1), v(-0.56, 0.78, 0.16), v(-0.9, 0.53, 0.2)], [0.021, 0.024, 0.02], 10, 8), fittings);

  // Two crimson scarf tails, the one strong colour in the scene.
  const scarf = (origin: Vector3, length: number, width: number, phase: number, droop: number) => {
    const mesh = new Mesh(
      ribbonGeometry(46),
      ribbonMaterial(shared, { origin, length, width, phase, droop }),
    );
    mesh.frustumCulled = false;
    figure.add(mesh);
  };
  scarf(v(-0.04, 1.52, 0.14), 1.32, 0.13, 0.4, 0.2);
  scarf(v(-0.02, 1.48, 0.15), 0.98, 0.095, 2.3, 0.32);

  const collar = new Mesh(
    new CylinderGeometry(0.128, 0.15, 0.085, 22, 1, true),
    inkMaterial(shared, { base: rgb(0x7c141c), rimStrength: 0.7 }),
  );
  collar.position.y = 1.535;
  figure.add(collar);

  return figure;
}

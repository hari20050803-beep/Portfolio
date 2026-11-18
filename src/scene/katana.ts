import {
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  Path,
  Quaternion,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import { ribbonGeometry } from './figure';
import { seededRandom } from './geometry';
import { ribbonMaterial, rgb, type SharedUniforms } from './materials';
import { bladeSteelMaterial, hiltMaterial, metalMaterial } from './metal';

const BLADE_LENGTH = 5;
/** Where the tip section begins along the blade, from 0 to 1. */
const TIP_START = 0.925;

/** Roughly the middle of the whole sword along its length, used as the pivot. */
export const KATANA_CENTRE = 1.76;

/** Cross-section of the blade at `t`: [height, thickness, position across] from edge round to edge. */
function bladeSection(t: number): { points: [number, number, number][]; middle: number } {
  const centre = -0.19 * Math.sin(Math.PI * t);
  const width = 0.215 - 0.07 * t;
  const tip = t <= TIP_START ? 0 : (t - TIP_START) / (1 - TIP_START);
  const closing = Math.sqrt(Math.max(0, 1 - tip * tip));
  const top = centre + width / 2 - tip * tip * width * 0.22;
  const span = width * closing;
  const edge = top - span;
  const ridge = top - span * 0.38;
  const shoulder = top - span * 0.05;
  const half = (0.036 - 0.013 * t) * closing ** 0.7;

  return {
    middle: (top + edge) / 2,
    points: [
      [edge, 0, 0],
      [ridge, half, 0.62],
      [shoulder, half * 0.6, 0.95],
      [top, 0, 1],
      [shoulder, -half * 0.6, 0.95],
      [ridge, -half, 0.62],
      [edge, 0, 0],
    ],
  };
}

/**
 * A curved blade with flat facets, like a real polished sword. Each facet gets
 * its own vertices so it catches the light as a separate plane.
 */
function bladeGeometry(): BufferGeometry {
  const rings = 96;
  const positions: number[] = [];
  const normals: number[] = [];
  const along: number[] = [];
  const across: number[] = [];
  const indices: number[] = [];
  const facets = 6;

  const toTangent = new Vector3();
  const toAcross = new Vector3();
  const normal = new Vector3();
  const lastNormal = new Vector3(0, 0, 1);

  for (let facet = 0; facet < facets; facet++) {
    const base = positions.length / 3;

    for (let ring = 0; ring <= rings; ring++) {
      const t = ring / rings;
      const here = bladeSection(t);
      const before = bladeSection(Math.max(0, t - 0.01));
      const after = bladeSection(Math.min(1, t + 0.01));
      const [ay, az, aAcross] = here.points[facet];
      const [by, bz, bAcross] = here.points[facet + 1];
      const x = t * BLADE_LENGTH;

      const midAfter = (after.points[facet][0] + after.points[facet + 1][0]) / 2;
      const midBefore = (before.points[facet][0] + before.points[facet + 1][0]) / 2;
      toTangent.set(0.02 * BLADE_LENGTH, midAfter - midBefore, 0);
      toAcross.set(0, by - ay, bz - az);
      normal.crossVectors(toTangent, toAcross);

      if (normal.lengthSq() < 1e-12) {
        normal.copy(lastNormal);
      } else {
        normal.normalize();
        const outwardY = (ay + by) / 2 - here.middle;
        const outwardZ = (az + bz) / 2;
        if (normal.y * outwardY + normal.z * outwardZ < 0) normal.negate();
        lastNormal.copy(normal);
      }

      positions.push(x, ay, az, x, by, bz);
      normals.push(normal.x, normal.y, normal.z, normal.x, normal.y, normal.z);
      along.push(t, t);
      across.push(aAcross, bAcross);

      if (ring < rings) {
        const a = base + ring * 2;
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
  geometry.setAttribute('aAlong', new BufferAttribute(new Float32Array(along), 1));
  geometry.setAttribute('aAcross', new BufferAttribute(new Float32Array(across), 1));
  geometry.setIndex(indices);
  return geometry;
}

/** An elliptical section along the X axis, for the grip and its collars. */
function barrelGeometry(x0: number, x1: number, radiiY: number[], radiiZ: number[], rows = 20, radial = 28): BufferGeometry {
  const sample = (values: number[], s: number) => {
    const scaled = s * (values.length - 1);
    const low = Math.min(Math.floor(scaled), values.length - 2);
    return values[low] + (values[low + 1] - values[low]) * (scaled - low);
  };

  const columns = radial + 1;
  const count = (rows + 1) * columns;
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const along = new Float32Array(count);
  const angle = new Float32Array(count);
  const indices: number[] = [];

  for (let i = 0; i <= rows; i++) {
    const s = i / rows;
    const x = x0 + (x1 - x0) * s;
    const ry = sample(radiiY, s);
    const rz = sample(radiiZ, s);

    for (let j = 0; j < columns; j++) {
      const a = (j / radial) * Math.PI * 2;
      const index = i * columns + j;
      positions.set([x, ry * Math.cos(a), rz * Math.sin(a)], index * 3);
      const ny = Math.cos(a) / ry;
      const nz = Math.sin(a) / rz;
      const length = Math.hypot(ny, nz) || 1;
      normals.set([0, ny / length, nz / length], index * 3);
      along[index] = s;
      angle[index] = j / radial;

      if (i < rows && j < radial) {
        indices.push(index, index + columns, index + 1, index + 1, index + columns, index + columns + 1);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  geometry.setAttribute('aAlong', new BufferAttribute(along, 1));
  geometry.setAttribute('aAngle', new BufferAttribute(angle, 1));
  geometry.setIndex(indices);
  return geometry;
}

/** An original hand guard: an oval plate pierced by two crescents. */
function guardGeometry(): BufferGeometry {
  const shape = new Shape();
  shape.absellipse(0, 0, 0.3, 0.36, 0, Math.PI * 2, false, 0);

  const crescent = (centre: number) => {
    const hole = new Path();
    hole.absarc(0, 0, 0.255, centre - 0.72, centre + 0.72, false);
    hole.absarc(0, 0, 0.175, centre + 0.72, centre - 0.72, true);
    hole.closePath();
    return hole;
  };
  shape.holes.push(crescent(0), crescent(Math.PI));

  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 30,
  });
  geometry.translate(0, 0, -0.025);
  return geometry;
}

/** An original katana built entirely from code. Its guard sits at x = 0. */
export function buildKatana(shared: SharedUniforms): Group {
  const katana = new Group();
  const iron = metalMaterial(shared, rgb(0x6f757f));
  const brass = metalMaterial(shared, rgb(0xc69a55));
  const wrap = hiltMaterial(shared);

  const blade = new Mesh(bladeGeometry(), bladeSteelMaterial(shared));
  blade.position.x = 0.02;
  katana.add(blade);

  katana.add(new Mesh(barrelGeometry(0.02, 0.2, [0.135, 0.128], [0.062, 0.054], 4), brass));

  for (const x of [0.042, -0.042]) {
    const washer = new Mesh(new CylinderGeometry(0.19, 0.19, 0.012, 32), brass);
    washer.rotation.z = Math.PI / 2;
    washer.position.x = x;
    katana.add(washer);
  }

  const guard = new Group();
  guard.rotation.y = Math.PI / 2;
  guard.add(new Mesh(guardGeometry(), iron));
  const inlay = new Mesh(new TorusGeometry(0.345, 0.011, 8, 64), brass);
  inlay.scale.set(0.87, 1, 1);
  guard.add(inlay);
  katana.add(guard);

  katana.add(new Mesh(barrelGeometry(-0.2, -0.05, [0.14, 0.15], [0.1, 0.112], 4), iron));
  katana.add(
    new Mesh(barrelGeometry(-1.44, -0.19, [0.122, 0.112, 0.106, 0.114, 0.13], [0.092, 0.086, 0.082, 0.088, 0.1], 26, 32), wrap),
  );
  katana.add(new Mesh(barrelGeometry(-1.54, -1.42, [0.012, 0.11, 0.128, 0.13], [0.012, 0.082, 0.096, 0.098], 8), iron));

  for (const z of [0.09, -0.09]) {
    const stud = new Mesh(new SphereGeometry(1, 14, 10), brass);
    stud.scale.set(0.085, 0.024, 0.02);
    stud.position.set(-0.78, 0, z);
    katana.add(stud);
  }

  const cord = new Mesh(
    ribbonGeometry(40),
    ribbonMaterial(shared, {
      origin: new Vector3(-1.52, 0, 0),
      length: 1.3,
      width: 0.07,
      phase: 1.1,
      droop: 0.18,
    }),
  );
  cord.frustumCulled = false;
  katana.add(cord);

  return katana;
}

function shardGeometry(): BufferGeometry {
  const random = seededRandom(31);
  const sides = 5;
  const ring: Vector3[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 + random() * 0.5;
    const radius = 0.55 + random() * 0.45;
    ring.push(new Vector3(Math.cos(angle) * radius, (random() - 0.5) * 0.5, Math.sin(angle) * radius * 0.35));
  }

  const top = new Vector3(0.1, 1.6, 0);
  const bottom = new Vector3(-0.1, -1.15, 0);
  const positions: number[] = [];
  const normals: number[] = [];
  const a = new Vector3();
  const b = new Vector3();

  const addFace = (p0: Vector3, p1: Vector3, p2: Vector3) => {
    a.subVectors(p1, p0);
    b.subVectors(p2, p0);
    const normal = a.clone().cross(b).normalize();
    const centre = p0.clone().add(p1).add(p2).divideScalar(3);
    const flipped = normal.dot(centre) < 0;
    if (flipped) normal.negate();
    for (const point of flipped ? [p0, p2, p1] : [p0, p1, p2]) {
      positions.push(point.x, point.y, point.z);
      normals.push(normal.x, normal.y, normal.z);
    }
  };

  for (let i = 0; i < sides; i++) {
    const next = ring[(i + 1) % sides];
    addFace(top, ring[i], next);
    addFace(bottom, ring[i], next);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
  return geometry;
}

export interface Fragments {
  mesh: InstancedMesh;
  /** `spread` of 0 keeps the fragments close to the blade and 1 scatters them outward. */
  update: (time: number, spread: number) => void;
}

/** Sharp metal fragments that orbit the blade, each turning on its own axis. */
export function buildFragments(shared: SharedUniforms, count: number): Fragments {
  const mesh = new InstancedMesh(shardGeometry(), metalMaterial(shared, rgb(0xaab2bd)), count);
  mesh.frustumCulled = false;

  const random = seededRandom(73);
  const between = (low: number, high: number) => low + random() * (high - low);

  const items = Array.from({ length: count }, () => ({
    along: between(-3.2, 3.4),
    radius: between(0.6, 1.9),
    angle: between(0, Math.PI * 2),
    orbit: between(0.05, 0.17) * (random() > 0.5 ? 1 : -1),
    spin: between(0.25, 0.8),
    phase: between(0, Math.PI * 2),
    axis: new Vector3(between(-1, 1), between(-1, 1), between(-1, 1)).normalize(),
    scale: new Vector3(between(0.04, 0.1), between(0.07, 0.2), between(0.04, 0.09)),
  }));

  const position = new Vector3();
  const rotation = new Quaternion();
  const scale = new Vector3();
  const matrix = new Matrix4();

  const update = (time: number, spread: number) => {
    items.forEach((item, index) => {
      const angle = item.angle + time * item.orbit;
      const radius = item.radius * (1 + spread * 1.5);
      position.set(
        item.along * (1 + spread * 0.4) + Math.sin(time * 0.3 + item.phase) * 0.08,
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
      );
      rotation.setFromAxisAngle(item.axis, time * item.spin + item.phase);
      // Fragments shrink away as they scatter, so none are left hanging in view.
      matrix.compose(position, rotation, scale.copy(item.scale).multiplyScalar(Math.max(1 - spread, 0.001)));
      mesh.setMatrixAt(index, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  update(0, 0);
  return { mesh, update };
}

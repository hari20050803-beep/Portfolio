import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  DataTexture,
  LinearFilter,
  RedFormat,
  RepeatWrapping,
  UnsignedByteType,
  Vector3,
} from 'three';

export function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function catmullRom(a: number, b: number, c: number, d: number, t: number): number {
  return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t);
}

/** One elliptical cross-section of a lofted shape. */
export interface Ring {
  y: number;
  rx: number;
  rz: number;
  cx?: number;
  cz?: number;
}

function refineRings(rings: Ring[], steps: number): Ring[] {
  const result: Ring[] = [];
  const pick = (index: number) => rings[Math.max(0, Math.min(rings.length - 1, index))];

  for (let i = 0; i < rings.length - 1; i++) {
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const [a, b, c, d] = [pick(i - 1), pick(i), pick(i + 1), pick(i + 2)];
      const blend = (read: (ring: Ring) => number) => catmullRom(read(a), read(b), read(c), read(d), t);
      result.push({
        y: blend((r) => r.y),
        rx: Math.max(0.001, blend((r) => r.rx)),
        rz: Math.max(0.001, blend((r) => r.rz)),
        cx: blend((r) => r.cx ?? 0),
        cz: blend((r) => r.cz ?? 0),
      });
    }
  }
  result.push({ cx: 0, cz: 0, ...rings[rings.length - 1] });
  return result;
}

interface LoftOptions {
  radial?: number;
  steps?: number;
  /** Cloth folds that deepen toward the bottom of the shape. */
  folds?: { count: number; amount: number };
  /** Extra vertical offset at the bottom edge, for a torn hem. */
  hem?: (theta: number) => number;
}

/**
 * Skins a surface through elliptical rings, listed bottom to top. Adds an
 * `aSway` attribute: 1 at the bottom edge and 0 at the top, for wind motion.
 */
export function loft(rings: Ring[], options: LoftOptions = {}): BufferGeometry {
  const { radial = 32, steps = 4, folds, hem } = options;
  const refined = refineRings(rings, steps);
  const rows = refined.length;
  const columns = radial + 1;
  const positions = new Float32Array(rows * columns * 3);
  const sway = new Float32Array(rows * columns);
  const indices: number[] = [];

  for (let i = 0; i < rows; i++) {
    const ring = refined[i];
    const t = i / (rows - 1);
    for (let j = 0; j < columns; j++) {
      // Starting at -PI/2 puts the seam on the side facing away from the camera.
      const theta = -Math.PI / 2 + (j / radial) * Math.PI * 2;
      const fold = folds ? 1 + folds.amount * (1 - t) * Math.sin(theta * folds.count + t * 2.4) : 1;
      const dropOff = (1 - t) ** 5;
      const k = (i * columns + j) * 3;
      positions[k] = (ring.cx ?? 0) + ring.rx * fold * Math.cos(theta);
      positions[k + 1] = ring.y + (hem ? hem(theta) * dropOff : 0);
      positions[k + 2] = (ring.cz ?? 0) + ring.rz * fold * Math.sin(theta);
      sway[i * columns + j] = (1 - t) ** 1.6;

      if (i < rows - 1 && j < radial) {
        const a = i * columns + j;
        const b = a + columns;
        const c = a + 1;
        const d = b + 1;
        indices.push(a, b, c, c, b, d);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSway', new BufferAttribute(sway, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Average the normals on the seam so it doesn't show as a hard edge.
  const normals = geometry.getAttribute('normal') as BufferAttribute;
  for (let i = 0; i < rows; i++) {
    const first = i * columns;
    const last = first + radial;
    const x = normals.getX(first) + normals.getX(last);
    const y = normals.getY(first) + normals.getY(last);
    const z = normals.getZ(first) + normals.getZ(last);
    const length = Math.hypot(x, y, z) || 1;
    normals.setXYZ(first, x / length, y / length, z / length);
    normals.setXYZ(last, x / length, y / length, z / length);
  }

  return geometry;
}

/** A tube along a smooth path, with a radius that varies along its length. */
export function taperedTube(
  points: Vector3[],
  radii: number[],
  segments = 18,
  radial = 10,
): BufferGeometry {
  const curve = new CatmullRomCurve3(points);
  const frames = curve.computeFrenetFrames(segments, false);
  const columns = radial + 1;
  const positions = new Float32Array((segments + 1) * columns * 3);
  const normals = new Float32Array((segments + 1) * columns * 3);
  const indices: number[] = [];
  const point = new Vector3();

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    curve.getPointAt(t, point);

    const scaled = t * (radii.length - 1);
    const low = Math.min(Math.floor(scaled), radii.length - 2);
    const radius = radii[low] + (radii[low + 1] - radii[low]) * (scaled - low);

    for (let j = 0; j < columns; j++) {
      const angle = (j / radial) * Math.PI * 2;
      const nx = frames.normals[i].x * Math.cos(angle) + frames.binormals[i].x * Math.sin(angle);
      const ny = frames.normals[i].y * Math.cos(angle) + frames.binormals[i].y * Math.sin(angle);
      const nz = frames.normals[i].z * Math.cos(angle) + frames.binormals[i].z * Math.sin(angle);
      const k = (i * columns + j) * 3;
      positions[k] = point.x + nx * radius;
      positions[k + 1] = point.y + ny * radius;
      positions[k + 2] = point.z + nz * radius;
      normals[k] = nx;
      normals[k + 1] = ny;
      normals[k + 2] = nz;

      if (i < segments && j < radial) {
        const a = i * columns + j;
        const b = a + 1;
        const c = a + columns;
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  return geometry;
}

/**
 * Bakes tileable noise into a small texture once, so the fog can sample it
 * cheaply each frame rather than computing noise per pixel.
 */
export function bakeNoiseTexture(size = 256): DataTexture {
  const random = seededRandom(11);
  const octaves = [
    { cells: 4, amplitude: 0.5 },
    { cells: 8, amplitude: 0.27 },
    { cells: 16, amplitude: 0.15 },
    { cells: 32, amplitude: 0.08 },
  ].map((octave) => ({
    ...octave,
    lattice: Float32Array.from({ length: octave.cells ** 2 }, () => random()),
  }));

  const smooth = (t: number) => t * t * (3 - 2 * t);
  const data = new Uint8Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let value = 0;
      for (const { cells, amplitude, lattice } of octaves) {
        const fx = (x / size) * cells;
        const fy = (y / size) * cells;
        const x0 = Math.floor(fx) % cells;
        const y0 = Math.floor(fy) % cells;
        const x1 = (x0 + 1) % cells;
        const y1 = (y0 + 1) % cells;
        const tx = smooth(fx - Math.floor(fx));
        const ty = smooth(fy - Math.floor(fy));
        const top = lattice[y0 * cells + x0] * (1 - tx) + lattice[y0 * cells + x1] * tx;
        const bottom = lattice[y1 * cells + x0] * (1 - tx) + lattice[y1 * cells + x1] * tx;
        value += (top * (1 - ty) + bottom * ty) * amplitude;
      }
      data[y * size + x] = Math.min(255, Math.round(value * 255));
    }
  }

  const texture = new DataTexture(data, size, size, RedFormat, UnsignedByteType);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

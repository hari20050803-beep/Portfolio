import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
} from 'three';
import { seededRandom } from './geometry';
import type { SharedUniforms } from './materials';

export interface LightRays {
  mesh: Mesh;
  setStrength: (strength: number) => void;
}

/** Soft shafts of moonlight fanning out from behind the moon, turning very slowly. */
export function addLightRays(scene: Scene, shared: SharedUniforms): LightRays {
  const strength = { value: 1 };
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uNoise: shared.uNoise, uTime: shared.uTime, uStrength: strength },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uNoise;
      uniform float uTime;
      uniform float uStrength;
      varying vec2 vUv;

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float d = length(p);
        // Whole-number multiples keep the pattern seamless around the circle.
        float angle = atan(p.y, p.x) / 6.28318;
        float wide = texture2D(uNoise, vec2(angle * 3.0 + uTime * 0.008, 0.21)).r;
        float fine = texture2D(uNoise, vec2(angle * 8.0 - uTime * 0.013, 0.63)).r;
        float streak = pow(clamp(wide * fine * 2.7, 0.0, 1.0), 2.2);
        float reach = smoothstep(1.0, 0.16, d) * smoothstep(0.12, 0.26, d);
        gl_FragColor = vec4(vec3(0.6, 0.67, 0.78) * streak * reach * uStrength * 0.42, 1.0);
      }
    `,
  });

  const mesh = new Mesh(new PlaneGeometry(86, 86), material);
  mesh.renderOrder = -4;
  scene.add(mesh);

  return {
    mesh,
    setStrength: (value) => {
      strength.value = value;
    },
  };
}

export interface Veil {
  setOpacity: (opacity: number) => void;
}

/** Darkens the scene behind the page content, drawn before the embers so they stay bright. */
export function addVeil(scene: Scene): Veil {
  const opacity = { value: 0 };
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));

  const mesh = new Mesh(
    geometry,
    new ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: { uOpacity: opacity },
      vertexShader: /* glsl */ `
        void main() {
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        void main() {
          gl_FragColor = vec4(0.03, 0.03, 0.04, uOpacity);
        }
      `,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 15;
  scene.add(mesh);

  return {
    setOpacity: (value) => {
      opacity.value = value;
      mesh.visible = value > 0.002;
    },
  };
}

export interface Dust {
  points: Points;
  setShift: (shift: number) => void;
}

/** Slow, soft out-of-focus motes that add depth between the embers and the fog. */
export function addDust(scene: Scene, shared: SharedUniforms, count: number): Dust {
  const random = seededRandom(404);
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < seeds.length; i++) seeds[i] = random();

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 3));

  const shift = { value: 0 };
  const points = new Points(
    geometry,
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: shared.uTime,
        uPixelRatio: shared.uPixelRatio,
        uShift: shift,
        uBoxMin: { value: new Vector3(-9, -2.5, -5) },
        uBoxSize: { value: new Vector3(18, 9, 11.5) },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aSeed;
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uShift;
        uniform vec3 uBoxMin;
        uniform vec3 uBoxSize;
        varying float vGlow;

        void main() {
          vec3 p = aSeed;
          p.x = fract(aSeed.x - uTime * 0.006 * (0.4 + aSeed.y) - uShift);
          p.y = fract(aSeed.y + uTime * 0.007 + 0.03 * sin(uTime * 0.2 + aSeed.z * 12.0));
          vec4 view = viewMatrix * modelMatrix * vec4(uBoxMin + p * uBoxSize, 1.0);
          gl_Position = projectionMatrix * view;
          gl_PointSize = mix(5.0, 19.0, fract(aSeed.z * 17.3)) * uPixelRatio * (9.0 / -view.z);
          vGlow = sin(p.y * 3.14159) * (0.55 + 0.45 * sin(uTime * 0.5 + aSeed.x * 40.0));
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vGlow;
        void main() {
          vec2 q = gl_PointCoord - 0.5;
          float d = dot(q, q) * 4.0;
          if (d > 1.0) discard;
          float soft = pow(1.0 - d, 2.5);
          gl_FragColor = vec4(vec3(0.62, 0.66, 0.72) * soft * vGlow * 0.17, 1.0);
        }
      `,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 18;
  scene.add(points);

  return {
    points,
    setShift: (value) => {
      shift.value = value;
    },
  };
}

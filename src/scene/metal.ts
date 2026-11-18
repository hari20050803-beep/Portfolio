import { DoubleSide, ShaderMaterial, Vector3 } from 'three';
import type { SharedUniforms } from './materials';

/**
 * A hand-built reflection environment. Polished metal only looks like metal when
 * it has something to reflect, so these shaders describe a dark studio with soft
 * lights, and no image files are needed.
 */
const ENVIRONMENT_GLSL = /* glsl */ `
  uniform vec3 uMoonDir;

  vec3 environment(vec3 r) {
    float sky = smoothstep(-0.25, 0.95, r.y);
    vec3 color = mix(vec3(0.018, 0.02, 0.026), vec3(0.17, 0.21, 0.28), sky);

    // A broad soft light behind the camera gives camera-facing steel its brightness.
    float fill = pow(max(dot(r, normalize(vec3(-0.15, 0.25, 0.95))), 0.0), 2.2);
    color += vec3(0.5, 0.54, 0.6) * fill * (0.7 + 0.3 * sin(r.x * 9.0 + r.y * 5.0));

    float key = max(dot(r, normalize(vec3(-0.45, 0.55, 0.7))), 0.0);
    color += vec3(0.92, 0.94, 1.0) * (pow(key, 18.0) * 0.5 + pow(key, 160.0) * 1.5);

    float strip = smoothstep(0.1, 0.0, abs(r.x - 0.38 - r.y * 0.18)) * smoothstep(-0.1, 0.4, r.z);
    color += vec3(0.86, 0.9, 0.98) * strip * 0.8;

    float leftBand = smoothstep(0.42, 0.0, abs(r.x + 0.86 - r.y * 0.2));
    float rightBand = smoothstep(0.36, 0.0, abs(r.x - 0.92 + r.y * 0.15));
    color += vec3(0.62, 0.68, 0.76) * leftBand * 0.62 + vec3(0.72, 0.76, 0.84) * rightBand * 0.5;

    float kicker = max(dot(r, normalize(vec3(0.55, -0.6, 0.55))), 0.0);
    color += vec3(0.86, 0.1, 0.13) * pow(kicker, 10.0) * 0.6;

    float moon = max(dot(r, uMoonDir), 0.0);
    color += vec3(1.0, 0.96, 0.88) * pow(moon, 60.0) * 1.1;
    return color;
  }
`;

const WORLD_VERTEX_GLSL = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  void setWorldVaryings() {
    #ifdef USE_INSTANCING
    mat4 world = modelMatrix * instanceMatrix;
    #else
    mat4 world = modelMatrix;
    #endif
    vec4 worldPosition = world * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vWorldNormal = mat3(world) * normal;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

/** Polished metal for the guard, collars and floating fragments. */
export function metalMaterial(shared: SharedUniforms, tint: Vector3): ShaderMaterial {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { uMoonDir: shared.uMoonDir, uTint: { value: tint } },
    vertexShader: /* glsl */ `
      ${WORLD_VERTEX_GLSL}
      void main() {
        setWorldVaryings();
      }
    `,
    fragmentShader: /* glsl */ `
      ${ENVIRONMENT_GLSL}
      uniform vec3 uTint;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;

      void main() {
        vec3 n = normalize(vWorldNormal);
        vec3 v = normalize(cameraPosition - vWorldPos);
        float fresnel = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 5.0);
        vec3 color = environment(reflect(-v, n)) * mix(uTint, vec3(1.0), fresnel);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/**
 * Blade steel: mirror polish on the flats, a wavy pale temper line along the
 * edge, and a thin crimson light that travels along the blade.
 */
export function bladeSteelMaterial(shared: SharedUniforms): ShaderMaterial {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: {
      uMoonDir: shared.uMoonDir,
      uTime: shared.uTime,
      uNoise: shared.uNoise,
    },
    vertexShader: /* glsl */ `
      ${WORLD_VERTEX_GLSL}
      attribute float aAlong;
      attribute float aAcross;
      varying float vAlong;
      varying float vAcross;

      void main() {
        vAlong = aAlong;
        vAcross = aAcross;
        setWorldVaryings();
      }
    `,
    fragmentShader: /* glsl */ `
      ${ENVIRONMENT_GLSL}
      uniform float uTime;
      uniform sampler2D uNoise;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      varying float vAlong;
      varying float vAcross;

      void main() {
        vec3 n = normalize(vWorldNormal);
        vec3 v = normalize(cameraPosition - vWorldPos);
        float fresnel = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 5.0);
        vec3 color = environment(reflect(-v, n)) * mix(vec3(0.86, 0.89, 0.93), vec3(1.0), fresnel);

        float wave = texture2D(uNoise, vec2(vAlong * 3.0, 0.2)).r;
        float temperLine = 0.2 + 0.2 * wave + 0.02 * sin(vAlong * 120.0);
        float temper = smoothstep(temperLine + 0.05, temperLine - 0.05, vAcross);
        float luminance = dot(color, vec3(0.3, 0.6, 0.1));
        color = mix(color, vec3(0.74, 0.78, 0.84) * (0.42 + 0.58 * luminance), temper * 0.6);

        color *= 0.9 + 0.2 * texture2D(uNoise, vec2(vAlong * 18.0, vAcross * 2.0)).r;
        color += vec3(0.95) * smoothstep(0.035, 0.0, vAcross) * 0.45;

        float groove = smoothstep(0.022, 0.0, abs(vAcross - 0.78));
        float pulseAt = fract(uTime * 0.085) * 1.5 - 0.25;
        float pulse = smoothstep(0.18, 0.0, abs(vAlong - pulseAt));
        color += vec3(0.92, 0.12, 0.16) * groove * (0.16 + pulse * 1.7);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/** Dark crimson silk wrapped in diamonds over a pale textured grip. */
export function hiltMaterial(shared: SharedUniforms): ShaderMaterial {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { uNoise: shared.uNoise },
    vertexShader: /* glsl */ `
      ${WORLD_VERTEX_GLSL}
      attribute float aAlong;
      attribute float aAngle;
      varying float vAlong;
      varying float vAngle;

      void main() {
        vAlong = aAlong;
        vAngle = aAngle;
        setWorldVaryings();
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uNoise;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      varying float vAlong;
      varying float vAngle;

      void main() {
        vec2 grid = vec2(vAlong * 7.0, vAngle * 4.0);
        float a = fract(grid.x + grid.y);
        float b = fract(grid.x - grid.y);
        float line = min(min(a, 1.0 - a), min(b, 1.0 - b));
        float diamond = smoothstep(0.13, 0.18, line);

        float grain = texture2D(uNoise, vec2(vAlong * 12.0, vAngle * 6.0)).r;
        vec3 silk = vec3(0.24, 0.04, 0.06) * (0.65 + 0.7 * smoothstep(0.0, 0.13, line));
        vec3 skin = vec3(0.58, 0.54, 0.48) * (0.65 + 0.55 * grain);
        vec3 base = mix(silk, skin, diamond);

        vec3 n = normalize(vWorldNormal);
        vec3 v = normalize(cameraPosition - vWorldPos);
        float light = 0.3 + 0.75 * max(dot(n, normalize(vec3(-0.4, 0.6, 0.7))), 0.0);
        float rim = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 4.0);
        gl_FragColor = vec4(base * light + vec3(0.42, 0.48, 0.58) * rim * 0.5, 1.0);
      }
    `,
  });
}

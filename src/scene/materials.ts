import {
  AdditiveBlending,
  DataTexture,
  DoubleSide,
  ShaderMaterial,
  Vector2,
  Vector3,
  type IUniform,
} from 'three';

/** Converts 0xRRGGBB to a shader-ready colour. The scene works directly in display colours. */
export function rgb(hex: number): Vector3 {
  return new Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255);
}

export interface SharedUniforms {
  uTime: IUniform<number>;
  uMoonDir: IUniform<Vector3>;
  uNoise: IUniform<DataTexture>;
  uPixelRatio: IUniform<number>;
}

const STEEL_RIM = rgb(0x9db0c6);

/** Dark surfaces lit only by a moonlit rim: the figure, the ridge, the sword fittings. */
export function inkMaterial(
  shared: SharedUniforms,
  options: { base: Vector3; rimStrength?: number; wind?: boolean },
): ShaderMaterial {
  return new ShaderMaterial({
    side: DoubleSide,
    defines: options.wind ? { WIND: 1 } : {},
    uniforms: {
      uTime: shared.uTime,
      uMoonDir: shared.uMoonDir,
      uBase: { value: options.base },
      uRim: { value: STEEL_RIM },
      uRimStrength: { value: options.rimStrength ?? 1 },
    },
    vertexShader: /* glsl */ `
      #ifdef WIND
      attribute float aSway;
      uniform float uTime;
      #endif
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;

      void main() {
        vec3 p = position;
        #ifdef WIND
        float a = atan(p.z, p.x);
        float w1 = sin(uTime * 1.35 + p.y * 2.6 + a * 1.5);
        float w2 = sin(uTime * 2.6 + p.y * 5.7 + a * 3.0);
        p.x -= aSway * (0.085 + 0.055 * w1 + 0.018 * w2);
        p.z += aSway * (0.03 * w2 - 0.02 * w1);
        p.y += aSway * 0.018 * w1;
        #endif
        vec4 world = modelMatrix * vec4(p, 1.0);
        vWorldPos = world.xyz;
        vWorldNormal = mat3(modelMatrix) * normal;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase;
      uniform vec3 uRim;
      uniform vec3 uMoonDir;
      uniform float uRimStrength;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;

      void main() {
        vec3 n = normalize(vWorldNormal);
        float inner = 1.0;
        if (!gl_FrontFacing) {
          n = -n;
          inner = 0.12;
        }
        vec3 v = normalize(cameraPosition - vWorldPos);
        // Capped so folds at grazing angles catch a glint rather than turning white.
        float rim = min(pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 4.0), 0.42) * inner;
        float lit = clamp(dot(n, uMoonDir) * 0.6 + 0.4, 0.0, 1.0);
        float top = clamp(n.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 color = uBase * (0.75 + 0.6 * top) + uRim * rim * lit * uRimStrength;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/** A polished blade with a pale cutting edge and a slow travelling glint. */
export function bladeMaterial(shared: SharedUniforms): ShaderMaterial {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { uTime: shared.uTime },
    vertexShader: /* glsl */ `
      attribute float aAlong;
      attribute float aAcross;
      varying float vAlong;
      varying float vAcross;

      void main() {
        vAlong = aAlong;
        vAcross = aAcross;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying float vAlong;
      varying float vAcross;

      void main() {
        vec3 spine = vec3(0.30, 0.36, 0.42);
        vec3 edge = vec3(0.86, 0.90, 0.94);
        vec3 color = mix(spine, edge, smoothstep(0.32, 0.9, vAcross));
        float glintAt = fract(uTime * 0.11) * 1.8 - 0.4;
        float glint = smoothstep(0.13, 0.0, abs(vAlong - glintAt));
        color += vec3(0.9, 0.92, 0.96) * glint * 0.75;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/** A strip of cloth that streams in the wind. All of its motion is in the vertex shader. */
export function ribbonMaterial(
  shared: SharedUniforms,
  options: { origin: Vector3; length: number; width: number; phase: number; droop: number },
): ShaderMaterial {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: {
      uTime: shared.uTime,
      uOrigin: { value: options.origin },
      uLength: { value: options.length },
      uWidth: { value: options.width },
      uPhase: { value: options.phase },
      uDroop: { value: options.droop },
    },
    vertexShader: /* glsl */ `
      attribute float aAlong;
      attribute float aSide;
      uniform float uTime;
      uniform vec3 uOrigin;
      uniform float uLength;
      uniform float uWidth;
      uniform float uPhase;
      uniform float uDroop;
      varying float vAlong;
      varying float vShade;

      void main() {
        float t = aAlong;
        float wave1 = sin(t * 5.2 + uTime * 2.4 + uPhase);
        float wave2 = sin(t * 11.0 + uTime * 3.7 + uPhase * 1.7);

        vec3 p = uOrigin;
        p.x -= t * uLength;
        p.y += -uDroop * t * t + wave1 * (0.02 + 0.2 * t) + wave2 * 0.04 * t;
        p.z += cos(t * 4.1 + uTime * 1.9 + uPhase) * (0.02 + 0.18 * t);

        float taper = (1.0 - pow(t, 2.5)) * 0.85 + 0.15;
        float twist = wave2 * 0.6 * t;
        vec3 across = normalize(vec3(0.12, cos(twist), sin(twist)));
        p += across * aSide * uWidth * 0.5 * taper;

        vAlong = t;
        vShade = 0.6 + 0.4 * wave1 * wave2 + 0.25 * wave2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlong;
      varying float vShade;

      void main() {
        vec3 color = mix(vec3(0.42, 0.06, 0.09), vec3(0.76, 0.13, 0.16), vShade);
        color *= 1.0 - 0.3 * vAlong;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

export function skyMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = position.xy * 0.5 + 0.5;
        gl_Position = vec4(position.xy, 1.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        float y = vUv.y;
        vec3 low = vec3(0.150, 0.180, 0.220);
        vec3 mid = vec3(0.058, 0.070, 0.092);
        vec3 top = vec3(0.022, 0.024, 0.034);
        vec3 color = mix(low, mid, smoothstep(0.1, 0.56, y));
        color = mix(color, top, smoothstep(0.5, 1.0, y));
        // A faint ember-coloured glow low on the horizon.
        float band = exp(-pow((y - 0.2) * 5.5, 2.0));
        color += vec3(0.13, 0.022, 0.03) * band * smoothstep(0.15, 0.95, vUv.x);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

export function moonMaterial(shared: SharedUniforms, radius: number): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { uNoise: shared.uNoise, uRadius: { value: radius }, uGain: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uNoise;
      uniform float uRadius;
      uniform float uGain;
      varying vec2 vUv;

      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float d = length(p);
        float disc = smoothstep(uRadius, uRadius - 0.006, d);
        float mottle = texture2D(uNoise, p * 0.85 + 0.5).r;
        vec3 surface = mix(vec3(0.80, 0.77, 0.70), vec3(0.93, 0.90, 0.82), smoothstep(0.3, 0.68, mottle));
        float mistFade = mix(0.42, 1.0, smoothstep(-uRadius, uRadius * 0.15, p.y));
        float outside = max(d - uRadius, 0.0);
        float halo = exp(-outside * 6.5) * 0.3 + exp(-outside * 2.0) * 0.13;
        halo *= smoothstep(1.0, 0.72, d);
        vec3 color = surface * disc * mistFade + vec3(0.52, 0.60, 0.72) * halo * (1.0 - disc);
        gl_FragColor = vec4(color * uGain, 1.0);
      }
    `,
  });
}

/** Flat building silhouettes that dissolve into mist toward their base. */
export function skylineMaterial(color: Vector3, mist: Vector3, fadeLow: number, fadeHigh: number): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: color },
      uMist: { value: mist },
      uFade: { value: new Vector2(fadeLow, fadeHigh) },
    },
    vertexShader: /* glsl */ `
      varying float vY;
      void main() {
        vY = (modelMatrix * vec4(position, 1.0)).y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uMist;
      uniform vec2 uFade;
      varying float vY;
      void main() {
        gl_FragColor = vec4(mix(uMist, uColor, smoothstep(uFade.x, uFade.y, vY)), 1.0);
      }
    `,
  });
}

/** Tiled roof. The tile ribs are drawn per pixel, which keeps the mesh very light. */
export function roofMaterial(shared: SharedUniforms): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: { uMoonDir: shared.uMoonDir, uNoise: shared.uNoise },
    vertexShader: /* glsl */ `
      varying vec3 vLocal;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      varying vec3 vWorldTangent;

      void main() {
        vLocal = position;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorldPos = world.xyz;
        vWorldNormal = mat3(modelMatrix) * normal;
        vWorldTangent = mat3(modelMatrix) * vec3(1.0, 0.0, 0.0);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uMoonDir;
      uniform sampler2D uNoise;
      varying vec3 vLocal;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      varying vec3 vWorldTangent;

      void main() {
        float across = fract(vLocal.x / 0.25) * 2.0 - 1.0;
        vec3 n = normalize(vWorldNormal + normalize(vWorldTangent) * across * 0.7);
        vec3 v = normalize(cameraPosition - vWorldPos);
        vec3 h = normalize(uMoonDir + v);

        float crest = 1.0 - abs(across);
        float valley = mix(0.32, 1.0, smoothstep(0.0, 0.55, crest));
        float lap = fract(vLocal.z / 0.3 + sin(floor(vLocal.x / 0.25) * 12.9) * 0.08);
        float course = mix(0.42, 1.0, smoothstep(0.0, 0.2, lap));

        float diffuse = max(dot(n, uMoonDir), 0.0);
        float specular = pow(max(dot(n, h), 0.0), 58.0) * smoothstep(0.05, 0.5, lap);
        float grime = 0.72 + 0.56 * texture2D(uNoise, vLocal.xz * 0.2).r;

        vec3 color = vec3(0.03, 0.033, 0.042) * (0.8 + diffuse * 1.9);
        color += vec3(0.48, 0.56, 0.68) * specular * 0.3;
        color *= valley * course * grime;

        // The lower roof falls away into ink.
        float fall = smoothstep(-0.25, -1.7, vWorldPos.y);
        color = mix(color, vec3(0.03, 0.033, 0.042), fall * 0.86);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

export function fogMaterial(
  shared: SharedUniforms,
  options: { color: Vector3; opacity: number; scale: Vector2; drift: Vector2; overlay: boolean },
): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    // Foreground layers would otherwise be cut off in a hard line where they meet the roof.
    depthTest: !options.overlay,
    uniforms: {
      uTime: shared.uTime,
      uNoise: shared.uNoise,
      uColor: { value: options.color },
      uOpacity: { value: options.opacity },
      uScale: { value: options.scale },
      uDrift: { value: options.drift },
    },
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
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform vec2 uScale;
      uniform vec2 uDrift;
      varying vec2 vUv;

      void main() {
        float a = texture2D(uNoise, vUv * uScale + uDrift * uTime).r;
        float b = texture2D(uNoise, vUv * uScale * 1.9 - uDrift * uTime * 0.6 + 0.37).r;
        float density = smoothstep(0.34, 0.8, a * 0.68 + b * 0.42);
        density *= smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.42, vUv.y);
        density *= smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
        gl_FragColor = vec4(uColor, density * uOpacity);
      }
    `,
  });
}

export function emberMaterial(shared: SharedUniforms, boxMin: Vector3, boxSize: Vector3): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: shared.uTime,
      uPixelRatio: shared.uPixelRatio,
      uBoxMin: { value: boxMin },
      uBoxSize: { value: boxSize },
      uShift: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aSeed;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform vec3 uBoxMin;
      uniform vec3 uBoxSize;
      uniform float uShift;
      varying float vGlow;

      void main() {
        float speed = mix(0.35, 1.0, aSeed.y);
        vec3 p;
        p.y = fract(aSeed.y + uTime * speed * 0.05);
        p.x = fract(aSeed.x - uTime * speed * 0.022 + 0.02 * sin(uTime * 0.6 + aSeed.z * 20.0) - uShift);
        p.z = aSeed.z;

        vec4 view = viewMatrix * modelMatrix * vec4(uBoxMin + p * uBoxSize, 1.0);
        gl_Position = projectionMatrix * view;
        gl_PointSize = mix(2.6, 6.4, fract(aSeed.x * 31.7)) * uPixelRatio * (11.0 / -view.z);

        float life = sin(p.y * 3.14159);
        float flicker = 0.65 + 0.35 * sin(uTime * (2.0 + aSeed.z * 5.0) + aSeed.x * 50.0);
        vGlow = life * flicker;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vGlow;
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float d = dot(q, q) * 4.0;
        if (d > 1.0) discard;
        float core = pow(1.0 - d, 2.0);
        vec3 color = mix(vec3(0.71, 0.13, 0.12), vec3(1.0, 0.55, 0.30), core);
        gl_FragColor = vec4(color * core * vGlow, 1.0);
      }
    `,
  });
}

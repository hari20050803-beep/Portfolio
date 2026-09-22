import { useEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import { useReducedMotion } from '../../lib/hooks'

/*
 * "Signal field": a slowly breathing terrain of points seen in perspective,
 * lit by a soft key light that follows the cursor. Raw WebGL, one draw call,
 * no dependencies. Renders a single still frame for reduced motion and pauses
 * whenever it is off-screen or the tab is hidden.
 */

const VERTEX = /* glsl */ `
precision highp float;
attribute vec2 aGrid;
uniform float uTime;
uniform vec2 uCamera;
uniform float uAspect;
uniform float uSpan;
uniform float uPixelRatio;
varying float vAlpha;
varying float vCrest;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  // More rows close to the camera so the field fills the lower half of the frame.
  float z = 1.4 + pow(aGrid.y, 1.45) * 26.0;
  float x = (aGrid.x - 0.5) * (z + 2.5) * uSpan;
  float t = uTime;

  float h = snoise(vec2(x * 0.085 + t * 0.035, z * 0.11 - t * 0.055)) * 0.95;
  h += snoise(vec2(x * 0.24 - t * 0.05, z * 0.22 + t * 0.04)) * 0.22;
  h += sin(x * 0.16 + z * 0.2 - t * 0.32) * 0.22;

  vec3 cam = vec3(uCamera.x * 0.9, 3.0 - uCamera.y * 0.3, -1.2);
  vec3 r = vec3(x, h, z) - cam;
  float c = cos(0.3);
  float s = sin(0.3);
  vec3 v = vec3(r.x, r.y * c + r.z * s, -r.y * s + r.z * c);

  float focal = 1.35;
  gl_Position = vec4(v.x * focal / uAspect, v.y * focal - 0.06, 0.0, v.z);
  gl_PointSize = clamp(7.5 * uPixelRatio / v.z, 1.0 * uPixelRatio, 3.2 * uPixelRatio);

  float fog = 1.0 - smoothstep(5.0, 25.0, v.z);
  float nearFade = smoothstep(2.3, 4.8, v.z);
  float ndcX = abs(gl_Position.x / gl_Position.w);
  float edge = 1.0 - smoothstep(0.72, 1.12, ndcX);
  vCrest = smoothstep(-0.55, 0.95, h);
  vAlpha = fog * nearFade * edge * (0.22 + 0.78 * vCrest);
}
`

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform vec3 uBase;
uniform vec3 uAccent;
uniform vec2 uLight;
uniform float uLightRadius;
uniform float uIntensity;
varying float vAlpha;
varying float vCrest;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float disc = smoothstep(0.25, 0.04, dot(c, c));
  float light = 1.0 - smoothstep(0.0, uLightRadius, distance(gl_FragCoord.xy, uLight));
  light *= light;
  vec3 color = mix(uBase, uAccent, clamp(vCrest * 0.45 + light * 0.9, 0.0, 1.0));
  float a = disc * vAlpha * (0.42 + 1.9 * light) * uIntensity;
  gl_FragColor = vec4(color * a, a);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
  if (!vs || !fs) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

function buildGrid(cols: number, rows: number) {
  const data = new Float32Array(cols * rows * 2)
  let i = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      data[i++] = c / (cols - 1)
      data[i++] = r / (rows - 1)
    }
  }
  return data
}

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255] as const
}

export function SignalField({ active, className }: { active: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeRef = useRef(active)
  const reduced = useReducedMotion()

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    })
    if (!gl) return

    const program = createProgram(gl)
    if (!program) return
    gl.useProgram(program)

    const u = (name: string) => gl.getUniformLocation(program, name)
    const uni = {
      time: u('uTime'),
      camera: u('uCamera'),
      aspect: u('uAspect'),
      span: u('uSpan'),
      pixelRatio: u('uPixelRatio'),
      base: u('uBase'),
      accent: u('uAccent'),
      light: u('uLight'),
      lightRadius: u('uLightRadius'),
      intensity: u('uIntensity'),
    }
    gl.uniform3fv(uni.base, hexToRgb('#d6d9e0'))
    gl.uniform3fv(uni.accent, hexToRgb('#9bb3d6'))

    const buffer = gl.createBuffer()
    const aGrid = gl.getAttribLocation(program, 'aGrid')
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(aGrid)
    gl.vertexAttribPointer(aGrid, 2, gl.FLOAT, false, 0, 0)

    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    let count = 0
    let cols = 0
    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight)
      gl.uniform1f(uni.aspect, aspect)
      gl.uniform1f(uni.span, (1.6 * aspect) / 1.35)
      gl.uniform1f(uni.pixelRatio, dpr)
      gl.uniform1f(uni.lightRadius, Math.max(width, height) * 0.34)
      const nextCols = Math.round(Math.min(230, Math.max(96, canvas.clientWidth / 6.5)))
      if (nextCols !== cols) {
        cols = nextCols
        const rows = Math.round(cols * 0.55)
        const grid = buildGrid(cols, rows)
        gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW)
        count = cols * rows
      }
    }

    // Pointer: camera drifts with the cursor, the key light follows it.
    const camera = { x: 0, y: 0, tx: 0, ty: 0 }
    const light = { x: 0, y: 0, tx: 0, ty: 0, lastMove: -Infinity }
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      camera.tx = (event.clientX / window.innerWidth) * 2 - 1
      camera.ty = (event.clientY / window.innerHeight) * 2 - 1
      light.tx = (event.clientX - rect.left) * dpr
      light.ty = (rect.height - (event.clientY - rect.top)) * dpr
      light.lastMove = performance.now()
    }

    let raf = 0
    let running = false
    let visible = true
    let intensity = 0
    const start = performance.now()
    let last = start

    // Frame-rate independent easing towards a target.
    const approach = (current: number, target: number, rate: number, dt: number) =>
      current + (target - current) * (1 - Math.exp(-rate * dt))

    const draw = (now: number) => {
      const t = (now - start) / 1000
      const dt = Math.min(0.25, Math.max(0, (now - last) / 1000))
      last = now
      // With no recent pointer input, the light drifts on its own.
      if (now - light.lastMove > 2500) {
        light.tx = width * (0.64 + Math.sin(t * 0.13) * 0.16)
        light.ty = height * (0.4 + Math.cos(t * 0.1) * 0.08)
      }
      camera.x = approach(camera.x, camera.tx, 2.1, dt)
      camera.y = approach(camera.y, camera.ty, 2.1, dt)
      light.x = approach(light.x, light.tx, 5, dt)
      light.y = approach(light.y, light.ty, 5, dt)
      intensity = approach(intensity, activeRef.current ? 1 : 0, 1.4, dt)

      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uni.time, t + 40)
      gl.uniform2f(uni.camera, camera.x, camera.y)
      gl.uniform2f(uni.light, light.x, light.y)
      gl.uniform1f(uni.intensity, intensity)
      gl.drawArrays(gl.POINTS, 0, count)
    }

    const loop = (now: number) => {
      draw(now)
      raf = running ? requestAnimationFrame(loop) : 0
    }
    const play = () => {
      if (running || reduced) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    const pause = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const renderStill = () => {
      light.x = light.tx = width * 0.64
      light.y = light.ty = height * 0.4
      light.lastMove = Infinity
      intensity = 1
      activeRef.current = true
      last = start + 12_000
      draw(start + 12_000)
    }

    resize()
    light.x = light.tx = width * 0.64
    light.y = light.ty = height * 0.4

    const resizeObserver = new ResizeObserver(() => {
      resize()
      if (reduced) renderStill()
    })
    resizeObserver.observe(canvas)

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !document.hidden) play()
      else pause()
    })
    intersection.observe(canvas)

    const onVisibility = () => {
      if (document.hidden) pause()
      else if (visible) play()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const onContextLost = (event: Event) => {
      event.preventDefault()
      pause()
    }
    canvas.addEventListener('webglcontextlost', onContextLost)

    if (reduced) renderStill()
    else {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      play()
    }

    return () => {
      pause()
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [reduced])

  return <canvas ref={canvasRef} aria-hidden="true" className={cn('block', className)} />
}

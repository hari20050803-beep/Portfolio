import { useEffect, useRef } from 'react'
import { useFinePointer, useReducedMotion } from '../../lib/hooks'

type CursorState = 'default' | 'hover' | 'label' | 'hidden'

const INTERACTIVE = 'a, button, [role="button"], label, select, summary, [data-cursor]'

/**
 * A quiet two-part cursor: an exact dot and a trailing ring. Grows over
 * interactive elements and shows a short label over elements that set
 * `data-cursor-label`. Mouse only, never on touch or reduced motion.
 */
export function Cursor() {
  const finePointer = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = finePointer && !reduced
  const rootRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    const labelEl = labelRef.current
    if (!enabled || !root || !dot || !ring || !labelEl) return

    const html = document.documentElement
    html.classList.add('has-cursor')

    let x = -100
    let y = -100
    let rx = -100
    let ry = -100
    let raf = 0
    let seen = false

    const tick = () => {
      rx += (x - rx) * 0.2
      ry += (y - ry) * 0.2
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const setState = (state: CursorState) => {
      if (root.dataset.state !== state) root.dataset.state = state
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      x = event.clientX
      y = event.clientY
      if (!seen) {
        seen = true
        rx = x
        ry = y
      }
      root.dataset.visible = 'true'
      kick()
    }

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target) return
      if (target.closest('input, textarea')) return setState('hidden')
      const labelled = target.closest<HTMLElement>('[data-cursor-label]')
      if (labelled) {
        labelEl.textContent = labelled.dataset.cursorLabel ?? ''
        return setState('label')
      }
      setState(target.closest(INTERACTIVE) ? 'hover' : 'default')
    }

    const onLeave = () => {
      root.dataset.visible = 'false'
    }
    const onDown = () => root.setAttribute('data-pressed', 'true')
    const onUp = () => root.removeAttribute('data-pressed')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      html.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-state="default"
      data-visible="false"
      className="group/cursor pointer-events-none fixed inset-0 z-[100] opacity-0 mix-blend-difference transition-opacity duration-300 data-[visible=true]:opacity-100"
    >
      <div ref={ringRef} className="absolute top-0 left-0 will-change-transform">
        <div
          className={[
            'flex size-9 items-center justify-center rounded-full border border-white/40',
            'transition-[width,height,background-color,border-color,opacity,transform] duration-500 ease-cinematic',
            'group-data-[state=hover]/cursor:size-14 group-data-[state=hover]/cursor:border-white/80',
            'group-data-[state=label]/cursor:size-20 group-data-[state=label]/cursor:border-transparent group-data-[state=label]/cursor:bg-fog-50',
            'group-data-[state=hidden]/cursor:opacity-0 group-data-[pressed=true]/cursor:scale-90',
          ].join(' ')}
        >
          <span
            ref={labelRef}
            className="text-[0.6875rem] font-medium tracking-[0.12em] text-ink-950 uppercase opacity-0 transition-opacity duration-300 group-data-[state=label]/cursor:opacity-100"
          />
        </div>
      </div>
      <div
        ref={dotRef}
        className="absolute top-0 left-0 size-1.5 rounded-full bg-white transition-opacity duration-300 will-change-transform group-data-[state=hidden]/cursor:opacity-0 group-data-[state=label]/cursor:opacity-0"
      />
    </div>
  )
}

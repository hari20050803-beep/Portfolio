import { motion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { createContext, useContext, useMemo, type PointerEvent, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { useFinePointer, useReducedMotion } from '../../lib/hooks'

interface SceneValue {
  x: MotionValue<number>
  y: MotionValue<number>
}

const SceneContext = createContext<SceneValue | null>(null)

const spring = { stiffness: 55, damping: 18, mass: 0.6 }

/** Lit, gridded backdrop for a project screenshot; tracks the pointer for a subtle depth shift. */
export function Scene({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  const fine = useFinePointer()
  const x = useSpring(0, spring)
  const y = useSpring(0, spring)
  const tracking = fine && !reduced

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(((event.clientX - rect.left) / rect.width) * 2 - 1)
    y.set(((event.clientY - rect.top) / rect.height) * 2 - 1)
  }
  const onPointerLeave = () => {
    x.set(0)
    y.set(0)
  }

  const value = useMemo(() => ({ x, y }), [x, y])

  return (
    <SceneContext.Provider value={value}>
      <div
        onPointerMove={tracking ? onPointerMove : undefined}
        onPointerLeave={tracking ? onPointerLeave : undefined}
        className={cn('relative h-full w-full overflow-hidden', className)}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_60%_at_60%_30%,rgb(155_179_214/0.12),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 [background-image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        />
        {children}
      </div>
    </SceneContext.Provider>
  )
}

function useScene() {
  const scene = useContext(SceneContext)
  if (!scene) throw new Error('<Layer> must be used inside <Scene>')
  return scene
}

/** Shifts slightly with the pointer; larger depth = closer to the viewer. */
export function Layer({ depth, children, className }: { depth: number; children: ReactNode; className?: string }) {
  const { x, y } = useScene()
  const tx = useTransform(x, (value) => value * depth)
  const ty = useTransform(y, (value) => value * depth * 0.7)
  return (
    <motion.div className={className} style={{ x: tx, y: ty }}>
      {children}
    </motion.div>
  )
}

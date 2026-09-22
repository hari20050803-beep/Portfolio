import { motion } from 'motion/react'
import type { ArchitectureNode, Project } from '../../data/types'
import { cn } from '../../lib/cn'
import { EASE_OUT, inView, stagger } from '../../lib/motion'

const pad = (n: number) => String(n).padStart(2, '0')

const nodeVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE_OUT } },
}

function Flow({ nodes }: { nodes: readonly ArchitectureNode[] }) {
  const cols = { 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }[nodes.length] ?? 'md:grid-cols-4'
  return (
    <motion.ol
      className={cn('grid gap-10 md:gap-6', cols)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      variants={stagger(0.12)}
    >
      {nodes.map((node, index) => {
        const last = index === nodes.length - 1
        return (
          <motion.li key={node.name} variants={nodeVariant} className="relative">
            <div className="panel flex h-full flex-col rounded-2xl p-6 lg:p-7">
              <p className="eyebrow text-fog-500">{pad(index + 1)}</p>
              <p className="mt-10 text-2xl font-medium tracking-[-0.03em] text-fog-50">{node.name}</p>
              <p className="mt-1.5 font-mono text-xs tracking-wide text-accent">{node.detail}</p>
              <p className="mt-6 text-sm leading-relaxed text-fog-400">{node.role}</p>
            </div>
            {!last && (
              <span
                aria-hidden="true"
                className="absolute top-full left-8 flex h-10 w-px flex-col items-center md:top-1/2 md:left-full md:h-px md:w-6"
              >
                <span className="h-full w-full bg-gradient-to-b from-accent/70 to-white/10 md:bg-gradient-to-r" />
              </span>
            )}
          </motion.li>
        )
      })}
    </motion.ol>
  )
}

function Stack({ nodes }: { nodes: readonly ArchitectureNode[] }) {
  const indents = ['md:ml-0', 'md:ml-[5%]', 'md:ml-[10%]', 'md:ml-[15%]']
  return (
    <motion.ol className="space-y-3" initial="hidden" whileInView="visible" viewport={inView} variants={stagger(0.12)}>
      {nodes.map((node, index) => (
        <motion.li
          key={node.name}
          variants={nodeVariant}
          className={cn('panel grid items-baseline gap-3 rounded-2xl p-6 md:grid-cols-12 md:gap-6 md:p-8', indents[index])}
        >
          <span className="eyebrow text-fog-500 md:col-span-1">{pad(index + 1)}</span>
          <span className="eyebrow text-accent md:col-span-3">{node.detail}</span>
          <span className="text-2xl font-medium tracking-[-0.03em] text-fog-50 md:col-span-4">{node.name}</span>
          <span className="leading-relaxed text-fog-400 md:col-span-4">{node.role}</span>
        </motion.li>
      ))}
    </motion.ol>
  )
}

export function Architecture({ project }: { project: Project }) {
  return project.architecture.kind === 'layers' ? (
    <Stack nodes={project.architecture.nodes} />
  ) : (
    <Flow nodes={project.architecture.nodes} />
  )
}

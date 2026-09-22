import { projectShots, type ProjectShot } from '../../data/projectMedia'
import type { Project } from '../../data/types'
import { cn } from '../../lib/cn'
import { Layer, Scene } from './Scene'

type FrameProps = { shot: ProjectShot; sizes: string }

const frameShadow = 'shadow-[0_50px_100px_-40px_rgb(0_0_0/0.95)]'

function Shot({ shot, sizes, className }: FrameProps & { className?: string }) {
  return (
    <picture>
      <source type="image/avif" srcSet={shot.avifSet} sizes={sizes} />
      <img
        src={shot.src}
        srcSet={shot.webpSet}
        sizes={sizes}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  )
}

/** Web app (KMC): minimal browser chrome, no invented URL. */
function BrowserFrame({ shot, sizes }: FrameProps) {
  return (
    <div className={cn('w-[88%] max-w-[54rem] overflow-hidden rounded-xl border border-white/12 bg-ink-900', frameShadow)}>
      <div aria-hidden="true" className="flex h-7 items-center gap-1.5 border-b border-white/[0.07] bg-ink-800 px-3.5 sm:h-8">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="size-2 rounded-full bg-white/15" />
        ))}
        <span className="ml-4 h-3 w-2/5 max-w-[16rem] rounded-full bg-white/[0.07]" />
      </div>
      <Shot shot={shot} sizes={sizes} className="block h-auto w-full" />
    </div>
  )
}

/** Desktop app (Cupcake): a plain window bar carrying the app's real window title. */
function WindowFrame({ shot, sizes }: FrameProps) {
  return (
    <div className={cn('w-[88%] max-w-[54rem] overflow-hidden rounded-lg border border-white/12 bg-ink-900', frameShadow)}>
      <div
        aria-hidden="true"
        className="flex h-7 items-center justify-between bg-[#f3f3f3] pl-3 text-[0.6875rem] whitespace-pre text-[#26262b] sm:h-8"
      >
        <span className="truncate">{shot.windowTitle}</span>
        <span className="flex h-full shrink-0 items-center text-[#5c5c64]">
          {['–', '▢', '✕'].map((glyph) => (
            <span key={glyph} className="flex h-full w-9 items-center justify-center">
              {glyph}
            </span>
          ))}
        </span>
      </div>
      <Shot shot={shot} sizes={sizes} className="block h-auto w-full" />
    </div>
  )
}

/** Mobile app (Learnova): a phone body around the real screenshot. */
function PhoneFrame({ shot, sizes }: FrameProps) {
  return (
    <div
      className={cn('relative h-[88%] rounded-[2.2rem] border border-white/15 bg-ink-900 p-[0.55rem]', frameShadow)}
      style={{ aspectRatio: `${shot.width} / ${shot.height}` }}
    >
      <Shot shot={shot} sizes={sizes} className="h-full w-full rounded-[1.7rem] object-cover object-top" />
    </div>
  )
}

const frames = { browser: BrowserFrame, desktop: WindowFrame, phone: PhoneFrame }

// Rendered width of the screenshot in each context, so the browser picks the right file.
const sizesFor = {
  card: { phone: '(min-width: 1024px) 300px, 200px', landscape: '(min-width: 1024px) 41vw, 88vw' },
  hero: { phone: '(min-width: 1024px) 320px, 50vw', landscape: '(min-width: 1536px) 1210px, 86vw' },
}

/** The project's real screenshot in a device frame, on a lit backdrop. */
export function ProjectVisual({ project, variant = 'card' }: { project: Project; variant?: 'card' | 'hero' }) {
  const shot = projectShots[project.slug]
  if (!shot) return null
  const Frame = frames[project.device]
  const isPhone = project.device === 'phone'
  const sizes = sizesFor[variant][isPhone ? 'phone' : 'landscape']

  return (
    <Scene>
      <div className="absolute inset-0 flex items-center justify-center">
        <Layer depth={10} className={cn('flex w-full items-center justify-center', isPhone && 'h-full')}>
          <div
            className={cn(
              'flex w-full items-center justify-center transition-transform duration-700 ease-cinematic group-hover/visual:-translate-y-1.5',
              isPhone && 'h-full',
            )}
          >
            <Frame shot={shot} sizes={sizes} />
          </div>
        </Layer>
      </div>
    </Scene>
  )
}

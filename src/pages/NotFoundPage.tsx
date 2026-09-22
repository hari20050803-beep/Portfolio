import { Button } from '../components/ui/Button'
import { Serif } from '../components/ui/Motifs'
import { RevealLines } from '../components/ui/Reveal'
import { seo } from '../data/seo'
import { useDocumentMeta } from '../lib/hooks'
import { useNavigation } from '../lib/router'

export function NotFoundPage() {
  const { ready } = useNavigation()
  useDocumentMeta(seo.notFound)
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <section className="shell flex min-h-[88svh] flex-col justify-center pt-[var(--header-h)]">
        <p className="eyebrow text-fog-500">Error 404</p>
        <h1
          data-page-focus
          tabIndex={-1}
          className="mt-8 text-[clamp(3rem,10vw,9rem)] leading-[0.9] font-semibold tracking-[-0.055em] text-fog-50 outline-none"
        >
          <RevealLines play={ready} lines={['Lost in the', <Serif key="d">dark.</Serif>]} />
        </h1>
        <p className="mt-8 max-w-md text-lg text-fog-400">This page doesn&rsquo;t exist, but the work does.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button to="/" icon="left">
            Back to home
          </Button>
          <Button to="/#work" variant="secondary">
            Selected work
          </Button>
        </div>
      </section>
    </main>
  )
}

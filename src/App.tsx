import { lazy, Suspense } from 'react';
import { Hero } from './components/hero/Hero';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { SceneBackdrop } from './components/scene/SceneBackdrop';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Everything under the hero is a separate chunk. In production it is already in
// the prerendered HTML; this only delays the JavaScript that hydrates it.
const BelowTheFold = lazy(() =>
  import('./components/sections/BelowTheFold').catch((error: unknown) => {
    // If the sections are already on the page, leave them readable and show a
    // small notice, rather than replacing good content with an error message.
    if (document.getElementById('about')) {
      document.documentElement.dataset.sectionsFailed = 'true';
      return new Promise<never>(() => undefined);
    }
    throw error;
  }),
);

function SectionsLoading() {
  return (
    <div className="load-note" role="status">
      Loading the rest of the page…
    </div>
  );
}

function SectionsFailed() {
  return (
    <div className="load-note" role="alert">
      <p>This part of the page didn't load.</p>
      <button className="btn btn--ghost" type="button" onClick={() => window.location.reload()}>
        Reload the page
      </button>
    </div>
  );
}

export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SceneBackdrop />
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <ErrorBoundary fallback={<SectionsFailed />}>
          <Suspense fallback={<SectionsLoading />}>
            <BelowTheFold />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <div className="load-toast" role="status">
        <span>Part of this page didn't finish loading, so some buttons won't work.</span>
        <button className="btn btn--ghost btn--small" type="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    </>
  );
}

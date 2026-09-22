import { MotionConfig } from 'motion/react'
import { Cursor } from './components/layout/Cursor'
import { Curtain } from './components/layout/Curtain'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { NavigationProvider } from './lib/navigation'
import { useNavigation } from './lib/router'
import { SmoothScroll } from './lib/smooth-scroll'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectPage } from './pages/ProjectPage'

function Routes() {
  const { route } = useNavigation()
  switch (route.name) {
    case 'home':
      return <HomePage />
    case 'project':
      return <ProjectPage key={route.slug} slug={route.slug} />
    default:
      return <NotFoundPage />
  }
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <NavigationProvider>
          <a
            href="#main"
            className="sr-only z-[120] rounded-full bg-fog-50 px-5 py-3 text-sm font-medium text-ink-950 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            Skip to content
          </a>
          <Header />
          <Routes />
          <Footer />
          <Curtain />
          <Cursor />
          <div className="grain" aria-hidden="true" />
        </NavigationProvider>
      </SmoothScroll>
    </MotionConfig>
  )
}

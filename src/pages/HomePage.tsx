import { Hero } from '../components/hero/Hero'
import { About } from '../components/sections/About'
import { Contact } from '../components/sections/Contact'
import { Journey } from '../components/sections/Journey'
import { Projects } from '../components/sections/Projects'
import { TechStack } from '../components/sections/TechStack'
import { WhatIDo } from '../components/sections/WhatIDo'
import { seo } from '../data/seo'
import { useDocumentMeta } from '../lib/hooks'

export function HomePage() {
  useDocumentMeta(seo.home)
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Hero />
      <About />
      <TechStack />
      <Projects />
      <Journey />
      <WhatIDo />
      <Contact />
    </main>
  )
}

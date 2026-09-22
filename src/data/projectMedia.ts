import cupcake1260Avif from '../assets/projects/cupcake-products-1260.avif'
import cupcake1260Webp from '../assets/projects/cupcake-products-1260.webp'
import cupcake840Avif from '../assets/projects/cupcake-products-840.avif'
import cupcake840Webp from '../assets/projects/cupcake-products-840.webp'
import kmc1600Avif from '../assets/projects/kmc-home-1600.avif'
import kmc1600Webp from '../assets/projects/kmc-home-1600.webp'
import kmc960Avif from '../assets/projects/kmc-home-960.avif'
import kmc960Webp from '../assets/projects/kmc-home-960.webp'
import learnova480Avif from '../assets/projects/learnova-home-480.avif'
import learnova480Webp from '../assets/projects/learnova-home-480.webp'
import learnova720Avif from '../assets/projects/learnova-home-720.avif'
import learnova720Webp from '../assets/projects/learnova-home-720.webp'

/** One real screenshot per project (kept separate from projects.ts, which vite.config imports). */
export interface ProjectShot {
  avifSet: string
  webpSet: string
  src: string
  width: number
  height: number
  alt: string
  /** Title shown in the frame's title bar, where the real app has one. */
  windowTitle?: string
}

export const projectShots: Record<string, ProjectShot> = {
  'kmc-event-platform': {
    avifSet: `${kmc960Avif} 960w, ${kmc1600Avif} 1600w`,
    webpSet: `${kmc960Webp} 960w, ${kmc1600Webp} 1600w`,
    src: kmc1600Webp,
    width: 1600,
    height: 1000,
    alt: 'KMC Event Platform home page: the Kandy City Events hero and upcoming city events',
  },
  'learnova-ai': {
    avifSet: `${learnova480Avif} 480w, ${learnova720Avif} 720w`,
    webpSet: `${learnova480Webp} 480w, ${learnova720Webp} 720w`,
    src: learnova720Webp,
    width: 720,
    height: 1603,
    alt: "Learnova AI home screen in dark mode, showing the AI assistant, today's progress and academic health",
  },
  'cupcake-management-system': {
    avifSet: `${cupcake840Avif} 840w, ${cupcake1260Avif} 1260w`,
    webpSet: `${cupcake840Webp} 840w, ${cupcake1260Webp} 1260w`,
    src: cupcake1260Webp,
    width: 1260,
    height: 694,
    alt: 'Cupcake Management System: the Add Cupcake screen with the product form and the cupcake catalogue table',
    windowTitle: 'The Sweet Cupcake Shop  -  Manager Dashboard',
  },
}

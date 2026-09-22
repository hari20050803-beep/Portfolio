import type { Profile } from './types.ts'

export const profile: Profile = {
  name: 'Harenthira Ravishangar',
  displayName: 'Harenthira Ravishangar',
  roles: ['Software Engineering Student', 'AI & Software Developer'],
  tagline: 'I build practical software experiences where engineering, AI, and design come together.',
  location: {
    city: 'Jaffna',
    country: 'Sri Lanka',
    coordinates: '9.66°N 80.02°E',
    timeZone: 'Asia/Colombo',
    utcOffset: 'GMT+5:30',
  },
  email: 'hari2005.08.03@gmail.com',
  phone: { display: '+94 76 900 2783', href: 'tel:+94769002783' },
  links: {
    linkedin: 'https://www.linkedin.com/in/harenthira',
    // The account behind the project remotes (verified public).
    github: 'https://github.com/hari20050803-beep',
  },
}

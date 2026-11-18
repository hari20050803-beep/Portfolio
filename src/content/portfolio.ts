/**
 * All the words on the site live here, so you can update them without touching
 * any layout code.
 *
 * Wrap a phrase in **double asterisks** to make it stand out.
 *
 * Your email, phone, GitHub, LinkedIn and CV are set in contact.config.ts at
 * the root of the project.
 */

export const profile = {
  name: 'Ravishangar Harenthira',
  initials: 'RH',
  roles: ['Full Stack Developer Intern', 'Software Engineer', 'AI Developer'],
  location: 'Jaffna, Sri Lanka',
  headline: 'Building intelligent products for the web and beyond.',
  support: 'Full stack developer focused on AI applications, mobile apps, and practical software.',
  currentRole: 'Full Stack Developer Intern at SkillForge Technologies',
};

export const navigation = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];

export const about = {
  title: 'About',
  paragraphs: [
    "I'm **Ravishangar Harenthira**, a full stack developer based in Jaffna, Sri Lanka, focused on **AI applications, mobile apps, and practical software**.",
    "I'm currently a **Full Stack Developer Intern at SkillForge Technologies**, working on an AI music analysis and audio-editing platform.",
    "I completed my **HND in Software Engineering** at ICBT Campus, awarded by Cardiff Metropolitan University, in 2026, and I'm progressing to a **BSc (Hons) in Software Engineering** at Cardiff Metropolitan University.",
  ],
  facts: [
    { label: 'Based in', value: 'Jaffna, Sri Lanka' },
    { label: 'Current role', value: 'Full Stack Developer Intern, SkillForge Technologies' },
    { label: 'Education', value: 'Progressing to BSc (Hons) Software Engineering' },
  ],
  portraitAlt: 'Portrait of Ravishangar Harenthira wearing a navy blazer',
};

export const experience = {
  title: 'Experience',
  company: 'SkillForge Technologies',
  role: 'Full Stack Developer Intern',
  mode: 'Remote',
  period: 'October 2026–Present',
  points: [
    'Working on **AI Music Studio**, an audio analysis and editing platform built with **FastAPI** and **PostgreSQL**.',
    'Developed an **AI Assistant** that turns natural-language requests into audio-processing actions.',
    'Integrated **key, genre and mood detection, stem separation, lyrics transcription, and AI mastering**.',
    'Debugged backend issues, including a **crash after BPM analysis** and a broken **Noise Reduction** route.',
    'Collaborate with a multi-developer team using **Git and GitHub**.',
  ],
  assistant: {
    title: 'How the assistant works',
    chain: [
      { name: 'Groq', role: 'Primary model' },
      { name: 'Gemini', role: 'Fallback' },
      { name: 'Rule-based phrase matching', role: 'Then' },
    ],
    notes: [
      'The assistant uses Groq as the primary model, Gemini as fallback, then rule-based phrase matching. It maintains conversation state for follow-up requests.',
      'Only typed messages and song names are sent to the AI provider; audio files are not.',
    ],
  },
  tech: ['Python', 'FastAPI', 'Groq API', 'Gemini API', 'PostgreSQL', 'Git'],
};

export type ProjectSignature =
  | { kind: 'features'; label: string; items: string[] }
  | { kind: 'gates'; label: string; items: string[] }
  | { kind: 'flow'; label: string; items: string[] }
  | { kind: 'roles'; label: string; items: string[] };

export type ProjectId = 'learnova' | 'friday' | 'kmc' | 'cupcake';

/**
 * What appears beside each project: a screenshot or logo from its GitHub
 * repository, or a drawing when there is no public image.
 * Images live in public/images/projects as <image>-560.webp and <image>-1120.webp.
 */
export type ProjectMedia =
  | { kind: 'screenshot' | 'logo'; image: string; alt: string }
  | { kind: 'waveform' };

export interface Project {
  id: ProjectId;
  name: string;
  summary: string;
  category: string;
  /** One or two plain sentences about what the project is, from its README. */
  description: string;
  media: ProjectMedia;
  points: string[];
  signature: ProjectSignature;
  tech: string[];
  /** Leave undefined when there is no public repository. The card then says so. */
  repository?: string;
}

export const projectsSection = { title: 'Projects' };

export const projects: Project[] = [
  {
    id: 'learnova',
    name: 'Learnova AI',
    summary: 'AI study companion for Android',
    category: 'Android app',
    description:
      'A study app that brings notes, summaries, quizzes, flashcards, study roadmaps, GPA tracking and reminders together in one place. Five of its eleven modules are powered by Gemini.',
    media: { kind: 'logo', image: 'learnova-logo', alt: 'Learnova AI logo: an open book with circuit lines and a star' },
    points: [
      'Final-year HND project built with **Flutter and Dart**.',
      'Uses **Gemini API, Firebase Authentication, Firestore, and Cloudflare Workers**.',
    ],
    signature: {
      kind: 'features',
      label: 'Features',
      items: [
        'AI chatbot',
        'Quiz generator',
        'Note summariser',
        'Study reminders',
        'Study materials',
        'GPA calculator',
      ],
    },
    tech: ['Flutter', 'Dart', 'Gemini API', 'Firebase Authentication', 'Firestore', 'Cloudflare Workers'],
    repository: 'https://github.com/hari20050803-beep/Learnova-AI',
  },
  {
    id: 'friday',
    name: 'FRIDAY',
    summary: 'Tamil voice assistant for Windows',
    category: 'Desktop AI assistant',
    description:
      'A personal assistant for Windows that you can talk to in Tamil or type to. It picks the right tool for each request and asks before doing anything risky.',
    media: { kind: 'waveform' },
    points: [
      'Personal desktop AI assistant with **voice and typed commands**.',
      'Can open apps, find files, check battery, search the web, and skip Spotify songs.',
      'Uses **Claude, Gemini, or local Ollama models** to select from **53 Python tools**.',
      'Every action passes through **Safe / Confirm / Block** controls; risky actions require user approval.',
      'Includes wake word, speech-to-text, text-to-speech, SQLite memory, and a PySide6 interface.',
      'Covered by **580+ pytest tests**.',
    ],
    signature: {
      kind: 'gates',
      label: 'Action controls',
      items: ['Safe', 'Confirm', 'Block'],
    },
    tech: ['Python', 'Claude API', 'Gemini API', 'Ollama', 'PySide6', 'SQLite', 'Playwright', 'pytest'],
  },
  {
    id: 'kmc',
    name: 'KMC Event Platform',
    summary: 'Service-oriented web application',
    category: 'Web application',
    description:
      'An events platform for the Kandy Municipal Council. Participants find and register for events, organizers publish and manage their own, and admins oversee everything with reports and CSV exports.',
    media: { kind: 'screenshot', image: 'kmc-home', alt: 'Kandy City Events home page from the KMC Event Platform' },
    points: [
      '**ASP.NET MVC 5** client consumes an **ASP.NET Web API 2** service.',
      'Event and registration CRUD backed by **SQL Server** and **Entity Framework 6**.',
    ],
    signature: {
      kind: 'flow',
      label: 'Architecture',
      items: ['MVC 5 client', 'Web API 2 service', 'SQL Server'],
    },
    tech: ['ASP.NET MVC 5', 'ASP.NET Web API 2', 'SQL Server', 'Entity Framework 6'],
    repository: 'https://github.com/hari20050803-beep/KMC-Event-Platform',
  },
  {
    id: 'cupcake',
    name: 'The Sweet Cupcake Shop',
    summary: 'Java desktop application',
    category: 'Desktop application',
    description:
      'A desktop app where managers and cashiers sign in to their own dashboards to manage the cupcake catalogue. Staff can still sign in from local files if MySQL is unavailable.',
    media: { kind: 'screenshot', image: 'cupcake-add', alt: 'Add Cupcake screen in The Sweet Cupcake Shop desktop app' },
    points: [
      'Shop-management app with **Manager and Cashier** dashboards.',
      'Uses **Java Swing, JDBC, and MySQL**.',
    ],
    signature: {
      kind: 'roles',
      label: 'Dashboards',
      items: ['Manager', 'Cashier'],
    },
    tech: ['Java', 'Java Swing', 'JDBC', 'MySQL'],
    repository: 'https://github.com/hari20050803-beep/Cupcake-Management-System',
  },
];

export const skills = {
  title: 'Skills',
  groups: [
    {
      label: 'Languages',
      items: ['Python', 'Dart', 'Java', 'C#', 'JavaScript'],
    },
    {
      label: 'Frontend and mobile',
      items: ['Flutter', 'Android development', 'Java Swing', 'PySide6'],
    },
    {
      label: 'Backend',
      items: [
        'FastAPI',
        'ASP.NET MVC 5',
        'ASP.NET Web API 2',
        'REST APIs',
        'Entity Framework 6',
        '.NET Framework',
        'Cloudflare Workers',
      ],
    },
    {
      label: 'Databases',
      items: [
        'PostgreSQL',
        'SQL Server',
        'MySQL',
        'SQLite',
        'Firebase Firestore',
        'Firebase Authentication',
        'JDBC',
      ],
    },
    {
      label: 'AI',
      items: ['Groq API', 'Gemini API', 'Claude API', 'Ollama', 'Generative AI integration', 'AI agents'],
    },
    {
      label: 'Tools and testing',
      items: ['pytest', 'Playwright', 'Git', 'GitHub', 'VS Code', 'Android Studio', 'NetBeans'],
    },
  ],
};

export const education = {
  title: 'Education',
  entries: [
    {
      qualification: 'BSc (Hons) Software Engineering',
      institution: 'Cardiff Metropolitan University',
      status: 'In progress',
      active: true,
    },
    {
      qualification: 'HND Software Engineering',
      institution: 'ICBT Campus, awarded by Cardiff Metropolitan University',
      status: 'Completed 2026',
      active: false,
    },
  ],
};

export const achievement = {
  title: 'Achievement',
  badge: '3rd',
  placement: '3rd Place, Hackathon',
  venue: 'ICBT Campus',
};

export const languages = {
  title: 'Languages',
  items: [
    { name: 'Tamil', level: 'Native' },
    { name: 'English', level: 'Professional' },
    { name: 'German', level: 'Basic' },
  ],
};

export const contact = {
  title: 'Contact',
  lede: 'Email or call me, or find me on GitHub and LinkedIn.',
};

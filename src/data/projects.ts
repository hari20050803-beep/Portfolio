import type { Project } from './types.ts'

/*
 * Every detail below was verified against each project's source code and documentation.
 *
 * GitHub: a project's button is shown only when its repository is public.
 *   - KMC Event Platform: the main-assessment solution is not on GitHub yet (the private
 *     KMC-Event-Platform repository holds a separate .NET 8 rebuild).
 *   - Learnova AI: the repository is private; set visibility to 'public' once it is public.
 *   - Cupcake Management System: public.
 */
export const projects: readonly Project[] = [
  {
    slug: 'kmc-event-platform',
    number: '01',
    title: 'KMC Event Platform',
    subtitle: 'Kandy City Events',
    assessment: 'SOC — Main Assessment',
    module: 'CSE5013 Service Oriented Computing',
    type: 'Service-oriented event management platform',
    platform: 'Web · ASP.NET MVC 5 + Web API 2',
    device: 'browser',
    summary:
      'A service-oriented event platform for the Kandy Municipal Council scenario: a Web API 2 service owns the data and rules, and an MVC 5 website consumes it to publish, search and register for city events.',
    overview: [
      'KMC Event Platform is my main assessment for CSE5013 Service Oriented Computing, answering the brief "SOC-based solution for The Kandy Municipal Council (KMC)": a central hub for city events built around a core API.',
      'The ASP.NET Web API 2 service owns the database and the business rules, and the ASP.NET MVC 5 website, Kandy City Events, consumes it over HTTP; the client has no database connection at all. Organizers publish and manage events, the public searches by keyword, type and date and registers, and administrators get dashboards, reports and user management.',
      'It runs on .NET Framework 4.7.2 with Entity Framework 6 (Database-First) over SQL Server, and is covered by an MSTest suite of 127 API tests.',
    ],
    tech: ['ASP.NET MVC 5', 'ASP.NET Web API 2', 'Entity Framework 6', 'SQL Server', '.NET Framework 4.7.2'],
    highlights: [
      'Event search by keyword, type and date',
      'Organizer event management',
      'Registration with live availability',
      'Admin, Organizer and Participant roles',
      'Admin dashboard, reports and CSV export',
      'Accounts with password reset',
    ],
    featureGroups: [
      {
        title: 'Public & participants',
        items: [
          'Browse and search events by keyword, type and date range',
          'Event details with remaining capacity',
          'Register for events and cancel registrations',
          'My Registrations history',
        ],
      },
      {
        title: 'Organizers',
        items: ['Organizer dashboard', 'Create, edit and delete events; only the creator can update', 'Participant list for each event'],
      },
      {
        title: 'Administration',
        items: [
          'Admin dashboard with platform statistics',
          'Manage users, organizers and participants',
          'Reports with CSV export of events, registrations and users',
        ],
      },
      {
        title: 'Accounts & security',
        items: ['Registration, sign-in and profile', 'Forgot, reset and change password', 'Role-based bearer-token authorization'],
      },
    ],
    architecture: {
      kind: 'flow',
      title: 'Architecture',
      nodes: [
        {
          name: 'MVC 5 Client',
          detail: 'ASP.NET MVC 5',
          role: 'The Kandy City Events website; calls the API over HTTP and holds no database connection',
        },
        {
          name: 'Web API 2',
          detail: 'ASP.NET Web API 2',
          role: 'REST endpoints for events, registrations, users and reports, secured by role',
        },
        {
          name: 'Entity Framework 6',
          detail: 'Database-First (EDMX)',
          role: 'Maps users, events and registrations to the database',
        },
        { name: 'SQL Server', detail: 'KMC_EventDB', role: 'Relational database behind the platform' },
      ],
    },
    engineering: {
      title: 'Engineering highlights',
      points: [
        {
          label: 'Service-oriented by design',
          detail: 'The MVC client has no connection string; every read and write goes through the Web API.',
        },
        {
          label: 'Owner-only updates',
          detail: 'The API refuses to update an event for anyone except its creator or an administrator.',
        },
        {
          label: 'Token-based security',
          detail: 'HMAC-SHA256 signed bearer tokens, checked by a custom authorization attribute with role rules.',
        },
        { label: 'Password storage', detail: 'PBKDF2 hashes with a per-user salt; plain passwords are never stored.' },
        { label: 'Tested API', detail: '127 MSTest tests covering auth, events, registrations, users and reports.' },
      ],
    },
  },
  {
    slug: 'learnova-ai',
    number: '02',
    title: 'Learnova AI',
    subtitle: 'AI academic assistant',
    assessment: 'Final Assessment / Final-Year Project',
    module: 'CSE5015 Computing Project',
    featured: true,
    type: 'AI-powered student academic assistant',
    platform: 'Android app · Flutter',
    device: 'phone',
    summary:
      'An AI-powered academic assistant for Android that combines a Gemini chatbot, quizzes, note summaries, flashcards and study roadmaps with notes, reminders, GPA tracking and progress analytics.',
    overview: [
      'Learnova AI is my final-year project for CSE5015 Computing Project: an AI-powered student academic assistant for Android, built with Flutter and Dart on Firebase and Google Gemini.',
      'Eleven modules sit around a single dashboard. Five are AI-backed (the academic chatbot with saved chat history, notes summarizer, quiz generator, flashcards and study roadmap), alongside notes, study materials, reminders, a GPA calculator and a progress dashboard.',
      'Accounts use Firebase Authentication with OTP verification, student data lives in Firebase Firestore, and a small Cloudflare Worker handles in-app password reset. The project was delivered as a signed Android release build.',
    ],
    tech: ['Flutter', 'Dart', 'Firebase Authentication', 'Firebase Firestore', 'Gemini 2.5 Flash'],
    highlights: [
      'AI Academic Chatbot with chat history',
      'AI Quiz Generator',
      'AI Notes Summarizer',
      'Study reminders and materials',
      'GPA Calculator',
      'Progress dashboard analytics',
    ],
    featureGroups: [
      {
        title: 'AI features · Gemini',
        items: [
          'AI Academic Chatbot with chat history',
          'AI Notes Summarizer',
          'AI Quiz Generator',
          'AI Flashcards with a flip-card study mode',
          'AI Study Roadmap',
        ],
      },
      {
        title: 'Study tools',
        items: ['Notes', 'Study Materials with AI summaries', 'Study Reminders', 'GPA Calculator with history', 'Progress dashboard analytics'],
      },
      {
        title: 'Account & app',
        items: [
          'Email sign-up and sign-in with OTP verification',
          'In-app password reset by emailed code',
          'Profile, light / dark theme and notification settings',
        ],
      },
    ],
    architecture: {
      kind: 'layers',
      title: 'How it fits together',
      nodes: [
        { name: 'Flutter app', detail: 'Flutter · Dart', role: '28 screens; 15 services own every Firebase and Gemini call' },
        { name: 'Firebase', detail: 'Auth · Firestore', role: "Accounts, plus each student's notes, chat history and study materials" },
        {
          name: 'Gemini 2.5 Flash',
          detail: 'Generative AI',
          role: 'Chatbot answers, summaries, quizzes, flashcards and study roadmaps',
        },
        {
          name: 'Cloudflare Worker',
          detail: 'Password reset',
          role: "Emails a one-time code and resets the password on the app's behalf",
        },
      ],
    },
    engineering: {
      title: 'Engineering highlights',
      points: [
        {
          label: 'One AI gateway',
          detail: 'Every AI module goes through a single Gemini service (gemini-2.5-flash), so changing the model touches one file.',
        },
        {
          label: 'Defensive AI parsing',
          detail: 'Quiz, flashcard and roadmap JSON from the model is parsed through explicit fromJson constructors, so a malformed reply fails gracefully.',
        },
        {
          label: 'Secure password reset',
          detail: 'The Cloudflare Worker stores reset codes hashed, expires them after ten minutes and swaps a verified code for a short-lived signed ticket.',
        },
        { label: 'Layered codebase', detail: 'Screens decide what to show; services handle all I/O. 28 screens and 15 services in total.' },
        { label: 'Release build', detail: 'Delivered as a signed Android release build (v1.0.0).' },
      ],
    },
    repo: { url: 'https://github.com/hari20050803-beep/Learnova-AI', visibility: 'private' },
  },
  {
    slug: 'cupcake-management-system',
    number: '03',
    title: 'Cupcake Management System',
    subtitle: 'The Sweet Cupcake Shop',
    assessment: 'OOP Assessment',
    module: 'CSE4006 Object Oriented Programming',
    type: 'Desktop management application',
    platform: 'Desktop app · Java Swing',
    device: 'desktop',
    summary:
      'A Java Swing desktop system for The Sweet Cupcake Shop, where Managers and Cashiers manage the cupcake catalogue, backed by MySQL through JDBC with a text-file fallback.',
    overview: [
      'Cupcake Management System is my assessment for CSE4006 Object Oriented Programming: a desktop application for The Sweet Cupcake Shop, built with Java 21 and Java Swing in NetBeans.',
      'Managers and Cashiers sign in to their own dashboards. Both can view, add and search the cupcake catalogue; only a Manager can create cashier accounts and open the Staff Registry, with its login history and SQL price report.',
      'Data is stored in MySQL through JDBC, with text-file stores that keep sign-in working when MySQL is unavailable. The code is organised into 43 classes across model, service, db, util, exception and ui packages, and is checked by automated service and UI test suites.',
    ],
    tech: ['Java 21', 'Java Swing', 'MySQL', 'JDBC', 'NetBeans'],
    highlights: [
      'Login by role: Manager or Cashier',
      'Cupcake catalogue CRUD',
      'Search by category and keyword',
      'Manager-only cashier accounts',
      'Staff registry with login history',
      'MySQL database integration',
    ],
    featureGroups: [
      {
        title: 'Access',
        items: [
          'Staff login as Manager (email) or Cashier (username)',
          'Separate Manager and Cashier dashboards',
          'Manager-only screens enforced in the service layer',
        ],
      },
      {
        title: 'Products',
        items: ['View the cupcake catalogue', 'Add, update and delete cupcakes (CRUD)', 'Search by category, keyword or both'],
      },
      {
        title: 'Staff & data',
        items: [
          'Create cashier accounts with validation',
          'Staff Registry with login history and SQL price report',
          'MySQL via JDBC with a text-file fallback',
        ],
      },
    ],
    architecture: {
      kind: 'flow',
      title: 'Architecture',
      nodes: [
        {
          name: 'Java Swing UI',
          detail: 'CardLayout · NetBeans forms',
          role: 'One window; Manager and Cashier dashboards swap in as cards',
        },
        { name: 'Service layer', detail: 'model · service', role: 'Business rules, validation and role checks' },
        { name: 'JDBC', detail: 'PreparedStatement DAOs', role: 'Parameterised SQL for staff accounts and products' },
        {
          name: 'MySQL',
          detail: 'with text-file fallback',
          role: 'Primary store; text files keep sign-in working when MySQL is down',
        },
      ],
    },
    engineering: {
      title: 'OOP concepts',
      points: [
        {
          label: 'Inheritance',
          detail: 'Manager and Cashier extend the abstract User class; CupcakeFileStore and UserFileStore extend TextFileStore.',
        },
        {
          label: 'Abstraction',
          detail: 'DataStore, Dashboard and ShopModule interfaces separate what the application needs from how it is done.',
        },
        {
          label: 'Polymorphism',
          detail: 'Three overloads of searchCupcakes(), by category, by keyword and by both, plus overridden methods throughout.',
        },
        { label: 'Encapsulation', detail: 'Model classes keep their fields private and validate every value on the way in.' },
        {
          label: 'Exception handling',
          detail: 'Custom ValidationException, AuthenticationException, AccessDeniedException and ShopException.',
        },
        {
          label: 'Secure data access',
          detail: 'JDBC PreparedStatements and salted password hashes; passwords are never stored.',
        },
      ],
    },
    repo: { url: 'https://github.com/hari20050803-beep/Cupcake-Management-System', visibility: 'public' },
  },
]

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}

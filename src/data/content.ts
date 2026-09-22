export const navigation = [
  { id: 'about', label: 'About' },
  { id: 'stack', label: 'Stack' },
  { id: 'work', label: 'Work' },
  { id: 'journey', label: 'Journey' },
  { id: 'what-i-do', label: 'What I Do' },
] as const

export const about = {
  statement:
    "I'm a Software Engineering student who enjoys building applications, exploring *AI*, and turning ideas into *practical software.*",
  paragraphs: [
    "I've completed my HND in Software Engineering and I'm now pursuing a BSc in Software Engineering, building real projects alongside my studies.",
    "I'm most interested in AI, mobile development and web development. I'm comfortable learning and working with modern AI-assisted development tools, and I use them to learn faster and solve problems more effectively.",
    "I'm open to internships and software engineering opportunities where I can contribute, keep learning and grow as an engineer.",
  ],
  facts: [
    { label: 'Completed', value: 'HND in Software Engineering' },
    { label: 'Pursuing', value: 'BSc in Software Engineering' },
    { label: 'Interests', value: 'AI · Mobile · Web' },
    { label: 'Based in', value: 'Jaffna, Sri Lanka' },
    { label: 'Open to', value: 'Internships & SE roles' },
  ],
} as const

export const stack = {
  categories: [
    { title: 'Languages', items: ['Java', 'JavaScript', 'Dart', 'SQL'] },
    { title: 'Development', items: ['Flutter', 'React', 'Android Studio', 'VS Code', 'Java Swing'] },
    { title: 'AI & Tools', items: ['Gemini AI', 'AI-assisted development', 'Claude', 'Firebase'] },
    { title: 'Databases', items: ['MySQL', 'Firebase Firestore'] },
    { title: 'Workflow', items: ['Git', 'GitHub', 'Canva', 'Microsoft Word', 'PowerPoint'] },
  ],
  alsoUsed: ['ASP.NET MVC 5', 'Web API 2', 'Entity Framework 6', 'SQL Server', 'JDBC'],
} as const

export const journey = [
  {
    status: 'Completed',
    title: 'HND in Software Engineering',
    description:
      'Completed the Higher National Diploma in Software Engineering, building the foundation for the projects that followed.',
  },
  {
    status: 'Currently pursuing',
    title: 'BSc in Software Engineering',
    description:
      'Progressing from HND to BSc, deepening my software engineering knowledge while continuing to build real projects.',
    current: true,
  },
  {
    status: 'Ongoing',
    title: 'Software Development Journey',
    description: 'Building projects with Java, Flutter, web technologies and AI tools.',
  },
] as const

export const services = [
  {
    title: 'AI-Powered Development',
    description: 'I use modern AI tools to accelerate learning, development and problem solving.',
    icon: 'ai',
  },
  {
    title: 'Mobile Development',
    description: 'Building Flutter-based Android applications.',
    icon: 'mobile',
  },
  {
    title: 'Web Development',
    description: 'Creating responsive and modern web experiences.',
    icon: 'web',
  },
  {
    title: 'Software Engineering',
    description: 'Designing practical applications using structured software engineering concepts.',
    icon: 'engineering',
  },
  {
    title: 'Continuous Learning',
    description: 'Currently progressing from HND to BSc while building real projects.',
    icon: 'learning',
  },
] as const

export type ServiceIcon = (typeof services)[number]['icon']

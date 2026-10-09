// All copy below mirrors the live homepage of theuniques.in (src/views/Landing).

const PROXY = 'https://theuniquesportal-server.vercel.app/api/image-proxy/';
const IDS = [
  '1elyEyZfakCGpTdCbJ02l3sNMmnRDWOnL', '1ev8ZjjEry72Km2bAeHfgERQZ5LzyFPhk', '1d_LbN3UxDik3Gl6hzAXQJsWCgJEFzjd8',
  '1WkGSTWxq0iTf3ovFhaREJIPSMcYlRDbK', '1OWDkBNiTsjjUPtPihdUOger0BRJl8Lvn', '1h3j6l3WZDLWaCburA8Bb0fkOKHQ4bFJd',
  '1dth4Z2pJ8h6Cxhb-d83LPaQIczdYtijd', '1A7A8ri0hdhcK_fQwYGczNTvdnkREyhZC', '1fiiwA0s5JXPrIRJE-ND0bXrGwrPynE6X',
  '1L7yFEJ7TWOQdlB_brf3S-rBIGVmcylXB', '1NytyadYPCgmHJRz_5KNWG25FChu63ptB', '1U5eJTCalQzbu4IyGk5L3vxqt1o7_j5Yl',
  '1LNk-bN89GS2JNlxTrp0dPGOeXgI2rL0O', '1Ze8MJYf90Wfj0o3SBEu96L9qpPbVvsBq', '1iLgcuJh2rXS0fdoyKQB2fx8zEIo-snHj',
  '1AYi88MG6sVXnTVD8I87-AWJvnf5H1dEe', '1kJKQdp3dPwF6f28yjS-EIf0m6SoChWvj', '1I9jRn1rXX2hnPn0yUBN2Y54gU5zoCBRh',
  '1euMmGkTv_xiu7aAk80HHLFV-yUtHX9LW', '19gzh7aEwbwEyyI3ZP0xbgjdzRF_kcnVd', '1Gn6chH9SQ1D5nALd11-N4W_3FDzetz40',
  '1SABEHM5Cfl44cEn6HxQ7iwTV_1319jEx', '1t4yp_I4NSXxR2af685GQAOw8mEed0QJ3',
];

const BASE = import.meta.env.BASE_URL;
const LOCAL = ['uniques1', 'lab4', 'uniques2', 'lab5', 'hackathon', 'uniques3', 'lab6', 'project', 'uniques4', 'office']
  .map((name) => `${BASE}assets/photos/${name}.webp`);

// Every photo carries a same-origin fallback so the page never shows a broken frame.
export const PHOTOS = IDS.map((id, i) => ({ src: PROXY + id, fallback: LOCAL[i % LOCAL.length] }));
export const photo = (i) => PHOTOS[((i % PHOTOS.length) + PHOTOS.length) % PHOTOS.length];

export const LOGO = `${BASE}assets/uniqueswhite.png`;
export const MARK = `${BASE}assets/tu-red.png`;
export const JOIN_URL = 'https://chat.whatsapp.com/HYOloogGXKcIkR83DnOjFj';
export const SITE = 'https://www.theuniques.in';

export const NAV = [
  { label: 'About', href: '#about' },
  { label: 'Impact', href: '#impact' },
  { label: 'Events', href: '#events' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Stories', href: '#stories' },
];

export const HERO = {
  // pill: 'View Our Vibrant Events ✨',
  title: ['A Community of', 'Creators,', 'Dreamers & Doers.'],
  sub: 'Experience tech like never before with The UNIQUES Community — vibrant events, hands-on sessions, and pure innovation.',
  tags: ['Corporate Culture', 'Fullstack Developers', 'Future Leaders', 'Graphic Designers', 'Philanthropists',
    'Tech Enthusiasts', 'Visionaries', 'Web Developers', 'UI/UX Designers'],
};

export const STATS = [
  { value: 860000, prefix: '₹', label: 'Revenue Generated', note: 'Earned through client work' },
  { value: 100, label: 'Tech Partners', note: 'Across the industry' },
  { value: 150, label: 'Projects Delivered', note: 'Real-world solutions' },
  { value: 40, label: 'Community Events', note: 'Hackathons, talks, summits' },
];

export const ABOUT = {
  eyebrow: 'About Our Community',
  title: 'The Uniques Community',
  sub: 'Learn, Build, and Grow Together.',
  quote: [
    'The Uniques Community is a global hub where everyone is welcome.',
    'We empower students to bridge the gap between theory and practice through peer-to-peer learning and real-world solutions.',
  ],
};

export const FOCUS = [
  { id: 'engage', label: 'Community Engagement', text: 'Bringing people together through events and support.', kind: 'photo' },
  { id: 'volunteer', label: 'Volunteer Programs', text: 'Join hands to make a difference with impactful initiatives.', kind: 'split' },
  { id: 'skill', label: 'Skill Development & Implementation', text: 'Move from theory to practice with hands-on workshops, live projects and mentorship that build technical and professional expertise.', kind: 'type' },
  { id: 'inclusive', label: 'Inclusive Environment', text: 'A welcoming space for everyone, regardless of background.', kind: 'oval' },
  { id: 'collab', label: 'Collaboration', text: 'Partner with others to drive meaningful community change.', kind: 'framed' },
];

export const WHY = {
  eyebrow: 'A Community Like No Other',
  title: 'Driving Innovation Through Collaboration & Visionary Thinking',
  cards: [
    { title: 'Global Networking', kicker: 'Build Connections That Matter', text: 'Connect with founders, investors, and industry leaders worldwide to collaborate, grow, and scale your startup with the right mentorship.' },
    { title: 'Hands-On Learning', kicker: 'Learn by building', text: 'Get exclusive access to expert-led workshops, panel discussions, and case studies to refine your business strategy.' },
    { title: 'Startup Acceleration', kicker: 'Go further, faster', text: 'Get access to funding opportunities, pitch competitions, and acceleration programs designed to take your startup to the next level.' },
    { title: 'Showcase Your Innovation', kicker: 'Take the stage', text: 'Pitch your ideas in exclusive startup showcases and competitions, attracting investors, mentors, and potential co-founders.' },
  ],
};

export const PARTNERS = {
  title: 'Trusted by Industry Leaders',
  stats: [{ value: '50+', label: 'Community Partners' }, { value: '50+', label: 'Corporate Partners' }],
  logos: ['Google', 'Microsoft', 'GitHub', 'AWS', 'Salesforce', 'Figma', 'Notion', 'Postman', 'MongoDB', 'Vercel', 'LinkedIn', 'Canva'],
};

export const STARTUPS = {
  eyebrow: 'Our Innovative Startups',
  title: 'Pioneering the Future with Disruptive Ideas & Technology',
  items: [
    { no: '01', name: 'Godigitify', url: 'https://godigitify.com/', domain: 'godigitify.com', text: 'Explore the advancements in AI, its impact across industries, and what the future holds for artificial intelligence.' },
    { no: '02', name: 'Techlearns Academy', url: 'https://www.techlearns.in/', domain: 'techlearns.in', text: 'Learn from industry experts how AI and ML are transforming healthcare, finance, education, and more.' },
    { no: '03', name: 'Wirely', url: 'https://www.wirely.in/', domain: 'wirely.in', text: 'A discussion on the ethical concerns surrounding AI, data privacy, and responsible innovation in AI/ML.' },
  ],
};

// Event titles come from the homepage gallery set; live events load from the portal API.
export const EVENTS = [
  { title: 'SVGOI Tech Fest Win', category: 'Award' },
  { title: 'National Hackathon Gold', category: 'Hackathon' },
  { title: 'Uniques Core Team Meetup', category: 'Community' },
  { title: 'Code Warriors Trophy', category: 'Award' },
  { title: 'Industry Mentorship Session', category: 'Workshop' },
  { title: 'Annual Innovators Summit', category: 'Summit' },
  { title: 'Ideathon Pitching Day', category: 'Competition' },
  { title: 'UI/UX Design Masterclass', category: 'Workshop' },
  { title: 'TU Community Launch Event', category: 'Launch' },
];

export const YOUTUBE = {
  eyebrow: 'Our Channel',
  title: 'The Uniques Community is Live on YouTube',
  sub: 'Watch our story, events, and community moments — all captured and shared live on our YouTube channel.',
  channel: 'The Uniques Official',
  handle: '@TheUniquesOfficial',
  blurb: 'Subscribe to our channel for event highlights, tech talks, member stories, and behind-the-scenes community moments.',
  videoId: 'Ay47OixDr2M',
  url: 'https://www.youtube.com/@TheUniquesOfficial',
  highlights: [
    { title: 'Event Recaps', text: 'Relive every seminar, hackathon, and workshop.' },
    { title: 'Tech Talks', text: 'Insights from industry experts and community leaders.' },
    { title: 'Community Stories', text: 'Real journeys from real Uniques members.' },
  ],
};

const avatar = (name) => `${BASE}assets/avatars/${name}.webp`;
export const TESTIMONIALS = {
  students: {
    label: 'Students',
    heading: 'Students',
    text: 'Hear from our alumni who have successfully launched their careers through The Uniques Community',
    items: [
      { name: 'Ronit JaiPrakash', role: 'Application Developer, Caelius', tag: 'MERN Stack', image: avatar('ronit-jaiprakash'), quote: 'The Uniques Community provided me with the technical skills and network to launch my career. The industry mentorship was instrumental in helping me secure my developer role at Caelius.' },
      { name: 'Naveen Jaiswal', role: 'Software Developer, Thor Solutions', tag: 'Product Dev', image: avatar('naveen-jaiswal'), quote: 'Through hands-on projects and focused cohort training at The Uniques, I developed the engineering mindset required to excel in high-scale product customization at Thor Solutions.' },
      { name: 'Parveen Jaiswal', role: 'Web Developer, SpacePepper', tag: 'MCD Certified', image: avatar('praveen-jaiswal'), quote: 'As an MCD certified engineer, I attribute my career trajectory to the practical guidance from The Uniques Community. Their ecosystem truly transformed my passion into industry impact.' },
      { name: 'Mantasha Tabassum', role: 'Cloud Engineer, Caelius', tag: 'AWS Specialist', image: avatar('mantasha-tabassum'), quote: 'The Uniques gave me the confidence and AWS cloud expertise needed to architect scalable systems. The rigorous real-world curriculum made all the difference in my engineering journey.' },
    ],
  },
  faculty: {
    label: 'Faculty',
    heading: 'Faculty Members',
    text: 'Academic professionals share their insights on the impact of our program on students and institutions',
    items: [
      { name: 'Dr. Rajesh Sharma', role: 'Professor of Computer Science', tag: 'Curriculum', quote: 'The curriculum at The Uniques Community bridges academic theory with industry practice seamlessly. Our students who engage with their cohorts consistently excel in technical problem-solving.' },
      { name: 'Prof. Anita Desai', role: 'Head of IT Department', tag: 'Skill Growth', quote: 'I have witnessed an inspiring transformation in students participating in The Uniques programs. Their technical confidence, code quality, and collaboration skills show immense growth.' },
      { name: 'Dr. Vikram Mehta', role: 'Dean of Engineering', tag: 'Industry Link', quote: "The Uniques Community's focus on project-driven learning complements our degree programs brilliantly. Their industry mentors provide students with priceless hands-on tech exposure." },
      { name: 'Prof. Sunita Patel', role: 'Director of Placements', tag: 'Placements', quote: 'Leading tech companies actively seek students trained by The Uniques Community. Their structured training significantly elevates campus placement records and career opportunities.' },
    ],
  },
  professionals: {
    label: 'Professionals',
    heading: 'IT Professionals',
    text: 'Industry leaders discuss the quality and preparedness of talent from The Uniques Community',
    items: [
      { name: 'Amit Kumar', role: 'CTO, Caelius', tag: 'Team Ready', quote: 'Graduates from The Uniques Community join our teams with strong foundations in modern stacks and professional ethics. Their preparation clearly emphasizes solving real-world challenges.' },
      { name: 'Priya Sharma', role: 'Engineering Manager, HCL GUVI', tag: 'Top Talent', quote: 'We have hired multiple engineers trained by The Uniques, and they consistently demonstrate strong coding standards, agile adaptability, and remarkable team-first problem solving.' },
      { name: 'Rahul Verma', role: 'Lead Developer, Grazitti', tag: 'SDLC Experts', quote: 'The Uniques Community produces engineers who understand not just coding, but the entire software development lifecycle. That makes them immediate high-value contributors to our team.' },
      { name: 'Neha Gupta', role: 'Hiring Manager, SALC', tag: 'All-Rounders', quote: 'I am consistently impressed by candidates from The Uniques Community. They possess both deep technical excellence and the collaborative communication essential for modern engineering.' },
    ],
  },
};

export const FOOTER = {
  about: 'The Uniques Community is a student-led initiative focused on fostering technical skills, collaboration, and professional growth through hands-on projects and industry mentorship.',
  columns: [
    { title: 'Navigate', links: [['Home', '/'], ['About Us', '/about'], ['Events', '/events'], ['Blogs', '/blogs']] },
    { title: 'Community', links: [['Community Page', '/community-main'], ['Batches', '/batches'], ['How It Started', '/howitstarted'], ['Member Login', '/auth/login']] },
    { title: 'Resources', links: [['Training Model', '/training'], ['Contact Us', '/contact'], ['Privacy Policy', '/privacy-policy'], ['Terms of Service', '/terms-of-service']] },
  ],
  socials: [
    ['LinkedIn', 'https://www.linkedin.com/company/theuniquesofflicial'],
    ['Instagram', 'https://www.instagram.com/theuniquescommunity/'],
    ['WhatsApp', JOIN_URL],
    ['GitHub', 'https://github.com/theuniquescommunity'],
    ['YouTube', 'https://www.youtube.com/@TheUniquesOfficial'],
  ],
};

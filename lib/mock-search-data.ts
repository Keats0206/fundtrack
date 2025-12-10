export interface SearchProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  linkedinUrl: string;
  avatarUrl: string;
  isTracked: boolean;
  recentActivity: string[];
  connections: number;
  yearsAtCompany: number;
}

export const mockSearchResults: SearchProfile[] = [
  {
    id: 'p1',
    name: 'Alex Thompson',
    title: 'VP Engineering',
    company: 'Stripe',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/alexthompson',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    isTracked: false,
    recentActivity: ['Changed headline', 'Updated profile photo'],
    connections: 2847,
    yearsAtCompany: 4.5,
  },
  {
    id: 'p2',
    name: 'Emily Zhang',
    title: 'Senior Product Manager',
    company: 'Uber',
    location: 'New York, NY',
    linkedinUrl: 'https://linkedin.com/in/emilyzhang',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    isTracked: false,
    recentActivity: ['Added new skills', 'Endorsed by colleagues'],
    connections: 1923,
    yearsAtCompany: 3.2,
  },
  {
    id: 'p3',
    name: 'Michael Rodriguez',
    title: 'Director of Product',
    company: 'Google',
    location: 'Mountain View, CA',
    linkedinUrl: 'https://linkedin.com/in/michaelrodriguez',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    isTracked: false,
    recentActivity: ['Changed location', 'Added certifications'],
    connections: 3241,
    yearsAtCompany: 6.7,
  },
  {
    id: 'p4',
    name: 'Sophia Patel',
    title: 'CTO & Co-founder',
    company: 'Meta',
    location: 'Menlo Park, CA',
    linkedinUrl: 'https://linkedin.com/in/sophiapatel',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    isTracked: false,
    recentActivity: ['Posted about AI', 'Speaking at conference'],
    connections: 4512,
    yearsAtCompany: 2.1,
  },
  {
    id: 'p5',
    name: 'Jordan Lee',
    title: 'VP Product',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/jordanlee',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    isTracked: false,
    recentActivity: ['Updated experience', 'Removed old positions'],
    connections: 2134,
    yearsAtCompany: 5.3,
  },
  {
    id: 'p6',
    name: 'Taylor Kim',
    title: 'Head of Engineering',
    company: 'Coinbase',
    location: 'Remote',
    linkedinUrl: 'https://linkedin.com/in/taylorkim',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor',
    isTracked: false,
    recentActivity: ['Changed to remote', 'Added crypto skills'],
    connections: 1876,
    yearsAtCompany: 1.8,
  },
  {
    id: 'p7',
    name: 'Chris Anderson',
    title: 'VP of Design',
    company: 'Figma',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/chrisanderson',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
    isTracked: false,
    recentActivity: ['Posted design article', 'Featured in press'],
    connections: 3567,
    yearsAtCompany: 4.0,
  },
  {
    id: 'p8',
    name: 'Sam Martinez',
    title: 'Engineering Manager',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    linkedinUrl: 'https://linkedin.com/in/sammartinez',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    isTracked: false,
    recentActivity: ['Updated skills', 'Received recommendations'],
    connections: 2456,
    yearsAtCompany: 3.9,
  },
];

export const companies = [
  'Google',
  'Meta',
  'Apple',
  'Amazon',
  'Microsoft',
  'Netflix',
  'Uber',
  'Airbnb',
  'Stripe',
  'Coinbase',
  'Figma',
  'OpenAI',
  'Anthropic',
  'SpaceX',
  'Tesla',
];

export const roleTypes = [
  'Founder',
  'CEO',
  'CTO',
  'VP Engineering',
  'VP Product',
  'VP Design',
  'Head of Engineering',
  'Director of Product',
  'Engineering Manager',
  'Product Manager',
  'Designer',
  'Software Engineer',
];


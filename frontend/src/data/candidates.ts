export interface Candidate {
  id: string
  name: string
  domain: string
  title: string
  location: string
  locationXOF?: string
  bio: string
  experience: Experience[]
  skills: string[]
  cvUrl?: string
  profileImage?: string
  yearsOfExperience: number
  expectations: string
  languages: string[]
  availability: 'immediate' | '2-weeks' | '1-month' | 'negotiable'
}

export interface Experience {
  id: string
  position: string
  company: string
  duration: string
  description: string
  technologies: string[]
  current?: boolean
}

export const candidates: Candidate[] = [
  {
    id: 'c1',
    name: 'Abdoulaye Seck',
    domain: 'dev',
    title: 'Senior Developer React',
    location: 'Dakar, Senegal',
    locationXOF: 'Dakar, Sénégal',
    bio: 'Développeur React passionné avec 8 ans d\'expérience dans la création d\'applications web modernes et scalables.',
    yearsOfExperience: 8,
    expectations: 'Recherche un poste de lead developer dans une startup innovante',
    languages: ['French', 'English'],
    availability: 'negotiable',
    experience: [
      {
        id: 'e1',
        position: 'Senior React Developer',
        company: 'TechStartup SN',
        duration: '2021 - Present',
        description: 'Lead development of customer dashboard with 100k+ daily users',
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        current: true
      },
      {
        id: 'e2',
        position: 'Full Stack Developer',
        company: 'Digital Solutions',
        duration: '2019 - 2021',
        description: 'Developed e-commerce platform serving 50+ businesses',
        technologies: ['React', 'Express', 'MongoDB'],
        current: false
      }
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    cvUrl: '#',
    profileImage: '👨‍💻'
  },
  {
    id: 'c2',
    name: 'Mariama Diallo',
    domain: 'design',
    title: 'UI/UX Designer',
    location: 'Dakar, Senegal',
    locationXOF: 'Dakar, Sénégal',
    bio: 'Designer créative spécialisée dans l\'expérience utilisateur et le design d\'interfaces web et mobile.',
    yearsOfExperience: 6,
    expectations: 'Cherche un rôle de designer lead dans une équipe internationale',
    languages: ['French', 'English', 'Wolof'],
    availability: '2-weeks',
    experience: [
      {
        id: 'e3',
        position: 'Lead UI/UX Designer',
        company: 'Creative Agency',
        duration: '2022 - Present',
        description: 'Led design for 10+ enterprise projects with focus on accessibility',
        technologies: ['Figma', 'Adobe XD', 'Prototyping'],
        current: true
      },
      {
        id: 'e4',
        position: 'UX Designer',
        company: 'Mobile App Studio',
        duration: '2020 - 2022',
        description: 'Designed interfaces for mobile applications with 500k+ users',
        technologies: ['Figma', 'User Research', 'Wireframing'],
        current: false
      }
    ],
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'UI Design', 'Mobile Design'],
    cvUrl: '#',
    profileImage: '👩‍🎨'
  },
  {
    id: 'c3',
    name: 'Moussa Diop',
    domain: 'marketing',
    title: 'Marketing Manager',
    location: 'Doula, Cameroon',
    locationXOF: 'Douala, Cameroun',
    bio: 'Spécialiste en marketing digital avec expertise en growth hacking et gestion de campagnes multi-canal.',
    yearsOfExperience: 5,
    expectations: 'Intéressé par une position de Head of Marketing dans une scaleup',
    languages: ['French', 'English'],
    availability: '1-month',
    experience: [
      {
        id: 'e5',
        position: 'Growth Marketing Manager',
        company: 'E-commerce Platform',
        duration: '2021 - Present',
        description: 'Managed marketing campaigns achieving 200% ROI',
        technologies: ['Google Analytics', 'Meta Ads', 'HubSpot'],
        current: true
      }
    ],
    skills: ['Growth Hacking', 'SEO', 'Social Media', 'Analytics', 'Campaign Management'],
    cvUrl: '#',
    profileImage: '👨‍💼'
  }
]

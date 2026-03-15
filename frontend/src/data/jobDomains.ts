export interface JobDomain {
  id: string
  name: string
  nameEn: string
  icon: string
  description: string
  descriptionEn: string
  candidateCount: number
  color: string
}

export const jobDomains: JobDomain[] = [
  {
    id: 'dev',
    name: 'Développement Web',
    nameEn: 'Web Development',
    icon: '💻',
    description: 'Développeurs frontend, backend, fullstack',
    descriptionEn: 'Frontend, backend, fullstack developers',
    candidateCount: 45,
    color: '#667eea'
  },
  {
    id: 'design',
    name: 'Design & UX',
    nameEn: 'Design & UX',
    icon: '🎨',
    description: 'Designers UI/UX, graphiques et visuels',
    descriptionEn: 'UI/UX designers, graphic and visual designers',
    candidateCount: 32,
    color: '#f093fb'
  },
  {
    id: 'marketing',
    name: 'Marketing Digital',
    nameEn: 'Digital Marketing',
    icon: '📱',
    description: 'Spécialistes SEO, social media, growth',
    descriptionEn: 'SEO specialists, social media, growth experts',
    candidateCount: 28,
    color: '#4facfe'
  },
  {
    id: 'data',
    name: 'Data Science',
    nameEn: 'Data Science',
    icon: '📊',
    description: 'Data scientists, analystes et ingénieurs données',
    descriptionEn: 'Data scientists, analysts, and data engineers',
    candidateCount: 22,
    color: '#fa709a'
  },
  {
    id: 'business',
    name: 'Consultants Affaires',
    nameEn: 'Business Consulting',
    icon: '💼',
    description: 'Consultants, analystes et gestionnaires projets',
    descriptionEn: 'Consultants, analysts, and project managers',
    candidateCount: 35,
    color: '#30b0fe'
  },
  {
    id: 'sales',
    name: 'Ventes & Commerciaux',
    nameEn: 'Sales & Business Development',
    icon: '🤝',
    description: 'Directeurs commerciaux et représentants ventes',
    descriptionEn: 'Sales directors and business development reps',
    candidateCount: 41,
    color: '#a8edea'
  },
  {
    id: 'masonry',
    name: 'Maconnerie',
    nameEn: 'Masonry',
    icon: '🧱',
    description: 'Macons, ouvriers chantier, travaux de construction',
    descriptionEn: 'Masons, construction workers, building jobs',
    candidateCount: 0,
    color: '#f6b26b'
  },
  {
    id: 'housekeeping',
    name: 'Aide Menagere',
    nameEn: 'Housekeeping',
    icon: '🧹',
    description: 'Aides menageres, entretien et services domestiques',
    descriptionEn: 'Housekeepers, cleaning and domestic services',
    candidateCount: 0,
    color: '#8fd3f4'
  },
  {
    id: 'restaurant',
    name: 'Aide Restaurant',
    nameEn: 'Restaurant Assistance',
    icon: '🍽️',
    description: 'Serveurs, commis, plonge et aides cuisine',
    descriptionEn: 'Servers, kitchen assistants and dishwashers',
    candidateCount: 0,
    color: '#ffd966'
  }
]

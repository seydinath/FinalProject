import React, { createContext, useContext, useState } from 'react'

export type PageType =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'notifications'
  | 'talent-search'
  | 'job-seeker-profile'
  | 'recruiter-applications'
  | 'job-seeker-applications'
  | 'admin-dashboard'
  | 'admin-job-requests'
  | 'user-management'
  | 'analytics'
  | 'reports'

interface Breadcrumb {
  label: string
  page: PageType
}

interface NavigationContextType {
  currentPage: PageType
  previousPage: PageType | null
  navigateTo: (page: PageType) => void
  getBreadcrumbs: () => Breadcrumb[]
  getPageTitle: (page: PageType, language: string) => string
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageType>('landing')
  const [previousPage, setPreviousPage] = useState<PageType | null>(null)

  const navigateTo = (page: PageType) => {
    if (page !== currentPage) {
      setPreviousPage(currentPage)
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const getBreadcrumbs = (): Breadcrumb[] => {
    const breadcrumbs: Breadcrumb[] = []
    
    if (currentPage !== 'landing') {
      breadcrumbs.push({ label: 'Accueil', page: 'landing' })
    }
    
    if (currentPage === 'dashboard') {
      breadcrumbs.push({ label: 'Tableau de bord', page: 'dashboard' })
    } else if (currentPage === 'talent-search') {
      breadcrumbs.push({ label: 'Tableau de bord', page: 'dashboard' })
      breadcrumbs.push({ label: 'Recherche de talents', page: 'talent-search' })
    } else if (currentPage === 'job-seeker-profile') {
      breadcrumbs.push({ label: 'Tableau de bord', page: 'dashboard' })
      breadcrumbs.push({ label: 'Mon profil', page: 'job-seeker-profile' })
    } else if (currentPage === 'recruiter-applications') {
      breadcrumbs.push({ label: 'Tableau de bord', page: 'dashboard' })
      breadcrumbs.push({ label: 'Candidatures recues', page: 'recruiter-applications' })
    } else if (currentPage === 'job-seeker-applications') {
      breadcrumbs.push({ label: 'Tableau de bord', page: 'dashboard' })
      breadcrumbs.push({ label: 'Mes candidatures', page: 'job-seeker-applications' })
    } else if (currentPage === 'notifications') {
      breadcrumbs.push({ label: 'Tableau de bord', page: 'dashboard' })
      breadcrumbs.push({ label: 'Notifications', page: 'notifications' })
    }
    
    return breadcrumbs
  }

  const getPageTitle = (page: PageType, language: string): string => {
    const titles: Record<PageType, Record<string, string>> = {
      landing: {
        fr: 'Accueil',
        en: 'Home'
      },
      auth: {
        fr: 'Authentification',
        en: 'Authentication'
      },
      dashboard: {
        fr: 'Tableau de bord',
        en: 'Dashboard'
      },
      notifications: {
        fr: 'Notifications',
        en: 'Notifications'
      },
      'talent-search': {
        fr: 'Recherche de talents',
        en: 'Talent Search'
      },
      'job-seeker-profile': {
        fr: 'Mon profil',
        en: 'My Profile'
      },
      'recruiter-applications': {
        fr: 'Candidatures recues',
        en: 'Received Applications'
      },
      'job-seeker-applications': {
        fr: 'Mes candidatures',
        en: 'My Applications'
      },
      'admin-dashboard': {
        fr: 'Tableau de bord Admin',
        en: 'Admin Dashboard'
      },
      'admin-job-requests': {
        fr: 'Demandes d\'offres',
        en: 'Job Requests'
      },
      'user-management': {
        fr: 'Gestion des utilisateurs',
        en: 'User Management'
      },
      'analytics': {
        fr: 'Analytiques',
        en: 'Analytics'
      },
      'reports': {
        fr: 'Rapports',
        en: 'Reports'
      }
    }
    return titles[page]?.[language] || titles[page]?.['fr'] || 'JobConnect'
  }

  return (
    <NavigationContext.Provider value={{ currentPage, previousPage, navigateTo, getBreadcrumbs, getPageTitle }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}

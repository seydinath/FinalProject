/**
 * Hook for managing SEO meta tags based on page navigation
 */

import { useEffect } from 'react'
import { applySEO, SEOConfig, seoManager } from '../utils/seo'
import { useNavigation } from '../utils/NavigationContext'

/**
 * Hook to update SEO meta tags for current page
 */
export function useSEO(config: SEOConfig): void {
  useEffect(() => {
    // Apply SEO configuration
    applySEO(config)

    // Clean up structured data when component unmounts
    return () => {
      seoManager.clearStructuredData()
    }
  }, [config])
}

/**
 * Hook to automatically update SEO based on current page
 */
export function usePageSEO(): void {
  const { currentPage } = useNavigation()

  // SEO configurations for each page
  const seoConfigs: Record<string, SEOConfig> = {
    landing: {
      title: 'JobConnect - Trouvez votre opportunité au Sénégal',
      description: 'JobConnect est la plateforme de recrutement n°1 au Sénégal. Connectez-vous avec les meilleurs talents et opportunités',
      keywords: 'emploi sénégal, recrutement, candidature, talents, jobs',
      ogTitle: 'JobConnect - Plateforme de Recrutement Sénégal',
      ogDescription: 'Trouvez votre prochain emploi ou le talent parfait pour votre entreprise',
      ogType: 'website',
      ogImage: 'https://jobconnect.senegal/og-image.png',
      canonical: 'https://jobconnect.senegal'
    },
    auth: {
      title: 'Connexion & Inscription - JobConnect',
      description: 'Créez votre compte JobConnect pour commencer votre recherche d\'emploi ou poster une offre',
      keywords: 'inscription, connexion, authentic',
      ogTitle: 'Rejoignez JobConnect',
      ogDescription: 'Commencez votre voyage professionnel dès maintenant',
      ogType: 'website',
      canonical: 'https://jobconnect.senegal/auth'
    },
    dashboard: {
      title: 'Tableau de Bord - JobConnect',
      description: 'Gérez vos candidatures, offres d\'emploi et profil sur JobConnect',
      keywords: 'tableau de bord, candidatures, profil, offres',
      ogTitle: 'Votre Tableau de Bord JobConnect',
      ogDescription: 'Gérez tous vos éléments de recrutement en un seul endroit',
      canonical: 'https://jobconnect.senegal/dashboard'
    },
    'talent-search': {
      title: 'Recherche de Talents - JobConnect',
      description: 'Trouvez les meilleurs talents locaux pour votre entreprise avec JobConnect',
      keywords: 'talents, candidates, recherche, hiring, recrutement',
      ogTitle: 'Recherche de Talents',
      ogDescription: 'Découvrez les meilleurs candidats du Sénégal',
      canonical: 'https://jobconnect.senegal/talent-search'
    },
    'job-seeker-profile': {
      title: 'Profil Candidat - JobConnect',
      description: 'Consultez le profil des candidats et découvrez les meilleures opportunités',
      keywords: 'profil, candidat, cv, portfolio',
      ogTitle: 'Profil Candidat',
      ogDescription: 'Découvrez les opportunités qui correspondent à vos compétences',
      canonical: 'https://jobconnect.senegal/profile'
    }
  }

  const config = seoConfigs[currentPage] || seoConfigs.landing

  useSEO(config)

  // Add structured data for current page
  useEffect(() => {
    if (currentPage === 'landing') {
      const organizationSchema = seoManager.generateOrganizationSchema()
      seoManager.addStructuredData(organizationSchema)
    }
  }, [currentPage])
}

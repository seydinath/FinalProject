/**
 * SEO Utilities for Dynamic Meta Tags Management
 * Handles meta tags, Open Graph, and structured data
 */

export interface SEOConfig {
  title: string
  description: string
  keywords?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'profile'
  twitterCard?: 'summary' | 'summary_large_image'
  author?: string
  locale?: string
  robots?: string
}

/**
 * Update meta tag in document head
 */
function updateMetaTag(name: string, content: string, isProperty: boolean = false): void {
  let element = document.querySelector(
    isProperty 
      ? `meta[property="${name}"]` 
      : `meta[name="${name}"]`
  ) as HTMLMetaElement | null

  if (!element) {
    element = document.createElement('meta')
    if (isProperty) {
      element.setAttribute('property', name)
    } else {
      element.setAttribute('name', name)
    }
    document.head.appendChild(element)
  }

  element.content = content
}

/**
 * Update page title
 */
function updateTitle(title: string): void {
  document.title = title
  updateMetaTag('og:title', title, true)
  updateMetaTag('twitter:title', title)
}

/**
 * Update canonical URL
 */
function updateCanonical(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = url
}

/**
 * Add structured data (JSON-LD)
 */
function addStructuredData(data: Record<string, any>): void {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.innerHTML = JSON.stringify(data)
  document.head.appendChild(script)
}

/**
 * Clear all structured data scripts
 */
function clearStructuredData(): void {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]')
  scripts.forEach(script => script.remove())
}

/**
 * Apply complete SEO configuration
 */
export function applySEO(config: SEOConfig): void {
  // Basic meta tags
  updateTitle(config.title)
  updateMetaTag('description', config.description)
  
  if (config.keywords) {
    updateMetaTag('keywords', config.keywords)
  }

  if (config.canonical) {
    updateCanonical(config.canonical)
  }

  // Open Graph tags
  updateMetaTag('og:title', config.ogTitle || config.title, true)
  updateMetaTag('og:description', config.ogDescription || config.description, true)
  updateMetaTag('og:type', config.ogType || 'website', true)
  
  if (config.ogImage) {
    updateMetaTag('og:image', config.ogImage, true)
    updateMetaTag('og:image:width', '1200', true)
    updateMetaTag('og:image:height', '630', true)
  }

  if (config.canonical) {
    updateMetaTag('og:url', config.canonical, true)
  }

  // Twitter tags
  updateMetaTag('twitter:card', config.twitterCard || 'summary_large_image')
  updateMetaTag('twitter:title', config.ogTitle || config.title)
  updateMetaTag('twitter:description', config.ogDescription || config.description)
  
  if (config.ogImage) {
    updateMetaTag('twitter:image', config.ogImage)
  }

  // Additional meta tags
  if (config.author) {
    updateMetaTag('author', config.author)
  }

  if (config.locale) {
    updateMetaTag('og:locale', config.locale, true)
  }

  if (config.robots) {
    updateMetaTag('robots', config.robots)
  }
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JobConnect',
    url: 'https://jobconnect.senegal',
    logo: 'https://jobconnect.senegal/logo.png',
    description: 'Connect recruiters with job seekers in Senegal',
    sameAs: [
      'https://www.facebook.com/jobconnect',
      'https://twitter.com/jobconnect',
      'https://www.linkedin.com/company/jobconnect'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@jobconnect.senegal',
      availableLanguage: ['en', 'fr']
    }
  }
}

/**
 * Generate JobPosting schema
 */
export function generateJobPostingSchema(job: {
  title: string
  company: string
  location: string
  salary?: string
  description: string
  datePosted: string
}): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'SN',
        addressLocality: job.location
      }
    },
    baseSalary: job.salary ? {
      '@type': 'PriceSpecification',
      priceCurrency: 'XOF',
      price: job.salary
    } : undefined,
    datePosted: job.datePosted
  }
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

/**
 * Generate LocalBusiness schema
 */
export function generateLocalBusinessSchema(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'JobConnect Senegal',
    image: 'https://jobconnect.senegal/logo.png',
    description: 'Premier plateforme de recrutement et d\'emploi au Sénégal',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Dakar',
      addressCountry: 'SN',
      postalCode: 'SN'
    },
    telephone: '+221 XX XXX XXXX',
    url: 'https://jobconnect.senegal',
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 14.6928,
      longitude: -17.0467
    }
  }
}

/**
 * Export singleton functions for use throughout app
 */
export const seoManager = {
  applySEO,
  addStructuredData,
  clearStructuredData,
  updateTitle,
  updateCanonical,
  generateOrganizationSchema,
  generateJobPostingSchema,
  generateBreadcrumbSchema,
  generateLocalBusinessSchema
}

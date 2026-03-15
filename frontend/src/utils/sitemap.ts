/**
 * Sitemap Generator Utility
 * Generates XML sitemaps for search engines
 */

export interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: Array<{ hreflang: string; href: string }>
}

export class SitemapGenerator {
  private entries: SitemapEntry[] = []

  /**
   * Add entries to sitemap
   */
  addEntry(entry: SitemapEntry): void {
    this.entries.push(entry)
  }

  /**
   * Add multiple entries to sitemap
   */
  addEntries(entries: SitemapEntry[]): void {
    this.entries.push(...entries)
  }

  /**
   * Generate XML sitemap
   */
  generateXML(): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>'
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
    const urlsetClose = '</urlset>'

    const urls = this.entries.map(entry => this.generateUrlElement(entry)).join('\n  ')

    return `${xmlHeader}\n<${urlsetOpen}\n  ${urls}\n${urlsetClose}`
  }

  /**
   * Generate individual URL element
   */
  private generateUrlElement(entry: SitemapEntry): string {
    let xml = '<url>'
    xml += `\n    <loc>${this.escapeXml(entry.loc)}</loc>`

    if (entry.lastmod) {
      xml += `\n    <lastmod>${entry.lastmod}</lastmod>`
    }

    if (entry.changefreq) {
      xml += `\n    <changefreq>${entry.changefreq}</changefreq>`
    }

    if (entry.priority !== undefined) {
      xml += `\n    <priority>${entry.priority}</priority>`
    }

    // Add alternate language links
    if (entry.alternates && entry.alternates.length > 0) {
      entry.alternates.forEach(alt => {
        xml += `\n    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${this.escapeXml(alt.href)}" />`
      })
    }

    xml += '\n  </url>'
    return xml
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    const xmlMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;'
    }
    return str.replace(/[&<>"']/g, char => xmlMap[char])
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = []
  }

  /**
   * Get total entry count
   */
  getEntryCount(): number {
    return this.entries.length
  }
}

/**
 * Generate default JobConnect sitemap entries
 */
export function generateDefaultSitemapEntries(): SitemapEntry[] {
  const today = new Date().toISOString().split('T')[0]

  return [
    {
      loc: 'https://jobconnect.senegal/',
      lastmod: today,
      changefreq: 'weekly',
      priority: 1.0,
      alternates: [
        { hreflang: 'en', href: 'https://jobconnect.senegal/en' },
        { hreflang: 'fr', href: 'https://jobconnect.senegal/fr' }
      ]
    },
    {
      loc: 'https://jobconnect.senegal/auth',
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.9
    },
    {
      loc: 'https://jobconnect.senegal/dashboard',
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: 'https://jobconnect.senegal/talent-search',
      lastmod: today,
      changefreq: 'daily',
      priority: 0.9
    },
    {
      loc: 'https://jobconnect.senegal/profile',
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.8
    }
  ]
}

/**
 * Generate and save sitemap
 */
export async function generateSitemap(): Promise<string> {
  const generator = new SitemapGenerator()
  const entries = generateDefaultSitemapEntries()
  generator.addEntries(entries)
  return generator.generateXML()
}

/**
 * Export singleton instance
 */
export const sitemapGenerator = new SitemapGenerator()

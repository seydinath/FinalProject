/**
 * SEO Utilities for managing robots.txt and crawling rules
 */

export interface RobotsConfig {
  userAgent: string
  allow?: string[]
  disallow?: string[]
  crawlDelay?: number
  requestRate?: number
}

export class RobotsGenerator {
  private configs: RobotsConfig[] = []
  private sitemapUrl?: string

  /**
   * Add a user agent configuration
   */
  addConfig(config: RobotsConfig): void {
    this.configs.push(config)
  }

  /**
   * Set sitemap URL
   */
  setSitemapUrl(url: string): void {
    this.sitemapUrl = url
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    let content = '# JobConnect robots.txt\n\n'

    this.configs.forEach((config, index) => {
      content += `User-agent: ${config.userAgent}\n`

      if (config.allow && config.allow.length > 0) {
        config.allow.forEach(path => {
          content += `Allow: ${path}\n`
        })
      }

      if (config.disallow && config.disallow.length > 0) {
        config.disallow.forEach(path => {
          content += `Disallow: ${path}\n`
        })
      }

      if (config.crawlDelay !== undefined) {
        content += `Crawl-delay: ${config.crawlDelay}\n`
      }

      if (config.requestRate !== undefined) {
        content += `Request-rate: ${config.requestRate}\n`
      }

      if (index < this.configs.length - 1) {
        content += '\n'
      }
    })

    if (this.sitemapUrl) {
      content += `\nSitemap: ${this.sitemapUrl}\n`
    }

    return content
  }

  /**
   * Clear all configurations
   */
  clear(): void {
    this.configs = []
    this.sitemapUrl = undefined
  }
}

/**
 * Create default robots.txt configuration for JobConnect
 */
export function createDefaultRobotsConfig(): RobotsConfig[] {
  return [
    {
      userAgent: '*',
      allow: ['/'],
      disallow: ['/api/', '/admin/', '/private/'],
      crawlDelay: 1
    },
    {
      userAgent: 'Googlebot',
      allow: ['/'],
      crawlDelay: 0
    },
    {
      userAgent: 'Bingbot',
      allow: ['/'],
      crawlDelay: 1
    }
  ]
}

/**
 * Export singleton instance
 */
export const robotsGenerator = new RobotsGenerator()

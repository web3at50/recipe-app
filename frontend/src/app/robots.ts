import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // General web crawlers (Google, Bing, etc.)
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API endpoints
          '/my-recipes',     // Auth required
          '/meal-planner',   // Auth required
          '/shopping-list',  // Auth required
          '/settings',       // Auth required
          '/onboarding',     // Auth required
          '/create-recipe',  // Auth required
        ],
      },
      // AI Crawlers - Allow homepage for LLM discoverability
      {
        userAgent: [
          'GPTBot',           // ChatGPT web browsing
          'ChatGPT-User',     // ChatGPT user agent
          'Claude-Web',       // Claude web browsing
          'anthropic-ai',     // Anthropic crawlers
          'Google-Extended',  // Google Bard/Gemini
          'PerplexityBot',    // Perplexity AI
          'CCBot',            // Common Crawl (used by many AIs)
          'Applebot-Extended',// Apple Intelligence
          'Amazonbot',        // Amazon AI
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/my-recipes',
          '/meal-planner',
          '/shopping-list',
          '/settings',
          '/onboarding',
          '/create-recipe',
        ],
      },
    ],
    sitemap: 'https://platewise.xyz/sitemap.xml',
  }
}

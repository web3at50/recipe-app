import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',                    // Homepage (marketing landing page)
  '/sign-in(.*)',        // Clerk sign-in pages
  '/sign-up(.*)',        // Clerk sign-up pages
  '/api/webhooks(.*)',   // Webhook routes
  '/opengraph-image',    // Open Graph image for social sharing
  '/twitter-image',      // Twitter card image for social sharing
  '/recipes(.*)',        // Public recipe pages (SEO-optimized)
  '/about',              // About page
  '/privacy',            // Privacy policy (GDPR compliance)
  '/terms',              // Terms of service
])

export default clerkMiddleware(async (auth, request) => {
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, including sitemap.xml and robots.txt
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

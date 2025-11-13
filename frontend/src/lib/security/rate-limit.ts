/**
 * Simple in-memory rate limiter for API routes
 *
 * NOTE: This is a basic implementation suitable for portfolio/demo projects.
 * For production with multiple servers, use Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Custom identifier for the rate limit (defaults to IP + endpoint)
   */
  identifier?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Rate limit checker
 *
 * @param identifier - Unique identifier for the request (user ID, IP, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 *
 * @example
 * ```ts
 * const result = checkRateLimit(userId, { maxRequests: 10, windowSeconds: 60 });
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Rate limit exceeded', retryAfter: result.retryAfter },
 *     { status: 429 }
 *   );
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = `${identifier}:${config.identifier || 'default'}`;

  const entry = store.get(key);

  if (!entry || entry.resetTime < now) {
    // First request or window expired - create new entry
    const resetTime = now + windowMs;
    store.set(key, { count: 1, resetTime });

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Window still active
  if (entry.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Increment count
  entry.count++;
  store.set(key, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware for Next.js API routes
 *
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const { userId } = await auth();
 *   const rateLimitResult = await rateLimitMiddleware(request, userId || getIP(request), {
 *     maxRequests: 10,
 *     windowSeconds: 60,
 *   });
 *
 *   if (rateLimitResult) return rateLimitResult; // Returns 429 error
 *
 *   // Continue with normal processing
 * }
 * ```
 */
export async function rateLimitMiddleware(
  request: Request,
  identifier: string,
  config: RateLimitConfig
): Promise<Response | null> {
  const result = checkRateLimit(identifier, config);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          'Retry-After': result.retryAfter?.toString() || '60',
        },
      }
    );
  }

  return null; // Rate limit passed
}

/**
 * Extract IP address from request (for anonymous rate limiting)
 */
export function getRequestIP(request: Request): string {
  // Check various headers (in order of preference)
  const headers = request.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  const cfConnectingIP = headers.get('cf-connecting-ip'); // Cloudflare

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first
    return forwardedFor.split(',')[0].trim();
  }

  return 'unknown';
}

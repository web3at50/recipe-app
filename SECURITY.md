# Security

This document outlines the security measures implemented in PlateWise to protect user data and prevent common web vulnerabilities.

## Security Overview

PlateWise follows modern web security best practices with a defense-in-depth approach. Multiple layers of protection work together to ensure data safety and prevent malicious activity.

**Security Principles:**
- ✅ Secure by default - all endpoints require authentication
- ✅ Input validation at multiple layers (client, server, database)
- ✅ Defense in depth - multiple security controls working together
- ✅ Principle of least privilege - users only access their own data
- ✅ Regular security reviews and updates

---

## Authentication & Authorization

### User Authentication

**Provider:** [Clerk](https://clerk.com/)

PlateWise uses Clerk for authentication, providing enterprise-grade security without building custom auth from scratch.

**Features:**
- ✅ Secure password hashing (never stored in plaintext)
- ✅ Google Single Sign-On (SSO) support
- ✅ Session management with secure JWT tokens
- ✅ Automatic session expiration and refresh
- ✅ Protection against session hijacking

**Implementation:**
- All API routes verify user identity via Clerk sessions
- Unauthorized requests receive 401 responses
- Session tokens are validated on every request

### Authorization & Access Control

**Database:** [Supabase](https://supabase.com/) with PostgreSQL Row-Level Security (RLS)

**Row-Level Security Policies:**
- Users can only read and write their own recipes
- User profiles are private and isolated
- Meal plans and shopping lists are user-specific
- Public recipes are read-only for non-owners
- Admin users have elevated access controlled via Clerk metadata

**Admin Access:**
- Admin privileges managed through Clerk user metadata
- No hardcoded admin credentials in code
- Environment variables provide additional access control
- Admin actions are logged for audit trails

---

## Input Validation & Sanitization

### Client-Side Validation

**Technology:** React Hook Form + Zod

All user inputs are validated before submission:
- ✅ Required fields enforced
- ✅ Character limits on text inputs (max 2000 chars for ingredients, 500 for descriptions)
- ✅ Type checking (numbers, strings, arrays)
- ✅ Format validation (URLs, email addresses)
- ✅ Real-time feedback to users

### Server-Side Validation

**Technology:** Zod validation schemas

Never trust client-side validation alone. All API endpoints re-validate inputs:

**Recipe Generation API (`/api/ai/generate`):**
```
✅ Ingredients array: 1-50 items, each max 200 characters
✅ Description: max 500 characters
✅ Dietary restrictions: validated against allowed values
✅ Allergen IDs: verified against database
```

**Recipe Creation API (`/api/recipes`):**
```
✅ Recipe name: required, 1-200 characters
✅ Instructions: 1-50 steps, each max 1000 characters
✅ Servings: number between 1-50
✅ Times: valid numbers for prep/cook time
✅ URLs: validated format for image URLs
```

**Benefits:**
- Invalid requests rejected before processing (400 Bad Request)
- Detailed error messages help users correct issues
- Prevents malformed data from reaching the database

### Input Sanitization

**Custom sanitization layer** removes potentially dangerous content:

**Protection Against:**
- ✅ HTML tags stripped from all inputs
- ✅ JavaScript protocols (`javascript:`, `data:text/html`) removed
- ✅ Event handlers (`onclick=`, `onerror=`) removed
- ✅ Suspicious XSS patterns detected and blocked

**Sanitization Applies To:**
- Recipe names, descriptions, and cuisine types
- Ingredient names, quantities, and notes
- Cooking instructions
- Tags and category labels

**Note:** Sanitization is lightweight to preserve legitimate recipe content (fractions like "1/2 cup", measurements, etc.) while blocking malicious code.

---

## SQL Injection Protection

**Status:** ✅ Protected by default

**Technology:** Supabase PostgreSQL with parameterized queries

**How It Works:**
- All database queries use Supabase's query builder
- User inputs are automatically parameterized
- No raw SQL strings concatenated with user data
- PostgreSQL prepared statements prevent injection attacks

**Example:**
```typescript
// Safe: Supabase parameterizes automatically
await supabase
  .from('recipes')
  .select('*')
  .eq('user_id', userId)  // userId is parameterized, never interpolated
  .ilike('name', `%${search}%`)  // search is safely escaped
```

**Additional Protection:**
- Row-Level Security prevents unauthorized data access even if queries are compromised
- Database users have minimal permissions (principle of least privilege)

---

## Cross-Site Scripting (XSS) Protection

**Defense-in-Depth Approach:** Multiple layers prevent XSS attacks

### 1. React Auto-Escaping
React automatically escapes all JSX values, preventing most XSS attacks by default.

### 2. Content Security Policy (CSP)
Strict CSP headers prevent execution of unauthorized scripts:

```
✅ script-src: Only allow scripts from trusted origins
✅ default-src: Restrict all content to same-origin
✅ img-src: Allow images from Vercel Blob storage and data: URIs
✅ connect-src: Limit API requests to authorized domains
✅ worker-src: Restrict web workers to same-origin + blobs
```

**Blocks:**
- Inline scripts injected via user input
- Scripts from unauthorized domains
- Eval() and similar dangerous functions

### 3. Input Sanitization
Server-side sanitization removes XSS patterns before storage (see Input Validation section).

### 4. Pattern Detection
Additional layer detects suspicious XSS attempts:
- `<script>` tags
- `javascript:` pseudo-protocol
- Event handler attributes
- `<iframe>`, `<object>`, `<embed>` tags
- `eval()` function calls

**Result:** Multi-layered protection ensures user-generated content cannot execute scripts.

---

## Rate Limiting

**Technology:** In-memory rate limiting middleware

**Purpose:** Prevent abuse, brute-force attacks, and excessive API usage

### Rate Limits

**Recipe Generation (`/api/ai/generate`):**
- 5 requests per minute per user/IP
- Prevents spam and AI cost abuse
- Returns 429 status with retry-after header

**Recipe Creation (`/api/recipes`):**
- 20 recipes per hour per user
- Prevents database spam
- Protects against malicious bulk uploads

### Credit System

Additional cost control via user credits:
- Each AI generation costs 1 credit
- Free tier users limited to 12 generations
- Prevents runaway AI costs
- Usage tracked per user in database

**Benefits:**
- Protects AI API budget
- Prevents denial-of-service attacks
- Ensures fair usage across all users

---

## Security Headers

**Technology:** Next.js configuration with custom headers

All pages include security headers:

### X-Frame-Options
```
X-Frame-Options: DENY
```
Prevents clickjacking attacks by blocking embedding in iframes.

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
Prevents MIME-type sniffing attacks.

### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
Enables browser XSS filtering (legacy browsers).

### Content-Security-Policy
Comprehensive CSP (see XSS Protection section above).

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
Controls information sent to other sites via Referer header.

---

## Data Privacy & Protection

### Data Storage

**User Data:**
- Stored in Supabase PostgreSQL (SOC 2 Type II certified)
- Encrypted at rest and in transit (TLS 1.3)
- Row-Level Security enforces data isolation
- Regular automated backups

**Authentication Data:**
- Managed by Clerk (SOC 2 Type II certified)
- Passwords hashed with bcrypt
- Session tokens use secure JWT standards
- No passwords stored in application database

### API Keys & Secrets

**Environment Variables:**
- All secrets stored as environment variables
- Never committed to Git repository
- Separate keys for development and production
- Vercel manages production secrets securely

**AI Provider Keys:**
- Stored server-side only (never exposed to browser)
- Each provider uses separate API keys
- Keys rotatable without code changes

### Data Retention

**User Recipes:**
- Retained indefinitely while account is active
- Deleted when user deletes account
- No third-party sharing

**AI Usage Logs:**
- Retained for analytics and cost tracking
- No personal information stored in logs
- Aggregated daily for long-term analytics

---

## CSRF Protection

**Status:** ✅ Protected by default

**Technology:** Next.js built-in CSRF protection

- All POST/PUT/DELETE requests require valid origin headers
- SameSite cookie attributes prevent cross-site requests
- No additional configuration needed

---

## HTTPS & Transport Security

**Production:**
- ✅ All traffic uses HTTPS (TLS 1.3)
- ✅ Automatic SSL certificate renewal via Vercel
- ✅ HTTP requests automatically redirected to HTTPS
- ✅ HSTS header enforces HTTPS in browsers

**Development:**
- Local development uses HTTP (localhost only)
- Production environment variables required for deployment

---

## Dependency Management

**Technology:** npm with package-lock.json

**Practices:**
- ✅ Package versions locked for consistency
- ✅ Regular dependency updates for security patches
- ✅ npm audit run before deployments
- ✅ Vercel automatically scans for vulnerable packages

**Current Status:**
- Automated security scanning via Vercel
- Critical vulnerabilities addressed immediately
- Non-critical updates evaluated for stability

---

## Vulnerability Disclosure

### Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

**📧 Email:** support@syntorak.com
**Subject:** [SECURITY] PlateWise Vulnerability Report

**Please Include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your name/contact (if you'd like credit)

**Please DO NOT:**
- Publicly disclose the vulnerability before we've addressed it
- Exploit the vulnerability beyond proof-of-concept
- Access or modify other users' data

### Response Timeline

**We will:**
1. Acknowledge receipt within 48 hours
2. Provide initial assessment within 7 days
3. Keep you updated on progress
4. Credit you in fix notes (if desired)

**Note:** As a portfolio project, this is not a commercial bug bounty program. We appreciate responsible disclosure but cannot offer financial rewards.

---

## Security Audit History

### Comprehensive Security Review (November 2025)

**Scope:** Full application security audit focusing on:
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Rate limiting
- ✅ Security headers and CSP

**Findings & Resolutions:**
- Added max length constraints to all text inputs
- Implemented Zod validation schemas for all API endpoints
- Added XSS sanitization layer with pattern detection
- Configured comprehensive Content Security Policy
- Implemented rate limiting on AI and recipe endpoints
- Added security headers (X-Frame-Options, X-Content-Type-Options, etc.)

**Result:** All identified issues resolved. Multi-layered security approach implemented.

---

## Best Practices Followed

✅ **Authentication:** Industry-standard provider (Clerk) instead of custom auth
✅ **Authorization:** Row-Level Security enforces data isolation
✅ **Input Validation:** Multiple layers (client + server + database)
✅ **SQL Injection:** Parameterized queries via Supabase ORM
✅ **XSS Protection:** React escaping + CSP + sanitization + pattern detection
✅ **Rate Limiting:** Prevents abuse and excessive API usage
✅ **Security Headers:** CSP, X-Frame-Options, X-Content-Type-Options, etc.
✅ **HTTPS:** All production traffic encrypted (TLS 1.3)
✅ **Secrets Management:** Environment variables, never in code
✅ **Dependency Security:** Regular updates and vulnerability scanning
✅ **Defense in Depth:** Multiple overlapping security controls

---

## Additional Resources

- **Clerk Security:** [https://clerk.com/security](https://clerk.com/security)
- **Supabase Security:** [https://supabase.com/docs/guides/platform/security](https://supabase.com/docs/guides/platform/security)
- **OWASP Top 10:** [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)
- **Next.js Security:** [https://nextjs.org/docs/app/building-your-application/configuring/security](https://nextjs.org/docs/app/building-your-application/configuring/security)

---

## Questions?

For security questions or concerns about PlateWise:
📧 support@syntorak.com

For general technical documentation:
📄 See [README.md](README.md) and [TECHNICAL.md](TECHNICAL.md)

---

**Last Updated:** November 2025
**Next Review:** Quarterly or after significant changes

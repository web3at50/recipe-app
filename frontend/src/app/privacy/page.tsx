import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy | PlateWise',
  description: 'PlateWise privacy policy. Learn how we collect, use, and protect your data in compliance with UK GDPR regulations.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        {' / '}
        <span className="text-foreground">Privacy Policy</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated: January 21, 2025
        </p>
      </div>

      {/* Introduction */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            PlateWise (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you use our AI recipe generation service.
          </p>
          <p>
            We comply with the UK General Data Protection Regulation (UK GDPR) and
            the Data Protection Act 2018.
          </p>
        </CardContent>
      </Card>

      {/* Information We Collect */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h3>Account Information</h3>
          <p>When you create an account, we collect:</p>
          <ul>
            <li>Email address</li>
            <li>Name (optional)</li>
            <li>Authentication credentials (managed by Clerk)</li>
          </ul>

          <h3>Recipe Data</h3>
          <p>When you use our service, we store:</p>
          <ul>
            <li>Recipes you create or save</li>
            <li>Ingredients you input</li>
            <li>Dietary preferences and allergen information</li>
            <li>Meal plans and shopping lists</li>
          </ul>

          <h3>Usage Information</h3>
          <p>We automatically collect:</p>
          <ul>
            <li>Device information (browser type, operating system)</li>
            <li>IP address and location data</li>
            <li>Usage analytics (pages viewed, features used)</li>
          </ul>
        </CardContent>
      </Card>

      {/* How We Use Your Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain our AI recipe generation service</li>
            <li>Personalize your recipe recommendations</li>
            <li>Process payments (via Stripe)</li>
            <li>Send service-related notifications</li>
            <li>Improve our service and develop new features</li>
            <li>Comply with legal obligations</li>
          </ul>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Data Sharing and Third Parties</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>We share your information with:</p>
          <ul>
            <li><strong>Clerk</strong> - Authentication and user management</li>
            <li><strong>Supabase</strong> - Database hosting (EU servers)</li>
            <li><strong>Vercel</strong> - Application hosting and CDN</li>
            <li><strong>OpenAI/Anthropic</strong> - AI recipe generation (anonymized data only)</li>
            <li><strong>Stripe</strong> - Payment processing</li>
          </ul>
          <p>
            We do not sell your personal information to third parties.
          </p>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Rights (UK GDPR)</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>Under UK GDPR, you have the right to:</p>
          <ul>
            <li><strong>Access</strong> - Request a copy of your personal data</li>
            <li><strong>Rectification</strong> - Correct inaccurate or incomplete data</li>
            <li><strong>Erasure</strong> - Request deletion of your data (&quot;right to be forgotten&quot;)</li>
            <li><strong>Portability</strong> - Receive your data in a machine-readable format</li>
            <li><strong>Restriction</strong> - Limit how we use your data</li>
            <li><strong>Object</strong> - Object to certain types of processing</li>
            <li><strong>Withdraw Consent</strong> - Withdraw consent at any time</li>
          </ul>
          <p>
            To exercise these rights, please contact us at{' '}
            <a href="mailto:privacy@platewise.xyz" className="text-primary hover:underline">
              privacy@platewise.xyz
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            We retain your personal data for as long as your account is active or as
            needed to provide services. If you delete your account, we will delete or
            anonymize your data within 30 days, except where retention is required by law.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Data Security</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            We implement appropriate technical and organizational measures to protect
            your data, including:
          </p>
          <ul>
            <li>Encryption in transit (TLS/SSL) and at rest</li>
            <li>Role-based access control</li>
            <li>Regular security audits</li>
            <li>Secure authentication (via Clerk)</li>
          </ul>
          <p>
            However, no internet transmission is 100% secure. We cannot guarantee
            absolute security.
          </p>
        </CardContent>
      </Card>

      {/* Cookies */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cookies and Tracking</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Maintain your login session</li>
            <li>Remember your preferences</li>
            <li>Analyze usage patterns</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Disabling cookies
            may limit functionality.
          </p>
        </CardContent>
      </Card>

      {/* Changes to Policy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Changes to This Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            We may update this Privacy Policy from time to time. We will notify you
            of material changes by email or through our service.
          </p>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            If you have questions about this Privacy Policy or our data practices,
            please contact us:
          </p>
          <ul>
            <li>
              Email:{' '}
              <a href="mailto:privacy@platewise.xyz" className="text-primary hover:underline">
                privacy@platewise.xyz
              </a>
            </li>
            <li>
              Website:{' '}
              <a href="https://platewise.xyz" className="text-primary hover:underline">
                platewise.xyz
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* ICO Information */}
      <Card>
        <CardHeader>
          <CardTitle>ICO Registration</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            If you believe we have not handled your data correctly, you have the right
            to lodge a complaint with the Information Commissioner&apos;s Office (ICO):
          </p>
          <ul>
            <li>Website: <a href="https://ico.org.uk" className="text-primary hover:underline" target="_blank" rel="noopener">ico.org.uk</a></li>
            <li>Phone: 0303 123 1113</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

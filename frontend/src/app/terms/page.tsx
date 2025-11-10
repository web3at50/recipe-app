import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service | PlateWise',
  description: 'PlateWise terms of service. Read our user agreement and guidelines for using our AI recipe generation platform.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        {' / '}
        <span className="text-foreground">Terms of Service</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">
          Last updated: January 21, 2025
        </p>
      </div>

      {/* Introduction */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Agreement to Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            By accessing or using PlateWise (&quot;the Service&quot;), you agree to be bound by
            these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these
            terms, you may not access the Service.
          </p>
          <p>
            These Terms apply to all users of the Service, including without limitation
            users who are browsers, customers, and contributors of content.
          </p>
        </CardContent>
      </Card>

      {/* Service Description */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Service Description</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>PlateWise provides:</p>
          <ul>
            <li>AI-powered recipe generation based on user inputs</li>
            <li>Recipe storage and organization</li>
            <li>Meal planning and shopping list features</li>
            <li>UK-specific measurements and allergen tracking</li>
          </ul>
          <p>
            We reserve the right to modify or discontinue the Service at any time
            without notice.
          </p>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Demo Access and Purpose</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h3>Demo Access</h3>
          <p>
            This is a <strong>free portfolio demonstration project</strong>. New users receive{' '}
            <strong>12 free recipe generations</strong> (3 batches of 4, or 12 singles). No payment required.
          </p>

          <h3>Purpose</h3>
          <p>
            PlateWise is a technical demonstration showcasing AI recipe generation technology,
            meal planning features, and UK-specific culinary considerations. It demonstrates
            full-stack development capabilities including Next.js, Supabase, AI integration,
            and responsive design.
          </p>

          <h3>Safety Notice</h3>
          <p>
            AI-generated recipes have <strong>not been tested in real kitchens</strong> and should
            not be used for actual cooking or relied upon for allergen safety. Development paused
            pending implementation of testing protocols. For questions, contact{' '}
            <a href="mailto:support@platewise.xyz" className="text-primary hover:underline">
              support@platewise.xyz
            </a>.
          </p>
        </CardContent>
      </Card>

      {/* User Accounts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>To use certain features, you must create an account. You agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your password</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>Be responsible for all activity under your account</li>
          </ul>
          <p>
            We reserve the right to terminate accounts that violate these Terms.
          </p>
        </CardContent>
      </Card>

      {/* User Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User-Generated Content</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            You retain ownership of recipes you create using PlateWise. By using the
            Service, you grant us:
          </p>
          <ul>
            <li>A license to store and display your recipes within the Service</li>
            <li>Permission to use anonymized recipe data to improve our AI models</li>
          </ul>
          <p>You agree not to:</p>
          <ul>
            <li>Upload recipes that infringe copyright or other intellectual property</li>
            <li>Share harmful, offensive, or illegal content</li>
            <li>Attempt to scrape or download bulk recipe data</li>
          </ul>
        </CardContent>
      </Card>

      {/* AI Disclaimer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI-Generated Content Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="font-semibold">
            PlateWise uses artificial intelligence to generate recipes. While we strive
            for accuracy, AI-generated content may contain errors.
          </p>
          <ul>
            <li><strong>Not Professional Advice</strong> - Recipes are for informational purposes only</li>
            <li><strong>Allergen Warnings</strong> - Always verify allergen information independently</li>
            <li><strong>Food Safety</strong> - Follow proper food handling and cooking guidelines</li>
            <li><strong>Dietary Needs</strong> - Consult a healthcare professional for medical dietary advice</li>
          </ul>
          <p>
            You use AI-generated recipes at your own risk. PlateWise is not liable for
            any adverse reactions, illness, or injury.
          </p>
        </CardContent>
      </Card>

      {/* Prohibited Uses */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prohibited Uses</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>You may not use PlateWise to:</p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Infringe on others&apos; intellectual property rights</li>
            <li>Transmit viruses, malware, or harmful code</li>
            <li>Reverse engineer or attempt to access our source code</li>
            <li>Use bots or automated tools to generate recipes at scale</li>
            <li>Resell or redistribute our Service without authorization</li>
          </ul>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            The PlateWise Service, including its design, code, logos, and branding, is
            protected by copyright and other intellectual property laws.
          </p>
          <p>
            You may not copy, modify, distribute, or create derivative works without
            our express written permission.
          </p>
        </CardContent>
      </Card>

      {/* Limitation of Liability */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            To the maximum extent permitted by law, PlateWise and its affiliates shall
            not be liable for:
          </p>
          <ul>
            <li>Indirect, incidental, or consequential damages</li>
            <li>Loss of profits, data, or goodwill</li>
            <li>Service interruptions or errors</li>
            <li>Third-party conduct or content</li>
          </ul>
          <p>
            Our total liability shall not exceed the amount you paid us in the past 12
            months (maximum £9.99).
          </p>
        </CardContent>
      </Card>

      {/* Indemnification */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Indemnification</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            You agree to indemnify and hold PlateWise harmless from any claims,
            damages, or expenses arising from:
          </p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your infringement of any third-party rights</li>
          </ul>
        </CardContent>
      </Card>

      {/* Governing Law */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Governing Law</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            These Terms are governed by the laws of England and Wales. Any disputes
            shall be subject to the exclusive jurisdiction of the courts of England and
            Wales.
          </p>
        </CardContent>
      </Card>

      {/* Changes to Terms */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Changes to Terms</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            We may modify these Terms at any time. Material changes will be notified via
            email or through the Service. Continued use after changes constitutes
            acceptance.
          </p>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>Questions about these Terms? Contact us:</p>
          <ul>
            <li>
              Email:{' '}
              <a href="mailto:support@platewise.xyz" className="text-primary hover:underline">
                support@platewise.xyz
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
    </div>
  );
}

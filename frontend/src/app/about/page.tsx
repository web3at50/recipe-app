import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Sparkles, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About PlateWise | AI Recipe Generator for UK Cooks',
  description: 'Learn about PlateWise - the UK\'s simplest AI recipe app. British measurements, UK allergen standards, and personalised recipes in 30 seconds.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        {' / '}
        <span className="text-foreground">About</span>
      </nav>

      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">About PlateWise</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The UK&apos;s simplest AI recipe app. British measurements, UK allergen standards,
          and personalised recipes in 30 seconds.
        </p>
      </div>

      {/* Our Story */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            Our Story
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            PlateWise was created to solve a simple problem: traditional recipe apps are
            overcomplicated, ad-heavy, and don&apos;t speak to UK cooks. We wanted something
            that understood British measurements, UK allergen standards, and actually
            worked with what&apos;s in your kitchen.
          </p>
          <p>
            Using AI, we&apos;ve built a recipe generator that creates personalised recipes
            in seconds. No scrolling through life stories. No pop-up ads. Just simple,
            practical recipes tailored to your ingredients and preferences.
          </p>
        </CardContent>
      </Card>

      {/* What Makes Us Different */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            What Makes Us Different
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="text-primary mt-1">✓</span>
              <div>
                <strong>British Measurements</strong> - Grams, ml, and temperatures that make sense
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-primary mt-1">✓</span>
              <div>
                <strong>UK Allergen Standards</strong> - Compliant with UK Food Standards Agency guidelines
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-primary mt-1">✓</span>
              <div>
                <strong>Free Portfolio Demo</strong> - 12 free recipe generations. Technical demonstration project.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-primary mt-1">✓</span>
              <div>
                <strong>AI-Powered Variations</strong> - Get 4 different recipe variations in 30 seconds
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-primary mt-1">✓</span>
              <div>
                <strong>Your Ingredients</strong> - Generate recipes based on what&apos;s actually in your kitchen
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Our Mission */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p>
            We believe cooking should be simple, accessible, and tailored to you.
            PlateWise exists to make home cooking easier for UK families by:
          </p>
          <ul>
            <li>Reducing food waste (use what you have)</li>
            <li>Saving time (no endless recipe searching)</li>
            <li>Supporting dietary needs (allergen tracking built-in)</li>
            <li>Making meal planning effortless</li>
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold mb-4">Ready to Try the Demo?</h2>
        <p className="text-muted-foreground mb-6">
          12 free recipe generations. No payment required. Portfolio demonstration.
        </p>
        <Link href="/">
          <Button size="lg">
            Start Demo
          </Button>
        </Link>
      </div>
    </div>
  );
}

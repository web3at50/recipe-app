import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from "next/image"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Check, CreditCard, Zap, ShieldCheck } from "lucide-react"

export default async function Home() {
  // Redirect authenticated users to recipes page
  const { userId } = await auth()
  if (userId) {
    redirect('/my-recipes')
  }

  // Structured Data for SEO and Rich Snippets
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      // Software Application Schema
      {
        '@type': 'SoftwareApplication',
        name: 'PlateWise',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web Browser',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'GBP',
          availability: 'https://schema.org/InStock',
          description: 'Free technical demonstration - PlateWise AI recipe manager',
        },
        description: 'AI-powered recipe manager and meal planner for UK cooks. Technical demonstration project. Enter ingredients, get 4 personalised recipes in 30 seconds. British measurements, UK allergen standards.',
        featureList: [
          'AI recipe generation',
          'Meal planning',
          'Shopping list generation',
          'UK allergen tracking',
          'British measurements',
          'Pantry management',
        ],
      },
      // FAQ Schema
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is PlateWise free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Yes! PlateWise is a free technical demonstration project. You can sign up and receive 12 free recipe generations (3 batches of 4 or 12 batches of 1). No payment required.",
            },
          },
          {
            '@type': 'Question',
            name: 'How is PlateWise different from other recipe apps?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'PlateWise offers comprehensive inputs including allergies, pantry staples, and skill level. It generates 4 different recipe variations in one click. Built specifically for UK cooks with British measurements, British ingredients, and UK allergen standards.',
            },
          },
        ],
      },
      // Organization Schema
      {
        '@type': 'Organization',
        name: 'PlateWise',
        url: 'https://platewise.xyz',
        logo: 'https://platewise.xyz/logo.png',
        description: 'AI-powered recipe manager for UK home cooks',
        foundingDate: '2025',
        areaServed: 'GB',
      },
    ],
  }

  return (
    <div className="min-h-screen">
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Logo */}
          <div className="inline-flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="PlateWise Logo"
              width={80}
              height={80}
              className="rounded-full ring-4 ring-orange-500 ring-offset-4 ring-offset-background"
            />
          </div>

          {/* Warning Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 dark:border-amber-700 rounded-lg p-4 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div className="text-left">
                <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Important Notice</h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  This is a technical demonstration project. AI-generated recipes have not been tested in real kitchens and should not be used for actual cooking or relied upon for allergen safety. Development paused pending implementation of testing protocols.
                </p>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              &ldquo;What&rsquo;s for Dinner?&rdquo; Solved in 30 Seconds—Without Wasting Food or Money
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              UK&rsquo;s simplest AI recipe app. Enter what you have, get 4 personalised recipes instantly. <span className="font-semibold text-foreground">Free demo access.</span>
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span>12 free recipe generations</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span>No payment required</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <SignUpButton mode="modal">
              <Button size="lg" className="text-lg h-14 px-8">
                Start Free Demo
              </Button>
            </SignUpButton>

            <SignInButton mode="modal">
              <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                Sign In
              </Button>
            </SignInButton>
          </div>

          <p className="text-sm text-muted-foreground">
            3 batches of 4 recipes or 12 batches of 1 <span className="font-medium">(12 total generations)</span> free
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-4">
              How PlateWise Works
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Three simple steps to personalised recipes that actually fit your life
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      1
                    </div>
                    <h3 className="text-xl font-semibold">Enter What You Have</h3>
                    <p className="text-muted-foreground">
                      List your ingredients, dietary needs, allergies, and pantry staples. The more details, the better your recipes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      2
                    </div>
                    <h3 className="text-xl font-semibold">Get 4 Personalised Recipes</h3>
                    <p className="text-muted-foreground">
                      Click generate and receive 4 different recipe styles instantly—Balanced, Guided, Streamlined, or Essential.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                      3
                    </div>
                    <h3 className="text-xl font-semibold">Cook with Confidence</h3>
                    <p className="text-muted-foreground">
                      Save your favorites, plan your week, and generate shopping lists—all in one place.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* UK Benefits Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-4">
              Built for UK Cooks 
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Tired of recipe apps that use cups and Fahrenheit? We speak your language.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">🇬🇧 British Measurements</h3>
                  <p className="text-sm text-muted-foreground">
                    Grams, milliliters, and Celsius. No confusing cup conversions or Fahrenheit guesswork.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">🥬 British Ingredients</h3>
                  <p className="text-sm text-muted-foreground">
                    Courgettes, not zucchini. Aubergines, not eggplants. Recipes that match what&rsquo;s in Tesco.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">🛒 UK Supermarket Brands</h3>
                  <p className="text-sm text-muted-foreground">
                    Shopping lists reference actual products from Tesco, Sainsbury&rsquo;s, and Asda.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">⚖️ UK Allergen Standards</h3>
                  <p className="text-sm text-muted-foreground">
                    All 14 UK allergens tracked (including celery, lupin, and sulphites). In line with Natasha&rsquo;s Law
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Everything you need to know about PlateWise
            </p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Is PlateWise free to use?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Yes! PlateWise is a free technical demonstration project. You can sign up and receive 12 free recipe generations (3 batches of 4 or 12 batches of 1). No payment required.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Can I use these recipes for cooking?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    No. This is a technical demonstration only. AI-generated recipes have not been tested in real kitchens and should not be used for actual cooking or relied upon for allergen safety. Development is paused pending implementation of testing protocols.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  How is PlateWise different from other recipe apps?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground mb-2">
                    <span className="font-semibold">1. Comprehensive inputs:</span> Unlike generic AI recipe generators, PlateWise asks for detailed preferences (allergies, pantry staples, skill level, cook time, spice preference) to generate recipes that actually work for your life.
                  </p>
                  <p className="text-muted-foreground mb-2">
                    <span className="font-semibold">2. Four recipe styles:</span> Generate 4 different recipe variations in one click (Balanced, Guided, Streamlined, Essential) and compare approaches instantly.
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold">3. UK-first:</span> British measurements, British ingredients, UK allergen standards. Built for home cooks in the UK, not adapted from American apps.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  What&rsquo;s the purpose of this demo?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    PlateWise is a portfolio project showcasing AI recipe generation technology, meal planning features, and UK-specific culinary considerations. It demonstrates full-stack development capabilities including Next.js, Supabase, AI integration, and responsive design.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Explore AI Recipe Generation?
            </h2>
            <p className="text-lg opacity-90">
              Try this technical demonstration of UK-focused recipe AI technology
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <SignUpButton mode="modal">
                <Button size="lg" variant="secondary" className="text-lg h-14 px-8">
                  Start Free Demo
                </Button>
              </SignUpButton>
            </div>

            <p className="text-sm opacity-75">
              12 free generations • No payment required • Portfolio demonstration
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

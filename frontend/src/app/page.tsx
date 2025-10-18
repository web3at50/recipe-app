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
    redirect('/recipes')
  }

  return (
    <div className="min-h-screen">
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

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              &ldquo;What&rsquo;s for Dinner?&rdquo; Solved in 30 Seconds—Without Wasting Food or Money
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              UK&rsquo;s simplest AI recipe app. Enter what you have, get 4 personalised recipes instantly. <span className="font-semibold text-foreground">No credit card required.</span>
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span>40 recipes free</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span>£9.99 lifetime after</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <SignUpButton mode="modal">
              <Button size="lg" className="text-lg h-14 px-8">
                Start Free - No Card Needed
              </Button>
            </SignUpButton>

            <SignInButton mode="modal">
              <Button size="lg" variant="outline" className="text-lg h-14 px-8">
                Sign In
              </Button>
            </SignInButton>
          </div>

          <p className="text-sm text-muted-foreground">
            10 batches of 4 recipes <span className="font-medium">(40 total recipes)</span> free to try
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

      {/* Pricing Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-4">
              £9.99 Once. Not £84/Year.
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Other recipe apps charge subscriptions forever. PlateWise is one payment. Own it for life.
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free Tier */}
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold">Free Trial</h3>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold">£0</p>
                      <p className="text-sm text-muted-foreground">No credit card required</p>
                    </div>
                    <ul className="space-y-3 text-left">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">10 batches of 4 recipes (40 total)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">All 4 recipe styles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Meal planning & shopping lists</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Dietary & allergen tracking</span>
                      </li>
                    </ul>
                    <SignUpButton mode="modal">
                      <Button className="w-full" size="lg">
                        Start Free Trial
                      </Button>
                    </SignUpButton>
                  </div>
                </CardContent>
              </Card>

              {/* Lifetime Tier */}
              <Card className="border-2 border-primary relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    BEST VALUE
                  </span>
                </div>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold">Lifetime Access</h3>
                    <div className="space-y-2">
                      <p className="text-4xl font-bold">£9.99</p>
                      <p className="text-sm text-muted-foreground">One-time payment</p>
                    </div>
                    <ul className="space-y-3 text-left">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-semibold">Unlimited recipes forever</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">All features included</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Future updates free</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">No subscription, no recurring fees</span>
                      </li>
                    </ul>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Save £74/year vs subscription apps
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        ChefGPT costs £83.88/year. You pay £9.99 once.
                      </p>
                    </div>
                    <SignUpButton mode="modal">
                      <Button className="w-full" variant="default" size="lg">
                        Try Free First
                      </Button>
                    </SignUpButton>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Start with 40 free recipes. Upgrade to lifetime access when you&rsquo;re ready. No pressure.
            </p>
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
                  Is it really free to start? Do I need a credit card?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Yes, it&rsquo;s completely free to start! You get 10 batches of 4 recipes (40 total recipes) without entering any payment details. No credit card required. You only pay £9.99 if you want unlimited access after your free recipes run out.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  What happens after my 40 free recipes?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    After you&rsquo;ve used your 40 free recipes, you&rsquo;ll be prompted to upgrade to lifetime access for £9.99. This is a one-time payment—not a subscription. Pay once, use forever. All your saved recipes, meal plans, and shopping lists stay accessible.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Is this a subscription or a one-time payment?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    It&rsquo;s a <span className="font-semibold">one-time payment</span> of £9.99 for lifetime access. No monthly fees, no annual renewals, no hidden costs. Pay once and own PlateWise forever. Most recipe apps charge £6.99-£12.99 <em>per month</em>—that&rsquo;s £84-£155 per year. You pay £9.99 once.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Can I cancel anytime?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    There&rsquo;s nothing to cancel! Since it&rsquo;s a one-time £9.99 payment (not a subscription), you own lifetime access from day one. No recurring charges means nothing to cancel. Your account and all your recipes stay active forever.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
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

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  What if I don&rsquo;t like the recipes?
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    That&rsquo;s why we offer 40 free recipes to try before paying anything! If PlateWise doesn&rsquo;t work for you, you&rsquo;ve lost nothing (no credit card was required). The more details you provide (ingredients, allergies, preferences), the better your recipes will be. Most users find their favorite recipe style within the first 3-4 batches.
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
              Ready to Solve &ldquo;What&rsquo;s for Dinner?&rdquo; Forever?
            </h2>
            <p className="text-lg opacity-90">
              Join UK families saving time, money, and reducing food waste with PlateWise
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <SignUpButton mode="modal">
                <Button size="lg" variant="secondary" className="text-lg h-14 px-8">
                  Start Free - No Card Required
                </Button>
              </SignUpButton>
            </div>

            <p className="text-sm opacity-75">
              40 recipes free • £9.99 lifetime after • No subscription ever
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

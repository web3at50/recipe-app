import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChefHat, Calendar, ShoppingCart, Sparkles } from "lucide-react"
import AuthenticatedRedirect from "./(authenticated-redirect)/page"

export default function Home() {
  // Show marketing landing page for unauthenticated users
  // Client component will handle redirect for authenticated users
  return (
    <>
      <AuthenticatedRedirect />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-6xl space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
              UK-Focused AI Recipe Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              What&apos;s for dinner?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate personalized recipes from ingredients you already have. Plan meals for the week. Auto-generate shopping lists. All with AI.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button size="lg" asChild className="text-lg">
                <Link href="/playground">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Try It Free - No Signup
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg">
                <Link href="/sign-up">
                  Create Account
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              ✨ Full access in playground mode • 💾 Sign up to save your work • 🇬🇧 Built for UK home cooks
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ChefHat className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Recipe Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Tell AI what ingredients you have. Get personalized recipes in seconds. UK measurements, British ingredients.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Weekly Meal Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Plan your meals for the week. Drag and drop recipes. Adjust servings. Save time and reduce decision fatigue.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Shopping Lists</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Auto-generate shopping lists from meal plans. Ingredients consolidate automatically. Organized by aisle.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold">Try the Playground</h3>
                <p className="text-muted-foreground">
                  Generate recipes, create meal plans, and explore all features without signing up. Everything works—just can&apos;t save yet.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold">Love What You See?</h3>
                <p className="text-muted-foreground">
                  When you&apos;re ready to save your recipes and meal plans permanently, create a free account in seconds.
                </p>
              </div>

              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold">Unlock Full Access</h3>
                <p className="text-muted-foreground">
                  One-off payment of £9.99-£14.99. No subscription. Unlimited recipes, saved meal plans, multi-device sync.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof / Trust Signals */}
          <div className="text-center space-y-6">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span> UK-focused (metric, British ingredients)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Dietary restrictions & allergens
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span> GDPR compliant
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span> No subscription required
              </div>
            </div>

            {/* Final CTA */}
            <div className="pt-8">
              <Button size="lg" asChild className="text-lg">
                <Link href="/playground">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Cooking Smarter Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

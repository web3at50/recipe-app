import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Unauthenticated state
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome to Recipe App
            </h1>
            <p className="text-xl text-muted-foreground">
              Your personal recipe manager and meal planner
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Sign up to get started</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create your account and start managing your recipes, planning meals, and organizing your cooking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secure authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sign in with email or Google. Your credentials are protected with enterprise-grade security.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your data, protected</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your conversations and data are private and secure. We never share your information.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated state
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Welcome back to Recipe App
          </h1>
          <p className="text-xl text-muted-foreground">
            Your account is ready
          </p>
        </div>

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Your account is set up and ready</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You&apos;re logged in as <span className="font-semibold">{user.email}</span>
            </p>
            <div className="space-y-4">
              <h3 className="font-semibold">Get Started:</h3>
              <div className="grid gap-3">
                <Button asChild className="w-full justify-start" size="lg">
                  <Link href="/recipes">📚 My Recipes - Create and manage your recipes</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start" size="lg">
                  <Link href="/generate">🤖 AI Generate - Generate recipes from ingredients</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start" size="lg">
                  <Link href="/pantry">📦 Pantry - Track your cupboard inventory</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start" size="lg">
                  <Link href="/meal-planner">📅 Meal Planner - Plan your meals for the week</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start" size="lg">
                  <Link href="/shopping-list">🛒 Shopping List - Generate and manage shopping lists</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

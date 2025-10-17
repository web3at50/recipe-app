import { Button } from "@/components/ui/button"
import Image from "next/image"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function Home() {
  // Redirect authenticated users to recipes page
  const { userId } = await auth()
  if (userId) {
    redirect('/recipes')
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center mb-6">
            <Image
              src="/logo.png"
              alt="PlateWise Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to PlateWise
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered recipe assistant. Generate personalized recipes, plan your meals, and create shopping lists — all in one place.
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <SignUpButton mode="modal">
            <Button size="lg" className="text-lg">
              Get Started
            </Button>
          </SignUpButton>

          <SignInButton mode="modal">
            <Button size="lg" variant="outline" className="text-lg">
              Sign In
            </Button>
          </SignInButton>
        </div>

        {/* Features List */}
        <div className="pt-12 space-y-4 text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✓</span>
            <span>AI-powered recipe generation</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Weekly meal planning</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Smart shopping lists</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✓</span>
            <span>Dietary restrictions & allergen tracking</span>
          </div>
        </div>
      </div>
    </div>
  )
}

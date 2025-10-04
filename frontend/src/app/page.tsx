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
              Welcome to Opensea MCP Chatbot
            </h1>
            <p className="text-xl text-muted-foreground">
              Chatbot powered by Opensea MCP
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Sign up to get started</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create your account and start querying NFT and token data with our AI-powered chatbot.
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
            Welcome back to Opensea MCP Chatbot
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
            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Customize this app for your specific needs</li>
                <li>Integrate OpenSea MCP for NFT and token data queries</li>
                <li>Build your chatbot interface</li>
                <li>Add custom features and functionality</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              This is your baseline dashboard. The authentication system is fully functional with email and Google OAuth support.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

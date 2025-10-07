import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Mail, LogOut } from "lucide-react"
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user's profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Format member since date
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A"

  // Get auth provider
  const authProvider = user.app_metadata.provider || "email"

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and view your statistics
          </p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="text-base font-semibold">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-base font-semibold">{memberSince}</p>
              </div>
            </div>

            {authProvider !== "email" && (
              <div className="flex items-start gap-4">
                <div className="h-5 w-5 mt-0.5 text-muted-foreground">🔗</div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Sign In Method</p>
                  <p className="text-base font-semibold capitalize">{authProvider}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Your Statistics</CardTitle>
            <CardDescription>
              Track your activity and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Stat 1 - Customizable per project */}
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📄</div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </div>

              {/* Stat 2 - Customizable per project */}
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✨</div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AI Queries</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {authProvider === "email" && (
              <ChangePasswordDialog />
            )}

            <form action="/auth/signout" method="post">
              <Button
                type="submit"
                variant="destructive"
                className="w-full justify-start"
                size="lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

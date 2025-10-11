import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle, Save, BookOpen, ChefHat, Calendar, ShoppingCart } from "lucide-react"
import { Toaster } from "sonner"

const navigation = [
  { name: 'AI Generate', href: '/playground', icon: ChefHat },
  { name: 'My Recipes', href: '/playground/recipes', icon: BookOpen },
  { name: 'Meal Planner', href: '/playground/meal-planner', icon: Calendar },
  { name: 'Shopping List', href: '/playground/shopping-list', icon: ShoppingCart },
];

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Warning Banner - Always Visible */}
        <div className="border-b bg-amber-50 dark:bg-amber-950/20">
          <div className="container mx-auto px-4 py-3">
            <Alert className="border-amber-200 dark:border-amber-800 bg-transparent">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-amber-900 dark:text-amber-100">
                    Playground Mode:
                  </span>
                  <span className="text-amber-700 dark:text-amber-300">
                    Your data is temporary and will be lost when you close this tab or refresh the page.
                  </span>
                </div>
                <Button size="sm" asChild variant="default">
                  <Link href="/signup">
                    <Save className="mr-2 h-4 w-4" />
                    Sign Up to Save Permanently
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Main Layout with Sidebar */}
        <div className="flex min-h-[calc(100vh-4rem)]">
          {/* Sidebar Navigation */}
          <aside className="w-64 border-r bg-muted/40 p-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* CTA in Sidebar */}
            <div className="mt-8 pt-8 border-t">
              <div className="bg-primary/5 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">Like what you see?</p>
                <p className="text-xs text-muted-foreground">
                  Sign up to save your work permanently
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/signup">
                    <Save className="mr-2 h-4 w-4" />
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </>
  )
}

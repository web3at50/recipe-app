import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ThemeToggle"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserButtonWithLinks } from "@/components/user-button-with-links"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Plate Wise",
  description: "Your personal recipe manager and meal planner",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            <header className="border-b">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-semibold">
                  Plate Wise
                </Link>
                <nav className="flex items-center gap-2">
                  <ThemeToggle />
                  <SignedIn>
                    <UserButtonWithLinks />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button size="sm">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                </nav>
              </div>
            </header>
            <main>{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "@/components/UserMenu"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ThemeToggle"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Opensea MCP Chatbot",
  description: "Chatbot to query NFT and Token data using Opensea MCP",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <header className="border-b">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <Link href="/" className="text-xl font-semibold">
                Opensea MCP Chatbot
              </Link>
              <nav className="flex items-center gap-2">
                <ThemeToggle />
                {user ? (
                  <UserMenu user={user} />
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

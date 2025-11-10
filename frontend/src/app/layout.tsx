import type { Metadata } from "next"
import { Geist, Geist_Mono, Lora, Poppins } from "next/font/google"
import "./globals.css"
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/ThemeToggle"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UserButtonWithLinks } from "@/components/user-button-with-links"
import { MobileNavWrapper } from "@/components/navigation/mobile-nav-wrapper"
import { PublicMobileNav } from "@/components/navigation/public-mobile-nav"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://platewise.xyz'),
  title: {
    default: 'PlateWise - AI Recipe Manager | Free Demo Portfolio Project',
    template: '%s | PlateWise',
  },
  description: 'UK\'s simplest AI recipe app. Enter ingredients, get 4 personalised recipes in 30 seconds. British measurements, UK allergen standards. 12 free recipe generations. Portfolio demonstration.',
  keywords: [
    'AI recipe generator UK',
    'British recipe app',
    'meal planning UK',
    'UK measurements recipes',
    'allergen tracking UK',
    'recipe manager',
    'lifetime recipe app',
    'no subscription recipe app',
  ],
  authors: [{ name: 'PlateWise' }],
  creator: 'PlateWise',
  publisher: 'PlateWise',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://platewise.xyz',
    title: 'PlateWise - AI Recipe Manager | Free Demo',
    description: 'UK\'s simplest AI recipe app. 12 free recipe generations. British measurements, UK allergens. Portfolio demonstration.',
    siteName: 'PlateWise',
    images: [
      {
        url: 'https://platewise.xyz/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'PlateWise - AI Recipe Manager for UK Cooks',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlateWise - AI Recipe Manager | Free Demo',
    description: 'Enter ingredients, get 4 personalised recipes in 30 seconds. British measurements, UK allergens. 12 free recipe generations. Portfolio demo.',
    images: ['https://platewise.xyz/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://platewise.xyz',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="h-full">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${poppins.variable} antialiased h-full flex flex-col`}
        >
          <ThemeProvider>
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
              <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                  <SignedIn>
                    <MobileNavWrapper />
                  </SignedIn>
                  <SignedOut>
                    <PublicMobileNav />
                  </SignedOut>
                  <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="relative">
                      <Image
                        src="/logo.png"
                        alt="PlateWise Logo"
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-orange-500 ring-offset-2 ring-offset-background"
                      />
                    </div>
                    <span className="text-2xl font-bold">
                      <span className="text-orange-500">P</span>late
                      <span className="text-orange-500">W</span>ise
                    </span>
                  </Link>
                  <SignedOut>
                    <nav className="hidden md:flex items-center gap-1">
                      <Link href="/recipes">
                        <Button variant="ghost" size="sm">
                          Recipes
                        </Button>
                      </Link>
                    </nav>
                  </SignedOut>
                </div>
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
            <main className="flex-1 overflow-y-auto">{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

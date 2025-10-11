'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

export default function AuthenticatedRedirect() {
  const { isSignedIn, isLoaded } = useAuth()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Use hard redirect to ensure Clerk session is fully loaded
      // This prevents hydration mismatch where header shows "Sign In" buttons
      // instead of UserButton after authentication
      window.location.href = '/recipes'
    }
  }, [isLoaded, isSignedIn])

  // Show nothing while checking/redirecting
  return null
}

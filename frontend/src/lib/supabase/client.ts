'use client'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/nextjs'

// Client-side Supabase client with Clerk auth token (2025 method)
// Uses Clerk's native Supabase integration via accessToken callback
// This is a React hook that must be used in client components
export function useSupabaseClient() {
  const { session } = useSession()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Create Supabase client with Clerk token via accessToken callback
  // The session?.getToken() automatically provides fresh Clerk tokens
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => {
      return session?.getToken() ?? null
    },
  })
}

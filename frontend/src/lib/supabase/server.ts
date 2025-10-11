import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Server-side Supabase client with Clerk auth token (2025 method)
// Uses Clerk's native Supabase integration via accessToken callback
// The Clerk session token is automatically passed to Supabase for RLS policy enforcement
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Create Supabase client with Clerk token via accessToken callback
  // This uses the new 2025 native integration (no JWT template needed)
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => {
      try {
        const authObj = await auth()
        const token = await authObj.getToken()
        return token
      } catch (error) {
        console.error('[Supabase Server] Error getting token:', error)
        return null
      }
    },
  })
}

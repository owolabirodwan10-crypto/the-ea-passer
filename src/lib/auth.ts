import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getCurrentUser() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  
  if (!accessToken) {
    return null
  }

  // Set the session on the server using the cookie
  const { data: { user }, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: cookieStore.get('sb-refresh-token')?.value || '',
  })

  if (error || !user) {
    return null
  }

  return user
}

export async function getSession() {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  
  if (!accessToken) {
    return null
  }

  const { data: { session } } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: cookieStore.get('sb-refresh-token')?.value || '',
  })

  return session
}
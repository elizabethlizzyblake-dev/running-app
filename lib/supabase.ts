import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// Use placeholder values when env vars are missing so the app can still render
// the UI (e.g. in previews where Supabase isn't connected). Auth/data calls will
// fail gracefully until real credentials are provided.
export const supabase = createBrowserClient(
  (supabaseUrl || 'http://localhost:54321').replace(/\/$/, ''),
  supabaseAnonKey || 'public-anon-key',
)

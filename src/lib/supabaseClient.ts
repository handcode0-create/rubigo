import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configuration Supabase manquante. Vérifie VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans ton fichier .env.',
  )
}

// Client unique partagé par toute l'application.
// N'utilise jamais la clé service_role ici : uniquement la clé anon (publique),
// protégée par les policies RLS définies dans supabase/schema.sql.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

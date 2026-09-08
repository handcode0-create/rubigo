import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { Role, User } from '../types'

export type SignUpMetadata = { fullName: string; phone: string }

export type AuthOutcome =
  | { ok: true; needsEmailConfirmation: boolean }
  | { ok: false; message: string }

export type ProfileRow = {
  id: string
  role: Role
  name: string
  phone: string | null
  city: string | null
  initials: string | null
  is_active: boolean
}

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

// Traduit les erreurs Supabase brutes en messages utilisateur exploitables.
// Ne jamais laisser fuiter un message Postgres/GoTrue brut vers l'UI.
function normalizeAuthError(rawMessage: string | undefined): string {
  const message = (rawMessage ?? '').toLowerCase()
  if (message.includes('invalid login credentials')) {
    return 'Adresse e-mail ou mot de passe incorrect.'
  }
  if (message.includes('already registered') || message.includes('already exists')) {
    return 'Cette adresse e-mail est déjà utilisée.'
  }
  if (message.includes('password') && (message.includes('least') || message.includes('short') || message.includes('weak'))) {
    return 'Le mot de passe est trop court (6 caractères minimum).'
  }
  if (message.includes('email') && message.includes('confirm')) {
    return 'Merci de confirmer votre adresse e-mail avant de vous connecter.'
  }
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Trop de tentatives. Merci de patienter avant de réessayer.'
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Connexion impossible. Vérifiez votre réseau.'
  }
  if (!message) return 'Une erreur est survenue. Réessayez.'
  return 'Impossible de traiter votre demande pour le moment.'
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthOutcome> {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) return { ok: false, message: normalizeAuthError(error.message) }
    return { ok: true, needsEmailConfirmation: false }
  },

  async signUp(email: string, password: string, metadata: SignUpMetadata): Promise<AuthOutcome> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: metadata.fullName, phone: metadata.phone },
      },
    })
    if (error) return { ok: false, message: normalizeAuthError(error.message) }
    // Si la confirmation email est activée sur le projet Supabase, `session` est null
    // tant que l'utilisateur n'a pas cliqué sur le lien reçu par mail.
    return { ok: true, needsEmailConfirmation: !data.session }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut()
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
    return () => subscription.unsubscribe()
  },

  // Récupère le profil lié à l'utilisateur Supabase, ou le crée s'il n'existe pas
  // encore (ex: premier login juste après confirmation de l'e-mail). Le rôle par
  // défaut est toujours "customer" — jamais choisi par le client.
  async ensureProfile(authUser: SupabaseUser): Promise<ProfileRow | null> {
    const { data: existing, error: fetchError } = await supabase
      .from('profiles')
      .select('id, role, name, phone, city, initials, is_active')
      .eq('id', authUser.id)
      .maybeSingle()

    if (fetchError) return null
    if (existing) return existing as ProfileRow

    const metadataName = (authUser.user_metadata?.full_name as string | undefined)?.trim()
    const name = metadataName || authUser.email || 'Utilisateur RUBIGO'
    const phone = (authUser.user_metadata?.phone as string | undefined) ?? null

    const { data: created, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.id,
        role: 'customer',
        name,
        phone,
        initials: computeInitials(name),
      })
      .select('id, role, name, phone, city, initials, is_active')
      .maybeSingle()

    if (insertError || !created) return null
    return created as ProfileRow
  },

  mapProfileToUser(
    profile: ProfileRow,
    email: string | undefined,
    fallbackAddresses: User['addresses'],
  ): User {
    return {
      id: profile.id,
      name: profile.name,
      phone: profile.phone ?? '',
      initials: profile.initials ?? computeInitials(profile.name),
      city: profile.city ?? '',
      email,
      role: profile.role,
      addresses: fallbackAddresses,
    }
  },
}

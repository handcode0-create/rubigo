import { useState, type ComponentType } from 'react'
import {
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  HelpCircle,
  ListOrdered,
  MapPin,
  Pencil,
  Settings2,
  User as UserIcon,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useGeocoding } from '../hooks/useGeocoding'
import type { Page } from '../types'
import './Profile.css'

type LinkTarget = Page | 'edit' | 'soon'
type Accent = 'coral' | 'lime' | 'blue' | 'gold'

type ProfileAction = {
  label: string
  description: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  accent: Accent
  target: LinkTarget
}

const actions: ProfileAction[] = [
  {
    label: 'Mes informations',
    description: 'Modifier votre nom et téléphone',
    icon: UserIcon,
    accent: 'blue',
    target: 'edit',
  },
  {
    label: 'Mes commandes',
    description: 'Suivre vos commandes en cours et passées',
    icon: ListOrdered,
    accent: 'coral',
    target: 'orders',
  },
  {
    label: 'Mes favoris',
    description: 'Retrouvez vos commerces favoris',
    icon: Heart,
    accent: 'gold',
    target: 'favorites',
  },
  {
    label: 'Moyens de paiement',
    description: 'Gérer vos moyens de paiement',
    icon: CreditCard,
    accent: 'lime',
    target: 'soon',
  },
  {
    label: 'Parrainage',
    description: 'Invitez vos proches et gagnez des avantages',
    icon: Gift,
    accent: 'coral',
    target: 'soon',
  },
  {
    label: 'Aide & Support',
    description: 'Contactez notre équipe',
    icon: HelpCircle,
    accent: 'blue',
    target: 'soon',
  },
  {
    label: 'Paramètres',
    description: 'Préférences de votre compte',
    icon: Settings2,
    accent: 'gold',
    target: 'soon',
  },
]

export function Profile({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const {
    user,
    orders,
    favoriteMerchantIds,
    addAddress,
    removeAddress,
    setDefaultAddress,
    logout,
    updateProfile,
  } = useApp()
  const { geocode, isLoading: geocoding } = useGeocoding()

  const [addressLabel, setAddressLabel] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(user.name)
  const [editPhone, setEditPhone] = useState(user.phone)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [comingSoon, setComingSoon] = useState('')

  const submitAddress = async () => {
    if (!addressLabel.trim() || !addressLine.trim()) return
    const location = await geocode(addressLine.trim())
    addAddress(addressLabel.trim(), addressLine.trim(), location ?? undefined)
    setAddressLabel('')
    setAddressLine('')
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    // Pas besoin de remettre loggingOut à false : Supabase déclenche onAuthStateChange
    // et App.tsx retourne alors sur l'écran de connexion.
  }

  const startEditing = () => {
    setEditName(user.name)
    setEditPhone(user.phone)
    setProfileError('')
    setComingSoon('')
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setProfileError('')
  }

  const saveProfile = async () => {
    if (!editName.trim()) {
      setProfileError('Le nom ne peut pas être vide.')
      return
    }
    if (!editPhone.trim()) {
      setProfileError('Le téléphone ne peut pas être vide.')
      return
    }
    setSavingProfile(true)
    setProfileError('')
    const result = await updateProfile(editName.trim(), editPhone.trim())
    setSavingProfile(false)
    if (!result.ok) {
      setProfileError(result.message ?? 'Impossible de mettre à jour votre profil pour le moment.')
      return
    }
    setEditing(false)
  }

  const handleActionClick = (target: LinkTarget, label: string) => {
    if (target === 'edit') {
      startEditing()
      return
    }
    if (target === 'soon') {
      setComingSoon(label)
      return
    }
    onNavigate(target)
  }

  const contactLine = [user.email, user.phone].filter(Boolean).join(' · ')

  return (
    <div className="page-content">
      <div className="profile-header-row">
        <div>
          <p className="eyebrow">VOTRE ESPACE</p>
          <h1>Mon profil</h1>
        </div>
        <button
          type="button"
          className="profile-edit-trigger"
          aria-label="Modifier le profil"
          onClick={startEditing}
        >
          <Pencil size={16} />
        </button>
      </div>

      <div className="profile-identity">
        <span className="profile-avatar">{user.initials}</span>

        {editing ? (
          <div className="profile-edit-form">
            <input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              placeholder="Nom complet"
              disabled={savingProfile}
            />
            <input
              value={editPhone}
              onChange={(event) => setEditPhone(event.target.value)}
              placeholder="Téléphone"
              disabled={savingProfile}
            />
            {profileError && <p className="profile-note error">{profileError}</p>}
            <div className="profile-edit-actions">
              <button onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button onClick={cancelEditing} disabled={savingProfile}>
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2>{user.name}</h2>
            {contactLine && <p className="profile-contact">{contactLine}</p>}
            {user.city && (
              <span className="profile-location-badge">
                <MapPin size={12} />
                {user.city}
              </span>
            )}
          </>
        )}
      </div>

      {!editing && (
        <div className="profile-summary-card">
          <div className="profile-summary-stat">
            <strong>{orders.length}</strong>
            <span>Commande{orders.length > 1 ? 's' : ''}</span>
          </div>
          <div className="profile-summary-divider" />
          <div className="profile-summary-stat">
            <strong>{favoriteMerchantIds.length}</strong>
            <span>Favori{favoriteMerchantIds.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      <section className="address-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MES ADRESSES</p>
            <h2>Livrer au bon endroit</h2>
          </div>
        </div>

        {(user.addresses ?? []).map((address) => (
          <div className="address-row" key={address.id}>
            <span>⌖</span>
            <div>
              <strong>{address.label}</strong>
              <p>{address.line}</p>
            </div>
            {address.isDefault ? (
              <small>Principale</small>
            ) : (
              <button onClick={() => setDefaultAddress(address.id)}>Choisir</button>
            )}
            <button aria-label={`Supprimer ${address.label}`} onClick={() => removeAddress(address.id)}>
              ×
            </button>
          </div>
        ))}

        <div className="address-form">
          <input
            value={addressLabel}
            onChange={(event) => setAddressLabel(event.target.value)}
            placeholder="Nom (Maison, Travail...)"
          />
          <input
            value={addressLine}
            onChange={(event) => setAddressLine(event.target.value)}
            placeholder="Quartier, rue, repère"
          />
          <button onClick={submitAddress} disabled={geocoding}>
            {geocoding ? 'Recherche...' : 'Ajouter une adresse'}
          </button>
        </div>
      </section>

      {comingSoon && <p className="profile-note">{comingSoon} arrive bientôt.</p>}

      <div className="profile-actions">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`profile-action-card ${action.accent}`}
            onClick={() => handleActionClick(action.target, action.label)}
          >
            <span className="action-icon">
              <action.icon size={19} strokeWidth={2} />
            </span>
            <span className="action-copy">
              <strong>{action.label}</strong>
              <small>{action.description}</small>
            </span>
            <ChevronRight size={18} className="action-chevron" />
          </button>
        ))}
      </div>

      <button className="logout-button" onClick={handleLogout} disabled={loggingOut}>
        {loggingOut ? 'Déconnexion…' : 'Déconnexion'}
      </button>
    </div>
  )
}

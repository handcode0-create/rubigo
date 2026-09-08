import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useGeocoding } from '../hooks/useGeocoding'
import type { Page } from '../types'
import './Profile.css'

type LinkTarget = Page | 'edit' | 'soon'

const links: Array<[string, string, LinkTarget]> = [
  ['Mes informations', '◯', 'edit'],
  ['Mes commandes', '◷', 'orders'],
  ['Mes favoris', '♡', 'favorites'],
  ['Moyens de paiement', '▣', 'soon'],
  ['Parrainage', '✦', 'soon'],
  ['Aide & Support', '?', 'soon'],
  ['Paramètres', '⚙', 'soon'],
]

export function Profile({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { user, addAddress, removeAddress, setDefaultAddress, logout, updateProfile } = useApp()
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

  const handleLinkClick = (target: LinkTarget) => {
    if (target === 'edit') {
      startEditing()
      return
    }
    if (target === 'soon') return
    onNavigate(target)
  }

  return (
    <div className="page-content">
      <section className="page-heading">
        <p className="eyebrow">VOTRE ESPACE</p>
        <h1>Profil</h1>
        <p>Gérez vos informations et préférences.</p>
      </section>

      <div className="profile-card">
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
            <div>
              <h2>{user.name}</h2>
              <p>{user.phone}</p>
              <span>{user.city}</span>
            </div>
            <button aria-label="Modifier le profil" onClick={startEditing}>
              ✎
            </button>
          </>
        )}
      </div>

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

      <div className="profile-links">
        {links.map(([label, icon, target]) => (
          <button
            key={label}
            onClick={() => (target === 'soon' ? setComingSoon(label) : handleLinkClick(target))}
          >
            <span>{icon}</span>
            {label}
            <b>→</b>
          </button>
        ))}
      </div>

      <button className="logout-button" onClick={handleLogout} disabled={loggingOut}>
        {loggingOut ? 'Déconnexion…' : 'Déconnexion'}
      </button>
    </div>
  )
}

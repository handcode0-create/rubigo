import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useGeocoding } from '../hooks/useGeocoding'
import type { Page } from '../types'
import './Profile.css'

const links = [['Mes informations', '◯'], ['Mes commandes', '◷'], ['Mes favoris', '♡'], ['Moyens de paiement', '▣'], ['Parrainage', '✦'], ['Aide & Support', '?'], ['Paramètres', '⚙']]

export function Profile({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { user, switchRole, addAddress, removeAddress, setDefaultAddress, logout } = useApp()
  const { geocode, isLoading: geocoding } = useGeocoding()
  const [addressLabel, setAddressLabel] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const demoRole = (role: 'merchant' | 'driver' | 'admin', page: Page) => { switchRole(role); onNavigate(page) }
  const submitAddress = async () => { if (!addressLabel.trim() || !addressLine.trim()) return; const location = await geocode(addressLine.trim()); addAddress(addressLabel.trim(), addressLine.trim(), location ?? undefined); setAddressLabel(''); setAddressLine('') }
  return <div className="page-content"><section className="page-heading"><p className="eyebrow">VOTRE ESPACE</p><h1>Profil</h1><p>Gérez vos informations et préférences.</p></section><div className="profile-card"><span className="profile-avatar">{user.initials}</span><div><h2>{user.name}</h2><p>{user.phone}</p><span>{user.city}</span></div><button aria-label="Modifier le profil">✎</button></div><section className="address-section"><div className="section-heading"><div><p className="eyebrow">MES ADRESSES</p><h2>Livrer au bon endroit</h2></div></div>{(user.addresses ?? []).map((address) => <div className="address-row" key={address.id}><span>⌖</span><div><strong>{address.label}</strong><p>{address.line}</p></div>{address.isDefault ? <small>Principale</small> : <button onClick={() => setDefaultAddress(address.id)}>Choisir</button>}<button aria-label={`Supprimer ${address.label}`} onClick={() => removeAddress(address.id)}>×</button></div>)}<div className="address-form"><input value={addressLabel} onChange={(event) => setAddressLabel(event.target.value)} placeholder="Nom (Maison, Travail...)" /><input value={addressLine} onChange={(event) => setAddressLine(event.target.value)} placeholder="Quartier, rue, repère" /><button onClick={submitAddress} disabled={geocoding}>{geocoding ? 'Recherche...' : 'Ajouter une adresse'}</button></div></section><div className="profile-links">{links.map(([label, icon]) => <button key={label} onClick={() => label === 'Mes commandes' ? onNavigate('orders') : label === 'Mes favoris' ? onNavigate('favorites') : undefined}><span>{icon}</span>{label}<b>→</b></button>)}</div><section className="role-demo"><p className="eyebrow">MODE DÉMONSTRATION</p><h2>Tester les espaces opérationnels</h2><p>Ces rôles sont simulés côté frontend pour préparer le futur backend.</p><button onClick={() => demoRole('merchant', 'merchant')}>Ouvrir espace commerçant</button><button onClick={() => demoRole('driver', 'driver')}>Ouvrir espace livreur</button><button onClick={() => demoRole('admin', 'admin')}>Ouvrir aperçu admin</button></section><button className="logout-button" onClick={logout}>Déconnexion simulée</button></div>
}

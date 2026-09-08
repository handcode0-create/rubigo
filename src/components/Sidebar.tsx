import type { ReactNode } from 'react'
import type { Page } from '../types'
import { Brand } from './Navigation'
import { useApp } from '../context/AppContext'
import {
  ArrowRightIcon,
  ExploreIcon,
  FavoritesIcon,
  HomeIcon,
  OrdersIcon,
  PinIcon,
  ProfileIcon,
} from './Icons'

type NavMenuItem = {
  id: Page
  label: string
  icon: (active: boolean) => ReactNode
}

export function Sidebar({
  page,
  onNavigate,
}: {
  page: Page
  onNavigate: (page: Page) => void
}) {
  const { activeRole, user } = useApp()

  const items: NavMenuItem[] = [
    { id: 'home', label: 'Accueil', icon: () => <HomeIcon size={18} /> },
    { id: 'explore', label: 'Explorer', icon: () => <ExploreIcon size={18} /> },
    { id: 'orders', label: 'Commandes', icon: () => <OrdersIcon size={18} /> },
    { id: 'favorites', label: 'Favoris', icon: (active) => <FavoritesIcon size={18} filled={active} /> },
    { id: 'profile', label: 'Profil', icon: () => <ProfileIcon size={18} /> },
  ]

  const isCustomer = activeRole === 'customer'
  const roleLabels = {
    customer: 'Client particulier',
    merchant: 'Commerçant',
    driver: 'Livreur',
    admin: 'Administrateur',
  }

  return (
    <aside className="sidebar">
      <Brand onClick={() => onNavigate('home')} />

      <div className="location-pill">
        <span className="pin">
          <PinIcon size={18} />
        </span>
        <span>
          <small>Vous êtes à</small>
          <strong>{user.city}</strong>
        </span>
      </div>

      <nav className="main-nav" aria-label="Navigation principale">
        {isCustomer
          ? items.map((item) => {
              const isActive = page === item.id
              return (
                <button
                  key={item.id}
                  className={isActive ? 'nav-item active' : 'nav-item'}
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-icon">{item.icon(isActive)}</span>
                  {item.label}
                </button>
              )
            })
          : null}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-card-header">
            <span className="help-dot" />
            <strong>Adzopé Direct</strong>
          </div>
          <span>Support & conciergerie locale</span>
          <a
            href="tel:+2250708091011"
            className="help-link"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Assistance</span>
            <ArrowRightIcon size={14} />
          </a>
        </div>

        <button
          className="profile-row"
          onClick={isCustomer ? () => onNavigate('profile') : undefined}
        >
          <span className="avatar">{user.initials}</span>
          <span>
            <strong>{user.name}</strong>
            <small>{roleLabels[activeRole]}</small>
          </span>
        </button>
      </div>
    </aside>
  )
}

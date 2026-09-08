import type { ReactNode } from 'react'
import type { Page } from '../types'
import {
  FavoritesIcon,
  HomeIcon,
  OrdersIcon,
  ProfileIcon,
} from './Icons'

type NavItem = {
  id: Page
  label: string
  icon: (active: boolean) => ReactNode
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: () => <HomeIcon size={22} /> },
  { id: 'favorites', label: 'Favoris', icon: (active) => <FavoritesIcon size={22} filled={active} /> },
  { id: 'orders', label: 'Commandes', icon: () => <OrdersIcon size={22} /> },
  { id: 'profile', label: 'Profil', icon: () => <ProfileIcon size={22} /> },
]

export function BottomNavigation({
  page,
  onNavigate,
  cartCount,
}: {
  page: Page
  onNavigate: (page: Page) => void
  cartCount: number
}) {
  return (
    <nav className="mobile-nav" aria-label="Navigation principale">
      {navItems.map((item) => {
        const isActive = page === item.id
        return (
          <button
            key={item.id}
            className={isActive ? 'active' : ''}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="mobile-nav-icon">
              {item.icon(isActive)}
              {item.id === 'orders' && cartCount > 0 ? <b>{cartCount}</b> : null}
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function Brand({
  onClick,
  showTagline = false,
}: {
  onClick?: () => void
  showTagline?: boolean
}) {
  return (
    <div
      className="brand-block"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="brand">
        <span className="brand-letters">
          RUBIG
          <span className="brand-o-container">
            O
            <svg
              className="brand-leaf-svg"
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="#16A34A"
            >
              <path d="M1 15C1 15 2 7 9 4C14 2 15 1 15 1C15 1 14 5 11 9C8 13 1 15 1 15Z" />
            </svg>
          </span>
        </span>
      </div>
      {showTagline && (
        <span className="brand-tagline">Tout Adzopé, plus proche de vous</span>
      )}
    </div>
  )
}

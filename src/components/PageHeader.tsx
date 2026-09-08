import type { Page } from '../types'
import { Brand } from './Navigation'
import { BellIcon, CartIcon } from './Icons'
import { useApp } from '../context/AppContext'

export function PageHeader({
  page,
  onNavigate,
  canNavigate,
  unreadCount,
  onNotifications,
}: {
  page: Page
  onNavigate: (page: Page) => void
  canNavigate: boolean
  unreadCount: number
  onNotifications: () => void
}) {
  const { cart, setIsCartOpen } = useApp()

  const labels: Partial<Record<Page, string>> = {
    home: 'Accueil',
    explore: 'Explorer Adzopé',
    orders: 'Commandes',
    favorites: 'Favoris',
    profile: 'Mon Profil',
    merchant: 'Espace Commerçant',
    driver: 'Espace Livreur',
    admin: 'Aperçu Admin',
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="topbar">
      <div
        className="mobile-brand"
        onClick={canNavigate ? () => onNavigate('home') : undefined}
      >
        <Brand />
      </div>

      <div className="breadcrumb">
        <span className="breadcrumb-brand">RUBIGO</span>
        <span className="slash">/</span>
        <strong>{labels[page] ?? 'RUBIGO'}</strong>
      </div>

      <div className="top-actions">
        {canNavigate && (
          <button
            className="icon-button header-cart-button"
            aria-label={`Panier (${cartItemCount} articles)`}
            onClick={() => setIsCartOpen(true)}
          >
            <CartIcon size={20} />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </button>
        )}

        <button
          className="icon-button notification"
          aria-label={`Notifications (${unreadCount} non lues)`}
          onClick={onNotifications}
        >
          <BellIcon size={20} />
          {unreadCount > 0 && <span>{unreadCount}</span>}
        </button>
      </div>
    </header>
  )
}

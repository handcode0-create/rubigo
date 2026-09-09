import type { Merchant, Order, Product, Service } from '../types'
import { useApp } from '../context/AppContext'
import { formatCurrency } from '../utils/formatCurrency'
import {
  ArrowRightIcon,
  ClockIcon,
  FavoritesIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
} from './Icons'

import {
  Utensils,
  ShoppingBasket,
  PackageCheck,
  ShoppingBag,
} from 'lucide-react'

const serviceIconMap = {
  FO: Utensils,
  MA: ShoppingBasket,
  EX: PackageCheck,
  SH: ShoppingBag,
} as const

// Nommage exact demandé pour l'affichage (n'écrit jamais dans les données —
// service.label reste inchangé dans data.ts, ceci ne concerne que le rendu).
const SERVICE_DISPLAY_LABEL: Record<string, string> = {
  food: 'Food',
  market: 'Marché',
  express: 'Express',
  shopper: 'Shopper',
}

export function ServiceCard({
  service,
  onSelect,
}: {
  service: Service
  onSelect: () => void
}) {
  const Icon = serviceIconMap[service.icon as keyof typeof serviceIconMap]
  const label = SERVICE_DISPLAY_LABEL[service.id] ?? service.label

  return (
    <button
      className={`service-card ${service.accent}`}
      onClick={onSelect}
      type="button"
      aria-label={label}
    >
      <span className="service-icon" aria-hidden="true">
        {Icon ? <Icon size={22} strokeWidth={2} /> : null}
      </span>

      <span className="service-label">{label}</span>
    </button>
  )
}

export function MerchantCard({
  merchant,
  onOpen,
}: {
  merchant: Merchant
  onOpen?: () => void
}) {
  const { favoriteMerchantIds, toggleFavorite } = useApp()
  const favorite = favoriteMerchantIds.includes(merchant.id)

  return (
    <article className="merchant-card" onClick={onOpen}>
      <div className={`merchant-image ${merchant.tone}`}>
        {merchant.image ? (
          <img
            src={merchant.image}
            alt={merchant.name}
            className="merchant-image-photo"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : null}

        <span className="merchant-mark">{merchant.initials}</span>

        <div className="merchant-image-overlay" />

        <span className={merchant.isOpen ? 'open-tag' : 'closed-tag'}>
          {merchant.isOpen ? 'Ouvert' : 'Fermé'}
        </span>

        <button
          type="button"
          className="favorite"
          aria-label={`${favorite ? 'Retirer' : 'Ajouter'} ${merchant.name} ${
            favorite ? 'des' : 'aux'
          } favoris`}
          onClick={(event) => {
            event.stopPropagation()
            toggleFavorite(merchant.id)
          }}
        >
          <FavoritesIcon size={16} filled={favorite} />
        </button>
      </div>

      <div className="merchant-info">
        <h3>{merchant.name}</h3>

        <p className="merchant-sub">
          {merchant.category} ·{' '}
          <span>{merchant.location?.address ?? merchant.distance}</span>
        </p>

        <div className="merchant-meta">
          <span className="merchant-rating">
            <StarIcon size={14} />
            <b>{merchant.rating}</b> ({merchant.reviewCount ?? 0})
          </span>

          <span className="merchant-time">
            <ClockIcon size={13} />
            {merchant.deliveryTime}
          </span>

          <span className="merchant-fee">
            {formatCurrency(merchant.deliveryFee)}
          </span>
        </div>
      </div>
    </article>
  )
}

export function ProductCard({
  product,
  onOpen,
}: {
  product: Product
  onOpen?: () => void
}) {
  const { addToCart, removeFromCart, cart } = useApp()

  const quantity =
    cart.find((item) => item.productId === product.id)?.quantity ?? 0

  return (
    <article
      className={`product-card ${!product.available ? 'unavailable' : ''}`}
      onClick={onOpen}
    >
      <div className="product-thumb">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-thumb-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span>
            {product.category === 'Boissons'
              ? 'BO'
              : product.category === 'Courses'
                ? 'MA'
                : 'FO'}
          </span>
        )}

        {!product.available && (
          <span className="product-unavailable-label">
            Indisponible
          </span>
        )}
      </div>

      <div className="product-copy">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <strong>{formatCurrency(product.price)}</strong>
      </div>

      {quantity > 0 ? (
        <div
          className="card-stepper"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => removeFromCart(product.id)}
            aria-label={`Diminuer la quantité de ${product.name}`}
          >
            <MinusIcon size={13} />
          </button>

          <span>{quantity}</span>

          <button
            type="button"
            onClick={() =>
              addToCart({
                productId: product.id,
                name: product.name,
                quantity: 1,
                unitPrice: product.price,
              })
            }
            aria-label={`Augmenter la quantité de ${product.name}`}
          >
            <PlusIcon size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="add-button"
          disabled={!product.available}
          aria-label={`Ajouter ${product.name}`}
          onClick={(event) => {
            event.stopPropagation()

            addToCart({
              productId: product.id,
              name: product.name,
              quantity: 1,
              unitPrice: product.price,
            })
          }}
        >
          {product.available ? <PlusIcon size={16} /> : 'Indisp.'}
        </button>
      )}
    </article>
  )
}

export function OrderCard({
  order,
  onOpen,
}: {
  order: Order
  onOpen: () => void
}) {
  const statusLabels: Record<Order['status'], string> = {
    pending: 'En attente',
    accepted: 'Acceptée',
    preparing: 'En préparation',
    ready: 'Prête',
    driver_assigned: 'Livreur assigné',
    picked_up: 'Récupérée',
    delivering: 'En livraison',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    merchant_rejected: 'Refusée',
  }

  return (
    <article className="order-card">
      <div className="order-card-top">
        <span className={`status-dot ${order.status}`} />
        <strong>{statusLabels[order.status]}</strong>
        <span className="order-id">
          #{order.orderNumber ?? order.id}
        </span>
      </div>

      <h3>{order.merchantName}</h3>

      <p>
        {order.items.reduce((sum, item) => sum + item.quantity, 0)} article(s) ·{' '}
        {order.date}
      </p>

      <div className="order-card-bottom">
        <strong>{formatCurrency(order.total)}</strong>

        <button
          type="button"
          onClick={onOpen}
          className="order-view-button"
        >
          <span>Voir la commande</span>
          <ArrowRightIcon size={14} />
        </button>
      </div>
    </article>
  )
}

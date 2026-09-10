import { useState } from 'react'

import { products } from '../data'
import { useApp } from '../context/AppContext'
import { ProductCard } from '../components/Cards'
import { AddressPicker } from '../components/maps/AddressPicker'
import { formatCurrency } from '../utils/formatCurrency'
import type { Address, Merchant, Product } from '../types'
import './Details.css'

export function MerchantDetail({
  merchant,
  onBack,
  onProduct,
}: {
  merchant: Merchant
  onBack: () => void
  onProduct: (product: Product) => void
}) {
  const merchantProducts = products.filter(
    (product) => product.merchantId === merchant.id,
  )

  return (
    <div className="page-content detail-page">
      <button className="back-button" onClick={onBack}>
        ← Explorer
      </button>

      <div className={`merchant-hero ${merchant.tone}`}>
        {merchant.image ? (
          <img
            src={merchant.image}
            alt={merchant.name}
            className="merchant-hero-image"
            loading="eager"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : null}

        <div className="merchant-hero-overlay" />

        <span className="merchant-mark">{merchant.initials}</span>

        <span className={merchant.isOpen ? 'open-tag' : 'closed-tag'}>
          {merchant.isOpen ? 'Ouvert' : 'Fermé'}
        </span>
      </div>

      <section className="merchant-detail-head">
        <div>
          <p className="eyebrow">
            {merchant.category} · {merchant.distance}
          </p>

          <h1>{merchant.name}</h1>

          <p>{merchant.description}</p>
        </div>

        <div className="detail-stats">
          <strong>★ {merchant.rating}</strong>
          <span>{merchant.reviewCount ?? 0} avis</span>
          <span>◷ {merchant.deliveryTime}</span>
          <span>{formatCurrency(merchant.deliveryFee)}</span>
        </div>
      </section>

      <div className="section-heading detail-heading">
        <div>
          <p className="eyebrow">MENU</p>
          <h2>Les incontournables</h2>
        </div>
      </div>

      <div className="product-list">
        {merchantProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpen={() => onProduct(product)}
          />
        ))}
      </div>
    </div>
  )
}

export function ProductDetail({
  product,
  onBack,
  onCheckout,
}: {
  product: Product
  onBack: () => void
  onCheckout: () => void
}) {
  const { addToCart } = useApp()
  const [quantity, setQuantity] = useState(1)

  const total = product.price * quantity

  return (
    <div className="page-content detail-page">
      <button className="back-button" onClick={onBack}>
        ← Retour au commerce
      </button>

      <div className="product-detail-visual">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-detail-image"
            loading="eager"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <span>
            {product.category === 'Boissons' ? 'BO' : 'FO'}
          </span>
        )}
      </div>

      <section className="product-detail-copy">
        <p className="eyebrow">{product.category}</p>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <strong>{formatCurrency(product.price)}</strong>
      </section>

      <div className="quantity-row">
        <span>Quantité</span>

        <div className="quantity-selector">
          <button
            onClick={() =>
              setQuantity(Math.max(1, quantity - 1))
            }
          >
            −
          </button>

          <strong>{quantity}</strong>

          <button onClick={() => setQuantity(quantity + 1)}>
            ＋
          </button>
        </div>
      </div>

      <label className="notes-field">
        Instructions particulières

        <textarea placeholder="Ex. Sans piment, s’il vous plaît." />
      </label>

      <button
        className="primary-button detail-cta"
        onClick={() => {
          addToCart({
            productId: product.id,
            name: product.name,
            quantity,
            unitPrice: product.price,
          })

          onCheckout()
        }}
      >
        Ajouter au panier · {formatCurrency(total)}
      </button>
    </div>
  )
}

export function Checkout({
  onBack,
  onDone,
}: {
  onBack: () => void
  onDone: () => void
}) {
  const {
    user,
    cartTotal,
    estimateDeliveryFee,
    placeOrder,
  } = useApp()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState('')

  const [selectedAddress, setSelectedAddress] =
    useState<Address | undefined>(
      user.addresses?.find(
        (address) => address.isDefault,
      ),
    )

  const deliveryFee = estimateDeliveryFee(selectedAddress)
  const total = cartTotal + deliveryFee

  const confirm = async () => {
    if (step < 4) {
      setStep(step + 1)
      return
    }
    if (!selectedAddress) return
    setOrderError('')
    setSubmitting(true)
    const order = await placeOrder(selectedAddress)
    setSubmitting(false)
    if (!order) {
      setOrderError("Impossible de confirmer votre commande pour le moment. Réessayez.")
      return
    }
    onDone()
  }

  return (
    <div className="page-content detail-page">
      <button className="back-button" onClick={onBack}>
        ← Retour au panier
      </button>

      <section className="page-heading">
        <p className="eyebrow">COMMANDE SÉCURISÉE</p>
        <h1>Finaliser</h1>
        <p>Une dernière vérification avant votre livraison.</p>
      </section>

      <div className="checkout-steps">
        {[
          'Adresse',
          'Livraison',
          'Paiement',
          'Confirmation',
        ].map((label, index) => (
          <span
            className={step >= index + 1 ? 'active' : ''}
            key={label}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      <AddressPicker
        addresses={user.addresses ?? []}
        selectedId={selectedAddress?.id}
        onSelect={setSelectedAddress}
      />

      <div className="checkout-card">
        <label>
          Mode de livraison

          <select defaultValue="standard">
            <option value="standard">
              Standard
            </option>

            <option value="express" disabled>
              Express · bientôt disponible
            </option>
          </select>
        </label>

        <label>
          Paiement

          <select defaultValue="delivery">
            <option value="delivery">
              Paiement à la livraison
            </option>

            <option value="mobile">
              Mobile Money · bientôt disponible
            </option>
          </select>
        </label>
      </div>

      <div className="price-summary">
        <span>
          Sous-total
          <strong>{formatCurrency(cartTotal)}</strong>
        </span>

        <span>
          Livraison
          <strong>{formatCurrency(deliveryFee)}</strong>
        </span>

        <span className="summary-total">
          Total
          <strong>{formatCurrency(total)}</strong>
        </span>
      </div>

      <button
        className="primary-button detail-cta"
        disabled={!selectedAddress || submitting}
        onClick={confirm}
      >
        {submitting ? 'Confirmation…' : step < 4 ? 'Continuer' : 'Confirmer la commande'}
      </button>

      {orderError ? (
        <p className="checkout-error" role="alert">
          {orderError}
        </p>
      ) : null}

      {!selectedAddress ? (
        <p className="checkout-error">
          Sélectionnez une adresse pour continuer.
        </p>
      ) : null}
    </div>
  )
}

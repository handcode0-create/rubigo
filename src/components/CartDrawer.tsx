import { useApp } from '../context/AppContext'
import { formatCurrency } from '../utils/formatCurrency'
import { ArrowRightIcon, CartIcon, CloseIcon, MinusIcon, PlusIcon } from './Icons'
import './CartDrawer.css'

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { cart, cartMerchant, cartTotal, cartDeliveryFee, addToCart, removeFromCart, clearCart } = useApp()

  if (!isOpen) return null

  const grandTotal = cartTotal + (cart.length ? cartDeliveryFee : 0)

  return (
    <div className="cart-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <header className="cart-drawer-header">
          <div className="cart-drawer-title-group">
            <span className="cart-drawer-icon">
              <CartIcon size={20} />
            </span>
            <div>
              <h2 id="cart-drawer-title">Votre Panier</h2>
              {cartMerchant ? (
                <p className="cart-drawer-merchant">{cartMerchant.name}</p>
              ) : (
                <p className="cart-drawer-merchant">Adzopé Livraison</p>
              )}
            </div>
          </div>
          <button className="cart-drawer-close" onClick={onClose} aria-label="Fermer le panier">
            <CloseIcon size={18} />
          </button>
        </header>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-drawer-empty">
              <span className="empty-circle">
                <CartIcon size={32} />
              </span>
              <h3>Votre panier est vide</h3>
              <p>Parcourez les spécialités locales d'Adzopé et ajoutez vos plats préférés.</p>
              <button className="button-explore" onClick={onClose}>
                Découvrir les commerces
              </button>
            </div>
          ) : (
            <ul className="cart-item-list">
              {cart.map((item) => (
                <li key={item.productId} className="cart-item-row">
                  <div className="cart-item-info">
                    <strong>{item.name}</strong>
                    <span className="cart-item-price">{formatCurrency(item.unitPrice)}</span>
                  </div>
                  <div className="cart-item-stepper">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      aria-label={`Diminuer la quantité de ${item.name}`}
                    >
                      <MinusIcon size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => addToCart({ ...item, quantity: 1 })}
                      aria-label={`Augmenter la quantité de ${item.name}`}
                    >
                      <PlusIcon size={14} />
                    </button>
                  </div>
                  <span className="cart-item-subtotal">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="cart-drawer-footer">
            <div className="cart-summary-line">
              <span>Sous-total</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
            <div className="cart-summary-line">
              <span>Livraison estimée</span>
              <strong>{formatCurrency(cartDeliveryFee)}</strong>
            </div>
            <div className="cart-summary-total">
              <span>Total à régler</span>
              <strong>{formatCurrency(grandTotal)}</strong>
            </div>

            <div className="cart-drawer-actions">
              <button
                className="cart-checkout-button"
                onClick={() => {
                  onClose()
                  onCheckout()
                }}
              >
                <span>Finaliser la commande</span>
                <span className="button-total">
                  {formatCurrency(grandTotal)} <ArrowRightIcon size={16} />
                </span>
              </button>
              <button className="cart-clear-button" onClick={clearCart}>
                Vider le panier
              </button>
            </div>
          </footer>
        )}
      </aside>
    </div>
  )
}

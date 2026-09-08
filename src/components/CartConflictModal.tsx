import { CloseIcon } from './Icons'
import './CartConflictModal.css'

type CartConflictModalProps = {
  isOpen: boolean
  existingMerchantName: string
  newMerchantName: string
  onCancel: () => void
  onConfirm: () => void
}

export function CartConflictModal({
  isOpen,
  existingMerchantName,
  newMerchantName,
  onCancel,
  onConfirm,
}: CartConflictModalProps) {
  if (!isOpen) return null

  return (
    <div className="cart-conflict-backdrop" role="dialog" aria-modal="true" aria-labelledby="cart-conflict-title">
      <div className="cart-conflict-card">
        <button className="cart-conflict-close" onClick={onCancel} aria-label="Fermer">
          <CloseIcon size={18} />
        </button>

        <div className="cart-conflict-icon">
          <span className="icon-badge">!</span>
        </div>

        <p className="cart-conflict-eyebrow">NOUVEAU COMMERCE</p>
        <h3 id="cart-conflict-title">Démarrer un nouveau panier ?</h3>
        <p className="cart-conflict-text">
          Votre panier actuel contient déjà des articles de <strong>{existingMerchantName}</strong>. 
          Pour garantir une livraison rapide et soignée à Adzopé, chaque commande est passée auprès d'un seul commerce à la fois.
        </p>

        <div className="cart-conflict-target">
          <span>Nouveau commerce sélectionné :</span>
          <strong>{newMerchantName}</strong>
        </div>

        <div className="cart-conflict-actions">
          <button className="button-cancel" onClick={onCancel}>
            Conserver mon panier
          </button>
          <button className="button-replace" onClick={onConfirm}>
            Vider et ajouter ce produit
          </button>
        </div>
      </div>
    </div>
  )
}

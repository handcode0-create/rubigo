import { useState } from 'react'
import { OrderCard } from '../components/Cards'
import { useApp } from '../context/AppContext'
import { calculateDriverEarnings } from '../utils/pricingUtils'
import { formatCurrency } from '../utils/formatCurrency'
import type { OrderStatus } from '../types'
import './RolePages.css'

const merchantId = 'merchant-002'

export function MerchantDashboard({ onReturnToCustomer }: { onReturnToCustomer: () => void }) { const { activeRole, orders, updateOrderStatus } = useApp(); const merchantOrders = orders.filter((order) => order.merchantId === merchantId); const pending = merchantOrders.filter((order) => order.status === 'pending'); const revenue = merchantOrders.filter((order) => order.status === 'delivered').reduce((total, order) => total + (order.subtotal ?? order.total), 0); const action = (orderId: string, status: OrderStatus) => updateOrderStatus(orderId, status); return <div className="page-content role-page"><section className="page-heading"><p className="eyebrow">ESPACE COMMERÇANT · MODE DÉMO</p><h1>Bonjour, Le Patio 👋</h1><p>Gérez vos commandes en quelques gestes.</p></section><div className="role-switch"><strong>Compte actif : {activeRole}</strong><button onClick={onReturnToCustomer}>Revenir au client</button></div><div className="stats-grid"><div><span>Commandes aujourd’hui</span><strong>{merchantOrders.length}</strong></div><div><span>En attente</span><strong>{pending.length}</strong></div><div><span>Chiffre d’affaires</span><strong>{formatCurrency(revenue)}</strong></div></div><section className="section-block"><div className="section-heading"><div><p className="eyebrow">COMMANDES</p><h2>À traiter maintenant</h2></div></div><div className="order-list">{merchantOrders.length ? merchantOrders.map((order) => <div key={order.id} className="workflow-card"><OrderCard order={order} onOpen={() => undefined} /><div className="workflow-actions">{order.status === 'pending' ? <><button onClick={() => action(order.id, 'accepted')}>Accepter</button><button className="danger-action" onClick={() => action(order.id, 'merchant_rejected')}>Refuser</button></> : null}{order.status === 'accepted' ? <button onClick={() => action(order.id, 'preparing')}>Commencer préparation</button> : null}{order.status === 'preparing' ? <button onClick={() => action(order.id, 'ready')}>Commande prête</button> : null}</div></div>) : <div className="empty-state"><span>✓</span><strong>Aucune commande</strong><p>Les nouvelles commandes apparaîtront ici.</p></div>}</div></section></div> }

function useDriverGuard(user: { role?: string }) {
  return user.role === 'driver'
}

export function DriverHome({ onReturnToCustomer }: { onReturnToCustomer: () => void }) {
  const { user, driverOrders, driverOrdersLoading, advanceDriverOrderStatus, confirmDelivery } = useApp()

  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [confirming, setConfirming] = useState(false)

  const assigned = driverOrders.find((order) => order.status === 'driver_assigned')
  const active = driverOrders.find((order) => ['picked_up', 'delivering'].includes(order.status))

  const handleConfirm = async () => {
    if (!active) return
    setConfirming(true)
    setPinError('')
    const result = await confirmDelivery(active.id, pin)
    setConfirming(false)
    if (!result.ok) {
      setPinError(result.message ?? 'Le code PIN est invalide.')
      return
    }
    setPin('')
  }

  if (!useDriverGuard(user)) {
    return (
      <div className="page-content role-page">
        <section className="page-heading">
          <p className="eyebrow">ESPACE LIVREUR</p>
          <h1>Accès réservé</h1>
          <p>Ce compte n'a pas le rôle livreur.</p>
        </section>
        <div className="role-switch">
          <button onClick={onReturnToCustomer}>Revenir au client</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content role-page">
      <section className="page-heading">
        <p className="eyebrow">ESPACE LIVREUR</p>
        <h1>Bonjour {user.name.split(' ')[0]} 👋</h1>
        <p>Vos courses réelles, au même endroit.</p>
      </section>

      <div className="role-switch">
        <strong>Compte livreur</strong>
        <button onClick={onReturnToCustomer}>Revenir au client</button>
      </div>

      {driverOrdersLoading ? (
        <div className="empty-state">
          <span>⌖</span>
          <strong>Chargement…</strong>
        </div>
      ) : null}

      {assigned ? (
        <section className="delivery-panel">
          <p className="eyebrow">COURSE ASSIGNÉE</p>
          <h2>{assigned.merchantName}</h2>
          <p>{assigned.deliveryAddress ?? 'Adresse non renseignée'}</p>
          <button
            className="primary-button"
            onClick={() => advanceDriverOrderStatus(assigned.id, 'picked_up')}
          >
            Commande récupérée
          </button>
        </section>
      ) : null}

      {active ? (
        <section className="delivery-panel">
          <p className="eyebrow">LIVRAISON EN COURS</p>
          <h2>{active.merchantName}</h2>
          <p>{active.deliveryAddress ?? 'Adresse non renseignée'}</p>

          {active.status === 'picked_up' ? (
            <button
              className="primary-button"
              onClick={() => advanceDriverOrderStatus(active.id, 'delivering')}
            >
              Commencer la livraison
            </button>
          ) : (
            <>
              <label>
                Demandez le code PIN au client
                <input
                  value={pin}
                  onChange={(event) => {
                    setPin(event.target.value)
                    setPinError('')
                  }}
                  placeholder="4 chiffres"
                  inputMode="numeric"
                  maxLength={4}
                />
              </label>
              {pinError ? (
                <p className="checkout-error" role="alert">
                  {pinError}
                </p>
              ) : null}
              <button
                className="primary-button"
                onClick={handleConfirm}
                disabled={confirming || pin.length !== 4}
              >
                {confirming ? 'Vérification…' : 'Confirmer la livraison'}
              </button>
            </>
          )}
        </section>
      ) : null}

      {!driverOrdersLoading && !assigned && !active ? (
        <div className="empty-state">
          <span>⌖</span>
          <strong>Aucune course en cours</strong>
          <p>Consultez l'onglet Missions pour en accepter une.</p>
        </div>
      ) : null}
    </div>
  )
}

export function DriverMissions({ onReturnToCustomer }: { onReturnToCustomer: () => void }) {
  const { user, driverOrders, availableMissions, missionsLoading, acceptMission } = useApp()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  const busy = driverOrders.some((order) =>
    ['driver_assigned', 'picked_up', 'delivering'].includes(order.status),
  )

  const handleAccept = async (orderId: string) => {
    setAcceptingId(orderId)
    await acceptMission(orderId)
    setAcceptingId(null)
  }

  if (!useDriverGuard(user)) {
    return (
      <div className="page-content role-page">
        <div className="role-switch">
          <button onClick={onReturnToCustomer}>Revenir au client</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content role-page">
      <section className="page-heading">
        <p className="eyebrow">MISSIONS</p>
        <h1>Courses disponibles</h1>
        <p>Commandes prêtes, pas encore prises par un livreur.</p>
      </section>

      {missionsLoading ? (
        <div className="empty-state">
          <span>⌖</span>
          <strong>Chargement…</strong>
        </div>
      ) : busy ? (
        <div className="empty-state">
          <span>⌖</span>
          <strong>Une course est déjà en cours</strong>
          <p>Terminez-la (onglet Accueil) avant d'en accepter une nouvelle.</p>
        </div>
      ) : availableMissions.length ? (
        <div className="order-list">
          {availableMissions.map((order) => (
            <div className="workflow-card" key={order.id}>
              <OrderCard order={order} onOpen={() => undefined} />
              <div className="workflow-actions">
                <button onClick={() => handleAccept(order.id)} disabled={acceptingId === order.id}>
                  {acceptingId === order.id
                    ? 'Acceptation…'
                    : `Accepter · ${formatCurrency(calculateDriverEarnings(order.deliveryFee ?? 0))}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>⌖</span>
          <strong>Aucune course disponible</strong>
          <p>De nouvelles courses apparaîtront ici automatiquement.</p>
        </div>
      )}
    </div>
  )
}

export function DriverHistory({ onReturnToCustomer }: { onReturnToCustomer: () => void }) {
  const { user, driverOrders, driverOrdersLoading } = useApp()
  const past = driverOrders.filter((order) => ['delivered', 'cancelled'].includes(order.status))

  if (!useDriverGuard(user)) {
    return (
      <div className="page-content role-page">
        <div className="role-switch">
          <button onClick={onReturnToCustomer}>Revenir au client</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content role-page">
      <section className="page-heading">
        <p className="eyebrow">HISTORIQUE</p>
        <h1>Vos livraisons passées</h1>
      </section>

      {driverOrdersLoading ? (
        <div className="empty-state">
          <span>⌖</span>
          <strong>Chargement…</strong>
        </div>
      ) : past.length ? (
        <div className="order-list">
          {past.map((order) => (
            <div className="workflow-card" key={order.id}>
              <OrderCard order={order} onOpen={() => undefined} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span>⌖</span>
          <strong>Aucune livraison terminée</strong>
          <p>Vos courses livrées ou annulées apparaîtront ici.</p>
        </div>
      )}
    </div>
  )
}


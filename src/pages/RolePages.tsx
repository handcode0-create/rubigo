import { useMemo, useState } from 'react'
import { OrderCard } from '../components/Cards'
import { useApp } from '../context/AppContext'
import { useUserLocation } from '../hooks/useUserLocation'
import { calculateDistanceMeters, calculateDriverEarnings } from '../utils/pricingUtils'
import { formatCurrency } from '../utils/formatCurrency'
import { merchants } from '../data'
import type { OrderStatus } from '../types'
import './RolePages.css'

export function MerchantDashboard({ onReturnToCustomer }: { onReturnToCustomer: () => void }) {
  const { user, merchantOrders, merchantOrdersLoading, updateMerchantOrderStatus } = useApp()
  const [actingId, setActingId] = useState<string | null>(null)

  const action = async (orderId: string, status: OrderStatus) => {
    setActingId(orderId)
    await updateMerchantOrderStatus(orderId, status)
    setActingId(null)
  }

  // Compte marchand pas encore relié à un commerce : le lien
  // (profiles.merchant_local_id) est assigné manuellement par un admin,
  // jamais choisi par le marchand lui-même (cf. migration 0007).
  if (!user.merchantLocalId) {
    return (
      <div className="page-content role-page">
        <section className="page-heading">
          <p className="eyebrow">ESPACE COMMERÇANT</p>
          <h1>Compte non relié à un commerce</h1>
          <p>Votre compte a le rôle marchand, mais n'est pas encore associé à un commerce RUBIGO. Contactez le support pour finaliser la mise en place.</p>
        </section>
        <div className="role-switch">
          <button onClick={onReturnToCustomer}>Revenir au client</button>
        </div>
      </div>
    )
  }

  const pending = merchantOrders.filter((order) => order.status === 'pending')
  const active = merchantOrders.filter((order) =>
    ['accepted', 'preparing', 'ready'].includes(order.status),
  )
  const withDriver = merchantOrders.filter((order) =>
    ['driver_assigned', 'picked_up', 'delivering'].includes(order.status),
  )
  const revenue = merchantOrders
    .filter((order) => order.status === 'delivered')
    .reduce((total, order) => total + (order.subtotal ?? order.total), 0)

  return (
    <div className="page-content role-page">
      <section className="page-heading">
        <p className="eyebrow">ESPACE COMMERÇANT</p>
        <h1>Bonjour, {user.name.split(' ')[0]} 👋</h1>
        <p>Gérez vos commandes en quelques gestes.</p>
      </section>

      <div className="role-switch">
        <strong>Compte marchand</strong>
        <button onClick={onReturnToCustomer}>Revenir au client</button>
      </div>

      <div className="stats-grid">
        <div><span>Commandes</span><strong>{merchantOrders.length}</strong></div>
        <div><span>En attente</span><strong>{pending.length}</strong></div>
        <div><span>Chiffre d'affaires</span><strong>{formatCurrency(revenue)}</strong></div>
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">COMMANDES</p>
            <h2>À traiter maintenant</h2>
          </div>
        </div>

        {merchantOrdersLoading ? (
          <div className="empty-state">
            <span>⌖</span>
            <strong>Chargement…</strong>
          </div>
        ) : null}

        <div className="order-list">
          {[...pending, ...active].length ? (
            [...pending, ...active].map((order) => (
              <div key={order.id} className="workflow-card">
                <OrderCard order={order} onOpen={() => undefined} />
                <div className="workflow-actions">
                  {order.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => action(order.id, 'accepted')}
                        disabled={actingId === order.id}
                      >
                        Accepter
                      </button>
                      <button
                        className="danger-action"
                        onClick={() => action(order.id, 'merchant_rejected')}
                        disabled={actingId === order.id}
                      >
                        Refuser
                      </button>
                    </>
                  ) : null}
                  {order.status === 'accepted' ? (
                    <button onClick={() => action(order.id, 'preparing')} disabled={actingId === order.id}>
                      Commencer préparation
                    </button>
                  ) : null}
                  {order.status === 'preparing' ? (
                    <button onClick={() => action(order.id, 'ready')} disabled={actingId === order.id}>
                      Commande prête
                    </button>
                  ) : null}
                  {order.status === 'ready' ? (
                    <span className="muted">En attente d'un livreur…</span>
                  ) : null}
                </div>
              </div>
            ))
          ) : !merchantOrdersLoading ? (
            <div className="empty-state">
              <span>✓</span>
              <strong>Aucune commande</strong>
              <p>Les nouvelles commandes apparaîtront ici.</p>
            </div>
          ) : null}
        </div>
      </section>

      {withDriver.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EN LIVRAISON</p>
              <h2>Prises en charge par un livreur</h2>
            </div>
          </div>
          <div className="order-list">
            {withDriver.map((order) => (
              <div key={order.id} className="workflow-card">
                <OrderCard order={order} onOpen={() => undefined} />
                <div className="workflow-actions">
                  <span className="muted">
                    Livreur : {order.driver?.name ?? 'assigné, en attente de récupération'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

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

type MissionSort = 'distance' | 'earnings' | 'recent'

export function DriverMissions({ onReturnToCustomer }: { onReturnToCustomer: () => void }) {
  const { user, driverOrders, availableMissions, missionsLoading, acceptMission } = useApp()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<MissionSort>('distance')
  const [merchantFilter, setMerchantFilter] = useState<string>('all')
  const { location: driverLocation, status: locationStatus, locate } = useUserLocation()

  const busy = driverOrders.some((order) =>
    ['driver_assigned', 'picked_up', 'delivering'].includes(order.status),
  )

  const handleAccept = async (orderId: string) => {
    setAcceptingId(orderId)
    await acceptMission(orderId)
    setAcceptingId(null)
  }

  // Distance réelle uniquement si la position du livreur a pu être obtenue
  // (Geolocation API du navigateur) — sinon on n'invente aucune distance.
  const missionsWithDistance = useMemo(
    () =>
      availableMissions.map((order) => {
        const merchant = merchants.find((entry) => entry.id === order.merchantId)
        const distanceMeters = driverLocation
          ? calculateDistanceMeters(driverLocation, merchant?.location)
          : undefined
        return { order, merchant, distanceMeters }
      }),
    [availableMissions, driverLocation],
  )

  const merchantOptions = useMemo(
    () =>
      [...new Map(missionsWithDistance.map((item) => [item.order.merchantId, item.order.merchantName])).entries()],
    [missionsWithDistance],
  )

  const visibleMissions = missionsWithDistance
    .filter((item) => merchantFilter === 'all' || item.order.merchantId === merchantFilter)
    .sort((a, b) => {
      if (sortBy === 'earnings') {
        return calculateDriverEarnings(b.order.deliveryFee ?? 0) - calculateDriverEarnings(a.order.deliveryFee ?? 0)
      }
      if (sortBy === 'recent') {
        return new Date(b.order.createdAt ?? 0).getTime() - new Date(a.order.createdAt ?? 0).getTime()
      }
      // distance : les missions sans distance connue passent en dernier,
      // jamais mélangées au hasard avec de vraies valeurs
      if (a.distanceMeters === undefined) return 1
      if (b.distanceMeters === undefined) return -1
      return a.distanceMeters - b.distanceMeters
    })

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

      {locationStatus !== 'success' ? (
        <div className="mission-location-note">
          {locationStatus === 'loading' ? (
            <span>Localisation en cours…</span>
          ) : (
            <>
              <span>
                {locationStatus === 'denied'
                  ? "Position non partagée : le tri par distance n'est pas disponible."
                  : "Position indisponible : le tri par distance n'est pas disponible."}
              </span>
              <button type="button" onClick={locate}>
                Réessayer
              </button>
            </>
          )}
        </div>
      ) : null}

      <div className="mission-filters">
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value as MissionSort)}>
          <option value="distance">Trier : plus proche</option>
          <option value="earnings">Trier : meilleure rémunération</option>
          <option value="recent">Trier : plus récent</option>
        </select>

        <select value={merchantFilter} onChange={(event) => setMerchantFilter(event.target.value)}>
          <option value="all">Tous les commerces</option>
          {merchantOptions.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

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
      ) : visibleMissions.length ? (
        <div className="order-list">
          {visibleMissions.map(({ order, distanceMeters }) => (
            <div className="workflow-card" key={order.id}>
              <OrderCard order={order} onOpen={() => undefined} />
              <div className="mission-meta">
                {distanceMeters !== undefined ? (
                  <span>{(distanceMeters / 1000).toFixed(1).replace('.', ',')} km</span>
                ) : (
                  <span className="muted">Distance indisponible</span>
                )}
                <span>{formatCurrency(calculateDriverEarnings(order.deliveryFee ?? 0))}</span>
              </div>
              <div className="workflow-actions">
                <button onClick={() => handleAccept(order.id)} disabled={acceptingId === order.id}>
                  {acceptingId === order.id ? 'Acceptation…' : 'Accepter cette course'}
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


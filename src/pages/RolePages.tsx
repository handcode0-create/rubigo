import { useMemo, useState } from 'react'
import {
  ArrowRightCircle,
  Clock3,
  MapPin,
  Package,
  ShieldCheck,
  Wallet2,
} from 'lucide-react'
import { OrderCard } from '../components/Cards'
import { useApp } from '../context/AppContext'
import { useUserLocation } from '../hooks/useUserLocation'
import { calculateDistanceMeters, calculateDriverEarnings } from '../utils/pricingUtils'
import { formatCurrency } from '../utils/formatCurrency'
import { merchants } from '../data'
import type { Order } from '../types'
import './RolePages.css'

function useDriverGuard(user: { role?: string }) {
  return user.role === 'driver'
}

function isSameDay(isoA?: string, isoB: Date = new Date()): boolean {
  if (!isoA) return false
  const a = new Date(isoA)
  if (Number.isNaN(a.getTime())) return false
  return (
    a.getFullYear() === isoB.getFullYear() &&
    a.getMonth() === isoB.getMonth() &&
    a.getDate() === isoB.getDate()
  )
}

function formatStepTime(iso?: string): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Un livreur a "traité" une course aujourd'hui si elle a été récupérée ou
// livrée aujourd'hui, ou si elle est encore active (donc forcément en
// cours aujourd'hui). Aucune donnée inventée : uniquement des horodatages
// réels déjà présents sur la commande.
function isTodayActivity(order: Order, today: Date): boolean {
  if (['driver_assigned', 'picked_up', 'delivering'].includes(order.status)) return true
  if (order.status === 'delivered' && isSameDay(order.tracking?.deliveredAt, today)) return true
  return isSameDay(order.tracking?.pickedUpAt, today)
}

function formatDelta(todayValue: number, yesterdayValue: number, unit: 'count' | 'amount'): string | null {
  if (yesterdayValue <= 0) {
    // Pas de référence hier : afficher une évolution serait inventé.
    return todayValue > 0 ? 'Nouveau aujourd’hui' : null
  }
  const diff = todayValue - yesterdayValue
  if (diff === 0) return 'Stable vs hier'
  const sign = diff > 0 ? '+' : ''
  if (unit === 'count') return `${sign}${diff} vs hier`
  const percent = Math.round((diff / yesterdayValue) * 100)
  return `${percent > 0 ? '+' : ''}${percent}% vs hier`
}

export function DriverHome({ onReturnToCustomer }: { onReturnToCustomer: () => void }) {
  const { user, driverOrders, driverOrdersLoading, availableMissions, advanceDriverOrderStatus, confirmDelivery } =
    useApp()

  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const { status: locationStatus } = useUserLocation()

  const assigned = driverOrders.find((order) => order.status === 'driver_assigned')
  const active = driverOrders.find((order) => ['picked_up', 'delivering'].includes(order.status))
  const highlighted = active ?? assigned

  const stats = useMemo(() => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    const todayOrders = driverOrders.filter((order) => isTodayActivity(order, now))
    const yesterdayOrders = driverOrders.filter(
      (order) =>
        (order.status === 'delivered' && isSameDay(order.tracking?.deliveredAt, yesterday)) ||
        isSameDay(order.tracking?.pickedUpAt, yesterday),
    )

    const todayRevenue = todayOrders
      .filter((order) => order.status === 'delivered')
      .reduce((sum, order) => sum + calculateDriverEarnings(order.deliveryFee ?? 0), 0)
    const yesterdayRevenue = yesterdayOrders
      .filter((order) => order.status === 'delivered')
      .reduce((sum, order) => sum + calculateDriverEarnings(order.deliveryFee ?? 0), 0)

    return {
      coursesToday: todayOrders.length,
      coursesDelta: formatDelta(todayOrders.length, yesterdayOrders.length, 'count'),
      revenueToday: todayRevenue,
      revenueDelta: formatDelta(todayRevenue, yesterdayRevenue, 'amount'),
    }
  }, [driverOrders])

  const merchant = highlighted ? merchants.find((entry) => entry.id === highlighted.merchantId) : undefined

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
    <div className="page-content role-page driver-home">
      <section className="page-heading">
        <p className="eyebrow">ESPACE LIVREUR</p>
        <h1>Bonjour {user.name.split(' ')[0]} 👋</h1>
        <p>Vos courses réelles, au même endroit.</p>
      </section>

      <div className="driver-hero-actions">
        <span>
          <ShieldCheck size={15} />
          Compte livreur
        </span>
        <button type="button" onClick={onReturnToCustomer}>
          <ArrowRightCircle size={15} />
          Revenir au client
        </button>
      </div>

      <div className="driver-stats-grid">
        <div className="driver-stat-card">
          <span className="driver-stat-icon">
            <Package size={17} />
          </span>
          <strong>{stats.coursesToday}</strong>
          <small>Courses du jour</small>
          {stats.coursesDelta ? <span className="driver-stat-delta">{stats.coursesDelta}</span> : null}
        </div>
        <div className="driver-stat-card">
          <span className="driver-stat-icon">
            <Wallet2 size={17} />
          </span>
          <strong>{formatCurrency(stats.revenueToday)}</strong>
          <small>Revenus du jour</small>
          {stats.revenueDelta ? <span className="driver-stat-delta">{stats.revenueDelta}</span> : null}
        </div>
        <div className="driver-stat-card">
          <span className="driver-stat-icon">
            <Clock3 size={17} />
          </span>
          <strong>{availableMissions.length}</strong>
          <small>Missions dispo.</small>
          {locationStatus === 'success' ? <span className="driver-stat-delta">À proximité</span> : null}
        </div>
      </div>

      {driverOrdersLoading ? (
        <div className="empty-state">
          <span>⌖</span>
          <strong>Chargement…</strong>
        </div>
      ) : highlighted ? (
        <section className="driver-active-section">
          <div className="section-heading">
            <h2>Course active</h2>
          </div>

          <article className="driver-order-card">
            <div className="driver-order-top">
              <div className="driver-order-merchant-image">
                {merchant?.image ? <img src={merchant.image} alt="" /> : <Package size={20} />}
              </div>
              <div className="driver-order-merchant-info">
                <strong>{highlighted.merchantName}</strong>
                <span>
                  <MapPin size={12} />
                  {highlighted.deliveryAddress ?? 'Adresse non renseignée'}
                </span>
              </div>
              {highlighted.orderNumber ? (
                <span className="driver-order-ref">#{highlighted.orderNumber}</span>
              ) : null}
            </div>

            <span className={`driver-order-status ${highlighted.status}`}>
              {highlighted.status === 'driver_assigned'
                ? 'Course assignée'
                : highlighted.status === 'picked_up'
                  ? 'Commande récupérée'
                  : 'En livraison'}
            </span>

            {highlighted.status === 'driver_assigned' ? (
              <button
                className="primary-button"
                onClick={() => advanceDriverOrderStatus(highlighted.id, 'picked_up')}
              >
                Commande récupérée
              </button>
            ) : highlighted.status === 'picked_up' ? (
              <button
                className="primary-button"
                onClick={() => advanceDriverOrderStatus(highlighted.id, 'delivering')}
              >
                Commencer la livraison
              </button>
            ) : (
              <div className="driver-pin-card">
                <div className="driver-pin-head">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>Code PIN client</strong>
                    <p>Demandez le code PIN au client pour confirmer la remise.</p>
                  </div>
                </div>
                <input
                  value={pin}
                  onChange={(event) => {
                    setPin(event.target.value.replace(/\D/g, '').slice(0, 4))
                    setPinError('')
                  }}
                  placeholder="Entrez le code PIN (4 chiffres)"
                  inputMode="numeric"
                  maxLength={4}
                />
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
              </div>
            )}
          </article>

          <div className="driver-stepper">
            <div className="section-heading">
              <h3>Prochaine étape</h3>
              <span className="driver-stepper-status">
                <span className="dot" />
                {highlighted.status === 'delivering' ? 'Livraison en cours' : 'En préparation de la course'}
              </span>
            </div>
            <div className="driver-stepper-track">
              {(
                [
                  { key: 'picked_up', label: 'Commande récupérée', time: highlighted.tracking?.pickedUpAt },
                  { key: 'delivering', label: 'En route', time: highlighted.tracking?.outForDeliveryAt },
                  { key: 'delivered', label: 'Livrée', time: highlighted.tracking?.deliveredAt },
                ] as const
              ).map((step, index, list) => {
                const order = ['driver_assigned', 'picked_up', 'delivering', 'delivered']
                const currentIndex = order.indexOf(highlighted.status)
                const stepIndex = order.indexOf(step.key)
                const done = currentIndex > stepIndex
                const current = currentIndex === stepIndex
                const time = formatStepTime(step.time)
                return (
                  <div key={step.key} className={`driver-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                    <span className="driver-step-node" />
                    <strong>{step.label}</strong>
                    <small>{time ?? (done ? 'Confirmée' : current ? 'En cours' : '—')}</small>
                    {index < list.length - 1 ? <span className={`driver-step-line ${done ? 'done' : ''}`} /> : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : (
        <div className="empty-state">
          <span>⌖</span>
          <strong>Aucune course en cours</strong>
          <p>Consultez l'onglet Missions pour en accepter une.</p>
        </div>
      )}
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


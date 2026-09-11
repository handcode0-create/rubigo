import { supabase } from '../lib/supabaseClient'
import type { Order, OrderItem, OrderStatus, OrderTracking } from '../types'

type OrderRow = {
  id: string
  order_number: string | null
  customer_id: string
  merchant_id: string | null
  merchant_local_id: string | null
  driver_id: string | null
  status: OrderStatus
  payment_status: Order['paymentStatus']
  subtotal: number
  delivery_fee: number
  discount: number
  total: number
  delivery_address_text: string | null
  delivery_confirmed: boolean
  created_at: string
  confirmed_at: string | null
  preparing_at: string | null
  ready_at: string | null
  picked_up_at: string | null
  out_for_delivery_at: string | null
  delivered_at: string | null
  estimated_delivery_at: string | null
}

type OrderItemRow = {
  order_id: string
  product_id: string | null
  name: string
  quantity: number
  unit_price: number
}

// Le PIN N'EST JAMAIS inclus dans cette liste de colonnes : il vit dans sa
// propre table (order_pins), lisible uniquement par le client propriétaire
// de la commande (voir migration 0006). Le livreur n'y a jamais accès.
const ORDER_COLUMNS =
  'id, order_number, customer_id, merchant_id, merchant_local_id, driver_id, status, payment_status, subtotal, delivery_fee, discount, total, delivery_address_text, delivery_confirmed, created_at, confirmed_at, preparing_at, ready_at, picked_up_at, out_for_delivery_at, delivered_at, estimated_delivery_at'

function mapTracking(row: OrderRow): OrderTracking {
  return {
    confirmedAt: row.confirmed_at ?? undefined,
    preparingAt: row.preparing_at ?? undefined,
    readyAt: row.ready_at ?? undefined,
    pickedUpAt: row.picked_up_at ?? undefined,
    outForDeliveryAt: row.out_for_delivery_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    estimatedDeliveryAt: row.estimated_delivery_at ?? undefined,
  }
}

function mapOrder(
  row: OrderRow,
  items: OrderItemRow[],
  merchantName: string,
  driver?: { name: string; initials: string },
  pin?: string,
): Order {
  return {
    id: row.id,
    orderNumber: row.order_number ?? undefined,
    customerId: row.customer_id,
    merchantId: row.merchant_local_id ?? row.merchant_id ?? '',
    merchantName,
    items: items
      .filter((item) => item.order_id === row.id)
      .map<OrderItem>((item) => ({
        productId: item.product_id ?? item.name,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
      })),
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    discount: row.discount,
    total: row.total,
    status: row.status,
    paymentStatus: row.payment_status,
    date: row.created_at,
    createdAt: row.created_at,
    deliveryAddress: row.delivery_address_text ?? undefined,
    driverId: row.driver_id ?? undefined,
    driver,
    deliveryPin: pin,
    deliveryConfirmed: row.delivery_confirmed,
    tracking: mapTracking(row),
  }
}

async function fetchDriverInfoByIds(driverIds: string[]) {
  const uniqueIds = [...new Set(driverIds)]
  const driverById = new Map<string, { name: string; initials: string }>()
  if (uniqueIds.length === 0) return driverById
  const { data: driverRows } = await supabase
    .from('profiles')
    .select('id, name, initials')
    .in('id', uniqueIds)
  for (const driver of driverRows ?? []) {
    driverById.set(driver.id, {
      name: driver.name,
      initials: driver.initials ?? driver.name.slice(0, 2).toUpperCase(),
    })
  }
  return driverById
}

async function fetchItemsForOrders(orderIds: string[]): Promise<OrderItemRow[]> {
  if (orderIds.length === 0) return []
  const { data } = await supabase
    .from('order_items')
    .select('order_id, product_id, name, quantity, unit_price')
    .in('order_id', orderIds)
  return (data as OrderItemRow[] | null) ?? []
}

export const orderService = {
  canTransition(from: OrderStatus, to: OrderStatus) {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['accepted', 'cancelled', 'merchant_rejected'],
      accepted: ['preparing', 'cancelled'],
      preparing: ['ready'],
      ready: ['driver_assigned'],
      driver_assigned: ['picked_up'],
      picked_up: ['delivering'],
      delivering: ['delivered'],
      delivered: [],
      cancelled: [],
      merchant_rejected: [],
    }
    return transitions[from].includes(to)
  },

  // Charge les commandes réelles du client connecté, avec leurs lignes et
  // le vrai code PIN à lui montrer (lecture autorisée par RLS uniquement
  // parce qu'il en est le propriétaire).
  async fetchOrdersForCustomer(
    customerId: string,
    merchantNameById: (merchantId: string) => string,
  ): Promise<Order[]> {
    const { data: orderRows, error: ordersError } = await supabase
      .from('orders')
      .select(ORDER_COLUMNS)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (ordersError || !orderRows || orderRows.length === 0) return []

    const orderIds = orderRows.map((row) => row.id)
    const itemRows = await fetchItemsForOrders(orderIds)
    const driverById = await fetchDriverInfoByIds(
      orderRows.map((row) => row.driver_id).filter((id): id is string => Boolean(id)),
    )

    const { data: pinRows } = await supabase
      .from('order_pins')
      .select('order_id, pin')
      .in('order_id', orderIds)
    const pinByOrderId = new Map((pinRows ?? []).map((row) => [row.order_id, row.pin as string]))

    return (orderRows as OrderRow[]).map((row) =>
      mapOrder(
        row,
        itemRows,
        merchantNameById(row.merchant_local_id ?? row.merchant_id ?? ''),
        row.driver_id ? driverById.get(row.driver_id) : undefined,
        pinByOrderId.get(row.id),
      ),
    )
  },

  // Crée une vraie commande (et ses lignes) dans Supabase. Le PIN est
  // généré automatiquement côté base par un trigger (jamais côté frontend).
  async createOrder(input: {
    customerId: string
    merchantId: string
    merchantName: string
    items: OrderItem[]
    subtotal: number
    deliveryFee: number
    total: number
    deliveryAddressText?: string
  }): Promise<Order | null> {
    const orderNumber = `RB-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: input.customerId,
        merchant_local_id: input.merchantId,
        status: 'pending',
        payment_status: 'pending',
        subtotal: input.subtotal,
        delivery_fee: input.deliveryFee,
        discount: 0,
        total: input.total,
        delivery_address_text: input.deliveryAddressText ?? null,
      })
      .select(ORDER_COLUMNS)
      .maybeSingle()

    if (orderError || !orderRow) return null

    const itemsPayload = input.items.map((item) => ({
      order_id: orderRow.id,
      // product_id référence public.products(id) en UUID Supabase. Les
      // produits ne sont pas encore migrés (data.ts local) : leurs IDs ne
      // sont pas des UUID valides côté Supabase, donc on ne les envoie pas
      // (colonne nullable, on garde uniquement le snapshot name/quantity/prix).
      product_id: null,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }))

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsPayload)
      .select('order_id, product_id, name, quantity, unit_price')

    if (itemsError) return null

    const { data: pinRow } = await supabase
      .from('order_pins')
      .select('pin')
      .eq('order_id', orderRow.id)
      .maybeSingle()

    return mapOrder(
      orderRow as OrderRow,
      (insertedItems as OrderItemRow[] | null) ?? [],
      input.merchantName,
      undefined,
      pinRow?.pin,
    )
  },

  // Annule une commande à la demande du client. La policy RLS
  // "orders customer cancel" refuse déjà toute annulation hors des statuts
  // pending/accepted côté base — canTransition fait le même contrôle côté
  // UI pour ne proposer le bouton que quand c'est pertinent.
  // IMPORTANT : Supabase ne renvoie PAS d'erreur quand une policy RLS
  // bloque silencieusement une UPDATE (0 ligne affectée, pas d'exception).
  // On vérifie donc explicitement qu'une ligne a bien été modifiée via
  // .select().maybeSingle() plutôt que de se fier seulement à `error`.
  async cancelOrder(orderId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('id')
      .maybeSingle()

    return !error && !!data
  },

  subscribeToCustomerOrders(customerId: string, onChange: () => void): () => void {
    const channel = supabase
      .channel(`orders:customer:${customerId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${customerId}` },
        () => onChange(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  // ------------------------------------------------------------------
  // CÔTÉ COMMERÇANT
  // ------------------------------------------------------------------

  // Commandes réelles du commerce du marchand connecté (via profiles.merchant_local_id,
  // cf. migration 0007). Aucun filtrage ici : c'est la policy RLS "orders
  // merchant local read" qui garantit qu'un marchand ne voit que SES commandes.
  async fetchOrdersForMerchant(
    merchantLocalId: string,
    merchantName: string,
  ): Promise<Order[]> {
    const { data: orderRows, error } = await supabase
      .from('orders')
      .select(ORDER_COLUMNS)
      .eq('merchant_local_id', merchantLocalId)
      .order('created_at', { ascending: false })

    if (error || !orderRows || orderRows.length === 0) return []

    const itemRows = await fetchItemsForOrders(orderRows.map((row) => row.id))
    const driverById = await fetchDriverInfoByIds(
      orderRows.map((row) => row.driver_id).filter((id): id is string => Boolean(id)),
    )
    // Le marchand ne voit jamais le PIN client : aucune lecture de order_pins ici.
    return (orderRows as OrderRow[]).map((row) =>
      mapOrder(row, itemRows, merchantName, row.driver_id ? driverById.get(row.driver_id) : undefined),
    )
  },

  // Transitions marchand (pending -> accepted/merchant_rejected -> preparing -> ready).
  // Réutilise advanceOrderStatus : la policy RLS "orders merchant local update"
  // (migration 0007) est la seule vraie barrière — elle refuse déjà toute
  // tentative de sortir de ce périmètre (ex. passer à 'driver_assigned').
  async updateOrderStatusAsMerchant(orderId: string, status: OrderStatus): Promise<boolean> {
    return this.advanceOrderStatus(orderId, status)
  },

  subscribeToMerchantOrders(merchantLocalId: string, onChange: () => void): () => void {
    const channel = supabase
      .channel(`orders:merchant:${merchantLocalId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `merchant_local_id=eq.${merchantLocalId}` },
        () => onChange(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  // ------------------------------------------------------------------
  // CÔTÉ LIVREUR
  // ------------------------------------------------------------------

  // Commandes réellement assignées au livreur connecté (peu importe le
  // client). Nécessite la policy "orders participants read" déjà en place.
  async fetchOrdersForDriver(
    driverId: string,
    merchantNameById: (merchantId: string) => string,
  ): Promise<Order[]> {
    const { data: orderRows, error } = await supabase
      .from('orders')
      .select(ORDER_COLUMNS)
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false })

    if (error || !orderRows || orderRows.length === 0) return []

    const itemRows = await fetchItemsForOrders(orderRows.map((row) => row.id))
    // Le livreur ne voit jamais le PIN : aucune lecture de order_pins ici.
    return (orderRows as OrderRow[]).map((row) =>
      mapOrder(row, itemRows, merchantNameById(row.merchant_local_id ?? row.merchant_id ?? '')),
    )
  },

  // Missions disponibles : commandes prêtes, sans livreur assigné. Visible
  // uniquement par un profil role='driver' (policy "orders visible as
  // available mission").
  async fetchAvailableMissions(merchantNameById: (merchantId: string) => string): Promise<Order[]> {
    const { data: orderRows, error } = await supabase
      .from('orders')
      .select(ORDER_COLUMNS)
      .eq('status', 'ready')
      .is('driver_id', null)
      .order('created_at', { ascending: true })

    if (error || !orderRows || orderRows.length === 0) return []

    const itemRows = await fetchItemsForOrders(orderRows.map((row) => row.id))
    return (orderRows as OrderRow[]).map((row) =>
      mapOrder(row, itemRows, merchantNameById(row.merchant_local_id ?? row.merchant_id ?? '')),
    )
  },

  // Acceptation atomique d'une mission (RPC SECURITY DEFINER : verrouille
  // la ligne pour empêcher deux livreurs d'accepter la même commande).
  async acceptMission(orderId: string): Promise<{ ok: boolean; error?: string }> {
    const { data, error } = await supabase.rpc('accept_delivery_mission', { p_order_id: orderId })
    if (error) return { ok: false, error: error.message }
    return data as { ok: boolean; error?: string }
  },

  // Transitions "normales" (pas de PIN requis) : récupéré, en livraison...
  // Autorisées par la policy RLS "orders participants update", qui bloque
  // explicitement toute tentative de passer directement à 'delivered'.
  // Même vigilance que cancelOrder : on vérifie qu'une ligne a réellement
  // été modifiée, pas seulement l'absence d'erreur.
  async advanceOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    const timestampColumn: Partial<Record<OrderStatus, string>> = {
      accepted: 'confirmed_at',
      preparing: 'preparing_at',
      ready: 'ready_at',
      picked_up: 'picked_up_at',
      delivering: 'out_for_delivery_at',
    }
    const column = timestampColumn[status]
    const { data, error } = await supabase
      .from('orders')
      .update({ status, ...(column ? { [column]: new Date().toISOString() } : {}) })
      .eq('id', orderId)
      .select('id')
      .maybeSingle()

    return !error && !!data
  },

  // Confirmation de livraison par PIN — jamais un simple update de statut.
  // Toute la vérification (livreur autorisé, statut, PIN, tentatives) se
  // fait dans confirm_delivery() côté base, de façon atomique.
  async confirmDeliveryWithPin(
    orderId: string,
    pin: string,
  ): Promise<{ ok: boolean; error?: string; attempts_left?: number }> {
    const { data, error } = await supabase.rpc('confirm_delivery', {
      p_order_id: orderId,
      p_pin: pin,
    })
    if (error) return { ok: false, error: error.message }
    return data as { ok: boolean; error?: string; attempts_left?: number }
  },

  subscribeToDriverOrders(driverId: string, onChange: () => void): () => void {
    const channel = supabase
      .channel(`orders:driver:${driverId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `driver_id=eq.${driverId}` },
        () => onChange(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  subscribeToAvailableMissions(onChange: () => void): () => void {
    const channel = supabase
      .channel('orders:missions:available')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => onChange(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}

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
  delivery_pin: string | null
  delivery_address_text: string | null
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

const ORDER_COLUMNS =
  'id, order_number, customer_id, merchant_id, merchant_local_id, driver_id, status, payment_status, subtotal, delivery_fee, discount, total, delivery_pin, delivery_address_text, created_at, confirmed_at, preparing_at, ready_at, picked_up_at, out_for_delivery_at, delivered_at, estimated_delivery_at'

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
    // `date` reste pour compatibilité d'affichage historique, mais la vraie
    // source de vérité est désormais `createdAt` (horodatage réel Supabase).
    date: row.created_at,
    createdAt: row.created_at,
    deliveryAddress: row.delivery_address_text ?? undefined,
    driverId: row.driver_id ?? undefined,
    driver,
    deliveryPin: row.delivery_pin ?? undefined,
    tracking: mapTracking(row),
  }
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

  // Charge les commandes réelles du client connecté, avec leurs lignes.
  // merchantNameById permet de rattacher le nom du commerce (encore local,
  // les commerces ne sont pas migrés vers Supabase à ce stade).
  async fetchOrdersForCustomer(
    customerId: string,
    merchantNameById: (merchantId: string) => string,
  ): Promise<Order[]> {
    const { data: orderRows, error: ordersError } = await supabase
      .from('orders')
      .select(ORDER_COLUMNS)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (ordersError || !orderRows) return []
    if (orderRows.length === 0) return []

    const orderIds = orderRows.map((row) => row.id)
    const { data: itemRows } = await supabase
      .from('order_items')
      .select('order_id, product_id, name, quantity, unit_price')
      .in('order_id', orderIds)

    const driverIds = [...new Set(orderRows.map((row) => row.driver_id).filter((id): id is string => Boolean(id)))]
    const driverById = new Map<string, { name: string; initials: string }>()
    if (driverIds.length > 0) {
      const { data: driverRows } = await supabase
        .from('profiles')
        .select('id, name, initials')
        .in('id', driverIds)
      for (const driver of driverRows ?? []) {
        driverById.set(driver.id, {
          name: driver.name,
          initials: driver.initials ?? driver.name.slice(0, 2).toUpperCase(),
        })
      }
    }

    return (orderRows as OrderRow[]).map((row) =>
      mapOrder(
        row,
        (itemRows as OrderItemRow[] | null) ?? [],
        merchantNameById(row.merchant_local_id ?? row.merchant_id ?? ''),
        row.driver_id ? driverById.get(row.driver_id) : undefined,
      ),
    )
  },

  // Crée une vraie commande (et ses lignes) dans Supabase. Retourne la
  // commande créée mappée au format client, ou null en cas d'échec.
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
    const deliveryPin = String(Math.floor(1000 + Math.random() * 9000))

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
        delivery_pin: deliveryPin,
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

    return mapOrder(orderRow as OrderRow, (insertedItems as OrderItemRow[] | null) ?? [], input.merchantName)
  },

  // Écoute en temps réel les commandes du client (nouvelle commande, ou
  // changement de statut fait par un commerçant/livreur). Retourne une
  // fonction de désabonnement à appeler au démontage du composant.
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
}

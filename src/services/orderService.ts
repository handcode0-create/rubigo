import type { OrderStatus } from '../types'

export const orderService = {
  canTransition(from: OrderStatus, to: OrderStatus) { const transitions: Record<OrderStatus, OrderStatus[]> = { pending: ['accepted', 'cancelled', 'merchant_rejected'], accepted: ['preparing', 'cancelled'], preparing: ['ready'], ready: ['driver_assigned'], driver_assigned: ['picked_up'], picked_up: ['delivering'], delivering: ['delivered'], delivered: [], cancelled: [], merchant_rejected: [] }; return transitions[from].includes(to) },
}

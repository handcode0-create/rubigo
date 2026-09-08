import type { Location, Merchant, OrderItem } from '../types'

export function calculateSubtotal(items: OrderItem[]) { return items.reduce((total, item) => total + item.unitPrice * item.quantity, 0) }
export function calculateDeliveryFee(distanceMeters: number): number
export function calculateDeliveryFee(items: OrderItem[], merchant?: Merchant): number
export function calculateDeliveryFee(value: number | OrderItem[], merchant?: Merchant) { if (typeof value === 'number') { if (value <= 2000) return 500; if (value <= 5000) return 750; if (value <= 8000) return 1000; return 1500 } return value.length ? merchant?.deliveryFee ?? 0 : 0 }
export function calculateDiscount() { return 0 }
export function calculateCommission(amount: number, rate = 0.1) { return Math.round(amount * rate) }
export function calculateDriverEarnings(deliveryFee: number, share = 0.7) { return Math.round(deliveryFee * share) }
export function calculateTotal(subtotal: number, deliveryFee: number, discount = 0) { return Math.max(0, subtotal + deliveryFee - discount) }
export function calculateDistanceMeters(origin?: Location, destination?: Location) { if (!origin || !destination) return undefined; const earthRadius = 6371000; const latitudeDelta = (destination.latitude - origin.latitude) * Math.PI / 180; const longitudeDelta = (destination.longitude - origin.longitude) * Math.PI / 180; const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(origin.latitude * Math.PI / 180) * Math.cos(destination.latitude * Math.PI / 180) * Math.sin(longitudeDelta / 2) ** 2; return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))) }

export type Role = 'customer' | 'merchant' | 'driver' | 'admin'
export type Location = { latitude: number; longitude: number; address?: string; placeId?: string; city?: string; district?: string; country?: string }
export type Page = 'home' | 'explore' | 'orders' | 'favorites' | 'profile' | 'merchant' | 'driver' | 'driver-missions' | 'driver-history' | 'admin'
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'driver_assigned' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled' | 'merchant_rejected'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type DriverStatus = 'offline' | 'available' | 'busy'
export type MerchantStatus = 'open' | 'closed' | 'temporarily_closed'

export type Service = { id: string; icon: string; label: string; description: string; accent: 'coral' | 'lime' | 'blue' | 'gold' }
export type CategoryId = string
export type Category = { id: CategoryId; label: string; icon: string }
export type Product = { id: string; merchantId: string; categoryId: CategoryId; name: string; description: string; price: number; category: string; available: boolean; image?: string }
export type Merchant = { id: string; name: string; description?: string; categoryId: CategoryId; category: string; rating: number; reviewCount?: number; deliveryTime: string; deliveryFee: number; distance: string; isOpen: boolean; status?: MerchantStatus; commissionRate?: number; location?: Location; initials: string; tone: 'sunset' | 'forest' | 'sky'; image?: string }
export type OrderItem = { productId: string; name: string; quantity: number; unitPrice: number }
export type Address = { id: string; label: string; line: string; isDefault: boolean; location?: Location }
export type Driver = { id: string; name: string; initials: string; status: DriverStatus; phone: string; earnings: number; currentLocation?: Location }
export type Payment = { method: 'cash' | 'mobile_money'; status: PaymentStatus }
export type Notification = { id: string; userId: string; orderId?: string; message: string; read: boolean; createdAt: string }
export type OrderTracking = {
  confirmedAt?: string
  preparingAt?: string
  readyAt?: string
  pickedUpAt?: string
  outForDeliveryAt?: string
  deliveredAt?: string
  estimatedDeliveryAt?: string
}
export type Order = { id: string; orderNumber?: string; customerId?: string; merchantId: string; merchantName: string; items: OrderItem[]; subtotal?: number; deliveryFee?: number; discount?: number; total: number; status: OrderStatus; paymentStatus?: PaymentStatus; date: string; createdAt?: string; deliveryAddress?: string; pickupLocation?: Location; deliveryLocation?: Location; distanceMeters?: number; estimatedDurationSeconds?: number; driverId?: string; driver?: { name: string; initials: string; eta?: string; currentLocation?: Location }; deliveryPin?: string; deliveryConfirmed?: boolean; tracking?: OrderTracking }
export type User = { id?: string; name: string; phone: string; initials: string; city: string; email?: string; role?: Role; addresses?: Address[]; payment?: Payment }

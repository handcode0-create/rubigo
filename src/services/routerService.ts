import type { Page } from '../types'

export type RouteState = {
  page: Page
  merchantId?: string
  productId?: string
  checkout?: boolean
}

type RouteListener = (state: RouteState) => void

const listeners: Set<RouteListener> = new Set()

export function parseHash(hash: string): RouteState {
  const clean = hash.replace(/^#\/?/, '').trim()
  if (!clean) return { page: 'home' }

  const parts = clean.split('/')
  const root = parts[0]

  if (root === 'merchant' && parts[1]) {
    return { page: 'explore', merchantId: parts[1] }
  }

  if (root === 'product' && parts[1]) {
    return { page: 'explore', productId: parts[1] }
  }

  if (root === 'checkout') {
    return { page: 'orders', checkout: true }
  }

  const validPages: readonly string[] = ['home', 'explore', 'orders', 'favorites', 'profile', 'merchant', 'driver', 'admin']
  if (validPages.includes(root)) {
    return { page: root as Page }
  }

  return { page: 'home' }
}

export function formatHash(state: RouteState): string {
  if (state.checkout) return '#/checkout'
  if (state.productId) return `#/product/${state.productId}`
  if (state.merchantId) return `#/merchant/${state.merchantId}`
  return `#/${state.page}`
}

export const routerService = {
  getCurrentState(): RouteState {
    if (typeof window === 'undefined') return { page: 'home' }
    return parseHash(window.location.hash)
  },

  navigate(state: RouteState | Page, replace = false) {
    const routeState: RouteState = typeof state === 'string' ? { page: state } : state
    const targetHash = formatHash(routeState)

    if (replace) {
      const url = new URL(window.location.href)
      url.hash = targetHash
      window.history.replaceState(null, '', url.toString())
    } else {
      window.location.hash = targetHash
    }

    listeners.forEach((listener) => listener(routeState))
  },

  back() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      this.navigate({ page: 'home' })
    }
  },

  subscribe(listener: RouteListener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

import { merchants, products } from '../data'

export const merchantService = {
  async getMerchants() { return merchants },
  async getProducts(merchantId?: string) { return merchantId ? products.filter((product) => product.merchantId === merchantId) : products },
}

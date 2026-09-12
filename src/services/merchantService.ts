import { supabase } from '../lib/supabaseClient'
import { merchants as localMerchants, products as localProducts } from '../data'
import type { Product } from '../types'

type ProductRow = {
  id: string
  merchant_local_id: string | null
  category: string | null
  name: string
  description: string | null
  price: number
  available: boolean
  image_path: string | null
}

const PRODUCT_COLUMNS =
  'id, merchant_local_id, category, name, description, price, available, image_path'

const IMAGE_BUCKET = 'product-images'

function publicImageUrl(imagePath: string | null): string | undefined {
  if (!imagePath) return undefined
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(imagePath).data.publicUrl
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    merchantId: row.merchant_local_id ?? '',
    categoryId: 'restaurants',
    category: row.category ?? '',
    name: row.name,
    description: row.description ?? '',
    price: row.price,
    available: row.available,
    image: publicImageUrl(row.image_path),
  }
}

export const merchantService = {
  // Compatibilité avec l'usage historique (catalogue client, encore basé
  // sur data.ts pour l'instant — non concerné par cette migration).
  async getMerchants() {
    return localMerchants
  },
  async getProducts(merchantId?: string) {
    return merchantId ? localProducts.filter((product) => product.merchantId === merchantId) : localProducts
  },

  // ------------------------------------------------------------------
  // CATALOGUE COMMERÇANT — réel, persisté dans Supabase
  // ------------------------------------------------------------------
  async fetchMerchantProducts(merchantLocalId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('merchant_local_id', merchantLocalId)
      .order('created_at', { ascending: false })

    if (error || !data) return []
    return (data as ProductRow[]).map(mapProduct)
  },

  async createMerchantProduct(
    merchantLocalId: string,
    input: { name: string; description: string; price: number; category: string; available: boolean },
  ): Promise<{ product?: Product; error?: string }> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        merchant_local_id: merchantLocalId,
        name: input.name,
        description: input.description || null,
        price: input.price,
        category: input.category || null,
        available: input.available,
      })
      .select(PRODUCT_COLUMNS)
      .maybeSingle()

    if (error || !data) return { error: "Impossible d'ajouter le produit." }
    return { product: mapProduct(data as ProductRow) }
  },

  async updateMerchantProduct(
    productId: string,
    updates: Partial<{ name: string; description: string; price: number; category: string; available: boolean }>,
  ): Promise<{ product?: Product; error?: string }> {
    const payload: Record<string, unknown> = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.description !== undefined) payload.description = updates.description || null
    if (updates.price !== undefined) payload.price = updates.price
    if (updates.category !== undefined) payload.category = updates.category || null
    if (updates.available !== undefined) payload.available = updates.available

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', productId)
      .select(PRODUCT_COLUMNS)
      .maybeSingle()

    if (error || !data) return { error: 'Impossible de modifier le produit.' }
    return { product: mapProduct(data as ProductRow) }
  },

  async toggleMerchantProductAvailability(
    productId: string,
    available: boolean,
  ): Promise<{ product?: Product; error?: string }> {
    return merchantService.updateMerchantProduct(productId, { available })
  },

  async deleteMerchantProduct(productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .select('id')
      .maybeSingle()

    return !error && !!data
  },

  // ------------------------------------------------------------------
  // IMAGES — Supabase Storage (bucket "product-images", public en lecture)
  // ------------------------------------------------------------------
  async uploadMerchantProductImage(
    merchantLocalId: string,
    productId: string,
    file: File,
  ): Promise<{ imagePath?: string; imageUrl?: string; error?: string }> {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${merchantLocalId}/${productId}-${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) return { error: "Impossible d'envoyer l'image." }

    const { data, error } = await supabase
      .from('products')
      .update({ image_path: path })
      .eq('id', productId)
      .select('image_path')
      .maybeSingle()

    if (error || !data) return { error: "Image envoyée mais impossible de l'associer au produit." }

    return { imagePath: path, imageUrl: publicImageUrl(path) }
  },

  async deleteMerchantProductImage(productId: string, imagePath: string): Promise<boolean> {
    const { error: removeError } = await supabase.storage.from(IMAGE_BUCKET).remove([imagePath])
    if (removeError) return false

    const { data, error } = await supabase
      .from('products')
      .update({ image_path: null })
      .eq('id', productId)
      .select('id')
      .maybeSingle()

    return !error && !!data
  },
}

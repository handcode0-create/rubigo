import { categories, merchants, products, services } from '../data'
import { useApp } from '../context/AppContext'
import { MerchantCard, OrderCard, ProductCard, ServiceCard } from '../components/Cards'
import { ArrowRightIcon, CartIcon, MotoIcon, SearchIcon, ShieldCheckIcon, SparklesIcon, StoreIcon } from '../components/Icons'
import { HeroCarousel, type HeroSlide } from '../components/HeroCarousel'
import type { Merchant, Page, Product } from '../types'
import { formatCurrency } from '../utils/formatCurrency'

const HERO_BADGES = ['COUP DE CŒUR', 'NOUVEAU CE MOIS-CI', 'TENDANCE À ADZOPÉ', 'À DÉCOUVRIR', 'PROMO DU JOUR']

export function Home({
  onNavigate,
  onMerchant,
  onProduct,
}: {
  onNavigate: (page: Page) => void
  onMerchant: (merchant: Merchant) => void
  onProduct: (product: Product) => void
}) {
  const { user, orders, cart, cartTotal, setIsCartOpen } = useApp()
  const activeOrder = orders.find((order) => !['delivered', 'cancelled'].includes(order.status))

  const heroSlides: HeroSlide[] = merchants
    .filter((merchant) => merchant.image && merchant.isOpen)
    .slice(0, 5)
    .map((merchant, index) => ({
      id: merchant.id,
      badge: HERO_BADGES[index % HERO_BADGES.length],
      title: merchant.name,
      subtitle:
        merchant.description ??
        `${merchant.category} à Adzopé · livraison en ${merchant.deliveryTime}.`,
      image: merchant.image as string,
      ctaLabel: 'Commander maintenant',
      meta: `${merchant.rating.toFixed(1)} · ${merchant.deliveryTime}`,
      onSelect: () => onMerchant(merchant),
    }))

  return (
    <div className="page-content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">RÉGION DE LA MÉ · ADZOPÉ</p>
          <h1>
            Bonjour {user.name.split(' ')[0]} <span className="sparkle-accent"><SparklesIcon size={18} /></span>
          </h1>
          <p className="welcome-copy">Qu’est-ce qu’on vous livre aujourd’hui à Adzopé ?</p>
        </div>
        {cart.length > 0 && (
          <button className="quick-order" onClick={() => setIsCartOpen(true)}>
            <CartIcon size={16} />
            <span>Panier · {formatCurrency(cartTotal)}</span>
          </button>
        )}
      </section>

      <div className="search-bar" onClick={() => onNavigate('explore')}>
        <span className="search-icon-wrap">
          <SearchIcon size={18} />
        </span>
        <span>Rechercher un plat, un maquis ou une épicerie...</span>
        <span className="search-action-hint">Adzopé</span>
      </div>

      {heroSlides.length > 0 && <HeroCarousel slides={heroSlides} />}

      <div className="trust-strip">
        <div className="trust-step">
          <span className="trust-icon"><StoreIcon size={16} /></span>
          <div className="trust-text">
            <strong>Préparation</strong>
            <small>Chez le commerçant</small>
          </div>
        </div>
        <div className="trust-step">
          <span className="trust-icon active"><MotoIcon size={16} /></span>
          <div className="trust-text">
            <strong>En route</strong>
            <small>Livreur d'Adzopé</small>
          </div>
        </div>
        <div className="trust-step">
          <span className="trust-icon"><ShieldCheckIcon size={16} /></span>
          <div className="trust-text">
            <strong>Sécurité PIN</strong>
            <small>Remise en main propre</small>
          </div>
        </div>
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">AU CHOIX</p>
            <h2>Catégories populaires</h2>
          </div>
          <button className="text-button" onClick={() => onNavigate('explore')}>
            <span>Tout voir</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
        <div className="category-scroll">
          {categories.slice(0, 10).map((category) => (
            <button
              key={category.id}
              className="category-chip"
              onClick={() => onNavigate('explore')}
            >
              <span className="category-chip-icon">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">UNIVERS RUBIGO</p>
            <h2>Comment peut-on vous aider ?</h2>
          </div>
          <button className="text-button" onClick={() => onNavigate('explore')}>
            <span>Tout voir</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={() => onNavigate('explore')}
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ADRESSES POPULAIRES</p>
            <h2>Les commerces du moment</h2>
          </div>
          <button className="text-button" onClick={() => onNavigate('explore')}>
            <span>Explorer la carte</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
        <div className="merchant-grid">
          {merchants.slice(0, 3).map((merchant) => (
            <MerchantCard
              key={merchant.id}
              merchant={merchant}
              onOpen={() => onMerchant(merchant)}
            />
          ))}
        </div>
      </section>

      <section className="section-block home-popular">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SPÉCIALITÉS LOCALES</p>
            <h2>À déguster aujourd’hui</h2>
          </div>
        </div>
        <div className="product-list">
          {products.slice(0, 2).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpen={() => onProduct(product)}
            />
          ))}
        </div>
      </section>

      {activeOrder && (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LIVRAISON EN COURS</p>
              <h2>Votre commande #{activeOrder.orderNumber ?? activeOrder.id}</h2>
            </div>
            <button className="text-button" onClick={() => onNavigate('orders')}>
              <span>Suivre</span>
              <ArrowRightIcon size={14} />
            </button>
          </div>
          <OrderCard order={activeOrder} onOpen={() => onNavigate('orders')} />
        </section>
      )}
    </div>
  )
}

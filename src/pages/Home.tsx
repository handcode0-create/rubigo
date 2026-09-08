import { merchants, products, services } from '../data'
import { useApp } from '../context/AppContext'
import { MerchantCard, OrderCard, ProductCard, ServiceCard } from '../components/Cards'
import { ArrowRightIcon, CartIcon, MotoIcon, SearchIcon, ShieldCheckIcon, SparklesIcon, StoreIcon } from '../components/Icons'
import { HeroDishIllustration } from '../components/HeroDishIllustration'
import type { Merchant, Page, Product } from '../types'
import { formatCurrency } from '../utils/formatCurrency'

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

      <section className="hero-banner">
        <div className="hero-image-layer" aria-hidden="true">
          <HeroDishIllustration />
        </div>
        <div className="hero-overlay" aria-hidden="true" />

        <div className="hero-copy">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>CIRCUIT COURT & PROXIMITÉ</span>
          </div>
          <h2>
            La cuisine locale et vos courses,<br />
            <em>livrées à votre porte.</em>
          </h2>
          <p>
            Des maquis réputés aux étals du marché central, RUBIGO soutient les artisans locaux 
            avec une livraison sécurisée par code PIN.
          </p>
          <div className="hero-cta-group">
            <button className="hero-primary-btn" onClick={() => onNavigate('explore')}>
              <span>Découvrir les commerces</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>

        <div className="hero-flow-banner">
          <div className="flow-step">
            <span className="flow-icon"><StoreIcon size={18} /></span>
            <div className="flow-text">
              <strong>1. Préparation</strong>
              <small>Chez le commerçant</small>
            </div>
          </div>
          <span className="flow-separator"><ArrowRightIcon size={14} /></span>
          <div className="flow-step">
            <span className="flow-icon active-flow"><MotoIcon size={18} /></span>
            <div className="flow-text">
              <strong>2. En route</strong>
              <small>Livreur d'Adzopé</small>
            </div>
          </div>
          <span className="flow-separator"><ArrowRightIcon size={14} /></span>
          <div className="flow-step">
            <span className="flow-icon"><ShieldCheckIcon size={18} /></span>
            <div className="flow-text">
              <strong>3. Sécurité PIN</strong>
              <small>Remise en main propre</small>
            </div>
          </div>
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

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  Minus,
  Package,
  ReceiptText,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  XCircle,
} from "lucide-react";

import { merchants, products } from "../data";
import { useApp } from "../context/AppContext";
import type { Order, OrderItem } from "../types";
import { formatCurrency } from "../utils/formatCurrency";
import "./Orders.css";

type OrderTab = "active" | "history";

const ACTIVE_STATUSES: Order["status"][] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "driver_assigned",
  "picked_up",
  "delivering",
];

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "En attente",
  accepted: "Acceptée",
  preparing: "En préparation",
  ready: "Prête",
  driver_assigned: "Livreur assigné",
  picked_up: "Récupérée",
  delivering: "En livraison",
  delivered: "Livrée",
  cancelled: "Annulée",
  merchant_rejected: "Refusée",
};

const STATUS_STEPS: Array<{
  key: Order["status"];
  label: string;
  icon: typeof Check;
}> = [
  { key: "pending", label: "Commande passée", icon: ReceiptText },
  { key: "preparing", label: "Préparation", icon: Store },
  { key: "driver_assigned", label: "Livreur assigné", icon: Bike },
  { key: "delivering", label: "En livraison", icon: Package },
  { key: "delivered", label: "Livrée", icon: Check },
];

export function Orders() {
  const {
    orders,
    cart,
    cartTotal,
    cartDeliveryFee,
    removeFromCart,
    placeOrder,
  } = useApp();

  const [tab, setTab] = useState<OrderTab>("active");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const visibleOrders = orders.filter((order) =>
    tab === "active"
      ? ACTIVE_STATUSES.includes(order.status)
      : !ACTIVE_STATUSES.includes(order.status),
  );

  if (selectedOrder) {
    return (
      <div className="page-content orders-page">
        <button
          type="button"
          className="back-button orders-back"
          onClick={() => setSelectedOrder(null)}
        >
          <ArrowLeft size={16} />
          <span>Retour aux commandes</span>
        </button>

        <OrderDetail order={selectedOrder} />
      </div>
    );
  }

  return (
    <div className="page-content orders-page">
      <section className="page-heading orders-heading">
        <p className="eyebrow">VOS LIVRAISONS</p>
        <h1>Commandes</h1>
        <p>Retrouvez vos commandes, leurs produits et leur progression.</p>
      </section>

      {cart.length ? (
        <section className="orders-cart-card">
          <div className="orders-cart-head">
            <div>
              <p className="eyebrow">PANIER EN COURS</p>
              <h2>
                {cart.reduce((total, item) => total + item.quantity, 0)} article(s)
              </h2>
            </div>

            <span className="orders-cart-total">
              {formatCurrency(cartTotal + cartDeliveryFee)}
            </span>
          </div>

          <div className="orders-cart-products">
            {cart.map((item) => (
              <CartProductRow
                key={item.productId}
                item={item}
                onRemove={() => removeFromCart(item.productId)}
              />
            ))}
          </div>

          <div className="orders-price-summary">
            <span>
              Sous-total <strong>{formatCurrency(cartTotal)}</strong>
            </span>
            <span>
              Livraison <strong>{formatCurrency(cartDeliveryFee)}</strong>
            </span>
            <span className="total">
              Total{" "}
              <strong>{formatCurrency(cartTotal + cartDeliveryFee)}</strong>
            </span>
          </div>

          <button
            type="button"
            className="primary-button orders-cart-cta"
            onClick={() => placeOrder()}
          >
            Commander · {formatCurrency(cartTotal + cartDeliveryFee)}
          </button>
        </section>
      ) : null}

      <div className="orders-tabs" role="tablist" aria-label="Commandes">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "active"}
          className={tab === "active" ? "active" : ""}
          onClick={() => setTab("active")}
        >
          <span>En cours</span>
          <b>{orders.filter((order) => ACTIVE_STATUSES.includes(order.status)).length}</b>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === "history"}
          className={tab === "history" ? "active" : ""}
          onClick={() => setTab("history")}
        >
          <span>Historique</span>
          <b>{orders.filter((order) => !ACTIVE_STATUSES.includes(order.status)).length}</b>
        </button>
      </div>

      <div className="orders-list">
        {visibleOrders.length ? (
          visibleOrders.map((order) => (
            <OrderPreview
              key={order.id}
              order={order}
              onOpen={() => setSelectedOrder(order)}
            />
          ))
        ) : (
          <div className="orders-empty">
            <span className="orders-empty-icon">
              {tab === "active" ? <Bike size={22} /> : <ReceiptText size={22} />}
            </span>
            <strong>
              {tab === "active"
                ? "Aucune commande en cours"
                : "Pas encore d’historique"}
            </strong>
            <p>
              {tab === "active"
                ? "Votre prochaine livraison apparaîtra ici."
                : "Vos commandes terminées apparaîtront ici."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function CartProductRow({
  item,
  onRemove,
}: {
  item: OrderItem;
  onRemove: () => void;
}) {
  const product = products.find((entry) => entry.id === item.productId);

  return (
    <div className="order-product-row">
      <ProductThumbnail image={product?.image} alt={item.name} />

      <div className="order-product-content">
        <strong>{item.name}</strong>
        <span>
          {item.quantity} × {formatCurrency(item.unitPrice)}
        </span>
      </div>

      <div className="order-product-side">
        <strong>{formatCurrency(item.unitPrice * item.quantity)}</strong>
        <button type="button" onClick={onRemove} aria-label={`Retirer ${item.name}`}>
          <XCircle size={17} />
        </button>
      </div>
    </div>
  );
}

function OrderPreview({
  order,
  onOpen,
}: {
  order: Order;
  onOpen: () => void;
}) {
  const merchant = merchants.find((entry) => entry.id === order.merchantId);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const previewItems = order.items.slice(0, 3);

  return (
    <article className={`order-preview ${order.status}`}>
      <button type="button" className="order-preview-main" onClick={onOpen}>
        <div className="order-preview-top">
          <span className={`order-status ${order.status}`}>
            <span className="order-status-dot" />
            {STATUS_LABELS[order.status]}
          </span>

          <span className="order-number">
            #{order.orderNumber ?? order.id}
          </span>
        </div>

        <div className="order-preview-merchant">
          <div className="merchant-mini-icon">
            {merchant?.image ? (
              <img src={merchant.image} alt="" loading="lazy" />
            ) : (
              <Store size={17} />
            )}
          </div>

          <div>
            <strong>{order.merchantName}</strong>
            <span>
              {order.date} · {itemCount} article{itemCount > 1 ? "s" : ""}
            </span>
          </div>

          <ChevronRight size={18} />
        </div>

        <div className="order-preview-products">
          {previewItems.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);

            return (
              <div className="order-mini-product" key={item.productId}>
                <ProductThumbnail image={product?.image} alt="" />
                <div>
                  <strong>
                    {item.quantity} × {item.name}
                  </strong>
                  <span>
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            );
          })}

          {order.items.length > previewItems.length ? (
            <span className="order-more-items">
              +{order.items.length - previewItems.length}
            </span>
          ) : null}
        </div>

        <div className="order-preview-bottom">
          <strong>{formatCurrency(order.total)}</strong>
          <span>
            Voir le détail <ArrowRight size={14} />
          </span>
        </div>
      </button>
    </article>
  );
}

export function OrderDetail({ order }: { order: Order }) {
  const [query, setQuery] = useState("");
  const merchant = merchants.find((entry) => entry.id === order.merchantId);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return order.items;

    return order.items.filter((item) =>
      item.name.toLowerCase().includes(normalized),
    );
  }, [order.items, query]);

  const currentStepIndex = getStatusStepIndex(order.status);
  const activeDelivery = ["driver_assigned", "picked_up", "delivering"].includes(
    order.status,
  );

  return (
    <div className="order-detail-page">
      <section className="order-detail-hero">
        <div className="order-detail-status-row">
          <span className={`order-status large ${order.status}`}>
            <span className="order-status-dot" />
            {STATUS_LABELS[order.status]}
          </span>

          <span className="order-number">
            #{order.orderNumber ?? order.id}
          </span>
        </div>

        <div className="order-detail-merchant">
          <div className="merchant-detail-avatar">
            {merchant?.image ? (
              <img src={merchant.image} alt={order.merchantName} />
            ) : (
              <Store size={20} />
            )}
          </div>

          <div>
            <p className="eyebrow">COMMERCE</p>
            <h1>{order.merchantName}</h1>
            <p>{order.date}</p>
          </div>
        </div>

        {order.deliveryAddress ? (
          <div className="order-destination">
            <MapPin size={17} />
            <div>
              <span>Livraison à</span>
              <strong>{order.deliveryAddress}</strong>
            </div>
          </div>
        ) : null}
      </section>

      <section className="order-tracking-card">
        <div className="order-tracking-head">
          <div>
            <p className="eyebrow">SUIVI</p>
            <h2>
              {order.status === "delivered"
                ? "Commande livrée"
                : activeDelivery
                  ? "Votre commande est en route"
                  : "Votre commande est en préparation"}
            </h2>
          </div>

          {order.distanceMeters ? (
            <span className="order-distance">
              {(order.distanceMeters / 1000).toFixed(1).replace(".", ",")} km
            </span>
          ) : null}
        </div>

        <div className="order-progress">
          {STATUS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const done = currentStepIndex > index;
            const current = currentStepIndex === index;

            return (
              <div
                className={`order-progress-step ${done ? "done" : ""} ${
                  current ? "current" : ""
                }`}
                key={step.key}
              >
                <div className="order-progress-node">
                  {done ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span>{step.label}</span>

                {index < STATUS_STEPS.length - 1 ? (
                  <span
                    className={`order-progress-line ${done ? "done" : ""}`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {activeDelivery ? (
          <div className="order-driver-banner">
            <div className="order-driver-icon">
              <Bike size={19} />
            </div>
            <div>
              <strong>
                {order.driver?.name
                  ? `Livraison par ${order.driver.name}`
                  : "Votre livreur prend la route"}
              </strong>
              <span>
                Remise sécurisée par code PIN à l'arrivée.
              </span>
            </div>
            <ShieldCheck size={20} />
          </div>
        ) : null}
      </section>

      <section className="order-section">
        <div className="order-section-heading">
          <div>
            <p className="eyebrow">ARTICLES</p>
            <h2>Votre commande</h2>
          </div>

          <span>{order.items.length} produit(s)</span>
        </div>

        <label className="order-search">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un produit..."
          />
        </label>

        <div className="order-detail-products">
          {filteredItems.map((item) => {
            const product = products.find((entry) => entry.id === item.productId);

            return (
              <OrderDetailProduct
                key={item.productId}
                item={item}
                image={product?.image}
              />
            );
          })}

          {!filteredItems.length ? (
            <div className="order-no-results">
              <Search size={20} />
              Aucun produit ne correspond.
            </div>
          ) : null}
        </div>
      </section>

      <section className="order-section order-total-section">
        <div className="order-section-heading">
          <div>
            <p className="eyebrow">PAIEMENT</p>
            <h2>Récapitulatif</h2>
          </div>
        </div>

        <div className="order-totals">
          <span>
            Sous-total
            <strong>{formatCurrency(order.subtotal ?? order.total)}</strong>
          </span>

          <span>
            Livraison
            <strong>{formatCurrency(order.deliveryFee ?? 0)}</strong>
          </span>

          {(order.discount ?? 0) > 0 ? (
            <span>
              Réduction
              <strong>-{formatCurrency(order.discount ?? 0)}</strong>
            </span>
          ) : null}

          <span className="grand-total">
            Total
            <strong>{formatCurrency(order.total)}</strong>
          </span>
        </div>
      </section>

      {activeDelivery && order.deliveryPin ? (
        <section className="order-pin-card">
          <div className="order-pin-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="eyebrow">REMISE SÉCURISÉE</p>
            <h2>Votre code PIN</h2>
            <p>Communiquez ce code uniquement au moment de la remise.</p>
          </div>
          <strong>{order.deliveryPin}</strong>
        </section>
      ) : null}

      <div className="order-detail-footer">
        <span>
          <Clock3 size={15} />
          Statut : {STATUS_LABELS[order.status]}
        </span>
        <span>
          <ShoppingBag size={15} />
          {order.paymentStatus === "paid" ? "Paiement effectué" : "Paiement à la livraison"}
        </span>
      </div>
    </div>
  );
}

function OrderDetailProduct({
  item,
  image,
}: {
  item: OrderItem;
  image?: string;
}) {
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <article className="order-detail-product">
      <ProductThumbnail image={image} alt={item.name} size="large" />

      <div className="order-detail-product-copy">
        <p className="eyebrow">PRODUIT</p>
        <h3>{item.name}</h3>
        <span>
          {item.quantity} × {formatCurrency(item.unitPrice)}
        </span>
      </div>

      <strong>{formatCurrency(lineTotal)}</strong>
    </article>
  );
}

function ProductThumbnail({
  image,
  alt,
  size = "medium",
}: {
  image?: string;
  alt: string;
  size?: "medium" | "large";
}) {
  return (
    <div className={`product-thumbnail ${size}`}>
      {image ? (
        <img src={image} alt={alt} loading="lazy" />
      ) : (
        <div className="product-thumbnail-fallback">
          <ShoppingBag size={size === "large" ? 22 : 18} />
        </div>
      )}
    </div>
  );
}

function getStatusStepIndex(status: Order["status"]) {
  switch (status) {
    case "pending":
      return 0;
    case "accepted":
    case "preparing":
    case "ready":
      return 1;
    case "driver_assigned":
    case "picked_up":
      return 2;
    case "delivering":
      return 3;
    case "delivered":
      return 4;
    case "cancelled":
    case "merchant_rejected":
      return 0;
    default:
      return 0;
  }
}

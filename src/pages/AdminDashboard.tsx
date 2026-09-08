import { useMemo, useState } from "react";
import { merchants, products } from "../data";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/formatCurrency";
import { formatOrderStatus } from "../utils/formatDate";
import type { Order, OrderStatus } from "../types";
import "./AdminDashboard.css";

type AdminSection =
  | "overview"
  | "orders"
  | "customers"
  | "merchants"
  | "drivers"
  | "categories"
  | "finances";
const sections: { id: AdminSection; label: string }[] = [
  { id: "overview", label: "Vue d’ensemble" },
  { id: "orders", label: "Commandes" },
  { id: "customers", label: "Clients" },
  { id: "merchants", label: "Commerçants" },
  { id: "drivers", label: "Livreurs" },
  { id: "categories", label: "Catégories" },
  { id: "finances", label: "Finances" },
];
const terminalStatuses: OrderStatus[] = [
  "delivered",
  "cancelled",
  "merchant_rejected",
];

export function AdminDashboard({
  onReturnToCustomer,
}: {
  onReturnToCustomer: () => void;
}) {
  const {
    addCategory,
    categories,
    customers,
    orders,
    removeCategory,
    updateCategory,
  } = useApp();
  const [section, setSection] = useState<AdminSection>("overview");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [categoryLabel, setCategoryLabel] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const delivered = orders.filter((order) => order.status === "delivered");
  const revenue = delivered.reduce((total, order) => total + order.total, 0);
  const commissions = delivered.reduce(
    (total, order) => total + Math.round((order.subtotal ?? order.total) * 0.1),
    0,
  );
  const drivers = useMemo(
    () =>
      Array.from(
        new Map(
          orders
            .filter((order) => order.driver)
            .map((order) => [order.driver!.name, order.driver!]),
        ).values(),
      ),
    [orders],
  );
  const filteredOrders = orders.filter(
    (order) =>
      (status === "all" || order.status === status) &&
      `${order.orderNumber ?? order.id} ${order.merchantName}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const saveCategory = () => {
    const result = editingCategory
      ? updateCategory(editingCategory, categoryLabel)
      : addCategory(categoryLabel);
    setFeedback(
      result
        ? "Catégorie enregistrée."
        : "Nom vide ou identifiant déjà utilisé.",
    );
    if (result) {
      setCategoryLabel("");
      setEditingCategory(null);
    }
  };
  const deleteCategory = (id: string) => {
    if (!window.confirm("Supprimer cette catégorie ?")) return;
    setFeedback(
      removeCategory(id)
        ? "Catégorie supprimée."
        : "Cette catégorie est encore utilisée par un commerce ou un produit.",
    );
  };
  const countStatus = (value: OrderStatus) =>
    orders.filter((order) => order.status === value).length;
  const renderOverview = () => (
    <>
      <div className="admin-kpis">
        <Kpi label="Clients" value={customers.length} />
        <Kpi label="Commerçants" value={merchants.length} />
        <Kpi label="Livreurs" value={drivers.length} />
        <Kpi label="Commandes" value={orders.length} />
        <Kpi label="En attente" value={countStatus("pending")} />
        <Kpi label="En préparation" value={countStatus("preparing")} />
        <Kpi label="En livraison" value={countStatus("delivering")} />
        <Kpi label="Livrées" value={delivered.length} />
        <Kpi
          label="Annulées"
          value={countStatus("cancelled") + countStatus("merchant_rejected")}
        />
        <Kpi label="Chiffre d’affaires livré" value={formatCurrency(revenue)} />
        <Kpi label="Commissions RUBIGO" value={formatCurrency(commissions)} />
        <Kpi
          label="Panier moyen livré"
          value={formatCurrency(
            delivered.length ? Math.round(revenue / delivered.length) : 0,
          )}
        />
      </div>
      <RecentOrders orders={orders.slice(0, 5)} onOpen={setSelectedOrder} />
    </>
  );
  const renderOrders = () => (
    <>
      <div className="admin-filters">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher une commande ou un commerce"
        />
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as OrderStatus | "all")
          }
        >
          <option value="all">Tous les statuts</option>
          {(
            [
              "pending",
              "accepted",
              "preparing",
              "ready",
              "driver_assigned",
              "picked_up",
              "delivering",
              "delivered",
              "cancelled",
              "merchant_rejected",
            ] as OrderStatus[]
          ).map((item) => (
            <option key={item} value={item}>
              {formatOrderStatus(item)}
            </option>
          ))}
        </select>
      </div>
      {filteredOrders.length ? (
        <RecentOrders orders={filteredOrders} onOpen={setSelectedOrder} />
      ) : (
        <Empty text="Aucune commande ne correspond aux filtres." />
      )}
    </>
  );
  const renderCustomers = () =>
    customers.length ? (
      <div className="admin-list">
        {customers.map((customer) => {
          const customerOrders = orders.filter(
            (order) => order.customerId === customer.id,
          );
          return (
            <article key={customer.id} className="admin-record">
              <strong>{customer.name}</strong>
              <span>{customer.phone}</span>
              <span>{customerOrders.length} commande(s)</span>
              <b>
                {formatCurrency(
                  customerOrders.reduce(
                    (total, order) => total + order.total,
                    0,
                  ),
                )}
              </b>
            </article>
          );
        })}
      </div>
    ) : (
      <Empty text="Aucun client enregistré." />
    );
  const renderMerchants = () => (
    <div className="admin-list">
      {merchants.map((merchant) => {
        const merchantOrders = orders.filter(
          (order) => order.merchantId === merchant.id,
        );
        return (
          <article key={merchant.id} className="admin-record">
            <strong>{merchant.name}</strong>
            <span>{merchant.category}</span>
            <span>
              {
                products.filter((product) => product.merchantId === merchant.id)
                  .length
              }{" "}
              produit(s) · {merchantOrders.length} commande(s)
            </span>
            <b>{merchant.isOpen ? "Actif" : "Inactif"}</b>
          </article>
        );
      })}
    </div>
  );
  const renderDrivers = () =>
    drivers.length ? (
      <div className="admin-list">
        {drivers.map((driver) => {
          const driverOrders = orders.filter(
            (order) => order.driver?.name === driver.name,
          );
          const active = driverOrders.some(
            (order) => !terminalStatuses.includes(order.status),
          );
          return (
            <article key={driver.name} className="admin-record">
              <strong>{driver.name}</strong>
              <span>{active ? "En livraison" : "Disponible"}</span>
              <span>
                {
                  driverOrders.filter((order) => order.status === "delivered")
                    .length
                }{" "}
                livraison(s) terminée(s)
              </span>
              <b>
                {formatCurrency(
                  driverOrders.reduce(
                    (total, order) => total + (order.deliveryFee ?? 0) * 0.7,
                    0,
                  ),
                )}
              </b>
            </article>
          );
        })}
      </div>
    ) : (
      <Empty text="Aucun livreur n’est encore associé à une commande." />
    );
  const renderCategories = () => (
    <>
      <div className="admin-category-form">
        <input
          value={categoryLabel}
          onChange={(event) => setCategoryLabel(event.target.value)}
          placeholder="Nom de la catégorie"
        />
        <button onClick={saveCategory}>
          {editingCategory ? "Enregistrer" : "Ajouter"}
        </button>
        {editingCategory ? (
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryLabel("");
            }}
          >
            Annuler
          </button>
        ) : null}
      </div>
      {feedback ? (
        <p className="admin-feedback" role="status">
          {feedback}
        </p>
      ) : null}
      <div className="admin-list">
        {categories.map((category) => {
          const usage =
            merchants.filter((merchant) => merchant.categoryId === category.id)
              .length +
            products.filter((product) => product.categoryId === category.id)
              .length;
          return (
            <article key={category.id} className="admin-record">
              <strong>{category.label}</strong>
              <span>{category.id}</span>
              <span>{usage} utilisation(s)</span>
              <span className="admin-actions">
                <button
                  onClick={() => {
                    setEditingCategory(category.id);
                    setCategoryLabel(category.label);
                    setFeedback("");
                  }}
                >
                  Modifier
                </button>
                <button onClick={() => deleteCategory(category.id)}>
                  Supprimer
                </button>
              </span>
            </article>
          );
        })}
      </div>
    </>
  );
  const renderFinances = () => (
    <div className="admin-kpis">
      <Kpi label="Chiffre d’affaires livré" value={formatCurrency(revenue)} />
      <Kpi
        label="Frais de livraison livrés"
        value={formatCurrency(
          delivered.reduce(
            (total, order) => total + (order.deliveryFee ?? 0),
            0,
          ),
        )}
      />
      <Kpi label="Commissions RUBIGO" value={formatCurrency(commissions)} />
      <Kpi
        label="Revenus commerçants"
        value={formatCurrency(revenue - commissions)}
      />
      <Kpi
        label="Commandes payées"
        value={orders.filter((order) => order.paymentStatus === "paid").length}
      />
      <Kpi
        label="Commandes annulées"
        value={countStatus("cancelled") + countStatus("merchant_rejected")}
      />
    </div>
  );
  const content =
    section === "overview"
      ? renderOverview()
      : section === "orders"
        ? renderOrders()
        : section === "customers"
          ? renderCustomers()
          : section === "merchants"
            ? renderMerchants()
            : section === "drivers"
              ? renderDrivers()
              : section === "categories"
                ? renderCategories()
                : renderFinances();
  return (
    <div className="page-content role-page admin-page">
      <section className="page-heading">
        <p className="eyebrow">RUBIGO · ADMINISTRATION</p>
        <h1>Centre de contrôle</h1>
        <p>
          Les données affichées sont partagées avec les parcours client,
          commerçant et livreur.
        </p>
      </section>
      <div className="role-switch">
        <strong>Administration locale</strong>
        <button onClick={onReturnToCustomer}>Revenir au client</button>
      </div>
      <nav className="admin-tabs" aria-label="Sections d’administration">
        {sections.map((item) => (
          <button
            key={item.id}
            className={section === item.id ? "active" : ""}
            onClick={() => {
              setSection(item.id);
              setSelectedOrder(null);
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {selectedOrder ? (
        <OrderDetails
          order={selectedOrder}
          customer={
            customers.find(
              (customer) => customer.id === selectedOrder.customerId,
            )?.name
          }
          onClose={() => setSelectedOrder(null)}
        />
      ) : (
        <section className="admin-section">{content}</section>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <strong>{text}</strong>
    </div>
  );
}
function RecentOrders({
  orders,
  onOpen,
}: {
  orders: Order[];
  onOpen: (order: Order) => void;
}) {
  return (
    <div className="admin-list">
      {orders.map((order) => (
        <button
          className="admin-record"
          key={order.id}
          onClick={() => onOpen(order)}
        >
          <strong>#{order.orderNumber ?? order.id}</strong>
          <span>{order.merchantName}</span>
          <span>{formatOrderStatus(order.status)}</span>
          <b>{formatCurrency(order.total)}</b>
        </button>
      ))}
    </div>
  );
}
function OrderDetails({
  order,
  customer,
  onClose,
}: {
  order: Order;
  customer?: string;
  onClose: () => void;
}) {
  return (
    <section className="admin-order-detail">
      <button className="text-button" onClick={onClose}>
        ← Retour aux commandes
      </button>
      <p className="eyebrow">COMMANDE #{order.orderNumber ?? order.id}</p>
      <h2>{order.merchantName}</h2>
      <p>
        Client : {customer ?? order.customerId ?? "Non renseigné"} · Livreur :{" "}
        {order.driver?.name ?? "Non assigné"}
      </p>
      <div className="admin-order-meta">
        <span>
          Statut <b>{formatOrderStatus(order.status)}</b>
        </span>
        <span>
          Créée{" "}
          <b>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString("fr-FR")
              : order.date}
          </b>
        </span>
        <span>
          Livraison <b>{formatCurrency(order.deliveryFee ?? 0)}</b>
        </span>
        <span>
          Commission{" "}
          <b>
            {formatCurrency(Math.round((order.subtotal ?? order.total) * 0.1))}
          </b>
        </span>
      </div>
      <div className="admin-list">
        {order.items.map((item) => (
          <div className="admin-record" key={item.productId}>
            <strong>{item.name}</strong>
            <span>
              {item.quantity} × {formatCurrency(item.unitPrice)}
            </span>
            <b>{formatCurrency(item.quantity * item.unitPrice)}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

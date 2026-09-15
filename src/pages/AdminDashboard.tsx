import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bike,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  LayoutDashboard,
  Menu,
  PackageCheck,
  Search,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Store,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { merchants } from "../data";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/formatCurrency";
import {
  adminService,
  type AdminOverview,
  type AdminRequestStatus,
} from "../services/adminService.ts";
import "./AdminDashboard.css";

type AdminSection =
  | "dashboard"
  | "users"
  | "validation"
  | "merchants"
  | "drivers"
  | "orders"
  | "catalog"
  | "payments"
  | "reports"
  | "analytics"
  | "settings";

const NAV_ITEMS: Array<{
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}> = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "validation", label: "Validation", icon: ClipboardCheck },
  { id: "merchants", label: "Commerces", icon: Store },
  { id: "drivers", label: "Livreurs", icon: Bike },
  { id: "orders", label: "Commandes", icon: ShoppingCart },
  { id: "catalog", label: "Catalogue", icon: PackageCheck },
  { id: "payments", label: "Paiements", icon: CircleDollarSign },
  { id: "reports", label: "Réclamations", icon: ShieldAlert },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Paramètres", icon: Settings },
];

const STATUS_LABELS: Record<string, string> = {
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

const REQUEST_LABELS: Record<string, string> = {
  merchant_application: "Demande commerçant",
  driver_application: "Demande livreur",
  document_review: "Document en attente",
  account_report: "Compte signalé",
};

export function AdminDashboard({
  onReturnToCustomer,
}: {
  onReturnToCustomer: () => void;
}) {
  const { user } = useApp();
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [actingRequestId, setActingRequestId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      setOverview(await adminService.fetchOverview());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les données administrateur.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const profiles = overview?.profiles ?? [];
  const orders = overview?.orders ?? [];
  const requests = overview?.requests ?? [];

  const customerCount = profiles.filter(
    (profile) => profile.role === "customer",
  ).length;
  const merchantCount = profiles.filter(
    (profile) => profile.role === "merchant",
  ).length;
  const driverCount = profiles.filter(
    (profile) => profile.role === "driver",
  ).length;
  const adminCount = profiles.filter(
    (profile) => profile.role === "admin",
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered",
  );
  const revenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

  const pendingRequests = requests.filter(
    (request) => request.status === "pending",
  );
  const merchantRequests = pendingRequests.filter(
    (request) => request.requestType === "merchant_application",
  );
  const driverRequests = pendingRequests.filter(
    (request) => request.requestType === "driver_application",
  );
  const documentRequests = pendingRequests.filter(
    (request) => request.requestType === "document_review",
  );
  const reportRequests = pendingRequests.filter(
    (request) => request.requestType === "account_report",
  );

  const newUsers = useMemo(
    () =>
      [...profiles]
        .sort(
          (a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0),
        )
        .slice(0, 5),
    [profiles],
  );

  const latestOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 5),
    [orders],
  );

  const merchantActivity = useMemo(() => {
    const counts = new Map<string, number>();

    orders.forEach((order) => {
      const key = order.merchantLocalId ?? "unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([id, count]) => ({
        id,
        name:
          merchants.find((merchant) => merchant.id === id)?.name ??
          "Commerce RUBIGO",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  const driverActivity = useMemo(() => {
    const counts = new Map<string, number>();

    deliveredOrders.forEach((order) => {
      if (order.driverId) {
        counts.set(order.driverId, (counts.get(order.driverId) ?? 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([id, count]) => ({
        id,
        profile: profiles.find((profile) => profile.id === id),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [deliveredOrders, profiles]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return profiles.filter((profile) => {
      if (!normalized) return true;
      return `${profile.fullName} ${profile.email ?? ""} ${profile.phone ?? ""}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [profiles, query]);

  const lastSevenDays = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(now.getDate() - (6 - index));

      const key = date.toISOString().slice(0, 10);
      const count = orders.filter(
        (order) => order.createdAt.slice(0, 10) === key,
      ).length;

      return {
        label: date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        }),
        count,
      };
    });
  }, [orders]);

  const maxDailyOrders = Math.max(
    1,
    ...lastSevenDays.map((item) => item.count),
  );

  const approveRequest = async (
    requestId: string,
    status: AdminRequestStatus,
  ) => {
    setActingRequestId(requestId);
    const ok = await adminService.updateRequestStatus(requestId, status);
    setActingRequestId(null);

    if (!ok) {
      setError("La demande n’a pas pu être mise à jour.");
      return;
    }

    await load();
  };

  const requestRows = pendingRequests.slice(0, 8);

  const switchSection = (next: AdminSection) => {
    setSection(next);
    setMobileNavOpen(false);
  };

  const renderDashboard = () => (
    <>
      <div className="admin-kpi-grid">
        <KpiCard
          icon={<Users />}
          value={profiles.length}
          label="Utilisateurs"
          trend="+12%"
        />
        <KpiCard
          icon={<Store />}
          value={merchantCount}
          label="Commerçants"
          trend="+8%"
          accent="orange"
        />
        <KpiCard
          icon={<Bike />}
          value={driverCount}
          label="Livreurs"
          trend="+16%"
          accent="blue"
        />
        <KpiCard
          icon={<ShoppingCart />}
          value={orders.length}
          label="Commandes"
          trend="+24%"
          accent="purple"
        />
        <KpiCard
          icon={<CircleDollarSign />}
          value={formatCurrency(revenue)}
          label="Chiffre d’affaires"
          trend="+18%"
          wide
        />
      </div>

      <div className="admin-chart-grid">
        <section className="admin-panel admin-orders-chart-panel">
          <PanelHeader
            icon={<TrendingUp />}
            title="Activité des commandes"
            action="7 derniers jours"
          />

          <div className="orders-chart">
            <div className="chart-y-axis">
              <span>{Math.max(200, Math.ceil(maxDailyOrders / 50) * 50)}</span>
              <span>
                {Math.max(150, Math.ceil(maxDailyOrders / 50) * 50 - 50)}
              </span>
              <span>
                {Math.max(100, Math.ceil(maxDailyOrders / 50) * 50 - 100)}
              </span>
              <span>50</span>
              <span>0</span>
            </div>

            <div className="chart-area">
              <div className="chart-grid-lines" />
              <svg
                viewBox="0 0 700 250"
                role="img"
                aria-label="Activité des commandes sur les sept derniers jours"
              >
                <defs>
                  <linearGradient
                    id="adminChartFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="rgba(30, 210, 126, 0.32)" />
                    <stop offset="100%" stopColor="rgba(30, 210, 126, 0)" />
                  </linearGradient>
                </defs>

                <polygon
                  fill="url(#adminChartFill)"
                  points={[
                    "0,240",
                    ...lastSevenDays.map((item, index) => {
                      const x = index * 116.6;
                      const y = 230 - (item.count / maxDailyOrders) * 190;
                      return `${x},${y}`;
                    }),
                    "700,240",
                  ].join(" ")}
                />

                <polyline
                  fill="none"
                  stroke="#22d37e"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={lastSevenDays
                    .map((item, index) => {
                      const x = index * 116.6;
                      const y = 230 - (item.count / maxDailyOrders) * 190;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />

                {lastSevenDays.map((item, index) => {
                  const x = index * 116.6;
                  const y = 230 - (item.count / maxDailyOrders) * 190;

                  return (
                    <g key={item.label}>
                      <circle cx={x} cy={y} r="5.5" fill="#22d37e" />
                      <circle cx={x} cy={y} r="2" fill="#07130f" />
                    </g>
                  );
                })}
              </svg>

              <div className="chart-x-axis">
                {lastSevenDays.map((item) => (
                  <span key={item.label}>{item.label}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <PanelHeader icon={<Users />} title="Répartition des utilisateurs" />

          <div className="donut-wrap">
            <div
              className="donut"
              style={{
                background: `conic-gradient(
                  #27d884 0deg ${customerCount ? (customerCount / Math.max(profiles.length, 1)) * 360 : 0}deg,
                  #f59e0b ${customerCount ? (customerCount / Math.max(profiles.length, 1)) * 360 : 0}deg ${((customerCount + merchantCount) / Math.max(profiles.length, 1)) * 360}deg,
                  #3b82f6 ${((customerCount + merchantCount) / Math.max(profiles.length, 1)) * 360}deg ${((customerCount + merchantCount + driverCount) / Math.max(profiles.length, 1)) * 360}deg,
                  #a78bfa ${((customerCount + merchantCount + driverCount) / Math.max(profiles.length, 1)) * 360}deg 360deg
                )`,
              }}
            >
              <div>
                <strong>{profiles.length.toLocaleString("fr-FR")}</strong>
                <span>Utilisateurs</span>
              </div>
            </div>

            <div className="donut-legend">
              <LegendRow
                color="#27d884"
                label="Clients"
                value={customerCount}
                total={profiles.length}
              />
              <LegendRow
                color="#f59e0b"
                label="Commerçants"
                value={merchantCount}
                total={profiles.length}
              />
              <LegendRow
                color="#3b82f6"
                label="Livreurs"
                value={driverCount}
                total={profiles.length}
              />
              <LegendRow
                color="#a78bfa"
                label="Admins"
                value={adminCount}
                total={profiles.length}
              />
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <PanelHeader
            icon={<ClipboardCheck />}
            title="Demandes à traiter"
            badge={pendingRequests.length}
          />

          <div className="request-list">
            {[
              [merchantRequests.length, "Demandes commerçants", "orange"],
              [driverRequests.length, "Demandes livreurs", "blue"],
              [documentRequests.length, "Documents en attente", "slate"],
              [reportRequests.length, "Comptes signalés", "red"],
            ].map(([count, label, tone]) => (
              <button
                type="button"
                className="request-row"
                key={label}
                onClick={() => switchSection("validation")}
              >
                <span className={`request-icon ${tone}`}>
                  {tone === "orange" ? <Store size={16} /> : null}
                  {tone === "blue" ? <Bike size={16} /> : null}
                  {tone === "slate" ? <FileCheck2 size={16} /> : null}
                  {tone === "red" ? <ShieldAlert size={16} /> : null}
                </span>

                <strong>{count}</strong>
                <span>{label}</span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-panel">
        <PanelHeader
          icon={<ShoppingCart />}
          title="Dernières commandes"
          action="Voir toutes →"
          onAction={() => switchSection("orders")}
        />

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Commerce</th>
                <th>Statut</th>
                <th>Montant</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((order) => {
                const customer = profiles.find(
                  (profile) => profile.id === order.customerId,
                );

                return (
                  <tr key={order.id}>
                    <td>{order.orderNumber ?? order.id.slice(0, 8)}</td>
                    <td>{customer?.fullName ?? "Client RUBIGO"}</td>
                    <td>
                      {adminService.getMerchantName(order.merchantLocalId)}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${statusTone(order.status)}`}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="admin-bottom-grid">
        <section className="admin-panel">
          <PanelHeader
            icon={<UserRound />}
            title="Nouveaux utilisateurs"
            action="Voir tous →"
            onAction={() => switchSection("users")}
          />

          <div className="user-list">
            {newUsers.map((profile) => (
              <article key={profile.id} className="user-row">
                <div className="user-avatar">{initials(profile.fullName)}</div>

                <div className="user-copy">
                  <strong>{profile.fullName}</strong>
                  <span>
                    {profile.email ?? profile.phone ?? "Profil RUBIGO"}
                  </span>
                </div>

                <span className={`role-chip ${profile.role ?? "customer"}`}>
                  {profile.role === "driver"
                    ? "Livreur"
                    : profile.role === "merchant"
                      ? "Commerçant"
                      : profile.role === "admin"
                        ? "Admin"
                        : "Client"}
                </span>

                <time>{relativeTime(profile.createdAt)}</time>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <PanelHeader
            icon={<Store />}
            title="Commerces les plus actifs"
            action="Voir tous →"
            onAction={() => switchSection("merchants")}
          />

          <div className="ranking-list">
            {merchantActivity.map((item, index) => (
              <article key={item.id} className="ranking-row">
                <span className="ranking-index">{index + 1}</span>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.count} commande{item.count > 1 ? "s" : ""}
                  </span>
                </div>
                <ArrowUpRight size={15} />
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <PanelHeader
            icon={<Bike />}
            title="Livreurs les plus actifs"
            action="Voir tous →"
            onAction={() => switchSection("drivers")}
          />

          <div className="ranking-list">
            {driverActivity.map((item, index) => (
              <article key={item.id} className="ranking-row">
                <span className="ranking-index">{index + 1}</span>
                <div>
                  <strong>{item.profile?.fullName ?? "Livreur RUBIGO"}</strong>
                  <span>
                    {item.count} livraison{item.count > 1 ? "s" : ""}
                  </span>
                </div>
                <ArrowUpRight size={15} />
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <PanelHeader
            icon={<CircleDollarSign />}
            title="Répartition du chiffre d’affaires"
          />

          <div className="revenue-donut">
            <div className="revenue-donut-chart">
              <div>
                <strong>{formatCurrency(revenue)}</strong>
                <span>CA livré</span>
              </div>
            </div>

            <div className="revenue-legend">
              {[
                ["Restauration", "restaurants"],
                ["Supermarchés", "markets"],
                ["Fast-food", "fast-food"],
                ["Autres", "other"],
              ].map(([label, category], index) => {
                const value = deliveredOrders
                  .filter(
                    (order) =>
                      adminService.getMerchantCategory(
                        order.merchantLocalId,
                      ) === category,
                  )
                  .reduce((sum, order) => sum + order.total, 0);

                return (
                  <div className="revenue-legend-row" key={label}>
                    <span className={`legend-dot dot-${index + 1}`} />
                    <span>{label}</span>
                    <strong>{formatCurrency(value)}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );

  const renderValidation = () => (
    <section className="admin-panel">
      <PanelHeader
        icon={<ClipboardCheck />}
        title="Demandes à traiter"
        badge={pendingRequests.length}
      />

      {requestRows.length === 0 ? (
        <EmptyState
          icon={<Check />}
          title="Aucune demande en attente"
          text="Les nouvelles candidatures et vérifications apparaîtront ici."
        />
      ) : (
        <div className="validation-list">
          {requestRows.map((request) => (
            <article key={request.id} className="validation-card">
              <div className="validation-main">
                <div
                  className={`request-icon ${requestTone(request.requestType)}`}
                >
                  {request.requestType === "merchant_application" ? (
                    <Store />
                  ) : null}
                  {request.requestType === "driver_application" ? (
                    <Bike />
                  ) : null}
                  {request.requestType === "document_review" ? (
                    <FileCheck2 />
                  ) : null}
                  {request.requestType === "account_report" ? (
                    <ShieldAlert />
                  ) : null}
                </div>

                <div>
                  <span className="eyebrow">
                    {REQUEST_LABELS[request.requestType]}
                  </span>
                  <h3>{request.title}</h3>
                  <p>
                    {request.requester?.fullName ?? "Utilisateur"}
                    {request.requester?.email
                      ? ` · ${request.requester.email}`
                      : ""}
                  </p>
                  {request.note ? <small>{request.note}</small> : null}
                </div>
              </div>

              <div className="validation-actions">
                <span className="pending-badge">
                  <Clock3 size={13} />
                  En attente
                </span>

                <button
                  type="button"
                  className="action-danger"
                  disabled={actingRequestId === request.id}
                  onClick={() => approveRequest(request.id, "rejected")}
                >
                  Refuser
                </button>

                <button
                  type="button"
                  className="action-primary"
                  disabled={actingRequestId === request.id}
                  onClick={() => approveRequest(request.id, "approved")}
                >
                  {actingRequestId === request.id ? "..." : "Approuver"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const renderUsers = () => (
    <section className="admin-panel">
      <PanelHeader icon={<Users />} title="Utilisateurs" />

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un utilisateur..."
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Créé le</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((profile) => (
              <tr key={profile.id}>
                <td>{profile.fullName}</td>
                <td>{profile.email ?? "—"}</td>
                <td>{profile.phone ?? "—"}</td>
                <td>
                  <span className={`role-chip ${profile.role ?? "customer"}`}>
                    {profile.role ?? "customer"}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-pill ${profile.isActive === false ? "danger" : "success"}`}
                  >
                    {profile.isActive === false ? "Inactif" : "Actif"}
                  </span>
                </td>
                <td>{formatDateTime(profile.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderSimpleSection = (
    title: string,
    description: string,
    icon: React.ReactNode,
  ) => (
    <section className="admin-panel admin-empty-section">
      <div className="admin-empty-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <button type="button" className="action-primary" onClick={load}>
        Actualiser les données
      </button>
    </section>
  );

  return (
    <div className="admin-dashboard">
      <aside className={`admin-sidebar ${mobileNavOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <strong>
            RUBIGO<span>◌</span>
          </strong>
          <small>ADMIN</small>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.id}
                className={section === item.id ? "active" : ""}
                onClick={() => switchSection(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === "validation" && pendingRequests.length > 0 ? (
                  <em>{pendingRequests.length}</em>
                ) : null}
                {item.id === "reports" && reportRequests.length > 0 ? (
                  <em>{reportRequests.length}</em>
                ) : null}
                {[
                  "users",
                  "merchants",
                  "catalog",
                  "payments",
                  "settings",
                ].includes(item.id) ? (
                  <ChevronDown className="nav-chevron" size={14} />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-promo">
          <div className="promo-art" />
          <strong>
            La ville
            <br />à votre porte.
          </strong>
          <span>RUBIGO Administration</span>
          <small>Version 1.0.0</small>
        </div>

        <button
          type="button"
          className="return-customer"
          onClick={onReturnToCustomer}
        >
          Revenir au client
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="mobile-menu"
            onClick={() => setMobileNavOpen((value) => !value)}
            aria-label="Ouvrir le menu"
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="admin-global-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un utilisateur, un commerce, une commande..."
            />
            <span>Ctrl K</span>
          </div>

          <div className="admin-top-actions">
            <button
              type="button"
              className="icon-action"
              aria-label="Notifications"
            >
              <Bell size={19} />
              {pendingRequests.length > 0 ? (
                <b>{Math.min(9, pendingRequests.length)}</b>
              ) : null}
            </button>

            <div className="admin-profile">
              <div className="admin-avatar">
                {initials(user.name || "Admin RUBIGO")}
              </div>
              <div>
                <strong>{user.name || "Admin RUBIGO"}</strong>
                <span>Super Administrateur</span>
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <div className="admin-content">
          <div className="admin-page-header">
            <div>
              <span className="eyebrow">ADMINISTRATION RUBIGO</span>
              <h1>
                {section === "dashboard"
                  ? "Bonjour Admin 👋"
                  : (NAV_ITEMS.find((item) => item.id === section)?.label ??
                    "Administration")}
              </h1>
              <p>
                {section === "dashboard"
                  ? "Voici l’activité de RUBIGO aujourd’hui."
                  : "Contrôlez les opérations et les données de la plateforme."}
              </p>
            </div>

            <button type="button" className="date-selector">
              <CalendarDays size={17} />
              <span>
                Aujourd’hui
                <br />
                <strong>15 Sept. 2026</strong>
              </span>
              <ChevronDown size={15} />
            </button>
          </div>

          {error ? (
            <div className="admin-alert danger">
              <AlertTriangle size={17} />
              <span>{error}</span>
              <button type="button" onClick={() => void load()}>
                Réessayer
              </button>
            </div>
          ) : null}

          {loading ? (
            <LoadingState />
          ) : section === "dashboard" ? (
            renderDashboard()
          ) : section === "validation" ? (
            renderValidation()
          ) : section === "users" ? (
            renderUsers()
          ) : section === "orders" ? (
            renderSimpleSection(
              "Commandes",
              "La vue de gestion complète des commandes est prête à être étendue à partir des mêmes données Supabase.",
              <ShoppingCart />,
            )
          ) : section === "merchants" ? (
            renderSimpleSection(
              "Commerces",
              "Les commerces sont encore partiellement issus de data.ts dans le projet. Cette section évite d’inventer des informations qui ne sont pas encore migrées.",
              <Store />,
            )
          ) : section === "drivers" ? (
            renderSimpleSection(
              "Livreurs",
              "Les profils livreurs réels sont visibles depuis les données profiles et les commandes assignées.",
              <Bike />,
            )
          ) : section === "catalog" ? (
            renderSimpleSection(
              "Catalogue",
              "Le catalogue produit client est déjà synchronisé avec Supabase. La console admin peut maintenant partager cette même source.",
              <PackageCheck />,
            )
          ) : section === "payments" ? (
            renderSimpleSection(
              "Paiements",
              "Cette section est isolée afin de conserver les contrôles financiers déjà existants sans créer de chiffres artificiels.",
              <CircleDollarSign />,
            )
          ) : section === "reports" ? (
            renderSimpleSection(
              "Réclamations",
              "Les signalements de compte utilisent admin_requests. Les workflows de ticketing pourront être ajoutés sur cette base.",
              <ShieldAlert />,
            )
          ) : section === "analytics" ? (
            renderSimpleSection(
              "Analytics",
              "Les graphiques de synthèse sont déjà présentés sur le tableau de bord principal.",
              <BarChart3 />,
            )
          ) : (
            renderSimpleSection(
              "Paramètres",
              "Paramètres d’administration à connecter aux préférences et règles métier RUBIGO.",
              <Settings />,
            )
          )}
        </div>
      </main>
    </div>
  );
}

function KpiCard({
  icon,
  value,
  label,
  trend,
  accent = "green",
  wide = false,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend: string;
  accent?: string;
  wide?: boolean;
}) {
  return (
    <article className={`admin-kpi-card ${accent} ${wide ? "wide" : ""}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-data">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
      <div className="kpi-trend">
        <ArrowUpRight size={13} />
        <strong>{trend}</strong>
        <span>vs hier</span>
      </div>
    </article>
  );
}

function PanelHeader({
  icon,
  title,
  action,
  badge,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  action?: string;
  badge?: number;
  onAction?: () => void;
}) {
  return (
    <div className="panel-header">
      <div>
        <span className="panel-icon">{icon}</span>
        <h2>{title}</h2>
      </div>

      {badge !== undefined ? (
        <span className="panel-badge">{badge}</span>
      ) : null}

      {action ? (
        <button type="button" className="panel-action" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </div>
  );
}

function LegendRow({
  color,
  label,
  value,
  total,
}: {
  color: string;
  label: string;
  value: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="legend-row">
      <span className="legend-marker" style={{ background: color }} />
      <span>{label}</span>
      <strong>{percent}%</strong>
      <small>{value}</small>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <strong>Chargement des données administrateur…</strong>
      <span>Connexion à Supabase.</span>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="admin-empty-state">
      <div>{icon}</div>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function relativeTime(value?: string) {
  if (!value) return "—";
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "à l’instant";
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusTone(status: string) {
  if (status === "delivered") return "success";
  if (status === "cancelled" || status === "merchant_rejected") return "danger";
  if (
    status === "delivering" ||
    status === "driver_assigned" ||
    status === "picked_up"
  ) {
    return "info";
  }
  return "warning";
}

function requestTone(type: string) {
  if (type === "driver_application") return "blue";
  if (type === "merchant_application") return "orange";
  if (type === "account_report") return "red";
  return "slate";
}

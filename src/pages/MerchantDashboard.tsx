import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Home,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  X,
  ArrowLeft,
  ArrowUpRight,
  Trash2,
  LogOut,
  WalletCards,
} from "lucide-react";
import { merchants } from "../data";
import { useApp } from "../context/AppContext";
import { orderService } from "../services/orderService";
import { merchantService } from "../services/merchantService";
import type { Order, OrderStatus, Product } from "../types";
import { formatCurrency } from "../utils/formatCurrency";
import "./MerchantDashboard.css";

type MerchantTab = "home" | "orders" | "catalog" | "account";
type Filter = "all" | "pending" | "active" | "history";
type CatalogFilter = "all" | "available" | "unavailable";

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
};

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  category: "",
  available: true,
};

type AvailableDriver = {
  id: string;
  name: string;
  initials: string;
  phone?: string;
  city?: string;
};

const ACTIVE: OrderStatus[] = [
  "accepted",
  "preparing",
  "ready",
  "driver_assigned",
  "picked_up",
  "delivering",
];

const HISTORY: OrderStatus[] = ["delivered", "cancelled", "merchant_rejected"];

const LABELS: Record<OrderStatus, string> = {
  pending: "À traiter",
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

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "pending",
  accepted: "accepted",
  preparing: "preparing",
  ready: "ready",
  driver_assigned: "ready",
  picked_up: "ready",
  delivering: "ready",
  delivered: "delivered",
  cancelled: "danger",
  merchant_rejected: "danger",
};

function nextAction(status: OrderStatus) {
  if (status === "pending")
    return { status: "accepted" as OrderStatus, label: "Accepter" };
  if (status === "accepted")
    return { status: "preparing" as OrderStatus, label: "Préparer" };
  if (status === "preparing")
    return { status: "ready" as OrderStatus, label: "Commande prête" };
  return null;
}

function formatNotificationDate(date?: string) {
  if (!date) return "À l'instant";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "À l'instant";
  return value.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MerchantDashboard({
  onReturnToCustomer,
}: {
  onReturnToCustomer: () => void;
}) {
  const {
    user,
    merchantOrders,
    merchantOrdersLoading,
    updateMerchantOrderStatus,
    unreadNotifications,
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateProfile,
    logout,
  } = useApp();

  const [tab, setTab] = useState<MerchantTab>("home");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);
  const [assigningDriverId, setAssigningDriverId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<AvailableDriver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsName, setSettingsName] = useState(user.name ?? "");
  const [settingsPhone, setSettingsPhone] = useState(user.phone ?? "");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");

  const [catalog, setCatalog] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("all");

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [productFormError, setProductFormError] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const merchantLocalId = user.merchantLocalId;

  useEffect(() => {
    if (!merchantLocalId) {
      setCatalog([]);
      setCatalogLoading(false);
      return;
    }
    let isMounted = true;
    setCatalogLoading(true);
    merchantService.fetchMerchantProducts(merchantLocalId).then((result) => {
      if (isMounted) {
        setCatalog(result);
        setCatalogLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [merchantLocalId]);

  const visibleCatalog = catalog
    .filter((product) =>
      catalogFilter === "all"
        ? true
        : catalogFilter === "available"
          ? product.available
          : !product.available,
    )
    .filter((product) =>
      catalogQuery.trim()
        ? product.name.toLowerCase().includes(catalogQuery.trim().toLowerCase())
        : true,
    );

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    setProductFormError("");
    setImageFile(null);
    setImagePreview(undefined);
    setProductModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      available: product.available,
    });
    setProductFormError("");
    setImageFile(null);
    setImagePreview(product.image);
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    if (savingProduct || uploadingImage) return;
    setProductModalOpen(false);
  };

  const handleImagePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProductFormError("Image trop lourde (5 Mo maximum).");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setProductFormError("Format d'image non pris en charge.");
      return;
    }
    setProductFormError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImagePreview = async () => {
    if (editingProduct?.image) {
      const path = editingProduct.image.split(`/product-images/`)[1];
      if (path) await merchantService.deleteMerchantProductImage(editingProduct.id, path);
    }
    setImageFile(null);
    setImagePreview(undefined);
  };

  const saveProduct = async () => {
    const name = productForm.name.trim();
    const priceValue = Number(productForm.price);

    if (!name) {
      setProductFormError("Le nom du produit est obligatoire.");
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setProductFormError("Le prix doit être supérieur à 0.");
      return;
    }
    if (!merchantLocalId) {
      setProductFormError("Compte commerçant introuvable.");
      return;
    }

    setSavingProduct(true);
    setProductFormError("");

    const payload = {
      name,
      description: productForm.description.trim(),
      price: Math.round(priceValue),
      category: productForm.category.trim(),
      available: productForm.available,
    };

    const result = editingProduct
      ? await merchantService.updateMerchantProduct(editingProduct.id, payload)
      : await merchantService.createMerchantProduct(merchantLocalId, payload);

    if (!result.product) {
      setSavingProduct(false);
      setProductFormError(
        result.error ?? (editingProduct ? "Impossible de modifier le produit." : "Impossible d'ajouter le produit."),
      );
      return;
    }

    let finalProduct = result.product;

    if (imageFile) {
      setUploadingImage(true);
      const uploadResult = await merchantService.uploadMerchantProductImage(
        merchantLocalId,
        finalProduct.id,
        imageFile,
      );
      setUploadingImage(false);
      if (uploadResult.error) {
        setProductFormError(uploadResult.error);
      } else if (uploadResult.imageUrl) {
        finalProduct = { ...finalProduct, image: uploadResult.imageUrl };
      }
    }

    setCatalog((current) => {
      const exists = current.some((item) => item.id === finalProduct.id);
      return exists
        ? current.map((item) => (item.id === finalProduct.id ? finalProduct : item))
        : [finalProduct, ...current];
    });

    setSavingProduct(false);
    setProductModalOpen(false);
  };

  const toggleAvailability = async (product: Product) => {
    setTogglingId(product.id);
    const result = await merchantService.toggleMerchantProductAvailability(product.id, !product.available);
    setTogglingId(null);
    if (result.product) {
      setCatalog((current) =>
        current.map((item) => (item.id === product.id ? result.product! : item)),
      );
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeletingProduct(true);
    const success = await merchantService.deleteMerchantProduct(deleteTarget.id);
    setDeletingProduct(false);
    if (success) {
      setCatalog((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const merchant = merchants.find((m) => m.id === user.merchantLocalId);

  const pending = merchantOrders.filter((o) => o.status === "pending");
  const active = merchantOrders.filter((o) => ACTIVE.includes(o.status));
  const delivered = merchantOrders.filter((o) => o.status === "delivered");
  const revenue = delivered.reduce(
    (sum, o) => sum + (o.subtotal ?? o.total),
    0,
  );
  const deliveredCount = delivered.length;

  const recentOrders = useMemo(
    () =>
      [...merchantOrders]
        .sort(
          (a, b) =>
            +new Date(b.createdAt ?? b.date) - +new Date(a.createdAt ?? a.date),
        )
        .slice(0, 6),
    [merchantOrders],
  );

  const visibleOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return merchantOrders.filter((o) => {
      const matchesQuery =
        !q ||
        `${o.orderNumber ?? ""} ${o.deliveryAddress ?? ""} ${o.items.map((i) => i.name).join(" ")}`
          .toLowerCase()
          .includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && o.status === "pending") ||
        (filter === "active" && ACTIVE.includes(o.status)) ||
        (filter === "history" && HISTORY.includes(o.status));
      return matchesQuery && matchesFilter;
    });
  }, [merchantOrders, query, filter]);

  useEffect(() => {
    setSettingsName(user.name ?? "");
    setSettingsPhone(user.phone ?? "");
  }, [user.name, user.phone]);

  useEffect(() => {
    if (!selected || selected.status !== "ready" || selected.driverId) {
      setDrivers([]);
      return;
    }

    let cancelled = false;
    const loadDrivers = async () => {
      setDriversLoading(true);
      setError("");
      try {
        const result = await orderService.fetchAvailableDeliveryDrivers();
        if (!cancelled) setDrivers(result);
      } catch {
        if (!cancelled)
          setError("Impossible de charger les livreurs disponibles.");
      } finally {
        if (!cancelled) setDriversLoading(false);
      }
    };

    void loadDrivers();
    return () => {
      cancelled = true;
    };
  }, [selected?.id, selected?.status, selected?.driverId]);

  const openOrder = (order: Order) => {
    setError("");
    setSelected(order);
  };

  const runAction = async (orderId: string, status: OrderStatus) => {
    setError("");
    setActingId(orderId);
    try {
      const ok = await updateMerchantOrderStatus(orderId, status);
      if (!ok) {
        setError(
          "La commande n'a pas pu être mise à jour. Vérifiez la session commerçant et la connexion.",
        );
        return;
      }
      setSelected((current) =>
        current?.id === orderId ? { ...current, status } : current,
      );
    } catch {
      setError("Une erreur est survenue pendant la mise à jour.");
    } finally {
      setActingId(null);
    }
  };

  const assignDriver = async (orderId: string, driver: AvailableDriver) => {
    if (assigningDriverId || selected?.id !== orderId) return;
    setError("");
    setAssigningDriverId(driver.id);

    try {
      const result = await orderService.assignOrderDriver(orderId, driver.id);
      if (!result.ok) {
        const messages: Record<string, string> = {
          not_authorized: "Vous n'êtes pas autorisé à affecter cette commande.",
          order_not_found: "Commande introuvable.",
          invalid_status: "Cette commande n'est plus prête à être affectée.",
          driver_not_found: "Ce livreur n'est plus disponible.",
          driver_busy: "Ce livreur vient d'être affecté à une autre course.",
        };
        setError(
          messages[result.error ?? ""] ?? "L'affectation du livreur a échoué.",
        );
        return;
      }

      setSelected((current) =>
        current?.id === orderId
          ? {
              ...current,
              status: "driver_assigned",
              driverId: driver.id,
              driver: { name: driver.name, initials: driver.initials, eta: "" },
            }
          : current,
      );
      setDrivers((current) => current.filter((item) => item.id !== driver.id));
    } catch {
      setError("Impossible d'affecter le livreur pour le moment.");
    } finally {
      setAssigningDriverId(null);
    }
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    setSettingsMessage("");
    const result = await updateProfile(
      settingsName.trim(),
      settingsPhone.trim(),
    );
    setSettingsSaving(false);
    setSettingsMessage(
      result.ok
        ? "Profil enregistré."
        : (result.message ?? "Impossible d'enregistrer."),
    );
  };

  const openNotification = (notification: (typeof notifications)[number]) => {
    markAsRead(notification.id);
    setNotificationsOpen(false);
    if (notification.orderId) {
      const order = merchantOrders.find(
        (item) => item.id === notification.orderId,
      );
      if (order) {
        setTab("orders");
        setSelected(order);
      }
    }
  };

  if (!user.merchantLocalId) {
    return (
      <div className="merchant-dashboard merchant-empty-page">
        <section className="merchant-empty">
          <Store size={24} />
          <p className="merchant-kicker">ESPACE COMMERÇANT</p>
          <h1>Compte non relié à un commerce</h1>
          <p>
            Contactez le support RUBIGO pour associer ce compte à un commerce.
          </p>
          <button className="solid-light-button" onClick={onReturnToCustomer}>
            Revenir au client
          </button>
        </section>
      </div>
    );
  }

  const displayName = merchant?.name ?? "Votre commerce";

  return (
    <div className="merchant-dashboard">
      <section className="merchant-hero">
        <div className="merchant-hero-top">
          <div className="merchant-brand-mini">
            <span className="brand-mark">R</span>
            RUBIGO
          </div>
          <button
            className="merchant-bell"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen((value) => !value)}
          >
            <Bell size={19} />
            {unreadNotifications > 0 ? (
              <span>
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            ) : null}
          </button>
        </div>

        <div className="merchant-hello">
          <p>ESPACE COMMERÇANT</p>
          <h1>Bonjour {user.name || "Commerçant"} 👋</h1>
          <span>{displayName} · Adzopé</span>
        </div>

        <div className="merchant-balance">
          <div>
            <span>Chiffre d’affaires livré</span>
            <strong>{formatCurrency(revenue)}</strong>
          </div>
          <div className="merchant-balance-stat">
            <span>Commandes livrées</span>
            <strong>{deliveredCount}</strong>
            <small>activité réelle</small>
          </div>
        </div>

        <div className="merchant-quick-grid">
          <button
            onClick={() => {
              setTab("orders");
              setFilter("pending");
            }}
          >
            <span className="quick-icon">
              <Clock3 size={18} />
            </span>
            <strong>{pending.length}</strong>
            <small>À traiter</small>
          </button>
          <button
            onClick={() => {
              setTab("orders");
              setFilter("active");
            }}
          >
            <span className="quick-icon">
              <Truck size={18} />
            </span>
            <strong>{active.length}</strong>
            <small>En cours</small>
          </button>
          <button onClick={() => setTab("catalog")}>
            <span className="quick-icon">
              <Package size={18} />
            </span>
            <strong>{catalog.length}</strong>
            <small>Produits</small>
          </button>
        </div>
      </section>

      <main className="merchant-content">
        {tab === "home" && (
          <>
            <section className="merchant-section-head">
              <div>
                <span className="merchant-kicker">ACTIVITÉ RÉCENTE</span>
                <h2>Vos commandes</h2>
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setTab("orders");
                  setFilter("all");
                }}
              >
                Voir tout <ChevronRight size={16} />
              </button>
            </section>

            {error ? <div className="merchant-error">{error}</div> : null}

            {merchantOrdersLoading ? (
              <div className="merchant-loading">
                <Loader2 className="spin" size={21} /> Chargement…
              </div>
            ) : recentOrders.length ? (
              <div className="merchant-activity-list">
                {recentOrders.map((order) => (
                  <button
                    key={order.id}
                    className="activity-row"
                    onClick={() => openOrder(order)}
                  >
                    <span className="activity-icon">
                      {order.status === "delivered" ? (
                        <Check size={17} />
                      ) : (
                        <Truck size={17} />
                      )}
                    </span>
                    <span className="activity-copy">
                      <strong>{order.orderNumber ?? "Commande"}</strong>
                      <small>
                        {LABELS[order.status]} · {formatCurrency(order.total)}
                      </small>
                    </span>
                    <span className="activity-right">
                      <small>{order.items.length} art.</small>
                      <ChevronRight size={16} />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="merchant-empty-card">
                <Check size={18} />
                <strong>Aucune commande</strong>
                <span>Les commandes de votre commerce apparaîtront ici.</span>
              </div>
            )}

            <section className="merchant-section-head merchant-space-top">
              <div>
                <span className="merchant-kicker">ACCÈS RAPIDES</span>
                <h2>Gérer le commerce</h2>
              </div>
            </section>

            <div className="merchant-action-grid">
              <button
                onClick={() => {
                  setTab("orders");
                  setFilter("pending");
                }}
              >
                <span>
                  <ShoppingBag size={18} />
                </span>
                <strong>Commandes à traiter</strong>
                <small>{pending.length} en attente</small>
                <ArrowUpRight size={15} />
              </button>
              <button onClick={() => setTab("catalog")}>
                <span>
                  <BookOpen size={18} />
                </span>
                <strong>Catalogue</strong>
                <small>{catalog.length} produits</small>
                <ArrowUpRight size={15} />
              </button>
              <button onClick={() => setSettingsOpen(true)}>
                <span>
                  <Settings size={18} />
                </span>
                <strong>Paramètres</strong>
                <small>Compte commerçant</small>
                <ArrowUpRight size={15} />
              </button>
            </div>

            <section className="merchant-section-head merchant-space-top">
              <div>
                <span className="merchant-kicker">CATALOGUE</span>
                <h2>Vos produits</h2>
              </div>
              <button className="text-button" onClick={() => setTab("catalog")}>
                Tout voir <ChevronRight size={16} />
              </button>
            </section>

            <div className="merchant-product-strip">
              {catalog.slice(0, 4).map((product) => (
                <article key={product.id} className="merchant-product-card">
                  <div className="merchant-product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <ShoppingBag size={20} />
                    )}
                  </div>
                  <strong>{product.name}</strong>
                  <span>{formatCurrency(product.price)}</span>
                </article>
              ))}
            </div>
          </>
        )}

        {tab === "orders" && (
          <section>
            <section className="merchant-section-head">
              <div>
                <span className="merchant-kicker">CENTRE DES COMMANDES</span>
                <h2>Vos commandes</h2>
              </div>
              <span className="merchant-count-pill">
                {merchantOrders.length}
              </span>
            </section>

            {error ? <div className="merchant-error">{error}</div> : null}

            <label className="merchant-search">
              <Search size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une commande…"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Effacer la recherche"
                >
                  <X size={15} />
                </button>
              ) : null}
            </label>

            <div className="merchant-filters">
              {(["all", "pending", "active", "history"] as Filter[]).map(
                (item) => (
                  <button
                    key={item}
                    className={filter === item ? "active" : ""}
                    onClick={() => setFilter(item)}
                  >
                    {item === "all"
                      ? "Toutes"
                      : item === "pending"
                        ? "À traiter"
                        : item === "active"
                          ? "En cours"
                          : "Historique"}
                  </button>
                ),
              )}
            </div>

            <div className="merchant-order-feed">
              {merchantOrdersLoading ? (
                <div className="merchant-loading">
                  <Loader2 className="spin" size={21} /> Chargement…
                </div>
              ) : visibleOrders.length ? (
                visibleOrders.map((order) => {
                  const next = nextAction(order.status);
                  const isBusy = actingId === order.id;
                  return (
                    <article key={order.id} className="merchant-order-card">
                      <div className="order-card-top">
                        <span
                          className={`order-status ${STATUS_CLASS[order.status]}`}
                        >
                          {LABELS[order.status]}
                        </span>
                        <span className="order-number">
                          #{order.orderNumber ?? order.id.slice(0, 8)}
                        </span>
                      </div>
                      <button
                        className="order-card-body-button"
                        onClick={() => openOrder(order)}
                        aria-label={`Ouvrir ${order.orderNumber ?? "la commande"}`}
                      >
                        <div className="order-card-main">
                          <div>
                            <h3>{order.items.length} article(s)</h3>
                            <p>
                              {order.deliveryAddress ??
                                "Adresse non renseignée"}
                            </p>
                          </div>
                          <strong>{formatCurrency(order.total)}</strong>
                        </div>
                      </button>
                      <div className="order-card-actions">
                        <button
                          className="secondary-action"
                          onClick={() => openOrder(order)}
                        >
                          Détails
                        </button>
                        {order.status === "pending" ? (
                          <button
                            className="danger-action"
                            disabled={isBusy}
                            onClick={() =>
                              runAction(order.id, "merchant_rejected")
                            }
                          >
                            Refuser
                          </button>
                        ) : null}
                        {next ? (
                          <button
                            className="primary-action"
                            disabled={isBusy}
                            onClick={() => runAction(order.id, next.status)}
                          >
                            {isBusy ? (
                              <Loader2 className="spin" size={14} />
                            ) : (
                              <Check size={14} />
                            )}
                            {isBusy ? "Mise à jour…" : next.label}
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="merchant-empty-card">
                  <Search size={18} />
                  <strong>Aucune commande</strong>
                  <span>Aucun résultat pour ce filtre.</span>
                </div>
              )}
            </div>
          </section>
        )}

        {tab === "catalog" && (
          <section>
            <section className="merchant-section-head">
              <div>
                <span className="merchant-kicker">CATALOGUE</span>
                <h2>{catalog.length} produits</h2>
              </div>
              <button type="button" className="catalog-add-button" onClick={openAddProduct}>
                <Plus size={16} />
                <span>Ajouter</span>
              </button>
            </section>

            <div className="catalog-toolbar">
              <div className="catalog-search">
                <Search size={16} />
                <input
                  value={catalogQuery}
                  onChange={(event) => setCatalogQuery(event.target.value)}
                  placeholder="Rechercher un produit"
                />
              </div>
              <div className="catalog-filter-chips">
                {(
                  [
                    ["all", "Tous"],
                    ["available", "Disponibles"],
                    ["unavailable", "Indisponibles"],
                  ] as [CatalogFilter, string][]
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={catalogFilter === value ? "active" : ""}
                    onClick={() => setCatalogFilter(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {catalogLoading ? (
              <div className="catalog-empty">
                <Loader2 size={20} className="spin" />
                <strong>Chargement du catalogue…</strong>
              </div>
            ) : !merchantLocalId ? (
              <div className="catalog-empty">
                <ShoppingBag size={22} />
                <strong>Compte commerçant non lié</strong>
                <p>Aucun commerce n'est associé à ce compte.</p>
              </div>
            ) : visibleCatalog.length ? (
              <div className="catalog-grid">
                {visibleCatalog.map((product) => (
                  <article key={product.id} className="catalog-card">
                    <div className="catalog-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <ShoppingBag size={24} />
                      )}
                      <button
                        type="button"
                        className={`availability-toggle ${product.available ? "available" : "unavailable"}`}
                        onClick={() => toggleAvailability(product)}
                        disabled={togglingId === product.id}
                      >
                        {togglingId === product.id
                          ? "…"
                          : product.available
                            ? "Disponible"
                            : "Indisponible"}
                      </button>
                    </div>
                    <div className="catalog-copy">
                      {product.category ? <small>{product.category}</small> : null}
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <strong>{formatCurrency(product.price)}</strong>
                    </div>
                    <div className="catalog-card-actions">
                      <button type="button" onClick={() => openEditProduct(product)}>
                        <Pencil size={14} />
                        <span>Modifier</span>
                      </button>
                      <button type="button" className="danger" onClick={() => setDeleteTarget(product)}>
                        <Trash2 size={14} />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <ShoppingBag size={22} />
                <strong>Aucun produit</strong>
                <p>Ajoutez votre premier produit pour commencer.</p>
              </div>
            )}
          </section>
        )}

        {tab === "account" && (
          <section>
            <section className="merchant-section-head">
              <div>
                <span className="merchant-kicker">COMPTE</span>
                <h2>{displayName}</h2>
              </div>
              <UserRound size={20} />
            </section>
            <div className="merchant-account-card">
              <div className="account-avatar">
                <Store size={22} />
              </div>
              <div>
                <strong>{user.name || "Compte commerçant"}</strong>
                <span>{user.phone || "Compte RUBIGO"}</span>
                <small>{displayName}</small>
              </div>
            </div>
            <button
              className="account-row"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings size={18} />
              <span>Paramètres du compte</span>
              <ChevronRight size={16} />
            </button>
            <button className="account-row" onClick={onReturnToCustomer}>
              <Home size={18} />
              <span>Revenir à l’espace client</span>
              <ChevronRight size={16} />
            </button>
            <button
              className="account-row account-row-danger"
              onClick={() => void logout()}
            >
              <LogOut size={18} />
              <span>Se déconnecter</span>
              <ChevronRight size={16} />
            </button>
          </section>
        )}
      </main>

      <nav className="merchant-bottom-nav" aria-label="Navigation commerçant">
        <button
          className={tab === "home" ? "active" : ""}
          onClick={() => setTab("home")}
        >
          <Home size={20} />
          <span>Accueil</span>
        </button>
        <button
          className={tab === "orders" ? "active" : ""}
          onClick={() => {
            setTab("orders");
            setFilter("all");
          }}
        >
          <ShoppingBag size={20} />
          <span>Commandes</span>
          {pending.length ? <b>{pending.length}</b> : null}
        </button>
        <button
          className="merchant-nav-center"
          onClick={() => {
            setTab("orders");
            setFilter("pending");
          }}
          aria-label="Ouvrir les commandes à traiter"
        >
          <span>
            <WalletCards size={22} />
          </span>
        </button>
        <button
          className={tab === "catalog" ? "active" : ""}
          onClick={() => setTab("catalog")}
        >
          <Package size={20} />
          <span>Catalogue</span>
        </button>
        <button
          className={tab === "account" ? "active" : ""}
          onClick={() => setTab("account")}
        >
          <UserRound size={20} />
          <span>Compte</span>
        </button>
      </nav>

      {notificationsOpen ? (
        <div
          className="merchant-overlay merchant-overlay-top"
          onMouseDown={() => setNotificationsOpen(false)}
        >
          <section
            className="merchant-sheet"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header className="sheet-header">
              <div>
                <span className="merchant-kicker">CENTRE RUBIGO</span>
                <h2>Notifications</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setNotificationsOpen(false)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </header>
            <div className="sheet-actions">
              <button className="text-button" onClick={markAllAsRead}>
                Tout marquer comme lu
              </button>
            </div>
            <div className="notification-list">
              {notifications.length ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-row ${notification.read ? "read" : "unread"}`}
                  >
                    <button
                      className="notification-main"
                      onClick={() => openNotification(notification)}
                    >
                      <span className="notification-dot" />
                      <span>
                        <strong>{notification.message}</strong>
                        <small>
                          {formatNotificationDate(notification.createdAt)}
                        </small>
                      </span>
                    </button>
                    <button
                      className="notification-delete"
                      onClick={() => deleteNotification(notification.id)}
                      aria-label="Supprimer la notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="merchant-empty-card compact">
                  <Bell size={17} />
                  <span>Aucune notification.</span>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}

      {settingsOpen ? (
        <div
          className="merchant-overlay"
          onMouseDown={() => setSettingsOpen(false)}
        >
          <section
            className="merchant-modal settings-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header>
              <div>
                <span className="merchant-kicker">COMPTE</span>
                <h2>Paramètres du compte</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setSettingsOpen(false)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </header>
            <div className="settings-form">
              <label>
                Nom
                <input
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                />
              </label>
              <label>
                Téléphone
                <input
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                />
              </label>
              <button
                className="modal-primary"
                disabled={settingsSaving}
                onClick={() => void saveSettings()}
              >
                {settingsSaving ? (
                  <Loader2 className="spin" size={15} />
                ) : (
                  <Check size={15} />
                )}
                {settingsSaving ? "Enregistrement…" : "Enregistrer"}
              </button>
              {settingsMessage ? (
                <div className="settings-message">{settingsMessage}</div>
              ) : null}
              <button className="account-row" onClick={onReturnToCustomer}>
                <ArrowLeft size={18} />
                <span>Revenir à l’espace client</span>
                <ChevronRight size={16} />
              </button>
              <button
                className="account-row account-row-danger"
                onClick={() => void logout()}
              >
                <LogOut size={18} />
                <span>Se déconnecter</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selected ? (
        <div className="merchant-overlay" onMouseDown={() => setSelected(null)}>
          <section
            className="merchant-modal merchant-order-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <header>
              <div>
                <span className="merchant-kicker">COMMANDE</span>
                <h2>{selected.orderNumber}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelected(null)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </header>

            <div className="modal-status-row">
              <span className={`order-status ${STATUS_CLASS[selected.status]}`}>
                {LABELS[selected.status]}
              </span>
              <strong>{formatCurrency(selected.total)}</strong>
            </div>

            <div className="modal-section">
              <h3>Articles</h3>
              {selected.items.map((item) => (
                <div
                  className="modal-line"
                  key={`${item.productId}-${item.name}`}
                >
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <strong>
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="modal-section">
              <h3>Livraison</h3>
              <p>{selected.deliveryAddress ?? "Adresse non renseignée"}</p>
            </div>

            {selected.status === "ready" && !selected.driverId ? (
              <div className="modal-section">
                <div className="assign-header">
                  <div>
                    <h3>Choisir un livreur</h3>
                    <p>
                      Seuls les livreurs actuellement disponibles sont affichés.
                    </p>
                  </div>
                  <Truck size={18} />
                </div>

                {driversLoading ? (
                  <div className="driver-loading">
                    <Loader2 className="spin" size={18} /> Recherche des
                    livreurs…
                  </div>
                ) : drivers.length ? (
                  <div className="driver-list">
                    {drivers.map((driver) => {
                      const busy = assigningDriverId === driver.id;
                      return (
                        <div key={driver.id} className="driver-row">
                          <div className="driver-avatar">{driver.initials}</div>
                          <div className="driver-copy">
                            <strong>{driver.name}</strong>
                            <span>
                              {driver.city || "Adzopé"}
                              {driver.phone ? ` · ${driver.phone}` : ""}
                            </span>
                          </div>
                          <button
                            className="driver-assign"
                            disabled={Boolean(assigningDriverId)}
                            onClick={() =>
                              void assignDriver(selected.id, driver)
                            }
                          >
                            {busy ? (
                              <Loader2 className="spin" size={14} />
                            ) : (
                              <Check size={14} />
                            )}
                            {busy ? "Assignation…" : "Assigner"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="merchant-empty-card compact">
                    <Truck size={17} />
                    <span>Aucun livreur disponible pour le moment.</span>
                  </div>
                )}
              </div>
            ) : null}

            {selected.driver ? (
              <div className="assigned-driver-card">
                <span className="assigned-driver-icon">
                  <Truck size={18} />
                </span>
                <div>
                  <small>LIVREUR ASSIGNÉ</small>
                  <strong>{selected.driver.name}</strong>
                  <span>{LABELS[selected.status]}</span>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="merchant-error modal-error">{error}</div>
            ) : null}

            {nextAction(selected.status) ? (
              <button
                className="modal-primary"
                disabled={actingId === selected.id}
                onClick={() =>
                  void runAction(
                    selected.id,
                    nextAction(selected.status)!.status,
                  )
                }
              >
                {actingId === selected.id ? (
                  <Loader2 className="spin" size={15} />
                ) : (
                  <Check size={15} />
                )}
                {actingId === selected.id
                  ? "Mise à jour…"
                  : nextAction(selected.status)!.label}
              </button>
            ) : null}
          </section>
        </div>
      ) : null}

      {productModalOpen ? (
        <div className="modal-overlay" onClick={closeProductModal}>
          <section className="modal-sheet product-form-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <span className="merchant-kicker">
                  {editingProduct ? "MODIFIER" : "AJOUTER"}
                </span>
                <h2>{editingProduct ? "Modifier le produit" : "Nouveau produit"}</h2>
              </div>
              <button className="modal-close" onClick={closeProductModal} aria-label="Fermer">
                <X size={18} />
              </button>
            </header>

            <div className="product-form-image">
              {imagePreview ? (
                <img src={imagePreview} alt="" />
              ) : (
                <div className="product-form-image-placeholder">
                  <ShoppingBag size={26} />
                </div>
              )}
              <div className="product-form-image-actions">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                  {imagePreview ? "Remplacer l'image" : "Ajouter une image"}
                </button>
                {imagePreview ? (
                  <button type="button" className="danger" onClick={removeImagePreview} disabled={uploadingImage}>
                    Supprimer l'image
                  </button>
                ) : null}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImagePick}
              />
            </div>

            <label className="product-form-field">
              Nom du produit *
              <input
                value={productForm.name}
                onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ex. Riz sauce graine"
                disabled={savingProduct}
              />
            </label>

            <label className="product-form-field">
              Description *
              <textarea
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Décrivez le produit"
                rows={3}
                disabled={savingProduct}
              />
            </label>

            <div className="product-form-row">
              <label className="product-form-field">
                Prix (FCFA) *
                <input
                  type="number"
                  min={0}
                  value={productForm.price}
                  onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                  placeholder="0"
                  disabled={savingProduct}
                />
              </label>

              <label className="product-form-field">
                Catégorie
                <input
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="Ex. Plats, Boissons"
                  disabled={savingProduct}
                />
              </label>
            </div>

            <label className="product-form-availability">
              <span>Disponibilité</span>
              <button
                type="button"
                className={`availability-switch ${productForm.available ? "on" : "off"}`}
                onClick={() =>
                  setProductForm((current) => ({ ...current, available: !current.available }))
                }
                disabled={savingProduct}
              >
                <span className="availability-switch-dot" />
                {productForm.available ? "Disponible" : "Indisponible"}
              </button>
            </label>

            {productFormError ? <div className="merchant-error modal-error">{productFormError}</div> : null}

            <div className="product-form-actions">
              <button type="button" onClick={closeProductModal} disabled={savingProduct}>
                Annuler
              </button>
              <button
                type="button"
                className="modal-primary"
                onClick={saveProduct}
                disabled={savingProduct || uploadingImage}
              >
                {savingProduct || uploadingImage ? (
                  <Loader2 className="spin" size={15} />
                ) : null}
                {uploadingImage
                  ? "Envoi de l'image…"
                  : savingProduct
                    ? editingProduct
                      ? "Enregistrement…"
                      : "Ajout en cours…"
                    : editingProduct
                      ? "Enregistrer les modifications"
                      : "Ajouter le produit"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="modal-overlay" onClick={() => (deletingProduct ? null : setDeleteTarget(null))}>
          <section className="modal-sheet confirm-sheet" onClick={(event) => event.stopPropagation()}>
            <h2>Supprimer ce produit ?</h2>
            <p>
              « {deleteTarget.name} » sera définitivement supprimé de votre catalogue.
            </p>
            <div className="product-form-actions">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={deletingProduct}>
                Annuler
              </button>
              <button
                type="button"
                className="modal-primary danger"
                onClick={confirmDeleteProduct}
                disabled={deletingProduct}
              >
                {deletingProduct ? <Loader2 className="spin" size={15} /> : <Trash2 size={15} />}
                {deletingProduct ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

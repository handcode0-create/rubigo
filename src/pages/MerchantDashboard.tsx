import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  Home,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  UserRound,
  X,
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

type AvailableDriver = {
  id: string;
  name: string;
  initials: string;
  phone?: string;
  city?: string;
};

const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  category: "",
  available: true,
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

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  preparing: "En préparation",
  ready: "Prête",
  driver_assigned: "Livreur assigné",
  picked_up: "Récupérée",
  delivering: "En cours",
  delivered: "Livrée",
  cancelled: "Annulée",
  merchant_rejected: "Refusée",
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "status-amber",
  accepted: "status-amber",
  preparing: "status-amber",
  ready: "status-green",
  driver_assigned: "status-orange",
  picked_up: "status-orange",
  delivering: "status-orange",
  delivered: "status-green",
  cancelled: "status-red",
  merchant_rejected: "status-red",
};

function isSameDay(value?: string, reference = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

function isSameMonth(value?: string, reference = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

function nextAction(status: OrderStatus) {
  if (status === "pending")
    return { status: "accepted" as OrderStatus, label: "Accepter" };
  if (status === "accepted")
    return { status: "preparing" as OrderStatus, label: "Préparer" };
  if (status === "preparing")
    return { status: "ready" as OrderStatus, label: "Commande prête" };
  return null;
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
    updateProfile,
    logout,
  } = useApp();

  const merchantLocalId = user.merchantLocalId;
  const merchant = merchants.find((item) => item.id === merchantLocalId);
  const merchantImage = (
    merchant as (typeof merchant & { image?: string }) | undefined
  )?.image;

  const [tab, setTab] = useState<MerchantTab>("home");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("all");
  const [actingId, setActingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [drivers, setDrivers] = useState<AvailableDriver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [assigningDriverId, setAssigningDriverId] = useState<string | null>(
    null,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsName, setSettingsName] = useState(user.name ?? "");
  const [settingsPhone, setSettingsPhone] = useState(user.phone ?? "");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] =
    useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [productFormError, setProductFormError] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!merchantLocalId) {
      setCatalog([]);
      setCatalogLoading(false);
      return;
    }
    let mounted = true;
    setCatalogLoading(true);
    void merchantService
      .fetchMerchantProducts(merchantLocalId)
      .then((result) => {
        if (!mounted) return;
        setCatalog(result);
        setCatalogLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [merchantLocalId]);

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
    setDriversLoading(true);
    void orderService
      .fetchAvailableDeliveryDrivers()
      .then((result) => {
        if (!cancelled) setDrivers(result);
      })
      .catch(() => {
        if (!cancelled)
          setError("Impossible de charger les livreurs disponibles.");
      })
      .finally(() => {
        if (!cancelled) setDriversLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.id, selected?.status, selected?.driverId]);

  const pending = merchantOrders.filter((order) => order.status === "pending");
  const active = merchantOrders.filter((order) =>
    ACTIVE.includes(order.status),
  );
  const delivered = merchantOrders.filter(
    (order) => order.status === "delivered",
  );
  const revenue = delivered.reduce(
    (sum, order) => sum + (order.subtotal ?? order.total),
    0,
  );
  const deliveredToday = delivered.filter((order) =>
    isSameDay(order.tracking?.deliveredAt ?? order.createdAt),
  ).length;
  const now = new Date();
  const revenueThisMonth = delivered
    .filter((order) =>
      isSameMonth(order.tracking?.deliveredAt ?? order.createdAt, now),
    )
    .reduce((sum, order) => sum + (order.subtotal ?? order.total), 0);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const revenueLastMonth = delivered
    .filter((order) =>
      isSameMonth(order.tracking?.deliveredAt ?? order.createdAt, lastMonth),
    )
    .reduce((sum, order) => sum + (order.subtotal ?? order.total), 0);
  const revenueTrend =
    revenueLastMonth > 0
      ? `${revenueThisMonth >= revenueLastMonth ? "+" : ""}${Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)}% ce mois`
      : revenueThisMonth > 0
        ? "Nouveau ce mois-ci"
        : null;
  const todayOrders = merchantOrders.filter((order) =>
    isSameDay(order.createdAt),
  );
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

  const recentOrders = useMemo(
    () =>
      [...merchantOrders]
        .sort(
          (a, b) =>
            +new Date(b.createdAt ?? b.date) - +new Date(a.createdAt ?? a.date),
        )
        .slice(0, 4),
    [merchantOrders],
  );

  const visibleOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return merchantOrders.filter((order) => {
      const matchesQuery =
        !normalized ||
        `${order.orderNumber ?? ""} ${order.deliveryAddress ?? ""} ${order.items.map((item) => item.name).join(" ")}`
          .toLowerCase()
          .includes(normalized);
      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && order.status === "pending") ||
        (filter === "active" && ACTIVE.includes(order.status)) ||
        (filter === "history" && HISTORY.includes(order.status));
      return matchesQuery && matchesFilter;
    });
  }, [merchantOrders, query, filter]);

  const visibleCatalog = catalog
    .filter((product) =>
      catalogFilter === "all"
        ? true
        : catalogFilter === "available"
          ? product.available
          : !product.available,
    )
    .filter(
      (product) =>
        !catalogQuery.trim() ||
        product.name.toLowerCase().includes(catalogQuery.trim().toLowerCase()),
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
    if (!file.type.startsWith("image/"))
      return setProductFormError("Format d'image non pris en charge.");
    if (file.size > 5 * 1024 * 1024)
      return setProductFormError("Image trop lourde (5 Mo maximum).");
    setProductFormError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImagePreview = async () => {
    if (editingProduct?.image) {
      const path = editingProduct.image.split("/product-images/")[1];
      if (path)
        await merchantService.deleteMerchantProductImage(
          editingProduct.id,
          path,
        );
    }
    setImageFile(null);
    setImagePreview(undefined);
  };

  const saveProduct = async () => {
    const name = productForm.name.trim();
    const priceValue = Number(productForm.price);
    if (!name) return setProductFormError("Le nom du produit est obligatoire.");
    if (!Number.isFinite(priceValue) || priceValue <= 0)
      return setProductFormError("Le prix doit être supérieur à 0.");
    if (!merchantLocalId)
      return setProductFormError("Compte commerçant introuvable.");

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
        result.error ?? "Impossible d'enregistrer le produit.",
      );
      return;
    }

    let finalProduct = result.product;
    if (imageFile) {
      setUploadingImage(true);
      const upload = await merchantService.uploadMerchantProductImage(
        merchantLocalId,
        finalProduct.id,
        imageFile,
      );
      setUploadingImage(false);
      if (upload.error) setProductFormError(upload.error);
      else if (upload.imageUrl)
        finalProduct = { ...finalProduct, image: upload.imageUrl };
    }

    setCatalog((current) =>
      current.some((item) => item.id === finalProduct.id)
        ? current.map((item) =>
            item.id === finalProduct.id ? finalProduct : item,
          )
        : [finalProduct, ...current],
    );
    setSavingProduct(false);
    setProductModalOpen(false);
  };

  const toggleAvailability = async (product: Product) => {
    setTogglingId(product.id);
    const result = await merchantService.toggleMerchantProductAvailability(
      product.id,
      !product.available,
    );
    setTogglingId(null);
    if (result.product)
      setCatalog((current) =>
        current.map((item) =>
          item.id === product.id ? result.product! : item,
        ),
      );
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    setDeletingProduct(true);
    const success = await merchantService.deleteMerchantProduct(
      deleteTarget.id,
    );
    setDeletingProduct(false);
    if (success) {
      setCatalog((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    }
  };

  const runAction = async (orderId: string, status: OrderStatus) => {
    if (actingId) return;
    setError("");
    setActingId(orderId);
    try {
      const ok = await updateMerchantOrderStatus(orderId, status);
      if (!ok) setError("La commande n'a pas pu être mise à jour.");
      else
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
    if (assigningDriverId) return;
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

  if (!merchantLocalId) {
    return (
      <div className="merchant-dashboard merchant-empty-page">
        <section className="merchant-empty">
          <Store size={24} />
          <span className="merchant-kicker">ESPACE COMMERÇANT</span>
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
      {tab === "home" ? (
        <main className="merchant-home merchant-home-first">
          <p className="merchant-slogan-line">
            Le commerce local, plus proche.
          </p>
          <section className="merchant-reference-hero">
            <div className="merchant-hero-intro">
              <span className="merchant-hero-label">ESPACE COMMERÇANT</span>
              <h1>Bonjour {user.name || "Commerçant"} 👋</h1>
              <div className="merchant-location">
                <MapPin size={19} strokeWidth={2.1} /> {displayName} · Adzopé
              </div>
              {merchant?.description ? (
                <p className="merchant-tagline">“{merchant.description}”</p>
              ) : (
                <p className="merchant-tagline">
                  “Le commerce local, plus proche.”
                </p>
              )}
            </div>

            <div className="merchant-photo-wrap">
              {merchantImage ? (
                <img src={merchantImage} alt={displayName} />
              ) : (
                <div className="merchant-photo-fallback">
                  <Store size={34} />
                </div>
              )}
              <button
                className="merchant-photo-edit"
                aria-label="Modifier les informations du commerce"
                onClick={() => setSettingsOpen(true)}
              >
                <Pencil size={21} />
              </button>
            </div>

            <div className="merchant-finance-row">
              <div className="merchant-finance-item merchant-finance-main">
                <div className="merchant-stat-icon">
                  <BarChart3 size={27} />
                </div>
                <div>
                  <span>
                    Chiffre d’affaires livré <i>i</i>
                  </span>
                  <strong>{formatCurrency(revenue)}</strong>
                  {revenueTrend ? (
                    <small>
                      <ArrowUpRight size={17} /> {revenueTrend}
                    </small>
                  ) : null}
                </div>
              </div>
              <div className="merchant-finance-divider" />
              <div className="merchant-finance-item">
                <div className="merchant-stat-icon">
                  <ShoppingBag size={27} />
                </div>
                <div>
                  <span>Commandes livrées</span>
                  <strong>{delivered.length}</strong>
                  <small className="merchant-today-pill">
                    +{deliveredToday} aujourd’hui
                  </small>
                </div>
              </div>
            </div>

            <div className="merchant-quick-grid">
              <button
                onClick={() => {
                  setTab("orders");
                  setFilter("pending");
                }}
              >
                <span className="quick-card-icon">
                  <Clock3 size={28} />
                </span>
                <b>{pending.length}</b>
                <strong>À traiter</strong>
                <small>
                  {pending.length ? `${pending.length} en attente` : "Aucune"}
                </small>
                <em className={pending.length ? "has-value" : ""}>
                  {pending.length}
                </em>
              </button>
              <button
                onClick={() => {
                  setTab("orders");
                  setFilter("active");
                }}
              >
                <span className="quick-card-icon">
                  <Truck size={28} />
                </span>
                <b>{active.length}</b>
                <strong>En cours</strong>
                <small>
                  {active.length ? `${active.length} en livraison` : "Aucune"}
                </small>
                <em className={active.length ? "has-value" : ""}>
                  {active.length}
                </em>
              </button>
              <button onClick={() => setTab("catalog")}>
                <span className="quick-card-icon">
                  <Package size={28} />
                </span>
                <b>{catalog.length}</b>
                <strong>Produits</strong>
                <small>Gérer</small>
                <em className="product-count">{catalog.length}</em>
              </button>
            </div>
          </section>

          <button
            className="merchant-today-card"
            onClick={() => {
              setTab("orders");
              setFilter("all");
            }}
          >
            <span className="today-icon">
              <BarChart3 size={27} />
            </span>
            <span className="today-copy">
              <strong>Votre activité aujourd’hui</strong>
              <small>
                {todayOrders.length} commande{todayOrders.length > 1 ? "s" : ""}{" "}
                · {formatCurrency(todayRevenue)}
              </small>
            </span>
            <span className="today-link">
              Voir les détails <ChevronRight size={20} />
            </span>
          </button>

          <section className="merchant-orders-preview">
            <div className="merchant-section-title">
              <div>
                <span>ACTIVITÉ RÉCENTE</span>
                <h2>Vos commandes</h2>
              </div>
              <button
                onClick={() => {
                  setTab("orders");
                  setFilter("all");
                }}
              >
                Voir tout <ChevronRight size={21} />
              </button>
            </div>
            {merchantOrdersLoading ? (
              <div className="merchant-state-card">
                <Loader2 className="spin" size={22} /> Chargement…
              </div>
            ) : recentOrders.length ? (
              <div className="merchant-order-list">
                {recentOrders.map((order) => (
                  <button
                    className="merchant-order-row"
                    key={order.id}
                    onClick={() => setSelected(order)}
                  >
                    <span
                      className={`order-row-icon ${STATUS_CLASS[order.status]}`}
                    >
                      {order.status === "delivered" ? (
                        <Check size={22} />
                      ) : order.status === "cancelled" ||
                        order.status === "merchant_rejected" ? (
                        <X size={22} />
                      ) : (
                        <Truck size={22} />
                      )}
                    </span>
                    <span className="order-row-main">
                      <span className="order-row-top">
                        <strong>{order.orderNumber ?? "Commande"}</strong>
                        <em className={STATUS_CLASS[order.status]}>
                          {STATUS_LABEL[order.status]}
                        </em>
                      </span>
                      <small>
                        {formatCurrency(order.total)} · {order.items.length}{" "}
                        article{order.items.length > 1 ? "s" : ""}
                      </small>
                    </span>
                    <span className="order-row-date">
                      {new Date(
                        order.createdAt ?? order.date,
                      ).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
                      <ChevronRight size={20} />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="merchant-state-card">
                <Check size={22} /> Aucune commande pour le moment.
              </div>
            )}
          </section>

          <section className="merchant-home-section">
            <div className="merchant-section-title">
              <div>
                <span>COMMANDES</span>
                <h2>À traiter maintenant</h2>
              </div>
              <button
                onClick={() => {
                  setTab("orders");
                  setFilter("pending");
                }}
              >
                Voir tout <ChevronRight size={18} />
              </button>
            </div>
            {pending.length ? (
              <div className="compact-order-list">
                {pending.slice(0, 3).map((order) => {
                  const busy = actingId === order.id;
                  return (
                    <article className="compact-order-card" key={order.id}>
                      <button
                        className="compact-order-main"
                        onClick={() => setSelected(order)}
                      >
                        <span className="compact-order-icon status-amber">
                          <Clock3 size={17} />
                        </span>
                        <span>
                          <strong>{order.orderNumber}</strong>
                          <small>
                            {order.items.length} article
                            {order.items.length > 1 ? "s" : ""} ·{" "}
                            {formatCurrency(order.total)}
                          </small>
                        </span>
                        <ChevronRight size={17} />
                      </button>
                      <div className="compact-order-actions">
                        <button
                          className="secondary-action"
                          onClick={() => setSelected(order)}
                        >
                          Voir
                        </button>
                        <button
                          className="primary-action"
                          disabled={busy}
                          onClick={() => void runAction(order.id, "accepted")}
                        >
                          {busy ? (
                            <Loader2 className="spin" size={13} />
                          ) : (
                            <Check size={13} />
                          )}
                          {busy ? "..." : "Accepter"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="merchant-state-card compact-state">
                <Check size={18} />
                <span>Aucune commande en attente.</span>
              </div>
            )}
          </section>

          <section className="merchant-home-section">
            <div className="merchant-section-title">
              <div>
                <span>ACTIVITÉ</span>
                <h2>En cours</h2>
              </div>
              <button
                onClick={() => {
                  setTab("orders");
                  setFilter("active");
                }}
              >
                Suivre <ChevronRight size={18} />
              </button>
            </div>
            {active.length ? (
              <div className="compact-activity-list">
                {active.slice(0, 3).map((order) => (
                  <button
                    key={order.id}
                    className="compact-activity-row"
                    onClick={() => setSelected(order)}
                  >
                    <span className="compact-order-icon status-orange">
                      <Truck size={17} />
                    </span>
                    <span>
                      <strong>{order.orderNumber}</strong>
                      <small>
                        {STATUS_LABEL[order.status]} ·{" "}
                        {formatCurrency(order.total)}
                      </small>
                    </span>
                    <ChevronRight size={17} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="merchant-state-card compact-state">
                <Truck size={18} />
                <span>Aucune livraison en cours.</span>
              </div>
            )}
          </section>

          <section className="merchant-home-section">
            <div className="merchant-section-title">
              <div>
                <span>CATALOGUE</span>
                <h2>Vos produits</h2>
              </div>
              <button onClick={() => setTab("catalog")}>
                Tout voir <ChevronRight size={18} />
              </button>
            </div>
            <div className="merchant-product-strip">
              {catalog.slice(0, 4).map((product) => (
                <button
                  key={product.id}
                  className="merchant-product-card"
                  onClick={() => setTab("catalog")}
                >
                  <span className="merchant-product-image">
                    {product.image ? (
                      <img src={product.image} alt="" />
                    ) : (
                      <ShoppingBag size={18} />
                    )}
                  </span>
                  <strong>{product.name}</strong>
                  <small>{formatCurrency(product.price)}</small>
                </button>
              ))}
              {!catalog.length ? (
                <div className="merchant-state-card compact-state">
                  <Package size={18} />
                  <span>Aucun produit.</span>
                </div>
              ) : null}
            </div>
          </section>
        </main>
      ) : tab === "orders" ? (
        <main className="merchant-inner-page">
          <div className="merchant-page-head">
            <div>
              <span>GESTION</span>
              <h1>Vos commandes</h1>
            </div>
            <b>{merchantOrders.length}</b>
          </div>
          {error ? <div className="merchant-error">{error}</div> : null}
          <label className="merchant-search">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une commande"
            />
            {query ? (
              <button onClick={() => setQuery("")} aria-label="Effacer">
                <X size={17} />
              </button>
            ) : null}
          </label>
          <div className="merchant-filter-row">
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
          <div className="merchant-orders-full">
            {merchantOrdersLoading ? (
              <div className="merchant-state-card">
                <Loader2 className="spin" size={22} /> Chargement…
              </div>
            ) : visibleOrders.length ? (
              visibleOrders.map((order) => {
                const next = nextAction(order.status);
                return (
                  <article className="merchant-full-order" key={order.id}>
                    <div className="full-order-head">
                      <span className={STATUS_CLASS[order.status]}>
                        {STATUS_LABEL[order.status]}
                      </span>
                      <small>
                        #{order.orderNumber ?? order.id.slice(0, 8)}
                      </small>
                    </div>
                    <button
                      className="full-order-body"
                      onClick={() => setSelected(order)}
                    >
                      <div>
                        <strong>
                          {order.items.length} article
                          {order.items.length > 1 ? "s" : ""}
                        </strong>
                        <p>
                          {order.deliveryAddress ?? "Adresse non renseignée"}
                        </p>
                      </div>
                      <b>{formatCurrency(order.total)}</b>
                    </button>
                    <div className="full-order-actions">
                      <button onClick={() => setSelected(order)}>
                        Détails
                      </button>
                      {order.status === "pending" ? (
                        <button
                          className="danger"
                          disabled={actingId === order.id}
                          onClick={() =>
                            void runAction(order.id, "merchant_rejected")
                          }
                        >
                          Refuser
                        </button>
                      ) : null}
                      {next ? (
                        <button
                          className="primary"
                          disabled={actingId === order.id}
                          onClick={() => void runAction(order.id, next.status)}
                        >
                          {actingId === order.id ? (
                            <Loader2 className="spin" size={15} />
                          ) : (
                            <Check size={15} />
                          )}
                          {actingId === order.id ? "Mise à jour…" : next.label}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="merchant-state-card">
                <Search size={22} /> Aucune commande.
              </div>
            )}
          </div>
        </main>
      ) : tab === "catalog" ? (
        <main className="merchant-inner-page">
          <div className="merchant-page-head">
            <div>
              <span>CATALOGUE</span>
              <h1>{catalog.length} produits</h1>
            </div>
            <button className="catalog-add" onClick={openAddProduct}>
              <Plus size={19} /> Ajouter
            </button>
          </div>
          <div className="catalog-toolbar">
            <label className="merchant-search">
              <Search size={19} />
              <input
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                placeholder="Rechercher un produit"
              />
            </label>
            <div className="merchant-filter-row">
              {(["all", "available", "unavailable"] as CatalogFilter[]).map(
                (item) => (
                  <button
                    key={item}
                    className={catalogFilter === item ? "active" : ""}
                    onClick={() => setCatalogFilter(item)}
                  >
                    {item === "all"
                      ? "Tous"
                      : item === "available"
                        ? "Disponibles"
                        : "Indisponibles"}
                  </button>
                ),
              )}
            </div>
          </div>
          {catalogLoading ? (
            <div className="merchant-state-card">
              <Loader2 className="spin" size={22} /> Chargement du catalogue…
            </div>
          ) : visibleCatalog.length ? (
            <div className="catalog-grid">
              {visibleCatalog.map((product) => (
                <article className="catalog-card" key={product.id}>
                  <div className="catalog-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <ShoppingBag size={30} />
                    )}
                    <button
                      className={`availability-toggle ${product.available ? "available" : "unavailable"}`}
                      disabled={togglingId === product.id}
                      onClick={() => void toggleAvailability(product)}
                    >
                      {togglingId === product.id
                        ? "…"
                        : product.available
                          ? "Disponible"
                          : "Indisponible"}
                    </button>
                  </div>
                  <div className="catalog-copy">
                    {product.category ? (
                      <small>{product.category}</small>
                    ) : null}
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <strong>{formatCurrency(product.price)}</strong>
                  </div>
                  <div className="catalog-actions">
                    <button onClick={() => openEditProduct(product)}>
                      <Pencil size={15} /> Modifier
                    </button>
                    <button
                      className="danger"
                      onClick={() => setDeleteTarget(product)}
                    >
                      <Trash2 size={15} /> Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="merchant-state-card">
              <Package size={24} /> Aucun produit.
            </div>
          )}
        </main>
      ) : (
        <main className="merchant-inner-page">
          <div className="merchant-page-head">
            <div>
              <span>COMPTE</span>
              <h1>{displayName}</h1>
            </div>
            <UserRound size={24} />
          </div>
          <div className="account-card">
            <div className="account-avatar">
              <Store size={25} />
            </div>
            <div>
              <strong>{user.name || "Compte commerçant"}</strong>
              <small>{user.phone || "Compte RUBIGO"}</small>
              <em>{displayName}</em>
            </div>
          </div>
          <button className="account-row" onClick={() => setSettingsOpen(true)}>
            <Settings size={20} />
            <span>Paramètres du compte</span>
            <ChevronRight size={20} />
          </button>
          <button className="account-row" onClick={onReturnToCustomer}>
            <Home size={20} />
            <span>Revenir à l’espace client</span>
            <ChevronRight size={20} />
          </button>
          <button
            className="account-row danger-text"
            onClick={() => void logout()}
          >
            <LogOut size={20} />
            <span>Se déconnecter</span>
            <ChevronRight size={20} />
          </button>
        </main>
      )}

      <nav className="merchant-bottom-nav" aria-label="Navigation commerçant">
        <button
          className={tab === "home" ? "active" : ""}
          onClick={() => setTab("home")}
        >
          <Home size={23} />
          <span>Accueil</span>
        </button>
        <button
          className={tab === "orders" ? "active" : ""}
          onClick={() => {
            setTab("orders");
            setFilter("all");
          }}
        >
          <ShoppingBag size={23} />
          <span>Commandes</span>
          {pending.length ? <b>{pending.length}</b> : null}
        </button>
        <button
          className="merchant-nav-add"
          onClick={openAddProduct}
          aria-label="Ajouter un produit"
        >
          <span>
            <Plus size={30} />
          </span>
          <small>Ajouter</small>
        </button>
        <button
          className={tab === "catalog" ? "active" : ""}
          onClick={() => setTab("catalog")}
        >
          <Package size={23} />
          <span>Catalogue</span>
        </button>
        <button
          className={tab === "account" ? "active" : ""}
          onClick={() => setTab("account")}
        >
          <UserRound size={23} />
          <span>Compte</span>
        </button>
      </nav>

      {settingsOpen ? (
        <div
          className="merchant-overlay"
          onMouseDown={() => setSettingsOpen(false)}
        >
          <section
            className="merchant-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="sheet-header">
              <div>
                <span>COMPTE</span>
                <h2>Paramètres</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setSettingsOpen(false)}
              >
                <X size={19} />
              </button>
            </header>
            <div className="settings-form">
              <label>
                Nom
                <input
                  value={settingsName}
                  onChange={(event) => setSettingsName(event.target.value)}
                />
              </label>
              <label>
                Téléphone
                <input
                  value={settingsPhone}
                  onChange={(event) => setSettingsPhone(event.target.value)}
                />
              </label>
              <button
                className="modal-primary"
                disabled={settingsSaving}
                onClick={() => void saveSettings()}
              >
                {settingsSaving ? (
                  <Loader2 className="spin" size={16} />
                ) : (
                  <Check size={16} />
                )}
                {settingsSaving ? "Enregistrement…" : "Enregistrer"}
              </button>
              {settingsMessage ? (
                <div className="settings-message">{settingsMessage}</div>
              ) : null}
              <button className="account-row" onClick={onReturnToCustomer}>
                <ArrowLeft size={18} />
                <span>Revenir à l’espace client</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selected ? (
        <div className="merchant-overlay" onMouseDown={() => setSelected(null)}>
          <section
            className="merchant-modal order-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="sheet-header">
              <div>
                <span>COMMANDE</span>
                <h2>{selected.orderNumber}</h2>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>
                <X size={19} />
              </button>
            </header>
            <div className="modal-status-row">
              <span className={STATUS_CLASS[selected.status]}>
                {STATUS_LABEL[selected.status]}
              </span>
              <strong>{formatCurrency(selected.total)}</strong>
            </div>
            <section className="modal-section">
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
            </section>
            <section className="modal-section">
              <h3>Livraison</h3>
              <p>{selected.deliveryAddress ?? "Adresse non renseignée"}</p>
            </section>
            {selected.status === "ready" && !selected.driverId ? (
              <section className="modal-section">
                <h3>Choisir un livreur</h3>
                {driversLoading ? (
                  <div className="driver-loading">
                    <Loader2 className="spin" size={18} /> Recherche…
                  </div>
                ) : drivers.length ? (
                  <div className="driver-list">
                    {drivers.map((driver) => (
                      <div className="driver-row" key={driver.id}>
                        <span className="driver-avatar">{driver.initials}</span>
                        <span className="driver-copy">
                          <strong>{driver.name}</strong>
                          <small>
                            {driver.city || "Adzopé"}
                            {driver.phone ? ` · ${driver.phone}` : ""}
                          </small>
                        </span>
                        <button
                          className="driver-assign"
                          disabled={Boolean(assigningDriverId)}
                          onClick={() => void assignDriver(selected.id, driver)}
                        >
                          {assigningDriverId === driver.id ? (
                            <Loader2 className="spin" size={14} />
                          ) : (
                            <Check size={14} />
                          )}{" "}
                          Assigner
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="merchant-state-card">
                    Aucun livreur disponible.
                  </div>
                )}
              </section>
            ) : null}
            {selected.driver ? (
              <div className="assigned-driver-card">
                <Truck size={19} />
                <div>
                  <small>LIVREUR ASSIGNÉ</small>
                  <strong>{selected.driver.name}</strong>
                  <span>{STATUS_LABEL[selected.status]}</span>
                </div>
              </div>
            ) : null}
            {error ? <div className="merchant-error">{error}</div> : null}
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
                  <Loader2 className="spin" size={16} />
                ) : (
                  <Check size={16} />
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
        <div className="merchant-overlay" onMouseDown={closeProductModal}>
          <section
            className="merchant-modal product-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="sheet-header">
              <div>
                <span>{editingProduct ? "MODIFIER" : "AJOUTER"}</span>
                <h2>
                  {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                </h2>
              </div>
              <button className="modal-close" onClick={closeProductModal}>
                <X size={19} />
              </button>
            </header>
            <div className="product-form-image">
              {imagePreview ? (
                <img src={imagePreview} alt="Aperçu" />
              ) : (
                <div className="product-placeholder">
                  <ShoppingBag size={30} />
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? "Remplacer l'image" : "Ajouter une image"}
                </button>
                {imagePreview ? (
                  <button
                    type="button"
                    className="danger"
                    onClick={() => void removeImagePreview()}
                  >
                    Supprimer
                  </button>
                ) : null}
              </div>
              <input
                ref={fileInputRef}
                hidden
                type="file"
                accept="image/*"
                onChange={handleImagePick}
              />
            </div>
            <label className="product-field">
              Nom du produit *
              <input
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ex. Riz sauce graine"
              />
            </label>
            <label className="product-field">
              Description
              <textarea
                rows={3}
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Décrivez votre produit"
              />
            </label>
            <div className="product-form-row">
              <label className="product-field">
                Prix (FCFA) *
                <input
                  type="number"
                  min={1}
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="product-field">
                Catégorie
                <input
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  placeholder="Plats, Boissons…"
                />
              </label>
            </div>
            <button
              className={`availability-switch ${productForm.available ? "on" : "off"}`}
              onClick={() =>
                setProductForm((current) => ({
                  ...current,
                  available: !current.available,
                }))
              }
            >
              <i />
              {productForm.available ? "Disponible" : "Indisponible"}
            </button>
            {productFormError ? (
              <div className="merchant-error">{productFormError}</div>
            ) : null}
            <div className="product-form-actions">
              <button onClick={closeProductModal}>Annuler</button>
              <button
                className="modal-primary"
                disabled={savingProduct || uploadingImage}
                onClick={() => void saveProduct()}
              >
                {savingProduct || uploadingImage ? (
                  <Loader2 className="spin" size={16} />
                ) : (
                  <Check size={16} />
                )}
                {uploadingImage
                  ? "Envoi…"
                  : savingProduct
                    ? "Enregistrement…"
                    : editingProduct
                      ? "Enregistrer"
                      : "Ajouter le produit"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="merchant-overlay"
          onMouseDown={() => !deletingProduct && setDeleteTarget(null)}
        >
          <section
            className="merchant-modal confirm-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Trash2 size={27} />
            <h2>Supprimer ce produit ?</h2>
            <p>
              « {deleteTarget.name} » sera définitivement supprimé de votre
              catalogue.
            </p>
            <div className="product-form-actions">
              <button
                disabled={deletingProduct}
                onClick={() => setDeleteTarget(null)}
              >
                Annuler
              </button>
              <button
                className="modal-primary danger"
                disabled={deletingProduct}
                onClick={() => void confirmDeleteProduct()}
              >
                {deletingProduct ? (
                  <Loader2 className="spin" size={16} />
                ) : (
                  <Trash2 size={16} />
                )}{" "}
                {deletingProduct ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

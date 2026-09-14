import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  Check,
  ChevronRight,
  CircleHelp,
  Copy,
  CreditCard,
  Gift,
  Heart,
  HelpCircle,
  ListOrdered,
  MapPin,
  MessageCircle,
  Monitor,
  Moon,
  Palette,
  Pencil,
  Plus,
  Settings2,
  Share2,
  Sun,
  Trash2,
  User as UserIcon,
  WalletCards,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useGeocoding } from "../hooks/useGeocoding";
import type { Page } from "../types";
import "./Profile.css";

type Accent = "coral" | "lime" | "blue" | "gold";
type Panel = "payment" | "referral" | "support" | "settings" | null;
type ThemeId = "rubigo" | "dark" | "ocean" | "sand";

type ProfileAction = {
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  accent: Accent;
  action:
    | "edit"
    | "orders"
    | "favorites"
    | "payment"
    | "referral"
    | "support"
    | "settings";
};

type PaymentMethod = {
  id: string;
  label: string;
  type: "Mobile Money" | "Carte";
  last4: string;
  isDefault: boolean;
};

const THEME_STORAGE_KEY = "rubigo-theme";
const PAYMENT_STORAGE_KEY = "rubigo-payment-methods";
const MOTION_STORAGE_KEY = "rubigo-reduced-motion";

const actions: ProfileAction[] = [
  {
    label: "Mes informations",
    description: "Modifier votre nom et téléphone",
    icon: UserIcon,
    accent: "blue",
    action: "edit",
  },
  {
    label: "Mes commandes",
    description: "Suivre vos commandes en cours et passées",
    icon: ListOrdered,
    accent: "coral",
    action: "orders",
  },
  {
    label: "Mes favoris",
    description: "Retrouvez vos commerces favoris",
    icon: Heart,
    accent: "gold",
    action: "favorites",
  },
  {
    label: "Moyens de paiement",
    description: "Gérer vos moyens de paiement",
    icon: CreditCard,
    accent: "lime",
    action: "payment",
  },
  {
    label: "Parrainage",
    description: "Invitez vos proches et gagnez des avantages",
    icon: Gift,
    accent: "coral",
    action: "referral",
  },
  {
    label: "Aide & Support",
    description: "Préparer une demande au support",
    icon: HelpCircle,
    accent: "blue",
    action: "support",
  },
  {
    label: "Paramètres",
    description: "Thème, apparence et préférences",
    icon: Settings2,
    accent: "gold",
    action: "settings",
  },
];

const themeOptions: Array<{
  id: ThemeId;
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
}> = [
  { id: "rubigo", label: "RUBIGO", description: "Clair et naturel", icon: Sun },
  { id: "dark", label: "Nocturne", description: "Mode sombre", icon: Moon },
  {
    id: "ocean",
    label: "Océan",
    description: "Frais et profond",
    icon: Palette,
  },
  { id: "sand", label: "Sable", description: "Chaud et doux", icon: Monitor },
];

const fallbackPayments: PaymentMethod[] = [
  {
    id: "default-momo",
    label: "Mobile Money",
    type: "Mobile Money",
    last4: "****",
    isDefault: true,
  },
];

function readStoredPayments(): PaymentMethod[] {
  try {
    const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : fallbackPayments;
  } catch {
    return fallbackPayments;
  }
}

function themeFromStorage(): ThemeId {
  if (typeof window === "undefined") return "rubigo";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "ocean" || stored === "sand"
    ? stored
    : "rubigo";
}

function resolveTheme(theme: ThemeId): "rubigo" | "dark" | "ocean" | "sand" {
  return theme;
}

function applyTheme(theme: ThemeId) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const root = document.documentElement;
  root.dataset.rubigoTheme = resolveTheme(theme);
  root.style.colorScheme = theme === "dark" ? "dark" : "light";
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

// Applique immédiatement le thème mémorisé au démarrage de l'application.
// Profile.tsx est importé dans App.tsx, donc le thème est restauré même
// lorsqu'on recharge RUBIGO sur une autre page que Profil.
if (typeof window !== "undefined" && typeof document !== "undefined") {
  applyTheme(themeFromStorage());
}

export function Profile({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const {
    user,
    orders,
    favoriteMerchantIds,
    addAddress,
    removeAddress,
    setDefaultAddress,
    logout,
    updateProfile,
  } = useApp();
  const { geocode, isLoading: geocoding } = useGeocoding();

  const [addressLabel, setAddressLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [panel, setPanel] = useState<Panel>(null);
  const [theme, setTheme] = useState<ThemeId>(() => themeFromStorage());
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(MOTION_STORAGE_KEY) === "true";
  });
  const [payments, setPayments] = useState<PaymentMethod[]>(() =>
    readStoredPayments(),
  );
  const [newPaymentType, setNewPaymentType] = useState<
    "Mobile Money" | "Carte"
  >("Mobile Money");
  const [newPaymentValue, setNewPaymentValue] = useState("");
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedSupport, setCopiedSupport] = useState(false);

  const referralCode = useMemo(() => {
    const base = (user.id || user.initials || "RUBIGO")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-6)
      .toUpperCase();
    return `RUBIGO-${base || "LOCAL"}`;
  }, [user.id, user.initials]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion
      ? "true"
      : "false";
    localStorage.setItem(MOTION_STORAGE_KEY, String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    setEditName(user.name);
    setEditPhone(user.phone);
  }, [user.name, user.phone]);

  useEffect(() => {
    return () => {
      document.documentElement.removeAttribute("data-reduced-motion");
    };
  }, []);

  const submitAddress = async () => {
    if (!addressLabel.trim() || !addressLine.trim()) return;
    const location = await geocode(addressLine.trim());
    addAddress(addressLabel.trim(), addressLine.trim(), location ?? undefined);
    setAddressLabel("");
    setAddressLine("");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const startEditing = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setProfileError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setProfileError("");
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      setProfileError("Le nom ne peut pas être vide.");
      return;
    }
    if (!editPhone.trim()) {
      setProfileError("Le téléphone ne peut pas être vide.");
      return;
    }

    setSavingProfile(true);
    setProfileError("");
    const result = await updateProfile(editName.trim(), editPhone.trim());
    setSavingProfile(false);

    if (!result.ok) {
      setProfileError(
        result.message ??
          "Impossible de mettre à jour votre profil pour le moment.",
      );
      return;
    }

    setEditing(false);
  };

  const handleActionClick = (action: ProfileAction["action"]) => {
    switch (action) {
      case "edit":
        startEditing();
        return;
      case "orders":
        onNavigate("orders");
        return;
      case "favorites":
        onNavigate("favorites");
        return;
      case "payment":
      case "referral":
      case "support":
      case "settings":
        setPanel(action);
        return;
    }
  };

  const setDefaultPayment = (paymentId: string) => {
    setPayments((current) =>
      current.map((payment) => ({
        ...payment,
        isDefault: payment.id === paymentId,
      })),
    );
  };

  const removePayment = (paymentId: string) => {
    setPayments((current) => {
      const remaining = current.filter((payment) => payment.id !== paymentId);
      if (!remaining.length) return fallbackPayments;
      if (!remaining.some((payment) => payment.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return remaining;
    });
  };

  const addPayment = () => {
    const cleaned = newPaymentValue.replace(/\D/g, "");
    if (cleaned.length < 4) return;

    const next: PaymentMethod = {
      id: `payment-${Date.now()}`,
      label: newPaymentType,
      type: newPaymentType,
      last4: cleaned.slice(-4),
      isDefault: payments.length === 0,
    };

    setPayments((current) => [
      ...current.map((payment) => ({ ...payment, isDefault: false })),
      next,
    ]);
    setNewPaymentValue("");
  };

  const copyText = async (value: string, setter: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(value);
      setter(true);
      window.setTimeout(() => setter(false), 1600);
    } catch {
      setter(false);
    }
  };

  const shareReferral = async () => {
    const shareText = `Rejoins RUBIGO avec mon code ${referralCode}. Le commerce local, plus proche.`;
    if (navigator.share) {
      await navigator
        .share({
          title: "RUBIGO",
          text: shareText,
        })
        .catch(() => undefined);
      return;
    }
    await copyText(shareText, setCopiedReferral);
  };

  const supportMessage = `Bonjour RUBIGO, je suis ${user.name || "un client"}. J'ai besoin d'aide concernant mon compte.`;

  return (
    <div className="page-content profile-page">
      <div className="profile-header-row">
        <div>
          <p className="eyebrow">VOTRE ESPACE</p>
          <h1>Mon profil</h1>
          <p className="profile-subtitle">
            Gérez votre compte, vos préférences et vos adresses.
          </p>
        </div>
        <button
          type="button"
          className="profile-edit-trigger"
          aria-label="Modifier le profil"
          onClick={startEditing}
        >
          <Pencil size={16} />
        </button>
      </div>

      <div className="profile-identity">
        <span className="profile-avatar">{user.initials}</span>

        {editing ? (
          <div className="profile-edit-form">
            <input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              placeholder="Nom complet"
              disabled={savingProfile}
            />
            <input
              value={editPhone}
              onChange={(event) => setEditPhone(event.target.value)}
              placeholder="Téléphone"
              disabled={savingProfile}
            />
            {profileError && (
              <p className="profile-note error">{profileError}</p>
            )}
            <div className="profile-edit-actions">
              <button
                type="button"
                onClick={saveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={savingProfile}
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-identity-copy">
            <h2>{user.name}</h2>
            {(user.email || user.phone) && (
              <p className="profile-contact">
                {[user.email, user.phone].filter(Boolean).join(" · ")}
              </p>
            )}
            {user.city && (
              <span className="profile-location-badge">
                <MapPin size={12} />
                {user.city}
              </span>
            )}
          </div>
        )}
      </div>

      {!editing && (
        <div className="profile-summary-card">
          <div className="profile-summary-stat">
            <strong>{orders.length}</strong>
            <span>Commande{orders.length > 1 ? "s" : ""}</span>
          </div>
          <div className="profile-summary-divider" />
          <div className="profile-summary-stat">
            <strong>{favoriteMerchantIds.length}</strong>
            <span>Favori{favoriteMerchantIds.length > 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      <section className="address-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MES ADRESSES</p>
            <h2>Livrer au bon endroit</h2>
          </div>
        </div>

        {(user.addresses ?? []).map((address) => (
          <div className="address-row" key={address.id}>
            <span>⌖</span>
            <div>
              <strong>{address.label}</strong>
              <p>{address.line}</p>
            </div>

            {address.isDefault ? (
              <small>Principale</small>
            ) : (
              <button
                type="button"
                onClick={() => setDefaultAddress(address.id)}
              >
                Choisir
              </button>
            )}

            <button
              type="button"
              aria-label={`Supprimer ${address.label}`}
              onClick={() => removeAddress(address.id)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        <div className="address-form">
          <input
            value={addressLabel}
            onChange={(event) => setAddressLabel(event.target.value)}
            placeholder="Nom (Maison, Travail...)"
          />
          <input
            value={addressLine}
            onChange={(event) => setAddressLine(event.target.value)}
            placeholder="Quartier, rue, repère"
          />
          <button type="button" onClick={submitAddress} disabled={geocoding}>
            {geocoding ? "Recherche..." : "Ajouter une adresse"}
          </button>
        </div>
      </section>

      <div className="profile-actions">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`profile-action-card ${action.accent}`}
            onClick={() => handleActionClick(action.action)}
          >
            <span className="action-icon">
              <action.icon size={19} strokeWidth={2} />
            </span>
            <span className="action-copy">
              <strong>{action.label}</strong>
              <small>{action.description}</small>
            </span>
            <ChevronRight size={18} className="action-chevron" />
          </button>
        ))}
      </div>

      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? "Déconnexion…" : "Déconnexion"}
      </button>

      {panel && (
        <div
          className="profile-modal-backdrop"
          role="presentation"
          onMouseDown={() => setPanel(null)}
        >
          <section
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              panel === "payment"
                ? "Moyens de paiement"
                : panel === "referral"
                  ? "Parrainage"
                  : panel === "support"
                    ? "Aide et support"
                    : "Paramètres"
            }
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="profile-modal-header">
              <div>
                <p className="eyebrow">RUBIGO</p>
                <h2>
                  {panel === "payment"
                    ? "Moyens de paiement"
                    : panel === "referral"
                      ? "Parrainage"
                      : panel === "support"
                        ? "Aide & Support"
                        : "Paramètres"}
                </h2>
              </div>

              <button
                type="button"
                className="profile-modal-close"
                onClick={() => setPanel(null)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </header>

            {panel === "payment" && (
              <div className="profile-modal-body">
                <div className="modal-section-intro">
                  <WalletCards size={22} />
                  <p>
                    Gérez ici vos moyens enregistrés pour le paiement. Seuls les
                    quatre derniers chiffres sont conservés dans ce profil
                    local.
                  </p>
                </div>

                <div className="payment-list">
                  {payments.map((payment) => (
                    <div
                      className={`payment-card ${payment.isDefault ? "active" : ""}`}
                      key={payment.id}
                    >
                      <div className="payment-card-icon">
                        <CreditCard size={18} />
                      </div>
                      <div className="payment-card-copy">
                        <strong>{payment.label}</strong>
                        <span>
                          {payment.type} · •••• {payment.last4}
                        </span>
                      </div>
                      {payment.isDefault ? (
                        <span className="payment-default">
                          <Check size={13} /> Défaut
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDefaultPayment(payment.id)}
                        >
                          Choisir
                        </button>
                      )}
                      <button
                        type="button"
                        className="payment-delete"
                        onClick={() => removePayment(payment.id)}
                        aria-label={`Supprimer ${payment.label}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="payment-add">
                  <div className="payment-add-title">
                    <Plus size={16} />
                    <strong>Ajouter un moyen</strong>
                  </div>
                  <select
                    value={newPaymentType}
                    onChange={(event) =>
                      setNewPaymentType(
                        event.target.value as "Mobile Money" | "Carte",
                      )
                    }
                  >
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Carte">Carte</option>
                  </select>
                  <input
                    value={newPaymentValue}
                    onChange={(event) =>
                      setNewPaymentValue(
                        event.target.value.replace(/\D/g, "").slice(0, 16),
                      )
                    }
                    inputMode="numeric"
                    placeholder={
                      newPaymentType === "Mobile Money"
                        ? "Numéro Mobile Money"
                        : "Numéro de carte"
                    }
                  />
                  <button
                    type="button"
                    onClick={addPayment}
                    disabled={newPaymentValue.replace(/\D/g, "").length < 4}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            )}

            {panel === "referral" && (
              <div className="profile-modal-body">
                <div className="referral-hero">
                  <div className="referral-icon">
                    <Gift size={24} />
                  </div>
                  <div>
                    <strong>Invitez vos proches</strong>
                    <p>
                      Partagez votre code et gardez une trace de vos invitations
                      depuis l'application.
                    </p>
                  </div>
                </div>

                <div className="referral-code-card">
                  <span>VOTRE CODE</span>
                  <strong>{referralCode}</strong>
                  <div>
                    <button
                      type="button"
                      onClick={() => copyText(referralCode, setCopiedReferral)}
                    >
                      {copiedReferral ? (
                        <Check size={15} />
                      ) : (
                        <Copy size={15} />
                      )}
                      {copiedReferral ? "Copié" : "Copier"}
                    </button>
                    <button type="button" onClick={shareReferral}>
                      <Share2 size={15} />
                      Partager
                    </button>
                  </div>
                </div>

                <div className="referral-steps">
                  <div>
                    <span>1</span>
                    <p>Partagez votre code.</p>
                  </div>
                  <div>
                    <span>2</span>
                    <p>Votre proche s'inscrit avec le code.</p>
                  </div>
                  <div>
                    <span>3</span>
                    <p>RUBIGO comptabilise l'invitation.</p>
                  </div>
                </div>
              </div>
            )}

            {panel === "support" && (
              <div className="profile-modal-body">
                <div className="modal-section-intro">
                  <CircleHelp size={22} />
                  <p>
                    Préparez un message clair avant de contacter l'équipe
                    RUBIGO.
                  </p>
                </div>

                <div className="support-card">
                  <MessageCircle size={18} />
                  <div>
                    <strong>Demande prête à copier</strong>
                    <p>{supportMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(supportMessage, setCopiedSupport)}
                  >
                    {copiedSupport ? <Check size={15} /> : <Copy size={15} />}
                    {copiedSupport ? "Copié" : "Copier"}
                  </button>
                </div>

                <div className="support-note">
                  <strong>Avant de contacter le support</strong>
                  <p>
                    Ajoutez votre référence de commande, une capture d'écran si
                    nécessaire et décrivez le problème en une phrase.
                  </p>
                </div>
              </div>
            )}

            {panel === "settings" && (
              <div className="profile-modal-body">
                <section className="settings-section">
                  <div className="settings-heading">
                    <div>
                      <strong>Apparence</strong>
                      <p>Choisissez le thème global de RUBIGO.</p>
                    </div>
                    <Palette size={20} />
                  </div>

                  <div className="theme-grid">
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`theme-option ${theme === option.id ? "active" : ""} theme-${option.id}`}
                        onClick={() => setTheme(option.id)}
                      >
                        <span className="theme-preview">
                          <option.icon size={17} />
                        </span>
                        <span>
                          <strong>{option.label}</strong>
                          <small>{option.description}</small>
                        </span>
                        {theme === option.id && (
                          <Check size={16} className="theme-check" />
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="settings-section">
                  <div className="settings-row">
                    <div>
                      <strong>Réduire les animations</strong>
                      <p>
                        Désactive les transitions décoratives de l'interface.
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`toggle ${reducedMotion ? "on" : ""}`}
                      aria-pressed={reducedMotion}
                      onClick={() => setReducedMotion((current) => !current)}
                    >
                      <span />
                    </button>
                  </div>
                </section>

                <section className="settings-section">
                  <div className="settings-heading">
                    <div>
                      <strong>Compte</strong>
                      <p>{user.email || "Compte RUBIGO connecté"}</p>
                    </div>
                    <Settings2 size={20} />
                  </div>

                  <button
                    type="button"
                    className="settings-action"
                    onClick={startEditing}
                  >
                    <UserIcon size={17} />
                    Modifier mes informations
                    <ChevronRight size={16} />
                  </button>
                </section>
              </div>
            )}

            <footer className="profile-modal-footer">
              <button type="button" onClick={() => setPanel(null)}>
                Fermer
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

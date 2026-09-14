import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import type { Role } from "../types";
import "./RoleSelection.css";

export type RegistrationRole = Exclude<Role, "admin">;

type RoleConfig = {
  id: RegistrationRole;
  title: string;
  description: string;
  pills: string[];
  image: string;
  imageAlt: string;
  badgeIcon: typeof ShoppingBag;
};

const ROLE_CONFIG: RoleConfig[] = [
  {
    id: "customer",
    title: "Client",
    description:
      "Commander auprès des commerces locaux et recevoir vos achats à domicile.",
    pills: ["Commandes", "Livraison", "Favoris"],
    image: "/role-client.png",
    imageAlt: "Sac de courses avec produits du quotidien",
    badgeIcon: ShoppingBag,
  },
  {
    id: "driver",
    title: "Livreur",
    description: "Livrer des commandes à Adzopé et effectuer des missions.",
    pills: ["Livraisons", "Revenus", "Flexibilité"],
    image: "/role-driver.png",
    imageAlt: "Scooter de livraison RUBIGO",
    badgeIcon: MapPin,
  },
  {
    id: "merchant",
    title: "Commerçant",
    description:
      "Vendre vos produits, gérer votre boutique et recevoir des commandes.",
    pills: ["Boutique", "Catalogue", "Croissance"],
    image: "/role-merchant.png",
    imageAlt: "Boutique locale RUBIGO",
    badgeIcon: TrendingUp,
  },
];

export function RoleSelection({
  selectedRoles,
  onBack,
  onRolesChange,
  onContinue,
  submitting = false,
  error = "",
}: {
  selectedRoles: RegistrationRole[];
  onBack: () => void;
  onRolesChange: (roles: RegistrationRole[]) => void;
  onContinue: (roles: RegistrationRole[]) => void | Promise<void>;
  submitting?: boolean;
  error?: string;
}) {
  const toggleRole = (role: RegistrationRole) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length === 1) return;
      onRolesChange(selectedRoles.filter((item) => item !== role));
      return;
    }

    onRolesChange([...selectedRoles, role]);
  };

  const isSelected = (role: RegistrationRole) => selectedRoles.includes(role);

  return (
    <main className="role-selection-page">
      <div className="role-selection-shell">
        <button
          type="button"
          className="role-selection-back"
          onClick={onBack}
          aria-label="Retour aux informations du compte"
          disabled={submitting}
        >
          <ArrowLeft size={24} strokeWidth={1.9} />
        </button>

        <div className="role-selection-progress">
          <span>Étape 2 sur 3</span>
          <div className="role-progress-bars" aria-hidden="true">
            <i className="done" />
            <i className="done" />
            <i />
          </div>
        </div>

        <div className="role-selection-brand" aria-label="RUBIGO">
          RUBIGO
        </div>

        <header className="role-selection-header">
          <h1>
            Comment souhaitez-vous utiliser <strong>RUBIGO</strong> ?
          </h1>
          <p>Choisissez un ou plusieurs profils selon vos activités.</p>
        </header>

        <div className="role-selection-info">
          <span className="role-info-icon" aria-hidden="true">
            <Info size={18} strokeWidth={2.4} />
          </span>
          <p>
            Vous pourrez ajouter d’autres profils plus tard depuis votre compte.
          </p>
        </div>

        <div className="role-options" role="group" aria-label="Profils RUBIGO">
          {ROLE_CONFIG.map((role) => {
            const selected = isSelected(role.id);
            const BadgeIcon = role.badgeIcon;

            return (
              <button
                key={role.id}
                type="button"
                className={`role-card${selected ? " selected" : ""}`}
                onClick={() => toggleRole(role.id)}
                disabled={submitting}
                aria-pressed={selected}
              >
                <span
                  className={`role-checkbox${selected ? " checked" : ""}`}
                  aria-hidden="true"
                >
                  {selected ? <Check size={19} strokeWidth={3} /> : null}
                </span>

                <span className="role-card-content">
                  <span className="role-card-title">{role.title}</span>
                  <span className="role-card-description">
                    {role.description}
                  </span>

                  <span className="role-card-pills">
                    {role.pills.map((pill) => (
                      <span key={pill}>{pill}</span>
                    ))}
                  </span>
                </span>

                <span
                  className={`role-illustration ${role.id}`}
                  aria-hidden="true"
                >
                  <span className="role-illustration-circle" />

                  <span className="role-illustration-image">
                    <img src={role.image} alt="" draggable="false" />
                  </span>

                  <span className="role-illustration-badge">
                    <BadgeIcon size={19} strokeWidth={2.15} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="role-selection-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          className="role-selection-submit"
          onClick={() => onContinue(selectedRoles)}
          disabled={submitting || selectedRoles.length === 0}
        >
          <span>{submitting ? "Création du compte…" : "Continuer"}</span>
          {!submitting && <ArrowRight size={22} strokeWidth={2.1} />}
        </button>

        <div className="role-selection-security">
          <ShieldCheck size={17} strokeWidth={2.1} />
          <span>Vos informations sont sécurisées et confidentielles.</span>
        </div>
      </div>
    </main>
  );
}

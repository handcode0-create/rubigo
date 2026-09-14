import { useMemo, useState } from "react";
import { merchants } from "../data";
import { MerchantCard, ProductCard } from "../components/Cards";
import { MerchantMap } from "../components/maps/MerchantMap";
import { SearchIcon } from "../components/Icons";
import { useApp } from "../context/AppContext";
import type { CategoryId, Merchant, Product } from "../types";
import "./Explore.css";

export function Explore({
  onMerchant,
  onProduct,
  initialCategory,
}: {
  onMerchant: (merchant: Merchant) => void;
  onProduct: (product: Product) => void;
  initialCategory?: CategoryId | "all";
}) {
  const { categories, products } = useApp();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">(
    initialCategory ?? "all",
  );
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedMapMerchant, setSelectedMapMerchant] = useState<string>();

  const normalizedQuery = query.toLowerCase().trim();

  /**
   * Les commerces restent issus de la source catalogue existante.
   * Le filtre repose prioritairement sur categoryId.
   */
  const filteredMerchants = useMemo(() => {
    return merchants.filter((merchant) => {
      const matchesQuery =
        !normalizedQuery ||
        `${merchant.name} ${merchant.category} ${
          merchant.location?.address ?? ""
        }`
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        activeCategory === "all" || merchant.categoryId === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [normalizedQuery, activeCategory]);

  /**
   * Les produits viennent maintenant du contexte AppContext,
   * donc de Supabase lorsqu'ils sont disponibles.
   */
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        `${product.name} ${product.description ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        activeCategory === "all" || product.categoryId === activeCategory;

      return matchesQuery && matchesCategory;
    });
  }, [products, normalizedQuery, activeCategory]);

  const selectMerchant = (merchant: Merchant) => {
    setSelectedMapMerchant(merchant.id);
    onMerchant(merchant);
  };

  const handleCategoryChange = (category: CategoryId | "all") => {
    setActiveCategory(category);
    setSelectedMapMerchant(undefined);
  };

  return (
    <div className="page-content">
      <section className="page-heading">
        <p className="eyebrow">DÉCOUVRIR ADZOPÉ</p>

        <h1>Explorer</h1>

        <p>
          Les commerces locaux, maquis et marchés de la ville, réunis pour vous.
        </p>
      </section>

      <label className="search-input">
        <span className="search-input-icon">
          <SearchIcon size={18} />
        </span>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un plat, un maquis ou une épicerie..."
          type="search"
        />

        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setQuery("")}
            aria-label="Effacer la recherche"
          >
            ×
          </button>
        )}
      </label>

      <div
        className="category-scroll"
        role="tablist"
        aria-label="Catégories de commerces"
      >
        <button
          type="button"
          className={
            activeCategory === "all" ? "category-chip active" : "category-chip"
          }
          onClick={() => handleCategoryChange("all")}
          role="tab"
          aria-selected={activeCategory === "all"}
        >
          Tout
        </button>

        {categories.map((item) => (
          <button
            type="button"
            key={item.id}
            className={
              activeCategory === item.id
                ? "category-chip active"
                : "category-chip"
            }
            onClick={() => handleCategoryChange(item.id)}
            role="tab"
            aria-selected={activeCategory === item.id}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <section className="section-block compact-top">
        <div className="section-heading">
          <div>
            <p className="eyebrow">RÉSULTATS</p>

            <h2>Commerces à Adzopé ({filteredMerchants.length})</h2>
          </div>

          <div className="view-toggle">
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
            >
              Liste
            </button>

            <button
              type="button"
              className={viewMode === "map" ? "active" : ""}
              onClick={() => setViewMode("map")}
              aria-pressed={viewMode === "map"}
            >
              Carte
            </button>
          </div>
        </div>

        {viewMode === "map" ? (
          <MerchantMap
            merchants={filteredMerchants}
            selectedId={selectedMapMerchant}
            onSelect={selectMerchant}
          />
        ) : filteredMerchants.length ? (
          <div className="merchant-grid">
            {filteredMerchants.map((merchant) => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                onOpen={() => selectMerchant(merchant)}
              />
            ))}
          </div>
        ) : (
          <EmptyState text="Aucun commerce ne correspond à votre recherche ou catégorie." />
        )}
      </section>

      <section className="section-block compact-top">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PLATS & ARTICLES</p>

            <h2>Disponibles à la commande ({filteredProducts.length})</h2>
          </div>
        </div>

        {filteredProducts.length ? (
          <div className="product-list">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={() => onProduct(product)}
              />
            ))}
          </div>
        ) : (
          <EmptyState text="Aucun produit trouvé dans cette catégorie." />
        )}
      </section>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <span className="empty-icon-wrap">
        <SearchIcon size={28} />
      </span>

      <strong>{text}</strong>

      <p>Essayez un autre mot-clé ou sélectionnez une autre catégorie.</p>
    </div>
  );
}

import { useEffect, useState, type ReactNode } from "react";
import "./App.css";
import { AppProvider, useApp } from "./context/AppContext";
import { BottomNavigation } from "./components/Navigation";
import { Notifications } from "./components/Notifications";
import { PageHeader } from "./components/PageHeader";
import { Sidebar } from "./components/Sidebar";
import { CartDrawer } from "./components/CartDrawer";
import { CartConflictModal } from "./components/CartConflictModal";
import { Explore } from "./pages/Explore";
import { Favorites } from "./pages/Favorites";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Orders } from "./pages/Orders";
import { Profile } from "./pages/Profile";
import { Checkout, MerchantDetail, ProductDetail } from "./pages/Details";
import { DriverDashboard, MerchantDashboard } from "./pages/RolePages";
import { AdminDashboard } from "./pages/AdminDashboard";
import { routerService } from "./services/routerService";
import { merchants, products } from "./data";
import type { Merchant, Page, Product, Role } from "./types";

function AppShell() {
  const [page, setPage] = useState<Page>("home");
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const {
    activeRole,
    cart,
    unreadNotifications,
    authenticated,
    switchToCustomer,
    isCartOpen,
    setIsCartOpen,
    cartConflict,
    confirmCartReplacement,
    cancelCartReplacement,
  } = useApp();

  useEffect(() => {
    const handleHashChange = () => {
      const state = routerService.getCurrentState();
      if (state.checkout) {
        setCheckout(true);
        setSelectedProduct(null);
        setSelectedMerchant(null);
      } else if (state.merchantId) {
        const m = merchants.find((item) => item.id === state.merchantId);
        if (m) {
          setSelectedMerchant(m);
          setSelectedProduct(null);
          setCheckout(false);
          setPage("explore");
          return;
        }
      } else if (state.productId) {
        const p = products.find((item) => item.id === state.productId);
        if (p) {
          setSelectedProduct(p);
          setSelectedMerchant(null);
          setCheckout(false);
          setPage("explore");
          return;
        }
      } else {
        setCheckout(false);
        setSelectedMerchant(null);
        setSelectedProduct(null);
        setPage(state.page);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (!authenticated) return <Login />;

  const navigate = (nextPage: Page) => {
    routerService.navigate({ page: nextPage });
  };

  const openMerchant = (merchant: Merchant) => {
    routerService.navigate({ page: "explore", merchantId: merchant.id });
  };

  const openProduct = (product: Product) => {
    routerService.navigate({ page: "explore", productId: product.id });
  };

  const startCheckout = () => {
    routerService.navigate({ page: "orders", checkout: true });
  };

  const handleBack = () => {
    routerService.back();
  };

  const returnToCustomer = () => {
    switchToCustomer();
    navigate("home");
  };

  const pages: Partial<Record<Page, ReactNode>> = {
    home: (
      <Home
        onNavigate={navigate}
        onMerchant={openMerchant}
        onProduct={openProduct}
      />
    ),
    explore: (
      <Explore
        onMerchant={openMerchant}
        onProduct={openProduct}
      />
    ),
    orders: <Orders />,
    favorites: <Favorites />,
    profile: <Profile onNavigate={navigate} />,
    merchant: <MerchantDashboard onReturnToCustomer={returnToCustomer} />,
    driver: <DriverDashboard onReturnToCustomer={returnToCustomer} />,
    admin: <AdminDashboard onReturnToCustomer={returnToCustomer} />,
  };

  const rolePages: Partial<Record<Role, Page>> = {
    merchant: "merchant",
    driver: "driver",
    admin: "admin",
  };

  const rolePage = rolePages[activeRole] ?? page;

  const content = checkout ? (
    <Checkout
      onBack={handleBack}
      onDone={() => {
        navigate("orders");
      }}
    />
  ) : selectedProduct ? (
    <ProductDetail
      product={selectedProduct}
      onBack={handleBack}
      onCheckout={startCheckout}
    />
  ) : selectedMerchant ? (
    <MerchantDetail
      merchant={selectedMerchant}
      onBack={handleBack}
      onProduct={openProduct}
    />
  ) : (
    pages[rolePage]
  );

  const isAdmin = activeRole === "admin";

  return (
    <div className={isAdmin ? "app-shell admin-app-shell" : "app-shell"}>
      {!isAdmin ? <Sidebar page={rolePage} onNavigate={navigate} /> : null}

      <main className="main-content">
        {!isAdmin ? (
          <PageHeader
            page={rolePage}
            onNavigate={navigate}
            canNavigate={activeRole === "customer"}
            unreadCount={unreadNotifications}
            onNotifications={() => setNotificationsOpen(!notificationsOpen)}
          />
        ) : null}

        {content}

        {!isAdmin ? (
          <footer>
            <span>© 2026 RUBIGO</span>
            <span>La livraison qui nous rapproche.</span>
            <span>Support · Adzopé</span>
          </footer>
        ) : null}
      </main>

      {!isAdmin && notificationsOpen ? (
        <Notifications onClose={() => setNotificationsOpen(false)} />
      ) : null}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={startCheckout}
      />

      <CartConflictModal
        isOpen={Boolean(cartConflict)}
        existingMerchantName={cartConflict?.existingMerchantName ?? ""}
        newMerchantName={cartConflict?.newMerchantName ?? ""}
        onCancel={cancelCartReplacement}
        onConfirm={confirmCartReplacement}
      />

      {activeRole === "customer" ? (
        <BottomNavigation
          page={rolePage}
          onNavigate={navigate}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        />
      ) : null}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;

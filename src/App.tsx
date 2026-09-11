import { useEffect, useRef, useState, type ReactNode } from "react";
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
import {
  DriverHistory,
  DriverHome,
  DriverMissions,
} from "./pages/RolePages";

import { MerchantDashboard } from "./pages/MerchantDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { routerService } from "./services/routerService";
import { merchants, products } from "./data";
import type { Merchant, Page, Product, Role } from "./types";
import { SplashScreen } from "./components/SplashScreen";


const SPLASH_DURATION = 5000;

function AppShell() {
  const [page, setPage] = useState<Page>("home");

  const [selectedMerchant, setSelectedMerchant] =
    useState<Merchant | null>(null);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [checkout, setCheckout] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  /*
   * Le timer démarre dès que AppShell est monté.
   * Le Splash est donc présent dès le premier rendu de l'application.
   */
  const splashStartedAt = useRef(Date.now());

  const [splashFinished, setSplashFinished] = useState(false);

  const {
    activeRole,
    cart,
    unreadNotifications,
    authenticated,
    authLoading,
    switchToCustomer,
    isCartOpen,
    setIsCartOpen,
    cartConflict,
    confirmCartReplacement,
    cancelCartReplacement,
  } = useApp();

  /*
   * Durée minimale du Splash : 20 secondes.
   *
   * Si Supabase termine avant 20 secondes :
   * → on attend jusqu'à 20 secondes.
   *
   * Si Supabase prend plus de 20 secondes :
   * → on garde le Splash jusqu'à ce que la session soit prête.
   */
  useEffect(() => {
    const elapsed = Date.now() - splashStartedAt.current;
    const remaining = Math.max(0, SPLASH_DURATION - elapsed);

    const timer = window.setTimeout(() => {
      setSplashFinished(true);
    }, remaining);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const state = routerService.getCurrentState();

      if (state.checkout) {
        setCheckout(true);
        setSelectedProduct(null);
        setSelectedMerchant(null);
      } else if (state.merchantId) {
        const merchant = merchants.find(
          (item) => item.id === state.merchantId,
        );

        if (merchant) {
          setSelectedMerchant(merchant);
          setSelectedProduct(null);
          setCheckout(false);
          setPage("explore");
          return;
        }
      } else if (state.productId) {
        const product = products.find(
          (item) => item.id === state.productId,
        );

        if (product) {
          setSelectedProduct(product);
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

    return () =>
      window.removeEventListener("hashchange", handleHashChange);
  }, []);

  /*
   * SPLASH SCREEN
   *
   * On ne quitte le Splash que lorsque :
   * 1. les 20 secondes sont écoulées ;
   * 2. Supabase a terminé la vérification de session.
   */
  if (!splashFinished || authLoading) {
    return <SplashScreen />;
  }

  if (!authenticated) {
    return <Login />;
  }

  const navigate = (nextPage: Page) => {
    routerService.navigate({
      page: nextPage,
    });
  };

  const openMerchant = (merchant: Merchant) => {
    routerService.navigate({
      page: "explore",
      merchantId: merchant.id,
    });
  };

  const openProduct = (product: Product) => {
    routerService.navigate({
      page: "explore",
      productId: product.id,
    });
  };

  const startCheckout = () => {
    routerService.navigate({
      page: "orders",
      checkout: true,
    });
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

    merchant: (
      <MerchantDashboard
        onReturnToCustomer={returnToCustomer}
      />
    ),

    driver: (
      <DriverHome
        onReturnToCustomer={returnToCustomer}
      />
    ),

    "driver-missions": (
      <DriverMissions
        onReturnToCustomer={returnToCustomer}
      />
    ),

    "driver-history": (
      <DriverHistory
        onReturnToCustomer={returnToCustomer}
      />
    ),

    admin: (
      <AdminDashboard
        onReturnToCustomer={returnToCustomer}
      />
    ),
  };

  const roleDefaultPage: Partial<Record<Role, Page>> = {
    merchant: "merchant",
    driver: "driver",
    admin: "admin",
  };

  const roleAllowedPages: Partial<Record<Role, Page[]>> = {
    driver: [
      "driver",
      "driver-missions",
      "driver-history",
      "profile",
    ],

    merchant: [
      "merchant",
    ],

    admin: [
      "admin",
    ],
  };

  const rolePage =
    activeRole === "customer"
      ? page
      : (
          roleAllowedPages[activeRole]?.includes(page)
            ? page
            : roleDefaultPage[activeRole]
        ) ?? page;

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
    <div
      className={
        isAdmin
          ? "app-shell admin-app-shell"
          : "app-shell"
      }
    >
      {!isAdmin ? (
        <Sidebar
          page={rolePage}
          onNavigate={navigate}
        />
      ) : null}

      <main className="main-content">
        {!isAdmin ? (
          <PageHeader
            page={rolePage}
            onNavigate={navigate}
            canNavigate={activeRole === "customer"}
            unreadCount={unreadNotifications}
            onNotifications={() =>
              setNotificationsOpen(!notificationsOpen)
            }
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
        <Notifications
          onClose={() => setNotificationsOpen(false)}
        />
      ) : null}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={startCheckout}
      />

      <CartConflictModal
        isOpen={Boolean(cartConflict)}
        existingMerchantName={
          cartConflict?.existingMerchantName ?? ""
        }
        newMerchantName={
          cartConflict?.newMerchantName ?? ""
        }
        onCancel={cancelCartReplacement}
        onConfirm={confirmCartReplacement}
      />

      {activeRole === "customer" ? (
        <BottomNavigation
          page={rolePage}
          onNavigate={navigate}
          cartCount={cart.reduce(
            (sum, item) => sum + item.quantity,
            0,
          )}
        />
      ) : activeRole === "driver" ? (
        <BottomNavigation
          page={rolePage}
          onNavigate={navigate}
          variant="driver"
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
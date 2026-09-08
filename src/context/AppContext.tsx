import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  categories as initialCategories,
  initialOrders,
  merchants,
  products,
  user as initialUser,
} from "../data";
import { storage } from "../services/storageService";
import { authService } from "../services/authService";
import { orderService } from "../services/orderService";
import {
  calculateDeliveryFee,
  calculateDistanceMeters,
  calculateSubtotal,
  calculateTotal,
} from "../utils/pricingUtils";
import type {
  Address,
  Category,
  Merchant,
  Notification,
  Order,
  OrderItem,
  OrderStatus,
  Role,
  User,
} from "../types";

export type CartConflict = {
  item: OrderItem;
  existingMerchantName: string;
  newMerchantName: string;
};

export type AuthActionResult = {
  ok: boolean;
  message?: string;
  needsEmailConfirmation?: boolean;
};

type AppContextValue = {
  user: User;
  activeRole: Role;
  authenticated: boolean;
  authLoading: boolean;
  orders: Order[];
  customers: User[];
  categories: Category[];
  favoriteMerchantIds: string[];
  cart: OrderItem[];
  cartMerchant?: Merchant;
  cartTotal: number;
  cartDeliveryFee: number;
  estimateDeliveryFee: (address?: Address) => number;
  notifications: Notification[];
  unreadNotifications: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartConflict: CartConflict | null;
  confirmCartReplacement: () => void;
  cancelCartReplacement: () => void;
  toggleFavorite: (merchantId: string) => void;
  addToCart: (item: OrderItem) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (address?: Address) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => boolean;
  confirmDelivery: (orderId: string, pin: string) => boolean;
  switchRole: (role: Role) => void;
  switchToCustomer: () => void;
  addCategory: (label: string) => Category | null;
  updateCategory: (categoryId: string, label: string) => boolean;
  removeCategory: (categoryId: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addAddress: (
    label: string,
    line: string,
    location?: Address["location"],
  ) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  register: (
    fullName: string,
    phone: string,
    email: string,
    password: string,
  ) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

// Utilisateur "vide" affiché brièvement pendant la vérification de session.
// L'application entière est masquée derrière l'écran de chargement/Login tant
// qu'aucune session Supabase valide n'est confirmée, donc ces valeurs ne sont
// jamais réellement affichées à l'écran.
const emptyUser: User = { name: "", phone: "", initials: "", city: "" };

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(emptyUser);
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState<string[]>(() =>
    storage.get("favorites", [merchants[1].id]),
  );
  const [cart, setCart] = useState<OrderItem[]>(() => storage.get("cart", []));
  const [orders, setOrders] = useState<Order[]>(() =>
    storage.get("orders", initialOrders),
  );
  const [customers, setCustomers] = useState<User[]>(() =>
    storage.get("customers", [initialUser]),
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    storage.get("categories", initialCategories),
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    storage.get("notifications", []),
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartConflict, setCartConflict] = useState<CartConflict | null>(null);

  // Supabase Auth est la seule source de vérité pour l'identité et la session.
  // On écoute la session au montage puis à chaque changement (login, logout,
  // refresh de token, expiration) — jamais le localStorage pour cette décision.
  useEffect(() => {
    let isMounted = true;

    const applySession = async (session: Awaited<ReturnType<typeof authService.getSession>>) => {
      if (!session?.user) {
        if (!isMounted) return;
        setUser(emptyUser);
        setAuthenticated(false);
        setAuthLoading(false);
        return;
      }

      const profile = await authService.ensureProfile(session.user);
      if (!isMounted) return;

      if (!profile) {
        // Session Supabase valide mais profil introuvable/impossible à créer :
        // on ne considère pas l'utilisateur comme authentifié côté app.
        setUser(emptyUser);
        setAuthenticated(false);
        setAuthLoading(false);
        return;
      }

      const cachedAddresses = storage.get<User["addresses"]>(
        `addresses:${profile.id}`,
        [],
      );
      setUser(authService.mapProfileToUser(profile, session.user.email, cachedAddresses));
      setAuthenticated(true);
      setAuthLoading(false);
    };

    authService.getSession().then(applySession);
    const unsubscribe = authService.onAuthStateChange((session) => {
      void applySession(session);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Pont temporaire : tant que les adresses ne sont pas migrées vers Supabase
  // (étape ultérieure), on les garde en local par utilisateur pour ne pas les
  // perdre entre deux sessions. Ceci ne sert jamais à déterminer l'authentification.
  useEffect(() => {
    if (!user.id) return;
    storage.set(`addresses:${user.id}`, user.addresses ?? []);
  }, [user.id, user.addresses]);

  useEffect(
    () => storage.set("favorites", favoriteMerchantIds),
    [favoriteMerchantIds],
  );
  useEffect(() => storage.set("cart", cart), [cart]);
  useEffect(() => storage.set("orders", orders), [orders]);
  useEffect(() => storage.set("customers", customers), [customers]);
  useEffect(() => storage.set("categories", categories), [categories]);
  useEffect(() => storage.set("notifications", notifications), [notifications]);

  const updateCurrentUser = (updater: (prev: User) => User) => {
    setUser((prev) => {
      const next = updater(prev);
      if (next.role === "customer") {
        setCustomers((curr) => {
          const idx = curr.findIndex((c) => c.id === next.id);
          return idx === -1
            ? [...curr, next]
            : curr.map((c, i) => (i === idx ? next : c));
        });
      }
      return next;
    });
  };

  const notify = (message: string, orderId?: string) =>
    setNotifications((current) => [
      {
        id: `notification-${Date.now()}`,
        userId: user.id ?? "customer-001",
        orderId,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

  const toggleFavorite = (merchantId: string) =>
    setFavoriteMerchantIds((current) =>
      current.includes(merchantId)
        ? current.filter((id) => id !== merchantId)
        : [...current, merchantId],
    );

  const cartMerchant = merchants.find(
    (merchant) =>
      merchant.id ===
      products.find((product) => product.id === cart[0]?.productId)?.merchantId,
  );

  const cartTotal = calculateSubtotal(cart);

  const estimateDeliveryFee = (address?: Address) => {
    const distanceMeters = calculateDistanceMeters(
      cartMerchant?.location,
      address?.location,
    );
    return distanceMeters
      ? calculateDeliveryFee(distanceMeters)
      : calculateDeliveryFee(cart, cartMerchant);
  };

  const cartDeliveryFee = estimateDeliveryFee();

  const addToCart = (item: OrderItem) => {
    const itemMerchantId = products.find(
      (product) => product.id === item.productId,
    )?.merchantId;

    if (cartMerchant && itemMerchantId && itemMerchantId !== cartMerchant.id) {
      const newMerchant = merchants.find((m) => m.id === itemMerchantId);
      setCartConflict({
        item,
        existingMerchantName: cartMerchant.name,
        newMerchantName: newMerchant?.name ?? "un autre commerce",
      });
      return false;
    }

    setCart((current) => {
      const existing = current.find(
        (entry) => entry.productId === item.productId,
      );
      return existing
        ? current.map((entry) =>
            entry.productId === item.productId
              ? { ...entry, quantity: entry.quantity + item.quantity }
              : entry,
          )
        : [...current, item];
    });
    return true;
  };

  const confirmCartReplacement = () => {
    if (!cartConflict) return;
    setCart([cartConflict.item]);
    setCartConflict(null);
  };

  const cancelCartReplacement = () => {
    setCartConflict(null);
  };

  const removeFromCart = (productId: string) =>
    setCart((current) =>
      current.flatMap((item) =>
        item.productId === productId && item.quantity > 1
          ? [{ ...item, quantity: item.quantity - 1 }]
          : item.productId === productId
            ? []
            : [item],
      ),
    );

  const clearCart = () => setCart([]);

  const placeOrder = (address?: Address) => {
    if (!cart.length || !cartMerchant) return null;
    const selectedAddress =
      address ?? user.addresses?.find((item) => item.isDefault);
    const subtotal = calculateSubtotal(cart);
    const distanceMeters = calculateDistanceMeters(
      cartMerchant.location,
      selectedAddress?.location,
    );
    const deliveryFee = estimateDeliveryFee(selectedAddress);
    const createdAt = new Date().toISOString();
    const order: Order = {
      id: `order-${Date.now()}`,
      orderNumber: `RB-${new Date().getFullYear()}-${String(orders.length + 124).padStart(6, "0")}`,
      customerId: user.id,
      merchantId: cartMerchant.id,
      merchantName: cartMerchant.name,
      items: cart,
      subtotal,
      deliveryFee,
      discount: 0,
      total: calculateTotal(subtotal, deliveryFee),
      status: "pending",
      paymentStatus: "pending",
      date: "À l’instant",
      createdAt,
      deliveryAddress: selectedAddress?.line ?? user.city,
      deliveryLocation: selectedAddress?.location,
      pickupLocation: cartMerchant.location,
      distanceMeters,
      deliveryPin: String(Math.floor(1000 + Math.random() * 9000)),
    };
    setOrders((current) => [order, ...current]);
    setCart([]);
    notify("Votre commande a été créée.", order.id);
    return order;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || !orderService.canTransition(order.status, status))
      return false;
    setOrders((current) =>
      current.map((item) => (item.id === orderId ? { ...item, status } : item)),
    );
    notify(`Commande mise à jour : ${status.replace("_", " ")}.`, orderId);
    return true;
  };

  const confirmDelivery = (orderId: string, pin: string) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || order.deliveryPin !== pin || order.status !== "delivering")
      return false;
    return updateOrderStatus(orderId, "delivered");
  };

  const switchRole = (role: Role) =>
    updateCurrentUser((current) => ({ ...current, role }));

  const switchToCustomer = () => switchRole("customer");

  const addCategory = (label: string) => {
    const normalizedLabel = label.trim();
    const id = normalizedLabel
      .toLocaleLowerCase("fr-FR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (!id || categories.some((category) => category.id === id)) return null;
    const category = { id, label: normalizedLabel, icon: "CT" };
    setCategories((current) => [...current, category]);
    return category;
  };

  const updateCategory = (categoryId: string, label: string) => {
    const normalizedLabel = label.trim();
    if (
      !normalizedLabel ||
      !categories.some((category) => category.id === categoryId)
    )
      return false;
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? { ...category, label: normalizedLabel }
          : category,
      ),
    );
    return true;
  };

  const removeCategory = (categoryId: string) => {
    if (
      merchants.some((merchant) => merchant.categoryId === categoryId) ||
      products.some((product) => product.categoryId === categoryId)
    )
      return false;
    setCategories((current) =>
      current.filter((category) => category.id !== categoryId),
    );
    return true;
  };

  const markAsRead = (id: string) =>
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );

  const markAllAsRead = () =>
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );

  const addAddress = (
    label: string,
    line: string,
    location?: Address["location"],
  ) =>
    updateCurrentUser((current) => ({
      ...current,
      addresses: [
        ...(current.addresses ?? []),
        {
          id: `address-${Date.now()}`,
          label,
          line,
          location,
          isDefault: !(current.addresses ?? []).length,
        },
      ],
    }));

  const removeAddress = (addressId: string) =>
    updateCurrentUser((current) => ({
      ...current,
      addresses: (current.addresses ?? []).filter(
        (address) => address.id !== addressId,
      ),
    }));

  const setDefaultAddress = (addressId: string) =>
    updateCurrentUser((current) => ({
      ...current,
      addresses: (current.addresses ?? []).map((address) => ({
        ...address,
        isDefault: address.id === addressId,
      })),
    }));

  const login = async (email: string, password: string): Promise<AuthActionResult> => {
    const result = await authService.signIn(email, password);
    if (!result.ok) return { ok: false, message: result.message };
    // La session déclenchée par signIn met à jour user/authenticated via
    // onAuthStateChange (cf. useEffect ci-dessus) — pas besoin de le faire ici.
    return { ok: true };
  };

  const register = async (
    fullName: string,
    phone: string,
    email: string,
    password: string,
  ): Promise<AuthActionResult> => {
    const result = await authService.signUp(email, password, { fullName, phone });
    if (!result.ok) return { ok: false, message: result.message };
    return { ok: true, needsEmailConfirmation: result.needsEmailConfirmation };
  };

  const logout = async () => {
    await authService.signOut();
    // onAuthStateChange se charge de remettre user/authenticated à leur état
    // "déconnecté" dès que Supabase confirme la fin de session.
  };

  const activeRole = user.role ?? "customer";

  const value = {
    user,
    activeRole,
    authenticated,
    authLoading,
    orders,
    customers,
    categories,
    favoriteMerchantIds,
    cart,
    cartMerchant,
    cartTotal,
    cartDeliveryFee,
    estimateDeliveryFee,
    notifications,
    unreadNotifications: notifications.filter(
      (notification) => !notification.read,
    ).length,
    isCartOpen,
    setIsCartOpen,
    cartConflict,
    confirmCartReplacement,
    cancelCartReplacement,
    toggleFavorite,
    addToCart,
    removeFromCart,
    clearCart,
    placeOrder,
    updateOrderStatus,
    confirmDelivery,
    switchRole,
    switchToCustomer,
    addCategory,
    updateCategory,
    removeCategory,
    markAsRead,
    markAllAsRead,
    addAddress,
    removeAddress,
    setDefaultAddress,
    login,
    register,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp doit être utilisé dans AppProvider");
  return context;
}

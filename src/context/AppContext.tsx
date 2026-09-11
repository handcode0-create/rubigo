import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  categories as initialCategories,
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
  ordersLoading: boolean;
  merchantOrders: Order[];
  merchantOrdersLoading: boolean;
  driverOrders: Order[];
  driverOrdersLoading: boolean;
  availableMissions: Order[];
  missionsLoading: boolean;
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
  placeOrder: (address?: Address) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => boolean;
  updateMerchantOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  confirmDelivery: (orderId: string, pin: string) => Promise<{ ok: boolean; message?: string }>;
  acceptMission: (orderId: string) => Promise<boolean>;
  advanceDriverOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  switchRole: (role: Role) => void;
  switchToCustomer: () => void;
  addCategory: (label: string) => Category | null;
  updateCategory: (categoryId: string, label: string) => boolean;
  removeCategory: (categoryId: string) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
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
  updateProfile: (name: string, phone: string) => Promise<AuthActionResult>;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [merchantOrders, setMerchantOrders] = useState<Order[]>([]);
  const [merchantOrdersLoading, setMerchantOrdersLoading] = useState(false);
  const [driverOrders, setDriverOrders] = useState<Order[]>([]);
  const [driverOrdersLoading, setDriverOrdersLoading] = useState(false);
  const [availableMissions, setAvailableMissions] = useState<Order[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
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

  // Commandes réelles : chargées depuis Supabase pour le client connecté,
  // puis synchronisées en temps réel (Realtime) — plus de données locales
  // de démonstration. Les commerces restent pour l'instant des données
  // locales (data.ts) : on ne fait le lien que par nom/identifiant local.
  useEffect(() => {
    if (!authenticated || !user.id) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    let isMounted = true;
    const customerId = user.id;
    const merchantNameById = (merchantId: string) =>
      merchants.find((entry) => entry.id === merchantId)?.name ?? "Commerce RUBIGO";

    const load = async () => {
      setOrdersLoading(true);
      const result = await orderService.fetchOrdersForCustomer(customerId, merchantNameById);
      if (!isMounted) return;
      setOrders(result);
      setOrdersLoading(false);
    };

    load();
    const unsubscribe = orderService.subscribeToCustomerOrders(customerId, () => {
      void load();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authenticated, user.id]);

  // Commandes réelles du commerçant : chargées uniquement pour un profil
  // role='merchant' *relié* à un commerce (profiles.merchant_local_id,
  // assigné manuellement par un admin — cf. migration 0007). Tant que ce
  // lien n'existe pas, on n'affiche rien plutôt que d'inventer des données.
  useEffect(() => {
    if (!authenticated || !user.id || user.role !== "merchant" || !user.merchantLocalId) {
      setMerchantOrders([]);
      setMerchantOrdersLoading(false);
      return;
    }

    let isMounted = true;
    const merchantLocalId = user.merchantLocalId;
    const merchantName =
      merchants.find((entry) => entry.id === merchantLocalId)?.name ?? "Votre commerce";

    const load = async () => {
      setMerchantOrdersLoading(true);
      const result = await orderService.fetchOrdersForMerchant(merchantLocalId, merchantName);
      if (isMounted) setMerchantOrders(result);
      setMerchantOrdersLoading(false);
    };

    load();
    const unsubscribe = orderService.subscribeToMerchantOrders(merchantLocalId, () => {
      void load();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authenticated, user.id, user.role, user.merchantLocalId]);

  // Données livreur réelles : chargées uniquement pour un profil dont le
  // rôle réel (Supabase) est 'driver'. Séparées de `orders` (client) — un
  // livreur voit les commandes qui lui sont assignées, pas les siennes en
  // tant que client.
  useEffect(() => {
    if (!authenticated || !user.id || user.role !== "driver") {
      setDriverOrders([]);
      setAvailableMissions([]);
      return;
    }

    let isMounted = true;
    const driverId = user.id;
    const merchantNameById = (merchantId: string) =>
      merchants.find((entry) => entry.id === merchantId)?.name ?? "Commerce RUBIGO";

    const loadDriverOrders = async () => {
      setDriverOrdersLoading(true);
      const result = await orderService.fetchOrdersForDriver(driverId, merchantNameById);
      if (isMounted) setDriverOrders(result);
      setDriverOrdersLoading(false);
    };

    const loadMissions = async () => {
      setMissionsLoading(true);
      const result = await orderService.fetchAvailableMissions(merchantNameById);
      if (isMounted) setAvailableMissions(result);
      setMissionsLoading(false);
    };

    loadDriverOrders();
    loadMissions();

    const unsubscribeDriver = orderService.subscribeToDriverOrders(driverId, () => {
      void loadDriverOrders();
      void loadMissions();
    });
    const unsubscribeMissions = orderService.subscribeToAvailableMissions(() => {
      void loadMissions();
    });

    return () => {
      isMounted = false;
      unsubscribeDriver();
      unsubscribeMissions();
    };
  }, [authenticated, user.id, user.role]);


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

  const placeOrder = async (address?: Address): Promise<Order | null> => {
    if (!cart.length || !cartMerchant || !user.id) return null;
    const selectedAddress =
      address ?? user.addresses?.find((item) => item.isDefault);
    const subtotal = calculateSubtotal(cart);
    const deliveryFee = estimateDeliveryFee(selectedAddress);
    const total = calculateTotal(subtotal, deliveryFee);

    const order = await orderService.createOrder({
      customerId: user.id,
      merchantId: cartMerchant.id,
      merchantName: cartMerchant.name,
      items: cart,
      subtotal,
      deliveryFee,
      total,
      deliveryAddressText: selectedAddress?.line ?? user.city,
    });

    if (!order) {
      notify("Impossible de créer votre commande pour le moment.");
      return null;
    }

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

  // Côté commerçant — persistance réelle dans Supabase (contrairement à
  // updateOrderStatus ci-dessus, qui ne touche que la copie locale des
  // commandes du client). La policy RLS "orders merchant local update"
  // (migration 0007) est la véritable barrière de sécurité ; canTransition
  // évite ici un aller-retour réseau inutile quand ce n'est de toute façon
  // pas une transition valide.
  const updateMerchantOrderStatus = async (
    orderId: string,
    status: OrderStatus,
  ): Promise<boolean> => {
    const order = merchantOrders.find((item) => item.id === orderId);
    if (!order || !orderService.canTransition(order.status, status)) return false;

    const success = await orderService.updateOrderStatusAsMerchant(orderId, status);
    if (!success) {
      notify("Impossible de mettre à jour cette commande pour le moment.");
      return false;
    }
    notify(`Commande mise à jour : ${status.replace("_", " ")}.`, orderId);
    return true;
  };

  // Remplacé : l'ancienne confirmDelivery comparait le PIN côté frontend et
  // faisait un simple setOrders local — exactement ce que la nouvelle règle
  // de sécurité interdit. Toute la vérification se fait maintenant dans la
  // fonction Supabase confirm_delivery() (SECURITY DEFINER, atomique).
  const confirmDelivery = async (
    orderId: string,
    pin: string,
  ): Promise<{ ok: boolean; message?: string }> => {
    const result = await orderService.confirmDeliveryWithPin(orderId, pin);
    if (!result.ok) {
      const messages: Record<string, string> = {
        not_authorized: "Cette commande ne vous est pas assignée.",
        invalid_status: "Cette commande n'est pas encore prête à être confirmée.",
        already_confirmed: "Cette commande a déjà été confirmée.",
        no_pin: "Aucun code n'est associé à cette commande.",
        too_many_attempts: "Trop de tentatives. Contactez le support RUBIGO.",
        invalid_pin:
          result.attempts_left !== undefined
            ? `Code incorrect (${result.attempts_left} essai${result.attempts_left > 1 ? "s" : ""} restant${result.attempts_left > 1 ? "s" : ""}).`
            : "Code incorrect.",
      };
      return {
        ok: false,
        message: messages[result.error ?? ""] ?? "Impossible de confirmer la livraison.",
      };
    }
    notify("Livraison confirmée.", orderId);
    return { ok: true };
  };

  // ------------------------------------------------------------------
  // CÔTÉ LIVREUR — données réelles (distinctes des commandes du client)
  // ------------------------------------------------------------------
  const acceptMission = async (orderId: string): Promise<boolean> => {
    const result = await orderService.acceptMission(orderId);
    if (!result.ok) {
      notify("Impossible d'accepter cette course (déjà prise ?).");
      return false;
    }
    notify("Course acceptée.", orderId);
    return true;
  };

  const advanceDriverOrderStatus = async (
    orderId: string,
    status: OrderStatus,
  ): Promise<boolean> => {
    const order = driverOrders.find((item) => item.id === orderId);
    if (!order || !orderService.canTransition(order.status, status)) return false;
    const success = await orderService.advanceOrderStatus(orderId, status);
    if (!success) {
      notify("Impossible de mettre à jour cette course pour le moment.");
      return false;
    }
    return true;
  };

  // Annulation réelle par le client (commande encore chez Supabase, pas de
  // simulation locale). La policy RLS "orders customer cancel" refuse déjà
  // toute annulation hors pending/accepted ; canTransition évite un aller-
  // retour réseau inutile quand ce n'est de toute façon pas permis.
  const cancelOrder = async (orderId: string): Promise<boolean> => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || !orderService.canTransition(order.status, "cancelled"))
      return false;

    const success = await orderService.cancelOrder(orderId);
    if (!success) {
      notify("Impossible d'annuler cette commande pour le moment.");
      return false;
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === orderId ? { ...item, status: "cancelled" as OrderStatus } : item,
      ),
    );
    notify("Votre commande a été annulée.", orderId);
    return true;
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

    // signIn() ne fait que valider les identifiants côté Supabase Auth.
    // onAuthStateChange (cf. useEffect ci-dessus) chargera ensuite le profil
    // de façon découplée — ce qui veut dire que si CE chargement échoue
    // (colonne manquante, RLS, réseau...), l'utilisateur ne recevait
    // auparavant AUCUN retour : il restait juste bloqué sur l'écran de
    // connexion sans erreur ni redirection. On vérifie donc ici,
    // explicitement, que la session ET le profil sont bien exploitables
    // avant de renvoyer un succès.
    const session = await authService.getSession();
    if (!session?.user) {
      return { ok: false, message: "La connexion a échoué. Réessayez." };
    }
    const profile = await authService.ensureProfile(session.user);
    if (!profile) {
      return {
        ok: false,
        message: "Connexion réussie mais impossible de charger votre profil. Réessayez dans un instant.",
      };
    }
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

  const updateProfile = async (name: string, phone: string): Promise<AuthActionResult> => {
    if (!user.id) return { ok: false, message: "Vous devez être connecté." };
    const updated = await authService.updateProfile(user.id, { name, phone });
    if (!updated) {
      return { ok: false, message: "Impossible de mettre à jour votre profil pour le moment." };
    }
    setUser((current) => authService.mapProfileToUser(updated, current.email, current.addresses));
    return { ok: true };
  };

  const deleteNotification = (id: string) =>
  setNotifications((current) =>
    current.filter((notification) => notification.id !== id),
  );

  const activeRole = user.role ?? "customer";

  const value = {
    user,
    activeRole,
    authenticated,
    authLoading,
    orders,
    ordersLoading,
    merchantOrders,
    merchantOrdersLoading,
    driverOrders,
    driverOrdersLoading,
    availableMissions,
    missionsLoading,
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
    updateMerchantOrderStatus,
    confirmDelivery,
    acceptMission,
    advanceDriverOrderStatus,
    cancelOrder,
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
    updateProfile,
    deleteNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp doit être utilisé dans AppProvider");
  return context;
}

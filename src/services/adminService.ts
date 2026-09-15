import { merchants } from "../data";
import { supabase } from "../lib/supabaseClient";
import type { OrderStatus } from "../types";

export type AdminRequestType =
  | "merchant_application"
  | "driver_application"
  | "document_review"
  | "account_report";

export type AdminRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended"
  | "cancelled";

export type AdminProfile = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  city?: string;
  initials?: string;
  role?: "customer" | "driver" | "merchant" | "admin";
  isActive?: boolean;
  merchantLocalId?: string;
  createdAt?: string;
};

export type AdminRequest = {
  id: string;
  userId: string;
  requestType: AdminRequestType;
  requestedRole?: "customer" | "driver" | "merchant" | "admin";
  status: AdminRequestStatus;
  title: string;
  note?: string;
  payload: Record<string, unknown>;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  requester?: AdminProfile;
};

export type AdminOrder = {
  id: string;
  orderNumber?: string;
  customerId: string;
  merchantLocalId?: string;
  driverId?: string;
  status: OrderStatus;
  paymentStatus?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  createdAt: string;
};

export type AdminOverview = {
  profiles: AdminProfile[];
  orders: AdminOrder[];
  requests: AdminRequest[];
};

const ORDER_COLUMNS =
  "id, order_number, customer_id, merchant_local_id, driver_id, status, payment_status, subtotal, delivery_fee, discount, total, created_at";

const mapProfile = (row: Record<string, unknown>): AdminProfile => ({
  id: String(row.id ?? ""),
  fullName: String(row.name ?? "Utilisateur"),
  email: typeof row.email === "string" ? row.email : undefined,
  phone: typeof row.phone === "string" ? row.phone : undefined,
  city: typeof row.city === "string" ? row.city : undefined,
  initials: typeof row.initials === "string" ? row.initials : undefined,
  role:
    row.role === "driver" ||
    row.role === "merchant" ||
    row.role === "admin" ||
    row.role === "customer"
      ? row.role
      : "customer",
  isActive: typeof row.is_active === "boolean" ? row.is_active : undefined,
  merchantLocalId:
    typeof row.merchant_local_id === "string"
      ? row.merchant_local_id
      : undefined,
  createdAt: typeof row.created_at === "string" ? row.created_at : undefined,
});

const mapOrder = (row: Record<string, unknown>): AdminOrder => ({
  id: String(row.id ?? ""),
  orderNumber:
    typeof row.order_number === "string" ? row.order_number : undefined,
  customerId: String(row.customer_id ?? ""),
  merchantLocalId:
    typeof row.merchant_local_id === "string"
      ? row.merchant_local_id
      : undefined,
  driverId: typeof row.driver_id === "string" ? row.driver_id : undefined,
  status: row.status as OrderStatus,
  paymentStatus:
    typeof row.payment_status === "string" ? row.payment_status : undefined,
  subtotal: Number(row.subtotal ?? 0),
  deliveryFee: Number(row.delivery_fee ?? 0),
  discount: Number(row.discount ?? 0),
  total: Number(row.total ?? 0),
  createdAt: String(row.created_at ?? ""),
});

const mapRequestProfile = (row: unknown): AdminProfile | undefined => {
  if (!row || typeof row !== "object") return undefined;
  return mapProfile(row as Record<string, unknown>);
};

const mapRequest = (row: Record<string, unknown>): AdminRequest => ({
  id: String(row.id ?? ""),
  userId: String(row.user_id ?? ""),
  requestType: row.request_type as AdminRequestType,
  requestedRole: row.requested_role as AdminRequest["requestedRole"],
  status: row.status as AdminRequestStatus,
  title: String(row.title ?? "Demande RUBIGO"),
  note: typeof row.note === "string" ? row.note : undefined,
  payload:
    row.payload && typeof row.payload === "object"
      ? (row.payload as Record<string, unknown>)
      : {},
  reviewedBy: typeof row.reviewed_by === "string" ? row.reviewed_by : undefined,
  reviewedAt: typeof row.reviewed_at === "string" ? row.reviewed_at : undefined,
  createdAt: String(row.created_at ?? ""),
  updatedAt: String(row.updated_at ?? ""),
  requester: mapRequestProfile(row.profile),
});

const merchantName = (merchantLocalId?: string) =>
  merchants.find((item) => item.id === merchantLocalId)?.name ??
  "Commerce RUBIGO";

const merchantCategory = (merchantLocalId?: string) =>
  merchants.find((item) => item.id === merchantLocalId)?.categoryId ?? "other";

export const adminService = {
  async fetchOverview(): Promise<AdminOverview> {
    const [profilesResult, ordersResult, requestsResult] = await Promise.all([
      supabase.rpc("admin_list_profiles"),

      supabase
        .from("orders")
        .select(ORDER_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(2000),

      supabase.rpc("admin_list_requests"),
    ]);

    if (profilesResult.error) {
      throw new Error(
        `Impossible de charger les profils : ${profilesResult.error.message}`,
      );
    }

    if (ordersResult.error) {
      throw new Error(
        `Impossible de charger les commandes : ${ordersResult.error.message}`,
      );
    }

    if (requestsResult.error) {
      throw new Error(
        `Impossible de charger les demandes : ${requestsResult.error.message}`,
      );
    }

    const profiles = (
      (profilesResult.data ?? []) as Record<string, unknown>[]
    ).map(mapProfile);

    const orders = (ordersResult.data ?? []).map((row) =>
      mapOrder(row as Record<string, unknown>),
    );

    const requests = (
      (requestsResult.data ?? []) as Record<string, unknown>[]
    ).map(mapRequest);

    return {
      profiles,
      orders,
      requests,
    };
  },

  async updateRequestStatus(
    requestId: string,
    status: AdminRequestStatus,
    note?: string,
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc("admin_review_request", {
      p_request_id: requestId,
      p_decision: status,
      p_note: note ?? null,
    });

    return !error && !!data?.success;
  },

  async reviewRequest(
    requestId: string,
    decision: Extract<
      AdminRequestStatus,
      "approved" | "rejected" | "suspended" | "cancelled"
    >,
    note?: string,
  ): Promise<boolean> {
    return this.updateRequestStatus(requestId, decision, note);
  },

  async createRoleRequest(
    userId: string,
    role: "driver" | "merchant",
  ): Promise<boolean> {
    const requestType: AdminRequestType =
      role === "driver" ? "driver_application" : "merchant_application";

    const { error } = await supabase.rpc("submit_professional_request", {
      p_request_type: requestType,
      p_requested_role: role,
      p_title:
        role === "driver"
          ? "Nouvelle demande livreur"
          : "Nouvelle demande commerçant",
      p_note: null,
      p_payload: {},
    });

    // userId reste un argument de compatibilité avec l'ancienne API.
    // La RPC utilise auth.uid() comme source de vérité.
    void userId;

    return !error;
  },

  async submitProfessionalRequest(
    requestType: "merchant_application" | "driver_application",
    requestedRole: "merchant" | "driver",
    title: string,
    note?: string,
    payload: Record<string, unknown> = {},
  ): Promise<string | null> {
    const { data, error } = await supabase.rpc("submit_professional_request", {
      p_request_type: requestType,
      p_requested_role: requestedRole,
      p_title: title,
      p_note: note ?? null,
      p_payload: payload,
    });

    if (error || typeof data !== "string") {
      return null;
    }

    return data;
  },

  getMerchantName: merchantName,
  getMerchantCategory: merchantCategory,
};

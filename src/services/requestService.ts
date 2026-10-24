import apiClient from './api';
import type { StoreItem } from '../types';

export interface QuoteItemInput {
  productId: string;
  colorKey?: string | null;
  quantity: number;
}

export interface QuoteResponseItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  colorKey: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  inStock: boolean;
  leadTimeDays: number;
}

export interface QuoteResponse {
  success: boolean;
  quote: {
    items: QuoteResponseItem[];
    subtotal: number;
    itemCount: number;
    totalUnits: number;
    quotedAt: string;
  };
}

export interface CreateOrderRequestPayload {
  items: Array<{
    productId: string;
    colorKey?: string | null;
    colorLabel?: string | null;
    quantity: number;
  }>;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerType: 'INDIVIDUAL' | 'CORPORATE';
  companyName?: string;
  taxNumber?: string;
  taxOffice?: string;
  city: string;
  district?: string | null;
  addressLine?: string | null;
  preference: 'WHATSAPP' | 'STORE_VISIT';
  preferredStoreId?: string | null;
  note?: string | null;
  kvkkNoticeAcknowledged: boolean;
  marketingConsent?: boolean;
  website?: string;
}

export interface CreateOrderRequestResponse {
  success: boolean;
  message: string;
  code: string;
  publicToken: string;
  status: string;
}

export interface PublicReceiptItem {
  productName: string;
  colorLabel?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PublicReceiptDto {
  code: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  maskedName: string;
  maskedPhone: string;
  city: string;
  district?: string | null;
  preference: 'WHATSAPP' | 'STORE_VISIT';
  preferredStore?: {
    name: string;
    address: string;
    phone: string;
    hours?: string;
    mapUrl?: string;
  } | null;
  items: PublicReceiptItem[];
  subtotal: number;
  officialIbanNotice: string;
  /** Onaydan önce müşteri değişiklik yapabilir / iptal edebilir */
  editable?: boolean;
  verificationKind?: 'TCKN' | 'VKN' | 'PHONE';
  erpSaleCode?: string | null;
}

export interface CustomerUpdatePayload {
  action: 'update' | 'cancel';
  verification: string;
  district?: string;
  addressLine?: string;
  customerEmail?: string;
  note?: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  colorLabel?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: {
    image?: string;
    slug?: string;
  } | null;
}

export interface AdminOrderRequestEvent {
  id: string;
  eventType: string;
  note?: string | null;
  createdAt: string;
}

export type RequestStatusType =
  | 'NEW'
  | 'CONTACTED'
  | 'STORE_VISIT_SCHEDULED'
  | 'AWAITING_PAYMENT'
  | 'PAID_OFFLINE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'SPAM'
  | 'EXPIRED';

export type ErpSyncStatusType = 'PENDING' | 'IN_PROGRESS' | 'SYNCED' | 'FAILED';

export interface AdminOrderRequest {
  id: string;
  code: string;
  publicToken: string;
  status: RequestStatusType;
  preference: 'WHATSAPP' | 'STORE_VISIT';
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerType?: 'INDIVIDUAL' | 'CORPORATE';
  companyName?: string | null;
  taxNumber?: string | null;
  taxOffice?: string | null;
  city: string;
  district?: string | null;
  addressLine?: string | null;
  totalAmount: number;
  erpStatus: ErpSyncStatusType;
  erpSaleCode?: string | null;
  erpSaleId?: string | null;
  erpErrorMessage?: string | null;
  erpLastError?: string | null;
  staffNote?: string | null;
  createdAt: string;
  updatedAt: string;
  preferredStore?: {
    id: string;
    name: string;
    city: string;
  } | null;
  items: AdminOrderItem[];
  events?: AdminOrderRequestEvent[];
}

export interface AdminRequestsResponse {
  success: boolean;
  requests: AdminOrderRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const requestService = {
  /**
   * Sepetteki ürünlerin güncel fiyat ve stok durumunu doğrular
   */
  async quoteCart(items: QuoteItemInput[]): Promise<QuoteResponse> {
    const res = await apiClient.post<QuoteResponse>('/cart/quote', { items });
    return res.data;
  },

  /**
   * Yeni sipariş talebi oluşturur (Idempotency ve honeypot korumalı)
   */
  async createRequest(
    data: CreateOrderRequestPayload,
    idempotencyKey?: string
  ): Promise<CreateOrderRequestResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    const res = await apiClient.post<CreateOrderRequestResponse>('/requests', data, { headers });
    return res.data;
  },

  /** Talep no + cep telefonu ile talebi bulur; fiş bağlantısının anahtarını döndürür */
  async lookup(code: string, phone: string): Promise<string> {
    const res = await apiClient.post<{ success: boolean; publicToken: string }>('/requests/lookup', { code, phone });
    return res.data.publicToken;
  },

  /** Onaydan önce müşteri değişikliği ya da iptali (TCKN/VKN ile doğrulanır) */
  async customerUpdate(token: string, data: CustomerUpdatePayload): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.patch<{ success: boolean; message: string }>(`/requests/public/${token}`, data);
    return res.data;
  },

  /**
   * Maskeli kamuya açık talep fişini sorgular
   */
  async getPublicReceipt(token: string): Promise<PublicReceiptDto> {
    const res = await apiClient.get<{ success: boolean; request: PublicReceiptDto }>(
      `/requests/public/${token}`
    );
    return res.data.request;
  },

  /**
   * Aktif mağaza ve showroom listesini getirir
   */
  async getStores(): Promise<StoreItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; stores: StoreItem[] }>('/stores');
      return (res.data.stores || []).filter((s) => s.isActive !== false);
    } catch {
      return [];
    }
  },

  /**
   * Admin: Talepleri filtrelerle listeler
   */
  async getAdminRequests(params?: {
    status?: string;
    preference?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminRequestsResponse> {
    const res = await apiClient.get<AdminRequestsResponse>('/requests/admin', { params });
    return res.data;
  },

  /**
   * Admin: Belirli bir talebin tüm detayını getirir
   */
  async getAdminRequestById(id: string): Promise<AdminOrderRequest> {
    const res = await apiClient.get<{ success: boolean; request: AdminOrderRequest }>(
      `/requests/admin/${id}`
    );
    return res.data.request;
  },

  /**
   * Admin: Talebin durumunu günceller ve personel notu ekler
   */
  async updateRequestStatus(
    id: string,
    status: AdminOrderRequest['status'],
    staffNote?: string
  ): Promise<AdminOrderRequest> {
    const res = await apiClient.patch<{ success: boolean; request: AdminOrderRequest }>(
      `/requests/admin/${id}/status`,
      { status, staffNote }
    );
    return res.data.request;
  },

  /**
   * Admin: Başarısız ERP senkronizasyonunu yeniden kuyruğa alır
   */
  async retryErpSync(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>(
      `/requests/admin/${id}/retry-erp`
    );
    return res.data;
  },
};

export default requestService;

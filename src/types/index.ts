export interface ProductImages {
  main: string;
  gallery: string[];
}

export interface ProductColorVariant {
  id?: string;
  name: string;
  color?: string; // hex code
  hex?: string;
  image?: string;
  tag?: string;
}

export interface ProductSetPiece {
  id?: string;
  title: string;
  dimensions?: string;
  isOptional?: boolean;
  pieceProductId?: string; // If piece is sold separately, links to real product ID/slug
  pieceProductName?: string;
}

export interface ProductDimensionSpec {
  width?: number;
  depth?: number;
  height?: number;
  raw?: string;
}

/** ERP deneme ürünleri (ERP kodu DNM-<değer>); backend utils/erp.ts ile aynı liste */
export const ERP_PLACEHOLDERS = ['MOBILYA', 'TAKIM', 'KOLTUK', 'MASA'] as const;
export type ErpPlaceholder = (typeof ERP_PLACEHOLDERS)[number];

export interface Product {
  id: string;
  slug?: string;
  product_id?: string;
  name: string;
  category: string | { id: string; name: string; slug: string };
  category_id?: string;
  categoryId?: string;
  color?: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  image: string; // Ana Kapak Görseli (Görsel 1)
  images?: string[] | ProductImages; // [Görsel 1, Görsel 2, Görsel 3]
  image1?: string;
  image2?: string;
  image3?: string;
  badge?: string;
  description: string;
  rating?: number;
  reviewsCount?: number;
  features?: string[];
  dimensions: string; // Ölçüler (Örn: G: 240cm | D: 95cm | Y: 75cm)
  dimensionSpec?: ProductDimensionSpec;
  widthCm?: number;  // Genişlik (X) cm
  depthCm?: number;  // Derinlik (Y) cm
  heightCm?: number; // Yükseklik (Z) cm
  drawerCount?: number; // Çekmece sayısı (örn: 2, 3, 4, 6)
  unitCount?: number;   // Takım/ünite parça sayısı (örn: 1, 2, 3, 4)
  colorOptions?: string[]; // Çoklu renk isimleri (örn: ['Siyah', 'Antrasit', 'Ceviz', 'Gri'])
  createdAt?: string;
  updatedAt?: string;
  material: string; // Malzeme & Kumaş
  setContents?: string[] | string; // Takım İçeriği
  setPieces?: ProductSetPiece[]; // Yapılandırılmış Takım Parçaları
  colors?: ProductColorVariant[]; // Renk Seçenekleri & Görselleri
  selectedColor?: string; // Cart selection
  selectedVariant?: string; // Cart variant selection
  variantId?: string; // Cart variant ID
  selectedPieces?: string[]; // Seçilen Takım Parçaları
  inStock?: boolean;
  leadTimeDays?: number; // Üretim/termin süresi (gün)
  salesCount?: number;
  vatRate?: number;
  erpItemId?: string;
  erpItemCode?: string;
  /** ERP'de karşılığı olmayan ürünün ERP'ye aktarıldığı deneme ürün (admin kabulüyle) */
  erpPlaceholder?: ErpPlaceholder | null;
  erpPlaceholderAckAt?: string | null;
  isPublished?: boolean;
  archivedAt?: string | null;
}

export interface SocialLinksConfig {
  instagram?: string;
  youtube?: string;
  telegram?: string;
  whatsapp?: string;
  facebook?: string;
  tiktok?: string;
}

export interface Category {
  id: string;
  category_id?: string;
  name: string;
  image: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  sortOrder?: number;
}

export interface StoreItem {
  id: string;
  name: string;
  city: string;
  district?: string;
  address: string;
  phone: string;
  email?: string;
  hours?: string;
  image?: string;
  mapUrl?: string;
  isActive?: boolean;
}

export interface CartItem {
  itemKey?: string;
  product: Product;
  quantity: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface UserPresence {
  uid: string;
  online: boolean;
  last_seen: string;
}

export interface LiveChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
}

export interface InventoryLock {
  product_id: string;
  user_id: string;
  locked_quantity: number;
  expires_at: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  coverImage?: string | null;
  category?: string | null;
  tags?: string[];
  author?: string;
  readTimeMin?: number;
  isPublished?: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}


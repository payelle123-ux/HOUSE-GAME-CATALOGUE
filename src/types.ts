export interface Product {
  id: string;
  name: string;
  category: string;
  price: number | string;
  originalPrice?: number | string;
  description: string;
  image: string;
  badge?: "Nouveau" | "Promo" | "Populaire" | "Occasion Révisée" | "Exclusif" | "" | string;
  inStock: boolean;
  featured?: boolean;
  specs?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ShopInfo {
  name: string;
  slogan: string;
  note: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  openingHours: string;
  currency: string;
  adminPin: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc" | "recent";

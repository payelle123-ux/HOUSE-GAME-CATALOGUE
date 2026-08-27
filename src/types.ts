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

export interface RepairService {
  id: string;
  title: string;
  category: string;
  price: string;
  delay: string;
  description: string;
  features: string[];
  icon?: string;
  badge?: string;
  createdAt: number;
}

export interface GamingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  entry: string;
  status: "À venir" | "Inscriptions ouvertes" | "Complet" | "Terminé" | string;
  badge?: string;
  highlights?: string[];
  createdAt: number;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  cashPrize: string;
  entryFee: string;
  date: string;
  time: string;
  location: string;
  maxSlots: number;
  currentSlots: number;
  platform: string;
  format: string;
  rules: string[];
  image: string;
  status: "Inscriptions ouvertes" | "Bientôt disponible" | "Complet" | "Terminé" | string;
  createdAt: number;
}

export interface CustomTabItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image?: string;
  priceOrTag?: string;
  buttonText?: string;
  buttonWhatsAppMessage?: string;
  createdAt: number;
}

export interface CustomTab {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  items: CustomTabItem[];
  createdAt: number;
}

export interface HomeStat {
  label: string;
  value: string;
  desc: string;
}

export interface HomeValue {
  title: string;
  desc: string;
  iconName: string;
}

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  presentationText: string;
  bannerImage: string;
  stats: HomeStat[];
  values: HomeValue[];
}

export type NavTabId = "home" | "shop" | "repair" | "events" | "esport" | string;

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

export interface ShopContact {
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
}

export interface ShopInfo {
  name: string;
  slogan: string;
  note: string;
  phone: string;
  whatsapp: string;
  phonePayelle?: string;
  phoneGaetan?: string;
  phoneFlorence?: string;
  email?: string;
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

export type SortOption = "name-asc" | "recent" | "featured" | "price-asc" | "price-desc";

export interface TickerItem {
  id: string;
  tag: string;
  text: string;
  linkTab?: string;
  highlight?: boolean;
}

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

export interface EventArchivePhoto {
  id: string;
  title: string;
  imageUrl: string;
  editionDate?: string;
  description?: string;
}

export interface HgEventItem {
  id: string;
  title: string;
  slug: "apero-gaming" | "house-game-day" | "hg-challenge" | "question-pour-gameur" | "afro-respawn" | "fashion-week-otaku" | string;
  definition: string;
  coverImage?: string;
  iconName?: string;
  badge?: string;
  hasScheduledEvent?: boolean;
  nextEdition?: {
    title: string;
    date: string;
    time: string;
    location: string;
    flyerUrl: string;
    entryFee?: string;
    description?: string;
    gameOrTheme?: string;
    bookingOpen?: boolean;
    bookingUrl?: string;
  };
  archives: EventArchivePhoto[];
  customLink?: {
    label: string;
    url: string;
    note?: string;
  };
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

export interface HomePartner {
  name: string;
  category: string;
  logo: string;
  tagline: string;
}

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  presentationText: string;
  bannerImage: string;
  stats: HomeStat[];
  partners?: HomePartner[];
  aboutText?: string;
}

export type NavTabId =
  | "home"
  | "shop"
  | "activities"
  | "events"
  | "campus"
  | "service"
  | string;

export interface TickerItem {
  id: string;
  tag: string;
  text: string;
  linkTab?: string;
  highlight?: boolean;
}

export interface CampusModule {
  id: string;
  title: string;
  level: string;
  duration: string;
  iconName?: string;
  color?: string;
  description: string;
  outcomes: string[];
  price?: string;
}

export interface CampusInfo {
  badge: string;
  heroTitle: string;
  heroDescription: string;
  partnerTitle: string;
  partnerDescription: string;
  partnerButtonText: string;
}

export interface ActivityItem {
  id: string;
  orderNumber: number;
  numberStr: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  price?: {
    label: string;
    amount: string;
    period?: string;
  };
  complementaryServices?: string[];
  iconName: string;
  accentColor: "blue" | "amber" | "emerald" | "purple" | "rose" | "cyan";
  targetTab?: NavTabId;
}

export interface ActivitiesBannerInfo {
  badge: string;
  title: string;
  description: string;
  locationTag: string;
  countLabel?: string;
  imageUrl?: string;
}



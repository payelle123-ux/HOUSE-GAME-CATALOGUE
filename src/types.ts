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
  coverFit?: "cover" | "contain";
  coverHeight?: number;
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
  gameCategory?: string;
  cashPrize: string;
  entryFee: string;
  date: string;
  time: string;
  location: string;
  maxSlots: number;
  currentSlots: number;
  platform: string;
  format: "Élimination directe" | "Double élimination" | "Phases de groupes + Finales" | string;
  rules: string[];
  image: string;
  description?: string;
  eligibility?: string;
  status: "Inscriptions ouvertes" | "En cours" | "Bientôt disponible" | "Complet" | "Terminé" | "Suspendu" | string;
  isOfficialLeague?: boolean;
  organizer?: string;
  createdAt: number;
}

export type RegistrationStatus = "en attente" | "validée" | "refusée" | "annulée" | "liste d'attente";

export interface EsportRegistration {
  id: string; // e.g. "REG-2026-001"
  tournamentId: string;
  tournamentTitle: string;
  playerId: string; // e.g. "HGP-1042"
  fullName: string;
  gamerTag: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  platform: string;
  game: string;
  status: RegistrationStatus;
  paymentConfirmed: boolean;
  paymentNote?: string;
  registeredAt: number;
  validatedAt?: number;
  licenseId?: string;
  notes?: string;
}

export type LicenseStatus = "Active" | "Suspendue" | "Expirée";
export type LicenseRankLevel = "Rookie" | "Challenger" | "Pro" | "Élite" | "Master";

export interface EsportLicense {
  id: string; // e.g. "HGE-2026-8492"
  playerId: string;
  gamerTag: string;
  fullName: string;
  phoneMasked: string; // e.g. "+237 6** *** 269"
  photoUrl?: string;
  qrCodeData: string;
  issuedAt: string;
  expiresAt: string;
  status: LicenseStatus;
  rankLevel: LicenseRankLevel;
  gameSpecialties: string[];
  totalPoints: number;
}

export interface EsportPlayer {
  id: string;
  gamerTag: string;
  fullName: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  platform: string;
  favoriteGame: string;
  rankTitle: "Rookie" | "Challenger" | "Pro" | "Élite" | "Master";
  points: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  trophies: number;
  licenseId: string;
  createdAt: number;
}

export interface ScoringRule {
  winPoints: number;
  lossPoints: number;
}

export interface RankingResultEvent {
  id: string;
  playerId?: string;
  gamerTag: string;
  fullName?: string;
  outcome: "win" | "loss";
  playerScore?: number;
  opponentScore?: number;
  scoreDiff?: number;
  opponentTag?: string;
  roundLabel?: string;
  recordedAt: number;
}

export interface CompetitionRankingEntry {
  id: string;
  playerId?: string;
  position: number;
  gamerTag: string;
  fullName?: string;
  points?: number;
  score?: string;
  scoreDiff?: number;
  wins?: number;
  losses?: number;
  matchesPlayed?: number;
  statsNote?: string;
  reward?: string;
  // Optional legacy baseline when migrating older manual rankings without matchHistory
  seedWins?: number;
  seedLosses?: number;
  seedScoreDiff?: number;
}

export interface CompetitionRanking {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  game: string;
  gameCategory?: string;
  date?: string;
  cashPrizePool?: string;
  isPublished: boolean;
  publishedAt?: number;
  updatedAt: number;
  notes?: string;
  scoringRule?: ScoringRule;
  matchHistory?: RankingResultEvent[];
  entries: CompetitionRankingEntry[];
}

export interface EsportAuditLog {
  id: string;
  action: string;
  actor: string;
  targetId?: string;
  targetType?: string;
  oldValue?: string;
  newValue?: string;
  details: string;
  timestamp: number;
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
  id?: string;
  name: string;
  category?: string;
  logo: string;
  tagline?: string;
  websiteUrl?: string;
}

export interface SocialPlatforms {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export interface VenuePhoto {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  createdAt: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  photoUrl?: string;
  bio?: string;
  createdAt: number;
}

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  presentationText: string;
  bannerImage: string;
  stats: HomeStat[];
  partners?: HomePartner[];
  aboutText?: string;
  socialLinks?: SocialPlatforms;
}

export type NavTabId =
  | "home"
  | "about"
  | "shop"
  | "activities"
  | "events"
  | "campus"
  | "service"
  | "esport"
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



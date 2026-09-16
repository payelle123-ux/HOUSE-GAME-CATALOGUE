import {
  Product,
  ShopInfo,
  CartItem,
  RepairService,
  GamingEvent,
  Tournament,
  CustomTab,
  HomeContent,
  TickerItem,
  HgEventItem,
  CampusModule,
  CampusInfo,
} from "../types";
import { INITIAL_PRODUCTS } from "../data/initialData";
import { DEFAULT_INFO } from "../data/logo";
import {
  INITIAL_HOME_CONTENT,
  INITIAL_REPAIR_SERVICES,
  INITIAL_EVENTS,
  INITIAL_TOURNAMENTS,
  INITIAL_HG_EVENTS,
  INITIAL_TICKER_ITEMS,
  INITIAL_CAMPUS_MODULES,
  INITIAL_CAMPUS_INFO,
} from "../data/tabData";

const PRODUCTS_KEY = "hg_products_v3";
const INFO_KEY = "hg_shopinfo_v3";
const CART_KEY = "hg_cart_v3";
const REPAIRS_KEY = "hg_repairs_v3";
const EVENTS_KEY = "hg_events_v3";
const TOURNAMENTS_KEY = "hg_tournaments_v3";
const CUSTOM_TABS_KEY = "hg_custom_tabs_v3";
const HOME_CONTENT_KEY = "hg_home_content_v3";
const HG_EVENTS_KEY = "hg_hgevents_v3";
const TICKER_KEY = "hg_ticker_v3";
const CAMPUS_MODULES_KEY = "hg_campus_modules_v3";
const CAMPUS_INFO_KEY = "hg_campus_info_v3";

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PRODUCTS;
  } catch (err) {
    console.warn("Storage loadProducts fallback:", err);
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): boolean {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return true;
  } catch (err) {
    console.error("Storage saveProducts error:", err);
    return false;
  }
}

export function loadShopInfo(): ShopInfo {
  try {
    const raw = localStorage.getItem(INFO_KEY);
    if (!raw) {
      saveShopInfo(DEFAULT_INFO);
      return DEFAULT_INFO;
    }
    const parsed = JSON.parse(raw);
    const info: ShopInfo = { ...DEFAULT_INFO, ...parsed };

    // Auto-migrate old default Congo numbers or Brazzaville to Cameroon
    if (!info.phonePayelle || info.phonePayelle.includes("06 525") || info.phonePayelle.includes("+242")) {
      info.phonePayelle = "+237 658 413 269";
    }
    if (!info.phoneFlorence || info.phoneFlorence.includes("06 600") || info.phoneFlorence.includes("+242")) {
      info.phoneFlorence = "+237 694 853 477";
    }
    if (!info.phoneGaetan || info.phoneGaetan.includes("05 530") || info.phoneGaetan.includes("+242")) {
      info.phoneGaetan = "+237 695 978 762";
    }
    if (!info.whatsapp || info.whatsapp.includes("+242")) {
      info.whatsapp = "+237 658 413 269";
    }
    if (!info.phone || info.phone.includes("+242")) {
      info.phone = "+237 658 413 269";
    }
    if (!info.address || info.address.includes("Brazzaville")) {
      info.address = "Cameroun - Livraison express & Retrait en boutique";
      info.city = "Cameroun";
    }
    return info;
  } catch (err) {
    console.warn("Storage loadShopInfo fallback:", err);
    return DEFAULT_INFO;
  }
}

export function saveShopInfo(info: ShopInfo): boolean {
  try {
    localStorage.setItem(INFO_KEY, JSON.stringify(info));
    return true;
  } catch (err) {
    console.error("Storage saveShopInfo error:", err);
    return false;
  }
}

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

export function saveCart(cart: CartItem[]): boolean {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return true;
  } catch (err) {
    return false;
  }
}

// Repair Services Storage
export function loadRepairServices(): RepairService[] {
  try {
    const raw = localStorage.getItem(REPAIRS_KEY);
    if (!raw) {
      saveRepairServices(INITIAL_REPAIR_SERVICES);
      return INITIAL_REPAIR_SERVICES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REPAIR_SERVICES;
  } catch (err) {
    return INITIAL_REPAIR_SERVICES;
  }
}

export function saveRepairServices(services: RepairService[]): boolean {
  try {
    localStorage.setItem(REPAIRS_KEY, JSON.stringify(services));
    return true;
  } catch (err) {
    return false;
  }
}

// Events Storage
export function loadEvents(): GamingEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) {
      saveEvents(INITIAL_EVENTS);
      return INITIAL_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EVENTS;
  } catch (err) {
    return INITIAL_EVENTS;
  }
}

export function saveEvents(events: GamingEvent[]): boolean {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return true;
  } catch (err) {
    return false;
  }
}

// Tournaments Storage
export function loadTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(TOURNAMENTS_KEY);
    if (!raw) {
      saveTournaments(INITIAL_TOURNAMENTS);
      return INITIAL_TOURNAMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TOURNAMENTS;
  } catch (err) {
    return INITIAL_TOURNAMENTS;
  }
}

export function saveTournaments(tournaments: Tournament[]): boolean {
  try {
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
    return true;
  } catch (err) {
    return false;
  }
}

// Custom Tabs Storage
export function loadCustomTabs(): CustomTab[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TABS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

export function saveCustomTabs(tabs: CustomTab[]): boolean {
  try {
    localStorage.setItem(CUSTOM_TABS_KEY, JSON.stringify(tabs));
    return true;
  } catch (err) {
    return false;
  }
}

// Home Content Storage
export function loadHomeContent(): HomeContent {
  try {
    const raw = localStorage.getItem(HOME_CONTENT_KEY);
    if (!raw) {
      saveHomeContent(INITIAL_HOME_CONTENT);
      return INITIAL_HOME_CONTENT;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.bannerImage || parsed.bannerImage.includes("photo-1542751371-adc38448a05e")) {
      parsed.bannerImage = INITIAL_HOME_CONTENT.bannerImage;
    }
    return { ...INITIAL_HOME_CONTENT, ...parsed };
  } catch (err) {
    return INITIAL_HOME_CONTENT;
  }
}

export function saveHomeContent(content: HomeContent): boolean {
  try {
    localStorage.setItem(HOME_CONTENT_KEY, JSON.stringify(content));
    return true;
  } catch (err) {
    return false;
  }
}

// Dedicated HG Event Items Storage
export function loadHgEvents(): HgEventItem[] {
  try {
    const raw = localStorage.getItem(HG_EVENTS_KEY);
    if (!raw) {
      saveHgEvents(INITIAL_HG_EVENTS);
      return INITIAL_HG_EVENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_HG_EVENTS;
  } catch (err) {
    return INITIAL_HG_EVENTS;
  }
}

export function saveHgEvents(events: HgEventItem[]): boolean {
  try {
    localStorage.setItem(HG_EVENTS_KEY, JSON.stringify(events));
    return true;
  } catch (err) {
    return false;
  }
}

// Ticker Items Storage
export function loadTickerItems(): TickerItem[] {
  try {
    const raw = localStorage.getItem(TICKER_KEY);
    if (!raw) {
      saveTickerItems(INITIAL_TICKER_ITEMS);
      return INITIAL_TICKER_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TICKER_ITEMS;
  } catch (err) {
    return INITIAL_TICKER_ITEMS;
  }
}

export function saveTickerItems(items: TickerItem[]): boolean {
  try {
    localStorage.setItem(TICKER_KEY, JSON.stringify(items));
    return true;
  } catch (err) {
    return false;
  }
}

// Campus Modules & Info Storage
export function loadCampusModules(): CampusModule[] {
  try {
    const raw = localStorage.getItem(CAMPUS_MODULES_KEY);
    if (!raw) {
      saveCampusModules(INITIAL_CAMPUS_MODULES);
      return INITIAL_CAMPUS_MODULES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CAMPUS_MODULES;
  } catch (err) {
    return INITIAL_CAMPUS_MODULES;
  }
}

export function saveCampusModules(modules: CampusModule[]): boolean {
  try {
    localStorage.setItem(CAMPUS_MODULES_KEY, JSON.stringify(modules));
    return true;
  } catch (err) {
    return false;
  }
}

export function loadCampusInfo(): CampusInfo {
  try {
    const raw = localStorage.getItem(CAMPUS_INFO_KEY);
    if (!raw) {
      saveCampusInfo(INITIAL_CAMPUS_INFO);
      return INITIAL_CAMPUS_INFO;
    }
    const parsed = JSON.parse(raw);
    return { ...INITIAL_CAMPUS_INFO, ...parsed };
  } catch (err) {
    return INITIAL_CAMPUS_INFO;
  }
}

export function saveCampusInfo(info: CampusInfo): boolean {
  try {
    localStorage.setItem(CAMPUS_INFO_KEY, JSON.stringify(info));
    return true;
  } catch (err) {
    return false;
  }
}


export function formatPrice(value: number | string, currency: string = "FCFA"): string {
  const n = Number(value);
  if (Number.isNaN(n) || value === "" || value === undefined) return "Sur devis";
  return `${n.toLocaleString("fr-FR")} ${currency}`;
}

export function compressImage(file: File, maxDim = 1000, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.fillStyle = "#0A0C12";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Image illisible"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Erreur de lecture"));
    reader.readAsDataURL(file);
  });
}

// WhatsApp URL Generators
export function buildWhatsAppProductUrl(phone: string, product: Product, currency: string = "FCFA"): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const priceStr = formatPrice(product.price, currency);
  const text = `🎮 *Bonjour House Game !*\n\nJe souhaite commander cet article depuis votre catalogue :\n\n📌 *Produit :* ${product.name}\n🏷️ *Catégorie :* ${product.category || "Gaming"}\n💰 *Prix :* ${priceStr}\n\nEst-il disponible actuellement pour livraison ? Merci !`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppCartUrl(
  phone: string,
  items: CartItem[],
  clientName = "",
  clientAddress = "",
  currency: string = "FCFA"
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const total = items.reduce(
    (acc, item) => acc + (Number(item.product.price) || 0) * item.quantity,
    0
  );

  let listStr = "";
  items.forEach((item, index) => {
    const itemTotal = (Number(item.product.price) || 0) * item.quantity;
    listStr += `${index + 1}. *${item.product.name}* (x${item.quantity}) - ${formatPrice(itemTotal, currency)}\n`;
  });

  let text = `🎮 *COMMANDE HOUSE GAME*\n\n`;
  if (clientName) text += `👤 *Client :* ${clientName}\n`;
  if (clientAddress) text += `📍 *Adresse/Ville :* ${clientAddress}\n`;
  text += `\n📦 *Articles commandés :*\n${listStr}\n`;
  text += `💵 *TOTAL ESTIMÉ :* *${formatPrice(total, currency)}*\n\n`;
  text += `Merci de me confirmer la disponibilité et les modalités de livraison !`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppRepairQuoteUrl(
  phone: string,
  data: {
    deviceType: string;
    model: string;
    issue: string;
    urgency: string;
    clientName?: string;
  }
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  let text = `🛠️ *DEMANDE DE DEVIS EXPRESS - ATELIER HOUSE GAME*\n\n`;
  if (data.clientName) text += `👤 *Client :* ${data.clientName}\n`;
  text += `🎮 *Appareil :* ${data.deviceType} (${data.model || "Modèle standard"})\n`;
  text += `⚡ *Panne / Problème :* ${data.issue}\n`;
  text += `⏱️ *Délai souhaité :* ${data.urgency}\n\n`;
  text += `Pouvez-vous me donner un tarif estimatif et la disponibilité pour la prise en charge à l'atelier ? Merci !`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppTournamentRegistrationUrl(
  phone: string,
  data: {
    tournament: Tournament;
    gamerTag: string;
    fullName: string;
    playerPhone: string;
    preferredPlatform?: string;
  }
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  let text = `🏆 *INSCRIPTION TOURNOI ESPORT - HOUSE GAME*\n\n`;
  text += `🎮 *Tournoi :* ${data.tournament.title}\n`;
  text += `🕹️ *Jeu :* ${data.tournament.game}\n`;
  text += `💰 *Cash Prize :* ${data.tournament.cashPrize}\n`;
  text += `📅 *Date :* ${data.tournament.date} (${data.tournament.time})\n\n`;
  text += `*--- INFORMATIONS DU PARTICIPANT ---*\n`;
  text += `👑 *Pseudo Gamer / Tag :* ${data.gamerTag}\n`;
  text += `👤 *Nom complet :* ${data.fullName}\n`;
  text += `📞 *Téléphone / WhatsApp :* ${data.playerPhone}\n`;
  if (data.preferredPlatform) text += `🎮 *Plateforme :* ${data.preferredPlatform}\n`;
  text += `💵 *Frais d'inscription :* ${data.tournament.entryFee}\n\n`;
  text += `Merci de confirmer la validation de ma place dans le tournoi !`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppEventRsvpUrl(
  phone: string,
  data: {
    event: GamingEvent;
    fullName: string;
    participantsCount: number;
  }
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  let text = `🎉 *RÉSERVATION ÉVÉNEMENT - HOUSE GAME*\n\n`;
  text += `✨ *Événement :* ${data.event.title}\n`;
  text += `📅 *Date :* ${data.event.date} à ${data.event.time}\n`;
  text += `📍 *Lieu :* ${data.event.location}\n`;
  text += `👤 *Nom :* ${data.fullName}\n`;
  text += `👥 *Nombre de personnes :* ${data.participantsCount}\n\n`;
  text += `Merci de réserver ma place !`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  writeBatch,
  limit,
  query,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import {
  Product,
  ShopInfo,
  RepairService,
  GamingEvent,
  Tournament,
  CustomTab,
  HomeContent,
  ActivityItem,
  ActivitiesBannerInfo,
  HgEventItem,
} from "../types";
import { INITIAL_PRODUCTS } from "../data/initialData";
import { DEFAULT_INFO } from "../data/logo";
import {
  INITIAL_HOME_CONTENT,
  INITIAL_REPAIR_SERVICES,
  INITIAL_EVENTS,
  INITIAL_TOURNAMENTS,
  INITIAL_ACTIVITIES,
  DEFAULT_ACTIVITIES_BANNER,
  INITIAL_HG_EVENTS,
} from "../data/tabData";
import {
  firestoreCache,
  DEFAULT_TTLS,
} from "./firestoreCache";
import {
  loadProducts,
  saveProducts,
  loadShopInfo,
  saveShopInfo,
  loadRepairServices,
  saveRepairServices,
  loadEvents,
  saveEvents,
  loadTournaments,
  saveTournaments,
  loadCustomTabs,
  saveCustomTabs,
  loadHomeContent,
  saveHomeContent,
  loadActivities,
  saveActivities,
  loadActivitiesBanner,
  saveActivitiesBanner,
  loadHgEvents,
  saveHgEvents,
} from "./storage";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isQuota = firestoreCache.isQuotaError(error);

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  if (isQuota) {
    console.warn("Firestore Quota Limit notice (resilient cache mode active):", JSON.stringify(errInfo));
    return;
  }

  console.warn("Firestore notice:", JSON.stringify(errInfo));
}

const PRODUCTS_COLL = "products";
const SETTINGS_COLL = "settings";
const REPAIRS_COLL = "repair_services";
const EVENTS_COLL = "events";
const TOURNAMENTS_COLL = "tournaments";
const CUSTOM_TABS_COLL = "custom_tabs";
const HOME_COLL = "home_content";
const STORE_DOC_ID = "housegame_info";
const HOME_DOC_ID = "overview";
const ACTIVITIES_DOC_ID = "activities_list";
const ACTIVITIES_BANNER_DOC_ID = "activities_banner";
const HG_EVENTS_DOC_ID = "hg_events_official";

// Active subscribers registry for local cache broadcasts
const productsSubscribers = new Set<(products: Product[]) => void>();
const shopInfoSubscribers = new Set<(info: ShopInfo) => void>();
const repairSubscribers = new Set<(repairs: RepairService[]) => void>();
const eventsSubscribers = new Set<(events: GamingEvent[]) => void>();
const tournamentsSubscribers = new Set<(tournaments: Tournament[]) => void>();
const customTabsSubscribers = new Set<(tabs: CustomTab[]) => void>();
const homeSubscribers = new Set<(content: HomeContent) => void>();
const activitiesSubscribers = new Set<(activities: ActivityItem[]) => void>();
const bannerSubscribers = new Set<(banner: ActivitiesBannerInfo) => void>();
const hgEventsSubscribers = new Set<(events: HgEventItem[]) => void>();

// ==================== PRODUCTS (CACHE-FIRST WITH TTL) ====================

export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: unknown) => void
): () => void {
  productsSubscribers.add(onUpdate);

  // 1. Deliver cached data immediately (0ms latency, zero layout shift)
  const cached = firestoreCache.get<Product[]>("products", "hg_products_v3");
  const initialData = cached?.data || loadProducts();
  onUpdate(initialData);

  // 2. If cache is fresh or quota cooldown active, skip network read
  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      productsSubscribers.delete(onUpdate);
    };
  }

  // 3. Stale-while-revalidate: Fetch once via deduplicated getDocs
  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_products", async () => {
      const q = query(collection(db, PRODUCTS_COLL), limit(150));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        if (!initialData || initialData.length === 0) {
          await seedInitialProducts(INITIAL_PRODUCTS);
          return INITIAL_PRODUCTS;
        }
        return initialData;
      }

      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        products.push({
          id: docSnap.id,
          name: data.name || "",
          category: data.category || "Gaming",
          price: Number(data.price) || 0,
          originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
          description: data.description || "",
          image: data.image || "",
          badge: data.badge || "",
          inStock: data.inStock !== false,
          featured: Boolean(data.featured),
          specs: Array.isArray(data.specs) ? data.specs : [],
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
        });
      });

      products.sort((a, b) => b.createdAt - a.createdAt);
      return products;
    })
    .then((freshProducts) => {
      if (isCancelled) return;
      firestoreCache.set("products", freshProducts, DEFAULT_TTLS.PRODUCTS, "hg_products_v3");
      saveProducts(freshProducts);
      productsSubscribers.forEach((cb) => {
        try { cb(freshProducts); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      handleFirestoreError(err, OperationType.LIST, PRODUCTS_COLL);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    productsSubscribers.delete(onUpdate);
  };
}

export async function saveProductCloud(product: Product): Promise<void> {
  const current = loadProducts();
  const index = current.findIndex((p) => p.id === product.id);
  const updatedList = index >= 0
    ? current.map((p) => (p.id === product.id ? product : p))
    : [product, ...current];

  // Optimistic memory & local cache update
  firestoreCache.set("products", updatedList, DEFAULT_TTLS.PRODUCTS, "hg_products_v3");
  saveProducts(updatedList);
  productsSubscribers.forEach((cb) => {
    try { cb(updatedList); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, PRODUCTS_COLL, product.id);
    const cleanData = {
      id: product.id,
      name: product.name,
      category: product.category || "Gaming",
      price: Number(product.price) || 0,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      description: product.description || "",
      image: product.image || "",
      badge: product.badge || "",
      inStock: product.inStock !== false,
      featured: Boolean(product.featured),
      specs: Array.isArray(product.specs) ? product.specs : [],
      createdAt: product.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${PRODUCTS_COLL}/${product.id}`);
  }
}

export async function deleteProductCloud(productId: string): Promise<void> {
  const current = loadProducts();
  const updatedList = current.filter((p) => p.id !== productId);

  firestoreCache.set("products", updatedList, DEFAULT_TTLS.PRODUCTS, "hg_products_v3");
  saveProducts(updatedList);
  productsSubscribers.forEach((cb) => {
    try { cb(updatedList); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, PRODUCTS_COLL, productId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${PRODUCTS_COLL}/${productId}`);
  }
}

export async function seedInitialProducts(products: Product[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    products.forEach((p) => {
      const docRef = doc(db, PRODUCTS_COLL, p.id);
      batch.set(
        docRef,
        {
          ...p,
          price: Number(p.price) || 0,
          createdAt: p.createdAt || Date.now(),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    });
    await batch.commit();
  } catch (err) {
    console.warn("Failed to seed initial products:", err);
  }
}

export async function restoreCatalogCloud(newProducts: Product[]): Promise<void> {
  firestoreCache.set("products", newProducts, DEFAULT_TTLS.PRODUCTS, "hg_products_v3");
  saveProducts(newProducts);
  productsSubscribers.forEach((cb) => {
    try { cb(newProducts); } catch { /* ignore */ }
  });

  try {
    const existingDocs = await getDocs(collection(db, PRODUCTS_COLL));
    const batch = writeBatch(db);

    existingDocs.forEach((d) => {
      batch.delete(d.ref);
    });

    newProducts.forEach((p) => {
      const docRef = doc(db, PRODUCTS_COLL, p.id);
      batch.set(docRef, {
        ...p,
        price: Number(p.price) || 0,
        createdAt: p.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, PRODUCTS_COLL);
  }
}

// ==================== STORE SETTINGS (CACHE-FIRST) ====================

export function subscribeToShopInfo(
  onUpdate: (info: ShopInfo) => void,
  onError?: (error: unknown) => void
): () => void {
  shopInfoSubscribers.add(onUpdate);

  const cached = firestoreCache.get<ShopInfo>("shop_info", "hg_shopinfo_v3");
  const initial = cached?.data || loadShopInfo();
  onUpdate(initial);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      shopInfoSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_shop_info", async () => {
      const docRef = doc(db, SETTINGS_COLL, STORE_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...DEFAULT_INFO, ...(snap.data() as ShopInfo) };
      }
      return initial;
    })
    .then((freshInfo) => {
      if (isCancelled) return;
      firestoreCache.set("shop_info", freshInfo, DEFAULT_TTLS.SHOP_INFO, "hg_shopinfo_v3");
      saveShopInfo(freshInfo);
      shopInfoSubscribers.forEach((cb) => {
        try { cb(freshInfo); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      handleFirestoreError(err, OperationType.GET, `${SETTINGS_COLL}/${STORE_DOC_ID}`);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    shopInfoSubscribers.delete(onUpdate);
  };
}

export async function saveShopInfoCloud(info: ShopInfo): Promise<void> {
  firestoreCache.set("shop_info", info, DEFAULT_TTLS.SHOP_INFO, "hg_shopinfo_v3");
  saveShopInfo(info);
  shopInfoSubscribers.forEach((cb) => {
    try { cb(info); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, SETTINGS_COLL, STORE_DOC_ID);
    await setDoc(docRef, { ...info, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SETTINGS_COLL}/${STORE_DOC_ID}`);
  }
}

// ==================== REPAIR SERVICES (CACHE-FIRST) ====================

export function subscribeToRepairServices(
  onUpdate: (services: RepairService[]) => void,
  onError?: (error: unknown) => void
): () => void {
  repairSubscribers.add(onUpdate);

  const cached = firestoreCache.get<RepairService[]>("repairs", "hg_repairs_v3");
  const initial = cached?.data || loadRepairServices();
  onUpdate(initial);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      repairSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_repairs", async () => {
      const q = query(collection(db, REPAIRS_COLL), limit(100));
      const snap = await getDocs(q);
      if (snap.empty) {
        return initial.length > 0 ? initial : INITIAL_REPAIR_SERVICES;
      }
      const list: RepairService[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || "",
          category: d.category || "Atelier",
          price: d.price || "Sur devis",
          delay: d.delay || "24h - 48h",
          description: d.description || "",
          features: Array.isArray(d.features) ? d.features : [],
          icon: d.icon || "Wrench",
          badge: d.badge || "",
          createdAt: d.createdAt || Date.now(),
        });
      });
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return list;
    })
    .then((fresh) => {
      if (isCancelled) return;
      firestoreCache.set("repairs", fresh, DEFAULT_TTLS.REPAIR_SERVICES, "hg_repairs_v3");
      saveRepairServices(fresh);
      repairSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      handleFirestoreError(err, OperationType.LIST, REPAIRS_COLL);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    repairSubscribers.delete(onUpdate);
  };
}

export async function saveRepairServiceCloud(service: RepairService): Promise<void> {
  const current = loadRepairServices();
  const updated = current.some((s) => s.id === service.id)
    ? current.map((s) => (s.id === service.id ? service : s))
    : [service, ...current];

  firestoreCache.set("repairs", updated, DEFAULT_TTLS.REPAIR_SERVICES, "hg_repairs_v3");
  saveRepairServices(updated);
  repairSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, REPAIRS_COLL, service.id);
    await setDoc(docRef, service, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${REPAIRS_COLL}/${service.id}`);
  }
}

export async function deleteRepairServiceCloud(serviceId: string): Promise<void> {
  const current = loadRepairServices();
  const updated = current.filter((s) => s.id !== serviceId);

  firestoreCache.set("repairs", updated, DEFAULT_TTLS.REPAIR_SERVICES, "hg_repairs_v3");
  saveRepairServices(updated);
  repairSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, REPAIRS_COLL, serviceId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${REPAIRS_COLL}/${serviceId}`);
  }
}

// ==================== EVENTS (CACHE-FIRST) ====================

export function subscribeToEvents(
  onUpdate: (events: GamingEvent[]) => void,
  onError?: (error: unknown) => void
): () => void {
  eventsSubscribers.add(onUpdate);

  const cached = firestoreCache.get<GamingEvent[]>("events", "hg_events_v3");
  const initial = cached?.data || loadEvents();
  onUpdate(initial);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      eventsSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_events", async () => {
      const q = query(collection(db, EVENTS_COLL), limit(50));
      const snap = await getDocs(q);
      if (snap.empty) {
        return initial.length > 0 ? initial : INITIAL_EVENTS;
      }
      const list: GamingEvent[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || "",
          date: d.date || "",
          time: d.time || "",
          location: d.location || "",
          description: d.description || "",
          image: d.image || "",
          entry: d.entry || "Gratuit",
          status: d.status || "À venir",
          badge: d.badge || "",
          highlights: Array.isArray(d.highlights) ? d.highlights : [],
          createdAt: d.createdAt || Date.now(),
        });
      });
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return list;
    })
    .then((fresh) => {
      if (isCancelled) return;
      firestoreCache.set("events", fresh, DEFAULT_TTLS.EVENTS, "hg_events_v3");
      saveEvents(fresh);
      eventsSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      handleFirestoreError(err, OperationType.LIST, EVENTS_COLL);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    eventsSubscribers.delete(onUpdate);
  };
}

export async function saveEventCloud(event: GamingEvent): Promise<void> {
  const current = loadEvents();
  const updated = current.some((e) => e.id === event.id)
    ? current.map((e) => (e.id === event.id ? event : e))
    : [event, ...current];

  firestoreCache.set("events", updated, DEFAULT_TTLS.EVENTS, "hg_events_v3");
  saveEvents(updated);
  eventsSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, EVENTS_COLL, event.id);
    const sanitized = JSON.parse(JSON.stringify(event));
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${EVENTS_COLL}/${event.id}`);
  }
}

export async function deleteEventCloud(eventId: string): Promise<void> {
  const current = loadEvents();
  const updated = current.filter((e) => e.id !== eventId);

  firestoreCache.set("events", updated, DEFAULT_TTLS.EVENTS, "hg_events_v3");
  saveEvents(updated);
  eventsSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, EVENTS_COLL, eventId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${EVENTS_COLL}/${eventId}`);
  }
}

// ==================== TOURNAMENTS (CACHE-FIRST) ====================

export function subscribeToTournaments(
  onUpdate: (tournaments: Tournament[]) => void,
  onError?: (error: unknown) => void
): () => void {
  tournamentsSubscribers.add(onUpdate);

  const cached = firestoreCache.get<Tournament[]>("tournaments", "hg_tournaments_v3");
  const initial = cached?.data || loadTournaments();
  onUpdate(initial);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      tournamentsSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_tournaments", async () => {
      const q = query(collection(db, TOURNAMENTS_COLL), limit(50));
      const snap = await getDocs(q);
      if (snap.empty) {
        return initial.length > 0 ? initial : [];
      }
      const list: Tournament[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || "",
          game: d.game || "",
          cashPrize: d.cashPrize || "0 FCFA",
          entryFee: d.entryFee || "Gratuit",
          date: d.date || "",
          time: d.time || "",
          location: d.location || "",
          maxSlots: Number(d.maxSlots) || 32,
          currentSlots: Number(d.currentSlots) || 0,
          platform: d.platform || "PlayStation 5",
          format: d.format || "1v1",
          rules: Array.isArray(d.rules) ? d.rules : [],
          image: d.image || "",
          status: d.status || "Inscriptions ouvertes",
          createdAt: d.createdAt || Date.now(),
        });
      });
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return list;
    })
    .then((fresh) => {
      if (isCancelled) return;
      firestoreCache.set("tournaments", fresh, DEFAULT_TTLS.TOURNAMENTS, "hg_tournaments_v3");
      saveTournaments(fresh);
      tournamentsSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      handleFirestoreError(err, OperationType.LIST, TOURNAMENTS_COLL);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    tournamentsSubscribers.delete(onUpdate);
  };
}

export async function saveTournamentCloud(tournament: Tournament): Promise<void> {
  const current = loadTournaments();
  const updated = current.some((t) => t.id === tournament.id)
    ? current.map((t) => (t.id === tournament.id ? tournament : t))
    : [tournament, ...current];

  firestoreCache.set("tournaments", updated, DEFAULT_TTLS.TOURNAMENTS, "hg_tournaments_v3");
  saveTournaments(updated);
  tournamentsSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, TOURNAMENTS_COLL, tournament.id);
    await setDoc(docRef, tournament, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${TOURNAMENTS_COLL}/${tournament.id}`);
  }
}

export async function deleteTournamentCloud(tournamentId: string): Promise<void> {
  const current = loadTournaments();
  const updated = current.filter((t) => t.id !== tournamentId);

  firestoreCache.set("tournaments", updated, DEFAULT_TTLS.TOURNAMENTS, "hg_tournaments_v3");
  saveTournaments(updated);
  tournamentsSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, TOURNAMENTS_COLL, tournamentId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${TOURNAMENTS_COLL}/${tournamentId}`);
  }
}

// ==================== CUSTOM TABS (CACHE-FIRST) ====================

export function subscribeToCustomTabs(
  onUpdate: (tabs: CustomTab[]) => void,
  onError?: (error: unknown) => void
): () => void {
  customTabsSubscribers.add(onUpdate);

  const cached = firestoreCache.get<CustomTab[]>("custom_tabs", "hg_custom_tabs_v3");
  const initial = cached?.data || loadCustomTabs();
  onUpdate(initial);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      customTabsSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_custom_tabs", async () => {
      const q = query(collection(db, CUSTOM_TABS_COLL), limit(30));
      const snap = await getDocs(q);
      const list: CustomTab[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || "Nouvel Onglet",
          slug: d.slug || docSnap.id,
          icon: d.icon || "Sparkles",
          description: d.description || "",
          items: Array.isArray(d.items) ? d.items : [],
          createdAt: d.createdAt || Date.now(),
        });
      });
      list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      return list;
    })
    .then((fresh) => {
      if (isCancelled) return;
      firestoreCache.set("custom_tabs", fresh, DEFAULT_TTLS.CUSTOM_TABS, "hg_custom_tabs_v3");
      saveCustomTabs(fresh);
      customTabsSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      handleFirestoreError(err, OperationType.LIST, CUSTOM_TABS_COLL);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    customTabsSubscribers.delete(onUpdate);
  };
}

export async function saveCustomTabCloud(tab: CustomTab): Promise<void> {
  const current = loadCustomTabs();
  const updated = current.some((t) => t.id === tab.id)
    ? current.map((t) => (t.id === tab.id ? tab : t))
    : [...current, tab];

  firestoreCache.set("custom_tabs", updated, DEFAULT_TTLS.CUSTOM_TABS, "hg_custom_tabs_v3");
  saveCustomTabs(updated);
  customTabsSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, CUSTOM_TABS_COLL, tab.id);
    await setDoc(docRef, tab, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${CUSTOM_TABS_COLL}/${tab.id}`);
  }
}

export async function deleteCustomTabCloud(tabId: string): Promise<void> {
  const current = loadCustomTabs();
  const updated = current.filter((t) => t.id !== tabId);

  firestoreCache.set("custom_tabs", updated, DEFAULT_TTLS.CUSTOM_TABS, "hg_custom_tabs_v3");
  saveCustomTabs(updated);
  customTabsSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, CUSTOM_TABS_COLL, tabId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${CUSTOM_TABS_COLL}/${tabId}`);
  }
}

// ==================== HOME OVERVIEW CONTENT (CACHE-FIRST) ====================

export function subscribeToHomeContent(
  onUpdate: (content: HomeContent) => void,
  onError?: (error: unknown) => void
): () => void {
  homeSubscribers.add(onUpdate);

  const cached = firestoreCache.get<HomeContent>("home_content", "hg_home_content_v3");
  const initial = cached?.data || loadHomeContent();
  onUpdate(initial);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      homeSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_home_content", async () => {
      const docRef = doc(db, HOME_COLL, HOME_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as HomeContent;
        let banner = data.bannerImage;
        if (
          !banner ||
          banner.includes("photo-1542751371-adc38448a05e") ||
          banner.includes("house_game_banner_1789577924653")
        ) {
          banner = INITIAL_HOME_CONTENT.bannerImage;
        }
        return { ...INITIAL_HOME_CONTENT, ...data, bannerImage: banner };
      }
      return initial;
    })
    .then((fresh) => {
      if (isCancelled) return;
      firestoreCache.set("home_content", fresh, DEFAULT_TTLS.HOME_CONTENT, "hg_home_content_v3");
      saveHomeContent(fresh);
      homeSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      handleFirestoreError(err, OperationType.GET, `${HOME_COLL}/${HOME_DOC_ID}`);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    homeSubscribers.delete(onUpdate);
  };
}

export async function saveHomeContentCloud(content: HomeContent): Promise<void> {
  firestoreCache.set("home_content", content, DEFAULT_TTLS.HOME_CONTENT, "hg_home_content_v3");
  saveHomeContent(content);
  homeSubscribers.forEach((cb) => {
    try { cb(content); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, HOME_COLL, HOME_DOC_ID);
    await setDoc(docRef, { ...content, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${HOME_COLL}/${HOME_DOC_ID}`);
  }
}

export async function updateBannerImageCloud(bannerImage: string): Promise<void> {
  const current = loadHomeContent();
  const updated = { ...current, bannerImage };

  firestoreCache.set("home_content", updated, DEFAULT_TTLS.HOME_CONTENT, "hg_home_content_v3");
  saveHomeContent(updated);
  homeSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, HOME_COLL, HOME_DOC_ID);
    await setDoc(docRef, { bannerImage, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${HOME_COLL}/${HOME_DOC_ID}`);
  }
}

// ==================== ACTIVITIES (NOS ACTIVITÉS) (CACHE-FIRST) ====================

export function subscribeToActivities(
  onUpdate: (activities: ActivityItem[]) => void,
  onError?: (error: unknown) => void
): () => void {
  activitiesSubscribers.add(onUpdate);

  const cached = firestoreCache.get<ActivityItem[]>("activities", "hg_activities_v3");
  const initial = cached?.data || loadActivities();
  onUpdate(initial.length > 0 ? initial : INITIAL_ACTIVITIES);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      activitiesSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_activities", async () => {
      const docRef = doc(db, HOME_COLL, ACTIVITIES_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          return data.items as ActivityItem[];
        }
      }
      return initial.length > 0 ? initial : INITIAL_ACTIVITIES;
    })
    .then((fresh) => {
      if (isCancelled) return;
      firestoreCache.set("activities", fresh, DEFAULT_TTLS.ACTIVITIES, "hg_activities_v3");
      saveActivities(fresh);
      activitiesSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      handleFirestoreError(err, OperationType.GET, `${HOME_COLL}/${ACTIVITIES_DOC_ID}`);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    activitiesSubscribers.delete(onUpdate);
  };
}

export async function saveActivitiesCloud(activities: ActivityItem[]): Promise<void> {
  firestoreCache.set("activities", activities, DEFAULT_TTLS.ACTIVITIES, "hg_activities_v3");
  saveActivities(activities);
  activitiesSubscribers.forEach((cb) => {
    try { cb(activities); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, HOME_COLL, ACTIVITIES_DOC_ID);
    await setDoc(
      docRef,
      { items: activities, count: activities.length, updatedAt: Date.now() },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${HOME_COLL}/${ACTIVITIES_DOC_ID}`);
  }
}

// ==================== ACTIVITIES BANNER (CACHE-FIRST) ====================

export function subscribeToActivitiesBanner(
  onUpdate: (banner: ActivitiesBannerInfo) => void,
  onError?: (error: unknown) => void
): () => void {
  bannerSubscribers.add(onUpdate);

  const cached = firestoreCache.get<ActivitiesBannerInfo>("activities_banner", "hg_activities_banner_v3");
  const initial = cached?.data || loadActivitiesBanner();
  onUpdate(initial?.title ? initial : DEFAULT_ACTIVITIES_BANNER);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      bannerSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_activities_banner", async () => {
      const docRef = doc(db, HOME_COLL, ACTIVITIES_BANNER_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as ActivitiesBannerInfo;
        if (data && data.title) {
          return { ...DEFAULT_ACTIVITIES_BANNER, ...data };
        }
      }
      return initial?.title ? initial : DEFAULT_ACTIVITIES_BANNER;
    })
    .then((fresh) => {
      if (isCancelled) return;
      firestoreCache.set("activities_banner", fresh, DEFAULT_TTLS.ACTIVITIES, "hg_activities_banner_v3");
      saveActivitiesBanner(fresh);
      bannerSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      handleFirestoreError(err, OperationType.GET, `${HOME_COLL}/${ACTIVITIES_BANNER_DOC_ID}`);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    bannerSubscribers.delete(onUpdate);
  };
}

export async function saveActivitiesBannerCloud(banner: ActivitiesBannerInfo): Promise<void> {
  firestoreCache.set("activities_banner", banner, DEFAULT_TTLS.ACTIVITIES, "hg_activities_banner_v3");
  saveActivitiesBanner(banner);
  bannerSubscribers.forEach((cb) => {
    try { cb(banner); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, HOME_COLL, ACTIVITIES_BANNER_DOC_ID);
    await setDoc(docRef, { ...banner, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${HOME_COLL}/${ACTIVITIES_BANNER_DOC_ID}`);
  }
}

// ==================== HG EVENTS (6 CONCEPTS OFFICIELS) ====================

export function subscribeToHgEvents(
  onUpdate: (events: HgEventItem[]) => void,
  onError?: (error: unknown) => void
): () => void {
  hgEventsSubscribers.add(onUpdate);

  const cached = firestoreCache.get<HgEventItem[]>("hg_events", "hg_hgevents_v3");
  const initial = cached?.data || loadHgEvents();
  onUpdate(Array.isArray(initial) && initial.length > 0 ? initial : INITIAL_HG_EVENTS);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      hgEventsSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_hg_events", async () => {
      const docRef = doc(db, HOME_COLL, HG_EVENTS_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.items)) {
          return (data.items as HgEventItem[]).map((item, idx) => ({
            ...item,
            id: item.id || `hge-${idx + 1}`,
            title: item.title || "Événement House Game",
            slug: item.slug || `event-${idx + 1}`,
            definition: item.definition || "",
            coverImage: item.coverImage || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
            coverFit: item.coverFit || (idx === 0 ? "contain" : undefined),
            coverHeight: item.coverHeight ? Number(item.coverHeight) : undefined,
            badge: item.badge || "HG Event",
            hasScheduledEvent: Boolean(item.hasScheduledEvent),
            archives: Array.isArray(item.archives) ? item.archives : [],
          }));
        }
      }
      return Array.isArray(initial) && initial.length > 0 ? initial : INITIAL_HG_EVENTS;
    })
    .then((fresh) => {
      if (isCancelled) return;
      firestoreCache.set("hg_events", fresh, DEFAULT_TTLS.HG_EVENTS, "hg_hgevents_v3");
      saveHgEvents(fresh);
      hgEventsSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      console.warn("Firestore HG events notice:", err);
      if (onError) onError(err);
    });

  return () => {
    isCancelled = true;
    hgEventsSubscribers.delete(onUpdate);
  };
}

export async function saveHgEventsCloud(events: HgEventItem[]): Promise<void> {
  firestoreCache.set("hg_events", events, DEFAULT_TTLS.HG_EVENTS, "hg_hgevents_v3");
  saveHgEvents(events);
  hgEventsSubscribers.forEach((cb) => {
    try { cb(events); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, HOME_COLL, HG_EVENTS_DOC_ID);
    const sanitizedItems = JSON.parse(JSON.stringify(events));
    await setDoc(
      docRef,
      { items: sanitizedItems, count: events.length, updatedAt: Date.now() },
      { merge: true }
    );
  } catch (err) {
    console.warn("Firestore saveHgEventsCloud notice:", err);
  }
}

/**
 * Admin manual refresh trigger: Forces a re-fetch of all catalog collections
 */
export async function refreshAllCatalogData(force = true): Promise<void> {
  if (force) {
    firestoreCache.invalidate("products", "hg_products_v3");
    firestoreCache.invalidate("shop_info", "hg_shopinfo_v3");
    firestoreCache.invalidate("repairs", "hg_repairs_v3");
    firestoreCache.invalidate("events", "hg_events_v3");
    firestoreCache.invalidate("tournaments", "hg_tournaments_v3");
    firestoreCache.invalidate("custom_tabs", "hg_custom_tabs_v3");
    firestoreCache.invalidate("home_content", "hg_home_content_v3");
    firestoreCache.invalidate("activities", "hg_activities_v3");
    firestoreCache.invalidate("activities_banner", "hg_activities_banner_v3");
    firestoreCache.invalidate("hg_events", "hg_hgevents_v3");
  }
}

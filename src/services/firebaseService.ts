import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  getDocFromServer,
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
} from "../types";
import { INITIAL_PRODUCTS } from "../data/initialData";
import { DEFAULT_INFO } from "../data/logo";
import {
  INITIAL_HOME_CONTENT,
  INITIAL_REPAIR_SERVICES,
  INITIAL_EVENTS,
  INITIAL_TOURNAMENTS,
} from "../data/tabData";

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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test per Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

const PRODUCTS_COLL = "products";
const SETTINGS_COLL = "settings";
const REPAIRS_COLL = "repair_services";
const EVENTS_COLL = "events";
const TOURNAMENTS_COLL = "tournaments";
const CUSTOM_TABS_COLL = "custom_tabs";
const HOME_COLL = "home_content";
const STORE_DOC_ID = "housegame_info";
const HOME_DOC_ID = "overview";

// ==================== PRODUCTS ====================

export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: unknown) => void
) {
  const productsRef = collection(db, PRODUCTS_COLL);

  return onSnapshot(
    productsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        console.log("Firestore products empty, seeding...");
        await seedInitialProducts(INITIAL_PRODUCTS);
        onUpdate(INITIAL_PRODUCTS);
        return;
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
      onUpdate(products);
    },
    (err) => {
      console.error("Firestore products error:", err);
      if (onError) onError(err);
    }
  );
}

export async function saveProductCloud(product: Product): Promise<void> {
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
}

export async function deleteProductCloud(productId: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLL, productId);
  await deleteDoc(docRef);
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
    console.error("Failed to seed initial products:", err);
  }
}

export async function restoreCatalogCloud(newProducts: Product[]): Promise<void> {
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
}

// ==================== STORE SETTINGS ====================

export function subscribeToShopInfo(
  onUpdate: (info: ShopInfo) => void,
  onError?: (error: unknown) => void
) {
  const settingsDocRef = doc(db, SETTINGS_COLL, STORE_DOC_ID);

  return onSnapshot(
    settingsDocRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        saveShopInfoCloud(DEFAULT_INFO).catch(console.error);
        onUpdate(DEFAULT_INFO);
        return;
      }
      const data = docSnap.data() as ShopInfo;
      onUpdate({ ...DEFAULT_INFO, ...data });
    },
    (err) => {
      console.error("Firestore settings error:", err);
      if (onError) onError(err);
    }
  );
}

export async function saveShopInfoCloud(info: ShopInfo): Promise<void> {
  const docRef = doc(db, SETTINGS_COLL, STORE_DOC_ID);
  await setDoc(docRef, { ...info, updatedAt: Date.now() }, { merge: true });
}

// ==================== REPAIR SERVICES ====================

export function subscribeToRepairServices(
  onUpdate: (services: RepairService[]) => void,
  onError?: (error: unknown) => void
) {
  const repairsRef = collection(db, REPAIRS_COLL);

  return onSnapshot(
    repairsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        await seedInitialRepairs(INITIAL_REPAIR_SERVICES);
        onUpdate(INITIAL_REPAIR_SERVICES);
        return;
      }

      const services: RepairService[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        services.push({
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

      services.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onUpdate(services);
    },
    (err) => {
      console.error("Firestore repairs error:", err);
      if (onError) onError(err);
    }
  );
}

export async function saveRepairServiceCloud(service: RepairService): Promise<void> {
  const docRef = doc(db, REPAIRS_COLL, service.id);
  await setDoc(docRef, service, { merge: true });
}

export async function deleteRepairServiceCloud(serviceId: string): Promise<void> {
  const docRef = doc(db, REPAIRS_COLL, serviceId);
  await deleteDoc(docRef);
}

export async function seedInitialRepairs(services: RepairService[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    services.forEach((s) => {
      const docRef = doc(db, REPAIRS_COLL, s.id);
      batch.set(docRef, s, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error("Failed to seed repairs:", err);
  }
}

// ==================== EVENTS ====================

export function subscribeToEvents(
  onUpdate: (events: GamingEvent[]) => void,
  onError?: (error: unknown) => void
) {
  const eventsRef = collection(db, EVENTS_COLL);

  return onSnapshot(
    eventsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        await seedInitialEvents(INITIAL_EVENTS);
        onUpdate(INITIAL_EVENTS);
        return;
      }

      const events: GamingEvent[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        events.push({
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

      events.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onUpdate(events);
    },
    (err) => {
      console.error("Firestore events error:", err);
      if (onError) onError(err);
    }
  );
}

export async function saveEventCloud(event: GamingEvent): Promise<void> {
  const docRef = doc(db, EVENTS_COLL, event.id);
  await setDoc(docRef, event, { merge: true });
}

export async function deleteEventCloud(eventId: string): Promise<void> {
  const docRef = doc(db, EVENTS_COLL, eventId);
  await deleteDoc(docRef);
}

export async function seedInitialEvents(events: GamingEvent[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    events.forEach((e) => {
      const docRef = doc(db, EVENTS_COLL, e.id);
      batch.set(docRef, e, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error("Failed to seed events:", err);
  }
}

// ==================== TOURNAMENTS ====================

export function subscribeToTournaments(
  onUpdate: (tournaments: Tournament[]) => void,
  onError?: (error: unknown) => void
) {
  const tournRef = collection(db, TOURNAMENTS_COLL);

  return onSnapshot(
    tournRef,
    async (snapshot) => {
      if (snapshot.empty) {
        await seedInitialTournaments(INITIAL_TOURNAMENTS);
        onUpdate(INITIAL_TOURNAMENTS);
        return;
      }

      const tournaments: Tournament[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        tournaments.push({
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

      tournaments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onUpdate(tournaments);
    },
    (err) => {
      console.error("Firestore tournaments error:", err);
      if (onError) onError(err);
    }
  );
}

export async function saveTournamentCloud(tournament: Tournament): Promise<void> {
  const docRef = doc(db, TOURNAMENTS_COLL, tournament.id);
  await setDoc(docRef, tournament, { merge: true });
}

export async function deleteTournamentCloud(tournamentId: string): Promise<void> {
  const docRef = doc(db, TOURNAMENTS_COLL, tournamentId);
  await deleteDoc(docRef);
}

export async function seedInitialTournaments(tournaments: Tournament[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    tournaments.forEach((t) => {
      const docRef = doc(db, TOURNAMENTS_COLL, t.id);
      batch.set(docRef, t, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error("Failed to seed tournaments:", err);
  }
}

// ==================== CUSTOM TABS ====================

export function subscribeToCustomTabs(
  onUpdate: (tabs: CustomTab[]) => void,
  onError?: (error: unknown) => void
) {
  const tabsRef = collection(db, CUSTOM_TABS_COLL);

  return onSnapshot(
    tabsRef,
    (snapshot) => {
      const tabs: CustomTab[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        tabs.push({
          id: docSnap.id,
          title: d.title || "Nouvel Onglet",
          slug: d.slug || docSnap.id,
          icon: d.icon || "Sparkles",
          description: d.description || "",
          items: Array.isArray(d.items) ? d.items : [],
          createdAt: d.createdAt || Date.now(),
        });
      });

      tabs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      onUpdate(tabs);
    },
    (err) => {
      console.error("Firestore custom tabs error:", err);
      if (onError) onError(err);
    }
  );
}

export async function saveCustomTabCloud(tab: CustomTab): Promise<void> {
  const docRef = doc(db, CUSTOM_TABS_COLL, tab.id);
  await setDoc(docRef, tab, { merge: true });
}

export async function deleteCustomTabCloud(tabId: string): Promise<void> {
  const docRef = doc(db, CUSTOM_TABS_COLL, tabId);
  await deleteDoc(docRef);
}

// ==================== HOME OVERVIEW CONTENT ====================

export function subscribeToHomeContent(
  onUpdate: (content: HomeContent) => void,
  onError?: (error: unknown) => void
) {
  const homeDocRef = doc(db, HOME_COLL, HOME_DOC_ID);

  return onSnapshot(
    homeDocRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        saveHomeContentCloud(INITIAL_HOME_CONTENT).catch(console.error);
        onUpdate(INITIAL_HOME_CONTENT);
        return;
      }
      const data = docSnap.data() as HomeContent;
      let banner = data.bannerImage;
      if (
        !banner ||
        banner.includes("photo-1542751371-adc38448a05e") ||
        banner.includes("house_game_banner_1789577924653")
      ) {
        banner = INITIAL_HOME_CONTENT.bannerImage;
      }
      onUpdate({ ...INITIAL_HOME_CONTENT, ...data, bannerImage: banner });
    },
    (err) => {
      console.error("Firestore home content error:", err);
      handleFirestoreError(err, OperationType.GET, `${HOME_COLL}/${HOME_DOC_ID}`);
      if (onError) onError(err);
    }
  );
}

export async function saveHomeContentCloud(content: HomeContent): Promise<void> {
  const docRef = doc(db, HOME_COLL, HOME_DOC_ID);
  try {
    await setDoc(docRef, { ...content, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${HOME_COLL}/${HOME_DOC_ID}`);
  }
}

export async function updateBannerImageCloud(bannerImage: string): Promise<void> {
  const docRef = doc(db, HOME_COLL, HOME_DOC_ID);
  try {
    await setDoc(
      docRef,
      {
        bannerImage,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${HOME_COLL}/${HOME_DOC_ID}`);
  }
}

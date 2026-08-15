import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Product, ShopInfo } from "../types";
import { INITIAL_PRODUCTS } from "../data/initialData";
import { DEFAULT_INFO } from "../data/logo";

const PRODUCTS_COLL = "products";
const SETTINGS_COLL = "settings";
const STORE_DOC_ID = "housegame_info";

/**
 * Listen to live real-time products updates from Firestore
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: unknown) => void
) {
  const productsRef = collection(db, PRODUCTS_COLL);
  
  return onSnapshot(
    productsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // If Firestore is empty, seed it with the initial starter catalog
        console.log("Firestore catalog empty, initializing starter catalog...");
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

      // Sort by createdAt descending
      products.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(products);
    },
    (err) => {
      console.error("Firestore products subscription error:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Listen to live real-time store settings updates
 */
export function subscribeToShopInfo(
  onUpdate: (info: ShopInfo) => void,
  onError?: (error: unknown) => void
) {
  const settingsDocRef = doc(db, SETTINGS_COLL, STORE_DOC_ID);

  return onSnapshot(
    settingsDocRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        // Save default info
        saveShopInfoCloud(DEFAULT_INFO).catch(console.error);
        onUpdate(DEFAULT_INFO);
        return;
      }
      const data = docSnap.data() as ShopInfo;
      onUpdate({ ...DEFAULT_INFO, ...data });
    },
    (err) => {
      console.error("Firestore settings subscription error:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Add or update a product in Firestore
 */
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

/**
 * Delete a product from Firestore
 */
export async function deleteProductCloud(productId: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLL, productId);
  await deleteDoc(docRef);
}

/**
 * Save store info to Firestore
 */
export async function saveShopInfoCloud(info: ShopInfo): Promise<void> {
  const docRef = doc(db, SETTINGS_COLL, STORE_DOC_ID);
  await setDoc(docRef, { ...info, updatedAt: Date.now() }, { merge: true });
}

/**
 * Seed initial products into Firestore in batch
 */
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

/**
 * Restore catalog with a given list of products
 */
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

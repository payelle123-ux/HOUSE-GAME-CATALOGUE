import { Product, ShopInfo, CartItem } from "../types";
import { INITIAL_PRODUCTS } from "../data/initialData";
import { DEFAULT_INFO } from "../data/logo";

const PRODUCTS_KEY = "hg_products_v2";
const INFO_KEY = "hg_shopinfo_v2";
const CART_KEY = "hg_cart_v2";

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
    return { ...DEFAULT_INFO, ...parsed };
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

export function buildWhatsAppProductUrl(phone: string, product: Product, currency: string = "FCFA"): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const priceStr = formatPrice(product.price, currency);
  const text = `🎮 *Bonjour House Game !*\n\nJe souhaite commander cet article depuis votre catalogue :\n\n📌 *Produit :* ${product.name}\n🏷️ *Catégorie :* ${product.category || "Gaming"}\n💰 *Prix :* ${priceStr}\n\nEst-il disponible actuellement pour livraison ? Merci !`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppCartUrl(phone: string, items: CartItem[], clientName = "", clientAddress = "", currency: string = "FCFA"): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const total = items.reduce((acc, item) => acc + (Number(item.product.price) || 0) * item.quantity, 0);
  
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

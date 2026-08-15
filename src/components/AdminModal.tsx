import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Lock,
  Download,
  RotateCcw,
  Sparkles,
  Check,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Coins,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import { Product, ShopInfo } from "../types";
import { compressImage } from "../services/storage";
import { DEFAULT_CATEGORIES, INITIAL_PRODUCTS } from "../data/initialData";

// --- LOGIN MODAL ---
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expectedPin: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expectedPin,
}) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleInput = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    setPin(digits);
    setError("");
    if (digits.length === 4) {
      if (digits === expectedPin) {
        onSuccess();
        onClose();
        setPin("");
      } else {
        setError("Code PIN incorrect. Réessayez.");
        setPin("");
      }
    }
  };

  const handleKeypadPress = (num: string) => {
    if (pin.length < 4) {
      handleInput(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xs overflow-hidden rounded-xl border border-white/15 bg-[#12151E] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#7C8798] hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 text-[#3E9BFF]">
            <Lock size={20} />
          </div>
          <h3 className="font-['Orbitron'] text-base font-bold text-white">ESPACE GESTION</h3>
          <p className="mt-1 font-['JetBrains_Mono'] text-xs text-[#7C8798]">
            Entrez votre code PIN (4 chiffres)
          </p>

          {/* PIN Dots */}
          <div className="my-5 flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full border transition-all ${
                  pin.length > i
                    ? "border-[#FF4438] bg-[#FF4438] shadow-[0_0_8px_rgba(255,68,56,0.8)]"
                    : "border-white/20 bg-white/5"
                }`}
              />
            ))}
          </div>

          {error && <p className="mb-3 font-['JetBrains_Mono'] text-xs text-[#FF4438]">{error}</p>}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
              <button
                key={n}
                onClick={() => handleKeypadPress(n)}
                className="flex h-11 items-center justify-center rounded border border-white/10 bg-white/5 font-['JetBrains_Mono'] text-base font-bold text-white transition hover:border-[#3E9BFF] hover:bg-[#3E9BFF]/20 active:scale-95"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPin("")}
              className="flex h-11 items-center justify-center rounded border border-white/10 bg-white/5 font-['JetBrains_Mono'] text-xs text-[#7C8798] hover:text-white"
            >
              Effacer
            </button>
            <button
              onClick={() => handleKeypadPress("0")}
              className="flex h-11 items-center justify-center rounded border border-white/10 bg-white/5 font-['JetBrains_Mono'] text-base font-bold text-white transition hover:border-[#3E9BFF] hover:bg-[#3E9BFF]/20 active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="flex h-11 items-center justify-center rounded border border-white/10 bg-white/5 font-['JetBrains_Mono'] text-xs text-[#7C8798] hover:text-[#FF4438]"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PRODUCT EDIT/ADD FORM ---
interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  editingProduct: Product | null;
  existingCategories: string[];
  currency: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  existingCategories,
  currency,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(editingProduct?.name || "");
  const [category, setCategory] = useState(editingProduct?.category || "Manettes");
  const [price, setPrice] = useState<string | number>(editingProduct?.price || "");
  const [originalPrice, setOriginalPrice] = useState<string | number>(editingProduct?.originalPrice || "");
  const [description, setDescription] = useState(editingProduct?.description || "");
  const [image, setImage] = useState(editingProduct?.image || "");
  const [badge, setBadge] = useState<string>(editingProduct?.badge || "");
  const [inStock, setInStock] = useState<boolean>(editingProduct?.inStock !== false);
  const [specsText, setSpecsText] = useState(editingProduct?.specs?.join("\n") || "");
  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImg(true);
    setError("");
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch (err) {
      setError("Impossible de charger l'image.");
    } finally {
      setIsProcessingImg(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Le nom de l'article est requis.");
      return;
    }

    const specs = specsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedProduct: Product = {
      id: editingProduct ? editingProduct.id : `hg-${Date.now()}`,
      name: name.trim(),
      category: category.trim() || "Divers",
      price: price === "" ? "" : Number(price) || price,
      originalPrice: originalPrice === "" ? undefined : Number(originalPrice) || originalPrice,
      description: description.trim(),
      image: image.trim(),
      badge: badge || undefined,
      inStock,
      specs: specs.length > 0 ? specs : undefined,
      createdAt: editingProduct ? editingProduct.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSave(updatedProduct);
    onClose();
  };

  const categoriesOptions = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategories])
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-xl border border-white/15 bg-[#12151E] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#07090E] px-6 py-4">
          <h3 className="font-['Orbitron'] text-base font-bold text-white">
            {editingProduct ? "MODIFIER L'ARTICLE" : "AJOUTER UN ARTICLE"}
          </h3>
          <button onClick={onClose} className="text-[#7C8798] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 max-h-[calc(90vh-130px)]">
          {error && <div className="rounded bg-red-500/20 p-2.5 text-xs text-red-300 border border-red-500/30">{error}</div>}

          {/* Photo Upload & Preview */}
          <div>
            <label className="mb-1.5 block font-['JetBrains_Mono'] text-xs font-bold text-[#D6DCE6]">
              PHOTO DU PRODUIT
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-[#07090E]">
                {image ? (
                  <img src={image} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">No image</span>
                )}
                {isProcessingImg && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs text-[#3E9BFF]">
                    ...
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded border border-[#3E9BFF]/40 bg-[#3E9BFF]/10 px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-semibold text-[#3E9BFF] hover:bg-[#3E9BFF]/20"
                  >
                    <Upload size={13} />
                    <span>Téléverser photo</span>
                  </button>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="rounded border border-white/10 px-2.5 py-1.5 font-['JetBrains_Mono'] text-xs text-[#7C8798] hover:text-[#FF4438]"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Ou collez une URL d'image (ex: https://...)"
                  className="w-full rounded border border-white/10 bg-[#07090E] px-3 py-1.5 font-['JetBrains_Mono'] text-xs text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="mb-1 block font-['JetBrains_Mono'] text-xs font-bold text-[#D6DCE6]">
              NOM DE L'ARTICLE *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Manette Sony DualSense PS5 Midnight Black"
              className="w-full rounded border border-white/10 bg-[#07090E] px-3.5 py-2 text-sm text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
            />
          </div>

          {/* Category & Badge */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-['JetBrains_Mono'] text-xs font-bold text-[#D6DCE6]">
                CATÉGORIE
              </label>
              <input
                type="text"
                list="hg-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Consoles, Manettes, Jeux..."
                className="w-full rounded border border-white/10 bg-[#07090E] px-3.5 py-2 text-sm text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
              />
              <datalist id="hg-categories">
                {categoriesOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1 block font-['JetBrains_Mono'] text-xs font-bold text-[#D6DCE6]">
                BADGE SPÉCIAL
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full rounded border border-white/10 bg-[#07090E] px-3.5 py-2 text-sm text-white focus:border-[#3E9BFF] focus:outline-none"
              >
                <option value="">Aucun badge</option>
                <option value="Nouveau">Nouveau</option>
                <option value="Promo">Promo</option>
                <option value="Populaire">Populaire</option>
                <option value="Occasion Révisée">Occasion Révisée</option>
                <option value="Exclusif">Exclusif</option>
              </select>
            </div>
          </div>

          {/* Prices & Stock */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block font-['JetBrains_Mono'] text-xs font-bold text-[#D6DCE6]">
                PRIX VENTE ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="ex: 55000"
                className="w-full rounded border border-white/10 bg-[#07090E] px-3.5 py-2 text-sm text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-['JetBrains_Mono'] text-xs font-bold text-[#D6DCE6]">
                ANCIEN PRIX (Barré)
              </label>
              <input
                type="number"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="ex: 65000"
                className="w-full rounded border border-white/10 bg-[#07090E] px-3.5 py-2 text-sm text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer rounded border border-white/10 bg-[#07090E] p-2.5 text-xs text-white">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#FF4438]"
                />
                <span className="font-['JetBrains_Mono'] font-bold">En Stock</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block font-['JetBrains_Mono'] text-xs font-bold text-[#D6DCE6]">
              DESCRIPTION DU PRODUIT
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails du produit, état, contenu de la boîte..."
              className="w-full rounded border border-white/10 bg-[#07090E] px-3.5 py-2 text-sm text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
            />
          </div>

          {/* Specs */}
          <div>
            <label className="mb-1 block font-['JetBrains_Mono'] text-xs font-bold text-[#D6DCE6]">
              POINTS CLÉS / CARACTÉRISTIQUES (1 par ligne)
            </label>
            <textarea
              rows={3}
              value={specsText}
              onChange={(e) => setSpecsText(e.target.value)}
              placeholder="Stockage 1 To SSD&#10;Garantie 1 An&#10;Manette originale incluse"
              className="w-full rounded border border-white/10 bg-[#07090E] px-3.5 py-2 font-['JetBrains_Mono'] text-xs text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 font-['JetBrains_Mono'] text-xs text-[#7C8798] hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#FF4438] px-5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(255,68,56,0.4)] hover:bg-[#ff6459]"
            >
              {editingProduct ? "Enregistrer les modifications" : "Ajouter au catalogue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SHOP INFO SETTINGS & BACKUP MODAL ---
interface ShopSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopInfo: ShopInfo;
  onSaveShopInfo: (info: ShopInfo) => void;
  products: Product[];
  onRestoreProducts: (products: Product[]) => void;
}

export const ShopSettingsModal: React.FC<ShopSettingsModalProps> = ({
  isOpen,
  onClose,
  shopInfo,
  onSaveShopInfo,
  products,
  onRestoreProducts,
}) => {
  const [formData, setFormData] = useState<ShopInfo>({ ...shopInfo });
  const [tab, setTab] = useState<"info" | "data">("info");
  const [successMsg, setSuccessMsg] = useState("");
  const jsonImportRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveShopInfo(formData);
    setSuccessMsg("Informations enregistrées avec succès !");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleExportJSON = () => {
    const data = {
      shopInfo: formData,
      products,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `house-game-catalogue-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && Array.isArray(parsed.products)) {
          onRestoreProducts(parsed.products);
          if (parsed.shopInfo) {
            setFormData(parsed.shopInfo);
            onSaveShopInfo(parsed.shopInfo);
          }
          setSuccessMsg("Catalogue restauré avec succès !");
        } else if (Array.isArray(parsed)) {
          onRestoreProducts(parsed);
          setSuccessMsg("Articles restaurés avec succès !");
        }
      } catch (err) {
        alert("Fichier JSON invalide.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm("Réinitialiser avec le catalogue de démonstration House Game ? Vos modifications actuelles seront remplacées.")) {
      onRestoreProducts(INITIAL_PRODUCTS);
      setSuccessMsg("Catalogue réinitialisé avec succès !");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-xl border border-white/15 bg-[#12151E] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#07090E] px-6 py-4">
          <h3 className="font-['Orbitron'] text-base font-bold text-white">
            RÉGLAGES BOUTIQUE & SAUVEGARDE
          </h3>
          <button onClick={onClose} className="text-[#7C8798] hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-[#0E1119] px-6">
          <button
            onClick={() => setTab("info")}
            className={`border-b-2 py-3 font-['JetBrains_Mono'] text-xs font-bold transition ${
              tab === "info"
                ? "border-[#3E9BFF] text-[#3E9BFF]"
                : "border-transparent text-[#7C8798] hover:text-white"
            }`}
          >
            Coordonnées & Textes
          </button>
          <button
            onClick={() => setTab("data")}
            className={`ml-6 border-b-2 py-3 font-['JetBrains_Mono'] text-xs font-bold transition ${
              tab === "data"
                ? "border-[#3E9BFF] text-[#3E9BFF]"
                : "border-transparent text-[#7C8798] hover:text-white"
            }`}
          >
            Sauvegarde & Import/Export
          </button>
        </div>

        <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
          {successMsg && (
            <div className="mb-4 flex items-center gap-2 rounded bg-emerald-500/20 p-2.5 font-['JetBrains_Mono'] text-xs text-emerald-300 border border-emerald-500/30">
              <Check size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === "info" ? (
            <form onSubmit={handleSubmit} className="space-y-3 font-['JetBrains_Mono'] text-xs">
              <div>
                <label className="mb-1 block font-bold text-[#D6DCE6]">MESSAGE D'ACCUEIL / SLOGAN</label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full rounded border border-white/10 bg-[#07090E] p-2.5 text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-[#D6DCE6]">NUMÉRO WHATSAPP</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+225 07..."
                    className="w-full rounded border border-white/10 bg-[#07090E] p-2.5 text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-[#D6DCE6]">TÉLÉPHONE APPEL</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+225 07..."
                    className="w-full rounded border border-white/10 bg-[#07090E] p-2.5 text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-[#D6DCE6]">ADRESSE / VILLE DE LA BOUTIQUE</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="ex: Abidjan, Côte d'Ivoire"
                  className="w-full rounded border border-white/10 bg-[#07090E] p-2.5 text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-[#D6DCE6]">HORAIRES D'OUVERTURE</label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="Lun - Sam : 09h - 19h"
                    className="w-full rounded border border-white/10 bg-[#07090E] p-2.5 text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-[#D6DCE6]">DEVISE AFFICHÉE</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="FCFA, EUR, USD..."
                    className="w-full rounded border border-white/10 bg-[#07090E] p-2.5 text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-[#D6DCE6]">CODE PIN GESTION (4 Chiffres)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.adminPin}
                  onChange={(e) => setFormData({ ...formData, adminPin: e.target.value.replace(/\D/g, "") })}
                  className="w-32 rounded border border-white/10 bg-[#07090E] p-2.5 text-white focus:border-[#3E9BFF] focus:outline-none text-center font-bold tracking-widest"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-[#FF4438] px-5 py-2.5 font-bold text-white hover:bg-[#ff6459]"
                >
                  Enregistrer les paramètres
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 font-['JetBrains_Mono'] text-xs">
              <div className="rounded-lg border border-white/10 bg-[#07090E] p-4">
                <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                  <Download size={14} className="text-[#3E9BFF]" />
                  EXPORTER LE CATALOGUE (Sauvegarde JSON)
                </h4>
                <p className="text-[#7C8798] mb-3">
                  Téléchargez une copie complète de tous vos {products.length} articles et réglages.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 rounded border border-[#3E9BFF]/40 bg-[#3E9BFF]/10 px-3.5 py-2 font-bold text-[#3E9BFF] hover:bg-[#3E9BFF]/20"
                >
                  <Download size={14} />
                  <span>Télécharger sauvegarde JSON</span>
                </button>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#07090E] p-4">
                <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                  <Upload size={14} className="text-emerald-400" />
                  IMPORTER UN CATALOGUE
                </h4>
                <p className="text-[#7C8798] mb-3">
                  Restaurez vos articles depuis un fichier JSON précédemment exporté.
                </p>
                <button
                  onClick={() => jsonImportRef.current?.click()}
                  className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 font-bold text-emerald-400 hover:bg-emerald-500/20"
                >
                  <Upload size={14} />
                  <span>Sélectionner un fichier JSON</span>
                </button>
                <input
                  ref={jsonImportRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </div>

              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <h4 className="font-bold text-red-400 flex items-center gap-2 mb-1">
                  <RotateCcw size={14} />
                  RÉINITIALISER LES DONNÉES
                </h4>
                <p className="text-[#7C8798] mb-3">
                  Remet le catalogue par défaut avec les manettes et consoles de démonstration.
                </p>
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-2 rounded border border-red-500/40 bg-red-500/15 px-3.5 py-2 font-bold text-red-300 hover:bg-red-500/25"
                >
                  <RotateCcw size={14} />
                  <span>Réinitialiser</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

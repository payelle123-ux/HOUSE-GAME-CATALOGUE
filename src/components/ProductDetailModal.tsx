import React, { useState } from "react";
import { X, MessageCircle, ShoppingBag, Check, Copy, Shield, Truck, Share2, Pencil, Trash2 } from "lucide-react";
import { Product, ShopInfo } from "../types";
import { formatPrice, buildWhatsAppProductUrl } from "../services/storage";

interface ProductDetailModalProps {
  product: Product | null;
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  shopInfo,
  isAdmin,
  onClose,
  onAddToCart,
  onEdit,
  onDelete,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const whatsappUrl = buildWhatsAppProductUrl(shopInfo.whatsapp || shopInfo.phone, product, shopInfo.currency);

  const handleCopy = () => {
    const text = `${product.name} - ${formatPrice(product.price, shopInfo.currency)} chez House Game (${shopInfo.phone})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/15 bg-[#12151E] shadow-2xl">
        {/* Cyber accents */}
        <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-[#FF4438]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#3E9BFF]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#07090E]">
          <div className="flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#3E9BFF]">
              [ {product.category || "Gaming"} ]
            </span>
            {product.badge && (
              <span className="rounded bg-[#FF4438]/20 px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold text-[#FF4438] border border-[#FF4438]/40">
                {product.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(product);
                  }}
                  className="rounded border border-white/10 p-1.5 text-[#7C8798] hover:border-[#3E9BFF] hover:text-[#3E9BFF]"
                  title="Modifier l'article"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onDelete(product);
                  }}
                  className="rounded border border-white/10 p-1.5 text-[#7C8798] hover:border-[#FF4438] hover:text-[#FF4438]"
                  title="Supprimer l'article"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#7C8798] transition hover:bg-white/10 hover:text-white"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Image Column */}
            <div className="flex flex-col">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-white/10 bg-[#181C28]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-['Orbitron'] text-5xl text-[#7C8798]/30">
                    HOUSE GAME
                  </div>
                )}
              </div>

              {/* Guarantees Box */}
              <div className="mt-4 grid grid-cols-2 gap-2 font-['JetBrains_Mono'] text-xs text-[#7C8798]">
                <div className="flex items-center gap-2 rounded border border-white/5 bg-white/5 p-2">
                  <Shield size={16} className="text-[#3E9BFF]" />
                  <span>Produit garanti</span>
                </div>
                <div className="flex items-center gap-2 rounded border border-white/5 bg-white/5 p-2">
                  <Truck size={16} className="text-emerald-400" />
                  <span>Livraison sécurisée</span>
                </div>
              </div>
            </div>

            {/* Info Column */}
            <div className="flex flex-col">
              <h2 className="font-['Orbitron'] text-xl font-bold text-white sm:text-2xl">
                {product.name}
              </h2>

              {/* Price Banner */}
              <div className="my-3 flex items-baseline gap-3">
                <span className="font-['JetBrains_Mono'] text-2xl font-extrabold text-[#FF4438]">
                  {formatPrice(product.price, shopInfo.currency)}
                </span>
                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                  <span className="font-['JetBrains_Mono'] text-sm text-[#7C8798] line-through">
                    {formatPrice(product.originalPrice, shopInfo.currency)}
                  </span>
                )}
              </div>

              {/* Status */}
              <div className="mb-4 font-['JetBrains_Mono'] text-xs">
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-400 border border-emerald-500/30">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    En stock — Disponible immédiatement
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 font-semibold text-[#FF4438] border border-red-500/30">
                    <span className="h-2 w-2 rounded-full bg-[#FF4438]" />
                    Sur commande / Réapprovisionnement
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <h4 className="mb-1 font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#7C8798]">
                  Description
                </h4>
                <p className="text-sm leading-relaxed text-[#D6DCE6] whitespace-pre-line">
                  {product.description || "Article gaming haute qualité certifié House Game."}
                </p>
              </div>

              {/* Specs list if any */}
              {product.specs && product.specs.length > 0 && (
                <div className="mb-5">
                  <h4 className="mb-1.5 font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-[#7C8798]">
                    Caractéristiques
                  </h4>
                  <ul className="grid grid-cols-1 gap-1 text-xs text-[#7C8798]">
                    {product.specs.map((spec, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-[#FF4438]">▸</span> {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity and Order Actions */}
              <div className="mt-auto space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <span className="font-['JetBrains_Mono'] text-xs text-[#7C8798]">Quantité :</span>
                  <div className="flex items-center rounded border border-white/15 bg-[#07090E]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 font-['JetBrains_Mono'] text-sm text-[#7C8798] hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-['JetBrains_Mono'] text-sm font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 font-['JetBrains_Mono'] text-sm text-[#7C8798] hover:text-white"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="ml-auto flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2.5 py-1.5 font-['JetBrains_Mono'] text-xs text-[#7C8798] hover:text-white"
                    title="Copier les détails du produit"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? "Copié !" : "Partager"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => {
                      onAddToCart(product, quantity);
                      onClose();
                    }}
                    disabled={!product.inStock}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[#3E9BFF]/40 bg-[#3E9BFF]/15 py-3 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] transition hover:border-[#3E9BFF] hover:bg-[#3E9BFF]/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={16} />
                    <span>Ajouter au panier</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/20 py-3 font-['JetBrains_Mono'] text-xs font-bold text-emerald-400 transition hover:border-emerald-400 hover:bg-emerald-500/30"
                  >
                    <MessageCircle size={16} />
                    <span>Commander WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

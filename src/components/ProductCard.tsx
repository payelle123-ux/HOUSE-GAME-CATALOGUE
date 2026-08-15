import React from "react";
import { MessageCircle, ShoppingBag, Eye, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Product, ShopInfo } from "../types";
import { formatPrice, buildWhatsAppProductUrl } from "../services/storage";

interface ProductCardProps {
  product: Product;
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  shopInfo,
  isAdmin,
  onSelect,
  onAddToCart,
  onEdit,
  onDelete,
}) => {
  const whatsappUrl = buildWhatsAppProductUrl(shopInfo.whatsapp || shopInfo.phone, product, shopInfo.currency);

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case "Promo":
        return "border-[#FF4438]/50 bg-[#FF4438]/20 text-[#FF4438]";
      case "Nouveau":
        return "border-emerald-500/50 bg-emerald-500/20 text-emerald-400";
      case "Populaire":
        return "border-[#3E9BFF]/50 bg-[#3E9BFF]/20 text-[#3E9BFF]";
      case "Occasion Révisée":
        return "border-amber-500/50 bg-amber-500/20 text-amber-300";
      default:
        return "border-white/20 bg-white/10 text-white";
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#12151E] shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#3E9BFF]/40 hover:shadow-[0_10px_25px_rgba(6,10,20,0.6)]">
      {/* Corner cyber decorations */}
      <div className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-[#FF4438] z-10" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#3E9BFF] z-10" />

      {/* Admin Actions Overlay Buttons */}
      {isAdmin && (
        <div className="absolute top-2.5 right-2.5 z-20 flex gap-1.5 rounded-md bg-[#07090E]/90 p-1 backdrop-blur border border-white/15">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="flex h-7 w-7 items-center justify-center rounded text-[#7C8798] transition hover:bg-[#3E9BFF]/20 hover:text-[#3E9BFF]"
            title="Modifier l'article"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product);
            }}
            className="flex h-7 w-7 items-center justify-center rounded text-[#7C8798] transition hover:bg-[#FF4438]/20 hover:text-[#FF4438]"
            title="Supprimer l'article"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Media Box */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-square w-full cursor-pointer overflow-hidden bg-[#181C28]"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-[#7C8798]/30 font-['Orbitron']">
            HG
          </div>
        )}

        {/* Badges on top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.badge && (
            <span
              className={`rounded border px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold tracking-wide uppercase backdrop-blur-md ${getBadgeStyle(
                product.badge
              )}`}
            >
              {product.badge}
            </span>
          )}
          {!product.inStock && (
            <span className="rounded border border-red-500/50 bg-red-500/30 px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold uppercase text-red-300">
              Rupture
            </span>
          )}
        </div>

        {/* Quick View overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-[#07090E]/80 px-3.5 py-1.5 font-['JetBrains_Mono'] text-xs font-semibold text-white shadow-lg">
            <Eye size={14} /> Voir le détail
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Availability */}
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-['JetBrains_Mono'] text-[11px] font-medium text-[#3E9BFF]">
            [ {product.category || "Gaming"} ]
          </span>
          <span className="flex items-center gap-1 font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">
            {product.inStock ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 size={11} /> En stock
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#FF4438]">
                <XCircle size={11} /> Sur commande
              </span>
            )}
          </span>
        </div>

        {/* Name */}
        <h3
          onClick={() => onSelect(product)}
          className="mb-1.5 cursor-pointer font-['Chakra_Petch'] text-base font-semibold text-white transition hover:text-[#3E9BFF] line-clamp-1"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Short Description */}
        <p className="mb-3 text-xs leading-relaxed text-[#7C8798] line-clamp-2">
          {product.description || "Article gaming haute performance sélectionné par House Game."}
        </p>

        {/* Price & Action footer */}
        <div className="mt-auto pt-2 border-t border-white/5">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="font-['JetBrains_Mono'] text-lg font-bold text-[#FF4438]">
              {formatPrice(product.price, shopInfo.currency)}
            </span>
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <span className="font-['JetBrains_Mono'] text-xs text-[#7C8798] line-through">
                {formatPrice(product.originalPrice, shopInfo.currency)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Add to Cart */}
            <button
              onClick={() => onAddToCart(product)}
              disabled={!product.inStock}
              className="flex items-center justify-center gap-1.5 rounded border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 py-2 font-['JetBrains_Mono'] text-xs font-semibold text-[#3E9BFF] transition hover:border-[#3E9BFF] hover:bg-[#3E9BFF]/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={14} />
              <span>Panier</span>
            </button>

            {/* Direct WhatsApp Order */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/15 py-2 font-['JetBrains_Mono'] text-xs font-semibold text-emerald-400 transition hover:border-emerald-400 hover:bg-emerald-500/25 active:scale-95 text-center"
            >
              <MessageCircle size={14} />
              <span>Commander</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

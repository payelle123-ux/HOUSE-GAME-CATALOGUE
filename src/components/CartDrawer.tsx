import React, { useState } from "react";
import { X, Trash2, MessageCircle, ShoppingBag, Plus, Minus, Check, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { CartItem, ShopInfo } from "../types";
import { formatPrice, buildWhatsAppCartUrl } from "../services/storage";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  shopInfo: ShopInfo;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  shopInfo,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.product.price) || 0) * item.quantity,
    0
  );

  const handleSendWhatsApp = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    const url = buildWhatsAppCartUrl(
      shopInfo.whatsapp || shopInfo.phone,
      items,
      clientName,
      clientAddress,
      shopInfo.currency
    );
    window.open(url, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0E1119] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-[#07090E]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-[#3E9BFF]" size={18} />
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              MON PANIER ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#7C8798] transition hover:bg-white/10 hover:text-white"
            aria-label="Fermer le panier"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-[#7C8798]">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <ShoppingBag size={28} className="text-[#7C8798]" />
              </div>
              <p className="font-['Orbitron'] text-sm font-semibold text-white">Votre panier est vide</p>
              <p className="mt-1 text-xs text-[#7C8798]">
                Parcourez le catalogue House Game et ajoutez les articles de votre choix.
              </p>
              <button
                onClick={onClose}
                className="mt-6 flex items-center gap-2 rounded-lg border border-[#3E9BFF]/40 bg-[#3E9BFF]/10 px-4 py-2 font-['JetBrains_Mono'] text-xs font-semibold text-[#3E9BFF] hover:bg-[#3E9BFF]/20"
              >
                <span>Découvrir les articles</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 rounded-lg border border-white/10 bg-[#141824] p-3 transition"
                >
                  <img
                    src={item.product.image || "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=200&q=80"}
                    alt={item.product.name}
                    className="h-16 w-16 rounded object-cover border border-white/10 bg-[#07090E]"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-['Chakra_Petch'] text-xs font-semibold text-white line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-[#7C8798] hover:text-[#FF4438]"
                        title="Retirer l'article"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#FF4438]">
                        {formatPrice(
                          (Number(item.product.price) || 0) * item.quantity,
                          shopInfo.currency
                        )}
                      </span>

                      {/* Quantity controls */}
                      <div className="flex items-center rounded border border-white/15 bg-[#07090E] text-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="px-2 py-0.5 text-[#7C8798] hover:text-white"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="px-2 font-['JetBrains_Mono'] font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="px-2 py-0.5 text-[#7C8798] hover:text-white"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClearCart}
                  className="font-['JetBrains_Mono'] text-[11px] text-[#7C8798] underline hover:text-[#FF4438]"
                >
                  Vider tout le panier
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Checkout Info */}
        {items.length > 0 && (
          <div className="border-t border-white/10 bg-[#07090E] p-5 space-y-4">
            {/* Customer Inputs */}
            <div className="space-y-2 font-['JetBrains_Mono'] text-xs">
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Votre nom (facultatif)"
                className="w-full rounded border border-white/10 bg-[#141824] px-3 py-2 text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
              />
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Adresse ou Ville de livraison"
                className="w-full rounded border border-white/10 bg-[#141824] px-3 py-2 text-white placeholder-[#7C8798] focus:border-[#3E9BFF] focus:outline-none"
              />
            </div>

            {/* Total */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#7C8798]">
                Total Estimé :
              </span>
              <span className="font-['JetBrains_Mono'] text-xl font-extrabold text-[#FF4438]">
                {formatPrice(totalAmount, shopInfo.currency)}
              </span>
            </div>

            {/* WhatsApp Send Button */}
            <button
              onClick={handleSendWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/20 py-3.5 font-['JetBrains_Mono'] text-xs font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition hover:border-emerald-400 hover:bg-emerald-500/30 active:scale-[0.98]"
            >
              <MessageCircle size={17} />
              <span>Valider & Commander sur WhatsApp</span>
            </button>
            <p className="text-center font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">
              Un message pré-rempli avec votre commande sera envoyé directement à House Game.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

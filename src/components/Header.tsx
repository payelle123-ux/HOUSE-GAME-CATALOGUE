import React from "react";
import { Lock, LogOut, ShoppingBag, ShieldCheck, Phone, MessageCircle } from "lucide-react";
import { ShopInfo } from "../types";
import { Logo } from "./Logo";

interface HeaderProps {
  shopInfo: ShopInfo;
  isAdmin: boolean;
  cartCount: number;
  onOpenLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenCart: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  shopInfo,
  isAdmin,
  cartCount,
  onOpenLogin,
  onLogoutAdmin,
  onOpenCart,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07090E]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo & Brand */}
        <Logo size="md" slogan={shopInfo.slogan} />

        {/* Quick actions on the right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick WhatsApp contact */}
          {shopInfo.whatsapp && (
            <a
              href={`https://wa.me/${shopInfo.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-['JetBrains_Mono'] text-xs text-emerald-400 transition hover:border-emerald-400 hover:bg-emerald-500/20 md:inline-flex"
              title="Discuter sur WhatsApp"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 rounded border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 px-3.5 py-1.5 font-['JetBrains_Mono'] text-xs font-semibold text-[#3E9BFF] transition hover:border-[#3E9BFF] hover:bg-[#3E9BFF]/20 active:scale-95"
            aria-label="Voir le panier"
          >
            <ShoppingBag size={15} />
            <span className="hidden sm:inline">Panier</span>
            {cartCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4438] text-[10px] font-bold text-white shadow-[0_0_8px_rgba(255,68,56,0.6)]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Mode Badge or Login Button */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 rounded border border-[#FF4438]/40 bg-[#FF4438]/10 px-2.5 py-1 font-['JetBrains_Mono'] text-xs text-[#FF4438]">
              <ShieldCheck size={14} className="text-[#FF4438]" />
              <span className="hidden sm:inline font-bold">GESTION</span>
              <button
                onClick={onOpenSettings}
                className="ml-1 text-[11px] underline opacity-90 hover:opacity-100 hover:text-white"
                title="Modifier les réglages boutique"
              >
                Infos
              </button>
              <button
                onClick={onLogoutAdmin}
                className="ml-1 p-1 text-[#FF4438] transition hover:text-white"
                title="Quitter le mode gestion"
                aria-label="Déconnexion"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2.5 py-1.5 font-['JetBrains_Mono'] text-xs text-[#7C8798] transition hover:border-[#3E9BFF]/60 hover:text-[#3E9BFF]"
              title="Accès administrateur"
            >
              <Lock size={13} />
              <span className="hidden sm:inline">Espace Pro</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

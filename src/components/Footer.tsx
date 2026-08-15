import React from "react";
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, Heart } from "lucide-react";
import { ShopInfo } from "../types";
import { Logo } from "./Logo";

interface FooterProps {
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  shopInfo,
  isAdmin,
  onOpenLogin,
  onOpenSettings,
}) => {
  return (
    <footer className="border-t border-white/10 bg-[#050609] text-[#7C8798]">
      {/* Top Footer Banner */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand section */}
          <div className="flex flex-col space-y-3">
            <Logo size="md" slogan={shopInfo.slogan} />
            <p className="font-['Chakra_Petch'] text-xs leading-relaxed text-[#7C8798] max-w-sm">
              Votre destination de confiance pour l'achat de consoles next-gen, manettes sans fil officielles, casques audio et jeux vidéo certifiés.
            </p>
          </div>

          {/* Contact & Support */}
          <div className="flex flex-col space-y-2.5 font-['JetBrains_Mono'] text-xs">
            <h4 className="font-['Orbitron'] text-xs font-bold uppercase tracking-wider text-white mb-1">
              Contact & Commandes
            </h4>
            {shopInfo.whatsapp && (
              <a
                href={`https://wa.me/${shopInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#D6DCE6] transition hover:text-emerald-400"
              >
                <MessageCircle size={15} className="text-emerald-400 flex-shrink-0" />
                <span>WhatsApp : {shopInfo.whatsapp}</span>
              </a>
            )}
            {shopInfo.phone && (
              <a
                href={`tel:${shopInfo.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 text-[#D6DCE6] transition hover:text-[#3E9BFF]"
              >
                <Phone size={15} className="text-[#3E9BFF] flex-shrink-0" />
                <span>Appel direct : {shopInfo.phone}</span>
              </a>
            )}
            {shopInfo.address && (
              <div className="flex items-start gap-2 text-[#7C8798]">
                <MapPin size={15} className="text-[#FF4438] flex-shrink-0 mt-0.5" />
                <span>{shopInfo.address}</span>
              </div>
            )}
          </div>

          {/* Hours & Assurance */}
          <div className="flex flex-col space-y-2.5 font-['JetBrains_Mono'] text-xs">
            <h4 className="font-['Orbitron'] text-xs font-bold uppercase tracking-wider text-white mb-1">
              Horaires & Service
            </h4>
            <div className="flex items-center gap-2 text-[#7C8798]">
              <Clock size={15} className="text-amber-400 flex-shrink-0" />
              <span>{shopInfo.openingHours || "Lun - Sam : 08h30 - 20h00"}</span>
            </div>
            <div className="flex items-center gap-2 text-[#7C8798]">
              <ShieldCheck size={15} className="text-[#3E9BFF] flex-shrink-0" />
              <span>Paiement sécurisé à la livraison</span>
            </div>
            <div className="pt-2">
              {isAdmin ? (
                <button
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-1.5 rounded border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] hover:bg-[#3E9BFF]/20"
                >
                  <span>Modifier les informations boutique</span>
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="text-xs text-[#7C8798] underline hover:text-white"
                >
                  Accès espace pro
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-['JetBrains_Mono']">
          <span>
            © {new Date().getFullYear()} <strong className="text-white">House Game</strong> — Tous droits réservés.
          </span>
          <span className="text-[#7C8798]">
            "La qualité n'a pas de prix"
          </span>
        </div>
      </div>
    </footer>
  );
};

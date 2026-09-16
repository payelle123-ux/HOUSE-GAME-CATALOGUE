import React from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Mail,
  User,
  ExternalLink,
} from "lucide-react";
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
  const payelleNum = shopInfo.phonePayelle || "+237 658 413 269";
  const gaetanNum = shopInfo.phoneGaetan || "+237 695 978 762";
  const florenceNum = shopInfo.phoneFlorence || "+237 694 853 477";
  const emailAddr = shopInfo.email || "mankolo1974@gmail.com";

  return (
    <footer id="main-footer" className="border-t border-white/10 bg-[#050609] text-[#7C8798]">
      {/* Top Footer Banner */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand section */}
          <div className="flex flex-col space-y-3">
            <Logo size="md" />
            <p className="font-['Chakra_Petch'] text-xs leading-relaxed text-[#7C8798] max-w-sm">
              Consoles de jeux, accessoires officiels, atelier de réparation haute précision et organisation de tournois Esport.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-['JetBrains_Mono'] text-slate-300">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Matériel certifié & Garantie constructeur</span>
              </span>
            </div>
          </div>

          {/* Contact & Commandes — Ordonné : 1 Payelle / 2 Gaëtan / 3 Florence / Email */}
          <div className="flex flex-col space-y-3 font-['JetBrains_Mono'] text-xs">
            <h4 className="font-['Orbitron'] text-xs font-bold uppercase tracking-wider text-white border-b border-white/10 pb-1.5">
              Contact & Commandes
            </h4>

            {/* 1. Payelle */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-[#D6DCE6]">
                <User size={14} className="text-amber-400 shrink-0" />
                <span className="font-bold text-white">1. Payelle :</span>
                <span className="text-slate-300">{payelleNum}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/${payelleNum.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Payelle ! Je souhaite passer commande sur House Game.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp Payelle"
                  className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                >
                  <MessageCircle size={14} />
                </a>
                <a
                  href={`tel:${payelleNum.replace(/\s+/g, "")}`}
                  title="Appeler Payelle"
                  className="p-1 rounded bg-blue-500/10 text-[#3E9BFF] hover:bg-blue-500/20"
                >
                  <Phone size={14} />
                </a>
              </div>
            </div>

            {/* 2. Gaëtan */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-[#D6DCE6]">
                <User size={14} className="text-purple-400 shrink-0" />
                <span className="font-bold text-white">2. Gaëtan :</span>
                <span className="text-slate-300">{gaetanNum}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/${gaetanNum.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Gaëtan ! Je souhaite passer commande sur House Game.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp Gaëtan"
                  className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                >
                  <MessageCircle size={14} />
                </a>
                <a
                  href={`tel:${gaetanNum.replace(/\s+/g, "")}`}
                  title="Appeler Gaëtan"
                  className="p-1 rounded bg-blue-500/10 text-[#3E9BFF] hover:bg-blue-500/20"
                >
                  <Phone size={14} />
                </a>
              </div>
            </div>

            {/* 3. Florence */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2 text-[#D6DCE6]">
                <User size={14} className="text-rose-400 shrink-0" />
                <span className="font-bold text-white">3. Florence :</span>
                <span className="text-slate-300">{florenceNum}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/${florenceNum.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour Florence ! Je souhaite passer commande sur House Game.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp Florence"
                  className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                >
                  <MessageCircle size={14} />
                </a>
                <a
                  href={`tel:${florenceNum.replace(/\s+/g, "")}`}
                  title="Appeler Florence"
                  className="p-1 rounded bg-blue-500/10 text-[#3E9BFF] hover:bg-blue-500/20"
                >
                  <Phone size={14} />
                </a>
              </div>
            </div>

            {/* Email officiel */}
            <a
              href={`mailto:${emailAddr}`}
              className="flex items-center gap-2 text-[#D6DCE6] hover:text-amber-300 transition-colors pt-1"
            >
              <Mail size={15} className="text-amber-400 flex-shrink-0" />
              <span>Email : {emailAddr}</span>
            </a>
          </div>

          {/* Horaires & Coordonnées */}
          <div className="flex flex-col space-y-3 font-['JetBrains_Mono'] text-xs">
            <h4 className="font-['Orbitron'] text-xs font-bold uppercase tracking-wider text-white border-b border-white/10 pb-1.5">
              Horaires & Boutique
            </h4>
            <div className="flex items-start gap-2 text-[#7C8798]">
              <MapPin size={15} className="text-[#FF4438] flex-shrink-0 mt-0.5" />
              <span>{shopInfo.address}</span>
            </div>
            <div className="flex items-center gap-2 text-[#7C8798]">
              <Clock size={15} className="text-amber-400 flex-shrink-0" />
              <span>{shopInfo.openingHours || "Lun - Sam : 08h30 - 20h00"}</span>
            </div>
            <div className="pt-2">
              {isAdmin ? (
                <button
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-1.5 rounded border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] hover:bg-[#3E9BFF]/20 transition"
                >
                  <span>Modifier les informations boutique</span>
                </button>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="text-xs text-[#7C8798] underline hover:text-white transition"
                >
                  Accès espace pro
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom copyright — Doublon "La qualité n'a pas de prix" supprimé */}
        <div className="mt-10 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-['JetBrains_Mono']">
          <span className="text-slate-400">
            © {new Date().getFullYear()} <strong className="text-white">House Game</strong> — Hub officiel du Gaming & de l'Esport. Tous droits réservés.
          </span>
          <span className="text-slate-500">
            Cameroun • Contact : {emailAddr}
          </span>
        </div>
      </div>
    </footer>
  );
};

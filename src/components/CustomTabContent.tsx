import React from "react";
import {
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  MessageCircle,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { CustomTab, CustomTabItem, ShopInfo } from "../types";

interface CustomTabContentProps {
  tab: CustomTab;
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onOpenAddItem: () => void;
  onEditItem: (item: CustomTabItem) => void;
  onDeleteItem: (itemId: string) => void;
  onEditTabDetails: () => void;
  onDeleteTab: () => void;
}

export const CustomTabContent: React.FC<CustomTabContentProps> = ({
  tab,
  shopInfo,
  isAdmin,
  onOpenAddItem,
  onEditItem,
  onDeleteItem,
  onEditTabDetails,
  onDeleteTab,
}) => {
  const cleanPhone = shopInfo.whatsapp.replace(/[^0-9]/g, "");

  return (
    <div id={`custom-tab-view-${tab.id}`} className="space-y-8 pb-12 animate-fadeIn">
      {/* Admin Ribbon for Custom Tab */}
      {isAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 p-3.5 text-xs text-[#3E9BFF]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#3E9BFF] animate-ping" />
            <span className="font-['JetBrains_Mono'] font-bold">
              GESTION DE L'ONGLET "{tab.title.toUpperCase()}" (ESPACE PRO)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddItem}
              className="flex items-center gap-1.5 rounded-lg border border-[#3E9BFF]/50 bg-[#3E9BFF]/20 px-3 py-1.5 font-['JetBrains_Mono'] font-bold text-white hover:bg-[#3E9BFF]/30 transition"
            >
              <Plus size={14} />
              <span>+ Ajouter un élément</span>
            </button>

            <button
              onClick={onEditTabDetails}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-['JetBrains_Mono'] font-bold text-white hover:bg-white/10 transition"
            >
              <Edit3 size={14} />
              <span>Modifier l'onglet</span>
            </button>

            <button
              onClick={onDeleteTab}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 font-['JetBrains_Mono'] font-bold text-red-400 hover:bg-red-500/20 transition"
            >
              <Trash2 size={14} />
              <span>Supprimer l'onglet</span>
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F17] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#3E9BFF]/40 bg-[#3E9BFF]/10 px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF]">
            <Sparkles size={13} />
            <span>ESPACE PERSONNALISÉ</span>
          </div>

          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl font-black text-white">
            {tab.title}
          </h1>

          {tab.description && (
            <p className="font-['Chakra_Petch'] text-sm sm:text-base text-[#A0AEC0] leading-relaxed">
              {tab.description}
            </p>
          )}
        </div>
      </section>

      {/* Tab Items Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-['Orbitron'] text-xl font-bold text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3E9BFF]" />
            <span>CONTENU DISPONIBLE ({tab.items?.length || 0})</span>
          </h2>

          {isAdmin && (
            <button
              onClick={onOpenAddItem}
              className="flex items-center gap-1.5 rounded-lg border border-[#3E9BFF]/50 bg-[#3E9BFF]/20 px-3.5 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-white hover:bg-[#3E9BFF]/30 transition"
            >
              <Plus size={14} />
              <span>Ajouter un élément</span>
            </button>
          )}
        </div>

        {!tab.items || tab.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0E121B] p-12 text-center">
            <Package size={36} className="text-[#7C8798] mb-3" />
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              Cet onglet est actuellement vide
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] mt-1 max-w-sm">
              {isAdmin
                ? "Cliquez sur '+ Ajouter un élément' ci-dessus pour ajouter du contenu personnalisé (cartes, services, offres, informations)."
                : "Du contenu sera bientôt publié dans cette section."}
            </p>
            {isAdmin && (
              <button
                onClick={onOpenAddItem}
                className="mt-4 flex items-center gap-2 rounded-xl bg-[#3E9BFF] px-4 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white hover:bg-[#5aaaff] transition"
              >
                <Plus size={15} />
                <span>Ajouter le premier élément</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tab.items.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0E121B] shadow-lg transition hover:border-[#3E9BFF]/50 hover:bg-[#121723]"
              >
                <div>
                  {item.image && (
                    <div className="relative h-48 w-full overflow-hidden bg-[#141824]">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-transparent to-black/40" />

                      {item.priceOrTag && (
                        <div className="absolute bottom-3 left-3">
                          <span className="rounded-lg bg-[#FF4438] px-2.5 py-1 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-md">
                            {item.priceOrTag}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-['Orbitron'] text-base font-bold text-white leading-snug group-hover:text-[#3E9BFF] transition-colors">
                        {item.title}
                      </h3>
                      {!item.image && item.priceOrTag && (
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-['JetBrains_Mono'] text-[11px] font-bold text-amber-300">
                          {item.priceOrTag}
                        </span>
                      )}
                    </div>

                    {item.subtitle && (
                      <div className="font-['JetBrains_Mono'] text-xs text-[#3E9BFF]">
                        {item.subtitle}
                      </div>
                    )}

                    <p className="font-['Chakra_Petch'] text-xs text-[#A0AEC0] leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        item.buttonWhatsAppMessage ||
                          `Bonjour House Game, je souhaite avoir des renseignements concernant : ${item.title} (${tab.title}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 transition active:scale-95"
                    >
                      <MessageCircle size={15} />
                      <span>{item.buttonText || "Contacter sur WhatsApp"}</span>
                    </a>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditItem(item)}
                          title="Modifier cet élément"
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#7C8798] hover:border-[#3E9BFF]/50 hover:bg-[#3E9BFF]/10 hover:text-white transition"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          title="Supprimer cet élément"
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#7C8798] hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

import React from "react";
import {
  Home,
  ShoppingBag,
  Wrench,
  Calendar,
  Trophy,
  Plus,
  Sparkles,
  Layers,
  Flame,
  Radio,
  Gamepad2,
  Tv,
  Star,
  Users,
} from "lucide-react";
import { CustomTab, NavTabId } from "../types";

interface NavigationProps {
  activeTab: NavTabId;
  onSelectTab: (tabId: NavTabId) => void;
  customTabs: CustomTab[];
  isAdmin: boolean;
  onOpenCreateTabModal: () => void;
  cartCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  customTabs,
  isAdmin,
  onOpenCreateTabModal,
  cartCount,
}) => {
  const officialTabs = [
    {
      id: "home",
      label: "Accueil",
      icon: Home,
      tag: "Présentation",
      color: "text-[#3E9BFF]",
    },
    {
      id: "shop",
      label: "Boutique & Vente",
      icon: ShoppingBag,
      tag: "Catalogue",
      badge: cartCount > 0 ? cartCount : undefined,
      color: "text-[#FF4438]",
    },
    {
      id: "repair",
      label: "Réparation & Atelier",
      icon: Wrench,
      tag: "Devis Express",
      color: "text-amber-400",
    },
    {
      id: "events",
      label: "Events",
      icon: Calendar,
      tag: "Gaming Sessions",
      color: "text-purple-400",
    },
    {
      id: "esport",
      label: "Esport & Tournois",
      icon: Trophy,
      tag: "Cash Prizes",
      color: "text-emerald-400",
    },
  ];

  const getCustomIcon = (iconName?: string) => {
    switch (iconName) {
      case "Flame":
        return Flame;
      case "Radio":
        return Radio;
      case "Gamepad2":
        return Gamepad2;
      case "Tv":
        return Tv;
      case "Star":
        return Star;
      case "Users":
        return Users;
      default:
        return Sparkles;
    }
  };

  return (
    <nav
      id="main-navigation-bar"
      aria-label="Navigation principale"
      className="sticky top-[69px] z-30 border-b border-white/10 bg-[#0A0C14]/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Scrollable Tab Container */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none w-full">
          {/* Official Tabs */}
          {officialTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold transition-all ${
                  isActive
                    ? "border border-[#FF4438]/50 bg-gradient-to-r from-[#FF4438]/20 to-[#3E9BFF]/10 text-white shadow-[0_0_15px_rgba(255,68,56,0.25)]"
                    : "border border-white/5 bg-white/[0.02] text-[#7C8798] hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon
                  size={16}
                  className={`transition-colors ${
                    isActive ? tab.color : "text-[#7C8798] group-hover:text-white"
                  }`}
                />
                <div className="flex flex-col text-left">
                  <span className="leading-tight">{tab.label}</span>
                </div>

                {tab.badge !== undefined && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF4438] px-1.5 text-[10px] font-black text-white shadow-[0_0_8px_rgba(255,68,56,0.6)] animate-pulse">
                    {tab.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute -bottom-2.5 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-t-full bg-gradient-to-r from-[#FF4438] to-[#3E9BFF] shadow-[0_0_8px_#FF4438]" />
                )}
              </button>
            );
          })}

          {/* Dynamic Custom Tabs */}
          {customTabs.map((tab) => {
            const Icon = getCustomIcon(tab.icon);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`nav-tab-custom-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold transition-all ${
                  isActive
                    ? "border border-[#3E9BFF]/60 bg-gradient-to-r from-[#3E9BFF]/20 to-purple-600/20 text-white shadow-[0_0_15px_rgba(62,155,255,0.3)]"
                    : "border border-white/5 bg-white/[0.02] text-[#7C8798] hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon
                  size={15}
                  className={isActive ? "text-[#3E9BFF]" : "text-[#7C8798]"}
                />
                <span>{tab.title}</span>

                {tab.items && tab.items.length > 0 && (
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-[#A0AEC0]">
                    {tab.items.length}
                  </span>
                )}

                {isActive && (
                  <span className="absolute -bottom-2.5 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-t-full bg-[#3E9BFF] shadow-[0_0_8px_#3E9BFF]" />
                )}
              </button>
            );
          })}

          {/* Admin Add Tab Button */}
          {isAdmin && (
            <button
              id="admin-btn-add-custom-tab"
              onClick={onOpenCreateTabModal}
              title="Ajouter un nouvel onglet personnalisé sur le site"
              className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-[#3E9BFF]/40 bg-[#3E9BFF]/10 px-3 py-2 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] transition hover:border-[#3E9BFF] hover:bg-[#3E9BFF]/20 active:scale-95"
            >
              <Plus size={14} />
              <span>+ Nouvel Onglet</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

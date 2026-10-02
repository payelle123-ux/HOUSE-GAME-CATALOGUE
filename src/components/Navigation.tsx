import React from "react";
import {
  Home,
  ShoppingBag,
  Activity,
  Calendar,
  GraduationCap,
  Wrench,
  Plus,
  Sparkles,
  Flame,
  Radio,
  Gamepad2,
  Tv,
  Star,
  Users,
} from "lucide-react";
import { CustomTab, NavTabId } from "../types";
import { sfx } from "../services/soundEffects";

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
      label: "ACCUEIL",
      icon: Home,
      color: "text-[#3E9BFF]",
    },
    {
      id: "shop",
      label: "BOUTIQUE",
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
      color: "text-[#FF4438]",
    },
    {
      id: "activities",
      label: "NOS ACTIVITES",
      icon: Activity,
      color: "text-amber-400",
    },
    {
      id: "events",
      label: "HG EVENT",
      icon: Calendar,
      color: "text-purple-400",
    },
    {
      id: "campus",
      label: "HG CAMPUS",
      icon: GraduationCap,
      color: "text-emerald-400",
    },
    {
      id: "service",
      label: "HG SERVICE",
      icon: Wrench,
      color: "text-cyan-400",
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
                onMouseEnter={() => sfx.playHover()}
                onClick={() => {
                  sfx.playTabSwitch();
                  onSelectTab(tab.id);
                }}
                className={`group relative flex flex-shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                  isActive
                    ? "border border-[#FF4438]/60 bg-gradient-to-r from-[#FF4438]/25 to-[#3E9BFF]/15 text-white shadow-[0_0_20px_rgba(255,68,56,0.3)] scale-[1.02]"
                    : "border border-white/5 bg-white/[0.02] text-[#7C8798] hover:border-[#3E9BFF]/30 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon
                  size={16}
                  className={`transition-all duration-200 group-hover:scale-110 ${
                    isActive ? `${tab.color} drop-shadow-[0_0_8px_currentColor]` : "text-[#7C8798] group-hover:text-white"
                  }`}
                />
                <div className="flex flex-col text-left">
                  <span className="leading-tight">{tab.label}</span>
                </div>

                {tab.badge !== undefined && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF4438] px-1.5 text-[10px] font-black text-white shadow-[0_0_10px_rgba(255,68,56,0.8)] animate-pulse">
                    {tab.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute -bottom-2.5 left-1/2 h-[3.5px] w-10 -translate-x-1/2 rounded-t-full bg-gradient-to-r from-[#FF4438] via-purple-500 to-[#3E9BFF] shadow-[0_0_12px_#FF4438] animate-pulse" />
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
                onMouseEnter={() => sfx.playHover()}
                onClick={() => {
                  sfx.playTabSwitch();
                  onSelectTab(tab.id);
                }}
                className={`group relative flex flex-shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                  isActive
                    ? "border border-[#3E9BFF]/70 bg-gradient-to-r from-[#3E9BFF]/25 to-purple-600/25 text-white shadow-[0_0_20px_rgba(62,155,255,0.35)] scale-[1.02]"
                    : "border border-white/5 bg-white/[0.02] text-[#7C8798] hover:border-[#3E9BFF]/30 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon
                  size={15}
                  className={`transition-all duration-200 group-hover:scale-110 ${
                    isActive ? "text-[#3E9BFF] drop-shadow-[0_0_8px_#3E9BFF]" : "text-[#7C8798] group-hover:text-white"
                  }`}
                />
                <span>{tab.title}</span>

                {tab.items && tab.items.length > 0 && (
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-[#A0AEC0]">
                    {tab.items.length}
                  </span>
                )}

                {isActive && (
                  <span className="absolute -bottom-2.5 left-1/2 h-[3.5px] w-10 -translate-x-1/2 rounded-t-full bg-[#3E9BFF] shadow-[0_0_12px_#3E9BFF] animate-pulse" />
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

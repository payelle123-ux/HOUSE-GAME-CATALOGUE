import React, { useState, useEffect, useRef } from "react";
import { TickerItem } from "../types";
import {
  Megaphone,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Flame,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  X,
} from "lucide-react";

interface TickerBannerProps {
  items: TickerItem[];
  onNavigateTab: (tabId: string) => void;
  isAdmin?: boolean;
  onUpdateItems?: (items: TickerItem[]) => void;
}

export const TickerBanner: React.FC<TickerBannerProps> = ({
  items,
  onNavigateTab,
  isAdmin = false,
  onUpdateItems,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newTag, setNewTag] = useState("PROMO");
  const [newText, setNewText] = useState("");
  const [newLinkTab, setNewLinkTab] = useState("shop");

  // Auto rotate
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [items.length, isPaused]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !onUpdateItems) return;
    const newItem: TickerItem = {
      id: `tick-${Date.now()}`,
      tag: newTag.trim() || "ANNONCE",
      text: newText.trim(),
      linkTab: newLinkTab,
      highlight: true,
    };
    onUpdateItems([...items, newItem]);
    setNewText("");
  };

  const handleDeleteItem = (id: string) => {
    if (!onUpdateItems) return;
    const updated = items.filter((it) => it.id !== id);
    onUpdateItems(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
  };

  return (
    <div
      id="hg-top-ticker-banner"
      className="relative border-b border-amber-500/30 bg-gradient-to-r from-[#0E131F] via-[#161C2C] to-[#0E131F] text-slate-100 shadow-lg z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-semibold uppercase tracking-wider text-[11px]">
            <Megaphone className="w-3.5 h-3.5 text-amber-400" />
            <span>FLASH INFO</span>
          </div>
        </div>

        {/* Central Display / Content */}
        <div
          className="flex-1 overflow-hidden min-w-0 flex items-center justify-center cursor-pointer"
          onClick={() => currentItem.linkTab && onNavigateTab(currentItem.linkTab)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-center gap-2 sm:gap-3 text-center truncate group">
            <span
              className={`shrink-0 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border ${
                currentItem.highlight
                  ? "bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse"
                  : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
              }`}
            >
              {currentItem.tag}
            </span>
            <p className="truncate text-slate-200 group-hover:text-amber-300 transition-colors font-medium">
              {currentItem.text}
            </p>
            {currentItem.linkTab && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                <span>Découvrir</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePrev}
            title="Message précédent"
            className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Reprendre le défilement" : "Mettre en pause"}
            className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleNext}
            title="Message suivant"
            className="p-1 rounded hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Admin Manage Ticker */}
          {isAdmin && (
            <button
              onClick={() => setShowManageModal(true)}
              className="ml-2 px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-300 text-xs flex items-center gap-1 transition-colors"
              title="Gérer les annonces de la bannière"
            >
              <Edit2 className="w-3 h-3" />
              <span className="hidden lg:inline">Éditer flash</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Management Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-slate-700 rounded-xl max-w-xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Gestion de la Bannière Rectangulaire Défilante
                </h3>
              </div>
              <button
                onClick={() => setShowManageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Ajouter une nouvelle annonce
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Badge / Tag</label>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ex: PROMO SEMAINE"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Lien vers onglet</label>
                  <select
                    value={newLinkTab}
                    onChange={(e) => setNewLinkTab(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="shop">Boutique</option>
                    <option value="events">HG Event</option>
                    <option value="activities">Nos Activités</option>
                    <option value="campus">HG Campus</option>
                    <option value="service">HG Service</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[11px] text-slate-400 block mb-1">Texte de l'annonce</label>
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Ex: Arrivage exceptionnel de manettes PS5 personnalisées..."
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter à la bannière</span>
              </button>
            </form>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">
                Annonces actives ({items.length})
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 rounded bg-slate-800/60 border border-slate-700/50 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-amber-300 shrink-0">
                        {item.tag}
                      </span>
                      <span className="text-slate-200 truncate">{item.text}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={items.length <= 1}
                      className="text-rose-400 hover:text-rose-300 p-1 disabled:opacity-40"
                      title="Supprimer cette annonce"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowManageModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

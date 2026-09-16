import React, { useState } from "react";
import {
  HgEventItem,
  ShopInfo,
} from "../types";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  MessageCircle,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Flame,
  Gamepad2,
  Tv,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  Info,
  X,
} from "lucide-react";

interface HgEventTabProps {
  events: HgEventItem[];
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onUpdateEvents: (events: HgEventItem[]) => void;
}

export const HgEventTab: React.FC<HgEventTabProps> = ({
  events,
  shopInfo,
  isAdmin,
  onUpdateEvents,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events[0]?.id || ""
  );

  // Admin Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HgEventItem | null>(null);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  const cleanPhone = (shopInfo.phonePayelle || shopInfo.whatsapp).replace(/[^0-9]/g, "");

  const handleOpenEdit = (event: HgEventItem) => {
    setEditingItem({ ...event });
    setIsEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    const newEvent: HgEventItem = {
      id: `hge-${Date.now()}`,
      title: "NOUVEL ÉVÉNEMENT HG",
      slug: `event-${Date.now()}`,
      badge: "Spécial",
      definition: "Définition du nouvel événement...",
      nextEdition: {
        title: "Prochaine Édition",
        date: "Bientôt disponible",
        time: "14h00",
        location: "House Game Cameroun",
        flyerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
        entryFee: "Sur inscription",
        description: "Rejoignez-nous pour cet événement exceptionnel.",
        bookingOpen: true,
      },
      archives: [],
    };
    setEditingItem(newEvent);
    setIsEditModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const exists = events.some((ev) => ev.id === editingItem.id);
    let updated: HgEventItem[];
    if (exists) {
      updated = events.map((ev) => (ev.id === editingItem.id ? editingItem : ev));
    } else {
      updated = [...events, editingItem];
    }
    onUpdateEvents(updated);
    setSelectedEventId(editingItem.id);
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (events.length <= 1) return;
    if (!window.confirm("Voulez-vous vraiment supprimer cet événement ?")) return;
    const updated = events.filter((ev) => ev.id !== id);
    onUpdateEvents(updated);
    if (selectedEventId === id) {
      setSelectedEventId(updated[0]?.id || "");
    }
  };

  return (
    <div id="hg-event-page" className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-[#140C24] via-[#1B1133] to-[#0E121B] p-6 sm:p-8 shadow-2xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold text-purple-300">
            <Sparkles size={14} className="text-purple-400" />
            <span>ÉVÉNEMENTIEL GAMING OFFICIEL</span>
          </div>
          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            HG EVENT & SOIRÉES EXCLUSIVES
          </h1>
          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-slate-300 leading-relaxed">
            Plongez dans l'effervescence des 6 grands concepts événementiels House Game : afterworks conviviaux, défis gaming, quiz de culture geek, célébrations afro-gaming et fashion week otaku.
          </p>
        </div>

        {/* Admin Add New Event Button */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-purple-500/20 flex items-center justify-between">
            <span className="text-xs font-['JetBrains_Mono'] text-purple-300">
              Mode Espace Pro activé : vous pouvez modifier les flyers, dates et ajouter des événements.
            </span>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold font-['JetBrains_Mono'] text-xs transition shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              <Plus size={14} />
              <span>+ Nouvel Événement HG</span>
            </button>
          </div>
        )}
      </div>

      {/* Event Selector Tabs (The 6 Defined HG Events) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {events.map((ev) => {
          const isSelected = ev.id === selectedEventId;
          return (
            <button
              key={ev.id}
              onClick={() => setSelectedEventId(ev.id)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border text-xs sm:text-sm font-bold font-['Orbitron'] transition-all flex items-center gap-2.5 ${
                isSelected
                  ? "border-purple-500 bg-purple-600/25 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  : "border-white/10 bg-[#0E121B] text-slate-400 hover:text-white hover:border-white/25"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-purple-400 animate-pulse" : "bg-slate-600"}`} />
              <span>{ev.title}</span>
              {ev.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-purple-300 font-['JetBrains_Mono'] font-normal">
                  {ev.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Event Details Showcase */}
      {currentEvent && (
        <div className="space-y-8">
          {/* Definition & Next Edition Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Definition & Concept */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-[#0E121B] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-bold font-['JetBrains_Mono'] text-purple-400">
                    <Info size={15} />
                    <span>CONCEPT & DÉFINITION</span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(currentEvent)}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-['JetBrains_Mono']"
                    >
                      <Edit2 size={13} />
                      <span>Modifier</span>
                    </button>
                  )}
                </div>

                <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white">
                  {currentEvent.title}
                </h2>

                <p className="font-['Chakra_Petch'] text-sm text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  {currentEvent.definition}
                </p>

                {/* Highlights tags */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>Accès ouvert au grand public & passionnés</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>Setup écrans 4K, consoles scellées & son spatialisé</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>Réservation directe via WhatsApp</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => handleDeleteEvent(currentEvent.id)}
                      disabled={events.length <= 1}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 disabled:opacity-30"
                    >
                      <Trash2 size={13} />
                      <span>Supprimer cet événement</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Next Edition Card with Flyer & Direct WhatsApp Booking */}
            <div className="lg:col-span-7">
              {currentEvent.nextEdition ? (
                <div className="rounded-2xl border border-purple-500/30 bg-[#0E121B] overflow-hidden shadow-xl space-y-4">
                  {/* Flyer Banner */}
                  <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900 group">
                    <img
                      src={currentEvent.nextEdition.flyerUrl}
                      alt={currentEvent.nextEdition.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-transparent to-black/40" />

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-['JetBrains_Mono'] text-xs font-bold shadow-lg">
                        PROCHAINE ÉDITION
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-['Orbitron'] text-lg sm:text-2xl font-bold text-white drop-shadow-md">
                        {currentEvent.nextEdition.title}
                      </h3>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-6 space-y-4">
                    <p className="font-['Chakra_Petch'] text-sm text-slate-300 leading-relaxed">
                      {currentEvent.nextEdition.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-['JetBrains_Mono'] text-xs">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300">
                        <Calendar size={16} className="text-purple-400 shrink-0" />
                        <span>{currentEvent.nextEdition.date}</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300">
                        <Clock size={16} className="text-amber-400 shrink-0" />
                        <span>{currentEvent.nextEdition.time}</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300">
                        <MapPin size={16} className="text-[#FF4438] shrink-0" />
                        <span>{currentEvent.nextEdition.location}</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300">
                        <Ticket size={16} className="text-emerald-400 shrink-0" />
                        <span className="font-bold text-white">{currentEvent.nextEdition.entryFee}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-3">
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                          `Bonjour House Game ! Je souhaite réserver ma place pour l'événement : ${currentEvent.title} - ${currentEvent.nextEdition.title} (${currentEvent.nextEdition.date}).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold font-['Orbitron'] text-xs sm:text-sm shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all active:scale-98"
                      >
                        <MessageCircle size={18} />
                        <span>RÉSERVER MA PLACE SUR WHATSAPP</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#0E121B] p-8 text-center text-slate-400 space-y-3">
                  <Calendar size={32} className="mx-auto text-slate-600" />
                  <p className="font-['Orbitron'] text-sm font-bold text-white">
                    Aucune date programmée pour le moment
                  </p>
                  <p className="text-xs">
                    Suivez nos actualités ou contactez-nous pour connaître le calendrier des prochaines éditions.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Event Archives Photo Gallery */}
          {currentEvent.archives && currentEvent.archives.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 font-['Orbitron'] text-sm font-bold text-white">
                  <ImageIcon size={16} className="text-purple-400" />
                  <span>ARCHIVES & SOUVENIRS DES ÉDITIONS PRÉCÉDENTES</span>
                </div>
                <span className="text-xs font-['JetBrains_Mono'] text-slate-500">
                  {currentEvent.archives.length} photos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentEvent.archives.map((arc) => (
                  <div
                    key={arc.id}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900 aspect-video shadow-md"
                  >
                    <img
                      src={arc.imageUrl}
                      alt={arc.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <p className="font-['Orbitron'] text-xs font-bold text-white truncate">
                        {arc.title}
                      </p>
                      {arc.editionDate && (
                        <p className="text-[10px] font-['JetBrains_Mono'] text-purple-300">
                          {arc.editionDate}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Edit Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E121B] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-['Orbitron'] text-base font-bold text-white">
                Modifier l'événement : {editingItem.title}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs font-['Chakra_Petch']">
              <div>
                <label className="block text-slate-300 mb-1 font-bold">Titre de l'événement</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Badge / Tag</label>
                <input
                  type="text"
                  value={editingItem.badge || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, badge: e.target.value })}
                  placeholder="Ex: Convivial & Afterwork"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-bold">Définition & Concept</label>
                <textarea
                  value={editingItem.definition}
                  onChange={(e) => setEditingItem({ ...editingItem, definition: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 space-y-3">
                <h4 className="font-['Orbitron'] text-xs font-bold text-purple-300">
                  Prochaine Édition (Flyer & Inscription)
                </h4>

                <div>
                  <label className="block text-slate-300 mb-1">Titre de la prochaine édition</label>
                  <input
                    type="text"
                    value={editingItem.nextEdition?.title || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        nextEdition: {
                          ...(editingItem.nextEdition || {
                            date: "",
                            time: "",
                            location: "",
                            flyerUrl: "",
                            entryFee: "",
                            description: "",
                          }),
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1">Date</label>
                    <input
                      type="text"
                      value={editingItem.nextEdition?.date || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          nextEdition: {
                            ...(editingItem.nextEdition as any),
                            date: e.target.value,
                          },
                        })
                      }
                      placeholder="Ex: Vendredi 26 Septembre 2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Horaires</label>
                    <input
                      type="text"
                      value={editingItem.nextEdition?.time || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          nextEdition: {
                            ...(editingItem.nextEdition as any),
                            time: e.target.value,
                          },
                        })
                      }
                      placeholder="Ex: 18h30 - 23h30"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Lieu</label>
                    <input
                      type="text"
                      value={editingItem.nextEdition?.location || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          nextEdition: {
                            ...(editingItem.nextEdition as any),
                            location: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Tarif / Inscription</label>
                    <input
                      type="text"
                      value={editingItem.nextEdition?.entryFee || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          nextEdition: {
                            ...(editingItem.nextEdition as any),
                            entryFee: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">URL de l'image du Flyer</label>
                  <input
                    type="url"
                    value={editingItem.nextEdition?.flyerUrl || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        nextEdition: {
                          ...(editingItem.nextEdition as any),
                          flyerUrl: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Description</label>
                  <textarea
                    value={editingItem.nextEdition?.description || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        nextEdition: {
                          ...(editingItem.nextEdition as any),
                          description: e.target.value,
                        },
                      })
                    }
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold text-white font-['Orbitron']"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

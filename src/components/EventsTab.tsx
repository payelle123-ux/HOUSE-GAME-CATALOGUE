import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Ticket,
  Plus,
  Edit3,
  Trash2,
  MessageCircle,
  Users,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { GamingEvent, ShopInfo } from "../types";
import { buildWhatsAppEventRsvpUrl } from "../services/storage";

interface EventsTabProps {
  events: GamingEvent[];
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onOpenAddEvent: () => void;
  onEditEvent: (event: GamingEvent) => void;
  onDeleteEvent: (event: GamingEvent) => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({
  events,
  shopInfo,
  isAdmin,
  onOpenAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  // Modal for event reservation
  const [selectedEventForRsvp, setSelectedEventForRsvp] = useState<GamingEvent | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [count, setCount] = useState<number>(1);

  const handleConfirmRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForRsvp) return;
    const url = buildWhatsAppEventRsvpUrl(shopInfo.whatsapp, {
      event: selectedEventForRsvp,
      fullName: fullName || "Gamer Invité",
      participantsCount: count,
    });
    window.open(url, "_blank");
    setSelectedEventForRsvp(null);
    setFullName("");
    setCount(1);
  };

  return (
    <div id="events-tab-view" className="space-y-10 pb-12 animate-fadeIn">
      {/* Admin Ribbon */}
      {isAdmin && (
        <div
          id="admin-events-banner"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3.5 text-xs text-purple-200"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <span className="font-['JetBrains_Mono'] font-bold">
              ESPACE PRO ÉVÉNEMENTS : Planifiez, éditez ou supprimez les événements et sessions gaming.
            </span>
          </div>
          <button
            onClick={onOpenAddEvent}
            id="admin-add-event-btn"
            className="flex items-center gap-1.5 rounded-lg border border-purple-400/50 bg-purple-500/20 px-3.5 py-1.5 font-['JetBrains_Mono'] font-bold text-purple-300 hover:bg-purple-500/30 transition shadow-[0_0_10px_rgba(168,85,247,0.2)]"
          >
            <Plus size={14} />
            <span>+ Ajouter un événement</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F17] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold text-purple-300">
            <Calendar size={13} />
            <span>SOIRÉES & ÉVÉNEMENTS COMMUNAUTAIRES</span>
          </div>

          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl font-black text-white">
            ÉVÉNEMENTS & SESSIONS GAMING HOUSE GAME
          </h1>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-[#A0AEC0] leading-relaxed">
            Participez à nos soirées de lancement de jeux, découvrez les dernières technologies VR, affrontez la communauté lors de sessions rétrogaming et rencontrez d'autres passionnés.
          </p>
        </div>
      </section>

      {/* Events List */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-3">
          <div>
            <h2 className="font-['Orbitron'] text-xl font-bold text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
              <span>PROGRAMME DES ÉVÉNEMENTS ({events.length})</span>
            </h2>
            <p className="font-['JetBrains_Mono'] text-xs text-[#7C8798] mt-0.5">
              Réservez votre place directement via WhatsApp.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenAddEvent}
              className="flex items-center gap-1.5 rounded-lg border border-purple-400/50 bg-purple-500/20 px-3.5 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-purple-300 hover:bg-purple-500/30 transition"
            >
              <Plus size={14} />
              <span>Créer un événement</span>
            </button>
          )}
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#0E121B] p-12 text-center text-[#7C8798]">
            <p className="font-['Orbitron'] text-base text-white">Aucun événement planifié pour le moment</p>
            <p className="font-['Chakra_Petch'] text-xs mt-1">Revenez bientôt pour découvrir les prochaines dates !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0E121B] shadow-lg transition hover:border-purple-500/50 hover:bg-[#121723]"
              >
                <div>
                  {/* Event Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#141824]">
                    <img
                      src={evt.image || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"}
                      alt={evt.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-transparent to-black/40" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="rounded-md border border-purple-400/40 bg-black/70 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-purple-300 backdrop-blur-sm">
                        {evt.status}
                      </span>
                      {evt.badge && (
                        <span className="rounded-md border border-amber-400/40 bg-black/70 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-amber-300 backdrop-blur-sm">
                          {evt.badge}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-lg bg-[#FF4438] px-2.5 py-1 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-md">
                        {evt.entry}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-5 space-y-4">
                    <h3 className="font-['Orbitron'] text-base font-bold text-white leading-snug group-hover:text-purple-300 transition-colors">
                      {evt.title}
                    </h3>

                    {/* Date, Time, Location */}
                    <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs text-[#A0AEC0]">
                      <div className="flex items-center gap-2 text-white">
                        <Calendar size={14} className="text-purple-400 flex-shrink-0" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#7C8798] flex-shrink-0" />
                        <span>{evt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#7C8798] flex-shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>

                    <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>

                    {/* Highlights */}
                    {evt.highlights && evt.highlights.length > 0 && (
                      <div className="space-y-1 border-t border-white/5 pt-3 font-['JetBrains_Mono'] text-[11px] text-[#D6DCE6]">
                        {evt.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-5 pt-0">
                  <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedEventForRsvp(evt)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:bg-purple-500 transition active:scale-95"
                    >
                      <Ticket size={15} />
                      <span>Réserver ma place</span>
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditEvent(evt)}
                          title="Modifier cet événement"
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#7C8798] hover:border-purple-400/50 hover:bg-purple-500/10 hover:text-purple-300 transition"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(evt)}
                          title="Supprimer cet événement"
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

      {/* RSVP Modal */}
      {selectedEventForRsvp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedEventForRsvp(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-[#12151E] p-6 shadow-2xl">
            <h3 className="font-['Orbitron'] text-base font-bold text-white mb-1">
              RÉSERVATION ÉVÉNEMENT
            </h3>
            <p className="font-['JetBrains_Mono'] text-xs text-purple-300 mb-4">
              {selectedEventForRsvp.title}
            </p>

            <form onSubmit={handleConfirmRsvp} className="space-y-4 font-['JetBrains_Mono'] text-xs">
              <div>
                <label className="block text-[#A0AEC0] mb-1">Votre Nom & Prénom :</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Landry Moungondo"
                  required
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A0AEC0] mb-1">Nombre de participants :</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value) || 1)}
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-[11px] text-[#7C8798]">
                <div className="text-white font-bold mb-1">Détails de l'événement :</div>
                <div>📅 {selectedEventForRsvp.date} à {selectedEventForRsvp.time}</div>
                <div>📍 {selectedEventForRsvp.location}</div>
                <div>🎟️ Entrée : {selectedEventForRsvp.entry}</div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEventForRsvp(null)}
                  className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:bg-purple-500"
                >
                  <MessageCircle size={15} />
                  <span>Confirmer sur WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

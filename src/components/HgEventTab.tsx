import React, { useState } from "react";
import { HgEventItem, ShopInfo, EventArchivePhoto } from "../types";
import { INITIAL_HG_EVENTS } from "../data/tabData";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  MessageCircle,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  Info,
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Camera,
  ZoomIn,
  Lock,
  Check,
  Tag,
  Share2,
} from "lucide-react";

interface HgEventTabProps {
  events: HgEventItem[];
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onUpdateEvents: (events: HgEventItem[]) => void;
  onOpenLogin?: () => void;
}

export const HgEventTab: React.FC<HgEventTabProps> = ({
  events,
  shopInfo,
  isAdmin,
  onUpdateEvents,
  onOpenLogin,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lightbox for photos & flyers
  const [lightboxData, setLightboxData] = useState<{
    url: string;
    title: string;
    editionDate?: string;
    description?: string;
  } | null>(null);

  // Admin Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HgEventItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<HgEventItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Rita popup for Fashion Week Otaku when no external URL is set
  const [isRitaModalOpen, setIsRitaModalOpen] = useState(false);

  // Form fields for editing an event
  const [formTitle, setFormTitle] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formDefinition, setFormDefinition] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formHasScheduled, setFormHasScheduled] = useState(false);
  const [formNextTitle, setFormNextTitle] = useState("");
  const [formNextDate, setFormNextDate] = useState("");
  const [formNextTime, setFormNextTime] = useState("");
  const [formNextLocation, setFormNextLocation] = useState("");
  const [formNextFlyerUrl, setFormNextFlyerUrl] = useState("");
  const [formNextEntryFee, setFormNextEntryFee] = useState("");
  const [formNextDescription, setFormNextDescription] = useState("");
  const [formNextGameOrTheme, setFormNextGameOrTheme] = useState("");
  const [formNextBookingUrl, setFormNextBookingUrl] = useState("");

  // Archives management
  const [formArchives, setFormArchives] = useState<EventArchivePhoto[]>([]);
  const [newArcTitle, setNewArcTitle] = useState("");
  const [newArcUrl, setNewArcUrl] = useState("");
  const [newArcDate, setNewArcDate] = useState("");
  const [newArcDesc, setNewArcDesc] = useState("");

  // Custom link (Fashion Week Otaku)
  const [formCustomLinkLabel, setFormCustomLinkLabel] = useState("");
  const [formCustomLinkUrl, setFormCustomLinkUrl] = useState("");
  const [formCustomLinkNote, setFormCustomLinkNote] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const cleanPhone = (shopInfo.whatsapp || shopInfo.phone || "+2250700000000").replace(/[^0-9]/g, "");

  const handleOpenEdit = (event: HgEventItem) => {
    setIsCreatingNew(false);
    setEditingItem(event);
    setFormTitle(event.title);
    setFormBadge(event.badge || "");
    setFormDefinition(event.definition);
    setFormCoverImage(event.coverImage || "");
    setFormHasScheduled(Boolean(event.hasScheduledEvent));
    setFormNextTitle(event.nextEdition?.title || "");
    setFormNextDate(event.nextEdition?.date || "");
    setFormNextTime(event.nextEdition?.time || "");
    setFormNextLocation(event.nextEdition?.location || "House Game");
    setFormNextFlyerUrl(event.nextEdition?.flyerUrl || "");
    setFormNextEntryFee(event.nextEdition?.entryFee || "");
    setFormNextDescription(event.nextEdition?.description || "");
    setFormNextGameOrTheme(event.nextEdition?.gameOrTheme || "");
    setFormNextBookingUrl(event.nextEdition?.bookingUrl || "");
    setFormArchives(event.archives ? [...event.archives] : []);
    setFormCustomLinkLabel(event.customLink?.label || "");
    setFormCustomLinkUrl(event.customLink?.url || "");
    setFormCustomLinkNote(event.customLink?.note || "Lien à vérifier avec Rita avant publication");
    setIsEditModalOpen(true);
  };

  const handleOpenAdd = () => {
    setIsCreatingNew(true);
    setEditingItem(null);
    setFormTitle("");
    setFormBadge("Nouveau Concept");
    setFormDefinition("");
    setFormCoverImage("");
    setFormHasScheduled(false);
    setFormNextTitle("");
    setFormNextDate("");
    setFormNextTime("");
    setFormNextLocation("House Game");
    setFormNextFlyerUrl("");
    setFormNextEntryFee("");
    setFormNextDescription("");
    setFormNextGameOrTheme("");
    setFormNextBookingUrl("");
    setFormArchives([]);
    setFormCustomLinkLabel("");
    setFormCustomLinkUrl("");
    setFormCustomLinkNote("");
    setIsEditModalOpen(true);
  };

  const handleAddArchivePhoto = () => {
    if (!newArcUrl.trim()) {
      showToast("Veuillez saisir une URL pour la photo.");
      return;
    }
    const newPhoto: EventArchivePhoto = {
      id: `arc-${Date.now()}`,
      title: newArcTitle.trim() || "Édition précédente",
      imageUrl: newArcUrl.trim(),
      editionDate: newArcDate.trim() || "Édition passée",
      description: newArcDesc.trim(),
    };
    setFormArchives((prev) => [...prev, newPhoto]);
    setNewArcTitle("");
    setNewArcUrl("");
    setNewArcDate("");
    setNewArcDesc("");
  };

  const handleRemoveArchivePhoto = (id: string) => {
    setFormArchives((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDefinition.trim()) {
      showToast("Veuillez renseigner au moins un titre et une définition.");
      return;
    }

    const nextEditionData = formHasScheduled
      ? {
          title: formNextTitle.trim() || `Prochaine édition ${formTitle.trim()}`,
          date: formNextDate.trim(),
          time: formNextTime.trim(),
          location: formNextLocation.trim() || "Arène House Game",
          flyerUrl: formNextFlyerUrl.trim(),
          entryFee: formNextEntryFee.trim(),
          description: formNextDescription.trim(),
          gameOrTheme: formNextGameOrTheme.trim(),
          bookingOpen: true,
          bookingUrl: formNextBookingUrl.trim(),
        }
      : undefined;

    const customLinkData =
      formCustomLinkLabel.trim() || formCustomLinkUrl.trim() || formCustomLinkNote.trim()
        ? {
            label: formCustomLinkLabel.trim() || "Découvrir la Fashion Week Otaku",
            url: formCustomLinkUrl.trim(),
            note: formCustomLinkNote.trim() || "Lien à vérifier avec Rita avant publication",
          }
        : undefined;

    if (isCreatingNew) {
      const newItem: HgEventItem = {
        id: `hge-${Date.now()}`,
        title: formTitle.trim(),
        slug: formTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        badge: formBadge.trim() || "HG Event",
        coverImage: formCoverImage.trim() || "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
        definition: formDefinition.trim(),
        hasScheduledEvent: formHasScheduled,
        nextEdition: nextEditionData,
        archives: formArchives,
        customLink: customLinkData,
      };
      const updated = [...events, newItem];
      onUpdateEvents(updated);
      showToast(`Événement « ${formTitle} » ajouté avec succès !`);
    } else if (editingItem) {
      const updated = events.map((ev) => {
        if (ev.id === editingItem.id) {
          return {
            ...ev,
            title: formTitle.trim(),
            badge: formBadge.trim() || "HG Event",
            coverImage: formCoverImage.trim() || ev.coverImage,
            definition: formDefinition.trim(),
            hasScheduledEvent: formHasScheduled,
            nextEdition: nextEditionData,
            archives: formArchives,
            customLink: customLinkData,
          };
        }
        return ev;
      });
      onUpdateEvents(updated);
      showToast(`Événement « ${formTitle} » mis à jour avec succès !`);
    }

    setIsEditModalOpen(false);
  };

  const handleDeleteEvent = (event: HgEventItem) => {
    const updated = events.filter((ev) => ev.id !== event.id);
    onUpdateEvents(updated);
    setEventToDelete(null);
    showToast(`Événement « ${event.title} » supprimé.`);
  };

  const handleResetToDefaults = () => {
    onUpdateEvents(INITIAL_HG_EVENTS);
    setIsResetConfirmOpen(false);
    showToast("Les 6 concepts HG ÉVENT officiels ont été rétablis avec succès !");
  };

  const getBookingLink = (event: HgEventItem) => {
    if (event.nextEdition?.bookingUrl) {
      return event.nextEdition.bookingUrl;
    }
    const eventName = event.title;
    const editionName = event.nextEdition?.title ? ` - ${event.nextEdition.title}` : "";
    const dateStr = event.nextEdition?.date ? ` (${event.nextEdition.date})` : "";
    const msg = `Bonjour House Game ! Je souhaite réserver ma place pour l'événement : ${eventName}${editionName}${dateStr}. Merci de m'indiquer les modalités !`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const filteredEvents =
    selectedFilter === "all" ? events : events.filter((ev) => ev.id === selectedFilter);

  return (
    <div id="hg-event-page" className="space-y-10 animate-fadeIn pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          id="hgevent-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-[#0B1511] px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300 shadow-2xl animate-bounce"
        >
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-[#170B28] via-[#21113B] to-[#0E121B] p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/15 px-3.5 py-1 font-['JetBrains_Mono'] text-xs font-bold text-purple-300">
              <Sparkles size={14} className="text-purple-400" />
              <span>COMMUNAUTÉ & ÉVÉNEMENTS MAJEURS</span>
            </div>

            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold text-rose-300 animate-pulse">
                <ShieldCheck size={14} />
                <span>ESPACE PRO ACTIF</span>
              </span>
            )}
          </div>

          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            HG ÉVENT
          </h1>

          <p className="font-['Orbitron'] text-base sm:text-lg text-purple-300 font-semibold tracking-wide">
            « Les événements qui font vivre la communauté HOUSE GAME »
          </p>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Plongez au cœur de nos 6 concepts d'événements officiels : afterworks conviviaux, tournois compétitifs, quiz de culture geek, célébrations gaming africaines et festival cosplay manga.
          </p>
        </div>

        {/* Espace Pro Direct Action Bar inside Banner */}
        <div className="mt-6 pt-5 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 font-['Orbitron'] text-xs font-bold text-white transition shadow-lg shadow-purple-600/30 active:scale-95"
              >
                <Plus size={15} />
                <span>Ajouter un événement</span>
              </button>

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-2 font-['JetBrains_Mono'] text-xs text-slate-300 transition"
              >
                <RotateCcw size={14} />
                <span>Rétablir les 6 concepts d'origine</span>
              </button>
            </div>
          ) : (
            onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-3.5 py-2 font-['JetBrains_Mono'] text-xs text-purple-300 transition"
              >
                <Lock size={13} />
                <span>Espace Pro : Entrer le code pour modifier les événements HG</span>
              </button>
            )
          )}

          {isAdmin && (
            <span className="text-[11px] font-['JetBrains_Mono'] text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Modifications synchronisées en temps réel</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation / Filter Pills for the 6 Concepts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-slate-400">
            Explorer par concept :
          </span>
          <span className="text-xs font-['JetBrains_Mono'] text-purple-400">
            {events.length} concepts officiels
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`flex-shrink-0 px-4 py-2 rounded-xl border text-xs font-bold font-['Orbitron'] transition-all flex items-center gap-2 ${
              selectedFilter === "all"
                ? "border-purple-500 bg-purple-600/30 text-white shadow-lg shadow-purple-600/20"
                : "border-white/10 bg-[#0E121B] text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            <span>Tous les concepts ({events.length})</span>
          </button>

          {events.map((ev, index) => {
            const isSelected = selectedFilter === ev.id;
            return (
              <button
                key={ev.id}
                onClick={() => setSelectedFilter(ev.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl border text-xs font-bold font-['Orbitron'] transition-all flex items-center gap-2 ${
                  isSelected
                    ? "border-purple-500 bg-purple-600/30 text-white shadow-lg shadow-purple-600/20"
                    : "border-white/10 bg-[#0E121B] text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                <span className="text-purple-400/80 font-['JetBrains_Mono'] text-[11px]">
                  #{index + 1}
                </span>
                <span>{ev.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Liste des Cartes Événementielles Détaillées */}
      <div className="space-y-12">
        {filteredEvents.map((event, index) => {
          const isFashionWeek = event.slug.includes("fashion-week-otaku") || event.title.toUpperCase().includes("FASHION WEEK");
          const hasScheduled = Boolean(event.hasScheduledEvent && event.nextEdition && (event.nextEdition.date || event.nextEdition.flyerUrl || event.nextEdition.title));

          return (
            <div
              key={event.id}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0E121B] shadow-2xl transition-all duration-300 hover:border-purple-500/40"
            >
              {/* Top Banner Cover Image */}
              <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-900">
                <img
                  src={
                    event.coverImage ||
                    event.nextEdition?.flyerUrl ||
                    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={event.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-[#0E121B]/60 to-black/30" />

                {/* Top Badge & Number */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-['Orbitron'] text-xs font-bold shadow-lg">
                      CONCEPT #{index + 1}
                    </span>
                    {event.badge && (
                      <span className="px-3 py-1 rounded-full border border-white/20 bg-black/60 text-purple-300 font-['JetBrains_Mono'] text-xs font-semibold backdrop-blur-md">
                        {event.badge}
                      </span>
                    )}
                  </div>

                  {/* Admin Direct Edit Button */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(event)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-['Orbitron'] text-xs font-bold transition shadow-lg"
                      >
                        <Pencil size={13} />
                        <span>Modifier l'événement</span>
                      </button>
                      <button
                        onClick={() => setEventToDelete(event)}
                        disabled={events.length <= 1}
                        className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white transition disabled:opacity-30"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Event Name & Short Presentation inside cover banner */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-8 sm:right-8 space-y-2">
                  <h2 className="font-['Orbitron'] text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {event.title}
                  </h2>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-8 space-y-8">
                {/* Définition / Présentation */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] font-bold text-purple-400">
                    <Info size={15} />
                    <span>DÉFINITION & PRÉSENTATION DU CONCEPT</span>
                  </div>
                  <p className="font-['Chakra_Petch'] text-sm sm:text-base text-slate-200 leading-relaxed">
                    {event.definition}
                  </p>
                </div>

                {/* Deux Sections Claires : PROCHAINEMENT & ARCHIVES */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* PARTIE 1 : 📅 PROCHAINS ÉVÉNEMENTS (Col 6) */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="inline-flex items-center gap-2 font-['Orbitron'] text-base font-bold text-white">
                        <Calendar size={18} className="text-purple-400" />
                        <span>PROCHAINS ÉVÉNEMENTS</span>
                      </div>
                      {hasScheduled ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider">
                          Session Programmée
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10 text-[10px] font-['JetBrains_Mono']">
                          En attente
                        </span>
                      )}
                    </div>

                    {hasScheduled && event.nextEdition ? (
                      <div className="rounded-2xl border border-purple-500/30 bg-[#121624] overflow-hidden shadow-xl space-y-4">
                        {/* Flyer Visual if available */}
                        {event.nextEdition.flyerUrl && (
                          <div
                            onClick={() =>
                              setLightboxData({
                                url: event.nextEdition!.flyerUrl,
                                title: event.nextEdition!.title || event.title,
                                editionDate: event.nextEdition!.date,
                                description: event.nextEdition!.description,
                              })
                            }
                            className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900 cursor-pointer group"
                            title="Cliquer pour agrandir le flyer"
                          >
                            <img
                              src={event.nextEdition.flyerUrl}
                              alt={event.nextEdition.title || "Flyer"}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#121624] via-transparent to-transparent" />
                            <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/70 text-white opacity-80 group-hover:opacity-100 transition backdrop-blur-sm">
                              <ZoomIn size={16} />
                            </div>
                            <div className="absolute top-3 left-3">
                              <span className="px-2.5 py-1 rounded-lg bg-purple-600/90 text-white font-['JetBrains_Mono'] text-[11px] font-bold">
                                FLYER OFFICIEL
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="p-5 space-y-4">
                          <h3 className="font-['Orbitron'] text-lg font-bold text-white leading-snug">
                            {event.nextEdition.title}
                          </h3>

                          {event.nextEdition.description && (
                            <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {event.nextEdition.description}
                            </p>
                          )}

                          {/* Info Grid (Date, Time, Location, Price) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 font-['JetBrains_Mono'] text-xs">
                            {event.nextEdition.date && (
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300">
                                <Calendar size={15} className="text-purple-400 shrink-0" />
                                <span>{event.nextEdition.date}</span>
                              </div>
                            )}

                            {event.nextEdition.time && (
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300">
                                <Clock size={15} className="text-amber-400 shrink-0" />
                                <span>{event.nextEdition.time}</span>
                              </div>
                            )}

                            {event.nextEdition.location && (
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300">
                                <MapPin size={15} className="text-[#FF4438] shrink-0" />
                                <span>{event.nextEdition.location}</span>
                              </div>
                            )}

                            {event.nextEdition.entryFee && (
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300">
                                <Ticket size={15} className="text-emerald-400 shrink-0" />
                                <span className="font-bold text-emerald-300">
                                  {event.nextEdition.entryFee}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Game or specific theme tag if present */}
                          {event.nextEdition.gameOrTheme && (
                            <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                              <Tag size={13} />
                              <span>Jeu / Thème : {event.nextEdition.gameOrTheme}</span>
                            </div>
                          )}

                          {/* Action Button: Réserver ma place */}
                          <div className="pt-2">
                            <a
                              href={getBookingLink(event)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex w-full items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold font-['Orbitron'] text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition active:scale-98"
                            >
                              <MessageCircle size={16} />
                              <span>RÉSERVER MA PLACE</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Clean empty state required: Aucun événement programmé pour le moment */
                      <div className="rounded-2xl border border-white/10 bg-[#121624] p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                          <Calendar size={24} />
                        </div>
                        <h4 className="font-['Orbitron'] text-base font-bold text-white">
                          Aucun événement programmé pour le moment
                        </h4>
                        <p className="font-['Chakra_Petch'] text-xs text-slate-400 max-w-sm mx-auto">
                          Les dates officielles de la prochaine édition de cet événement seront annoncées très prochainement sur cette page et sur nos réseaux.
                        </p>
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            `Bonjour House Game ! J'aimerais être informé de la prochaine date pour l'événement : ${event.title}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] text-purple-400 hover:text-purple-300 border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 rounded-xl transition"
                        >
                          <MessageCircle size={13} />
                          <span>Être alerté sur WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* PARTIE 2 : 📸 ARCHIVES DES ÉDITIONS PRÉCÉDENTES (Col 6) */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="inline-flex items-center gap-2 font-['Orbitron'] text-base font-bold text-white">
                        <Camera size={18} className="text-amber-400" />
                        <span>ARCHIVES</span>
                      </div>
                      <span className="text-xs font-['JetBrains_Mono'] text-slate-400">
                        {event.archives ? event.archives.length : 0} photos souvenirs
                      </span>
                    </div>

                    {event.archives && event.archives.length > 0 ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          {event.archives.slice(0, 4).map((arc) => (
                            <div
                              key={arc.id}
                              onClick={() =>
                                setLightboxData({
                                  url: arc.imageUrl,
                                  title: arc.title,
                                  editionDate: arc.editionDate,
                                  description: arc.description,
                                })
                              }
                              className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900 aspect-video shadow-md cursor-pointer"
                              title="Cliquer pour afficher en plein écran"
                            >
                              <img
                                src={arc.imageUrl}
                                alt={arc.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />

                              <div className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition">
                                <ZoomIn size={13} />
                              </div>

                              <div className="absolute bottom-2 left-2.5 right-2.5">
                                <p className="font-['Orbitron'] text-[11px] font-bold text-white truncate">
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

                        {/* Button: Voir les archives */}
                        <button
                          onClick={() => {
                            if (event.archives && event.archives[0]) {
                              setLightboxData({
                                url: event.archives[0].imageUrl,
                                title: event.archives[0].title,
                                editionDate: event.archives[0].editionDate,
                                description: event.archives[0].description,
                              });
                            }
                          }}
                          className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-['Orbitron'] text-xs font-bold transition flex items-center justify-center gap-2"
                        >
                          <ImageIcon size={14} className="text-amber-400" />
                          <span>Voir les archives ({event.archives.length} photos)</span>
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-white/10 bg-[#121624] p-8 text-center space-y-2 text-slate-400">
                        <ImageIcon size={24} className="mx-auto text-slate-600" />
                        <p className="font-['Orbitron'] text-xs font-bold text-white">
                          Aucune photo d'archive pour le moment
                        </p>
                        <p className="text-[11px]">
                          Les photos des prochaines éditions seront publiées ici.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Section for Fashion Week Otaku */}
                {isFashionWeek && (
                  <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/20 via-purple-950/20 to-black p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] font-bold text-pink-400">
                          <Sparkles size={14} />
                          <span>PAGE OFFICIELLE DU FESTIVAL</span>
                        </div>
                        <h4 className="font-['Orbitron'] text-lg font-bold text-white">
                          Découvrez l'univers de la Fashion Week Otaku
                        </h4>
                        <p className="font-['Chakra_Petch'] text-xs text-slate-300">
                          Défilés, concours cosplay, pop culture japonaise et streetwear manga.
                        </p>
                      </div>

                      <div className="shrink-0">
                        <button
                          onClick={() => {
                            if (event.customLink?.url && event.customLink.url.trim()) {
                              window.open(event.customLink.url.trim(), "_blank", "noopener,noreferrer");
                            } else {
                              setIsRitaModalOpen(true);
                            }
                          }}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-['Orbitron'] text-xs font-bold transition shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2"
                        >
                          <span>Découvrir la Fashion Week Otaku</span>
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Internal Admin Note for Rita */}
                    {isAdmin && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5 text-xs text-amber-300 font-['JetBrains_Mono']">
                        <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                        <div>
                          <span className="font-bold">Indication interne administrateur :</span>{" "}
                          <span>
                            {event.customLink?.note ||
                              "Le lien définitif sera fourni ultérieurement et doit être vérifié avec Rita avant publication."}
                          </span>
                          <div className="mt-1 text-[11px] text-slate-300">
                            URL actuelle configurée :{" "}
                            <span className="font-bold text-white">
                              {event.customLink?.url || "Aucune (bouton interactif d'information)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL LIGHTBOX (Agrandissement Plein Écran) ================= */}
      {lightboxData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setLightboxData(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-[#0E121B] rounded-2xl border border-white/20 overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#07090E]">
              <div>
                <h4 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                  {lightboxData.title}
                </h4>
                {lightboxData.editionDate && (
                  <p className="text-xs font-['JetBrains_Mono'] text-purple-300">
                    {lightboxData.editionDate}
                  </p>
                )}
              </div>
              <button
                onClick={() => setLightboxData(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-2 min-h-[300px]">
              <img
                src={lightboxData.url}
                alt={lightboxData.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Caption */}
            {lightboxData.description && (
              <div className="p-4 border-t border-white/10 bg-[#07090E]">
                <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-slate-300">
                  {lightboxData.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL RITA (Fashion Week Otaku information) ================= */}
      {isRitaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-pink-500/40 bg-[#0E121B] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-pink-400 font-['Orbitron'] text-sm font-bold">
                <Sparkles size={16} />
                <span>FASHION WEEK OTAKU</span>
              </div>
              <button onClick={() => setIsRitaModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <h3 className="font-['Orbitron'] text-lg font-bold text-white">
              Découvrir la Fashion Week Otaku
            </h3>

            <p className="text-sm font-['Chakra_Petch'] text-slate-300 leading-relaxed">
              La page officielle dédiée à la Fashion Week Otaku est en cours de finalisation avec l'équipe de <strong>Rita</strong>. Vous pouvez nous contacter directement sur WhatsApp pour toutes informations ou propositions de partenariat !
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsRitaModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-['JetBrains_Mono'] text-slate-300 hover:bg-white/10"
              >
                Fermer
              </button>
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  "Bonjour House Game & Rita ! Je souhaite me renseigner sur la Fashion Week Otaku."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-['Orbitron'] text-xs font-bold transition flex items-center gap-2"
              >
                <MessageCircle size={14} />
                <span>Contacter sur WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL ADMIN: ÉDITER / AJOUTER ÉVÉNEMENT ================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-purple-500/40 bg-[#0E121B] p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] font-bold text-purple-400 uppercase tracking-wider">
                  <ShieldCheck size={14} />
                  <span>ESPACE PRO • GESTION HG ÉVENT</span>
                </div>
                <h3 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white mt-1">
                  {isCreatingNew ? "Ajouter un concept d'événement" : `Modifier l'événement : ${editingItem?.title}`}
                </h3>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-5">
                {/* Titre & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                      Nom de l'événement *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex: APÉRO GAMING"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Orbitron'] text-sm font-bold text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                      Badge / Tag
                    </label>
                    <input
                      type="text"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="Ex: Convivialité & Gaming"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Définition */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                    Courte définition / présentation *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formDefinition}
                    onChange={(e) => setFormDefinition(e.target.value)}
                    placeholder="Définition officielle de l'événement..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* Image de couverture du concept */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                    Image / Visuel de couverture du concept (URL)
                  </label>
                  <input
                    type="url"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* SECTION PROCHAINS ÉVÉNEMENTS */}
                <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formHasScheduled}
                        onChange={(e) => setFormHasScheduled(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-purple-600 focus:ring-0 w-4 h-4"
                      />
                      <span className="text-xs font-['Orbitron'] font-bold text-white">
                        Une prochaine édition est actuellement programmée
                      </span>
                    </label>
                    <span
                      className={`text-[10px] font-['JetBrains_Mono'] font-bold px-2.5 py-1 rounded-full ${
                        formHasScheduled
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {formHasScheduled ? "Événement programmé" : "Aucun événement programmé"}
                    </span>
                  </div>

                  {formHasScheduled ? (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                            Titre de l'édition
                          </label>
                          <input
                            type="text"
                            value={formNextTitle}
                            onChange={(e) => setFormNextTitle(e.target.value)}
                            placeholder="Ex: Apéro Gaming Night"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                            Flyer officiel (URL)
                          </label>
                          <input
                            type="url"
                            value={formNextFlyerUrl}
                            onChange={(e) => setFormNextFlyerUrl(e.target.value)}
                            placeholder="https://...flyer.jpg"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                            Date
                          </label>
                          <input
                            type="text"
                            value={formNextDate}
                            onChange={(e) => setFormNextDate(e.target.value)}
                            placeholder="Ex: Samedi 24 Octobre 2026"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                            Heure
                          </label>
                          <input
                            type="text"
                            value={formNextTime}
                            onChange={(e) => setFormNextTime(e.target.value)}
                            placeholder="Ex: 14h00 - 20h00"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                            Lieu
                          </label>
                          <input
                            type="text"
                            value={formNextLocation}
                            onChange={(e) => setFormNextLocation(e.target.value)}
                            placeholder="Ex: Arène House Game"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                            Tarif / Prix
                          </label>
                          <input
                            type="text"
                            value={formNextEntryFee}
                            onChange={(e) => setFormNextEntryFee(e.target.value)}
                            placeholder="Ex: Gratuit ou 2 000 FCFA"
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                            Jeu concerné ou Thème (Optionnel)
                          </label>
                          <input
                            type="text"
                            value={formNextGameOrTheme}
                            onChange={(e) => setFormNextGameOrTheme(e.target.value)}
                            placeholder="Ex: EA FC 25, Mario Kart..."
                            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                          Programme & Informations pratiques
                        </label>
                        <textarea
                          rows={2}
                          value={formNextDescription}
                          onChange={(e) => setFormNextDescription(e.target.value)}
                          placeholder="Déroulé de l'événement, conditions de participation..."
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                          Lien de réservation personnalisé (laisser vide pour WhatsApp par défaut)
                        </label>
                        <input
                          type="url"
                          value={formNextBookingUrl}
                          onChange={(e) => setFormNextBookingUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-purple-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-['Chakra_Petch']">
                      Le statut affichera clairement : <strong>« Aucun événement programmé pour le moment »</strong>.
                    </p>
                  )}
                </div>

                {/* SECTION ARCHIVES PHOTOS */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-['Orbitron'] font-bold text-white flex items-center gap-1.5">
                      <Camera size={15} className="text-amber-400" />
                      <span>Galerie des Archives ({formArchives.length} photos)</span>
                    </div>
                  </div>

                  {formArchives.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {formArchives.map((photo) => (
                        <div
                          key={photo.id}
                          className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white/5 border border-white/10 text-xs"
                        >
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-10 h-10 object-cover rounded-lg shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate">{photo.title}</p>
                            <p className="text-[10px] text-purple-300">{photo.editionDate || "Passée"}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveArchivePhoto(photo.id)}
                            className="p-1.5 text-rose-400 hover:text-white"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 rounded-xl border border-white/10 bg-white/5 space-y-2.5">
                    <span className="text-[11px] font-['JetBrains_Mono'] text-slate-300 font-bold">
                      + Ajouter une photo d'archive
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="url"
                        value={newArcUrl}
                        onChange={(e) => setNewArcUrl(e.target.value)}
                        placeholder="URL de l'image (https://...)"
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={newArcTitle}
                        onChange={(e) => setNewArcTitle(e.target.value)}
                        placeholder="Titre de la photo"
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newArcDate}
                        onChange={(e) => setNewArcDate(e.target.value)}
                        placeholder="Date de l'édition (ex: Août 2026)"
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={newArcDesc}
                        onChange={(e) => setNewArcDesc(e.target.value)}
                        placeholder="Courte description de l'édition"
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddArchivePhoto}
                      className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-['JetBrains_Mono'] text-white"
                    >
                      Ajouter cette photo à la galerie
                    </button>
                  </div>
                </div>

                {/* SECTION LIEN EXTERNE (FASHION WEEK OTAKU) */}
                <div className="rounded-2xl border border-pink-500/30 bg-pink-500/5 p-4 sm:p-5 space-y-3">
                  <div className="text-xs font-['Orbitron'] font-bold text-pink-300 flex items-center gap-1.5">
                    <Sparkles size={14} />
                    <span>Lien Externe & Découverte (ex: Fashion Week Otaku)</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                        Libellé du bouton
                      </label>
                      <input
                        type="text"
                        value={formCustomLinkLabel}
                        onChange={(e) => setFormCustomLinkLabel(e.target.value)}
                        placeholder="Découvrir la Fashion Week Otaku"
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                        URL définitive du lien externe (facilement modifiable)
                      </label>
                      <input
                        type="url"
                        value={formCustomLinkUrl}
                        onChange={(e) => setFormCustomLinkUrl(e.target.value)}
                        placeholder="https://... (fourni ultérieurement)"
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400 mb-1">
                        Indication interne / Note pour validation avec Rita
                      </label>
                      <input
                        type="text"
                        value={formCustomLinkNote}
                        onChange={(e) => setFormCustomLinkNote(e.target.value)}
                        placeholder="Lien à vérifier avec Rita avant publication"
                        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-amber-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-['JetBrains_Mono'] text-slate-300 hover:bg-white/10"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-['Orbitron'] text-xs font-bold transition shadow-lg shadow-purple-600/30 active:scale-95"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUPPRESSION ================= */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-[#0E121B] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 font-['Orbitron'] text-base font-bold">
              <AlertTriangle size={22} />
              <span>Supprimer cet événement</span>
            </div>
            <p className="text-sm font-['Chakra_Petch'] text-slate-300">
              Êtes-vous sûr de vouloir supprimer l'événement{" "}
              <strong className="text-white">« {eventToDelete.title} »</strong> ?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-['JetBrains_Mono'] text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteEvent(eventToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-['Orbitron'] text-xs font-bold transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RÉINITIALISATION ================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-[#0E121B] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-purple-400 font-['Orbitron'] text-base font-bold">
              <RotateCcw size={22} />
              <span>Rétablir les 6 concepts officiels</span>
            </div>
            <p className="text-sm font-['Chakra_Petch'] text-slate-300">
              Voulez-vous rétablir les 6 concepts d'événements officiels HOUSE GAME (Apéro Gaming, House Game Day, HG Challenge, Question pour Gameur, Afro-Respawn et Fashion Week Otaku) avec leurs définitions exactes ?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-['JetBrains_Mono'] text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-['Orbitron'] text-xs font-bold transition"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Trophy,
  Wrench,
  Calendar,
  Layers,
  Edit3,
  Flame,
  Radio,
  Gamepad2,
  Tv,
  Star,
  Users,
} from "lucide-react";
import {
  HomeContent,
  RepairService,
  GamingEvent,
  Tournament,
  CustomTab,
  CustomTabItem,
  HomeStat,
} from "../types";
import { compressImage } from "../services/storage";

// ==========================================
// 1. HOME CONTENT MODAL
// ==========================================

interface HomeContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeContent: HomeContent;
  onSave: (content: HomeContent) => void;
}

export const HomeContentModal: React.FC<HomeContentModalProps> = ({
  isOpen,
  onClose,
  homeContent,
  onSave,
}) => {
  const [heroTitle, setHeroTitle] = useState(homeContent.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(homeContent.heroSubtitle);
  const [presentationText, setPresentationText] = useState(homeContent.presentationText);
  const [bannerImage, setBannerImage] = useState(homeContent.bannerImage);
  const [stats, setStats] = useState<HomeStat[]>(homeContent.stats || []);

  useEffect(() => {
    if (isOpen) {
      setHeroTitle(homeContent.heroTitle);
      setHeroSubtitle(homeContent.heroSubtitle);
      setPresentationText(homeContent.presentationText);
      setBannerImage(homeContent.bannerImage);
      setStats(homeContent.stats || []);
    }
  }, [isOpen, homeContent]);

  if (!isOpen) return null;

  const handleStatChange = (index: number, field: keyof HomeStat, value: string) => {
    setStats((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleAddStat = () => {
    setStats((prev) => [...prev, { label: "NOUVEAU", value: "100+", desc: "Description rapide" }]);
  };

  const handleRemoveStat = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...homeContent,
      heroTitle,
      heroSubtitle,
      presentationText,
      bannerImage,
      stats,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/40 bg-[#12151E] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-amber-400" />
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              MODIFIER LA PAGE D'ACCUEIL & PRÉSENTATION
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#7C8798] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-['JetBrains_Mono'] text-xs">
          <div>
            <label className="block text-[#A0AEC0] mb-1">Titre Principal Hero :</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Sous-titre / Accroche :</label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Image de Bannière (URL) :</label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Texte de Présentation Société :</label>
            <textarea
              value={presentationText}
              onChange={(e) => setPresentationText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          {/* Stats Editor */}
          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-white font-bold">Chiffres Clés / Statistiques :</label>
              <button
                type="button"
                onClick={handleAddStat}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold"
              >
                <Plus size={12} />
                <span>Ajouter un chiffre</span>
              </button>
            </div>

            <div className="space-y-2">
              {stats.map((st, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-white/5 bg-[#141824] p-2">
                  <input
                    type="text"
                    value={st.value}
                    onChange={(e) => handleStatChange(i, "value", e.target.value)}
                    placeholder="1 250+"
                    className="w-24 rounded border border-white/10 bg-black/40 px-2 py-1 text-amber-300 font-bold"
                  />
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => handleStatChange(i, "label", e.target.value)}
                    placeholder="CONSOLES LIVRÉES"
                    className="flex-1 rounded border border-white/10 bg-black/40 px-2 py-1 text-white font-bold"
                  />
                  <input
                    type="text"
                    value={st.desc}
                    onChange={(e) => handleStatChange(i, "desc", e.target.value)}
                    placeholder="Description"
                    className="flex-1 rounded border border-white/10 bg-black/40 px-2 py-1 text-[#A0AEC0]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(i)}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-5 py-2.5 font-bold text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:bg-amber-400"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. REPAIR SERVICE MODAL
// ==========================================

interface RepairServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Partial<RepairService>) => void;
  editingService: RepairService | null;
}

export const RepairServiceModal: React.FC<RepairServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingService,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Micro-Soudure & Écran");
  const [price, setPrice] = useState("25 000 FCFA");
  const [delay, setDelay] = useState("24h - 48h");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("Populaire");
  const [icon, setIcon] = useState("Tv");
  const [featuresText, setFeaturesText] = useState("");

  useEffect(() => {
    if (editingService) {
      setTitle(editingService.title);
      setCategory(editingService.category);
      setPrice(editingService.price);
      setDelay(editingService.delay);
      setDescription(editingService.description);
      setBadge(editingService.badge || "");
      setIcon(editingService.icon || "Wrench");
      setFeaturesText(editingService.features ? editingService.features.join("\n") : "");
    } else {
      setTitle("");
      setCategory("Micro-Soudure & Écran");
      setPrice("25 000 FCFA");
      setDelay("24h - 48h");
      setDescription("");
      setBadge("");
      setIcon("Wrench");
      setFeaturesText("Garantie 3 mois\nPièces officielles\nDiagnostic inclus");
    }
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    onSave({
      title,
      category,
      price,
      delay,
      description,
      badge,
      icon,
      features,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/40 bg-[#12151E] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-amber-400" />
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              {editingService ? "MODIFIER LE SERVICE DE RÉPARATION" : "AJOUTER UN SERVICE DE RÉPARATION"}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#7C8798] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-['JetBrains_Mono'] text-xs">
          <div>
            <label className="block text-[#A0AEC0] mb-1">Nom du service / Panne réparée * :</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Remplacement Port HDMI 4K (PS5)"
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0AEC0] mb-1">Catégorie :</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Manettes / Carte mère"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#A0AEC0] mb-1">Tarif (ou 'Sur Devis') :</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 25 000 FCFA"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0AEC0] mb-1">Délai indicatif :</label>
              <input
                type="text"
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                placeholder="Ex: 24h - 48h"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#A0AEC0] mb-1">Badge (optionnel) :</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Recommandé / Express"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Icône représentative :</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
            >
              <option value="Wrench">Clé à molette (Wrench)</option>
              <option value="Tv">Écran / Port TV (Tv)</option>
              <option value="Fan">Ventilateur / Température (Fan)</option>
              <option value="Gamepad2">Manette / Stick Drift (Gamepad2)</option>
              <option value="Smartphone">Portable / Switch (Smartphone)</option>
              <option value="Zap">Énergie / Carte Mère (Zap)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Description détaillée :</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Expliquez ce qui est inclus dans cette réparation..."
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Points clés / Avantages (un par ligne) :</label>
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={3}
              placeholder="Garantie 3 mois&#10;Pièces d'origine&#10;Test 4K inclus"
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-amber-500 px-5 py-2 font-bold text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:bg-amber-400"
            >
              {editingService ? "Mettre à jour" : "Créer le service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. GAMING EVENT MODAL
// ==========================================

interface GamingEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<GamingEvent>) => void;
  editingEvent: GamingEvent | null;
}

export const GamingEventModal: React.FC<GamingEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingEvent,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("Salle Gaming House Game - Brazzaville");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [entry, setEntry] = useState("Gratuit");
  const [status, setStatus] = useState("Inscriptions ouvertes");
  const [badge, setBadge] = useState("");
  const [highlightsText, setHighlightsText] = useState("");

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDate(editingEvent.date);
      setTime(editingEvent.time);
      setLocation(editingEvent.location);
      setDescription(editingEvent.description);
      setImage(editingEvent.image);
      setEntry(editingEvent.entry);
      setStatus(editingEvent.status);
      setBadge(editingEvent.badge || "");
      setHighlightsText(editingEvent.highlights ? editingEvent.highlights.join("\n") : "");
    } else {
      setTitle("");
      setDate("Samedi 15 Octobre 2026");
      setTime("15h00 - 20h00");
      setLocation("Salle Gaming House Game - Brazzaville");
      setDescription("");
      setImage("https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80");
      setEntry("Gratuit (Sur inscription)");
      setStatus("Inscriptions ouvertes");
      setBadge("Événement Spécial");
      setHighlightsText("Tournoi Blitz\nGoodies offerts\nBornes en libre accès");
    }
  }, [editingEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const highlights = highlightsText
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);

    onSave({
      title,
      date,
      time,
      location,
      description,
      image,
      entry,
      status,
      badge,
      highlights,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-purple-500/40 bg-[#12151E] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-purple-400" />
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              {editingEvent ? "MODIFIER L'ÉVÉNEMENT" : "CRÉER UN NOUVEL ÉVÉNEMENT"}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#7C8798] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-['JetBrains_Mono'] text-xs">
          <div>
            <label className="block text-[#A0AEC0] mb-1">Titre de l'événement * :</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Soirée Lancement EA SPORTS FC & Tournoi"
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0AEC0] mb-1">Date :</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Ex: Samedi 20 Septembre 2026"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#A0AEC0] mb-1">Horaires :</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Ex: 14h00 - 19h00"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0AEC0] mb-1">Tarif / Entrée :</label>
              <input
                type="text"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Ex: Gratuit / 2 500 FCFA"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#A0AEC0] mb-1">Statut :</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="Inscriptions ouvertes">Inscriptions ouvertes</option>
                <option value="À venir">À venir</option>
                <option value="Complet">Complet</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Lieu :</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Image (URL) :</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Description :</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Points forts (un par ligne) :</label>
            <textarea
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-5 py-2 font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:bg-purple-500"
            >
              {editingEvent ? "Mettre à jour" : "Publier l'événement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. TOURNAMENT MODAL
// ==========================================

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tournamentData: Partial<Tournament>) => void;
  editingTournament: Tournament | null;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTournament,
}) => {
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("EA SPORTS FC 27");
  const [cashPrize, setCashPrize] = useState("300 000 FCFA");
  const [entryFee, setEntryFee] = useState("5 000 FCFA / Joueur");
  const [date, setDate] = useState("Samedi 19 Septembre 2026");
  const [time, setTime] = useState("10h00");
  const [location, setLocation] = useState("Arène Esport House Game - Brazzaville");
  const [maxSlots, setMaxSlots] = useState<number>(64);
  const [currentSlots, setCurrentSlots] = useState<number>(0);
  const [platform, setPlatform] = useState("PlayStation 5");
  const [format, setFormat] = useState("1v1 Double Élimination");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("Inscriptions ouvertes");
  const [rulesText, setRulesText] = useState("");

  useEffect(() => {
    if (editingTournament) {
      setTitle(editingTournament.title);
      setGame(editingTournament.game);
      setCashPrize(editingTournament.cashPrize);
      setEntryFee(editingTournament.entryFee);
      setDate(editingTournament.date);
      setTime(editingTournament.time);
      setLocation(editingTournament.location);
      setMaxSlots(editingTournament.maxSlots || 32);
      setCurrentSlots(editingTournament.currentSlots || 0);
      setPlatform(editingTournament.platform);
      setFormat(editingTournament.format);
      setImage(editingTournament.image);
      setStatus(editingTournament.status);
      setRulesText(editingTournament.rules ? editingTournament.rules.join("\n") : "");
    } else {
      setTitle("HOUSE GAME CHAMPIONSHIP");
      setGame("EA SPORTS FC 27");
      setCashPrize("250 000 FCFA");
      setEntryFee("5 000 FCFA");
      setDate("Samedi 26 Septembre 2026");
      setTime("10h00");
      setLocation("Arène Esport House Game");
      setMaxSlots(64);
      setCurrentSlots(0);
      setPlatform("PlayStation 5");
      setFormat("1v1 Poules + Élimination directe");
      setImage("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80");
      setStatus("Inscriptions ouvertes");
      setRulesText("6 minutes par mi-temps\nClubs uniquement\nManettes officielles");
    }
  }, [editingTournament, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rules = rulesText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    onSave({
      title,
      game,
      cashPrize,
      entryFee,
      date,
      time,
      location,
      maxSlots: Number(maxSlots) || 32,
      currentSlots: Number(currentSlots) || 0,
      platform,
      format,
      image,
      status,
      rules,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-emerald-500/40 bg-[#12151E] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-emerald-400" />
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              {editingTournament ? "MODIFIER LE TOURNOI" : "CRÉER UN TOURNOI OFFICIEL"}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#7C8798] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-['JetBrains_Mono'] text-xs">
          <div>
            <label className="block text-[#A0AEC0] mb-1">Titre du tournoi * :</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: HOUSE GAME CUP : EA SPORTS FC 27"
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0AEC0] mb-1">Jeu officiel :</label>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="EA SPORTS FC 27">EA SPORTS FC 27</option>
                <option value="Tekken 8">Tekken 8</option>
                <option value="Naruto x Boruto Storm Connections">Naruto Storm Connections</option>
                <option value="Mortal Kombat 1">Mortal Kombat 1</option>
                <option value="Street Fighter 6">Street Fighter 6</option>
                <option value="Call of Duty: Warzone">Call of Duty: Warzone</option>
                <option value="Autre jeu">Autre jeu</option>
              </select>
            </div>
            <div>
              <label className="block text-[#A0AEC0] mb-1">Montant Cash Prize * :</label>
              <input
                type="text"
                value={cashPrize}
                onChange={(e) => setCashPrize(e.target.value)}
                placeholder="Ex: 300 000 FCFA"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-amber-300 font-bold focus:border-emerald-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0AEC0] mb-1">Frais d'inscription :</label>
              <input
                type="text"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                placeholder="Ex: 5 000 FCFA"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#A0AEC0] mb-1">Statut :</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="Inscriptions ouvertes">Inscriptions ouvertes</option>
                <option value="Bientôt disponible">Bientôt disponible</option>
                <option value="Complet">Complet</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0AEC0] mb-1">Date :</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Ex: Samedi 20 Septembre 2026"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#A0AEC0] mb-1">Heure de début :</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Ex: 10h00"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0AEC0] mb-1">Places Max :</label>
              <input
                type="number"
                value={maxSlots}
                onChange={(e) => setMaxSlots(Number(e.target.value) || 32)}
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#A0AEC0] mb-1">Places Actuelles Réservées :</label>
              <input
                type="number"
                value={currentSlots}
                onChange={(e) => setCurrentSlots(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0AEC0] mb-1">Plateforme :</label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="Ex: PS5 Moniteurs 144Hz"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#A0AEC0] mb-1">Format :</label>
              <input
                type="text"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder="Ex: 1v1 Double Élimination"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Lieu :</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Image Bannière (URL) :</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Règles du tournoi (une par ligne) :</label>
            <textarea
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
              rows={3}
              placeholder="Durée mi-temps : 6 min&#10;Clubs officiels uniquement&#10;Retard = forfait"
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-500"
            >
              {editingTournament ? "Mettre à jour" : "Lancer le tournoi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. CUSTOM TAB MODAL (ADD / EDIT TAB)
// ==========================================

interface CustomTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tabData: Partial<CustomTab>) => void;
  editingTab: CustomTab | null;
}

export const CustomTabModal: React.FC<CustomTabModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTab,
}) => {
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("Sparkles");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingTab) {
      setTitle(editingTab.title);
      setIcon(editingTab.icon || "Sparkles");
      setDescription(editingTab.description || "");
    } else {
      setTitle("");
      setIcon("Sparkles");
      setDescription("");
    }
  }, [editingTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug =
      editingTab?.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-") ||
      "onglet-" + Date.now();

    onSave({
      title,
      slug,
      icon,
      description,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#3E9BFF]/40 bg-[#12151E] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#3E9BFF]" />
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              {editingTab ? "MODIFIER L'ONGLET" : "AJOUTER UN NOUVEL ONGLET"}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#7C8798] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-['JetBrains_Mono'] text-xs">
          <div>
            <label className="block text-[#A0AEC0] mb-1">Nom de l'onglet * :</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Location de Salle / Starlink Pro / Partenaires"
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-[#3E9BFF] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Icône :</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-[#3E9BFF] focus:outline-none"
            >
              <option value="Sparkles">Étoiles / Magie (Sparkles)</option>
              <option value="Gamepad2">Manette Gaming (Gamepad2)</option>
              <option value="Radio">Antenne / Réseau (Radio)</option>
              <option value="Flame">Flamme / Tendance (Flame)</option>
              <option value="Tv">Écran / Studio (Tv)</option>
              <option value="Star">Étoile d'or (Star)</option>
              <option value="Users">Communauté / Membres (Users)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Description / Objectif de cette section :</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Ex: Découvrez nos services de location de salle gaming privatisée pour vos anniversaires et événements d'entreprise."
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-[#3E9BFF] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#3E9BFF] px-5 py-2.5 font-bold text-white shadow-[0_0_15px_rgba(62,155,255,0.4)] hover:bg-[#5aaaff]"
            >
              {editingTab ? "Enregistrer" : "Créer l'onglet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 6. CUSTOM TAB ITEM MODAL
// ==========================================

interface CustomTabItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<CustomTabItem>) => void;
  editingItem: CustomTabItem | null;
  tabTitle: string;
}

export const CustomTabItemModal: React.FC<CustomTabItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  tabTitle,
}) => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [priceOrTag, setPriceOrTag] = useState("");
  const [buttonText, setButtonText] = useState("Réserver sur WhatsApp");
  const [buttonWhatsAppMessage, setButtonWhatsAppMessage] = useState("");

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setSubtitle(editingItem.subtitle || "");
      setDescription(editingItem.description);
      setImage(editingItem.image || "");
      setPriceOrTag(editingItem.priceOrTag || "");
      setButtonText(editingItem.buttonText || "Réserver sur WhatsApp");
      setButtonWhatsAppMessage(editingItem.buttonWhatsAppMessage || "");
    } else {
      setTitle("");
      setSubtitle("");
      setDescription("");
      setImage("");
      setPriceOrTag("");
      setButtonText("Commander / Réserver sur WhatsApp");
      setButtonWhatsAppMessage(`Bonjour House Game, je suis intéressé par vos offres dans la section ${tabTitle}.`);
    }
  }, [editingItem, isOpen, tabTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      subtitle,
      description,
      image,
      priceOrTag,
      buttonText,
      buttonWhatsAppMessage,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#3E9BFF]/40 bg-[#12151E] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-[#3E9BFF]" />
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              {editingItem ? "MODIFIER L'ÉLÉMENT" : `AJOUTER DANS "${tabTitle.toUpperCase()}"`}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#7C8798] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-['JetBrains_Mono'] text-xs">
          <div>
            <label className="block text-[#A0AEC0] mb-1">Titre de l'élément * :</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Forfait Privatisation Salle 4h"
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#3E9BFF] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A0AEC0] mb-1">Sous-titre / Catégorie :</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Jusqu'à 15 personnes"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#3E9BFF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#A0AEC0] mb-1">Prix ou Tag :</label>
              <input
                type="text"
                value={priceOrTag}
                onChange={(e) => setPriceOrTag(e.target.value)}
                placeholder="Ex: 50 000 FCFA / Sur Devis"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#3E9BFF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Image (URL optionnelle) :</label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#3E9BFF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Description / Détails :</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Détaillez le contenu, les options incluses, etc."
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#3E9BFF] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Texte du Bouton Action :</label>
            <input
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Ex: Réserver sur WhatsApp"
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#3E9BFF] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#A0AEC0] mb-1">Message WhatsApp pré-rempli :</label>
            <textarea
              value={buttonWhatsAppMessage}
              onChange={(e) => setButtonWhatsAppMessage(e.target.value)}
              rows={2}
              placeholder="Texte envoyé lors du clic..."
              className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#3E9BFF] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#3E9BFF] px-5 py-2 font-bold text-white shadow-[0_0_15px_rgba(62,155,255,0.4)] hover:bg-[#5aaaff]"
            >
              {editingItem ? "Mettre à jour" : "Ajouter l'élément"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

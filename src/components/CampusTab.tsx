import React, { useState, useEffect } from "react";
import { ShopInfo, CampusModule, CampusInfo } from "../types";
import {
  loadCampusModules,
  saveCampusModules,
  loadCampusInfo,
  saveCampusInfo,
} from "../services/storage";
import { INITIAL_CAMPUS_MODULES, INITIAL_CAMPUS_INFO } from "../data/tabData";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Video,
  Wrench,
  Trophy,
  CheckCircle2,
  MessageCircle,
  Award,
  Laptop,
  Gamepad2,
  Code,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  RotateCcw,
  Pencil,
  ArrowUp,
  ArrowDown,
  Layers,
  Settings,
  ShieldAlert,
} from "lucide-react";

interface CampusTabProps {
  shopInfo: ShopInfo;
  isAdmin: boolean;
}

const AVAILABLE_ICONS: { [key: string]: React.ElementType } = {
  GraduationCap,
  BookOpen,
  Video,
  Wrench,
  Trophy,
  Award,
  Laptop,
  Gamepad2,
  Code,
  Sparkles,
  Layers,
};

const COLOR_STYLES: {
  [key: string]: {
    text: string;
    border: string;
    bg: string;
    accent: string;
    badge: string;
  };
} = {
  emerald: {
    text: "text-emerald-400",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    bg: "bg-emerald-500/10",
    accent: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },
  purple: {
    text: "text-purple-400",
    border: "border-purple-500/30 hover:border-purple-500/60",
    bg: "bg-purple-500/10",
    accent: "bg-purple-500",
    badge: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  },
  amber: {
    text: "text-amber-400",
    border: "border-amber-500/30 hover:border-amber-500/60",
    bg: "bg-amber-500/10",
    accent: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  cyan: {
    text: "text-cyan-400",
    border: "border-cyan-500/30 hover:border-cyan-500/60",
    bg: "bg-cyan-500/10",
    accent: "bg-cyan-500",
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  },
  rose: {
    text: "text-rose-400",
    border: "border-rose-500/30 hover:border-rose-500/60",
    bg: "bg-rose-500/10",
    accent: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  },
  blue: {
    text: "text-blue-400",
    border: "border-blue-500/30 hover:border-blue-500/60",
    bg: "bg-blue-500/10",
    accent: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  },
};

export const CampusTab: React.FC<CampusTabProps> = ({ shopInfo, isAdmin }) => {
  const [modules, setModules] = useState<CampusModule[]>(() => loadCampusModules());
  const [campusInfo, setCampusInfo] = useState<CampusInfo>(() => loadCampusInfo());

  // Editing state for module modal
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CampusModule | null>(null);

  // Editing state for info/banner modal
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Success toast notification
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Dedicated WhatsApp number for registrations (Payelle or Gaëtan, defaults to shop whatsapp)
  const contactPhone = (
    shopInfo.phonePayelle ||
    shopInfo.phoneGaetan ||
    shopInfo.whatsapp ||
    "+237 658 413 269"
  ).replace(/[^0-9]/g, "");

  // Handlers for modules
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: CampusModule) => {
    setEditingModule(mod);
    setIsModuleModalOpen(true);
  };

  const handleDeleteModule = (id: string, title: string) => {
    if (confirm(`Confirmer la suppression de la formation "${title}" ?`)) {
      const updated = modules.filter((m) => m.id !== id);
      setModules(updated);
      saveCampusModules(updated);
      showToast("Formation supprimée avec succès.");
    }
  };

  const handleMoveModule = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;
    const updated = [...modules];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setModules(updated);
    saveCampusModules(updated);
  };

  const handleSaveModule = (moduleData: CampusModule) => {
    let updated: CampusModule[];
    if (editingModule) {
      updated = modules.map((m) => (m.id === moduleData.id ? moduleData : m));
      showToast("Formation modifiée avec succès.");
    } else {
      updated = [...modules, moduleData];
      showToast("Nouvelle formation ajoutée avec succès.");
    }
    setModules(updated);
    saveCampusModules(updated);
    setIsModuleModalOpen(false);
  };

  const handleSaveInfo = (infoData: CampusInfo) => {
    setCampusInfo(infoData);
    saveCampusInfo(infoData);
    setIsInfoModalOpen(false);
    showToast("Informations Campus mises à jour.");
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        "Réinitialiser tous les modules et textes de HG Campus avec les programmes originaux ? Vos modifications personnalisées seront écrasées."
      )
    ) {
      setModules(INITIAL_CAMPUS_MODULES);
      saveCampusModules(INITIAL_CAMPUS_MODULES);
      setCampusInfo(INITIAL_CAMPUS_INFO);
      saveCampusInfo(INITIAL_CAMPUS_INFO);
      showToast("HG Campus a été réinitialisé aux valeurs d'origine.");
    }
  };

  return (
    <div id="campus-tab-view" className="space-y-10 animate-fadeIn pb-12">
      {/* Toast alert */}
      {toastMessage && (
        <div
          id="campus-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-[#0B1511] px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300 shadow-2xl animate-bounce"
        >
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div
        id="campus-hero-banner"
        className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-[#0C1E17] via-[#102920] to-[#0E121B] p-6 sm:p-10 shadow-2xl"
      >
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-1 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300">
            <GraduationCap size={15} />
            <span>{campusInfo.badge || "FORMATION & TRANSMISSION DU SAVOIR"}</span>
          </div>

          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {campusInfo.heroTitle || "HG CAMPUS • L'ACADÉMIE GAMING"}
          </h1>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-slate-300 leading-relaxed">
            {campusInfo.heroDescription ||
              "Parce que le jeu vidéo est un métier, une passion et un vecteur d'opportunités, House Game Campus transmet aux jeunes talents les compétences clés du streaming, de l'esport et de la technique."}
          </p>
        </div>

        {/* Admin Quick Action Button for Hero */}
        {isAdmin && (
          <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-emerald-500/20">
            <button
              id="btn-edit-campus-info"
              onClick={() => setIsInfoModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-2 font-['Orbitron'] text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition shadow"
            >
              <Pencil size={14} />
              <span>Modifier les textes Campus (Bannière & Partenariat)</span>
            </button>
            <button
              id="btn-reset-campus-defaults"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 font-['JetBrains_Mono'] text-xs text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <RotateCcw size={13} />
              <span>Rétablir modèles par défaut</span>
            </button>
          </div>
        )}
      </div>

      {/* Modules de Formation Header & Actions */}
      <section id="campus-modules-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-['Orbitron'] text-xl font-bold text-white flex items-center gap-2.5">
              <BookOpen size={22} className="text-emerald-400" />
              <span>PROGRAMMES DE FORMATION & MASTERCLASSES</span>
            </h2>
            <p className="mt-1 font-['Chakra_Petch'] text-xs text-slate-400">
              Des cursus pratiques et certifiants conçus par des professionnels du jeu vidéo et de l'Esport.
            </p>
          </div>

          {isAdmin && (
            <button
              id="btn-add-campus-module"
              onClick={handleOpenAddModule}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 font-['Orbitron'] text-xs font-bold text-white hover:brightness-110 shadow-lg transition shrink-0"
            >
              <Plus size={16} />
              <span>Ajouter une formation</span>
            </button>
          )}
        </div>

        {modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#0E121B] p-12 text-center">
            <GraduationCap size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="font-['Orbitron'] text-base text-slate-400">Aucune formation programmée pour le moment.</p>
            {isAdmin && (
              <button
                onClick={handleOpenAddModule}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-['Orbitron'] text-xs font-bold text-white hover:bg-emerald-500"
              >
                <Plus size={15} />
                <span>Créer le premier module</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((mod, index) => {
              const Icon = AVAILABLE_ICONS[mod.iconName || ""] || GraduationCap;
              const style = COLOR_STYLES[mod.color || "emerald"] || COLOR_STYLES.emerald;

              return (
                <div
                  key={mod.id}
                  id={`campus-module-card-${mod.id}`}
                  className={`relative rounded-2xl border bg-[#0E121B] p-6 flex flex-col justify-between transition-all space-y-4 group ${style.border}`}
                >
                  <div className="space-y-3.5">
                    {/* Header line: Level, Duration, Price */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-['JetBrains_Mono'] px-2.5 py-1 rounded-full border font-bold ${style.badge}`}>
                          {mod.level}
                        </span>
                        {mod.price && (
                          <span className="text-[10px] font-['JetBrains_Mono'] px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                            {mod.price}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-['JetBrains_Mono'] text-slate-400">
                        {mod.duration}
                      </span>
                    </div>

                    {/* Title and Icon */}
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${style.bg} ${style.border}`}>
                        <Icon size={22} className={style.text} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-['Orbitron'] text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                          {mod.title}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="font-['Chakra_Petch'] text-xs text-slate-300 leading-relaxed">
                      {mod.description}
                    </p>

                    {/* Outcomes / Points Clés */}
                    {mod.outcomes && mod.outcomes.length > 0 && (
                      <div className="space-y-1.5 pt-2.5 border-t border-white/5">
                        <p className="text-[10px] font-['JetBrains_Mono'] uppercase tracking-wider text-slate-400 font-bold">
                          Compétences développées :
                        </p>
                        {mod.outcomes.map((out, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                            <CheckCircle2 size={13} className={`${style.text} shrink-0 mt-0.5`} />
                            <span>{out}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <a
                      id={`btn-register-module-${mod.id}`}
                      href={`https://wa.me/${contactPhone}?text=${encodeURIComponent(
                        `Bonjour House Game ! Je souhaite m'inscrire ou obtenir des détails sur la formation Campus : "${mod.title}" (${mod.level}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-['Orbitron'] text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
                    >
                      <MessageCircle size={15} />
                      <span>S'inscrire via WhatsApp</span>
                    </a>

                    {/* Admin card controls */}
                    {isAdmin && (
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            title="Monter"
                            disabled={index === 0}
                            onClick={() => handleMoveModule(index, "up")}
                            className="p-1.5 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            title="Descendre"
                            disabled={index === modules.length - 1}
                            onClick={() => handleMoveModule(index, "down")}
                            className="p-1.5 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModule(mod)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#3E9BFF]/15 text-[#3E9BFF] hover:bg-[#3E9BFF]/25 font-['JetBrains_Mono'] font-bold text-[11px]"
                          >
                            <Edit2 size={12} />
                            <span>Modifier</span>
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id, mod.title)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 font-['JetBrains_Mono'] font-bold text-[11px]"
                          >
                            <Trash2 size={12} />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Box Démarche & Partenariats Écoles / Jeunesse */}
      <section
        id="campus-partnership-section"
        className="rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="space-y-2 max-w-xl">
          <h3 className="font-['Orbitron'] text-lg font-bold text-white">
            {campusInfo.partnerTitle ||
              "Vous représentez une école, une université ou une association ?"}
          </h3>
          <p className="font-['Chakra_Petch'] text-xs text-slate-300 leading-relaxed">
            {campusInfo.partnerDescription ||
              "House Game Campus propose des interventions personnalisées, des journées portes ouvertes et des ateliers de découverte des métiers du multimédia et du jeu vidéo."}
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
          <a
            id="btn-campus-partner-apply"
            href={`https://wa.me/${contactPhone}?text=${encodeURIComponent(
              "Bonjour House Game ! Je représente une structure éducative/associative et souhaite organiser un partenariat Campus."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-['Orbitron'] text-xs font-bold hover:scale-105 transition-all shadow-lg shrink-0"
          >
            {campusInfo.partnerButtonText || "Proposer un partenariat"}
          </a>
          {isAdmin && (
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="text-[11px] font-['JetBrains_Mono'] text-slate-400 hover:text-emerald-300 underline"
            >
              Éditer ce bloc partenariat
            </button>
          )}
        </div>
      </section>

      {/* --- MODAL 1: ADD / EDIT CAMPUS MODULE --- */}
      {isModuleModalOpen && (
        <CampusModuleModal
          isOpen={isModuleModalOpen}
          onClose={() => setIsModuleModalOpen(false)}
          editingModule={editingModule}
          onSave={handleSaveModule}
        />
      )}

      {/* --- MODAL 2: EDIT CAMPUS TEXTS & PARTNERSHIP --- */}
      {isInfoModalOpen && (
        <CampusInfoModal
          isOpen={isInfoModalOpen}
          onClose={() => setIsInfoModalOpen(false)}
          campusInfo={campusInfo}
          onSave={handleSaveInfo}
        />
      )}
    </div>
  );
};

// --- SUB-COMPONENT: CAMPUS MODULE MODAL ---
interface CampusModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingModule: CampusModule | null;
  onSave: (module: CampusModule) => void;
}

const CampusModuleModal: React.FC<CampusModuleModalProps> = ({
  isOpen,
  onClose,
  editingModule,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Tous niveaux");
  const [duration, setDuration] = useState("4 Sessions (12 heures)");
  const [price, setPrice] = useState("Tarif accessible");
  const [iconName, setIconName] = useState("Video");
  const [color, setColor] = useState("emerald");
  const [description, setDescription] = useState("");
  const [outcomesText, setOutcomesText] = useState("");

  useEffect(() => {
    if (editingModule) {
      setTitle(editingModule.title);
      setLevel(editingModule.level);
      setDuration(editingModule.duration);
      setPrice(editingModule.price || "");
      setIconName(editingModule.iconName || "Video");
      setColor(editingModule.color || "emerald");
      setDescription(editingModule.description);
      setOutcomesText(editingModule.outcomes ? editingModule.outcomes.join("\n") : "");
    } else {
      setTitle("");
      setLevel("Débutant à Intermédiaire");
      setDuration("4 Sessions (12 heures)");
      setPrice("Tarif accessible");
      setIconName("GraduationCap");
      setColor("emerald");
      setDescription("");
      setOutcomesText(
        "Maîtrise pratique des outils essentiels\nExercices appliqués en conditions réelles\nAttestation de fin de formation House Game"
      );
    }
  }, [editingModule]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Veuillez renseigner le titre de la formation.");
      return;
    }

    const outcomes = outcomesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const moduleData: CampusModule = {
      id: editingModule ? editingModule.id : `mod-${Date.now()}`,
      title: title.trim(),
      level: level.trim() || "Tous niveaux",
      duration: duration.trim() || "Durée flexible",
      price: price.trim(),
      iconName,
      color,
      description: description.trim(),
      outcomes,
    };

    onSave(moduleData);
  };

  return (
    <div
      id="campus-module-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#10141F] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0A0D15] px-6 py-4">
          <h3 className="font-['Orbitron'] text-base font-bold text-white flex items-center gap-2">
            <GraduationCap size={18} className="text-emerald-400" />
            <span>{editingModule ? "MODIFIER LA FORMATION" : "AJOUTER UNE NOUVELLE FORMATION"}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 max-h-[calc(92vh-130px)] space-y-4 font-['JetBrains_Mono'] text-xs">
          <div>
            <label className="mb-1 block font-bold text-slate-200">TITRE DU PROGRAMME *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Initiation au Streaming & Création de Contenu"
              className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-bold text-slate-200">NIVEAU</label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="ex: Débutant, Tous niveaux"
                className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-200">DURÉE / RYTHME</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="ex: 4 Sessions (12h)"
                className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-slate-200">TARIF / MODALITÉ</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="ex: Sur devis, Gratuit"
                className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-bold text-slate-200">ICÔNE DE LA FORMATION</label>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(AVAILABLE_ICONS).map((name) => {
                  const IconComp = AVAILABLE_ICONS[name];
                  return (
                    <button
                      type="button"
                      key={name}
                      onClick={() => setIconName(name)}
                      className={`p-2 rounded-lg border flex items-center justify-center transition ${
                        iconName === name
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-black/40 text-slate-400 hover:text-white"
                      }`}
                      title={name}
                    >
                      <IconComp size={18} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-bold text-slate-200">THÈME COULEUR ACCENT</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(COLOR_STYLES).map((col) => {
                  const cStyle = COLOR_STYLES[col];
                  return (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setColor(col)}
                      className={`p-2 rounded-lg border text-center font-bold capitalize text-[11px] transition ${
                        color === col
                          ? `${cStyle.badge} font-bold ring-2 ring-emerald-500/50`
                          : "border-white/10 bg-black/40 text-slate-400 hover:text-white"
                      }`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-200">DESCRIPTION DU PROGRAMME</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez les thématiques abordées, la méthode pédagogique..."
              className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-200">
              POINTS CLÉS / COMPÉTENCES ACQUISES (1 par ligne)
            </label>
            <textarea
              rows={4}
              value={outcomesText}
              onChange={(e) => setOutcomesText(e.target.value)}
              placeholder="ex:
Configuration complète de la régie
Gestion audio & mixage
Diction & interaction chat"
              className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-['Orbitron'] shadow-lg"
            >
              Enregistrer la formation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: CAMPUS INFO & PARTNERSHIP MODAL ---
interface CampusInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  campusInfo: CampusInfo;
  onSave: (info: CampusInfo) => void;
}

const CampusInfoModal: React.FC<CampusInfoModalProps> = ({
  isOpen,
  onClose,
  campusInfo,
  onSave,
}) => {
  const [formData, setFormData] = useState<CampusInfo>({ ...campusInfo });

  useEffect(() => {
    setFormData({ ...campusInfo });
  }, [campusInfo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      id="campus-info-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#10141F] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#0A0D15] px-6 py-4">
          <h3 className="font-['Orbitron'] text-base font-bold text-white flex items-center gap-2">
            <Settings size={18} className="text-emerald-400" />
            <span>MODIFIER LES TEXTES DE HG CAMPUS</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 max-h-[calc(90vh-130px)] space-y-4 font-['JetBrains_Mono'] text-xs">
          <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-3">
            <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 font-['Orbitron']">
              <GraduationCap size={15} />
              <span>Bannière Principale</span>
            </h4>

            <div>
              <label className="mb-1 block font-bold text-slate-300">BADGE SUPÉRIEUR</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="FORMATION & TRANSMISSION DU SAVOIR"
                className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-slate-300">TITRE DE L'ACADÉMIE</label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                placeholder="HG CAMPUS • L'ACADÉMIE GAMING"
                className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-slate-300">DESCRIPTION DE L'ACADÉMIE</label>
              <textarea
                rows={3}
                value={formData.heroDescription}
                onChange={(e) => setFormData({ ...formData, heroDescription: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg border border-white/10 bg-white/5 space-y-3">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 font-['Orbitron']">
              <BookOpen size={15} className="text-teal-400" />
              <span>Section Partenariats Écoles & Jeunesse</span>
            </h4>

            <div>
              <label className="mb-1 block font-bold text-slate-300">TITRE PARTENARIAT</label>
              <input
                type="text"
                value={formData.partnerTitle}
                onChange={(e) => setFormData({ ...formData, partnerTitle: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-slate-300">DESCRIPTION DU PARTENARIAT</label>
              <textarea
                rows={3}
                value={formData.partnerDescription}
                onChange={(e) => setFormData({ ...formData, partnerDescription: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-slate-300">LIBELLÉ DU BOUTON</label>
              <input
                type="text"
                value={formData.partnerButtonText}
                onChange={(e) => setFormData({ ...formData, partnerButtonText: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[#07090E] p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-['Orbitron'] shadow-lg"
            >
              Enregistrer les textes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { HomeContent, ShopInfo, NavTabId, ActivityItem, ActivitiesBannerInfo } from "../types";
import { INITIAL_ACTIVITIES, DEFAULT_ACTIVITIES_BANNER } from "../data/tabData";
import {
  Gamepad2,
  Glasses,
  Joystick,
  Music,
  Tv,
  Wifi,
  Zap,
  Trophy,
  Wrench,
  Cpu,
  Building2,
  Calendar,
  Package,
  Gamepad,
  Truck,
  Briefcase,
  GraduationCap,
  Activity,
  CheckCircle2,
  Tag,
  Phone,
  MessageCircle,
  ArrowRight,
  Layers,
  Sparkles,
  Users,
  Lock,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Check,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  AlertTriangle,
  Image,
} from "lucide-react";
import { sfx } from "../services/soundEffects";

interface ActivitiesTabProps {
  homeContent: HomeContent;
  shopInfo: ShopInfo;
  isAdmin: boolean;
  activities?: ActivityItem[];
  onUpdateActivities?: (activities: ActivityItem[]) => void;
  activitiesBanner?: ActivitiesBannerInfo;
  onUpdateActivitiesBanner?: (banner: ActivitiesBannerInfo) => void;
  onOpenLogin?: () => void;
  onNavigateTab: (tabId: NavTabId) => void;
}

const AVAILABLE_ICONS: { [key: string]: React.ComponentType<{ size?: number; className?: string }> } = {
  Gamepad2,
  Glasses,
  Joystick,
  Music,
  Tv,
  Wifi,
  Zap,
  Trophy,
  Wrench,
  Cpu,
  Building2,
  Calendar,
  Package,
  Gamepad,
  Truck,
  Briefcase,
  GraduationCap,
  Sparkles,
  Activity,
};

const CATEGORIES = [
  "Toutes",
  "Gaming & Immersion",
  "Connexion & Forfaits",
  "Esport & Événements",
  "Maintenance & Atelier",
  "Location & Matériel",
  "Espaces Professionnels",
];

const ACCENT_OPTIONS: { id: ActivityItem["accentColor"]; label: string; colorClass: string }[] = [
  { id: "amber", label: "Ambre Doré", colorClass: "bg-amber-500" },
  { id: "emerald", label: "Émeraude", colorClass: "bg-emerald-500" },
  { id: "blue", label: "Bleu Néon", colorClass: "bg-[#3E9BFF]" },
  { id: "purple", label: "Violet Cyber", colorClass: "bg-purple-500" },
  { id: "rose", label: "Rose Néon", colorClass: "bg-rose-500" },
  { id: "cyan", label: "Cyan Glace", colorClass: "bg-cyan-500" },
];

export const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  homeContent,
  shopInfo,
  isAdmin,
  activities: controlledActivities,
  onUpdateActivities,
  activitiesBanner: controlledBanner,
  onUpdateActivitiesBanner,
  onOpenLogin,
  onNavigateTab,
}) => {
  // If controlled prop is passed, use it; otherwise fallback to local initial state
  const [localActivities, setLocalActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const activities = controlledActivities && controlledActivities.length > 0 ? controlledActivities : localActivities;

  const [localBanner, setLocalBanner] = useState<ActivitiesBannerInfo>(DEFAULT_ACTIVITIES_BANNER);
  const banner = controlledBanner && controlledBanner.title ? controlledBanner : localBanner;

  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [activityToDelete, setActivityToDelete] = useState<ActivityItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Banner edit modal state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState<boolean>(false);
  const [bannerBadgeInput, setBannerBadgeInput] = useState(banner.badge || "");
  const [bannerTitleInput, setBannerTitleInput] = useState(banner.title || "");
  const [bannerDescInput, setBannerDescInput] = useState(banner.description || "");
  const [bannerLocationInput, setBannerLocationInput] = useState(banner.locationTag || "");
  const [bannerCountLabelInput, setBannerCountLabelInput] = useState(banner.countLabel || "");
  const [bannerImageUrlInput, setBannerImageUrlInput] = useState(banner.imageUrl || "");

  // Form fields for activity
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Gaming & Immersion");
  const [formBadge, setFormBadge] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formHasPrice, setFormHasPrice] = useState(false);
  const [formPriceLabel, setFormPriceLabel] = useState("");
  const [formPriceAmount, setFormPriceAmount] = useState("");
  const [formComplementaryServices, setFormComplementaryServices] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState("");
  const [formIconName, setFormIconName] = useState("Gamepad2");
  const [formAccentColor, setFormAccentColor] = useState<ActivityItem["accentColor"]>("blue");
  const [formTargetTab, setFormTargetTab] = useState<string>("none");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateList = (updated: ActivityItem[]) => {
    const reindexed = updated.map((item, idx) => ({
      ...item,
      orderNumber: idx + 1,
      numberStr: String(idx + 1).padStart(2, "0"),
    }));

    if (onUpdateActivities) {
      onUpdateActivities(reindexed);
    } else {
      setLocalActivities(reindexed);
    }
  };

  // Banner edit functions
  const openBannerModal = () => {
    setBannerBadgeInput(banner.badge || "SERVICES & EXPÉRIENCES OFFICIELLES");
    setBannerTitleInput(banner.title || "NOS ACTIVITÉS");
    setBannerDescInput(banner.description || "");
    setBannerLocationInput(banner.locationTag || "Abidjan, Côte d'Ivoire");
    setBannerCountLabelInput(banner.countLabel || "Activités disponibles");
    setBannerImageUrlInput(banner.imageUrl || "");
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitleInput.trim()) {
      showToast("Veuillez saisir au moins un titre pour la bannière.");
      return;
    }

    const updatedBanner: ActivitiesBannerInfo = {
      badge: bannerBadgeInput.trim() || "SERVICES & EXPÉRIENCES OFFICIELLES",
      title: bannerTitleInput.trim() || "NOS ACTIVITÉS",
      description: bannerDescInput.trim(),
      locationTag: bannerLocationInput.trim() || "Abidjan, Côte d'Ivoire",
      countLabel: bannerCountLabelInput.trim() || "Activités disponibles",
      imageUrl: bannerImageUrlInput.trim(),
    };

    if (onUpdateActivitiesBanner) {
      onUpdateActivitiesBanner(updatedBanner);
    } else {
      setLocalBanner(updatedBanner);
    }

    setIsBannerModalOpen(false);
    showToast("Bannière de l'onglet « Nos Activités » mise à jour avec succès !");
  };

  const handleResetBannerToDefaults = () => {
    if (onUpdateActivitiesBanner) {
      onUpdateActivitiesBanner(DEFAULT_ACTIVITIES_BANNER);
    } else {
      setLocalBanner(DEFAULT_ACTIVITIES_BANNER);
    }
    showToast("La bannière d'origine a été rétablie avec succès !");
  };

  // Activity actions
  const openCreateModal = () => {
    setIsCreatingNew(true);
    setEditingActivity(null);
    setFormTitle("");
    setFormCategory("Gaming & Immersion");
    setFormBadge("Nouveau");
    setFormDescription("");
    setFormHasPrice(false);
    setFormPriceLabel("");
    setFormPriceAmount("");
    setFormComplementaryServices([]);
    setNewServiceInput("");
    setFormIconName("Gamepad2");
    setFormAccentColor("amber");
    setFormTargetTab("none");
    setIsFormModalOpen(true);
  };

  const openEditModal = (act: ActivityItem) => {
    setIsCreatingNew(false);
    setEditingActivity(act);
    setFormTitle(act.title);
    setFormCategory(act.category);
    setFormBadge(act.badge);
    setFormDescription(act.description);
    if (act.price) {
      setFormHasPrice(true);
      setFormPriceLabel(act.price.label);
      setFormPriceAmount(act.price.amount);
    } else {
      setFormHasPrice(false);
      setFormPriceLabel("");
      setFormPriceAmount("");
    }
    setFormComplementaryServices(act.complementaryServices ? [...act.complementaryServices] : []);
    setNewServiceInput("");
    setFormIconName(act.iconName || "Gamepad2");
    setFormAccentColor(act.accentColor || "blue");
    setFormTargetTab(act.targetTab || "none");
    setIsFormModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      showToast("Veuillez renseigner au moins un titre et une description.");
      return;
    }

    const priceObj =
      formHasPrice && formPriceAmount.trim()
        ? {
            label: formPriceLabel.trim() || "Tarif",
            amount: formPriceAmount.trim(),
          }
        : undefined;

    const targetTabVal = formTargetTab !== "none" ? (formTargetTab as NavTabId) : undefined;

    if (isCreatingNew) {
      const newId = "act-" + Date.now();
      const newItem: ActivityItem = {
        id: newId,
        orderNumber: activities.length + 1,
        numberStr: String(activities.length + 1).padStart(2, "0"),
        title: formTitle.trim(),
        category: formCategory.trim(),
        badge: formBadge.trim() || "House Game",
        description: formDescription.trim(),
        price: priceObj,
        complementaryServices:
          formComplementaryServices.length > 0 ? formComplementaryServices : undefined,
        iconName: formIconName,
        accentColor: formAccentColor,
        targetTab: targetTabVal,
      };

      const updated = [...activities, newItem];
      updateList(updated);
      showToast("Nouvelle activité ajoutée et synchronisée !");
    } else if (editingActivity) {
      const updated = activities.map((item) => {
        if (item.id === editingActivity.id) {
          return {
            ...item,
            title: formTitle.trim(),
            category: formCategory.trim(),
            badge: formBadge.trim() || "House Game",
            description: formDescription.trim(),
            price: priceObj,
            complementaryServices:
              formComplementaryServices.length > 0 ? formComplementaryServices : undefined,
            iconName: formIconName,
            accentColor: formAccentColor,
            targetTab: targetTabVal,
          };
        }
        return item;
      });

      updateList(updated);
      showToast(`Activité « ${formTitle} » mise à jour avec succès !`);
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteActivity = (act: ActivityItem) => {
    const updated = activities.filter((item) => item.id !== act.id);
    updateList(updated);
    setActivityToDelete(null);
    showToast(`Activité « ${act.title} » supprimée.`);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const copy = [...activities];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    updateList(copy);
  };

  const handleMoveDown = (index: number) => {
    if (index >= activities.length - 1) return;
    const copy = [...activities];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    updateList(copy);
  };

  const handleResetToDefaults = () => {
    updateList(INITIAL_ACTIVITIES);
    setIsResetConfirmOpen(false);
    showToast("Les 17 activités d'origine ont été rétablies avec succès !");
  };

  const handleAddComplementaryService = () => {
    if (!newServiceInput.trim()) return;
    setFormComplementaryServices((prev) => [...prev, newServiceInput.trim()]);
    setNewServiceInput("");
  };

  const handleRemoveComplementaryService = (idx: number) => {
    setFormComplementaryServices((prev) => prev.filter((_, i) => i !== idx));
  };

  const filteredActivities =
    selectedCategory === "Toutes"
      ? activities
      : activities.filter((act) => act.category === selectedCategory);

  const cleanPhone = (shopInfo.whatsapp || shopInfo.phone || "+2250700000000").replace(/[^0-9]/g, "");

  const getWhatsAppLink = (activityTitle: string, priceInfo?: string) => {
    let msg = `Bonjour House Game ! Je souhaite avoir des informations et réserver pour l'activité : "${activityTitle}".`;
    if (priceInfo) {
      msg += ` (${priceInfo})`;
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const getAccentStyles = (accent: ActivityItem["accentColor"]) => {
    switch (accent) {
      case "amber":
        return {
          badge: "bg-amber-500/10 text-amber-300 border-amber-500/30",
          iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950",
          borderHover: "hover:border-amber-500/50",
          number: "text-amber-400/40 group-hover:text-amber-400",
        };
      case "emerald":
        return {
          badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
          iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950",
          borderHover: "hover:border-emerald-500/50",
          number: "text-emerald-400/40 group-hover:text-emerald-400",
        };
      case "purple":
        return {
          badge: "bg-purple-500/10 text-purple-300 border-purple-500/30",
          iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20 group-hover:bg-purple-500 group-hover:text-slate-950",
          borderHover: "hover:border-purple-500/50",
          number: "text-purple-400/40 group-hover:text-purple-400",
        };
      case "rose":
        return {
          badge: "bg-rose-500/10 text-rose-300 border-rose-500/30",
          iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500 group-hover:text-slate-950",
          borderHover: "hover:border-rose-500/50",
          number: "text-rose-400/40 group-hover:text-rose-400",
        };
      case "cyan":
        return {
          badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
          iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-slate-950",
          borderHover: "hover:border-cyan-500/50",
          number: "text-cyan-400/40 group-hover:text-cyan-400",
        };
      case "blue":
      default:
        return {
          badge: "bg-[#3E9BFF]/10 text-[#3E9BFF] border-[#3E9BFF]/30",
          iconBg: "bg-[#3E9BFF]/10 text-[#3E9BFF] border-[#3E9BFF]/20 group-hover:bg-[#3E9BFF] group-hover:text-slate-950",
          borderHover: "hover:border-[#3E9BFF]/50",
          number: "text-[#3E9BFF]/40 group-hover:text-[#3E9BFF]",
        };
    }
  };

  return (
    <div id="activities-tab-view" className="space-y-10 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="activities-toast"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-[#0B1511] px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300 shadow-2xl animate-bounce"
        >
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#1E160C] via-[#2A1E0E] to-[#0E121B] p-6 sm:p-10 shadow-2xl">
        {/* Background Image Overlay if set */}
        {banner.imageUrl && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-20 pointer-events-none"
            style={{ backgroundImage: `url(${banner.imageUrl})` }}
          />
        )}

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3.5 py-1 font-['JetBrains_Mono'] text-xs font-bold text-amber-300">
              <Activity size={14} className="text-amber-400" />
              <span>{banner.badge || "SERVICES & EXPÉRIENCES OFFICIELLES"}</span>
            </div>

            {/* If user is logged in as Pro, show indicator */}
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold text-rose-300 animate-pulse">
                <ShieldCheck size={14} />
                <span>ESPACE PRO ACTIF</span>
              </span>
            )}
          </div>

          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {banner.title || "NOS ACTIVITÉS"}
          </h1>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
            {banner.description ||
              "Découvrez nos activités dédiées au gaming, à la réalité virtuelle, au haut débit, à la maintenance technique de vos consoles, aux animations d'événements et aux espaces professionnels et de co-working."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-['JetBrains_Mono'] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {activities.length} {banner.countLabel || "Activités disponibles"}
              </span>
            </div>
            {banner.locationTag && (
              <div className="inline-flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-['JetBrains_Mono'] text-amber-300 font-bold">
                <span>{banner.locationTag}</span>
              </div>
            )}
          </div>
        </div>

        {/* Espace Pro Action Bar inside Banner */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Bouton direct pour Modifier les textes de la bannière */}
              <button
                id="btn-edit-activities-banner"
                onClick={openBannerModal}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 border border-amber-400/50 px-4 py-2 font-['Orbitron'] text-xs font-bold text-amber-300 transition shadow-lg shadow-amber-500/10 active:scale-95"
              >
                <Pencil size={14} />
                <span>Modifier les textes de la bannière</span>
              </button>

              <button
                id="btn-add-activity"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 font-['Orbitron'] text-xs font-bold text-slate-950 transition shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Plus size={15} />
                <span>Ajouter une activité</span>
              </button>

              <button
                id="btn-reset-activities"
                onClick={() => setIsResetConfirmOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-2 font-['JetBrains_Mono'] text-xs text-slate-300 transition"
              >
                <RotateCcw size={14} />
                <span>Rétablir les 17 activités d'origine</span>
              </button>
            </div>
          ) : (
            onOpenLogin && (
              <button
                id="btn-pro-login-activities"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-2 rounded-xl border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 hover:bg-[#3E9BFF]/20 px-3.5 py-2 font-['JetBrains_Mono'] text-xs text-[#3E9BFF] transition"
              >
                <Lock size={13} />
                <span>Espace Pro : Entrer le code pour modifier les activités & la bannière</span>
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

      {/* Bloc À Propos de House Game */}
      <section className="rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-8 space-y-6">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#3E9BFF] font-bold">
            <Users size={16} />
            <span>À PROPOS DE HOUSE GAME</span>
          </div>

          <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white leading-tight">
            Un écosystème complet pour les passionnés, les familles et les entreprises
          </h2>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-slate-300 leading-relaxed">
            {homeContent.presentationText ||
              "House Game est la référence du jeu vidéo et de la culture gaming. De nos salles de jeu next-gen aux forfaits haut débit, en passant par notre atelier de réparation et nos espaces professionnels, nous mettons notre savoir-faire au service de vos loisirs et projets."}
          </p>
        </div>
      </section>

      {/* Filtres par Catégorie */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span>LISTE DES ACTIVITÉS</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-['Chakra_Petch'] mt-1">
              Consultez nos offres gaming, techniques, événementielles et professionnelles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={openCreateModal}
                className="sm:hidden inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-['Orbitron'] text-xs font-bold text-slate-950"
              >
                <Plus size={14} />
                <span>Ajouter</span>
              </button>
            )}
            <span className="text-xs font-['JetBrains_Mono'] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg w-fit">
              {filteredActivities.length} {filteredActivities.length > 1 ? "activités affichées" : "activité affichée"}
            </span>
          </div>
        </div>

        {/* Boutons de Filtre */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl font-['JetBrains_Mono'] text-xs transition-all border ${
                  isSelected
                    ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg shadow-amber-500/20"
                    : "bg-[#0E121B] text-slate-400 border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grille des Activités */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act, index) => {
            const styles = getAccentStyles(act.accentColor);
            const IconComponent = AVAILABLE_ICONS[act.iconName] || Gamepad2;

            // Micro-animation selector depending on category / icon
            const getIconAnimClass = () => {
              if (act.iconName === "Gamepad2" || act.iconName === "Gamepad" || act.category.includes("Gaming") || act.category.includes("Jeux")) {
                return "icon-wobble";
              }
              if (act.iconName === "Glasses" || act.category.includes("VR")) {
                return "icon-pulse-vr";
              }
              if (act.iconName === "Joystick" || act.category.includes("Rétro") || act.category.includes("Arcade")) {
                return "icon-retro";
              }
              if (act.iconName === "Music" || act.category.includes("Danse") || act.category.includes("Dance")) {
                return "icon-dance";
              }
              if (act.iconName === "Wifi" || act.category.includes("Internet") || act.category.includes("Connexion")) {
                return "icon-wifi";
              }
              if (act.iconName === "Trophy" || act.category.includes("Tournoi") || act.category.includes("Esport") || act.category.includes("Compétition")) {
                return "icon-trophy";
              }
              if (act.iconName === "Wrench" || act.category.includes("Réparation") || act.category.includes("Maintenance") || act.category.includes("Atelier")) {
                return "icon-wrench";
              }
              if (act.iconName === "Briefcase" || act.category.includes("Working") || act.category.includes("Coworking") || act.category.includes("Espace")) {
                return "icon-cowork";
              }
              return "group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300";
            };

            return (
              <div
                key={act.id}
                onMouseEnter={() => sfx.playHover()}
                className={`relative rounded-2xl border border-white/10 bg-[#0E121B] p-6 flex flex-col justify-between ${styles.borderHover} hover:bg-[#121624] transition-all duration-300 space-y-5 group shadow-lg hud-box hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)] animate-shimmer`}
              >
                {/* Admin Mode Bar on each card */}
                {isAdmin && (
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="inline-flex items-center gap-1 font-['JetBrains_Mono'] text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      <ShieldCheck size={12} />
                      <span>Espace Pro</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        title="Monter"
                        className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === activities.length - 1}
                        title="Descendre"
                        className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        onClick={() => openEditModal(act)}
                        title="Modifier cette activité"
                        className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setActivityToDelete(act)}
                        title="Supprimer cette activité"
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top Bar: Number + Icon + Category Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${styles.iconBg} group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]`}
                      >
                        <div className={getIconAnimClass()}>
                          <IconComponent size={22} />
                        </div>
                      </div>
                      <div>
                        <span className={`font-['Orbitron'] text-xs font-bold tracking-widest ${styles.number}`}>
                          #{act.numberStr || String(act.orderNumber).padStart(2, "0")}
                        </span>
                        <div className="text-[11px] font-['JetBrains_Mono'] text-slate-400">
                          {act.category}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold font-['JetBrains_Mono'] uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${styles.badge}`}
                    >
                      {act.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-['Orbitron'] text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {act.orderNumber}. {act.title}
                  </h3>

                  {/* Description */}
                  <p className="font-['Chakra_Petch'] text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {act.description}
                  </p>

                  {/* Highlighting Price for Offers (Items 6 & 7 or any custom item) */}
                  {act.price && (
                    <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-['JetBrains_Mono'] text-xs font-semibold">
                        <Tag size={14} />
                        <span>Tarif :</span>
                      </div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs text-slate-300 font-['Chakra_Petch'] font-medium">
                          {act.price.label}
                        </span>
                        <span className="font-['Orbitron'] font-black text-emerald-300 text-base sm:text-lg shrink-0">
                          {act.price.amount}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Complementary Services for Espace Co-Working (Item 16 or any custom item) */}
                  {act.complementaryServices && act.complementaryServices.length > 0 && (
                    <div className="rounded-xl border border-[#3E9BFF]/30 bg-[#3E9BFF]/5 p-3.5 space-y-2">
                      <div className="font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] flex items-center gap-1.5">
                        <Layers size={14} />
                        <span>Services complémentaires :</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300 font-['Chakra_Petch'] leading-relaxed">
                        {act.complementaryServices.map((service, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-[#3E9BFF] shrink-0 mt-0.5" />
                            <span>{service}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <a
                      href={getWhatsAppLink(
                        act.title,
                        act.price ? `${act.price.label} : ${act.price.amount}` : undefined
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 font-['Orbitron'] text-xs font-bold text-emerald-400 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={14} />
                      <span>Réserver / Infos</span>
                    </a>

                    {act.targetTab && (
                      <button
                        onClick={() => onNavigateTab(act.targetTab!)}
                        title="Voir la section dédiée"
                        className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-amber-500 hover:text-slate-950 font-['Orbitron'] text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Détails</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Contact Callout */}
      <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#0E121B] to-[#161B26] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-amber-400 font-['JetBrains_Mono'] text-xs font-bold">
            <Sparkles size={14} />
            <span>ACCUEIL & RÉSERVATIONS OUVERTES</span>
          </div>
          <h3 className="font-['Orbitron'] text-lg sm:text-xl font-bold text-white">
            Besoin d’un devis sur mesure ou d’une réservation immédiate ?
          </h3>
          <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-slate-400">
            Contactez notre équipe directement sur WhatsApp ou par appel téléphonique pour toute demande.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent("Bonjour House Game, je souhaite avoir des renseignements sur vos activités.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-['Orbitron'] text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <MessageCircle size={16} />
            <span>WhatsApp Direct</span>
          </a>

          <a
            href={`tel:${cleanPhone}`}
            className="py-3 px-5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-['Orbitron'] text-xs font-bold transition-all flex items-center gap-2"
          >
            <Phone size={15} />
            <span>{shopInfo.phone || "Nous appeler"}</span>
          </a>
        </div>
      </section>

      {/* ================= MODAL: MODIFIER LA BANNIÈRE ================= */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-amber-500/40 bg-[#0E121B] p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] font-bold text-amber-400 uppercase tracking-wider">
                  <ShieldCheck size={14} />
                  <span>ESPACE PRO • BANNIÈRE NOS ACTIVITÉS</span>
                </div>
                <h3 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white mt-1">
                  Modifier les informations de la bannière
                </h3>
                <p className="text-xs text-slate-400 font-['Chakra_Petch'] mt-1">
                  Personnalisez le titre, les descriptions et les badges affichés en haut de l'onglet « Nos Activités ».
                </p>
              </div>

              <form onSubmit={handleSaveBanner} className="space-y-4">
                {/* Badge supérieur */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                    Badge supérieur
                  </label>
                  <input
                    type="text"
                    value={bannerBadgeInput}
                    onChange={(e) => setBannerBadgeInput(e.target.value)}
                    placeholder="SERVICES & EXPÉRIENCES OFFICIELLES"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Titre Principal */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                    Titre principal de la bannière *
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerTitleInput}
                    onChange={(e) => setBannerTitleInput(e.target.value)}
                    placeholder="NOS ACTIVITÉS"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Orbitron'] text-sm font-bold text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                    Description / Texte de présentation
                  </label>
                  <textarea
                    rows={4}
                    value={bannerDescInput}
                    onChange={(e) => setBannerDescInput(e.target.value)}
                    placeholder="Découvrez nos activités dédiées au gaming..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Badges du bas : Ville / Localisation & Libellé Compteur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                      Badge Localisation / Ville
                    </label>
                    <input
                      type="text"
                      value={bannerLocationInput}
                      onChange={(e) => setBannerLocationInput(e.target.value)}
                      placeholder="Abidjan, Côte d'Ivoire"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                      Texte du compteur
                    </label>
                    <input
                      type="text"
                      value={bannerCountLabelInput}
                      onChange={(e) => setBannerCountLabelInput(e.target.value)}
                      placeholder="Activités disponibles"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Image de fond optionnelle */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold flex items-center gap-1.5">
                    <Image size={13} className="text-amber-400" />
                    <span>Image d'arrière-plan ou illustration (Optionnel - URL)</span>
                  </label>
                  <input
                    type="url"
                    value={bannerImageUrlInput}
                    onChange={(e) => setBannerImageUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleResetBannerToDefaults}
                    className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-['JetBrains_Mono'] text-slate-400 hover:text-white transition flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    <span>Valeurs par défaut</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBannerModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-['JetBrains_Mono'] text-slate-300 hover:bg-white/10"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-['Orbitron'] text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                      Enregistrer la bannière
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AJOUTER / ÉDITER ACTIVITÉ ================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-amber-500/40 bg-[#0E121B] p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] font-bold text-amber-400 uppercase tracking-wider">
                  <ShieldCheck size={14} />
                  <span>ESPACE PRO • GESTION ACTIVITÉ</span>
                </div>
                <h3 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white mt-1">
                  {isCreatingNew ? "Ajouter une nouvelle activité" : `Modifier l'activité : ${editingActivity?.title}`}
                </h3>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-5">
                {/* Titre */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                    Titre de l'activité *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Salle de Gaming, Espace VR..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Catégorie & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                      Catégorie
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#141926] px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-amber-400 focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c !== "Toutes").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                      Badge / Tag
                    </label>
                    <input
                      type="text"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="Ex: Console & PC, Illimité, VR..."
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                    Description détaillée *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Description attrayante de l'activité..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Tarif (Optionnel) */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formHasPrice}
                        onChange={(e) => setFormHasPrice(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-0"
                      />
                      <span className="text-xs font-['JetBrains_Mono'] font-bold text-white">
                        Afficher un tarif pour cette activité
                      </span>
                    </label>
                    {formHasPrice && (
                      <span className="text-[11px] font-['JetBrains_Mono'] text-emerald-400 font-bold">
                        Tarif activé
                      </span>
                    )}
                  </div>

                  {formHasPrice && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400">
                          Libellé du forfait
                        </label>
                        <input
                          type="text"
                          value={formPriceLabel}
                          onChange={(e) => setFormPriceLabel(e.target.value)}
                          placeholder="Ex: Forfait journalier illimité"
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[11px] font-['JetBrains_Mono'] text-slate-400">
                          Montant du tarif
                        </label>
                        <input
                          type="text"
                          value={formPriceAmount}
                          onChange={(e) => setFormPriceAmount(e.target.value)}
                          placeholder="Ex: 1 000 FCFA ou 5 000 FCFA"
                          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-emerald-300 font-bold focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Services Complémentaires */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                  <div className="text-xs font-['JetBrains_Mono'] font-bold text-white flex items-center gap-1.5">
                    <Layers size={14} className="text-[#3E9BFF]" />
                    <span>Services complémentaires (Puces optionnelles)</span>
                  </div>

                  {formComplementaryServices.length > 0 && (
                    <div className="space-y-2">
                      {formComplementaryServices.map((service, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300"
                        >
                          <span className="flex-1">{service}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveComplementaryService(idx)}
                            className="p-1 text-rose-400 hover:text-white"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newServiceInput}
                      onChange={(e) => setNewServiceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddComplementaryService();
                        }
                      }}
                      placeholder="Ajouter une prestation ou un service complémentaire..."
                      className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddComplementaryService}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-['JetBrains_Mono'] text-white"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                {/* Choix de l'Icône */}
                <div className="space-y-2">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                    Icône de l'activité
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                    {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                      const IconItem = AVAILABLE_ICONS[iconKey];
                      const isSelected = formIconName === iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => setFormIconName(iconKey)}
                          className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-md scale-105"
                              : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                          }`}
                          title={iconKey}
                        >
                          <IconItem size={20} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Choix de la Couleur d'accent */}
                <div className="space-y-2">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                    Couleur d'accentuation
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_OPTIONS.map((opt) => {
                      const isSelected = formAccentColor === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFormAccentColor(opt.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-['JetBrains_Mono'] transition ${
                            isSelected
                              ? "border-white text-white bg-white/10 font-bold"
                              : "border-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className={`w-3 h-3 rounded-full ${opt.colorClass}`} />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Onglet de redirection associé */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-['JetBrains_Mono'] text-slate-300 font-bold">
                    Lien vers un onglet du site (Optionnel)
                  </label>
                  <select
                    value={formTargetTab}
                    onChange={(e) => setFormTargetTab(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-[#141926] px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="none">Aucun lien d'onglet</option>
                    <option value="shop">Boutique & Matériel (shop)</option>
                    <option value="service">Atelier Réparation (service)</option>
                    <option value="events">Événements & Tournois (events)</option>
                    <option value="campus">HG Campus & Formations (campus)</option>
                  </select>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-['JetBrains_Mono'] text-slate-300"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-['Orbitron'] text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95"
                  >
                    {isCreatingNew ? "Créer l'activité" : "Enregistrer les modifications"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMATION SUPPRESSION ================= */}
      {activityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-[#0E121B] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 font-['Orbitron'] text-base font-bold">
              <AlertTriangle size={22} />
              <span>Confirmer la suppression</span>
            </div>

            <p className="text-sm font-['Chakra_Petch'] text-slate-300">
              Êtes-vous sûr de vouloir supprimer l'activité{" "}
              <strong className="text-white">« {activityToDelete.title} »</strong> ? Cette modification sera sauvegardée dans votre base de données.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActivityToDelete(null)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-['JetBrains_Mono'] text-slate-300 hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteActivity(activityToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-['Orbitron'] text-xs font-bold transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMATION RÉINITIALISATION ================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-[#0E121B] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 font-['Orbitron'] text-base font-bold">
              <RotateCcw size={22} />
              <span>Rétablir les 17 activités d'origine</span>
            </div>

            <p className="text-sm font-['Chakra_Petch'] text-slate-300">
              Voulez-vous rétablir l'ensemble des 17 activités officielles House Game avec leurs descriptions et tarifs officiels (1 000 FCFA/jour, 5 000 FCFA/mois, Co-Working, VR, Réparation...) ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-['JetBrains_Mono'] text-slate-300 hover:bg-white/10"
              >
                Annuler
              </button>
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-['Orbitron'] text-xs font-bold transition"
              >
                Confirmer le rétablissement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

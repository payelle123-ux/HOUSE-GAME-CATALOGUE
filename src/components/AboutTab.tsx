import React, { useState, useRef } from "react";
import {
  Users,
  MapPin,
  Clock,
  ShieldCheck,
  Gamepad2,
  Phone,
  Edit3,
  Plus,
  Trash2,
  Upload,
  X,
  Maximize2,
  Image as ImageIcon,
  User,
  Loader2,
  Camera,
  Briefcase,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { HomeContent, ShopInfo, NavTabId, VenuePhoto, TeamMember } from "../types";
import { compressImage } from "../services/storage";
import { ScrollReveal } from "./ScrollReveal";
import { sfx } from "../services/soundEffects";

interface AboutTabProps {
  homeContent: HomeContent;
  shopInfo: ShopInfo;
  isAdmin: boolean;
  venuePhotos: VenuePhoto[];
  teamMembers: TeamMember[];
  onNavigateTab: (tabId: NavTabId) => void;
  onSaveVenuePhoto: (photo: Partial<VenuePhoto> & { id?: string }) => Promise<void> | void;
  onDeleteVenuePhoto: (photoId: string) => Promise<void> | void;
  onSaveTeamMember: (member: Partial<TeamMember> & { id?: string }) => Promise<void> | void;
  onDeleteTeamMember: (memberId: string) => Promise<void> | void;
  onUpdateAboutText: (newAboutText: string) => Promise<void> | void;
}

export const AboutTab: React.FC<AboutTabProps> = ({
  homeContent,
  shopInfo,
  isAdmin,
  venuePhotos,
  teamMembers,
  onNavigateTab,
  onSaveVenuePhoto,
  onDeleteVenuePhoto,
  onSaveTeamMember,
  onDeleteTeamMember,
  onUpdateAboutText,
}) => {
  // Edit About Text Modal
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [aboutDraft, setAboutDraft] = useState(homeContent.aboutText || "");
  const [aboutSaving, setAboutSaving] = useState(false);

  // Lightbox for Venue Photo
  const [lightboxPhoto, setLightboxPhoto] = useState<VenuePhoto | null>(null);

  // Venue Photo Modal
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<VenuePhoto | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoSubtitle, setPhotoSubtitle] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<VenuePhoto | null>(null);
  const venueFileRef = useRef<HTMLInputElement>(null);

  // Team Member Modal
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberDepartment, setMemberDepartment] = useState("");
  const [memberPhotoUrl, setMemberPhotoUrl] = useState("");
  const [memberBio, setMemberBio] = useState("");
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const memberFileRef = useRef<HTMLInputElement>(null);

  // ==================== ABOUT TEXT HANDLERS ====================
  const openEditAboutModal = () => {
    setAboutDraft(homeContent.aboutText || "");
    setIsAboutModalOpen(true);
  };

  const handleSaveAboutText = async (e: React.FormEvent) => {
    e.preventDefault();
    setAboutSaving(true);
    try {
      await onUpdateAboutText(aboutDraft.trim());
      setIsAboutModalOpen(false);
    } finally {
      setAboutSaving(false);
    }
  };

  // ==================== VENUE PHOTO HANDLERS ====================
  const openAddPhotoModal = () => {
    setEditingPhoto(null);
    setPhotoTitle("");
    setPhotoSubtitle("");
    setPhotoUrl("");
    setPhotoError(null);
    setIsPhotoModalOpen(true);
  };

  const openEditPhotoModal = (photo: VenuePhoto) => {
    setEditingPhoto(photo);
    setPhotoTitle(photo.title || "");
    setPhotoSubtitle(photo.subtitle || "");
    setPhotoUrl(photo.imageUrl || "");
    setPhotoError(null);
    setIsPhotoModalOpen(true);
  };

  const handleVenueFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).");
      return;
    }
    try {
      setPhotoError(null);
      const compressed = await compressImage(file, 1200, 0.82);
      setPhotoUrl(compressed);
    } catch {
      setPhotoError("Erreur lors de l'importation de l'image.");
    } finally {
      if (venueFileRef.current) venueFileRef.current.value = "";
    }
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim()) {
      setPhotoError("Veuillez renseigner un titre pour cette photo.");
      return;
    }
    if (!photoUrl.trim()) {
      setPhotoError("Veuillez importer une photo ou coller son URL.");
      return;
    }
    setPhotoSaving(true);
    setPhotoError(null);
    try {
      await onSaveVenuePhoto({
        id: editingPhoto?.id,
        title: photoTitle.trim(),
        subtitle: photoSubtitle.trim(),
        imageUrl: photoUrl.trim(),
      });
      setIsPhotoModalOpen(false);
    } catch {
      setPhotoError("Erreur lors de l'enregistrement de la photo.");
    } finally {
      setPhotoSaving(false);
    }
  };

  // ==================== TEAM MEMBER HANDLERS ====================
  const openAddMemberModal = () => {
    setEditingMember(null);
    setMemberName("");
    setMemberRole("");
    setMemberDepartment("");
    setMemberPhotoUrl("");
    setMemberBio("");
    setMemberError(null);
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member: TeamMember) => {
    setEditingMember(member);
    setMemberName(member.name || "");
    setMemberRole(member.role || "");
    setMemberDepartment(member.department || "");
    setMemberPhotoUrl(member.photoUrl || "");
    setMemberBio(member.bio || "");
    setMemberError(null);
    setIsMemberModalOpen(true);
  };

  const handleMemberFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMemberError("Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).");
      return;
    }
    try {
      setMemberError(null);
      const compressed = await compressImage(file, 800, 0.85);
      setMemberPhotoUrl(compressed);
    } catch {
      setMemberError("Erreur lors de l'importation de la photo.");
    } finally {
      if (memberFileRef.current) memberFileRef.current.value = "";
    }
  };

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) {
      setMemberError("Veuillez saisir le nom du membre.");
      return;
    }
    if (!memberRole.trim()) {
      setMemberError("Veuillez saisir la fonction du membre.");
      return;
    }
    setMemberSaving(true);
    setMemberError(null);
    try {
      await onSaveTeamMember({
        id: editingMember?.id,
        name: memberName.trim(),
        role: memberRole.trim(),
        department: memberDepartment.trim(),
        photoUrl: memberPhotoUrl.trim(),
        bio: memberBio.trim(),
      });
      setIsMemberModalOpen(false);
    } catch {
      setMemberError("Erreur lors de l'enregistrement du membre.");
    } finally {
      setMemberSaving(false);
    }
  };

  return (
    <div id="about-tab-view" className="space-y-10 pb-16 animate-fadeIn max-w-7xl mx-auto">
      {/* ========================================================= */}
      {/* 1. PRÉSENTATION INSTITUTIONNELLE : QUI SOMMES-NOUS ?       */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F17] p-6 sm:p-10 lg:p-12 hud-box">
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/92 to-[#0E1525]/80 z-10" />
        <div className="pointer-events-none absolute inset-0 cyber-grid-pattern opacity-20 z-10" />

        <div className="relative z-20 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3E9BFF]/40 bg-[#3E9BFF]/10 px-3.5 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF]">
              <Users size={14} />
              <span>HOUSE GAME • QUI SOMMES-NOUS</span>
            </div>

            <h1 className="font-['Orbitron'] text-3xl sm:text-5xl font-black text-white leading-tight">
              QUI SOMMES-NOUS ?
            </h1>

            <p className="font-['Chakra_Petch'] text-sm sm:text-base text-[#D6DCE6] leading-relaxed whitespace-pre-line">
              {homeContent.aboutText ||
                "HOUSE GAME est une entreprise de référence basée au Cameroun, spécialisée dans la vente de consoles & accessoires certifiés, la maintenance électronique professionnelle, l'organisation de tournois e-sport majeurs et la formation aux métiers numériques. Notre ambition : offrir aux joueurs un écosystème complet fondé sur l'excellence et la passion du jeu vidéo."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-['JetBrains_Mono'] text-[#7C8798]">
              <div className="flex items-center gap-1.5 text-white">
                <MapPin size={14} className="text-[#FF4438]" />
                <span>{shopInfo.address || "Jouvence, Yaoundé - Cameroun"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <Clock size={14} className="text-cyan-400" />
                <span>{shopInfo.openingHours || "Lun - Sam : 09h00 - 21h00"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck size={14} />
                <span>Entreprise SARL Enregistrée</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onNavigateTab("shop");
                }}
                className="gaming-btn inline-flex items-center gap-2 rounded-xl bg-[#FF4438] px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white hover:bg-[#ff5f54] transition cursor-pointer"
              >
                <ShoppingBag size={14} />
                <span>Visiter la Boutique</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sfx.playClick();
                  onNavigateTab("activities");
                }}
                className="gaming-btn inline-flex items-center gap-2 rounded-xl border border-[#3E9BFF]/40 bg-[#3E9BFF]/15 px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] hover:bg-[#3E9BFF] hover:text-white transition cursor-pointer"
              >
                <span>Découvrir nos Activités</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openEditAboutModal}
              id="admin-edit-about-text-btn"
              className="gaming-btn self-start inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-500/20 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition cursor-pointer shrink-0"
            >
              <Edit3 size={14} />
              <span>Modifier la présentation</span>
            </button>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. PHOTOS DE NOTRE SALLE                                  */}
      {/* ========================================================= */}
      <section id="section-photos-salle" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Camera size={20} className="text-[#3E9BFF]" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white">
                PHOTOS DE NOTRE SALLE
              </h2>
            </div>
            <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-[#7C8798]">
              Découvrez l'ambiance de notre espace gaming & e-sport : postes PlayStation, écrans 4K, zone VIP et atelier technique.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openAddPhotoModal}
              id="admin-add-venue-photo-btn"
              className="gaming-btn inline-flex items-center gap-2 rounded-xl border border-[#3E9BFF]/50 bg-[#3E9BFF]/20 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] hover:bg-[#3E9BFF] hover:text-white transition cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Ajouter une photo</span>
            </button>
          )}
        </div>

        <ScrollReveal direction="up">
          {venuePhotos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#0E121B] p-10 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 text-[#3E9BFF]">
                <Gamepad2 size={26} />
              </div>
              <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                Galerie de notre salle prête à accueillir vos photos
              </h3>
              <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-[#7C8798] max-w-md mx-auto">
                Ajoutez ici les photos réelles de la salle HOUSE GAME pour les faire découvrir aux visiteurs.
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={openAddPhotoModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#3E9BFF] px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white hover:bg-[#3282db] transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Ajouter la première photo</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {venuePhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0E121B] flex flex-col hud-box hover:border-[#3E9BFF]/60 transition-all"
                >
                  <div
                    className="relative aspect-[16/10] w-full overflow-hidden bg-black cursor-pointer"
                    onClick={() => setLightboxPhoto(photo)}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxPhoto(photo);
                      }}
                      title="Agrandir"
                      className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-lg border border-white/20 bg-black/75 backdrop-blur-md px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-white opacity-90 group-hover:opacity-100 hover:bg-[#3E9BFF] transition cursor-pointer"
                    >
                      <Maximize2 size={11} />
                      <span>Agrandir</span>
                    </button>

                    {isAdmin && (
                      <div
                        className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => openEditPhotoModal(photo)}
                          title="Modifier cette photo"
                          className="p-1.5 rounded-lg bg-black/80 border border-white/20 text-[#3E9BFF] hover:bg-[#3E9BFF] hover:text-white transition cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoToDelete(photo)}
                          title="Supprimer cette photo"
                          className="p-1.5 rounded-lg bg-black/80 border border-white/20 text-red-400 hover:bg-red-600 hover:text-white transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-1">
                    <h3 className="font-['Orbitron'] text-sm font-bold text-white line-clamp-1">
                      {photo.title}
                    </h3>
                    {photo.subtitle && (
                      <p className="font-['Chakra_Petch'] text-xs text-[#A0AEC0] line-clamp-2">
                        {photo.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>
      </section>

      {/* ========================================================= */}
      {/* 3. PRÉSENTATION DE NOTRE ÉQUIPE (PHOTO, NOM, FONCTION)    */}
      {/* ========================================================= */}
      <section id="section-notre-equipe" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[#FF4438]" />
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white">
                NOTRE ÉQUIPE
              </h2>
            </div>
            <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-[#7C8798]">
              Rencontrez les femmes et les hommes qui animent HOUSE GAME au quotidien : direction, technique, boutique et arbitrage e-sport.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={openAddMemberModal}
                id="admin-add-team-member-btn"
                className="gaming-btn inline-flex items-center gap-2 rounded-xl border border-[#FF4438]/50 bg-[#FF4438]/20 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-[#FF4438] hover:bg-[#FF4438] hover:text-white transition cursor-pointer"
              >
                <Plus size={15} />
                <span>Ajouter un membre</span>
              </button>
            )}
            <a
              href={`https://wa.me/${(shopInfo.whatsapp || "237658413269").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour l'équipe HOUSE GAME, je souhaite vous contacter.")}`}
              target="_blank"
              rel="noreferrer"
              className="gaming-btn inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold font-['JetBrains_Mono'] text-white hover:border-[#3E9BFF] hover:text-[#3E9BFF] transition"
            >
              <Phone size={14} />
              <span>Contacter l'équipe</span>
            </a>
          </div>
        </div>

        <ScrollReveal direction="up">
          {teamMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#0E121B] p-10 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#FF4438]/30 bg-[#FF4438]/10 text-[#FF4438]">
                <Users size={26} />
              </div>
              <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                Espace de présentation de l'équipe prêt
              </h3>
              <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-[#7C8798] max-w-md mx-auto">
                Ajoutez les membres de votre équipe avec leur photo, leur nom et leur fonction.
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={openAddMemberModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF4438] px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white hover:bg-[#ff5f54] transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Ajouter le premier membre</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0E121B] flex flex-col hud-box hover:border-[#FF4438]/60 transition-all"
                >
                  {/* Photo du membre */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#141824] flex items-center justify-center">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-[#7C8798]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5">
                          <User size={30} />
                        </div>
                        <span className="font-['JetBrains_Mono'] text-[10px]">Photo à ajouter</span>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                        <button
                          type="button"
                          onClick={() => openEditMemberModal(member)}
                          title="Modifier ce membre"
                          className="p-1.5 rounded-lg bg-black/80 border border-white/20 text-[#3E9BFF] hover:bg-[#3E9BFF] hover:text-white transition cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberToDelete(member)}
                          title="Supprimer ce membre"
                          className="p-1.5 rounded-lg bg-black/80 border border-white/20 text-red-400 hover:bg-red-600 hover:text-white transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Nom & Fonction */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      {member.department && (
                        <span className="inline-block font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider text-[#3E9BFF]">
                          {member.department}
                        </span>
                      )}
                      <h3 className="font-['Orbitron'] text-base font-bold text-white">
                        {member.name}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs font-bold text-[#FF4438]">
                        <Briefcase size={12} />
                        <span>{member.role}</span>
                      </div>
                    </div>

                    {member.bio && (
                      <p className="font-['Chakra_Petch'] text-xs text-[#A0AEC0] leading-relaxed pt-2 border-t border-white/5">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollReveal>
      </section>

      {/* ========================================================= */}
      {/* MODAL : LIGHTBOX PHOTO DE LA SALLE */}
      {/* ========================================================= */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-white/20 bg-[#0B0E17] p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                  {lightboxPhoto.title}
                </h3>
                {lightboxPhoto.subtitle && (
                  <p className="font-['Chakra_Petch'] text-xs text-[#A0AEC0]">
                    {lightboxPhoto.subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center justify-center bg-black/60 rounded-xl p-2">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : MODIFIER LA PRÉSENTATION QUI SOMMES-NOUS */}
      {/* ========================================================= */}
      {isAboutModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!aboutSaving) setIsAboutModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-amber-500/40 bg-[#12151E] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-amber-400" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                  MODIFIER LA PRÉSENTATION
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAboutText} className="space-y-4 font-['JetBrains_Mono'] text-xs">
              <div>
                <label className="block text-[#A0AEC0] mb-1.5">
                  Texte de présentation « Qui sommes-nous » :
                </label>
                <textarea
                  rows={6}
                  value={aboutDraft}
                  onChange={(e) => setAboutDraft(e.target.value)}
                  placeholder="Présentez l'histoire, les valeurs et les activités de HOUSE GAME..."
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={aboutSaving}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 font-bold text-black hover:bg-amber-400 transition cursor-pointer"
                >
                  {aboutSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>Enregistrer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : AJOUTER / MODIFIER PHOTO DE LA SALLE */}
      {/* ========================================================= */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!photoSaving) setIsPhotoModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#3E9BFF]/40 bg-[#12151E] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-[#3E9BFF]" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                  {editingPhoto ? "MODIFIER LA PHOTO" : "AJOUTER UNE PHOTO DE LA SALLE"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {photoError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/15 p-3 font-['JetBrains_Mono'] text-xs text-red-200">
                {photoError}
              </div>
            )}

            <form onSubmit={handleSubmitPhoto} className="space-y-4 font-['JetBrains_Mono'] text-xs">
              <div>
                <label className="block text-[#A0AEC0] mb-1">Titre / Nom de l'espace * :</label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="Ex: Zone Principale PS5, Salon VIP..."
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-[#3E9BFF] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A0AEC0] mb-1">Description courte (optionnel) :</label>
                <input
                  type="text"
                  value={photoSubtitle}
                  onChange={(e) => setPhotoSubtitle(e.target.value)}
                  placeholder="Ex: 10 postes PS5 avec écrans 4K HDR"
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-[#3E9BFF] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[#A0AEC0]">Photo * :</label>
                <input
                  ref={venueFileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleVenueFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => venueFileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#3E9BFF]/50 bg-[#3E9BFF]/10 py-3 px-4 text-[#3E9BFF] font-bold hover:bg-[#3E9BFF]/20 transition cursor-pointer"
                >
                  <Upload size={15} />
                  <span>Importer une photo depuis votre appareil</span>
                </button>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Ou coller l'URL de la photo..."
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#3E9BFF] focus:outline-none"
                />
                {photoUrl && (
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-black/50 aspect-[16/9]">
                    <img src={photoUrl} alt="Aperçu" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={photoSaving}
                  className="flex items-center gap-2 rounded-lg bg-[#3E9BFF] px-5 py-2.5 font-bold text-white hover:bg-[#3282db] transition cursor-pointer"
                >
                  {photoSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingPhoto ? "Mettre à jour" : "Publier la photo"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL : AJOUTER / MODIFIER MEMBRE D'ÉQUIPE */}
      {/* ========================================================= */}
      {isMemberModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!memberSaving) setIsMemberModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#FF4438]/40 bg-[#12151E] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#FF4438]" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                  {editingMember ? "MODIFIER LE MEMBRE" : "AJOUTER UN MEMBRE DE L'ÉQUIPE"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {memberError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/15 p-3 font-['JetBrains_Mono'] text-xs text-red-200">
                {memberError}
              </div>
            )}

            <form onSubmit={handleSubmitMember} className="space-y-4 font-['JetBrains_Mono'] text-xs">
              <div>
                <label className="block text-[#A0AEC0] mb-1">Photo du membre :</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#141824] border border-white/15 flex items-center justify-center shrink-0 overflow-hidden">
                    {memberPhotoUrl ? (
                      <img src={memberPhotoUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={22} className="text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={memberFileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleMemberFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => memberFileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#FF4438]/50 bg-[#FF4438]/15 px-3 py-2 text-[#FF4438] font-bold hover:bg-[#FF4438]/25 transition cursor-pointer"
                    >
                      <Upload size={14} />
                      <span>Importer une photo</span>
                    </button>
                    <input
                      type="text"
                      value={memberPhotoUrl}
                      onChange={(e) => setMemberPhotoUrl(e.target.value)}
                      placeholder="Ou coller l'URL de la photo..."
                      className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#FF4438] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A0AEC0] mb-1">Nom complet * :</label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder="Ex: Gaëtan Mankolo"
                    className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-[#FF4438] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A0AEC0] mb-1">Fonction * :</label>
                  <input
                    type="text"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    placeholder="Ex: Responsable Technique"
                    className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-[#FF4438] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A0AEC0] mb-1">Pôle / Département (optionnel) :</label>
                <input
                  type="text"
                  value={memberDepartment}
                  onChange={(e) => setMemberDepartment(e.target.value)}
                  placeholder="Ex: Direction, E-Sport, Boutique, Atelier..."
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#FF4438] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#A0AEC0] mb-1">Courte présentation (optionnel) :</label>
                <textarea
                  rows={2}
                  value={memberBio}
                  onChange={(e) => setMemberBio(e.target.value)}
                  placeholder="Parcours ou spécialité..."
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-[#FF4438] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={memberSaving}
                  className="flex items-center gap-2 rounded-lg bg-[#FF4438] px-5 py-2.5 font-bold text-white hover:bg-[#ff5f54] transition cursor-pointer"
                >
                  {memberSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingMember ? "Mettre à jour" : "Ajouter"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS CONFIRMATION SUPPRESSION */}
      {/* ========================================================= */}
      {photoToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPhotoToDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-red-500/30 bg-[#12151E] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              SUPPRIMER CETTE PHOTO ?
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#A0AEC0]">
              Retirer définitivement <strong className="text-white">"{photoToDelete.title}"</strong> de la galerie de la salle ?
            </p>
            <div className="flex justify-end gap-3 font-['JetBrains_Mono'] text-xs font-bold">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = photoToDelete.id;
                  setPhotoToDelete(null);
                  await onDeleteVenuePhoto(targetId);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500 transition cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {memberToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setMemberToDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-red-500/30 bg-[#12151E] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              SUPPRIMER CE MEMBRE ?
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#A0AEC0]">
              Retirer <strong className="text-white">"{memberToDelete.name}"</strong> de la présentation de l'équipe ?
            </p>
            <div className="flex justify-end gap-3 font-['JetBrains_Mono'] text-xs font-bold">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = memberToDelete.id;
                  setMemberToDelete(null);
                  await onDeleteTeamMember(targetId);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500 transition cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

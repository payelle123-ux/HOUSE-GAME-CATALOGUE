import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Tournament,
  ShopInfo,
  EsportRegistration,
  EsportLicense,
  EsportPlayer,
  EsportMatch,
  EsportAuditLog,
  RegistrationStatus,
  LicenseStatus,
} from "../types";
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Users,
  Coins,
  Plus,
  Edit3,
  Trash2,
  Gamepad2,
  CheckCircle2,
  Flame,
  Swords,
  Info,
  ShieldCheck,
  Search,
  Filter,
  Download,
  QrCode,
  User,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Phone,
  FileSpreadsheet,
  Award,
  Crown,
  History,
  Lock,
  Camera,
  Image as ImageIcon,
  FolderOpen,
  Sliders,
  Upload,
  Share2,
  Copy,
  Bell,
  BellRing,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { EsportDigitalLicenseCard } from "./EsportDigitalLicenseCard";
import { EsportBracketViewer } from "./EsportBracketViewer";
import { HouseGameLogo } from "./HouseGameLogo";
import {
  loadEsportTournaments,
  saveEsportTournaments,
  loadEsportRegistrations,
  saveEsportRegistrations,
  saveRegistrationCloud,
  deleteRegistrationCloud,
  subscribeToEsportRegistrations,
  broadcastEsportEvent,
  loadEsportLicenses,
  saveEsportLicenses,
  saveLicenseCloud,
  deleteLicenseCloud,
  subscribeToEsportLicenses,
  loadEsportMatches,
  saveEsportMatches,
  saveMatchCloud,
  subscribeToEsportMatches,
  loadEsportPlayers,
  saveEsportPlayers,
  loadEsportLogs,
  saveEsportLogs,
  clearAllEsportStorage,
  INITIAL_ESPORT_PLAYERS,
  generatePlayerId,
  generateLicenseNumber,
  generateSvgQrDataUri,
  verifyEsportLicense,
  generateTournamentMatches,
  exportToCsv,
  maskPhoneNumber,
  EsportBannerConfig,
  loadEsportBannerConfig,
  saveEsportBannerConfig,
  compressLogoPreservingAlpha,
  DEFAULT_ESPORT_BANNER_CONFIG,
  getTournamentShareUrl,
} from "../services/esportService";
import { sfx } from "../services/soundEffects";
import { compressImage } from "../services/storage";

interface EsportTabProps {
  tournaments: Tournament[];
  shopInfo: ShopInfo;
  isAdmin: boolean;
  targetTournamentId?: string | null;
  onClearTargetTournament?: () => void;
  initialSubView?: EsportSubView;
  onSubViewChange?: (view: EsportSubView) => void;
  onOpenAddTournament: () => void;
  onEditTournament: (tournament: Tournament) => void;
  onDeleteTournament: (tournament: Tournament) => void;
  registrations?: EsportRegistration[];
  onUpdateRegistrations?: (regs: EsportRegistration[]) => void;
}

type EsportSubView = "tournaments" | "licenses" | "brackets" | "rankings" | "player-space" | "admin-dash";

export const EsportTab: React.FC<EsportTabProps> = ({
  tournaments: parentTournaments,
  shopInfo,
  isAdmin,
  targetTournamentId,
  onClearTargetTournament,
  initialSubView,
  onSubViewChange,
  onOpenAddTournament,
  onEditTournament,
  onDeleteTournament,
  registrations: propRegistrations,
  onUpdateRegistrations,
}) => {
  // Navigation inside Esport Tab
  const [subView, setSubView] = useState<EsportSubView>("tournaments");

  // Local state for esports module
  const [tournamentsList, setTournamentsList] = useState<Tournament[]>(() => {
    const loaded = loadEsportTournaments();
    const clean = loaded.filter((t) => !["tourn-1", "tourn-2", "tourn-3", "tourn-4"].includes(t.id));
    return clean;
  });
  const [registrations, setRegistrations] = useState<EsportRegistration[]>(() => {
    if (propRegistrations && propRegistrations.length > 0) return propRegistrations;
    return loadEsportRegistrations();
  });

  // Keep registrations synced if updated from parent
  useEffect(() => {
    if (propRegistrations) {
      setRegistrations(propRegistrations);
    }
  }, [propRegistrations]);
  const [licenses, setLicenses] = useState<EsportLicense[]>(() => {
    return loadEsportLicenses();
  });
  const [matches, setMatches] = useState<EsportMatch[]>(() => {
    return loadEsportMatches();
  });
  const [players, setPlayers] = useState<EsportPlayer[]>(() => {
    return loadEsportPlayers();
  });
  const [logs, setLogs] = useState<EsportAuditLog[]>(() => {
    return loadEsportLogs();
  });

  // Set initial subView if provided
  useEffect(() => {
    if (initialSubView) {
      setSubView(initialSubView);
    }
  }, [initialSubView]);

  // Real-time Firestore Subscriptions & Instant Cross-Tab Sync
  useEffect(() => {
    const unsubRegs = subscribeToEsportRegistrations(
      (liveRegs) => {
        setRegistrations(liveRegs);
        saveEsportRegistrations(liveRegs);
        onUpdateRegistrations?.(liveRegs);
      },
      (err) => console.warn("Registrations sync:", err)
    );

    const unsubLics = subscribeToEsportLicenses(
      (liveLics) => {
        setLicenses(liveLics);
        saveEsportLicenses(liveLics);
      },
      (err) => console.warn("Licenses sync:", err)
    );

    const unsubMatches = subscribeToEsportMatches(
      (liveMatches) => {
        setMatches(liveMatches);
        saveEsportMatches(liveMatches);
      },
      (err) => console.warn("Matches sync:", err)
    );

    // Cross-tab and window event listener for instantaneous local sync
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        bc = new BroadcastChannel("hg_esport_channel_v3");
        bc.onmessage = (event) => {
          const type = event.data?.type;
          if (type === "new-registration" || type === "update-registrations" || type === "update-registration") {
            const reloaded = loadEsportRegistrations();
            setRegistrations(reloaded);
            onUpdateRegistrations?.(reloaded);
          }
          if (type === "new-license" || type === "update-license" || type === "delete-license" || type === "update-licenses") {
            setLicenses(loadEsportLicenses());
          }
        };
      }
    } catch {
      // ignore
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "hg_esport_registrations_v3") {
        const reloaded = loadEsportRegistrations();
        setRegistrations(reloaded);
        onUpdateRegistrations?.(reloaded);
      }
      if (e.key === "hg_esport_licenses_v3") {
        setLicenses(loadEsportLicenses());
      }
    };

    const handleCustomReg = (e?: Event) => {
      const detail = (e as CustomEvent)?.detail;
      const type = detail?.type;
      if (!type || type === "new-registration" || type === "update-registrations" || type === "update-registration") {
        const reloaded = loadEsportRegistrations();
        setRegistrations(reloaded);
        onUpdateRegistrations?.(reloaded);
      }
      if (!type || type === "new-license" || type === "update-license" || type === "delete-license" || type === "update-licenses") {
        setLicenses(loadEsportLicenses());
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("hg:new-registration", handleCustomReg);
    window.addEventListener("hg:esport-event", handleCustomReg);

    return () => {
      unsubRegs();
      unsubLics();
      unsubMatches();
      if (bc) {
        try { bc.close(); } catch { /* ignore */ }
      }
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("hg:new-registration", handleCustomReg);
      window.removeEventListener("hg:esport-event", handleCustomReg);
    };
  }, [onUpdateRegistrations]);

  // Sync when parent tournaments change
  useEffect(() => {
    if (parentTournaments) {
      const cleanParent = parentTournaments.filter(
        (t) => !["tourn-1", "tourn-2", "tourn-3", "tourn-4"].includes(t.id)
      );
      setTournamentsList(cleanParent);
      saveEsportTournaments(cleanParent);
    }
  }, [parentTournaments]);

  // Filters for Tournaments
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [formatFilter, setFormatFilter] = useState("Tous");

  // Selected tournament for brackets
  const [selectedBracketTournamentId, setSelectedBracketTournamentId] = useState<string>(
    tournamentsList[0]?.id || ""
  );

  // Registration Modal State
  const [registeringTournament, setRegisteringTournament] = useState<Tournament | null>(null);
  const [regFullName, setRegFullName] = useState("");
  const [regGamerTag, setRegGamerTag] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPlatform, setRegPlatform] = useState("PlayStation 5");
  const [regPhotoUrl, setRegPhotoUrl] = useState("");
  const [regAcceptedTerms, setRegAcceptedTerms] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);
  // Admin registrations management filter & Notification permissions
  const [adminRegFilter, setAdminRegFilter] = useState<"all" | "en attente" | "validée" | "refusée">("all");
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default";
  });

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Les notifications de bureau ne sont pas supportées sur cet appareil.");
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setNotificationPermission(res);
      if (res === "granted") {
        sfx.playSuccess();
        showToast("Notifications activées ! Vous serez alerté en direct à chaque inscription.");
        new Notification("🔔 HOUSE GAME ESPORT", {
          body: "Alertes d'inscriptions aux tournois activées avec succès !",
          icon: "/favicon.ico",
        });
      } else {
        showToast("Notifications refusées dans votre navigateur.");
      }
    } catch (e) {
      console.warn("Notification permission error:", e);
    }
  };

  // Rules Modal State
  const [viewingRulesTournament, setViewingRulesTournament] = useState<Tournament | null>(null);

  // Share Tournament Modal State
  const [sharingTournament, setSharingTournament] = useState<Tournament | null>(null);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  // Target / Highlighted Tournament for deep-linking
  const [highlightedTournamentId, setHighlightedTournamentId] = useState<string | null>(() => {
    if (targetTournamentId) return targetTournamentId;
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get("tournament") || (window.location.hash.match(/tournament[=-]([a-zA-Z0-9_-]+)/)?.[1] || null);
    } catch {
      return null;
    }
  });

  // When targetTournamentId changes or deep link is accessed, activate tournaments subView and scroll into view
  useEffect(() => {
    const tid = targetTournamentId || (() => {
      try {
        const p = new URLSearchParams(window.location.search);
        return p.get("tournament") || (window.location.hash.match(/tournament[=-]([a-zA-Z0-9_-]+)/)?.[1] || null);
      } catch {
        return null;
      }
    })();

    if (tid) {
      setSubView("tournaments");
      setHighlightedTournamentId(tid);
      const timer = setTimeout(() => {
        const el = document.getElementById(`tournament-${tid}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [targetTournamentId]);

  const handleOpenShareModal = (t: Tournament) => {
    sfx.playClick();
    setSharingTournament(t);
    setCopiedShareUrl(false);
  };

  const handleCopyTournamentLink = (t: Tournament) => {
    const url = getTournamentShareUrl(t.id);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedShareUrl(true);
      sfx.playSuccess();
      showToast("Lien du tournoi copié ! Partagez-le avec votre communauté.");
      setTimeout(() => setCopiedShareUrl(false), 3000);
    }).catch(() => {
      showToast("Lien généré : " + url);
    });
  };

  const handleNativeShare = async (t: Tournament) => {
    const url = getTournamentShareUrl(t.id);
    const title = `${t.title} - HOUSE GAME ESPORT`;
    const text = `Rejoins le tournoi ${t.title} sur HOUSE GAME ESPORT ! Cash prize : ${t.cashPrize}. Inscriptions ouvertes dès maintenant !`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        showToast("Lien partagé avec succès !");
      } catch {
        handleCopyTournamentLink(t);
      }
    } else {
      handleCopyTournamentLink(t);
    }
  };

  // License Deletion Confirmation State
  const [licenseToDelete, setLicenseToDelete] = useState<EsportLicense | null>(null);

  // License Public Verification
  const [verificationQuery, setVerificationQuery] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    searched: boolean;
    found: boolean;
    license?: EsportLicense;
    message: string;
    isStatusActive: boolean;
  } | null>(null);

  // Player Space Lookup State
  const [playerLookupTag, setPlayerLookupTag] = useState("");
  const [loggedPlayer, setLoggedPlayer] = useState<EsportPlayer | null>(null);

  // Toast message
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ==================== BANNER & LOGO CUSTOMIZATION ====================
  const [bannerConfig, setBannerConfig] = useState<EsportBannerConfig>(() => loadEsportBannerConfig());
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerBgInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);

  // Banner Modal temporary form state
  const [modalLogo, setModalLogo] = useState("");
  const [modalBg, setModalBg] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalSubtitle, setModalSubtitle] = useState("");
  const [modalBadge, setModalBadge] = useState("");
  const [modalDesc, setModalDesc] = useState("");

  const openBannerCustomizer = () => {
    sfx.playClick();
    setModalLogo(bannerConfig.logoUrl || "");
    setModalBg(bannerConfig.bgImageUrl || "");
    setModalTitle(bannerConfig.title || DEFAULT_ESPORT_BANNER_CONFIG.title || "");
    setModalSubtitle(bannerConfig.subtitle || DEFAULT_ESPORT_BANNER_CONFIG.subtitle || "");
    setModalBadge(bannerConfig.badgeText || DEFAULT_ESPORT_BANNER_CONFIG.badgeText || "");
    setModalDesc(bannerConfig.description || DEFAULT_ESPORT_BANNER_CONFIG.description || "");
    setIsBannerModalOpen(true);
  };

  const handleQuickLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const dataUri = await compressLogoPreservingAlpha(file, 800);
      const updated: EsportBannerConfig = { ...bannerConfig, logoUrl: dataUri };
      setBannerConfig(updated);
      saveEsportBannerConfig(updated);
      showToast("Logo HOUSE GAME ESPORT enregistré avec succès !");
    } catch (err) {
      console.error("Logo upload error:", err);
      showToast("Erreur lors de l'importation du logo.");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleQuickBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBg(true);
    try {
      const dataUri = await compressImage(file, 1600, 0.82);
      const updated: EsportBannerConfig = { ...bannerConfig, bgImageUrl: dataUri };
      setBannerConfig(updated);
      saveEsportBannerConfig(updated);
      showToast("Image de fond de bannière mise à jour !");
    } catch (err) {
      console.error("Banner bg upload error:", err);
      showToast("Erreur lors de l'importation du fond de bannière.");
    } finally {
      setIsUploadingBg(false);
      if (bannerBgInputRef.current) bannerBgInputRef.current.value = "";
    }
  };

  const handleSaveBannerModal = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: EsportBannerConfig = {
      logoUrl: modalLogo,
      bgImageUrl: modalBg,
      title: modalTitle,
      subtitle: modalSubtitle,
      badgeText: modalBadge,
      description: modalDesc,
    };
    setBannerConfig(updated);
    saveEsportBannerConfig(updated);
    setIsBannerModalOpen(false);
    showToast("Bannière et logo enregistrés avec succès !");
  };

  const handleResetBanner = () => {
    const defaultConf = { ...DEFAULT_ESPORT_BANNER_CONFIG };
    setBannerConfig(defaultConf);
    saveEsportBannerConfig(defaultConf);
    setModalLogo("");
    setModalBg("");
    setModalTitle(defaultConf.title || "");
    setModalSubtitle(defaultConf.subtitle || "");
    setModalBadge(defaultConf.badgeText || "");
    setModalDesc(defaultConf.description || "");
    showToast("Bannière et logo réinitialisés.");
  };

  // ==================== FILTERED DATA ====================

  const filteredTournaments = useMemo(() => {
    return tournamentsList.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGame = gameFilter === "Tous" || t.game.toLowerCase().includes(gameFilter.toLowerCase());
      const matchStatus = statusFilter === "Tous" || t.status === statusFilter;
      const matchFormat = formatFilter === "Tous" || t.format.includes(formatFilter);
      return matchSearch && matchGame && matchStatus && matchFormat;
    });
  }, [tournamentsList, searchQuery, gameFilter, statusFilter, formatFilter]);

  const uniqueGames = useMemo(() => {
    const games = new Set<string>();
    tournamentsList.forEach((t) => games.add(t.game));
    return ["Tous", ...Array.from(games)];
  }, [tournamentsList]);

  const totalCashPrizeFormatted = useMemo(() => {
    let total = 0;
    tournamentsList.forEach((t) => {
      const num = parseInt((t.cashPrize || "").replace(/\D/g, ""), 10);
      if (!isNaN(num)) total += num;
    });
    return total > 0 ? `${total.toLocaleString("fr-FR")} FCFA` : "0 FCFA";
  }, [tournamentsList]);

  // ==================== ACTIONS ====================

  const handleOpenRegister = (t: Tournament) => {
    sfx.playClick();
    setRegisteringTournament(t);
    setRegError(null);
    setRegSuccessMessage(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 0.8);
      setRegPhotoUrl(compressed);
      showToast("Photo de profil prête !");
    } catch {
      showToast("Erreur lors de la compression de la photo.");
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringTournament) return;
    setRegError(null);

    const tag = regGamerTag.trim();
    const name = regFullName.trim();
    const phone = regPhone.trim();

    if (!tag || !name || !phone) {
      setRegError("Veuillez renseigner votre nom, pseudo gaming et numéro de téléphone.");
      return;
    }

    if (!regAcceptedTerms) {
      setRegError("Veuillez accepter le règlement et les conditions de participation.");
      return;
    }

    // Check duplicate in same tournament
    const isDuplicate = registrations.some(
      (r) =>
        r.tournamentId === registeringTournament.id &&
        (r.gamerTag.toLowerCase() === tag.toLowerCase() || r.phone === phone) &&
        r.status !== "annulée" &&
        r.status !== "refusée"
    );

    if (isDuplicate) {
      setRegError(
        `Une inscription existe déjà pour « ${tag} » (${phone}) sur ce tournoi.`
      );
      return;
    }

    // Check capacity
    const currentSlots = registeringTournament.currentSlots || 0;
    const maxSlots = registeringTournament.maxSlots || 32;
    const isWaitlist = currentSlots >= maxSlots;
    const initialStatus: RegistrationStatus = isWaitlist ? "liste d'attente" : "en attente";

    const newRegId = `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPlayerId = generatePlayerId();

    const newReg: EsportRegistration = {
      id: newRegId,
      tournamentId: registeringTournament.id,
      tournamentTitle: registeringTournament.title,
      playerId: newPlayerId,
      fullName: name,
      gamerTag: tag,
      phone: phone,
      email: regEmail.trim() || undefined,
      photoUrl: regPhotoUrl || undefined,
      platform: regPlatform,
      game: registeringTournament.game,
      status: initialStatus,
      paymentConfirmed: false,
      registeredAt: Date.now(),
    };

    const updatedRegs = [newReg, ...registrations];
    setRegistrations(updatedRegs);
    saveEsportRegistrations(updatedRegs);
    onUpdateRegistrations?.(updatedRegs);

    // Immediate Firestore cloud sync
    saveRegistrationCloud(newReg).catch((err) => {
      console.warn("Firestore saveRegistrationCloud notice:", err);
    });

    // Cross-tab broadcast & event for instantaneous sync across all windows
    broadcastEsportEvent("new-registration", newReg);

    // Play triumphant registration audio notification
    sfx.playRegistrationAlert();

    // Native browser push notification if permission granted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("🎮 Nouvelle Inscription E-Sport !", {
          body: `${newReg.gamerTag} (${newReg.fullName}) s'est inscrit au tournoi « ${registeringTournament.title} »`,
          icon: "/favicon.ico",
        });
      } catch (e) {
        console.warn("Notification error:", e);
      }
    }

    // Audit log
    const newLog: EsportAuditLog = {
      id: `log-${Date.now()}`,
      action: "Nouvelle inscription reçue",
      actor: tag,
      targetId: newRegId,
      targetType: "inscription",
      details: `Inscription de ${tag} (${name}) pour le tournoi « ${registeringTournament.title} ». Statut : ${initialStatus}.`,
      timestamp: Date.now(),
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveEsportLogs(updatedLogs);

    sfx.playSuccess();
    setRegSuccessMessage(
      isWaitlist
        ? `Tournoi complet ! Vous avez été placé sur la LISTE D'ATTENTE officielle sous le N° ${newRegId}.`
        : `Inscription officielle enregistrée avec succès sous le N° ${newRegId} ! Statut : EN ATTENTE DE VALIDATION.`
    );

    // Reset form after short delay
    setTimeout(() => {
      setRegisteringTournament(null);
      setRegFullName("");
      setRegGamerTag("");
      setRegPhone("");
      setRegEmail("");
      setRegPhotoUrl("");
      setRegAcceptedTerms(false);
      setRegSuccessMessage(null);
    }, 3000);
  };

  // Admin Validate Registration (Emits License Automatically)
  const handleValidateRegistration = (reg: EsportRegistration) => {
    sfx.playClick();
    let validatedReg: EsportRegistration | null = null;
    const updatedRegs = registrations.map((r) => {
      if (r.id === reg.id) {
        const v: EsportRegistration = {
          ...r,
          status: "validée" as RegistrationStatus,
          paymentConfirmed: true,
          validatedAt: Date.now(),
        };
        validatedReg = v;
        return v;
      }
      return r;
    });

    if (validatedReg) {
      saveRegistrationCloud(validatedReg);
      broadcastEsportEvent("update-registration", validatedReg);
    }

    // Check if player already has an existing license
    let existingLic = licenses.find(
      (l) => l.playerId === reg.playerId || l.gamerTag.toLowerCase() === reg.gamerTag.toLowerCase()
    );

    if (!existingLic) {
      const newLicenseId = generateLicenseNumber();
      const issuedStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
      const expiresStr = new Date(Date.now() + 86400000 * 365).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

      const newLic: EsportLicense = {
        id: newLicenseId,
        playerId: reg.playerId,
        gamerTag: reg.gamerTag,
        fullName: reg.fullName,
        phoneMasked: maskPhoneNumber(reg.phone),
        photoUrl: reg.photoUrl,
        qrCodeData: `https://house-game-sarl.vercel.app/?tab=esport&license=${newLicenseId}`,
        issuedAt: issuedStr,
        expiresAt: expiresStr,
        status: "Active",
        rankLevel: "Challenger",
        gameSpecialties: [reg.game],
        totalPoints: 100,
      };

      const updatedLics = [newLic, ...licenses];
      setLicenses(updatedLics);
      saveEsportLicenses(updatedLics);
      saveLicenseCloud(newLic);
      broadcastEsportEvent("new-license", newLic);
      existingLic = newLic;
    } else {
      if (!existingLic.gameSpecialties.includes(reg.game)) {
        existingLic = {
          ...existingLic,
          gameSpecialties: [...existingLic.gameSpecialties, reg.game],
        };
        const updatedLics = licenses.map((l) => (l.id === existingLic!.id ? existingLic! : l));
        setLicenses(updatedLics);
        saveEsportLicenses(updatedLics);
        saveLicenseCloud(existingLic);
        broadcastEsportEvent("update-license", existingLic);
      }
    }

    setRegistrations(updatedRegs);
    saveEsportRegistrations(updatedRegs);
    onUpdateRegistrations?.(updatedRegs);
    broadcastEsportEvent("update-registrations", updatedRegs);

    // Update slots in tournament
    const updatedTournList = tournamentsList.map((t) => {
      if (t.id === reg.tournamentId) {
        return {
          ...t,
          currentSlots: Math.min(t.maxSlots || 32, (t.currentSlots || 0) + 1),
        };
      }
      return t;
    });
    setTournamentsList(updatedTournList);
    saveEsportTournaments(updatedTournList);

    // Update or create player profile
    setPlayers((prev) => {
      const match = prev.find((p) => p.gamerTag.toLowerCase() === reg.gamerTag.toLowerCase() || p.id === reg.playerId);
      let updated: EsportPlayer[];
      if (match) {
        updated = prev.map((p) => (p.id === match.id ? { ...p, licenseId: existingLic?.id || p.licenseId } : p));
      } else {
        const newPlayer: EsportPlayer = {
          id: reg.playerId,
          gamerTag: reg.gamerTag,
          fullName: reg.fullName,
          phone: reg.phone,
          email: reg.email,
          photoUrl: reg.photoUrl,
          platform: reg.platform,
          favoriteGame: reg.game,
          rankTitle: "Challenger",
          points: 100,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          trophies: 0,
          licenseId: existingLic?.id || "",
          createdAt: Date.now(),
        };
        updated = [newPlayer, ...prev];
      }
      saveEsportPlayers(updated);
      return updated;
    });

    // Log action
    const newLog: EsportAuditLog = {
      id: `log-${Date.now()}`,
      action: "Validation d'inscription & Émission de licence",
      actor: "Direction Esport HG",
      targetId: reg.id,
      targetType: "inscription",
      details: `Inscription ${reg.id} pour ${reg.gamerTag} validée. Licence ${existingLic?.id} activée.`,
      timestamp: Date.now(),
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveEsportLogs(updatedLogs);

    showToast(`Inscription validée ! Licence ${existingLic?.id} active pour ${reg.gamerTag}.`);
  };

  const handleRejectRegistration = (regId: string) => {
    sfx.playClick();
    const updated = registrations.map((r) => {
      if (r.id === regId) {
        const rejected: EsportRegistration = { ...r, status: "refusée" as RegistrationStatus };
        saveRegistrationCloud(rejected);
        return rejected;
      }
      return r;
    });
    setRegistrations(updated);
    saveEsportRegistrations(updated);
    onUpdateRegistrations?.(updated);
    broadcastEsportEvent("update-registrations", updated);
    showToast("Inscription refusée.");
  };

  const handleDeleteRegistration = async (regId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette inscription ?")) return;
    sfx.playClick();
    const updated = registrations.filter((r) => r.id !== regId);
    setRegistrations(updated);
    saveEsportRegistrations(updated);
    onUpdateRegistrations?.(updated);
    broadcastEsportEvent("update-registrations", updated);
    await deleteRegistrationCloud(regId);
    showToast("Inscription supprimée de la gestion E-Sport.");
  };

  // Clear All Esport Data
  const handleClearAllEsportData = () => {
    if (
      !window.confirm(
        "Voulez-vous supprimer tous les tournois, inscriptions, licences, matchs et scores ? Tout le module E-Sport sera réinitialisé à vide."
      )
    ) {
      return;
    }
    sfx.playClick();
    setTournamentsList([]);
    saveEsportTournaments([]);
    setRegistrations([]);
    saveEsportRegistrations([]);
    setLicenses([]);
    saveEsportLicenses([]);
    setMatches([]);
    saveEsportMatches([]);
    setPlayers([]);
    saveEsportPlayers([]);
    setLogs([]);
    saveEsportLogs([]);
    clearAllEsportStorage();
    showToast("Toute la section e-sport a été vidée avec succès !");
  };

  // Toggle License Status
  const handleToggleLicenseStatus = (licenseId: string, currentStatus: LicenseStatus) => {
    const nextStatus: LicenseStatus = currentStatus === "Active" ? "Suspendue" : "Active";
    const updated = licenses.map((l) => (l.id === licenseId ? { ...l, status: nextStatus } : l));
    setLicenses(updated);
    saveEsportLicenses(updated);

    const target = updated.find((l) => l.id === licenseId);
    if (target) {
      saveLicenseCloud(target);
      broadcastEsportEvent("update-license", target);
    }

    showToast(`Licence ${licenseId} désormais ${nextStatus.toUpperCase()}`);
  };

  // Delete License Handlers
  const handleRequestDeleteLicense = (lic: EsportLicense) => {
    sfx.playClick();
    setLicenseToDelete(lic);
  };

  const handleConfirmDeleteLicense = async () => {
    if (!licenseToDelete) return;
    const lic = licenseToDelete;
    sfx.playClick();

    // 1. Remove from local licenses
    const updatedLicenses = licenses.filter((l) => l.id !== lic.id);
    setLicenses(updatedLicenses);
    saveEsportLicenses(updatedLicenses);
    broadcastEsportEvent("delete-license", lic.id);

    // 2. Remove from cloud (Firestore)
    try {
      await deleteLicenseCloud(lic.id);
    } catch (err) {
      console.warn("deleteLicenseCloud error:", err);
    }

    // 3. Clear public verification query result if matching
    if (verificationResult?.license?.id === lic.id) {
      setVerificationResult(null);
    }

    // 4. Update player's reference to license
    setPlayers((prev) => {
      const updated = prev.map((p) => {
        if (p.licenseId === lic.id || p.id === lic.playerId) {
          return { ...p, licenseId: "" };
        }
        return p;
      });
      saveEsportPlayers(updated);
      return updated;
    });

    // 5. Update registrations referencing this license
    setRegistrations((prev) => {
      const updated = prev.map((r) => {
        if (r.licenseId === lic.id) {
          return { ...r, licenseId: undefined };
        }
        return r;
      });
      saveEsportRegistrations(updated);
      return updated;
    });

    // 6. Audit Log
    const newLog: EsportAuditLog = {
      id: `log-${Date.now()}`,
      action: "Suppression de carte de licence",
      actor: "Direction Esport",
      targetId: lic.id,
      targetType: "joueur",
      details: `Suppression définitive de la carte de licence ${lic.id} du joueur ${lic.gamerTag} (${lic.fullName}).`,
      timestamp: Date.now(),
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveEsportLogs(updatedLogs);

    showToast(`Carte de licence ${lic.id} supprimée définitivement !`);
    setLicenseToDelete(null);
  };

  // Bracket Generation
  const handleGenerateBracket = (tournament: Tournament) => {
    sfx.playClick();
    try {
      const { matches: newMatches, log } = generateTournamentMatches(tournament, registrations, "Staff Esport");
      const filteredOldMatches = matches.filter((m) => m.tournamentId !== tournament.id);
      const updatedMatches = [...filteredOldMatches, ...newMatches];
      setMatches(updatedMatches);
      saveEsportMatches(updatedMatches);

      newMatches.forEach((m) => saveMatchCloud(m));

      const updatedLogs = [log, ...logs];
      setLogs(updatedLogs);
      saveEsportLogs(updatedLogs);

      setSelectedBracketTournamentId(tournament.id);
      setSubView("brackets");
      showToast(`Tableau officiel généré avec succès (${newMatches.length} matchs) !`);
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la génération du tableau.");
    }
  };

  // Record Match Score & Advance Winner
  const handleRecordScore = (
    matchId: string,
    s1: number,
    s2: number,
    isProvisional: boolean,
    referee: string
  ) => {
    sfx.playSuccess();
    const targetMatch = matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const isFinished = !isProvisional && (s1 > 0 || s2 > 0) && s1 !== s2;
    let winnerId: string | undefined;
    let winnerTag: string | undefined;

    if (isFinished) {
      if (s1 > s2) {
        winnerId = targetMatch.player1Id;
        winnerTag = targetMatch.player1Tag;
      } else {
        winnerId = targetMatch.player2Id;
        winnerTag = targetMatch.player2Tag;
      }
    }

    const updatedMatches = matches.map((m) => {
      if (m.id === matchId) {
        return {
          ...m,
          player1Score: s1,
          player2Score: s2,
          isProvisional,
          status: isFinished ? ("Terminé" as const) : ("En cours" as const),
          winnerId,
          winnerTag,
          referee,
          updatedAt: Date.now(),
        };
      }
      return m;
    });

    // If winner determined and targetMatch has nextMatchId, advance winner!
    if (isFinished && winnerTag && targetMatch.nextMatchId) {
      const nextMatch = updatedMatches.find((m) => m.id === targetMatch.nextMatchId);
      if (nextMatch) {
        if (!nextMatch.player1Tag || nextMatch.player1Tag.includes("Vainqueur") || nextMatch.player1Tag.includes("attente")) {
          nextMatch.player1Tag = winnerTag;
          nextMatch.player1Id = winnerId;
        } else if (!nextMatch.player2Tag || nextMatch.player2Tag.includes("Vainqueur") || nextMatch.player2Tag.includes("attente")) {
          nextMatch.player2Tag = winnerTag;
          nextMatch.player2Id = winnerId;
        }
      }
    }

    setMatches(updatedMatches);
    saveEsportMatches(updatedMatches);

    const saved = updatedMatches.find((m) => m.id === matchId);
    if (saved) saveMatchCloud(saved);

    // Audit log
    const log: EsportAuditLog = {
      id: `log-${Date.now()}`,
      action: "Saisie et validation de score",
      actor: referee || "Arbitre HG",
      targetId: matchId,
      targetType: "match",
      details: `Score enregistré sur ${matchId} : ${targetMatch.player1Tag} (${s1}) - ${targetMatch.player2Tag} (${s2}). Vainqueur : ${winnerTag || "En cours"}.`,
      timestamp: Date.now(),
    };
    const updatedLogs = [log, ...logs];
    setLogs(updatedLogs);
    saveEsportLogs(updatedLogs);

    showToast(isFinished ? `Score validé ! Qualification de ${winnerTag}` : "Score provisoire enregistré.");
  };

  // Public License Verification Trigger
  const handleRunVerification = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sfx.playClick();
    const result = verifyEsportLicense(verificationQuery, licenses);
    setVerificationResult({
      searched: true,
      found: result.found,
      license: result.license,
      message: result.message,
      isStatusActive: result.isStatusActive,
    });
  };

  // Player Space Lookup
  const handlePlayerLoginLookup = (e: React.FormEvent) => {
    e.preventDefault();
    sfx.playClick();
    const q = playerLookupTag.trim().toLowerCase();
    if (!q) return;

    const matchedPlayer = players.find(
      (p) =>
        p.gamerTag.toLowerCase() === q ||
        p.phone.includes(q) ||
        p.licenseId.toLowerCase() === q
    );

    if (matchedPlayer) {
      setLoggedPlayer(matchedPlayer);
      showToast(`Bienvenue dans votre espace, ${matchedPlayer.gamerTag} !`);
    } else {
      // Find from registrations
      const matchedReg = registrations.find(
        (r) => r.gamerTag.toLowerCase() === q || r.phone.includes(q)
      );
      if (matchedReg) {
        const tempPlayer: EsportPlayer = {
          id: matchedReg.playerId,
          gamerTag: matchedReg.gamerTag,
          fullName: matchedReg.fullName,
          phone: matchedReg.phone,
          email: matchedReg.email,
          platform: matchedReg.platform,
          favoriteGame: matchedReg.game,
          rankTitle: "Challenger",
          points: 100,
          matchesPlayed: 1,
          wins: 0,
          losses: 0,
          trophies: 0,
          licenseId: matchedReg.licenseId || "En cours",
          createdAt: matchedReg.registeredAt,
        };
        setLoggedPlayer(tempPlayer);
        showToast(`Profil identifié : ${matchedReg.gamerTag}`);
      } else {
        showToast("Aucun joueur trouvé avec ce pseudo ou numéro.");
      }
    }
  };

  const selectedBracketTournament =
    tournamentsList.find((t) => t.id === selectedBracketTournamentId) || tournamentsList[0];

  return (
    <div id="esport-tab-root" className="space-y-8 pb-16 animate-fadeIn">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-400/50 bg-[#0E1522] px-5 py-3 text-xs font-['JetBrains_Mono'] font-bold text-emerald-300 shadow-[0_10px_35px_rgba(0,255,136,0.3)] backdrop-blur-xl animate-fadeIn">
          <Sparkles size={16} className="text-[#00FF88]" />
          <span>{toast}</span>
        </div>
      )}

      {/* HIDDEN FILE INPUTS FOR DIRECT ONE-CLICK UPLOADS */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={handleQuickLogoUpload}
      />
      <input
        ref={bannerBgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleQuickBgUpload}
      />

      {/* TOP HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#090D15] p-6 sm:p-10 shadow-2xl transition-all">
        {/* Optional Custom Background Image with Gaming Cyber Overlay */}
        {bannerConfig.bgImageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url(${bannerConfig.bgImageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090F]/95 via-[#090D15]/85 to-[#0E1422]/90 backdrop-blur-[1px]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#090D15] via-[#0E1422] to-[#07090F]">
            <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#00FF88]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#3E9BFF]/15 blur-3xl" />
          </div>
        )}

        <div className="relative z-10 space-y-6">
          {/* Top Bar: Official Badge + Customization Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-['JetBrains_Mono'] font-bold text-[#00FF88] shadow-sm">
              <Swords size={14} />
              <span>{bannerConfig.badgeText || "CIRCUIT OFFICIEL HOUSE GAME ESPORT • CAMEROUN"}</span>
            </div>

            {/* Banner Quick Tools */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
                title="Choisir et importer votre logo depuis votre ordinateur"
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300 transition active:scale-95 disabled:opacity-50"
              >
                <Camera size={13} />
                <span>{isUploadingLogo ? "Chargement..." : bannerConfig.logoUrl ? "Changer le logo" : "Mettre mon logo"}</span>
              </button>

              <button
                type="button"
                onClick={openBannerCustomizer}
                title="Modifier les détails de la bannière et le logo"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-slate-300 hover:text-white transition active:scale-95"
              >
                <Sliders size={13} />
                <span>Personnaliser bannière</span>
              </button>

              {(bannerConfig.logoUrl || bannerConfig.bgImageUrl) && (
                <button
                  type="button"
                  onClick={handleResetBanner}
                  title="Réinitialiser le logo et le fond"
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/20 px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-300 transition"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Banner Main Grid: Logo Emblem + Title & Text */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
            {/* LOGO EMBLEM DISPLAY AREA */}
            <div className="relative group shrink-0">
              <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-500/40 bg-[#0A0D16]/90 p-3 sm:p-4 shadow-[0_0_25px_rgba(0,255,136,0.2)] backdrop-blur-md min-w-[140px] sm:min-w-[170px] min-h-[140px] sm:min-h-[170px] transition group-hover:border-emerald-400">
                {bannerConfig.logoUrl ? (
                  <div className="flex flex-col items-center justify-center p-1">
                    <img
                      src={bannerConfig.logoUrl}
                      alt="Logo House Game Esport"
                      className="max-h-24 sm:max-h-28 max-w-[150px] sm:max-w-[170px] object-contain drop-shadow-[0_0_15px_rgba(0,255,136,0.5)]"
                    />
                    <span className="mt-2 text-[9px] font-['Orbitron'] font-bold text-emerald-400 tracking-wider">
                      LOGO ESPORT
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <HouseGameLogo size={70} showSlogan={false} className="drop-shadow-md" />
                    <span className="mt-1 font-['Orbitron'] text-[10px] font-black text-white">
                      HOUSE <span className="text-[#FF4438]">GAME</span>
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[9px] text-emerald-400 font-bold">
                      ESPORT
                    </span>
                  </div>
                )}

                {/* Hover overlay with button to change logo */}
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-2 text-center"
                >
                  <Camera size={20} className="text-emerald-400 mb-1" />
                  <span className="font-['Orbitron'] text-[10px] font-bold text-white">
                    {bannerConfig.logoUrl ? "Changer le logo" : "Mettre votre logo"}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[8px] text-slate-300 mt-0.5">
                    PNG, JPG, SVG
                  </span>
                </div>
              </div>
            </div>

            {/* Typography Content */}
            <div className="flex-1 space-y-3">
              <div className="font-['Orbitron'] text-xs sm:text-sm font-bold tracking-widest text-emerald-400 uppercase">
                // {bannerConfig.subtitle || "HOUSE GAME ESPORT"}
              </div>

              <h1 className="font-['Orbitron'] text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                {bannerConfig.title || "ARÈNE OFFICIELLE, TOURNOIS & CASH PRIZES GARANTIS"}
              </h1>

              <p className="font-['Chakra_Petch'] text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                {bannerConfig.description ||
                  "Plateforme officielle de compétition de jeux vidéo au Cameroun. Retrouvez les championnats majeurs sur EA SPORTS FC 27, Tekken 8 et Naruto Storm Connections. Inscrivez-vous, obtenez votre licence numérique certifiée HOUSE GAME ID, suivez les scores en direct et hissez-vous au sommet du classement."}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-['JetBrains_Mono'] text-xs">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <span className="text-[10px] text-slate-400 block">TOURNOIS OFFICIELS</span>
              <strong className="font-['Orbitron'] text-base sm:text-lg text-white">
                {tournamentsList.length} Compétition{tournamentsList.length > 1 ? "s" : ""}
              </strong>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <span className="text-[10px] text-slate-400 block">CASH PRIZE TOTAL</span>
              <strong className="font-['Orbitron'] text-base sm:text-lg text-amber-400">
                {totalCashPrizeFormatted}
              </strong>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <span className="text-[10px] text-slate-400 block">LICENCES ÉMISES</span>
              <strong className="font-['Orbitron'] text-base sm:text-lg text-[#00FF88]">
                {licenses.filter((l) => l.status === "Active").length} Active{licenses.filter((l) => l.status === "Active").length > 1 ? "s" : ""}
              </strong>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <span className="text-[10px] text-slate-400 block">MATCHS ENREGISTRÉS</span>
              <strong className="font-['Orbitron'] text-base sm:text-lg text-[#3E9BFF]">
                {matches.length} Rencontre{matches.length > 1 ? "s" : ""}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* SUB-NAVIGATION BAR (6 Core Views) */}
      <nav
        aria-label="Navigation E-Sport"
        className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar"
      >
        {[
          { id: "tournaments", label: "Tournois & Calendrier", icon: Trophy, count: tournamentsList.length },
          { id: "licenses", label: "Licences & Vérification", icon: ShieldCheck, count: licenses.length },
          { id: "brackets", label: "Tableaux & Scores Live", icon: Swords, count: matches.length },
          { id: "rankings", label: "Classement & Palmarès", icon: Award, count: players.length },
          { id: "player-space", label: "Espace Joueur", icon: User },
          { id: "admin-dash", label: "Gestion E-Sport (Admin)", icon: Lock, count: registrations.filter((r) => r.status === "en attente").length },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = subView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sfx.playClick();
                setSubView(item.id as EsportSubView);
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold transition active:scale-95 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              <Icon size={15} className={isActive ? "text-white" : "text-emerald-400"} />
              <span>{item.label}</span>
              {typeof item.count === "number" && item.count > 0 && (
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] font-black ${
                    isActive ? "bg-black/30 text-white" : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ========================================================================= */}
      {/* VUE 1 : TOURNOIS & CALENDRIER                                              */}
      {/* ========================================================================= */}
      {subView === "tournaments" && (
        <section className="space-y-6 animate-fadeIn">
          {/* Filter & Search Bar */}
          <div className="rounded-2xl border border-white/10 bg-[#0E121B] p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un tournoi, un jeu ou un lieu..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-xs font-['Chakra_Petch'] text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Admin quick add */}
              {isAdmin && (
                <button
                  onClick={onOpenAddTournament}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-md transition"
                >
                  <Plus size={14} />
                  <span>Nouveau Tournoi</span>
                </button>
              )}
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-['JetBrains_Mono']">
              {/* Games */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Jeu :</span>
                <select
                  value={gameFilter}
                  onChange={(e) => setGameFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200 text-xs focus:border-emerald-400 focus:outline-none"
                >
                  {uniqueGames.map((g) => (
                    <option key={g} value={g} className="bg-slate-900 text-white">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Statut :</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200 text-xs focus:border-emerald-400 focus:outline-none"
                >
                  {["Tous", "Inscriptions ouvertes", "En cours", "Terminé", "Bientôt disponible"].map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Format :</span>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-200 text-xs focus:border-emerald-400 focus:outline-none"
                >
                  {["Tous", "Élimination directe", "Double élimination", "Groupes"].map((f) => (
                    <option key={f} value={f} className="bg-slate-900 text-white">
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {(searchQuery || gameFilter !== "Tous" || statusFilter !== "Tous" || formatFilter !== "Tous") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setGameFilter("Tous");
                    setStatusFilter("Tous");
                    setFormatFilter("Tous");
                  }}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] underline ml-auto"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Tournaments Grid */}
          {filteredTournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#0E121B] p-12 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Trophy size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white">
                  Aucun tournoi pour le moment
                </h4>
                <p className="max-w-md font-['Chakra_Petch'] text-xs text-slate-400">
                  {isAdmin
                    ? "Votre section esport est prête et complètement vide. Cliquez sur le bouton ci-dessous pour créer et publier votre premier tournoi !"
                    : "Les prochains tournois officiels HOUSE GAME seront annoncés ici très prochainement. Restez connectés !"}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={onOpenAddTournament}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
                >
                  <Plus size={15} />
                  <span>Ajouter un premier tournoi</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((t) => {
                const currentSlots = t.currentSlots || 0;
                const maxSlots = t.maxSlots || 32;
              const slotsPercent = Math.min(100, Math.round((currentSlots / maxSlots) * 100));
              const isClosed = t.status === "Terminé" || t.status === "Suspendu";
              const isOpen = t.status === "Inscriptions ouvertes";

              return (
                <div
                  key={t.id}
                  id={`tournament-${t.id}`}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-500 ${
                    highlightedTournamentId === t.id
                      ? "border-emerald-400 bg-[#121926] ring-4 ring-emerald-500/50 shadow-[0_0_40px_rgba(0,255,136,0.35)] scale-[1.01]"
                      : "border-white/10 bg-[#0E121B] shadow-2xl hover:border-emerald-500/50 hover:bg-[#121723]"
                  }`}
                >
                  {/* Deep link active banner */}
                  {highlightedTournamentId === t.id && (
                    <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 px-4 py-2 text-xs font-['JetBrains_Mono'] font-bold text-white shadow-md animate-pulse">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#00FF88]" />
                        <span>TOURNOI SÉLECTIONNÉ VIA LE LIEN PARTAGÉ</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHighlightedTournamentId(null)}
                        className="text-white/80 hover:text-white p-0.5 rounded hover:bg-black/20"
                        title="Fermer la mise en avant"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}

                  <div>
                    {/* Top Image Banner */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      <img
                        src={t.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"}
                        alt={t.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-black/40 to-black/60" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="rounded-lg border border-[#3E9BFF]/40 bg-black/80 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-[#3E9BFF] backdrop-blur-md">
                          {t.game}
                        </span>

                        <span
                          className={`rounded-lg border px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold backdrop-blur-md ${
                            isOpen
                              ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              : isClosed
                              ? "border-slate-600 bg-slate-800 text-slate-400"
                              : "border-amber-500/50 bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      {/* Cash Prize */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div>
                          <div className="text-[10px] font-bold font-['JetBrains_Mono'] text-slate-400">
                            CASH PRIZE GARANTI
                          </div>
                          <div className="font-['Orbitron'] text-xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                            {t.cashPrize}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] font-bold font-['JetBrains_Mono'] text-slate-400">
                            INSCRIPTION
                          </div>
                          <div className="font-['JetBrains_Mono'] text-xs font-bold text-white">
                            {t.entryFee}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="font-['Orbitron'] text-base font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors">
                          {t.title}
                        </h3>
                        {t.description && (
                          <p className="mt-1 font-['Chakra_Petch'] text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        )}
                      </div>

                      {/* Meta Grid */}
                      <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-emerald-400 shrink-0" />
                          <span>{t.date} ({t.time})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-[#FF4438] shrink-0" />
                          <span className="truncate">{t.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gamepad2 size={13} className="text-[#3E9BFF] shrink-0" />
                          <span>{t.platform} • {t.format}</span>
                        </div>
                      </div>

                      {/* Slots Bar */}
                      <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Places réservées :</span>
                          <strong className="text-white">
                            {currentSlots} / {maxSlots} joueurs
                          </strong>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#00FF88] transition-all"
                            style={{ width: `${slotsPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bottom */}
                  <div className="p-5 pt-0 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenRegister(t)}
                        disabled={isClosed}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-40"
                      >
                        <Trophy size={14} />
                        <span>S'inscrire au tournoi</span>
                      </button>

                      {/* Share Tournament Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenShareModal(t)}
                        title="Partager le lien de ce tournoi avec votre communauté (WhatsApp, réseaux, QR code)"
                        className="flex items-center justify-center rounded-xl border border-[#3E9BFF]/40 bg-[#3E9BFF]/15 hover:bg-[#3E9BFF]/25 p-3 text-[#3E9BFF] hover:text-white transition active:scale-95 shadow-sm"
                      >
                        <Share2 size={16} />
                      </button>

                      <button
                        onClick={() => setViewingRulesTournament(t)}
                        title="Voir le règlement complet"
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-slate-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white transition"
                      >
                        <Info size={16} />
                      </button>
                    </div>

                    {/* Quick Link to Bracket */}
                    <button
                      onClick={() => {
                        setSelectedBracketTournamentId(t.id);
                        setSubView("brackets");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/10 py-1.5 text-[11px] font-['JetBrains_Mono'] text-slate-400 hover:text-white transition"
                    >
                      <Swords size={12} className="text-[#3E9BFF]" />
                      <span>Consulter l'arbre des matchs</span>
                    </button>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-['JetBrains_Mono']">
                        <button
                          onClick={() => handleGenerateBracket(t)}
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Sparkles size={11} />
                          <span>Générer arbre</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditTournament(t)}
                            className="text-amber-400 hover:underline"
                          >
                            Modifier
                          </button>
                          <span className="text-white/20">•</span>
                          <button
                            onClick={() => onDeleteTournament(t)}
                            className="text-rose-400 hover:underline"
                          >
                            Supprimer
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
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : LICENCES NUMÉRIQUES & VÉRIFICATION                                 */}
      {/* ========================================================================= */}
      {subView === "licenses" && (
        <section className="space-y-8 animate-fadeIn">
          {/* Public Verification Box */}
          <div className="rounded-3xl border border-emerald-500/30 bg-[#0E121B] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] font-bold text-[#00FF88]">
                <ShieldCheck size={16} />
                <span>SERVICE OFFICIEL DE VÉRIFICATION DE LICENCE</span>
              </div>
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white">
                CONTRÔLE & AUTHENTIFICATION HOUSE GAME ID
              </h2>
              <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tout joueur participant aux compétitions officielles HOUSE GAME dispose d'une licence numérique unique avec QR code.
                Entrez le numéro de licence pour vérifier sa validité officielle en temps réel.
              </p>
            </div>

            <form onSubmit={handleRunVerification} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={verificationQuery}
                  onChange={(e) => setVerificationQuery(e.target.value)}
                  placeholder="Ex: HGE-2026-1001 ou pseudo..."
                  className="w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 py-3 font-['Orbitron'] text-sm font-bold text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
              >
                <QrCode size={14} />
                <span>Vérifier</span>
              </button>
            </form>

            {/* Verification Result Display */}
            {verificationResult?.searched && (
              <div
                className={`rounded-2xl border p-5 transition animate-fadeIn ${
                  verificationResult.found
                    ? verificationResult.isStatusActive
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : "border-amber-500/50 bg-amber-500/10"
                    : "border-rose-500/50 bg-rose-500/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {verificationResult.found ? (
                    verificationResult.isStatusActive ? (
                      <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={24} className="text-amber-400 shrink-0 mt-0.5" />
                    )
                  ) : (
                    <X size={24} className="text-rose-400 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-2 flex-1">
                    <h4 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                      {verificationResult.found
                        ? verificationResult.isStatusActive
                          ? "LICENCE OFFICIELLE CERTIFIÉE CONFORME"
                          : "LICENCE NON CONFORME OU SUSPENDUE"
                        : "AUCUNE LICENCE TROUVÉE"}
                    </h4>
                    <p className="font-['Chakra_Petch'] text-xs text-slate-200">
                      {verificationResult.message}
                    </p>

                    {verificationResult.license && (
                      <div className="pt-4">
                        <EsportDigitalLicenseCard license={verificationResult.license} showActions={false} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Licenses Showcase Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-['Orbitron'] text-lg font-bold text-white">
                CARTES OFFICIELLES DES JOUEURS CERTIFIÉS ({licenses.length})
              </h3>
              <p className="font-['Chakra_Petch'] text-xs text-slate-400">
                Aperçu des licences numériques émises par la direction HOUSE GAME.
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          {licenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#0E121B] p-12 text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck size={32} />
              </div>
              <h4 className="font-['Orbitron'] text-base font-bold text-white">
                Aucune licence émise pour le moment
              </h4>
              <p className="max-w-md font-['Chakra_Petch'] text-xs text-slate-400">
                Les cartes de licence numérique officielle HOUSE GAME ID avec QR code seront générées automatiquement dès la validation des premières inscriptions de joueurs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {licenses.map((lic) => (
                <EsportDigitalLicenseCard
                  key={lic.id}
                  license={lic}
                  customLogoUrl={bannerConfig.logoUrl}
                  onDelete={() => handleRequestDeleteLicense(lic)}
                  onVerifyClick={() => {
                    setVerificationQuery(lic.id);
                    const res = verifyEsportLicense(lic.id, licenses);
                    setVerificationResult({
                      searched: true,
                      found: res.found,
                      license: res.license,
                      message: res.message,
                      isStatusActive: res.isStatusActive,
                    });
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* VUE 3 : TABLEAU DES MATCHS & SCORES LIVE                                   */}
      {/* ========================================================================= */}
      {subView === "brackets" && (
        <section className="space-y-6 animate-fadeIn">
          {tournamentsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#0E121B] p-12 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Swords size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white">
                  Aucun tournoi disponible pour afficher un tableau
                </h4>
                <p className="max-w-md font-['Chakra_Petch'] text-xs text-slate-400">
                  {isAdmin
                    ? "Créez votre premier tournoi pour pouvoir enregistrer les inscriptions des joueurs et générer l'arbre des matchs officiels."
                    : "Les arbres de rencontres et les matchs en direct s'afficheront dès qu'un tournoi officiel sera publié."}
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={onOpenAddTournament}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-md transition"
                >
                  <Plus size={14} />
                  <span>Nouveau Tournoi</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Tournament Selector for Brackets */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl border border-white/10 bg-[#0E121B]">
                <span className="font-['JetBrains_Mono'] text-xs text-slate-400 font-bold px-2">
                  Tournoi actif :
                </span>
                {tournamentsList.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      sfx.playClick();
                      setSelectedBracketTournamentId(t.id);
                    }}
                    className={`rounded-xl px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold transition ${
                      selectedBracketTournamentId === t.id
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {t.title.split(":")[1]?.trim() || t.title}
                  </button>
                ))}
              </div>

              {/* Bracket Viewer Component */}
              {selectedBracketTournament && (
                <div className="rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-2xl">
                  <EsportBracketViewer
                    tournament={selectedBracketTournament}
                    matches={matches}
                    isAdmin={isAdmin}
                    onRecordScore={handleRecordScore}
                    onGenerateBracket={() => handleGenerateBracket(selectedBracketTournament)}
                    canGenerate={registrations.filter((r) => r.tournamentId === selectedBracketTournament.id && r.status === "validée").length >= 2}
                    validatedCount={registrations.filter((r) => r.tournamentId === selectedBracketTournament.id && r.status === "validée").length}
                  />
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* VUE 4 : CLASSEMENT RANKING & PALMARÈS                                       */}
      {/* ========================================================================= */}
      {subView === "rankings" && (
        <section className="space-y-8 animate-fadeIn">
          {players.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#0E121B] p-12 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Crown size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white">
                  Classement général en attente des premiers matchs
                </h4>
                <p className="max-w-md font-['Chakra_Petch'] text-xs text-slate-400">
                  Le classement général des compétiteurs HOUSE GAME et le palmarès des champions se rempliront automatiquement au fur et à mesure que les joueurs disputeront et remporteront leurs matchs de tournoi.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Hall of Fame Podium */}
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1A150D] via-[#0E121B] to-[#07090E] p-6 sm:p-10 shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-['JetBrains_Mono'] font-bold text-amber-300">
                    <Crown size={14} />
                    <span>PALMARÈS OFFICIEL HOUSE GAME ESPORT</span>
                  </div>
                  <h2 className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-white">
                    LEADERBOARD & MEILLEURS JOUEURS
                  </h2>
                  <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
                    Les points de classement sont attribués lors de chaque tournoi officiel (Victoire : +100 pts, Finale : +60 pts, Demi-finale : +35 pts).
                  </p>
                </div>

                {/* Podium 3 Champions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-3xl mx-auto items-end">
                  {/* #2 Silver */}
                  {players[1] && (
                    <div className="order-2 md:order-1 rounded-2xl border border-slate-400/30 bg-white/5 p-5 text-center space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-300/20 text-slate-200 font-['Orbitron'] text-lg font-black border border-slate-300/40">
                        2
                      </div>
                      <div className="font-['Orbitron'] text-lg font-bold text-white">
                        {players[1].gamerTag}
                      </div>
                      <div className="font-['JetBrains_Mono'] text-xs text-slate-300">
                        {players[1].points} pts • {players[1].favoriteGame}
                      </div>
                      <div className="text-[11px] font-['JetBrains_Mono'] text-slate-400">
                        {players[1].trophies} Trophée{players[1].trophies > 1 ? "s" : ""}
                      </div>
                    </div>
                  )}

                  {/* #1 Gold Champion */}
                  {players[0] && (
                    <div className="order-1 md:order-2 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-t from-amber-500/20 to-amber-500/5 p-6 text-center space-y-3 shadow-[0_0_25px_rgba(245,158,11,0.25)] -translate-y-2">
                      <Crown size={28} className="text-amber-400 mx-auto animate-bounce" />
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-['Orbitron'] text-xl font-black shadow-lg">
                        1
                      </div>
                      <div className="font-['Orbitron'] text-xl font-black text-white">
                        {players[0].gamerTag}
                      </div>
                      <div className="font-['JetBrains_Mono'] text-sm font-bold text-amber-300">
                        {players[0].points} pts • {players[0].rankTitle}
                      </div>
                      <div className="text-xs font-['JetBrains_Mono'] text-slate-300">
                        {players[0].wins} victoires • {players[0].trophies} Trophée{players[0].trophies > 1 ? "s" : ""}
                      </div>
                    </div>
                  )}

                  {/* #3 Bronze */}
                  {players[2] && (
                    <div className="order-3 rounded-2xl border border-amber-700/40 bg-white/5 p-5 text-center space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-700/20 text-amber-400 font-['Orbitron'] text-lg font-black border border-amber-700/40">
                        3
                      </div>
                      <div className="font-['Orbitron'] text-lg font-bold text-white">
                        {players[2].gamerTag}
                      </div>
                      <div className="font-['JetBrains_Mono'] text-xs text-slate-300">
                        {players[2].points} pts • {players[2].favoriteGame}
                      </div>
                      <div className="text-[11px] font-['JetBrains_Mono'] text-slate-400">
                        {players[2].trophies} Trophée{players[2].trophies > 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete Ranking Table */}
              <div className="rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="font-['Orbitron'] text-base font-bold text-white">
                    CLASSEMENT GÉNÉRAL DES COMPÉTITEURS ({players.length})
                  </h3>
                  <button
                    onClick={() => exportToCsv(players, "classement-house-game-esport")}
                    className="flex items-center gap-1.5 text-xs font-['JetBrains_Mono'] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-lg transition"
                  >
                    <FileSpreadsheet size={13} />
                    <span>Exporter le classement (CSV)</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-['JetBrains_Mono'] text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="py-3 px-3">RANG</th>
                        <th className="py-3 px-3">JOUEUR / PSEUDO</th>
                        <th className="py-3 px-3">TITRE</th>
                        <th className="py-3 px-3">JEU PRÉFÉRÉ</th>
                        <th className="py-3 px-3 text-center">MATCHS</th>
                        <th className="py-3 px-3 text-center">V / D</th>
                        <th className="py-3 px-3 text-center">WINRATE</th>
                        <th className="py-3 px-3 text-right">POINTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {players.map((p, idx) => {
                        const winrate =
                          p.matchesPlayed > 0 ? Math.round((p.wins / p.matchesPlayed) * 100) : 0;
                        return (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition">
                            <td className="py-3 px-3 font-['Orbitron'] font-bold">
                              {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-['Orbitron'] font-bold text-white">{p.gamerTag}</div>
                              <div className="text-[10px] text-slate-400">{p.fullName}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] border border-white/10">
                                {p.rankTitle}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-300">{p.favoriteGame}</td>
                            <td className="py-3 px-3 text-center text-slate-300">{p.matchesPlayed}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="text-emerald-400 font-bold">{p.wins}</span>
                              <span className="text-slate-500"> / </span>
                              <span className="text-rose-400">{p.losses}</span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-emerald-400">
                              {winrate}%
                            </td>
                            <td className="py-3 px-3 text-right font-['Orbitron'] text-sm font-bold text-amber-400">
                              {p.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* VUE 5 : ESPACE PERSONNEL DU JOUEUR                                         */}
      {/* ========================================================================= */}
      {subView === "player-space" && (
        <section className="space-y-6 animate-fadeIn">
          {!loggedPlayer ? (
            <div className="max-w-md mx-auto rounded-3xl border border-emerald-500/30 bg-[#0E121B] p-6 sm:p-8 space-y-5 shadow-2xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <User size={28} />
              </div>
              <div>
                <h3 className="font-['Orbitron'] text-xl font-bold text-white">
                  CONNEXION ESPACE JOUEUR
                </h3>
                <p className="mt-1 font-['Chakra_Petch'] text-xs text-slate-300">
                  Retrouvez votre carte de licence numérique, vos inscriptions et vos matchs en direct.
                </p>
              </div>

              <form onSubmit={handlePlayerLoginLookup} className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="font-['JetBrains_Mono'] text-xs font-bold text-slate-300">
                    Votre Pseudo Gaming ou Numéro de téléphone
                  </label>
                  <input
                    type="text"
                    required
                    value={playerLookupTag}
                    onChange={(e) => setPlayerLookupTag(e.target.value)}
                    placeholder="Ex: CamerStriker ou +237..."
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-['Chakra_Petch'] text-sm text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-lg transition active:scale-95"
                >
                  <User size={14} />
                  <span>Accéder à mon espace joueur</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl border border-white/10 bg-[#0E121B]">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-['Orbitron'] text-xl font-bold">
                    {loggedPlayer.gamerTag.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-['Orbitron'] text-xl sm:text-2xl font-black text-white">
                      {loggedPlayer.gamerTag}
                    </h3>
                    <p className="font-['Chakra_Petch'] text-xs text-slate-300">
                      {loggedPlayer.fullName} • Rang : {loggedPlayer.rankTitle} ({loggedPlayer.points} pts)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setLoggedPlayer(null)}
                  className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-['JetBrains_Mono'] text-slate-400 hover:text-white"
                >
                  Déconnexion
                </button>
              </div>

              {/* Player's Official License Card */}
              <div className="space-y-3">
                <h4 className="font-['Orbitron'] text-base font-bold text-white">
                  VOTRE CARTE DE LICENCE OFFICIELLE HOUSE GAME ID
                </h4>
                {licenses.find(
                  (l) => l.playerId === loggedPlayer.id || l.gamerTag.toLowerCase() === loggedPlayer.gamerTag.toLowerCase()
                ) ? (
                  <EsportDigitalLicenseCard
                    license={
                      licenses.find(
                        (l) => l.playerId === loggedPlayer.id || l.gamerTag.toLowerCase() === loggedPlayer.gamerTag.toLowerCase()
                      )!
                    }
                    customLogoUrl={bannerConfig.logoUrl}
                    onDelete={() => {
                      const lic = licenses.find(
                        (l) => l.playerId === loggedPlayer.id || l.gamerTag.toLowerCase() === loggedPlayer.gamerTag.toLowerCase()
                      );
                      if (lic) handleRequestDeleteLicense(lic);
                    }}
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center text-xs font-['JetBrains_Mono'] text-amber-300">
                    Licence en cours de validation par la direction House Game.
                  </div>
                )}
              </div>

              {/* Player's Registrations */}
              <div className="space-y-3">
                <h4 className="font-['Orbitron'] text-base font-bold text-white">
                  VOS INSCRIPTIONS AUX TOURNOIS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {registrations
                    .filter((r) => r.gamerTag.toLowerCase() === loggedPlayer.gamerTag.toLowerCase() || r.playerId === loggedPlayer.id)
                    .map((r) => (
                      <div key={r.id} className="rounded-2xl border border-white/10 bg-[#0E121B] p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs font-['JetBrains_Mono']">
                          <span className="text-slate-400">{r.id}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold ${
                              r.status === "validée"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : r.status === "en attente"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {r.status.toUpperCase()}
                          </span>
                        </div>
                        <h5 className="font-['Orbitron'] text-sm font-bold text-white">{r.tournamentTitle}</h5>
                        <p className="font-['JetBrains_Mono'] text-xs text-slate-400">
                          Plateforme : {r.platform} • Jeu : {r.game}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* VUE 6 : ESPACE GESTION E-SPORT (ADMIN & STAFF)                             */}
      {/* ========================================================================= */}
      {subView === "admin-dash" && (
        <section className="space-y-8 animate-fadeIn">
          {/* Admin Header & CSV Export */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl border border-emerald-500/30 bg-[#0E1522] shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] font-bold text-emerald-400">
                <ShieldCheck size={16} />
                <span>ESPACE PRO • TABLEAU DE BORD ORGANISATION ESPORT</span>
              </div>
              <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white mt-1">
                GESTION COMPLÈTE DU MODULE HOUSE GAME ESPORT
              </h2>
              <p className="font-['Chakra_Petch'] text-xs text-slate-300">
                Validez les inscriptions, gérez les licences certifiées, organisez les matchs et exportez vos données.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenAddTournament}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-md transition"
              >
                <Plus size={13} />
                <span>Nouveau Tournoi</span>
              </button>
              <button
                onClick={() => exportToCsv(registrations, "inscriptions-house-game-esport")}
                disabled={registrations.length === 0}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300 transition disabled:opacity-40"
              >
                <Download size={13} />
                <span>Export Inscriptions (CSV)</span>
              </button>
              <button
                onClick={() => exportToCsv(licenses, "licences-house-game-esport")}
                disabled={licenses.length === 0}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white transition disabled:opacity-40"
              >
                <Download size={13} />
                <span>Export Licences (CSV)</span>
              </button>
              <button
                onClick={handleClearAllEsportData}
                title="Supprimer tous les tournois et données esport pour repartir de zéro"
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-rose-300 transition"
              >
                <Trash2 size={13} />
                <span>Vider tout l'E-Sport</span>
              </button>
            </div>
          </div>

          {/* Registrations Management */}
          <div className="rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                  <span>INSCRIPTIONS DES JOUEURS</span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 font-['JetBrains_Mono'] font-bold">
                    {registrations.length} total
                  </span>
                  {registrations.filter((r) => r.status === "en attente").length > 0 && (
                    <span className="rounded-full bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 font-['JetBrains_Mono'] font-bold animate-pulse">
                      {registrations.filter((r) => r.status === "en attente").length} en attente
                    </span>
                  )}
                </h3>
                <p className="font-['Chakra_Petch'] text-xs text-slate-400">
                  Synchronisation instantanée en temps réel. La validation d'une inscription génère automatiquement la licence numérique du joueur.
                </p>
              </div>

              {/* Notification & Refresh Tools */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sfx.playRegistrationAlert();
                    showToast("Sonnerie d'alerte testée avec succès ! (Volume OK)");
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-2 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300 transition active:scale-95"
                  title="Écouter le bip sonore d'alerte joué lors d'une nouvelle inscription"
                >
                  <Volume2 size={13} className="text-emerald-400" />
                  <span>Tester son d'alerte</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const pending = registrations.filter((r) => r.status === "en attente");
                    const shopPhone = (shopInfo.whatsapp || shopInfo.phone || "+237690000000").replace(/[^0-9]/g, "");
                    const text = `🎮 *HOUSE GAME ESPORT - NOTIFICATION ADMIN*\n\n` +
                      `📋 *Inscriptions enregistrées :* ${registrations.length}\n` +
                      `⏳ *En attente de validation :* ${pending.length}\n\n` +
                      (pending.length > 0
                        ? `*Dernières inscriptions à traiter :*\n` +
                          pending.slice(0, 5).map((r, i) => `${i + 1}. *${r.gamerTag}* (${r.fullName})\n   Tournoi: ${r.tournamentTitle}\n   Tél: ${r.phone}`).join("\n\n")
                        : `✅ Toutes les inscriptions sont à jour !`);
                    window.open(`https://api.whatsapp.com/send?phone=${shopPhone}&text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 px-3 py-2 font-['JetBrains_Mono'] text-xs font-bold text-[#25D366] transition active:scale-95"
                  title="Recevoir le récapitulatif des inscriptions sur WhatsApp"
                >
                  <Phone size={13} />
                  <span>Alerte WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold transition active:scale-95 shadow-sm ${
                    notificationPermission === "granted"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  }`}
                  title="Activer les alertes sur votre écran à chaque nouvelle inscription"
                >
                  {notificationPermission === "granted" ? (
                    <>
                      <BellRing size={14} className="text-emerald-400" />
                      <span>Alertes bureau actives</span>
                    </>
                  ) : (
                    <>
                      <Bell size={14} className="text-amber-400 animate-bounce" />
                      <span>M'alerter aux inscriptions</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const l = loadEsportRegistrations();
                    setRegistrations(l);
                    onUpdateRegistrations?.(l);
                    showToast("Liste des inscriptions actualisée !");
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 font-['JetBrains_Mono'] text-xs text-slate-300 transition"
                  title="Recharger manuellement les inscriptions"
                >
                  <RefreshCw size={13} />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>

            {/* Live Instant Alert Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-['JetBrains_Mono']">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>
                  <strong>Module d'alerte instantanée actif :</strong> Chaque inscription émet un carillon sonore et s'affiche immédiatement en temps réel.
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Synchronisé via Firestore & Broadcast direct</span>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 font-['JetBrains_Mono'] text-xs font-bold">
              {[
                { id: "all", label: "Toutes", count: registrations.length },
                { id: "en attente", label: "En attente", count: registrations.filter((r) => r.status === "en attente").length, color: "text-amber-400" },
                { id: "validée", label: "Validées", count: registrations.filter((r) => r.status === "validée").length, color: "text-emerald-400" },
                { id: "refusée", label: "Refusées", count: registrations.filter((r) => r.status === "refusée").length, color: "text-rose-400" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setAdminRegFilter(f.id as any)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
                    adminRegFilter === f.id
                      ? "bg-white/15 text-white border border-white/20 shadow-sm"
                      : "bg-white/5 text-slate-400 hover:text-white border border-transparent"
                  }`}
                >
                  <span className={f.color}>{f.label}</span>
                  <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] text-slate-300">
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {registrations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-xs font-['JetBrains_Mono'] text-slate-400 space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400 mx-auto">
                  <User size={24} />
                </div>
                <p className="font-bold text-white text-sm">Aucune inscription enregistrée pour le moment</p>
                <p>Dès qu'un joueur valide son inscription sur un tournoi, elle apparaîtra instantanément ici avec son statut et ses coordonnées.</p>
              </div>
            ) : registrations.filter((r) => adminRegFilter === "all" || r.status === adminRegFilter).length === 0 ? (
              <div className="p-8 text-center text-xs font-['JetBrains_Mono'] text-slate-400">
                Aucune inscription dans la catégorie « {adminRegFilter} ».
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-['JetBrains_Mono'] text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">JOUEUR</th>
                      <th className="py-2.5 px-3">TOURNOI</th>
                      <th className="py-2.5 px-3">CONTACT</th>
                      <th className="py-2.5 px-3">STATUT</th>
                      <th className="py-2.5 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {registrations
                      .filter((r) => adminRegFilter === "all" || r.status === adminRegFilter)
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-white/[0.02] transition">
                          <td className="py-3 px-3 font-bold text-slate-400">{r.id}</td>
                          <td className="py-3 px-3">
                            <strong className="text-white block font-['Orbitron']">{r.gamerTag}</strong>
                            <span className="text-[10px] text-slate-400">{r.fullName}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 max-w-xs truncate">{r.tournamentTitle}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300">{r.phone}</span>
                              <a
                                href={`https://api.whatsapp.com/send?phone=${r.phone.replace(/[^0-9]/g, "")}&text=${encodeURIComponent(
                                  `Bonjour ${r.gamerTag}, c'est la direction HOUSE GAME ESPORT concernant votre inscription au tournoi ${r.tournamentTitle}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-[#25D366]/20 border border-[#25D366]/40 hover:bg-[#25D366]/30 p-1.5 text-[#25D366] transition active:scale-95"
                                title="Contacter le joueur sur WhatsApp"
                              >
                                <Phone size={12} />
                              </a>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === "validée"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : r.status === "en attente"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {r.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {r.status !== "validée" && (
                                <button
                                  type="button"
                                  onClick={() => handleValidateRegistration(r)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition active:scale-95"
                                >
                                  Valider & Licence
                                </button>
                              )}
                              {r.status === "en attente" && (
                                <button
                                  type="button"
                                  onClick={() => handleRejectRegistration(r.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] transition"
                                >
                                  Refuser
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteRegistration(r.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Supprimer définitivement l'inscription"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Licenses Management Table */}
          <div className="rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-['Orbitron'] text-base font-bold text-white">
                LICENCES NUMÉRIQUES ({licenses.length})
              </h3>
            </div>

            {licenses.length === 0 ? (
              <div className="p-8 text-center text-xs font-['JetBrains_Mono'] text-slate-400">
                Aucune licence émise pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-['JetBrains_Mono'] text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-2.5 px-3">N° LICENCE</th>
                      <th className="py-2.5 px-3">PSEUDO</th>
                      <th className="py-2.5 px-3">NOM</th>
                      <th className="py-2.5 px-3">RANG</th>
                      <th className="py-2.5 px-3">EXPIRATION</th>
                      <th className="py-2.5 px-3">STATUT</th>
                      <th className="py-2.5 px-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {licenses.map((lic) => (
                      <tr key={lic.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3 font-bold text-emerald-400 font-['Orbitron']">{lic.id}</td>
                        <td className="py-3 px-3 font-bold text-white">{lic.gamerTag}</td>
                        <td className="py-3 px-3 text-slate-300">{lic.fullName}</td>
                        <td className="py-3 px-3 text-slate-300">{lic.rankLevel}</td>
                        <td className="py-3 px-3 text-slate-400">{lic.expiresAt}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lic.status === "Active"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {lic.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleLicenseStatus(lic.id, lic.status)}
                              className="px-2.5 py-1 rounded-lg border border-white/10 text-[11px] text-slate-300 hover:text-white hover:bg-white/5 transition"
                            >
                              {lic.status === "Active" ? "Suspendre" : "Réactiver"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRequestDeleteLicense(lic)}
                              title="Supprimer définitivement la carte de licence"
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-[11px] font-bold text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition"
                            >
                              <Trash2 size={12} />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Audit Logs */}
          <div className="rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-xl space-y-3">
            <h3 className="font-['Orbitron'] text-base font-bold text-white flex items-center gap-2">
              <History size={16} className="text-emerald-400" />
              <span>JOURNAL D'AUDIT DES ACTIONS IMPORTANTES</span>
            </h3>

            {logs.length === 0 ? (
              <div className="p-6 text-center text-xs font-['JetBrains_Mono'] text-slate-400">
                Aucune action enregistrée pour le moment dans le journal d'audit.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto font-['JetBrains_Mono'] text-xs">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3">
                    <div>
                      <span className="font-bold text-emerald-400">{log.action}</span>
                      <span className="text-slate-500"> par </span>
                      <strong className="text-white">{log.actor}</strong>
                      <p className="text-slate-300 text-[11px] mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL D'INSCRIPTION JOUEUR                                                */}
      {/* ========================================================================= */}
      {registeringTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-[#0C0F17] p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setRegisteringTournament(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs font-bold text-[#00FF88]">
                <Trophy size={14} />
                <span>FORMULAIRE OFFICIEL D'INSCRIPTION</span>
              </div>
              <h3 className="font-['Orbitron'] text-xl font-bold text-white mt-1">
                {registeringTournament.title}
              </h3>
              <p className="font-['Chakra_Petch'] text-xs text-slate-300">
                Frais d'inscription : <strong>{registeringTournament.entryFee}</strong> • Cash Prize : <strong className="text-amber-400">{registeringTournament.cashPrize}</strong>
              </p>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-['JetBrains_Mono'] flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-['JetBrains_Mono'] flex items-center gap-2">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                <span>{regSuccessMessage}</span>
              </div>
            )}

            {!regSuccessMessage && (
              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nom & Prénom */}
                  <div className="space-y-1">
                    <label className="font-['JetBrains_Mono'] text-xs font-bold text-slate-300">
                      Nom & Prénom *
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="Ex: Marc Noah"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-['Chakra_Petch'] text-xs text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  {/* GamerTag */}
                  <div className="space-y-1">
                    <label className="font-['JetBrains_Mono'] text-xs font-bold text-slate-300">
                      Pseudo Gaming (GamerTag) *
                    </label>
                    <input
                      type="text"
                      required
                      value={regGamerTag}
                      onChange={(e) => setRegGamerTag(e.target.value)}
                      placeholder="Ex: CamerStriker"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-['Orbitron'] text-xs font-bold text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Téléphone / WhatsApp */}
                  <div className="space-y-1">
                    <label className="font-['JetBrains_Mono'] text-xs font-bold text-slate-300">
                      Téléphone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+237 6XX XX XX XX"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-['JetBrains_Mono'] text-xs text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="font-['JetBrains_Mono'] text-xs font-bold text-slate-300">
                      Email (facultatif)
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="gamer@gmail.com"
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-['Chakra_Petch'] text-xs text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Plateforme */}
                <div className="space-y-1">
                  <label className="font-['JetBrains_Mono'] text-xs font-bold text-slate-300">
                    Plateforme de jeu
                  </label>
                  <select
                    value={regPlatform}
                    onChange={(e) => setRegPlatform(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-['JetBrains_Mono'] text-xs text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="PlayStation 5" className="bg-slate-900 text-white">PlayStation 5</option>
                    <option value="PC Pro Gaming" className="bg-slate-900 text-white">PC Pro Gaming</option>
                    <option value="Xbox Series X" className="bg-slate-900 text-white">Xbox Series X</option>
                    <option value="Mobile" className="bg-slate-900 text-white">Mobile</option>
                  </select>
                </div>

                {/* Photo de profil facultative */}
                <div className="space-y-1">
                  <label className="font-['JetBrains_Mono'] text-xs font-bold text-slate-300 flex justify-between">
                    <span>Photo de profil joueur (pour la licence)</span>
                    <span className="text-slate-500">Facultatif</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-['JetBrains_Mono'] text-xs text-slate-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:text-xs"
                  />
                </div>

                {/* Terms Acceptance */}
                <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    required
                    checked={regAcceptedTerms}
                    onChange={(e) => setRegAcceptedTerms(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0 mt-0.5"
                  />
                  <span className="font-['Chakra_Petch'] text-xs text-slate-300 leading-snug">
                    J'atteste de l'exactitude des informations fournies et j'accepte le règlement officiel du tournoi ainsi que la charte de fair-play HOUSE GAME ESPORT.
                  </span>
                </label>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setRegisteringTournament(null)}
                    className="px-4 py-2 rounded-xl text-xs font-['JetBrains_Mono'] text-slate-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] transition hover:from-emerald-500 hover:to-teal-500"
                  >
                    Confirmer mon inscription
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DU RÈGLEMENT OFFICIEL                                               */}
      {/* ========================================================================= */}
      {viewingRulesTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#0C0F17] p-6 sm:p-8 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setViewingRulesTournament(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs font-bold text-emerald-400">
                <ShieldCheck size={14} />
                <span>RÈGLEMENT OFFICIEL DE LA COMPÉTITION</span>
              </div>
              <h3 className="font-['Orbitron'] text-lg sm:text-xl font-bold text-white mt-1">
                {viewingRulesTournament.title}
              </h3>
            </div>

            <div className="space-y-4 text-xs font-['Chakra_Petch'] text-slate-200">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1.5">
                <strong className="font-['Orbitron'] text-xs text-white block">CONDITIONS D'ÉLIGIBILITÉ :</strong>
                <p>{viewingRulesTournament.eligibility || "Ouvert à tous les joueurs résidant au Cameroun."}</p>
              </div>

              <div className="space-y-2">
                <strong className="font-['Orbitron'] text-xs text-[#00FF88] block">RÈGLES DU JEU & FORMAT :</strong>
                <ul className="space-y-2 list-disc list-inside text-slate-300">
                  {viewingRulesTournament.rules?.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-[11px] font-['JetBrains_Mono'] text-amber-200">
                ⚠️ Tout comportement antisportif, insulte ou retard supérieur à 10 minutes entraîne une disqualification immédiate sans remboursement des frais d'inscription.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const t = viewingRulesTournament;
                  setViewingRulesTournament(null);
                  handleOpenShareModal(t);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3E9BFF]/20 border border-[#3E9BFF]/40 hover:bg-[#3E9BFF]/30 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] hover:text-white transition active:scale-95 shadow-sm"
              >
                <Share2 size={13} />
                <span>Partager ce tournoi</span>
              </button>

              <button
                onClick={() => setViewingRulesTournament(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 font-['JetBrains_Mono'] text-xs text-white"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : PARTAGER LE TOURNOI                                               */}
      {/* ========================================================================= */}
      {sharingTournament && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSharingTournament(null);
          }}
        >
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#3E9BFF]/40 bg-[#0C101A] p-6 sm:p-8 shadow-[0_0_50px_rgba(62,155,255,0.25)] space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3E9BFF]/40 bg-[#3E9BFF]/15 text-[#3E9BFF] shadow-[0_0_15px_rgba(62,155,255,0.3)]">
                  <Share2 size={22} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-[#3E9BFF]">
                    <Swords size={13} />
                    <span>DIFFUSION COMMUNAUTAIRE</span>
                  </div>
                  <h3 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white">
                    PARTAGER LE TOURNOI
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSharingTournament(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tournament Preview Card */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <img
                src={sharingTournament.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80"}
                alt={sharingTournament.title}
                className="h-20 w-24 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <span className="inline-block rounded-md bg-[#3E9BFF]/20 px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold text-[#3E9BFF]">
                  {sharingTournament.game} • {sharingTournament.platform}
                </span>
                <h4 className="font-['Orbitron'] text-sm font-bold text-white truncate">
                  {sharingTournament.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-['JetBrains_Mono'] text-slate-300">
                  <span className="text-emerald-400 font-bold">{sharingTournament.date}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-amber-400 font-bold">Prize: {sharingTournament.cashPrize}</span>
                </div>
              </div>
            </div>

            {/* Direct Link Section */}
            <div className="space-y-2">
              <label className="flex items-center justify-between font-['JetBrains_Mono'] text-xs font-bold text-slate-300">
                <span>Lien direct vers la rubrique E-Sport & ce tournoi :</span>
                {copiedShareUrl && (
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                    <Check size={12} /> Copié dans le presse-papiers !
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    readOnly
                    value={getTournamentShareUrl(sharingTournament.id)}
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2.5 font-['JetBrains_Mono'] text-xs text-slate-200 select-all focus:border-[#3E9BFF] focus:outline-none"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyTournamentLink(sharingTournament)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold transition active:scale-95 shrink-0 ${
                    copiedShareUrl
                      ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      : "bg-[#3E9BFF] text-white hover:bg-[#3282db] shadow-[0_0_15px_rgba(62,155,255,0.4)]"
                  }`}
                >
                  {copiedShareUrl ? (
                    <>
                      <Check size={14} />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              <p className="font-['Chakra_Petch'] text-[11px] text-slate-400">
                Ce lien permet à la communauté d'arriver directement dans l'onglet E-Sport et de visualiser immédiatement ce tournoi sélectionné pour s'inscrire en quelques secondes.
              </p>
            </div>

            {/* Social Share Buttons */}
            <div className="space-y-3">
              <div className="font-['Orbitron'] text-xs font-bold text-slate-300">
                PARTAGE RAPIDE EN 1 CLIC :
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `🏆 *HOUSE GAME ESPORT - REJOINS LE TOURNOI !*\n\n🎮 *${sharingTournament.title}*\n🎮 Jeu : ${sharingTournament.game} (${sharingTournament.platform})\n💰 Cash Prize Garanti : *${sharingTournament.cashPrize}*\n📅 Date : ${sharingTournament.date} (${sharingTournament.time})\n📍 Lieu : ${sharingTournament.location}\n🎟️ Inscription : ${sharingTournament.entryFee}\n\n👉 *Rejoins la compétition et réserve ta place directement ici :*\n${getTournamentShareUrl(sharingTournament.id)}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 hover:bg-[#25D366]/30 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-[#25D366] transition active:scale-95 shadow-sm"
                >
                  <Phone size={14} />
                  <span>Partager sur WhatsApp</span>
                </a>

                {/* Native Device Share */}
                <button
                  type="button"
                  onClick={() => handleNativeShare(sharingTournament)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white transition active:scale-95"
                >
                  <Share2 size={14} className="text-[#3E9BFF]" />
                  <span>Menu partage appareil</span>
                </button>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getTournamentShareUrl(sharingTournament.id))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/40 hover:bg-[#1877F2]/30 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-[#1877F2] transition active:scale-95"
                >
                  <ExternalLink size={14} />
                  <span>Partager sur Facebook</span>
                </a>

                {/* X / Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `🏆 Rejoins le tournoi officiel ${sharingTournament.title} sur HOUSE GAME ESPORT ! Cash prize: ${sharingTournament.cashPrize} 🔥`
                  )}&url=${encodeURIComponent(getTournamentShareUrl(sharingTournament.id))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-slate-200 transition active:scale-95"
                >
                  <ExternalLink size={14} />
                  <span>Partager sur X / Twitter</span>
                </a>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode size={16} className="text-emerald-400" />
                  <span className="font-['Orbitron'] text-xs font-bold text-white">
                    QR CODE OFFICIEL DU TOURNOI
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-emerald-400 font-bold">
                  Accès instantané
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-emerald-500/40 bg-[#0A0D14] p-2 shadow-inner shrink-0">
                  <img
                    src={generateSvgQrDataUri(getTournamentShareUrl(sharingTournament.id))}
                    alt="QR Code du tournoi"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="text-left space-y-2 text-xs font-['Chakra_Petch'] text-slate-300">
                  <p>
                    Vos joueurs peuvent scanner ce QR code avec l'appareil photo de leur téléphone pour atterrir directement sur ce tournoi dans HOUSE GAME ESPORT.
                  </p>
                  <p className="text-[11px] font-['JetBrains_Mono'] text-emerald-400">
                    Idéal pour vos affiches physiques, projections en salle et story WhatsApp / Instagram.
                  </p>
                </div>
              </div>
            </div>

            {/* Close footer */}
            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSharingTournament(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 font-['JetBrains_Mono'] text-xs font-bold text-white transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : PERSONNALISATION BANNIÈRE & LOGO ESPORT                           */}
      {/* ========================================================================= */}
      {isBannerModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsBannerModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-emerald-500/40 bg-[#0E131E] p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white">
                    PERSONNALISATION BANNIÈRE & LOGO ESPORT
                  </h3>
                  <p className="font-['Chakra_Petch'] text-xs text-slate-400">
                    Définissez le logo officiel et l'arrière-plan visuel de votre arène E-Sport.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBannerModal} className="space-y-6">
              {/* SECTION 1: LOGO ESPORT */}
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera size={16} className="text-emerald-400" />
                    <label className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white">
                      1. LOGO OFFICIEL HOUSE GAME ESPORT
                    </label>
                  </div>
                  {modalLogo && (
                    <button
                      type="button"
                      onClick={() => setModalLogo("")}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-['JetBrains_Mono'] underline"
                    >
                      Supprimer le logo personnalisé
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Logo Preview */}
                  <div className="relative flex aspect-square sm:aspect-auto sm:h-36 items-center justify-center rounded-xl border border-dashed border-emerald-500/40 bg-black/40 p-4">
                    {modalLogo ? (
                      <div className="flex flex-col items-center justify-center">
                        <img
                          src={modalLogo}
                          alt="Aperçu logo"
                          className="max-h-24 max-w-full object-contain drop-shadow-[0_0_15px_rgba(0,255,136,0.4)]"
                        />
                        <span className="mt-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-['Orbitron'] font-bold text-emerald-300">
                          ✓ Logo actif
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <HouseGameLogo size={60} showSlogan={false} className="opacity-70" />
                        <span className="mt-1 font-['JetBrains_Mono'] text-[10px] text-slate-400">
                          Logo par défaut (House Game)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-2 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-md transition active:scale-95"
                    >
                      <FolderOpen size={14} />
                      <span>{modalLogo ? "Changer le fichier logo" : "Choisir un logo sur mon ordinateur"}</span>
                    </button>
                    <p className="font-['Chakra_Petch'] text-[11px] text-slate-400">
                      Recommandé : image avec fond transparent (PNG, SVG ou WebP), résolution minimum 300 x 300 px. Le logo apparaîtra sur la bannière et sur les cartes de licences des joueurs.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: FOND DE BANNIÈRE */}
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#3E9BFF]" />
                    <label className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white">
                      2. IMAGE D'ARRIÈRE-PLAN DE LA BANNIÈRE (FACULTATIF)
                    </label>
                  </div>
                  {modalBg && (
                    <button
                      type="button"
                      onClick={() => setModalBg("")}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-['JetBrains_Mono'] underline"
                    >
                      Retirer le fond personnalisé
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Bg Preview */}
                  <div className="relative aspect-video sm:h-28 overflow-hidden rounded-xl border border-dashed border-[#3E9BFF]/40 bg-black/40">
                    {modalBg ? (
                      <img src={modalBg} alt="Fond bannière" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-['JetBrains_Mono'] text-[10px] text-slate-400 text-center p-2">
                        Style Cyber Neon sombre par défaut
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-2 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => bannerBgInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#3E9BFF]/40 bg-[#3E9BFF]/10 hover:bg-[#3E9BFF]/20 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] transition active:scale-95"
                    >
                      <Upload size={14} />
                      <span>{modalBg ? "Remplacer l'image de fond" : "Importer une image de fond locale"}</span>
                    </button>
                    <p className="font-['Chakra_Petch'] text-[11px] text-slate-400">
                      Recommandé : 1920 x 600 px ou 16:9 (JPG, WebP). Un filtre sombre cyberpunk est automatiquement appliqué pour garantir une lisibilité parfaite des textes.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: TEXTES DE LA BANNIÈRE */}
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <label className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white block">
                  3. TEXTES & TITRES DE LA BANNIÈRE
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-['JetBrains_Mono'] text-xs">
                  <div>
                    <span className="block text-slate-400 mb-1">Badge d'en-tête :</span>
                    <input
                      type="text"
                      value={modalBadge}
                      onChange={(e) => setModalBadge(e.target.value)}
                      placeholder="Ex: CIRCUIT OFFICIEL HOUSE GAME ESPORT"
                      className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <span className="block text-slate-400 mb-1">Sous-titre / Marque :</span>
                    <input
                      type="text"
                      value={modalSubtitle}
                      onChange={(e) => setModalSubtitle(e.target.value)}
                      placeholder="Ex: HOUSE GAME ESPORT"
                      className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="font-['JetBrains_Mono'] text-xs">
                  <span className="block text-slate-400 mb-1">Grand Titre principal :</span>
                  <input
                    type="text"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder="Ex: ARÈNE OFFICIELLE, TOURNOIS & CASH PRIZES"
                    className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 text-white font-['Orbitron'] font-bold focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="font-['JetBrains_Mono'] text-xs">
                  <span className="block text-slate-400 mb-1">Description / Présentation :</span>
                  <textarea
                    value={modalDesc}
                    onChange={(e) => setModalDesc(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={handleResetBanner}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-2 font-['JetBrains_Mono'] text-xs text-rose-300 transition"
                >
                  <RotateCcw size={13} />
                  <span>Réinitialiser par défaut</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(false)}
                    className="rounded-xl px-4 py-2 font-['JetBrains_Mono'] text-xs text-slate-400 hover:text-white transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-6 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] transition active:scale-95"
                  >
                    <Check size={14} />
                    <span>Enregistrer la bannière</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL : CONFIRMATION SUPPRESSION LICENCE                                  */}
      {/* ========================================================================= */}
      {licenseToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setLicenseToDelete(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-3xl border border-rose-500/40 bg-[#0E131E] p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-400">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-['Orbitron'] text-base font-bold text-white">
                  SUPPRIMER LA LICENCE
                </h3>
                <p className="font-['JetBrains_Mono'] text-xs text-rose-400 font-bold">
                  {licenseToDelete.id}
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs font-['JetBrains_Mono']">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Joueur :</span>
                <strong className="text-white">{licenseToDelete.gamerTag}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Nom complet :</span>
                <span className="text-slate-200">{licenseToDelete.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Statut :</span>
                <span className="text-emerald-400 font-bold">{licenseToDelete.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Date d'émission :</span>
                <span className="text-slate-300">{licenseToDelete.issuedAt}</span>
              </div>
            </div>

            <p className="font-['Chakra_Petch'] text-xs text-slate-300 leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement cette carte de licence numérique ?
              Son certificat officiel sera annulé et la carte sera retirée de l'annuaire public.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLicenseToDelete(null)}
                className="rounded-xl px-4 py-2 font-['JetBrains_Mono'] text-xs text-slate-400 hover:text-white transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLicense}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] transition active:scale-95"
              >
                <Trash2 size={13} />
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Tournament,
  EsportRegistration,
  CompetitionRanking,
  CompetitionRankingEntry,
  RankingResultEvent,
  ScoringRule,
  EsportAuditLog,
} from "../types";
import {
  Trophy,
  Crown,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  FileSpreadsheet,
  Globe,
  EyeOff,
  Save,
  AlertTriangle,
  UserPlus,
  Users,
  Sliders,
  History,
  CheckCircle2,
  XCircle,
  Filter,
  Award,
  RefreshCw,
  Equal,
} from "lucide-react";
import {
  DEFAULT_SCORING_RULE,
  getNormalizedScoringRule,
  createBaseRankingForTournament,
  recomputeCompetitionRanking,
  recordPlayerMatchResult,
  updatePlayerMatchResult,
  deletePlayerMatchResult,
  initializeRegisteredPlayersInRanking,
  removePlayerFromRanking,
  exportCompetitionRankingCsv,
} from "../services/esportService";
import { sfx } from "../services/soundEffects";

interface EsportAutoRankingsAdminProps {
  tournaments: Tournament[];
  registrations: EsportRegistration[];
  rankings: CompetitionRanking[];
  selectedTournamentId?: string;
  onSelectTournamentId?: (id: string) => void;
  onSaveRanking: (ranking: CompetitionRanking) => Promise<void> | void;
  onDeleteRanking: (tournamentId: string) => Promise<void> | void;
  onAuditLog: (log: EsportAuditLog) => void;
  onToast: (msg: string) => void;
}

export const EsportAutoRankingsAdmin: React.FC<EsportAutoRankingsAdminProps> = ({
  tournaments,
  registrations,
  rankings,
  selectedTournamentId: propSelectedTournamentId,
  onSelectTournamentId,
  onSaveRanking,
  onDeleteRanking,
  onAuditLog,
  onToast,
}) => {
  // Game Categories extracted cleanly from existing competitions
  const categories = useMemo(() => {
    const set = new Set<string>();
    tournaments.forEach((t) => {
      const cat = (t.gameCategory || t.game || "").trim();
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [tournaments]);

  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");

  const filteredTournaments = useMemo(() => {
    if (selectedCategory === "Toutes") return tournaments;
    return tournaments.filter(
      (t) =>
        (t.gameCategory || t.game || "").trim().toLowerCase() ===
        selectedCategory.trim().toLowerCase()
    );
  }, [tournaments, selectedCategory]);

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    propSelectedTournamentId || tournaments[0]?.id || ""
  );

  // Sync external tournament selection (e.g. clicking "Gérer classement" on a tournament card)
  useEffect(() => {
    if (propSelectedTournamentId && tournaments.some((t) => t.id === propSelectedTournamentId)) {
      setSelectedTournamentId(propSelectedTournamentId);
      const t = tournaments.find((item) => item.id === propSelectedTournamentId);
      const cat = (t?.gameCategory || t?.game || "").trim();
      if (cat && selectedCategory !== "Toutes" && cat.toLowerCase() !== selectedCategory.toLowerCase()) {
        setSelectedCategory("Toutes");
      }
    }
  }, [propSelectedTournamentId, tournaments, selectedCategory]);

  useEffect(() => {
    if (
      filteredTournaments.length > 0 &&
      (!selectedTournamentId || !filteredTournaments.some((t) => t.id === selectedTournamentId))
    ) {
      setSelectedTournamentId(filteredTournaments[0].id);
    }
  }, [filteredTournaments, selectedTournamentId]);

  const activeTournament = useMemo(
    () =>
      filteredTournaments.find((t) => t.id === selectedTournamentId) ||
      filteredTournaments[0] ||
      tournaments[0] ||
      null,
    [filteredTournaments, tournaments, selectedTournamentId]
  );

  const activeRankingRaw = useMemo(() => {
    if (!activeTournament) return null;
    return rankings.find((r) => r.tournamentId === activeTournament.id) || null;
  }, [rankings, activeTournament]);

  const activeRule: ScoringRule = useMemo(
    () => getNormalizedScoringRule(activeRankingRaw?.scoringRule),
    [activeRankingRaw]
  );

  const computedRanking = useMemo(() => {
    if (!activeTournament) return null;
    if (!activeRankingRaw) return null;
    return recomputeCompetitionRanking(activeRankingRaw);
  }, [activeTournament, activeRankingRaw]);

  const entries: CompetitionRankingEntry[] = useMemo(
    () => computedRanking?.entries || [],
    [computedRanking]
  );

  const matchHistory: RankingResultEvent[] = useMemo(
    () => computedRanking?.matchHistory || [],
    [computedRanking]
  );

  // Registered eligible players for active competition
  const tournamentPlayers = useMemo(() => {
    if (!activeTournament) return [];
    const seenTags = new Set<string>();
    return registrations
      .filter(
        (r) =>
          r.tournamentId === activeTournament.id &&
          r.status !== "refusée" &&
          r.status !== "annulée"
      )
      .sort((a, b) => (a.status === "validée" ? -1 : 1) - (b.status === "validée" ? -1 : 1))
      .filter((r) => {
        const key = (r.gamerTag || "").trim().toLowerCase();
        if (!key || seenTags.has(key)) return false;
        seenTags.add(key);
        return true;
      });
  }, [registrations, activeTournament]);

  const uninitializedPlayersCount = useMemo(() => {
    const rankedTags = new Set(entries.map((e) => e.gamerTag.trim().toLowerCase()));
    return tournamentPlayers.filter(
      (p) => !rankedTags.has((p.gamerTag || "").trim().toLowerCase())
    ).length;
  }, [tournamentPlayers, entries]);

  // Scoring Rule Form State
  const [winPointsInput, setWinPointsInput] = useState<string>(String(DEFAULT_SCORING_RULE.winPoints));
  const [drawPointsInput, setDrawPointsInput] = useState<string>(String(DEFAULT_SCORING_RULE.drawPoints));
  const [lossPointsInput, setLossPointsInput] = useState<string>(String(DEFAULT_SCORING_RULE.lossPoints));

  // Quick Result Recording Form State
  const [selectedRegId, setSelectedRegId] = useState<string>("");
  const [customPlayerTag, setCustomPlayerTag] = useState<string>("");
  const [customPlayerName, setCustomPlayerName] = useState<string>("");
  const [opponentTag, setOpponentTag] = useState<string>("");
  const [roundLabel, setRoundLabel] = useState<string>("");
  const [playerScoreInput, setPlayerScoreInput] = useState<string>("");
  const [opponentScoreInput, setOpponentScoreInput] = useState<string>("");

  // Anti-duplicate lock
  const [isSaving, setIsSaving] = useState(false);
  const lastSubmissionRef = useRef<{ signature: string; ts: number } | null>(null);

  // Reward Editor State (inline per player)
  const [editingRewardEntryId, setEditingRewardEntryId] = useState<string | null>(null);
  const [rewardInputValue, setRewardInputValue] = useState<string>("");

  // Player Removal Confirmation
  const [confirmRemoveTag, setConfirmRemoveTag] = useState<string | null>(null);

  // Match History Filter & Inline Edit/Delete State
  const [historyPlayerFilter, setHistoryPlayerFilter] = useState<string>("Tous");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editOutcome, setEditOutcome] = useState<"win" | "draw" | "loss">("win");
  const [editPlayerScore, setEditPlayerScore] = useState<string>("");
  const [editOpponentScore, setEditOpponentScore] = useState<string>("");
  const [editOpponentTag, setEditOpponentTag] = useState<string>("");
  const [editRoundLabel, setEditRoundLabel] = useState<string>("");
  const [confirmDeleteEventId, setConfirmDeleteEventId] = useState<string | null>(null);

  // Organizer Note & Entire Ranking Delete Confirmation
  const [competitionNote, setCompetitionNote] = useState<string>("");
  const [confirmDeleteRanking, setConfirmDeleteRanking] = useState(false);

  // Sync inputs when switching competition
  useEffect(() => {
    setWinPointsInput(String(activeRule.winPoints));
    setDrawPointsInput(String(activeRule.drawPoints));
    setLossPointsInput(String(activeRule.lossPoints));
    setCompetitionNote(activeRankingRaw?.notes || "");
  }, [
    activeTournament?.id,
    activeRule.winPoints,
    activeRule.drawPoints,
    activeRule.lossPoints,
    activeRankingRaw?.notes,
  ]);

  useEffect(() => {
    setSelectedRegId("");
    setCustomPlayerTag("");
    setCustomPlayerName("");
    setOpponentTag("");
    setRoundLabel("");
    setPlayerScoreInput("");
    setOpponentScoreInput("");
    setEditingRewardEntryId(null);
    setConfirmRemoveTag(null);
    setHistoryPlayerFilter("Tous");
    setEditingEventId(null);
    setConfirmDeleteEventId(null);
  }, [activeTournament?.id]);

  // Helper to obtain the working base CompetitionRanking
  const getWorkingBase = (): CompetitionRanking => {
    if (!activeTournament) throw new Error("Aucune compétition sélectionnée.");
    return createBaseRankingForTournament(activeTournament, activeRankingRaw);
  };

  // 1. Save Configurable Scoring Rule & Recalculate immediately
  const handleSaveScoringRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTournament || isSaving) return;

    const winPts = Number(winPointsInput);
    const drawPts = Number(drawPointsInput);
    const lossPts = Number(lossPointsInput);
    if (!Number.isFinite(winPts) || !Number.isFinite(drawPts) || !Number.isFinite(lossPts)) {
      sfx.playError();
      onToast("Veuillez saisir des valeurs numériques valides pour le barème.");
      return;
    }

    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const updated = recomputeCompetitionRanking(base, {
        winPoints: winPts,
        drawPoints: drawPts,
        lossPoints: lossPts,
      });
      await onSaveRanking(updated);

      onAuditLog({
        id: `log-${Date.now()}`,
        action: "Mise à jour du barème de points",
        actor: "Direction Esport HG",
        targetId: activeTournament.id,
        targetType: "tournoi",
        details: `Barème « ${activeTournament.title} » configuré : Victoire = ${winPts} pts, Nul = ${drawPts} pt(s), Défaite = ${lossPts} pt(s). Classement recalculé.`,
        timestamp: Date.now(),
      });

      sfx.playSuccess();
      onToast(`Barème appliqué (${winPts}V / ${drawPts}N / ${lossPts}D) et classement recalculé !`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyStandardScoringRule = async () => {
    if (!activeTournament || isSaving) return;
    setWinPointsInput(String(DEFAULT_SCORING_RULE.winPoints));
    setDrawPointsInput(String(DEFAULT_SCORING_RULE.drawPoints));
    setLossPointsInput(String(DEFAULT_SCORING_RULE.lossPoints));
    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const updated = recomputeCompetitionRanking(base, {
        ...DEFAULT_SCORING_RULE,
      });
      await onSaveRanking(updated);

      onAuditLog({
        id: `log-${Date.now()}`,
        action: "Réinitialisation barème standard (3 / 1 / 0)",
        actor: "Direction Esport HG",
        targetId: activeTournament.id,
        targetType: "tournoi",
        details: `Barème « ${activeTournament.title} » réinitialisé : Victoire = 3 pts, Nul = 1 pt, Défaite = 0 pt.`,
        timestamp: Date.now(),
      });

      sfx.playSuccess();
      onToast("Barème officiel (Victoire = 3 • Nul = 1 • Défaite = 0) appliqué et recalculé !");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Initialize all registered players (0V / 0D) into the ranking
  const handleInitRegisteredPlayers = async () => {
    if (!activeTournament || isSaving) return;
    if (tournamentPlayers.length === 0) {
      sfx.playError();
      onToast("Aucun joueur inscrit sur cette compétition pour le moment.");
      return;
    }

    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const { ranking, addedCount } = initializeRegisteredPlayersInRanking(base, registrations);
      if (addedCount === 0) {
        sfx.playClick();
        onToast("Tous les joueurs inscrits figurent déjà dans ce classement.");
        return;
      }

      await onSaveRanking(ranking);
      sfx.playSuccess();
      onToast(`${addedCount} joueur${addedCount > 1 ? "s" : ""} inscrit${addedCount > 1 ? "s" : ""} chargé${addedCount > 1 ? "s" : ""} (0V / 0N / 0D) !`);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Record Win / Draw / Loss from Form
  const handleRecordResult = async (outcome: "win" | "draw" | "loss") => {
    if (!activeTournament || isSaving) return;

    const reg = tournamentPlayers.find((r) => r.id === selectedRegId);
    const gamerTag = (reg ? reg.gamerTag : customPlayerTag).trim();
    const fullName = (reg ? reg.fullName : customPlayerName).trim() || undefined;
    const playerId = reg?.playerId;

    if (!gamerTag) {
      sfx.playError();
      onToast("Sélectionnez un joueur inscrit ou saisissez son pseudo.");
      return;
    }

    const pScore =
      playerScoreInput.trim() !== "" && Number.isFinite(Number(playerScoreInput))
        ? Number(playerScoreInput)
        : undefined;
    const oScore =
      opponentScoreInput.trim() !== "" && Number.isFinite(Number(opponentScoreInput))
        ? Number(opponentScoreInput)
        : undefined;

    if ((pScore !== undefined && oScore === undefined) || (pScore === undefined && oScore !== undefined)) {
      sfx.playError();
      onToast("Saisissez les deux scores (Joueur et Adversaire) ou laissez les deux champs vides.");
      return;
    }

    // Prevent accidental double-click duplicate within 2.5 seconds
    const signature = `${activeTournament.id}|${gamerTag.toLowerCase()}|${outcome}|${pScore ?? ""}|${oScore ?? ""}|${opponentTag.trim().toLowerCase()}`;
    const now = Date.now();
    if (
      lastSubmissionRef.current &&
      lastSubmissionRef.current.signature === signature &&
      now - lastSubmissionRef.current.ts < 2500
    ) {
      sfx.playError();
      onToast("Résultat déjà enregistré il y a moins de 2 secondes (protection anti-doublon).");
      return;
    }

    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const updated = recordPlayerMatchResult(base, {
        playerId,
        gamerTag,
        fullName,
        outcome,
        playerScore: pScore,
        opponentScore: oScore,
        opponentTag: opponentTag.trim() || undefined,
        roundLabel: roundLabel.trim() || undefined,
      });

      await onSaveRanking(updated);
      lastSubmissionRef.current = { signature, ts: now };

      const updatedEntry = updated.entries.find(
        (e) => e.gamerTag.trim().toLowerCase() === gamerTag.toLowerCase()
      );
      const ptsAdded =
        outcome === "win"
          ? updated.scoringRule?.winPoints ?? DEFAULT_SCORING_RULE.winPoints
          : outcome === "draw"
          ? updated.scoringRule?.drawPoints ?? DEFAULT_SCORING_RULE.drawPoints
          : updated.scoringRule?.lossPoints ?? DEFAULT_SCORING_RULE.lossPoints;

      const outcomeLabel =
        outcome === "win" ? "Victoire" : outcome === "draw" ? "Match nul" : "Défaite";

      sfx.playSuccess();
      setPlayerScoreInput("");
      setOpponentScoreInput("");
      setOpponentTag("");

      onToast(
        `${outcomeLabel} enregistré${outcome === "draw" ? "" : "e"} pour ${gamerTag} (${ptsAdded >= 0 ? `+${ptsAdded}` : ptsAdded} pts) — Rang actuel : #${updatedEntry?.position ?? "-"} !`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Quick +1 Win, +1 Draw or +1 Loss directly on a row in the standings table
  const handleQuickRowResult = async (entry: CompetitionRankingEntry, outcome: "win" | "draw" | "loss") => {
    if (!activeTournament || isSaving) return;

    const signature = `${activeTournament.id}|quick|${entry.gamerTag.toLowerCase()}|${outcome}`;
    const now = Date.now();
    if (
      lastSubmissionRef.current &&
      lastSubmissionRef.current.signature === signature &&
      now - lastSubmissionRef.current.ts < 900
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const updated = recordPlayerMatchResult(base, {
        playerId: entry.playerId,
        gamerTag: entry.gamerTag,
        fullName: entry.fullName,
        outcome,
      });
      await onSaveRanking(updated);
      lastSubmissionRef.current = { signature, ts: now };

      const nextEntry = updated.entries.find(
        (e) => e.gamerTag.trim().toLowerCase() === entry.gamerTag.trim().toLowerCase()
      );
      const quickLabel =
        outcome === "win" ? "+1 Victoire" : outcome === "draw" ? "+1 Match nul" : "+1 Défaite";
      sfx.playSuccess();
      onToast(
        `${quickLabel} pour ${entry.gamerTag} → ${nextEntry?.points ?? 0} pts (#${nextEntry?.position ?? "-"})`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Edit optional reward on a player row
  const handleSaveReward = async (entryId: string) => {
    if (!activeTournament || isSaving) return;
    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const updatedEntries = base.entries.map((item) =>
        item.id === entryId ? { ...item, reward: rewardInputValue.trim() || undefined } : item
      );
      const updated = recomputeCompetitionRanking({
        ...base,
        entries: updatedEntries,
      });
      await onSaveRanking(updated);
      setEditingRewardEntryId(null);
      setRewardInputValue("");
      sfx.playSuccess();
      onToast("Récompense mise à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  // Remove player completely from ranking & match history
  const handleConfirmRemovePlayer = async (gamerTag: string) => {
    if (!activeTournament || isSaving) return;
    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const updated = removePlayerFromRanking(base, gamerTag);
      await onSaveRanking(updated);
      setConfirmRemoveTag(null);
      sfx.playClick();
      onToast(`${gamerTag} retiré de ce classement.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Start editing a match result event in history
  const handleStartEditEvent = (ev: RankingResultEvent) => {
    sfx.playClick();
    setEditingEventId(ev.id);
    setEditOutcome(ev.outcome);
    setEditPlayerScore(ev.playerScore !== undefined ? String(ev.playerScore) : "");
    setEditOpponentScore(ev.opponentScore !== undefined ? String(ev.opponentScore) : "");
    setEditOpponentTag(ev.opponentTag || "");
    setEditRoundLabel(ev.roundLabel || "");
    setConfirmDeleteEventId(null);
  };

  // Save corrected match result event & recalculate
  const handleSaveEditedEvent = async (eventId: string) => {
    if (!activeTournament || isSaving) return;
    const pScore =
      editPlayerScore.trim() !== "" && Number.isFinite(Number(editPlayerScore))
        ? Number(editPlayerScore)
        : undefined;
    const oScore =
      editOpponentScore.trim() !== "" && Number.isFinite(Number(editOpponentScore))
        ? Number(editOpponentScore)
        : undefined;

    if ((pScore !== undefined && oScore === undefined) || (pScore === undefined && oScore !== undefined)) {
      sfx.playError();
      onToast("Indiquez les deux scores ou laissez les deux champs vides.");
      return;
    }

    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const updated = updatePlayerMatchResult(base, eventId, {
        outcome: editOutcome,
        playerScore: pScore,
        opponentScore: oScore,
        opponentTag: editOpponentTag.trim() || undefined,
        roundLabel: editRoundLabel.trim() || undefined,
      });
      await onSaveRanking(updated);
      setEditingEventId(null);
      sfx.playSuccess();
      onToast("Résultat corrigé et classement recalculé automatiquement !");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete / Cancel a match result event & recalculate
  const handleDeleteEvent = async (eventId: string) => {
    if (!activeTournament || isSaving) return;
    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const updated = deletePlayerMatchResult(base, eventId);
      await onSaveRanking(updated);
      setConfirmDeleteEventId(null);
      sfx.playClick();
      onToast("Résultat annulé et classement recalculé.");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Public Visibility
  const handleTogglePublish = async (publish: boolean) => {
    if (!activeTournament || isSaving) return;
    if (publish && entries.length === 0) {
      sfx.playError();
      onToast("Ajoutez ou chargez au moins 1 joueur avant de publier.");
      return;
    }
    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const updated = recomputeCompetitionRanking({
        ...base,
        isPublished: publish,
        publishedAt: publish ? base.publishedAt || Date.now() : base.publishedAt,
        notes: competitionNote.trim() || undefined,
      });
      await onSaveRanking(updated);

      onAuditLog({
        id: `log-${Date.now()}`,
        action: publish ? "Publication classement officiel" : "Masquage classement (Brouillon)",
        actor: "Direction Esport HG",
        targetId: activeTournament.id,
        targetType: "tournoi",
        details: publish
          ? `Classement « ${activeTournament.title} » visible publiquement (${entries.length} joueur(s)).`
          : `Classement « ${activeTournament.title} » passé en brouillon privé.`,
        timestamp: Date.now(),
      });

      sfx.playSuccess();
      onToast(
        publish
          ? `Classement de « ${activeTournament.title} » publié en temps réel !`
          : "Classement masqué au public (mode brouillon)."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNoteOnly = async () => {
    if (!activeTournament || isSaving) return;
    setIsSaving(true);
    try {
      const base = getWorkingBase();
      const updated = recomputeCompetitionRanking({
        ...base,
        notes: competitionNote.trim() || undefined,
      });
      await onSaveRanking(updated);
      sfx.playSuccess();
      onToast("Remarque officielle enregistrée.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDeleteEntireRanking = async () => {
    if (!activeTournament || isSaving) return;
    setIsSaving(true);
    try {
      await onDeleteRanking(activeTournament.id);
      onAuditLog({
        id: `log-${Date.now()}`,
        action: "Réinitialisation classement compétition",
        actor: "Direction Esport HG",
        targetId: activeTournament.id,
        targetType: "tournoi",
        details: `Classement et historique supprimés pour « ${activeTournament.title} ».`,
        timestamp: Date.now(),
      });
      setConfirmDeleteRanking(false);
      sfx.playClick();
      onToast("Classement supprimé avec succès.");
    } finally {
      setIsSaving(false);
    }
  };

  const historyPlayerNames = useMemo(() => {
    const names = new Set<string>();
    matchHistory.forEach((ev) => names.add(ev.gamerTag));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "fr"));
  }, [matchHistory]);

  const filteredHistory = useMemo(() => {
    if (historyPlayerFilter === "Tous") return matchHistory;
    return matchHistory.filter(
      (ev) => ev.gamerTag.toLowerCase() === historyPlayerFilter.toLowerCase()
    );
  }, [matchHistory, historyPlayerFilter]);

  if (tournaments.length === 0) {
    return (
      <div
        id="esport-auto-rankings-admin"
        className="rounded-3xl border border-white/10 bg-[#0E121B] p-6 shadow-xl space-y-3"
      >
        <div className="flex items-center gap-2.5">
          <Crown size={18} className="text-amber-400" />
          <h3 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white">
            CLASSEMENTS AUTOMATIQUES PAR COMPÉTITION
          </h3>
        </div>
        <p className="font-['Chakra_Petch'] text-xs text-slate-400">
          Créez d'abord une compétition pour configurer son barème de points et enregistrer les victoires, matchs nuls et défaites des joueurs.
        </p>
      </div>
    );
  }

  return (
    <div
      id="esport-auto-rankings-admin"
      className="rounded-3xl border border-amber-500/30 bg-[#0E121B] p-5 sm:p-6 shadow-xl space-y-6"
    >
      {/* Header + Publication Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-['JetBrains_Mono'] font-bold text-amber-400">
            <Crown size={15} />
            <span>CLASSEMENT AUTOMATIQUE & CALCUL EN TEMPS RÉEL</span>
          </div>
          <h3 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white">
            GESTION DES RÉSULTATS & STATISTIQUES JOUEURS
          </h3>
          <p className="font-['Chakra_Petch'] text-xs text-slate-400">
            Saisissez uniquement les victoires, matchs nuls et défaites de chaque joueur : les points, matchs joués, différences et rangs se calculent automatiquement par catégorie.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {entries.length > 0 && computedRanking && (
            <button
              type="button"
              onClick={() => exportCompetitionRankingCsv(computedRanking)}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-slate-200 transition cursor-pointer"
            >
              <FileSpreadsheet size={13} className="text-emerald-400" />
              <span>Export CSV</span>
            </button>
          )}

          {activeRankingRaw?.isPublished ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleTogglePublish(false)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-amber-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <EyeOff size={13} />
              <span>Masquer (Brouillon)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTogglePublish(true)}
              disabled={entries.length === 0 || isSaving}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] transition active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Globe size={13} />
              <span>Publier en direct</span>
            </button>
          )}

          {activeRankingRaw && (
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setConfirmDeleteRanking(true);
              }}
              title="Réinitialiser / Supprimer ce classement"
              className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 font-['JetBrains_Mono'] text-xs font-bold text-rose-300 transition cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Step 1: Category Filter + Competition Selector */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="font-['JetBrains_Mono'] text-xs font-bold text-slate-300 flex items-center gap-2">
            <Filter size={13} className="text-[#3E9BFF]" />
            <span>1. CATÉGORIE & COMPÉTITION INDÉPENDANTE :</span>
          </label>
          {activeRankingRaw ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-bold border ${
                activeRankingRaw.isPublished
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/15 text-amber-300"
              }`}
            >
              {activeRankingRaw.isPublished ? (
                <>
                  <Globe size={12} />
                  <span>
                    EN LIGNE • {entries.length} joueur{entries.length > 1 ? "s" : ""} • {matchHistory.length} résultat{matchHistory.length > 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                <>
                  <EyeOff size={12} />
                  <span>
                    BROUILLON • {entries.length} joueur{entries.length > 1 ? "s" : ""} • {matchHistory.length} résultat{matchHistory.length > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-['JetBrains_Mono'] text-[11px] text-slate-400">
              Aucun résultat saisi pour cette compétition
            </span>
          )}
        </div>

        {/* Category Filter Buttons */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setSelectedCategory("Toutes");
              }}
              className={`rounded-xl px-3 py-1.5 font-['JetBrains_Mono'] text-[11px] font-bold transition cursor-pointer ${
                selectedCategory === "Toutes"
                  ? "bg-[#3E9BFF] text-slate-950 shadow-[0_0_12px_rgba(62,155,255,0.4)]"
                  : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
              }`}
            >
              Toutes ({tournaments.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setSelectedCategory(cat);
                }}
                className={`rounded-xl px-3 py-1.5 font-['JetBrains_Mono'] text-[11px] font-bold transition cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-[#3E9BFF] text-slate-950 shadow-[0_0_12px_rgba(62,155,255,0.4)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Competition Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredTournaments.map((t) => {
            const rankDoc = rankings.find((r) => r.tournamentId === t.id);
            const isSelected = activeTournament?.id === t.id;
            const playerCount = rankDoc?.entries?.length || 0;
            const histCount = rankDoc?.matchHistory?.length || 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setSelectedTournamentId(t.id);
                  onSelectTournamentId?.(t.id);
                }}
                className={`text-left rounded-2xl border p-3 transition cursor-pointer ${
                  isSelected
                    ? "border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.18)]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block font-['JetBrains_Mono'] text-[10px] font-bold text-[#3E9BFF] truncate">
                      {t.gameCategory || t.game}
                    </span>
                    <strong className="block font-['Orbitron'] text-xs font-bold text-white truncate mt-0.5">
                      {t.title}
                    </strong>
                  </div>
                  {rankDoc?.isPublished ? (
                    <span className="shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-['JetBrains_Mono'] text-[9px] font-bold text-emerald-300">
                      {playerCount}J • {histCount}M
                    </span>
                  ) : playerCount > 0 ? (
                    <span className="shrink-0 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 font-['JetBrains_Mono'] text-[9px] font-bold text-amber-300">
                      BROUILLON ({playerCount})
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-white/5 border border-white/10 px-2 py-0.5 font-['JetBrains_Mono'] text-[9px] text-slate-400">
                      Nouveau
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Configurable Scoring Rule */}
      {activeTournament && (
        <form
          onSubmit={handleSaveScoringRule}
          className="rounded-2xl border border-[#3E9BFF]/30 bg-[#0A101C] p-4 sm:p-5 space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders size={15} className="text-[#3E9BFF]" />
              <span className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white">
                2. BARÈME DES POINTS — {activeTournament.gameCategory || activeTournament.game}
              </span>
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-slate-400">
              Ordre automatique : Points → Victoires → Différence → Matchs joués
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 font-['JetBrains_Mono'] text-xs">
            <div className="flex-1">
              <label className="block text-emerald-300 font-bold mb-1">
                Points par Victoire
              </label>
              <input
                type="number"
                step="any"
                required
                value={winPointsInput}
                onChange={(e) => setWinPointsInput(e.target.value)}
                className="w-full rounded-xl border border-emerald-500/30 bg-[#141824] px-3 py-2 font-['Orbitron'] font-bold text-emerald-300 focus:border-emerald-400 focus:outline-none tabular-nums"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sky-300 font-bold mb-1">
                Points par Nul
              </label>
              <input
                type="number"
                step="any"
                required
                value={drawPointsInput}
                onChange={(e) => setDrawPointsInput(e.target.value)}
                className="w-full rounded-xl border border-sky-500/30 bg-[#141824] px-3 py-2 font-['Orbitron'] font-bold text-sky-300 focus:border-sky-400 focus:outline-none tabular-nums"
              />
            </div>

            <div className="flex-1">
              <label className="block text-rose-300 font-bold mb-1">
                Points par Défaite
              </label>
              <input
                type="number"
                step="any"
                required
                value={lossPointsInput}
                onChange={(e) => setLossPointsInput(e.target.value)}
                className="w-full rounded-xl border border-rose-500/30 bg-[#141824] px-3 py-2 font-['Orbitron'] font-bold text-rose-300 focus:border-rose-400 focus:outline-none tabular-nums"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#3E9BFF] hover:bg-[#5aa9ff] px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-slate-950 transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <RefreshCw size={13} />
              <span>Appliquer & Recalculer</span>
            </button>

            {(activeRule.winPoints !== 3 ||
              activeRule.drawPoints !== 1 ||
              activeRule.lossPoints !== 0) && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleApplyStandardScoringRule}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 px-3.5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-amber-300 transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
              >
                <span>Standard (3 / 1 / 0)</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 font-['JetBrains_Mono'] text-[11px] text-slate-300">
            <span className="text-slate-400">Barème actif :</span>
            <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 font-bold">
              Victoire = {activeRule.winPoints} {Math.abs(activeRule.winPoints) > 1 ? "pts" : "pt"}
            </span>
            <span className="rounded-md bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-sky-300 font-bold">
              Nul = {activeRule.drawPoints} {Math.abs(activeRule.drawPoints) > 1 ? "pts" : "pt"}
            </span>
            <span className="rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-rose-300 font-bold">
              Défaite = {activeRule.lossPoints} {Math.abs(activeRule.lossPoints) > 1 ? "pts" : "pt"}
            </span>
          </div>
        </form>
      )}

      {/* Step 3: Quick Match Result Recorder */}
      {activeTournament && (
        <div className="rounded-2xl border border-emerald-500/30 bg-black/30 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserPlus size={15} className="text-emerald-400" />
              <span className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white">
                3. SAISIR UN RÉSULTAT DE MATCH
              </span>
            </div>

            {tournamentPlayers.length > 0 && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleInitRegisteredPlayers}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-emerald-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Users size={13} />
                <span>
                  {uninitializedPlayersCount > 0
                    ? `Charger ${uninitializedPlayersCount} inscrit(s) à 0V/0N/0D`
                    : `Tous les inscrits chargés (${tournamentPlayers.length})`}
                </span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-['JetBrains_Mono'] text-xs">
            {/* Registered player dropdown */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-bold mb-1">
                Joueur inscrit à « {activeTournament.title} » *
              </label>
              <select
                value={selectedRegId}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedRegId(val);
                  if (val) {
                    setCustomPlayerTag("");
                    setCustomPlayerName("");
                  }
                }}
                className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 font-['Orbitron'] text-xs font-bold text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="">
                  {tournamentPlayers.length > 0
                    ? "-- Choisir un joueur inscrit (ou saisir manuellement à droite) --"
                    : "-- Aucun inscrit : saisir le pseudo manuellement --"}
                </option>
                {tournamentPlayers.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.gamerTag} {reg.fullName ? `(${reg.fullName})` : ""} — [{reg.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Manual Pseudo fallback if not in registrations */}
            <div>
              <label className="block text-slate-400 mb-1">
                Ou pseudo libre {selectedRegId ? "(désactivé)" : "*"}
              </label>
              <input
                type="text"
                disabled={Boolean(selectedRegId)}
                value={customPlayerTag}
                onChange={(e) => setCustomPlayerTag(e.target.value)}
                placeholder="Ex: CamerStriker"
                className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 font-['Orbitron'] font-bold text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none disabled:opacity-40"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Nom complet (opt.)
              </label>
              <input
                type="text"
                disabled={Boolean(selectedRegId)}
                value={customPlayerName}
                onChange={(e) => setCustomPlayerName(e.target.value)}
                placeholder="Ex: Marc Noah"
                className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none disabled:opacity-40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-['JetBrains_Mono'] text-xs">
            <div>
              <label className="block text-slate-400 mb-1">
                Score du joueur (opt.)
              </label>
              <input
                type="number"
                step="1"
                value={playerScoreInput}
                onChange={(e) => setPlayerScoreInput(e.target.value)}
                placeholder="Ex: 3"
                className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 text-emerald-300 font-bold placeholder-slate-500 focus:border-emerald-400 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Score adversaire (opt.)
              </label>
              <input
                type="number"
                step="1"
                value={opponentScoreInput}
                onChange={(e) => setOpponentScoreInput(e.target.value)}
                placeholder="Ex: 1"
                className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 text-rose-300 font-bold placeholder-slate-500 focus:border-emerald-400 focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Adversaire (opt.)
              </label>
              <input
                type="text"
                value={opponentTag}
                onChange={(e) => setOpponentTag(e.target.value)}
                placeholder="Ex: ShadowAkwa"
                className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Phase / Match (opt.)
              </label>
              <input
                type="text"
                value={roundLabel}
                onChange={(e) => setRoundLabel(e.target.value)}
                placeholder="Ex: Match 2 / Finale"
                className="w-full rounded-xl border border-white/15 bg-[#141824] px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleRecordResult("win")}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>
                Enregistrer Victoire ({activeRule.winPoints >= 0 ? `+${activeRule.winPoints}` : activeRule.winPoints} pts)
              </span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleRecordResult("draw")}
              className="flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/25 px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-sky-200 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Equal size={15} />
              <span>
                Enregistrer Nul ({activeRule.drawPoints >= 0 ? `+${activeRule.drawPoints}` : activeRule.drawPoints} {Math.abs(activeRule.drawPoints) > 1 ? "pts" : "pt"})
              </span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleRecordResult("loss")}
              className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-rose-200 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <XCircle size={15} />
              <span>
                Enregistrer Défaite ({activeRule.lossPoints >= 0 ? `+${activeRule.lossPoints}` : activeRule.lossPoints} {Math.abs(activeRule.lossPoints) > 1 ? "pts" : "pt"})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Live Automatic Ranking Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Trophy size={15} className="text-amber-400" />
            <span>
              4. CLASSEMENT CALCULÉ AUTOMATIQUEMENT ({entries.length} joueur{entries.length > 1 ? "s" : ""})
            </span>
          </h4>
          <span className="font-['JetBrains_Mono'] text-[11px] text-slate-400">
            Actions rapides (+V / +N / +D) mettent à jour rangs et points en direct
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center space-y-2">
            <p className="font-['Orbitron'] text-sm font-bold text-white">
              Aucun joueur classé pour « {activeTournament?.title} »
            </p>
            <p className="font-['Chakra_Petch'] text-xs text-slate-400 max-w-md mx-auto">
              Enregistrez le premier résultat ci-dessus ou cliquez sur « Charger les joueurs inscrits » pour démarrer le classement automatique.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
            <table className="w-full text-left font-['JetBrains_Mono'] text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02]">
                  <th className="py-2.5 px-3">RANG</th>
                  <th className="py-2.5 px-3">JOUEUR</th>
                  <th className="py-2.5 px-3 text-center">MATCHS</th>
                  <th className="py-2.5 px-3 text-center">VICTOIRES</th>
                  <th className="py-2.5 px-3 text-center">NULS</th>
                  <th className="py-2.5 px-3 text-center">DÉFAITES</th>
                  <th className="py-2.5 px-3 text-center">DIFF.</th>
                  <th className="py-2.5 px-3 text-center">POINTS</th>
                  <th className="py-2.5 px-3">RÉCOMPENSE</th>
                  <th className="py-2.5 px-3 text-right">ACTIONS RAPIDES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {entries.map((entry) => {
                  const matches =
                    entry.matchesPlayed ??
                    ((entry.wins ?? 0) + (entry.draws ?? 0) + (entry.losses ?? 0));
                  const diff = entry.scoreDiff ?? 0;
                  const isEditingReward = editingRewardEntryId === entry.id;
                  const isConfirmingRemove = confirmRemoveTag === entry.gamerTag;

                  return (
                    <tr key={entry.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-3 font-['Orbitron'] font-black tabular-nums whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center rounded-lg px-2 py-1 text-xs ${
                            entry.position === 1
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                              : entry.position === 2
                              ? "bg-slate-300/20 text-slate-200 border border-slate-300/30"
                              : entry.position === 3
                              ? "bg-amber-700/25 text-amber-400 border border-amber-700/40"
                              : "bg-white/5 text-slate-300"
                          }`}
                        >
                          #{entry.position}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-['Orbitron'] font-bold text-white">{entry.gamerTag}</div>
                        {entry.fullName && (
                          <div className="text-[10px] text-slate-400">{entry.fullName}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center text-slate-300 tabular-nums font-bold">
                        {matches}
                      </td>

                      <td className="py-3 px-3 text-center text-emerald-400 font-bold tabular-nums">
                        {entry.wins ?? 0}
                      </td>

                      <td className="py-3 px-3 text-center text-sky-400 font-bold tabular-nums">
                        {entry.draws ?? 0}
                      </td>

                      <td className="py-3 px-3 text-center text-rose-400 font-bold tabular-nums">
                        {entry.losses ?? 0}
                      </td>

                      <td className="py-3 px-3 text-center tabular-nums">
                        <span
                          className={
                            diff > 0
                              ? "text-emerald-300 font-bold"
                              : diff < 0
                              ? "text-rose-300 font-bold"
                              : "text-slate-500"
                          }
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center tabular-nums">
                        <span className="inline-block rounded-lg bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 font-['Orbitron'] font-black text-amber-300">
                          {entry.points ?? 0}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {isEditingReward ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={rewardInputValue}
                              onChange={(e) => setRewardInputValue(e.target.value)}
                              placeholder="Ex: 100 000 FCFA"
                              className="w-32 rounded-lg border border-amber-400/50 bg-[#141824] px-2 py-1 text-[11px] text-amber-200 focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleSaveReward(entry.id)}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                              title="Enregistrer récompense"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRewardEntryId(null)}
                              className="p-1 rounded bg-white/10 text-slate-300 hover:bg-white/20 cursor-pointer"
                              title="Annuler"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              sfx.playClick();
                              setEditingRewardEntryId(entry.id);
                              setRewardInputValue(entry.reward || "");
                            }}
                            className="group inline-flex items-center gap-1 text-left cursor-pointer"
                            title="Définir ou modifier un lot / cash prize"
                          >
                            {entry.reward ? (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-300 group-hover:border-amber-400">
                                <Award size={11} />
                                <span>{entry.reward}</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 group-hover:text-amber-300 underline decoration-dotted">
                                + Lot (opt.)
                              </span>
                            )}
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {isConfirmingRemove ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleConfirmRemovePlayer(entry.gamerTag)}
                              className="rounded-lg bg-rose-600 hover:bg-rose-500 px-2 py-1 text-[10px] font-bold text-white cursor-pointer"
                            >
                              Confirmer
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveTag(null)}
                              className="rounded-lg border border-white/15 px-2 py-1 text-[10px] text-slate-300 hover:bg-white/10 cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleQuickRowResult(entry, "win")}
                              title={`Ajouter 1 Victoire (+${activeRule.winPoints} pts)`}
                              className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/30 px-2 py-1 text-[11px] font-bold text-emerald-300 transition active:scale-95 disabled:opacity-40 cursor-pointer"
                            >
                              +V
                            </button>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleQuickRowResult(entry, "draw")}
                              title={`Ajouter 1 Match nul (${activeRule.drawPoints >= 0 ? `+${activeRule.drawPoints}` : activeRule.drawPoints} ${Math.abs(activeRule.drawPoints) > 1 ? "pts" : "pt"})`}
                              className="rounded-lg border border-sky-500/40 bg-sky-500/15 hover:bg-sky-500/30 px-2 py-1 text-[11px] font-bold text-sky-300 transition active:scale-95 disabled:opacity-40 cursor-pointer"
                            >
                              +N
                            </button>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => handleQuickRowResult(entry, "loss")}
                              title={`Ajouter 1 Défaite (+${activeRule.lossPoints} pt)`}
                              className="rounded-lg border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/30 px-2 py-1 text-[11px] font-bold text-rose-300 transition active:scale-95 disabled:opacity-40 cursor-pointer"
                            >
                              +D
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRemoveTag(entry.gamerTag)}
                              title="Retirer ce joueur du classement"
                              className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-rose-300 hover:border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step 5: Match Results History (Audit / Correction / Deletion) */}
      {activeTournament && (
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <History size={15} className="text-[#3E9BFF]" />
              <h4 className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white">
                5. HISTORIQUE DES RÉSULTATS ({matchHistory.length})
              </h4>
            </div>

            {historyPlayerNames.length > 0 && (
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs">
                <span className="text-slate-400">Filtrer par joueur :</span>
                <select
                  value={historyPlayerFilter}
                  onChange={(e) => setHistoryPlayerFilter(e.target.value)}
                  className="rounded-lg border border-white/15 bg-[#141824] px-2.5 py-1 text-white focus:border-[#3E9BFF] focus:outline-none"
                >
                  <option value="Tous">Tous ({matchHistory.length})</option>
                  {historyPlayerNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {filteredHistory.length === 0 ? (
            <p className="font-['Chakra_Petch'] text-xs text-slate-400 py-2">
              Aucun résultat enregistré dans l'historique pour cette sélection. Chaque victoire, match nul ou défaite ajouté apparaîtra ici pour pouvoir être corrigé ou annulé à tout moment.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredHistory.map((ev) => {
                const isEditing = editingEventId === ev.id;
                const isConfirmDelete = confirmDeleteEventId === ev.id;

                return (
                  <div
                    key={ev.id}
                    className={`rounded-xl border p-3 font-['JetBrains_Mono'] text-xs transition ${
                      isEditing
                        ? "border-amber-400/50 bg-amber-500/[0.06]"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    {!isEditing ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              ev.outcome === "win"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : ev.outcome === "draw"
                                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                            }`}
                          >
                            {ev.outcome === "win" ? "VICTOIRE" : ev.outcome === "draw" ? "NUL" : "DÉFAITE"}
                          </span>

                          <strong className="font-['Orbitron'] text-white">{ev.gamerTag}</strong>

                          {ev.playerScore !== undefined && ev.opponentScore !== undefined && (
                            <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-bold text-amber-300 tabular-nums">
                              {ev.playerScore} - {ev.opponentScore}
                            </span>
                          )}

                          {ev.opponentTag && (
                            <span className="text-slate-400">vs {ev.opponentTag}</span>
                          )}

                          {ev.roundLabel && (
                            <span className="rounded bg-[#3E9BFF]/15 border border-[#3E9BFF]/30 px-2 py-0.5 text-[10px] text-[#3E9BFF]">
                              {ev.roundLabel}
                            </span>
                          )}

                          <span className="text-[10px] text-slate-500">
                            {new Date(ev.recordedAt).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          {isConfirmDelete ? (
                            <>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleDeleteEvent(ev.id)}
                                className="rounded-lg bg-rose-600 hover:bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white cursor-pointer"
                              >
                                Confirmer annulation
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteEventId(null)}
                                className="rounded-lg border border-white/15 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/10 cursor-pointer"
                              >
                                Garder
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEditEvent(ev)}
                                className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-[11px] text-amber-300 cursor-pointer"
                              >
                                <Edit3 size={11} />
                                <span>Corriger</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  sfx.playClick();
                                  setConfirmDeleteEventId(ev.id);
                                }}
                                className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 text-[11px] text-rose-300 cursor-pointer"
                              >
                                <Trash2 size={11} />
                                <span>Annuler</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-['Orbitron'] font-bold text-amber-300">
                            Corriger le résultat de {ev.gamerTag}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditOutcome("win")}
                              className={`rounded-lg px-3 py-1 font-bold cursor-pointer ${
                                editOutcome === "win"
                                  ? "bg-emerald-600 text-white"
                                  : "border border-white/15 text-slate-300"
                              }`}
                            >
                              Victoire
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditOutcome("draw")}
                              className={`rounded-lg px-3 py-1 font-bold cursor-pointer ${
                                editOutcome === "draw"
                                  ? "bg-sky-600 text-white"
                                  : "border border-white/15 text-slate-300"
                              }`}
                            >
                              Nul
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditOutcome("loss")}
                              className={`rounded-lg px-3 py-1 font-bold cursor-pointer ${
                                editOutcome === "loss"
                                  ? "bg-rose-600 text-white"
                                  : "border border-white/15 text-slate-300"
                              }`}
                            >
                              Défaite
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <input
                            type="number"
                            value={editPlayerScore}
                            onChange={(e) => setEditPlayerScore(e.target.value)}
                            placeholder="Score joueur"
                            className="rounded-lg border border-white/15 bg-[#141824] px-2.5 py-1.5 text-white tabular-nums"
                          />
                          <input
                            type="number"
                            value={editOpponentScore}
                            onChange={(e) => setEditOpponentScore(e.target.value)}
                            placeholder="Score adv."
                            className="rounded-lg border border-white/15 bg-[#141824] px-2.5 py-1.5 text-white tabular-nums"
                          />
                          <input
                            type="text"
                            value={editOpponentTag}
                            onChange={(e) => setEditOpponentTag(e.target.value)}
                            placeholder="Adversaire"
                            className="rounded-lg border border-white/15 bg-[#141824] px-2.5 py-1.5 text-white"
                          />
                          <input
                            type="text"
                            value={editRoundLabel}
                            onChange={(e) => setEditRoundLabel(e.target.value)}
                            placeholder="Phase / Tour"
                            className="rounded-lg border border-white/15 bg-[#141824] px-2.5 py-1.5 text-white"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingEventId(null)}
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-slate-300 hover:bg-white/10 cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSaveEditedEvent(ev.id)}
                            className="flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 font-bold text-slate-950 cursor-pointer"
                          >
                            <Check size={13} />
                            <span>Enregistrer & Recalculer</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Organizer Optional Note */}
      {activeTournament && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex-1 space-y-1">
            <label className="block font-['JetBrains_Mono'] text-[11px] font-bold text-slate-400">
              Note ou commentaire officiel (optionnel, affiché sous le classement public)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={competitionNote}
                onChange={(e) => setCompetitionNote(e.target.value)}
                placeholder="Ex: Tournoi disputé en LAN à House Game Akwa — Classement mis à jour après chaque tour."
                className="flex-1 rounded-xl border border-white/15 bg-[#141824] px-3 py-2 font-['Chakra_Petch'] text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveNoteOnly}
                className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-2 font-['JetBrains_Mono'] text-xs text-slate-200 transition cursor-pointer shrink-0"
              >
                <Save size={13} />
                <span>Enregistrer note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Entire Competition Ranking Modal */}
      {confirmDeleteRanking && activeTournament && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmDeleteRanking(false);
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-[#0E131E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle size={24} />
              <h4 className="font-['Orbitron'] text-base font-bold text-white">
                Supprimer ce classement ?
              </h4>
            </div>
            <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-slate-300">
              Le classement et l'historique des résultats de <strong>{activeTournament.title}</strong> seront définitivement supprimés. Les inscriptions des joueurs restent intactes.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteRanking(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-['JetBrains_Mono'] text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleConfirmDeleteEntireRanking}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white cursor-pointer"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

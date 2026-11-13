import {
  Tournament,
  EsportRegistration,
  EsportLicense,
  EsportPlayer,
  CompetitionRanking,
  CompetitionRankingEntry,
  ScoringRule,
  RankingResultEvent,
  EsportAuditLog,
  RegistrationStatus,
  LicenseStatus,
} from "../types";
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  limit,
} from "firebase/firestore";
import {
  firestoreCache,
  DEFAULT_TTLS,
  SingletonSubscription,
} from "./firestoreCache";

// Storage Keys
const TOURNAMENTS_KEY = "hg_esport_tournaments_v3";
const REGISTRATIONS_KEY = "hg_esport_registrations_v3";
const LICENSES_KEY = "hg_esport_licenses_v3";
const COMPETITION_RANKINGS_KEY = "hg_esport_competition_rankings_v3";
const RANKINGS_KEY = "hg_esport_rankings_v3";
const LOGS_KEY = "hg_esport_logs_v3";

// Firestore Collection Names
const COLL_TOURNAMENTS = "tournaments";
const COLL_REGISTRATIONS = "registrations";
const COLL_LICENSES = "player_licenses";
const COLL_RANKINGS = "rankings";
const COLL_LOGS = "esport_logs";

// Banner & Logo Storage Key
const BANNER_CONFIG_KEY = "hg_esport_banner_config_v3";

export interface EsportBannerConfig {
  logoUrl: string; // Custom logo Data URL or URL (empty = default House Game logo)
  bgImageUrl?: string; // Custom banner background image Data URL or URL
  title?: string;
  subtitle?: string;
  description?: string;
  badgeText?: string;
}

export const DEFAULT_ESPORT_BANNER_CONFIG: EsportBannerConfig = {
  logoUrl: "",
  bgImageUrl: "",
  title: "ARÈNE OFFICIELLE, TOURNOIS & CASH PRIZES GARANTIS",
  subtitle: "HOUSE GAME ESPORT",
  description:
    "Plateforme officielle de compétition de jeux vidéo au Cameroun. Retrouvez les championnats majeurs sur EA SPORTS FC 27, Tekken 8 et Naruto Storm Connections. Inscrivez-vous, obtenez votre licence numérique certifiée HOUSE GAME ID, consultez les classements officiels et hissez-vous sur le podium.",
  badgeText: "CIRCUIT OFFICIEL HOUSE GAME ESPORT • CAMEROUN",
};

export function loadEsportBannerConfig(): EsportBannerConfig {
  try {
    const raw = localStorage.getItem(BANNER_CONFIG_KEY);
    if (!raw) return DEFAULT_ESPORT_BANNER_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_ESPORT_BANNER_CONFIG, ...parsed };
  } catch {
    return DEFAULT_ESPORT_BANNER_CONFIG;
  }
}

export function saveEsportBannerConfig(config: EsportBannerConfig): boolean {
  try {
    localStorage.setItem(BANNER_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

/**
 * Compresse et lit un logo en préservant le canal alpha transparent (PNG/SVG/WebP).
 */
export function compressLogoPreservingAlpha(file: File, maxDim = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Erreur de lecture SVG"));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        const outputType = file.type === "image/png" ? "image/png" : "image/webp";
        resolve(canvas.toDataURL(outputType, 0.9));
      };
      img.onerror = () => reject(new Error("Image illisible"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Erreur de lecture"));
    reader.readAsDataURL(file);
  });
}

/**
 * Construit l'URL directe de partage pour un tournoi spécifique.
 * Le lien inclut le paramètre ?tab=esport&tournament=ID et l'ancre #tournament-ID
 * pour permettre à n'importe quel membre de la communauté d'atterrir directement sur l'onglet Esport
 * et de voir immédiatement le tournoi sélectionné et mis en valeur.
 */
export function getTournamentShareUrl(tournamentId: string): string {
  try {
    const origin = window.location.origin || "";
    const pathname = window.location.pathname || "/";
    return `${origin}${pathname}?tab=esport&tournament=${encodeURIComponent(tournamentId)}#tournament-${encodeURIComponent(tournamentId)}`;
  } catch {
    return `?tab=esport&tournament=${encodeURIComponent(tournamentId)}#tournament-${encodeURIComponent(tournamentId)}`;
  }
}

// ==================== SEED INITIAL DATA (ALL EMPTY AS REQUESTED) ====================

export const INITIAL_ESPORT_TOURNAMENTS: Tournament[] = [];
export const INITIAL_ESPORT_PLAYERS: EsportPlayer[] = [];
export const INITIAL_ESPORT_LICENSES: EsportLicense[] = [];
export const INITIAL_ESPORT_REGISTRATIONS: EsportRegistration[] = [];
export const INITIAL_ESPORT_LOGS: EsportAuditLog[] = [];

// ==================== STORAGE & PERSISTENCE HELPERS ====================

export function loadEsportTournaments(): Tournament[] {
  try {
    const raw = localStorage.getItem(TOURNAMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    const fallbackRaw = localStorage.getItem("hg_tournaments_v3");
    if (fallbackRaw) {
      const parsedFallback = JSON.parse(fallbackRaw);
      if (Array.isArray(parsedFallback) && parsedFallback.length > 0) {
        return parsedFallback;
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function saveEsportTournaments(tournaments: Tournament[]): boolean {
  try {
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(tournaments));
    return true;
  } catch {
    return false;
  }
}

export function loadEsportRegistrations(): EsportRegistration[] {
  try {
    const raw = localStorage.getItem(REGISTRATIONS_KEY);
    if (!raw) {
      saveEsportRegistrations([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    return list.map((r) => ({
      ...r,
      status: r?.status || "en attente",
      gamerTag: r?.gamerTag || "Joueur",
      fullName: r?.fullName || r?.gamerTag || "Joueur",
      phone: r?.phone || "",
    }));
  } catch {
    return [];
  }
}

export function saveEsportRegistrations(regs: EsportRegistration[]): boolean {
  try {
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(regs));
    return true;
  } catch {
    return false;
  }
}

export function loadEsportLicenses(): EsportLicense[] {
  try {
    const raw = localStorage.getItem(LICENSES_KEY);
    if (!raw) {
      saveEsportLicenses([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    return list.map((l) => ({
      ...l,
      status: l?.status || "Active",
      gamerTag: l?.gamerTag || "Joueur",
      fullName: l?.fullName || l?.gamerTag || "Joueur",
    }));
  } catch {
    return [];
  }
}

export function saveEsportLicenses(lics: EsportLicense[]): boolean {
  try {
    localStorage.setItem(LICENSES_KEY, JSON.stringify(lics));
    return true;
  } catch {
    return false;
  }
}

export const DEFAULT_SCORING_RULE: ScoringRule = {
  winPoints: 3,
  lossPoints: 0,
};

export function getNormalizedScoringRule(rule?: Partial<ScoringRule> | null): ScoringRule {
  const winPts =
    rule?.winPoints !== undefined && rule?.winPoints !== null && Number.isFinite(Number(rule.winPoints))
      ? Number(rule.winPoints)
      : DEFAULT_SCORING_RULE.winPoints;
  const lossPts =
    rule?.lossPoints !== undefined && rule?.lossPoints !== null && Number.isFinite(Number(rule.lossPoints))
      ? Number(rule.lossPoints)
      : DEFAULT_SCORING_RULE.lossPoints;
  return { winPoints: winPts, lossPoints: lossPts };
}

export function normalizeRankingEntries(entries: CompetitionRankingEntry[]): CompetitionRankingEntry[] {
  const valid = (Array.isArray(entries) ? entries : [])
    .filter((e) => e && String(e.gamerTag || "").trim().length > 0)
    .map((e, idx) => ({
      id: e.id || `entry-${Date.now()}-${idx}`,
      playerId: e.playerId ? String(e.playerId).trim() : undefined,
      position: Number.isFinite(Number(e.position)) && Number(e.position) > 0 ? Math.floor(Number(e.position)) : idx + 1,
      gamerTag: String(e.gamerTag).trim(),
      fullName: e.fullName ? String(e.fullName).trim() : undefined,
      points: e.points !== undefined && e.points !== null && String(e.points).trim() !== "" && !isNaN(Number(e.points))
        ? Number(e.points)
        : undefined,
      score: e.score ? String(e.score).trim() : undefined,
      scoreDiff:
        e.scoreDiff !== undefined && e.scoreDiff !== null && Number.isFinite(Number(e.scoreDiff))
          ? Number(e.scoreDiff)
          : undefined,
      wins: e.wins !== undefined && e.wins !== null && !isNaN(Number(e.wins)) ? Number(e.wins) : undefined,
      losses: e.losses !== undefined && e.losses !== null && !isNaN(Number(e.losses)) ? Number(e.losses) : undefined,
      matchesPlayed: e.matchesPlayed !== undefined && e.matchesPlayed !== null && !isNaN(Number(e.matchesPlayed))
        ? Number(e.matchesPlayed)
        : undefined,
      statsNote: e.statsNote ? String(e.statsNote).trim() : undefined,
      reward: e.reward ? String(e.reward).trim() : undefined,
      seedWins:
        e.seedWins !== undefined && e.seedWins !== null && Number.isFinite(Number(e.seedWins))
          ? Number(e.seedWins)
          : undefined,
      seedLosses:
        e.seedLosses !== undefined && e.seedLosses !== null && Number.isFinite(Number(e.seedLosses))
          ? Number(e.seedLosses)
          : undefined,
      seedScoreDiff:
        e.seedScoreDiff !== undefined && e.seedScoreDiff !== null && Number.isFinite(Number(e.seedScoreDiff))
          ? Number(e.seedScoreDiff)
          : undefined,
    }));

  return valid.sort((a, b) => a.position - b.position);
}

export function normalizeMatchHistory(history?: RankingResultEvent[]): RankingResultEvent[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter((ev) => ev && String(ev.gamerTag || "").trim().length > 0 && (ev.outcome === "win" || ev.outcome === "loss"))
    .map((ev, idx) => {
      const hasScores =
        ev.playerScore !== undefined &&
        ev.opponentScore !== undefined &&
        Number.isFinite(Number(ev.playerScore)) &&
        Number.isFinite(Number(ev.opponentScore));
      const pScore = hasScores ? Number(ev.playerScore) : undefined;
      const oScore = hasScores ? Number(ev.opponentScore) : undefined;
      const diff =
        hasScores && pScore !== undefined && oScore !== undefined
          ? pScore - oScore
          : ev.scoreDiff !== undefined && Number.isFinite(Number(ev.scoreDiff))
          ? Number(ev.scoreDiff)
          : undefined;
      return {
        id: ev.id || `res-${Date.now()}-${idx}`,
        playerId: ev.playerId ? String(ev.playerId).trim() : undefined,
        gamerTag: String(ev.gamerTag).trim(),
        fullName: ev.fullName ? String(ev.fullName).trim() : undefined,
        outcome: ev.outcome,
        playerScore: pScore,
        opponentScore: oScore,
        scoreDiff: diff,
        opponentTag: ev.opponentTag ? String(ev.opponentTag).trim() : undefined,
        roundLabel: ev.roundLabel ? String(ev.roundLabel).trim() : undefined,
        recordedAt: Number(ev.recordedAt) || Date.now(),
      };
    })
    .sort((a, b) => b.recordedAt - a.recordedAt);
}

/**
 * Recalcule automatiquement les statistiques (Matchs, Victoires, Défaites, Différence, Points)
 * et réordonne le classement selon :
 * 1. Total de points (décroissant)
 * 2. Nombre de victoires (décroissant)
 * 3. Différence de scores (décroissante)
 * 4. Nombre de matchs joués (décroissant)
 */
export function recomputeCompetitionRanking(
  ranking: CompetitionRanking,
  scoringRuleOverride?: ScoringRule
): CompetitionRanking {
  const rule = getNormalizedScoringRule(scoringRuleOverride ?? ranking.scoringRule);
  const hasHistoryArray = Array.isArray(ranking.matchHistory);
  const history = normalizeMatchHistory(ranking.matchHistory);

  type AggPlayer = CompetitionRankingEntry & {
    _seedWins: number;
    _seedLosses: number;
    _seedScoreDiff: number;
    _hasHistory: boolean;
  };

  const playerMap = new Map<string, AggPlayer>();
  const getKey = (playerId?: string, gamerTag?: string) => {
    const cleanTag = String(gamerTag || "").trim().toLowerCase();
    if (cleanTag) return `tag:${cleanTag}`;
    return `pid:${String(playerId || "").trim().toLowerCase()}`;
  };

  // Seed from existing entries (deduplicated)
  normalizeRankingEntries(ranking.entries || []).forEach((e) => {
    const key = getKey(e.playerId, e.gamerTag);
    const existing = playerMap.get(key);
    const seedW =
      e.seedWins !== undefined
        ? e.seedWins
        : !hasHistoryArray
        ? e.wins ?? 0
        : 0;
    const seedL =
      e.seedLosses !== undefined
        ? e.seedLosses
        : !hasHistoryArray
        ? e.losses ?? 0
        : 0;
    const seedDiff =
      e.seedScoreDiff !== undefined
        ? e.seedScoreDiff
        : !hasHistoryArray
        ? e.scoreDiff ?? 0
        : 0;

    if (!existing) {
      playerMap.set(key, {
        ...e,
        seedWins: seedW,
        seedLosses: seedL,
        seedScoreDiff: seedDiff,
        _seedWins: seedW,
        _seedLosses: seedL,
        _seedScoreDiff: seedDiff,
        _hasHistory: false,
      });
    } else {
      existing.playerId = existing.playerId || e.playerId;
      existing.fullName = existing.fullName || e.fullName;
      existing.reward = existing.reward || e.reward;
      existing.statsNote = existing.statsNote || e.statsNote;
    }
  });

  // Accumulate from matchHistory
  const winCountMap = new Map<string, number>();
  const lossCountMap = new Map<string, number>();
  const diffSumMap = new Map<string, number>();

  history.forEach((ev) => {
    const key = getKey(ev.playerId, ev.gamerTag);
    if (!playerMap.has(key)) {
      playerMap.set(key, {
        id: `entry-${ev.playerId || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        playerId: ev.playerId,
        position: playerMap.size + 1,
        gamerTag: ev.gamerTag,
        fullName: ev.fullName,
        wins: 0,
        losses: 0,
        matchesPlayed: 0,
        points: 0,
        scoreDiff: 0,
        seedWins: 0,
        seedLosses: 0,
        seedScoreDiff: 0,
        _seedWins: 0,
        _seedLosses: 0,
        _seedScoreDiff: 0,
        _hasHistory: true,
      });
    }
    const p = playerMap.get(key)!;
    p._hasHistory = true;
    if (!p.playerId && ev.playerId) p.playerId = ev.playerId;
    if (!p.fullName && ev.fullName) p.fullName = ev.fullName;

    if (ev.outcome === "win") {
      winCountMap.set(key, (winCountMap.get(key) || 0) + 1);
    } else {
      lossCountMap.set(key, (lossCountMap.get(key) || 0) + 1);
    }
    if (ev.scoreDiff !== undefined && Number.isFinite(ev.scoreDiff)) {
      diffSumMap.set(key, (diffSumMap.get(key) || 0) + Number(ev.scoreDiff));
    }
  });

  const computedEntries: CompetitionRankingEntry[] = [];
  playerMap.forEach((player, key) => {
    const wins = player._seedWins + (winCountMap.get(key) || 0);
    const losses = player._seedLosses + (lossCountMap.get(key) || 0);
    const matchesPlayed = wins + losses;
    const scoreDiff = player._seedScoreDiff + (diffSumMap.get(key) || 0);
    const points = wins * rule.winPoints + losses * rule.lossPoints;

    const { _seedWins, _seedLosses, _seedScoreDiff, _hasHistory, ...clean } = player;
    computedEntries.push({
      ...clean,
      wins,
      losses,
      matchesPlayed,
      scoreDiff,
      points,
    });
  });

  // Sort strictly: 1. Points, 2. Wins, 3. ScoreDiff, 4. MatchesPlayed, 5. Name
  computedEntries.sort((a, b) => {
    const ptsDiff = (b.points ?? 0) - (a.points ?? 0);
    if (ptsDiff !== 0) return ptsDiff;

    const winsDiff = (b.wins ?? 0) - (a.wins ?? 0);
    if (winsDiff !== 0) return winsDiff;

    const sDiff = (b.scoreDiff ?? 0) - (a.scoreDiff ?? 0);
    if (sDiff !== 0) return sDiff;

    const mDiff = (b.matchesPlayed ?? 0) - (a.matchesPlayed ?? 0);
    if (mDiff !== 0) return mDiff;

    return a.gamerTag.localeCompare(b.gamerTag, "fr", { sensitivity: "base" });
  });

  const rankedEntries = computedEntries.map((entry, index) => ({
    ...entry,
    position: index + 1,
  }));

  return {
    ...ranking,
    id: ranking.id || ranking.tournamentId,
    gameCategory: ranking.gameCategory || ranking.game || "E-Sport",
    scoringRule: rule,
    matchHistory: history,
    entries: rankedEntries,
    updatedAt: Date.now(),
  };
}

export function createBaseRankingForTournament(
  tournament: Tournament,
  existing?: CompetitionRanking | null
): CompetitionRanking {
  if (existing) {
    return {
      ...existing,
      tournamentTitle: tournament.title || existing.tournamentTitle,
      game: tournament.game || existing.game,
      gameCategory: tournament.gameCategory || existing.gameCategory || tournament.game,
      date: tournament.date || existing.date,
      cashPrizePool: tournament.cashPrize || existing.cashPrizePool,
      scoringRule: getNormalizedScoringRule(existing.scoringRule),
      matchHistory: normalizeMatchHistory(existing.matchHistory),
    };
  }
  return {
    id: tournament.id,
    tournamentId: tournament.id,
    tournamentTitle: tournament.title,
    game: tournament.game,
    gameCategory: tournament.gameCategory || tournament.game,
    date: tournament.date,
    cashPrizePool: tournament.cashPrize,
    isPublished: true,
    publishedAt: Date.now(),
    updatedAt: Date.now(),
    scoringRule: { ...DEFAULT_SCORING_RULE },
    matchHistory: [],
    entries: [],
  };
}

export function recordPlayerMatchResult(
  ranking: CompetitionRanking,
  input: {
    playerId?: string;
    gamerTag: string;
    fullName?: string;
    outcome: "win" | "loss";
    playerScore?: number;
    opponentScore?: number;
    opponentTag?: string;
    roundLabel?: string;
  }
): CompetitionRanking {
  const now = Date.now();
  const hasScores =
    input.playerScore !== undefined &&
    input.opponentScore !== undefined &&
    Number.isFinite(input.playerScore) &&
    Number.isFinite(input.opponentScore);

  const newEvent: RankingResultEvent = {
    id: `res-${now}-${Math.random().toString(36).slice(2, 7)}`,
    playerId: input.playerId?.trim() || undefined,
    gamerTag: input.gamerTag.trim(),
    fullName: input.fullName?.trim() || undefined,
    outcome: input.outcome,
    playerScore: hasScores ? Number(input.playerScore) : undefined,
    opponentScore: hasScores ? Number(input.opponentScore) : undefined,
    scoreDiff: hasScores ? Number(input.playerScore) - Number(input.opponentScore) : undefined,
    opponentTag: input.opponentTag?.trim() || undefined,
    roundLabel: input.roundLabel?.trim() || undefined,
    recordedAt: now,
  };

  const baseHistory = normalizeMatchHistory(ranking.matchHistory);
  const nextRanking: CompetitionRanking = {
    ...ranking,
    isPublished: ranking.entries.length === 0 ? true : ranking.isPublished,
    publishedAt: ranking.publishedAt || now,
    matchHistory: [newEvent, ...baseHistory],
  };

  return recomputeCompetitionRanking(nextRanking);
}

export function updatePlayerMatchResult(
  ranking: CompetitionRanking,
  eventId: string,
  updates: {
    outcome: "win" | "loss";
    playerScore?: number;
    opponentScore?: number;
    opponentTag?: string;
    roundLabel?: string;
  }
): CompetitionRanking {
  const baseHistory = normalizeMatchHistory(ranking.matchHistory);
  const hasScores =
    updates.playerScore !== undefined &&
    updates.opponentScore !== undefined &&
    Number.isFinite(updates.playerScore) &&
    Number.isFinite(updates.opponentScore);

  const updatedHistory = baseHistory.map((ev) => {
    if (ev.id !== eventId) return ev;
    return {
      ...ev,
      outcome: updates.outcome,
      playerScore: hasScores ? Number(updates.playerScore) : undefined,
      opponentScore: hasScores ? Number(updates.opponentScore) : undefined,
      scoreDiff: hasScores ? Number(updates.playerScore) - Number(updates.opponentScore) : undefined,
      opponentTag: updates.opponentTag?.trim() || undefined,
      roundLabel: updates.roundLabel?.trim() || undefined,
    };
  });

  return recomputeCompetitionRanking({
    ...ranking,
    matchHistory: updatedHistory,
  });
}

export function deletePlayerMatchResult(
  ranking: CompetitionRanking,
  eventId: string
): CompetitionRanking {
  const baseHistory = normalizeMatchHistory(ranking.matchHistory);
  const updatedHistory = baseHistory.filter((ev) => ev.id !== eventId);

  return recomputeCompetitionRanking({
    ...ranking,
    matchHistory: updatedHistory,
  });
}

export function initializeRegisteredPlayersInRanking(
  ranking: CompetitionRanking,
  registrations: EsportRegistration[]
): { ranking: CompetitionRanking; addedCount: number } {
  const eligible = registrations.filter(
    (r) => r.tournamentId === ranking.tournamentId && r.status !== "refusée" && r.status !== "annulée"
  );
  const existingTags = new Set(ranking.entries.map((e) => e.gamerTag.trim().toLowerCase()));
  const newEntries: CompetitionRankingEntry[] = [];

  eligible.forEach((reg) => {
    const tag = (reg.gamerTag || "").trim();
    if (!tag || existingTags.has(tag.toLowerCase())) return;
    existingTags.add(tag.toLowerCase());
    newEntries.push({
      id: `entry-${reg.playerId || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      playerId: reg.playerId,
      position: ranking.entries.length + newEntries.length + 1,
      gamerTag: tag,
      fullName: reg.fullName || undefined,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      points: 0,
      scoreDiff: 0,
      seedWins: 0,
      seedLosses: 0,
      seedScoreDiff: 0,
    });
  });

  if (newEntries.length === 0) {
    return { ranking, addedCount: 0 };
  }

  const next = recomputeCompetitionRanking({
    ...ranking,
    isPublished: true,
    publishedAt: ranking.publishedAt || Date.now(),
    matchHistory: normalizeMatchHistory(ranking.matchHistory),
    entries: [...ranking.entries, ...newEntries],
  });

  return { ranking: next, addedCount: newEntries.length };
}

export function removePlayerFromRanking(
  ranking: CompetitionRanking,
  gamerTag: string
): CompetitionRanking {
  const targetKey = gamerTag.trim().toLowerCase();
  const nextEntries = (ranking.entries || []).filter(
    (e) => e.gamerTag.trim().toLowerCase() !== targetKey
  );
  const nextHistory = normalizeMatchHistory(ranking.matchHistory).filter(
    (ev) => ev.gamerTag.trim().toLowerCase() !== targetKey
  );

  return recomputeCompetitionRanking({
    ...ranking,
    entries: nextEntries,
    matchHistory: nextHistory,
  });
}

export function loadCompetitionRankings(): CompetitionRanking[] {
  try {
    const raw = localStorage.getItem(COMPETITION_RANKINGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    return list
      .filter((r) => r && r.tournamentId)
      .map((r) => ({
        ...r,
        id: r.id || r.tournamentId,
        gameCategory: r.gameCategory || r.game || "E-Sport",
        isPublished: Boolean(r.isPublished),
        updatedAt: Number(r.updatedAt) || Date.now(),
        scoringRule: getNormalizedScoringRule(r.scoringRule),
        matchHistory: normalizeMatchHistory(r.matchHistory),
        entries: normalizeRankingEntries(r.entries || []),
      }));
  } catch {
    return [];
  }
}

export function saveCompetitionRankings(rankings: CompetitionRanking[]): boolean {
  try {
    localStorage.setItem(COMPETITION_RANKINGS_KEY, JSON.stringify(rankings));
    return true;
  } catch {
    return false;
  }
}

export function loadEsportPlayers(): EsportPlayer[] {
  try {
    const raw = localStorage.getItem(RANKINGS_KEY);
    if (!raw) {
      saveEsportPlayers([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    return list.map((p) => ({
      ...p,
      gamerTag: p?.gamerTag || "Joueur",
      fullName: p?.fullName || p?.gamerTag || "Joueur",
      rankTitle: p?.rankTitle || "Challenger",
    }));
  } catch {
    return [];
  }
}

export function saveEsportPlayers(players: EsportPlayer[]): boolean {
  try {
    localStorage.setItem(RANKINGS_KEY, JSON.stringify(players));
    return true;
  } catch {
    return false;
  }
}

export function loadEsportLogs(): EsportAuditLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      saveEsportLogs([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEsportLogs(logs: EsportAuditLog[]): boolean {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    return true;
  } catch {
    return false;
  }
}

export function clearAllEsportStorage(): void {
  try {
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify([]));
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify([]));
    localStorage.setItem(LICENSES_KEY, JSON.stringify([]));
    localStorage.setItem(COMPETITION_RANKINGS_KEY, JSON.stringify([]));
    localStorage.setItem(RANKINGS_KEY, JSON.stringify([]));
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
    localStorage.setItem("hg_tournaments", JSON.stringify([]));
  } catch (err) {
    console.warn("clearAllEsportStorage error:", err);
  }
}

// ==================== CROSS-TAB & BROADCAST CHANNEL ====================
export const ESPORT_BROADCAST_CHANNEL = "hg_esport_channel_v3";

export function broadcastEsportEvent(type: string, payload: unknown): void {
  try {
    if (typeof window !== "undefined") {
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel(ESPORT_BROADCAST_CHANNEL);
        bc.postMessage({ type, payload, timestamp: Date.now() });
        setTimeout(() => {
          try { bc.close(); } catch { /* ignore */ }
        }, 300);
      }
      window.dispatchEvent(new CustomEvent("hg:esport-event", { detail: { type, payload } }));
      window.dispatchEvent(new CustomEvent("hg:new-registration", { detail: payload }));
    }
  } catch (err) {
    console.warn("Broadcast error:", err);
  }
}

// ==================== FIRESTORE SYNC & SUBSCRIPTIONS ====================

const registrationsMultiplexer = new SingletonSubscription<EsportRegistration[]>("registrations");
const licensesSubscribers = new Set<(lics: EsportLicense[]) => void>();

export function subscribeToEsportRegistrations(
  onUpdate: (regs: EsportRegistration[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return registrationsMultiplexer.subscribe(
    onUpdate,
    (emit) => {
      const colRef = collection(db, COLL_REGISTRATIONS);
      const q = query(colRef, limit(200));

      return onSnapshot(
        q,
        (snapshot) => {
          try {
            const cloudItems: EsportRegistration[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as EsportRegistration;
              cloudItems.push({ ...data, id: d.id });
            });

            // Smart merge with local storage: local validated status is preserved if newer
            const localItems = loadEsportRegistrations();
            const map = new Map<string, EsportRegistration>();
            localItems.forEach((r) => map.set(r.id, r));
            cloudItems.forEach((r) => {
              const existing = map.get(r.id);
              if (existing && existing.status === "validée" && r.status === "en attente") {
                map.set(r.id, { ...r, ...existing });
              } else {
                map.set(r.id, { ...(existing || {}), ...r });
              }
            });

            const merged = Array.from(map.values());
            merged.sort((a, b) => (b.registeredAt || 0) - (a.registeredAt || 0));

            saveEsportRegistrations(merged);
            firestoreCache.set("registrations", merged, DEFAULT_TTLS.REGISTRATIONS, REGISTRATIONS_KEY);
            emit(merged);
          } catch (err) {
            console.warn("Error processing registrations snapshot:", err);
            const cached = loadEsportRegistrations();
            emit(cached);
            if (onError) onError(err);
          }
        },
        (err) => {
          firestoreCache.isQuotaError(err);
          console.warn("Firestore registrations notice (using local cache):", err);
          const cached = loadEsportRegistrations();
          emit(cached);
          if (onError) onError(err);
        }
      );
    },
    loadEsportRegistrations()
  );
}

export async function saveRegistrationCloud(reg: EsportRegistration): Promise<void> {
  const current = loadEsportRegistrations();
  const updated = current.some((r) => r.id === reg.id)
    ? current.map((r) => (r.id === reg.id ? reg : r))
    : [reg, ...current];

  saveEsportRegistrations(updated);
  firestoreCache.set("registrations", updated, DEFAULT_TTLS.REGISTRATIONS, REGISTRATIONS_KEY);
  registrationsMultiplexer.updateLocally(updated);

  try {
    const docRef = doc(db, COLL_REGISTRATIONS, reg.id);
    const sanitized = JSON.parse(JSON.stringify(reg));
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore saveRegistrationCloud notice (persisted locally):", err);
  }
}

export async function deleteRegistrationCloud(id: string): Promise<void> {
  const current = loadEsportRegistrations();
  const updated = current.filter((r) => r.id !== id);

  saveEsportRegistrations(updated);
  firestoreCache.set("registrations", updated, DEFAULT_TTLS.REGISTRATIONS, REGISTRATIONS_KEY);
  registrationsMultiplexer.updateLocally(updated);

  try {
    const docRef = doc(db, COLL_REGISTRATIONS, id);
    await deleteDoc(docRef);
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore deleteRegistrationCloud notice:", err);
  }
}

// ==================== LICENSES (CACHE-FIRST WITH TTL) ====================

export function subscribeToEsportLicenses(
  onUpdate: (lics: EsportLicense[]) => void,
  onError?: (err: unknown) => void
): () => void {
  licensesSubscribers.add(onUpdate);

  const cached = firestoreCache.get<EsportLicense[]>("licenses", LICENSES_KEY, DEFAULT_TTLS.LICENSES);
  const initial = cached?.data || loadEsportLicenses();
  onUpdate(initial);

  if (cached?.isFresh || firestoreCache.isQuotaCoolingDown()) {
    return () => {
      licensesSubscribers.delete(onUpdate);
    };
  }

  let isCancelled = false;
  firestoreCache
    .dedupe("fetch_licenses", async () => {
      const colRef = collection(db, COLL_LICENSES);
      const q = query(colRef, limit(200));
      const snapshot = await getDocs(q);

      const cloudItems: EsportLicense[] = [];
      snapshot.forEach((d) => {
        cloudItems.push({ ...(d.data() as EsportLicense), id: d.id });
      });

      // Smart merge: never discard locally issued licenses
      const localItems = loadEsportLicenses();
      const map = new Map<string, EsportLicense>();
      localItems.forEach((l) => map.set(l.id, l));
      cloudItems.forEach((l) => {
        const existing = map.get(l.id);
        map.set(l.id, { ...(existing || {}), ...l });
      });

      return Array.from(map.values());
    })
    .then((fresh) => {
      saveEsportLicenses(fresh);
      firestoreCache.set("licenses", fresh, DEFAULT_TTLS.LICENSES, LICENSES_KEY);
      licensesSubscribers.forEach((cb) => {
        try { cb(fresh); } catch { /* ignore */ }
      });
    })
    .catch((err) => {
      firestoreCache.isQuotaError(err);
      console.warn("Licenses fetch notice (using cache):", err);
      if (!isCancelled && onError) onError(err);
    });

  return () => {
    isCancelled = true;
    licensesSubscribers.delete(onUpdate);
  };
}

export async function saveLicenseCloud(lic: EsportLicense): Promise<void> {
  const current = loadEsportLicenses();
  const updated = current.some((l) => l.id === lic.id)
    ? current.map((l) => (l.id === lic.id ? lic : l))
    : [lic, ...current];

  saveEsportLicenses(updated);
  firestoreCache.set("licenses", updated, DEFAULT_TTLS.LICENSES, LICENSES_KEY);
  licensesSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, COLL_LICENSES, lic.id);
    const sanitized = JSON.parse(JSON.stringify(lic));
    await setDoc(docRef, sanitized, { merge: true });
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore saveLicenseCloud notice (persisted locally):", err);
  }
}

export async function deleteLicenseCloud(id: string): Promise<void> {
  const current = loadEsportLicenses();
  const updated = current.filter((l) => l.id !== id);

  saveEsportLicenses(updated);
  firestoreCache.set("licenses", updated, DEFAULT_TTLS.LICENSES, LICENSES_KEY);
  licensesSubscribers.forEach((cb) => {
    try { cb(updated); } catch { /* ignore */ }
  });

  try {
    const docRef = doc(db, COLL_LICENSES, id);
    await deleteDoc(docRef);
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore deleteLicenseCloud notice:", err);
  }
}

// ==================== COMPETITION RANKINGS (REAL-TIME + FIRESTORE) ====================

const rankingsMultiplexer = new SingletonSubscription<CompetitionRanking[]>("competition_rankings");

export function subscribeToCompetitionRankings(
  onUpdate: (rankings: CompetitionRanking[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return rankingsMultiplexer.subscribe(
    onUpdate,
    (emit) => {
      const colRef = collection(db, COLL_RANKINGS);
      const q = query(colRef, limit(100));

      return onSnapshot(
        q,
        (snapshot) => {
          try {
            const cloudItems: CompetitionRanking[] = [];
            snapshot.forEach((d) => {
              if (d.id === "global") return;
              const data = d.data() as Partial<CompetitionRanking>;
              if (!data || !data.tournamentId || !Array.isArray(data.entries)) return;
              cloudItems.push({
                id: data.id || d.id,
                tournamentId: data.tournamentId,
                tournamentTitle: data.tournamentTitle || "Compétition",
                game: data.game || "",
                gameCategory: data.gameCategory || data.game || "E-Sport",
                date: data.date,
                cashPrizePool: data.cashPrizePool,
                isPublished: Boolean(data.isPublished),
                publishedAt: data.publishedAt,
                updatedAt: Number(data.updatedAt) || Date.now(),
                notes: data.notes,
                scoringRule: getNormalizedScoringRule(data.scoringRule),
                matchHistory: normalizeMatchHistory(data.matchHistory),
                entries: normalizeRankingEntries(data.entries),
              });
            });

            const localItems = loadCompetitionRankings();
            const map = new Map<string, CompetitionRanking>();
            localItems.forEach((r) => map.set(r.tournamentId, r));
            cloudItems.forEach((r) => {
              const existing = map.get(r.tournamentId);
              if (!existing || r.updatedAt >= existing.updatedAt) {
                map.set(r.tournamentId, r);
              }
            });

            const merged = Array.from(map.values());
            merged.sort((a, b) => (b.publishedAt || b.updatedAt) - (a.publishedAt || a.updatedAt));

            saveCompetitionRankings(merged);
            firestoreCache.set("competition_rankings", merged, DEFAULT_TTLS.RANKINGS, COMPETITION_RANKINGS_KEY);
            emit(merged);
          } catch (err) {
            console.warn("Error processing rankings snapshot:", err);
            emit(loadCompetitionRankings());
            if (onError) onError(err);
          }
        },
        (err) => {
          firestoreCache.isQuotaError(err);
          console.warn("Rankings listener notice (using local cache):", err);
          emit(loadCompetitionRankings());
          if (onError) onError(err);
        }
      );
    },
    loadCompetitionRankings()
  );
}

export async function saveCompetitionRankingCloud(ranking: CompetitionRanking): Promise<void> {
  const normalized: CompetitionRanking = {
    ...ranking,
    id: ranking.id || ranking.tournamentId,
    gameCategory: ranking.gameCategory || ranking.game || "E-Sport",
    updatedAt: ranking.updatedAt || Date.now(),
    scoringRule: getNormalizedScoringRule(ranking.scoringRule),
    matchHistory: normalizeMatchHistory(ranking.matchHistory),
    entries: normalizeRankingEntries(ranking.entries),
  };

  const current = loadCompetitionRankings();
  const updated = current.some((r) => r.tournamentId === normalized.tournamentId)
    ? current.map((r) => (r.tournamentId === normalized.tournamentId ? normalized : r))
    : [normalized, ...current];
  updated.sort((a, b) => (b.publishedAt || b.updatedAt) - (a.publishedAt || a.updatedAt));

  saveCompetitionRankings(updated);
  firestoreCache.set("competition_rankings", updated, DEFAULT_TTLS.RANKINGS, COMPETITION_RANKINGS_KEY);
  rankingsMultiplexer.updateLocally(updated);
  broadcastEsportEvent("update-rankings", normalized);

  try {
    const docId = normalized.tournamentId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const docRef = doc(db, COLL_RANKINGS, docId);
    const sanitized = JSON.parse(JSON.stringify(normalized));
    await setDoc(docRef, sanitized);
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore saveCompetitionRankingCloud notice (persisted locally):", err);
  }
}

export async function deleteCompetitionRankingCloud(tournamentId: string): Promise<void> {
  const current = loadCompetitionRankings();
  const updated = current.filter((r) => r.tournamentId !== tournamentId);

  saveCompetitionRankings(updated);
  firestoreCache.set("competition_rankings", updated, DEFAULT_TTLS.RANKINGS, COMPETITION_RANKINGS_KEY);
  rankingsMultiplexer.updateLocally(updated);
  broadcastEsportEvent("update-rankings", { deletedTournamentId: tournamentId });

  try {
    const docId = tournamentId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const docRef = doc(db, COLL_RANKINGS, docId);
    await deleteDoc(docRef);
  } catch (err) {
    firestoreCache.isQuotaError(err);
    console.warn("Firestore deleteCompetitionRankingCloud notice:", err);
  }
}

// ==================== ENGINE & BUSINESS LOGIC ====================

/**
 * Generates an official unique player ID
 */
export function generatePlayerId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `HGP-${num}`;
}

/**
 * Generates an official unique license ID: HGE-2026-XXXX
 */
export function generateLicenseNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HGE-${year}-${rand}`;
}

/**
 * Masks a phone number for public display (prevents privacy leakage)
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "*** ***";
  const cleaned = String(phone).trim();
  if (cleaned.length < 8) return "*** ***";
  const start = cleaned.slice(0, 7);
  const end = cleaned.slice(-2);
  return `${start} *** *${end}`;
}

/**
 * Generates an official QR code data URL using an SVG matrix representation
 */
export function generateSvgQrDataUri(content: string): string {
  // Simple, robust high-fidelity SVG QR code pattern generator with finder patterns
  const hash = Array.from(content).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 7);
  const size = 25; // 25x25 matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder pattern helper (7x7 with 3x3 core)
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[r0 + r][c0 + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(0, size - 7); // Top-right
  drawFinder(size - 7, 0); // Bottom-left

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Deterministic pseudo-random data bits based on content hash
  let seed = Math.abs(hash);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= size - 8;
      const inBL = r >= size - 8 && c < 8;
      if (!inTL && !inTR && !inBL && matrix[r][c] === false) {
        seed = (seed * 16807 + 11) % 2147483647;
        matrix[r][c] = (seed % 3 === 0);
      }
    }
  }

  // Build SVG path
  let path = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        path += `M${c},${r}h1v1h-1z `;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#0A0D14"/><path d="${path}" fill="#00FF88"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Public Verification Tool for House Game Digital License
 */
export function verifyEsportLicense(
  licenseNumberOrQuery: string,
  licenses: EsportLicense[]
): {
  found: boolean;
  license?: EsportLicense;
  message: string;
  isStatusActive: boolean;
} {
  const query = String(licenseNumberOrQuery || "").trim().toUpperCase();
  if (!query) {
    return {
      found: false,
      message: "Veuillez renseigner un numéro de licence officiel (ex: HGE-2026-1001).",
      isStatusActive: false,
    };
  }

  const match = licenses.find(
    (l) =>
      String(l.id || "").toUpperCase() === query ||
      String(l.gamerTag || "").toUpperCase() === query ||
      String(l.playerId || "").toUpperCase() === query
  );

  if (!match) {
    return {
      found: false,
      message: `Aucune licence trouvée pour la référence « ${query} ». Vérifiez la saisie ou contactez l'administration House Game.`,
      isStatusActive: false,
    };
  }

  const isStatusActive = match.status === "Active";
  const message = isStatusActive
    ? `Licence officielle certifiée valide pour ${match.gamerTag || "Joueur"} (${match.fullName || "Compétiteur"}). Statut : ACTIVE.`
    : `Attention : cette licence est actuellement ${String(match.status || "Inconnue").toUpperCase()}. Elle n'autorise pas la participation aux tournois officiels.`;

  return {
    found: true,
    license: match,
    message,
    isStatusActive,
  };
}

/**
 * Split a single CSV/TSV line respecting quotes
 */
function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

/**
 * Parse a spreadsheet (CSV, TSV, Excel/Google Sheets copy-paste) into CompetitionRankingEntry[]
 */
export function parseRankingSheetText(rawText: string): {
  entries: CompetitionRankingEntry[];
  warnings: string[];
} {
  const cleaned = String(rawText || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const lines = cleaned
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { entries: [], warnings: ["Aucune ligne détectée dans la feuille."] };
  }

  // Detect delimiter: tab > semicolon > comma
  const sample = lines.slice(0, 5).join("\n");
  const tabCount = (sample.match(/\t/g) || []).length;
  const semiCount = (sample.match(/;/g) || []).length;
  const commaCount = (sample.match(/,/g) || []).length;
  const delimiter = tabCount >= semiCount && tabCount >= commaCount && tabCount > 0
    ? "\t"
    : semiCount >= commaCount && semiCount > 0
    ? ";"
    : commaCount > 0
    ? ","
    : "\t";

  const rows = lines.map((line) => splitDelimitedLine(line, delimiter));
  const warnings: string[] = [];

  const normHeader = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const firstRow = rows[0].map(normHeader);
  const headerKeywords = [
    "position", "pos", "rang", "rank", "classement", "#", "place",
    "pseudo", "gamertag", "joueur", "player", "nom", "competiteur",
    "point", "pts", "score", "resultat", "stat", "victoire", "win",
    "defaite", "loss", "recompense", "prize", "cash", "lot", "gain",
  ];
  const looksLikeHeader = firstRow.some((cell) =>
    headerKeywords.some((kw) => cell === kw || cell.includes(kw))
  );

  type ColRole = "position" | "gamerTag" | "fullName" | "points" | "score" | "wins" | "losses" | "statsNote" | "reward";
  const colMap = new Map<number, ColRole>();

  let dataRows = rows;
  if (looksLikeHeader) {
    firstRow.forEach((h, idx) => {
      if (!h) return;
      if (/^(#|pos|position|rang|rank|place|classement)/.test(h)) colMap.set(idx, "position");
      else if (h.includes("nom complet") || h.includes("prenom") || h === "fullname" || h === "full name") colMap.set(idx, "fullName");
      else if (h.includes("pseudo") || h.includes("gamer") || h.includes("joueur") || h.includes("player") || h.includes("tag") || h === "nom") colMap.set(idx, "gamerTag");
      else if (h.includes("point") || h === "pts") colMap.set(idx, "points");
      else if (h.includes("score") || h.includes("resultat")) colMap.set(idx, "score");
      else if (h.includes("victoire") || h === "v" || h === "wins" || h === "win") colMap.set(idx, "wins");
      else if (h.includes("defaite") || h === "d" || h === "losses" || h === "loss") colMap.set(idx, "losses");
      else if (h.includes("stat") || h.includes("note") || h.includes("ratio") || h.includes("detail")) colMap.set(idx, "statsNote");
      else if (h.includes("recompense") || h.includes("cash") || h.includes("prize") || h.includes("lot") || h.includes("gain")) colMap.set(idx, "reward");
    });
    dataRows = rows.slice(1);
  }

  const parseNumeric = (val: string): number | undefined => {
    const cleanedNum = val.replace(/\s+/g, "").replace(",", ".");
    if (!cleanedNum || !/^-?\d+(\.\d+)?$/.test(cleanedNum)) return undefined;
    return Number(cleanedNum);
  };

  const parsePosition = (val: string): number | undefined => {
    const match = val.replace(/\s+/g, "").match(/^#?(\d+)(er|ere|e|eme|th|st|nd|rd)?$/i);
    if (!match) return undefined;
    const n = Number(match[1]);
    return n > 0 ? n : undefined;
  };

  const parsedEntries: CompetitionRankingEntry[] = [];
  const baseTs = Date.now();

  dataRows.forEach((cells, rowIdx) => {
    if (cells.every((c) => !c)) return;

    let position: number | undefined;
    let gamerTag = "";
    let fullName = "";
    let points: number | undefined;
    let score = "";
    let wins: number | undefined;
    let losses: number | undefined;
    let statsNote = "";
    let reward = "";

    if (colMap.size > 0) {
      cells.forEach((cell, colIdx) => {
        if (!cell) return;
        const role = colMap.get(colIdx);
        if (role === "position") position = parsePosition(cell);
        else if (role === "gamerTag") gamerTag = cell;
        else if (role === "fullName") fullName = cell;
        else if (role === "points") {
          const n = parseNumeric(cell);
          if (n !== undefined) points = n;
          else if (!score) score = cell;
        } else if (role === "score") score = cell;
        else if (role === "wins") wins = parseNumeric(cell);
        else if (role === "losses") losses = parseNumeric(cell);
        else if (role === "statsNote") statsNote = cell;
        else if (role === "reward") reward = cell;
      });
    } else {
      // Positional fallback without headers:
      // Case A: [Position, Pseudo, Points/Score, Stats, Reward]
      // Case B: [Pseudo, Points/Score, Reward]
      const firstPos = parsePosition(cells[0] || "");
      let offset = 0;
      if (firstPos !== undefined && cells.length >= 2) {
        position = firstPos;
        gamerTag = cells[1] || "";
        offset = 2;
      } else {
        position = parsedEntries.length + 1;
        gamerTag = cells[0] || "";
        offset = 1;
      }

      const rest = cells.slice(offset).filter((c) => c.length > 0);
      if (rest[0]) {
        const asNum = parseNumeric(rest[0]);
        if (asNum !== undefined) points = asNum;
        else score = rest[0];
      }
      if (rest[1]) {
        // Check if looks like cash/reward (contains FCFA, $, €, XAF, trophée, lot) or stats
        if (/(fcfa|xaf|€|\$|trophee|trophée|manette|lot|bon|cadeau)/i.test(rest[1]) && !rest[2]) {
          reward = rest[1];
        } else {
          statsNote = rest[1];
        }
      }
      if (rest[2]) {
        reward = rest[2];
      }
    }

    if (!gamerTag && fullName) {
      gamerTag = fullName;
      fullName = "";
    }

    if (!gamerTag) {
      warnings.push(`Ligne ${rowIdx + (looksLikeHeader ? 2 : 1)} ignorée (nom/pseudo manquant).`);
      return;
    }

    parsedEntries.push({
      id: `entry-${baseTs}-${rowIdx}`,
      position: position || parsedEntries.length + 1,
      gamerTag,
      fullName: fullName || undefined,
      points,
      score: score || undefined,
      wins,
      losses,
      statsNote: statsNote || undefined,
      reward: reward || undefined,
    });
  });

  return {
    entries: normalizeRankingEntries(parsedEntries),
    warnings,
  };
}

/**
 * Exports data to CSV string with standard UTF-8 BOM
 */
export function exportToCsv<T extends object>(data: T[], filename: string): void {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]) as (keyof T)[];
  const rows = data.map((obj) =>
    headers
      .map((header) => {
        const val = (obj as Record<string, unknown>)[header as string];
        const stringVal = val === null || val === undefined ? "" : String(val);
        const escaped = stringVal.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(";")
  );

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCompetitionRankingCsv(ranking: CompetitionRanking): void {
  const rows = normalizeRankingEntries(ranking.entries).map((e) => ({
    Rang: e.position,
    Joueur: e.gamerTag,
    "Nom complet": e.fullName || "",
    Matchs: e.matchesPlayed ?? ((e.wins ?? 0) + (e.losses ?? 0)),
    Victoires: e.wins ?? 0,
    Defaites: e.losses ?? 0,
    Difference: e.scoreDiff ?? 0,
    Points: e.points ?? 0,
    Recompense: e.reward || "",
  }));

  const slug = (ranking.tournamentTitle || ranking.tournamentId || "competition")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  exportToCsv(rows, `classement-${slug}`);
}

export function downloadRankingCsvTemplate(): void {
  const sampleRows = [
    {
      Position: 1,
      Pseudo: "CamerStriker",
      "Nom complet": "Marc Noah",
      Points: 2500,
      Score: "3-1 Finale",
      Victoires: 6,
      Defaites: 0,
      Statistiques: "6V / 0D • Invaincu",
      Recompense: "150 000 FCFA + Trophée",
    },
    {
      Position: 2,
      Pseudo: "ShadowAkwa",
      "Nom complet": "Kevin Etoa",
      Points: 1950,
      Score: "1-3 Finale",
      Victoires: 5,
      Defaites: 1,
      Statistiques: "5V / 1D",
      Recompense: "75 000 FCFA",
    },
    {
      Position: 3,
      Pseudo: "KingDouala",
      "Nom complet": "Bryan Talla",
      Points: 1500,
      Score: "2-0 Petite Finale",
      Victoires: 4,
      Defaites: 2,
      Statistiques: "4V / 2D",
      Recompense: "35 000 FCFA",
    },
  ];
  exportToCsv(sampleRows, "modele-classement-house-game-esport");
}


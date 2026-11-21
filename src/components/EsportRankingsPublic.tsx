import React, { useState, useEffect, useMemo } from "react";
import { CompetitionRanking, CompetitionRankingEntry, Tournament } from "../types";
import {
  Crown,
  Trophy,
  Medal,
  FileSpreadsheet,
  Calendar,
  Gamepad2,
  Coins,
  Sliders,
  Info,
  Filter,
} from "lucide-react";
import {
  getNormalizedScoringRule,
  recomputeCompetitionRanking,
  exportCompetitionRankingCsv,
} from "../services/esportService";
import { sfx } from "../services/soundEffects";

interface EsportRankingsPublicProps {
  rankings: CompetitionRanking[];
  tournaments: Tournament[];
  selectedTournamentId?: string;
  onSelectTournamentId?: (id: string) => void;
  hasAdminAccess?: boolean;
  onGoToAdminRankings?: (tournamentId?: string) => void;
}

export const EsportRankingsPublic: React.FC<EsportRankingsPublicProps> = ({
  rankings,
  tournaments,
  selectedTournamentId: propSelectedTournamentId,
  onSelectTournamentId,
  hasAdminAccess = false,
  onGoToAdminRankings,
}) => {
  // Ensure every published ranking has deterministic stats and positions
  const publishedRankings = useMemo(() => {
    return rankings
      .filter((r) => r.isPublished && Array.isArray(r.entries) && r.entries.length > 0)
      .map((r) => {
        const meta = tournaments.find((t) => t.id === r.tournamentId);
        const enriched: CompetitionRanking = {
          ...r,
          gameCategory: meta?.gameCategory || r.gameCategory || r.game || "E-Sport",
          game: meta?.game || r.game,
        };
        return recomputeCompetitionRanking(enriched);
      })
      .sort((a, b) => (b.publishedAt || b.updatedAt) - (a.publishedAt || a.updatedAt));
  }, [rankings, tournaments]);

  // Distinct game categories available in published rankings
  const categories = useMemo(() => {
    const set = new Set<string>();
    publishedRankings.forEach((r) => {
      const cat = (r.gameCategory || r.game || "").trim();
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [publishedRankings]);

  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");

  const filteredRankings = useMemo(() => {
    if (selectedCategory === "Toutes") return publishedRankings;
    return publishedRankings.filter(
      (r) =>
        (r.gameCategory || r.game || "").trim().toLowerCase() ===
        selectedCategory.trim().toLowerCase()
    );
  }, [publishedRankings, selectedCategory]);

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    propSelectedTournamentId || publishedRankings[0]?.tournamentId || ""
  );

  useEffect(() => {
    if (
      propSelectedTournamentId &&
      publishedRankings.some((r) => r.tournamentId === propSelectedTournamentId)
    ) {
      setSelectedTournamentId(propSelectedTournamentId);
      setSelectedCategory("Toutes");
    }
  }, [propSelectedTournamentId, publishedRankings]);

  useEffect(() => {
    if (
      filteredRankings.length > 0 &&
      (!selectedTournamentId || !filteredRankings.some((r) => r.tournamentId === selectedTournamentId))
    ) {
      setSelectedTournamentId(filteredRankings[0].tournamentId);
    }
  }, [filteredRankings, selectedTournamentId]);

  const activeRanking = useMemo(
    () =>
      filteredRankings.find((r) => r.tournamentId === selectedTournamentId) ||
      filteredRankings[0] ||
      null,
    [filteredRankings, selectedTournamentId]
  );

  const activeTournamentMeta = useMemo(
    () => (activeRanking ? tournaments.find((t) => t.id === activeRanking.tournamentId) : undefined),
    [tournaments, activeRanking]
  );

  const activeScoringRule = useMemo(
    () => getNormalizedScoringRule(activeRanking?.scoringRule),
    [activeRanking]
  );

  const firstPlace = useMemo(
    () => activeRanking?.entries.find((e) => e.position === 1) || activeRanking?.entries[0],
    [activeRanking]
  );
  const secondPlace = useMemo(
    () =>
      activeRanking?.entries.find((e) => e.position === 2 && e.id !== firstPlace?.id) ||
      (activeRanking && activeRanking.entries.length > 1 ? activeRanking.entries[1] : undefined),
    [activeRanking, firstPlace]
  );
  const thirdPlace = useMemo(
    () =>
      activeRanking?.entries.find(
        (e) => e.position === 3 && e.id !== firstPlace?.id && e.id !== secondPlace?.id
      ) || (activeRanking && activeRanking.entries.length > 2 ? activeRanking.entries[2] : undefined),
    [activeRanking, firstPlace, secondPlace]
  );

  const renderPodiumStats = (entry: CompetitionRankingEntry) => {
    const matches =
      entry.matchesPlayed ?? ((entry.wins ?? 0) + (entry.draws ?? 0) + (entry.losses ?? 0));
    const parts: string[] = [
      `${entry.points ?? 0} pts`,
      `${matches} match${matches > 1 ? "s" : ""}`,
      `${entry.wins ?? 0}V / ${entry.draws ?? 0}N / ${entry.losses ?? 0}D`,
    ];
    if (entry.scoreDiff !== undefined && entry.scoreDiff !== 0) {
      parts.push(`Diff ${entry.scoreDiff > 0 ? `+${entry.scoreDiff}` : entry.scoreDiff}`);
    }
    return parts;
  };

  if (publishedRankings.length === 0) {
    return (
      <section className="space-y-6 animate-fadeIn">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-[#0E121B] p-12 text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Crown size={32} />
          </div>
          <div className="space-y-1.5">
            <h4 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white">
              Aucun classement publié pour le moment
            </h4>
            <p className="max-w-md font-['Chakra_Petch'] text-xs sm:text-sm text-slate-400">
              Les podiums officiels et classements en temps réel de chaque compétition HOUSE GAME apparaîtront ici dès que les premiers résultats seront enregistrés.
            </p>
          </div>
          {hasAdminAccess && onGoToAdminRankings && (
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onGoToAdminRankings();
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-slate-950 shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Sliders size={14} />
              <span>Gérer les classements (Admin)</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 animate-fadeIn">
      {/* Category & Competition Selector Header */}
      <div className="rounded-3xl border border-white/10 bg-[#0E121B] p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs font-bold text-emerald-400">
            <Trophy size={15} />
            <span>CLASSEMENTS OFFICIELS PAR CATÉGORIE ({publishedRankings.length})</span>
          </div>

          {hasAdminAccess && onGoToAdminRankings && activeRanking && (
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                onGoToAdminRankings(activeRanking.tournamentId);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-amber-300 transition cursor-pointer"
            >
              <Sliders size={12} />
              <span>Enregistrer des résultats (Admin)</span>
            </button>
          )}
        </div>

        {/* Game Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
            <span className="inline-flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-slate-400 mr-1">
              <Filter size={12} />
              <span>Jeu :</span>
            </span>
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
              Toutes ({publishedRankings.length})
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

        {/* Independent Competitions within Category */}
        <div className="flex flex-wrap gap-2.5">
          {filteredRankings.map((r) => {
            const isSelected = activeRanking?.tournamentId === r.tournamentId;
            const winner = r.entries.find((e) => e.position === 1) || r.entries[0];
            return (
              <button
                key={r.tournamentId}
                type="button"
                onClick={() => {
                  sfx.playClick();
                  setSelectedTournamentId(r.tournamentId);
                  onSelectTournamentId?.(r.tournamentId);
                }}
                className={`flex flex-col items-start rounded-2xl border px-4 py-2.5 text-left transition cursor-pointer ${
                  isSelected
                    ? "border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                }`}
              >
                <span className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#3E9BFF]">
                  {r.gameCategory || r.game || "E-Sport"}
                </span>
                <span className="font-['Orbitron'] text-xs font-bold text-white">
                  {r.tournamentTitle}
                </span>
                {winner && (
                  <span className="mt-1 font-['JetBrains_Mono'] text-[10px] text-amber-300">
                    🏆 Leader : {winner.gamerTag} ({winner.points ?? 0} pts)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Competition Podium Showcase */}
      {activeRanking && (
        <>
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1A150D] via-[#0E121B] to-[#07090E] p-6 sm:p-10 shadow-2xl space-y-8">
            <div className="text-center space-y-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-['JetBrains_Mono'] font-bold text-amber-300">
                <Crown size={14} />
                <span>CLASSEMENT OFFICIEL HOUSE GAME ESPORT</span>
              </div>
              <h2 className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeRanking.tournamentTitle}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2.5 font-['JetBrains_Mono'] text-xs text-slate-300">
                {(activeRanking.gameCategory || activeRanking.game || activeTournamentMeta?.game) && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1">
                    <Gamepad2 size={13} className="text-[#3E9BFF]" />
                    <span>{activeRanking.gameCategory || activeRanking.game || activeTournamentMeta?.game}</span>
                  </span>
                )}
                {(activeRanking.date || activeTournamentMeta?.date) && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1">
                    <Calendar size={13} className="text-emerald-400" />
                    <span>{activeRanking.date || activeTournamentMeta?.date}</span>
                  </span>
                )}
                {(activeRanking.cashPrizePool || activeTournamentMeta?.cashPrize) && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-amber-300 font-bold">
                    <Coins size={13} />
                    <span>Cash Prize : {activeRanking.cashPrizePool || activeTournamentMeta?.cashPrize}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-emerald-300 font-bold">
                  <span>
                    Barème : Victoire = {activeScoringRule.winPoints >= 0 ? `+${activeScoringRule.winPoints}` : activeScoringRule.winPoints} pts • Nul = {activeScoringRule.drawPoints >= 0 ? `+${activeScoringRule.drawPoints}` : activeScoringRule.drawPoints} {Math.abs(activeScoringRule.drawPoints) > 1 ? "pts" : "pt"} • Défaite = {activeScoringRule.lossPoints} {Math.abs(activeScoringRule.lossPoints) > 1 ? "pts" : "pt"}
                  </span>
                </span>
              </div>
            </div>

            {/* Distinct Podium (1st Gold, 2nd Silver, 3rd Bronze) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-2 max-w-4xl mx-auto items-end">
              {/* #2 Silver */}
              {secondPlace ? (
                <div className="order-2 md:order-1 rounded-2xl border border-slate-300/40 bg-gradient-to-b from-slate-300/15 via-white/[0.04] to-transparent p-5 text-center space-y-3 shadow-lg">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-['JetBrains_Mono'] font-bold text-slate-200">
                    <Medal size={15} className="text-slate-200" />
                    <span>2e PLACE • ARGENT</span>
                  </div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/20 text-white font-['Orbitron'] text-lg font-black border border-slate-200/50 tabular-nums">
                    2
                  </div>
                  <div>
                    <div className="font-['Orbitron'] text-lg font-bold text-white break-words">
                      {secondPlace.gamerTag}
                    </div>
                    {secondPlace.fullName && (
                      <div className="font-['Chakra_Petch'] text-xs text-slate-400">
                        {secondPlace.fullName}
                      </div>
                    )}
                  </div>
                  <div className="font-['JetBrains_Mono'] text-xs text-slate-200 tabular-nums">
                    {renderPodiumStats(secondPlace).join(" • ")}
                  </div>
                  {secondPlace.reward && (
                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300/30 bg-slate-200/10 px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold text-slate-100">
                      <Coins size={12} className="text-slate-200" />
                      <span>{secondPlace.reward}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:block order-2 md:order-1" />
              )}

              {/* #1 Gold Champion */}
              {firstPlace && (
                <div className="order-1 md:order-2 rounded-2xl border-2 border-amber-400/75 bg-gradient-to-t from-amber-500/25 via-amber-500/10 to-amber-400/5 p-6 text-center space-y-3 shadow-[0_0_35px_rgba(245,158,11,0.28)] md:-translate-y-3">
                  <Crown size={30} className="text-amber-400 mx-auto" />
                  <div className="text-[11px] font-['JetBrains_Mono'] font-black tracking-wider text-amber-300">
                    1re PLACE • OR
                  </div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-['Orbitron'] text-xl font-black shadow-lg tabular-nums">
                    1
                  </div>
                  <div>
                    <div className="font-['Orbitron'] text-xl sm:text-2xl font-black text-white break-words">
                      {firstPlace.gamerTag}
                    </div>
                    {firstPlace.fullName && (
                      <div className="font-['Chakra_Petch'] text-xs text-amber-100/80">
                        {firstPlace.fullName}
                      </div>
                    )}
                  </div>
                  <div className="font-['JetBrains_Mono'] text-xs sm:text-sm font-bold text-amber-200 tabular-nums">
                    {renderPodiumStats(firstPlace).join(" • ")}
                  </div>
                  {firstPlace.reward && (
                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-400/20 px-3.5 py-1.5 font-['JetBrains_Mono'] text-xs font-black text-amber-200 shadow-inner">
                      <Trophy size={13} className="text-amber-300" />
                      <span>{firstPlace.reward}</span>
                    </div>
                  )}
                </div>
              )}

              {/* #3 Bronze */}
              {thirdPlace ? (
                <div className="order-3 rounded-2xl border border-amber-700/55 bg-gradient-to-b from-amber-700/20 via-white/[0.04] to-transparent p-5 text-center space-y-3 shadow-lg">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-['JetBrains_Mono'] font-bold text-amber-400">
                    <Medal size={15} className="text-amber-500" />
                    <span>3e PLACE • BRONZE</span>
                  </div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-700/25 text-amber-300 font-['Orbitron'] text-lg font-black border border-amber-600/50 tabular-nums">
                    3
                  </div>
                  <div>
                    <div className="font-['Orbitron'] text-lg font-bold text-white break-words">
                      {thirdPlace.gamerTag}
                    </div>
                    {thirdPlace.fullName && (
                      <div className="font-['Chakra_Petch'] text-xs text-slate-400">
                        {thirdPlace.fullName}
                      </div>
                    )}
                  </div>
                  <div className="font-['JetBrains_Mono'] text-xs text-slate-200 tabular-nums">
                    {renderPodiumStats(thirdPlace).join(" • ")}
                  </div>
                  {thirdPlace.reward && (
                    <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-700/40 bg-amber-700/15 px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold text-amber-300">
                      <Coins size={12} className="text-amber-400" />
                      <span>{thirdPlace.reward}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:block order-3" />
              )}
            </div>
          </div>

          {/* Complete Standings Table */}
          <div className="rounded-3xl border border-white/10 bg-[#0E121B] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-['Orbitron'] text-base font-bold text-white">
                  CLASSEMENT COMPLET ({activeRanking.entries.length} JOUEUR{activeRanking.entries.length > 1 ? "S" : ""})
                </h3>
                <p className="font-['JetBrains_Mono'] text-[11px] text-slate-400 mt-0.5">
                  Tri automatique : Points • Victoires • Différence de scores • Matchs joués
                </p>
              </div>

              <button
                type="button"
                onClick={() => exportCompetitionRankingCsv(activeRanking)}
                className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-['JetBrains_Mono'] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-lg transition cursor-pointer"
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
                    <th className="py-3 px-3">JOUEUR</th>
                    <th className="py-3 px-3 text-center">MATCHS</th>
                    <th className="py-3 px-3 text-center">VICTOIRES</th>
                    <th className="py-3 px-3 text-center">NULS</th>
                    <th className="py-3 px-3 text-center">DÉFAITES</th>
                    <th className="py-3 px-3 text-right">POINTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeRanking.entries.map((entry) => {
                    const matches =
                      entry.matchesPlayed ?? ((entry.wins ?? 0) + (entry.draws ?? 0) + (entry.losses ?? 0));
                    const isTop1 = entry.position === 1;
                    const isTop2 = entry.position === 2;
                    const isTop3 = entry.position === 3;

                    return (
                      <tr
                        key={entry.id}
                        className={`transition ${
                          isTop1
                            ? "bg-amber-500/[0.06] hover:bg-amber-500/[0.1]"
                            : isTop2
                            ? "bg-slate-200/[0.03] hover:bg-slate-200/[0.06]"
                            : isTop3
                            ? "bg-amber-800/[0.05] hover:bg-amber-800/[0.08]"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="py-3.5 px-3 font-['Orbitron'] font-bold tabular-nums whitespace-nowrap">
                          {isTop1 ? (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/50 bg-amber-400/15 px-2.5 py-1 text-amber-300">
                              🥇 #{entry.position}
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-300/40 bg-slate-300/15 px-2.5 py-1 text-slate-100">
                              🥈 #{entry.position}
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-700/50 bg-amber-700/20 px-2.5 py-1 text-amber-400">
                              🥉 #{entry.position}
                            </span>
                          ) : (
                            <span className="text-slate-300 px-1.5">#{entry.position}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-['Orbitron'] font-bold text-white">
                              {entry.gamerTag}
                            </span>
                            {entry.reward && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                {entry.reward}
                              </span>
                            )}
                          </div>
                          {entry.fullName && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{entry.fullName}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold text-slate-200 tabular-nums">
                          {matches}
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold text-emerald-400 tabular-nums">
                          {entry.wins ?? 0}
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold text-sky-400 tabular-nums">
                          {entry.draws ?? 0}
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold text-rose-400 tabular-nums">
                          {entry.losses ?? 0}
                        </td>

                        <td className="py-3.5 px-3 text-right tabular-nums whitespace-nowrap">
                          <span className="font-['Orbitron'] text-sm font-black text-amber-300">
                            {entry.points ?? 0}
                          </span>
                          {entry.scoreDiff !== undefined && entry.scoreDiff !== 0 && (
                            <span
                              className={`ml-2 text-[10px] font-bold ${
                                entry.scoreDiff > 0 ? "text-emerald-400" : "text-rose-400"
                              }`}
                              title="Différence de scores"
                            >
                              ({entry.scoreDiff > 0 ? `+${entry.scoreDiff}` : entry.scoreDiff})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {activeRanking.notes && (
              <div className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 text-xs font-['Chakra_Petch'] text-slate-300">
                <Info size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{activeRanking.notes}</span>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

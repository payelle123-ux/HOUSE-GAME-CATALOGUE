import React, { useState } from "react";
import { Tournament, EsportMatch } from "../types";
import {
  Trophy,
  Swords,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Edit2,
  Crown,
  Tv,
} from "lucide-react";

interface EsportBracketViewerProps {
  tournament: Tournament;
  matches: EsportMatch[];
  isAdmin: boolean;
  onRecordScore: (matchId: string, s1: number, s2: number, isProvisional: boolean, referee: string) => void;
  onGenerateBracket?: () => void;
  canGenerate?: boolean;
  validatedCount?: number;
}

export const EsportBracketViewer: React.FC<EsportBracketViewerProps> = ({
  tournament,
  matches,
  isAdmin,
  onRecordScore,
  onGenerateBracket,
  canGenerate = false,
  validatedCount = 0,
}) => {
  const [editingMatch, setEditingMatch] = useState<EsportMatch | null>(null);
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);
  const [isProvisional, setIsProvisional] = useState<boolean>(false);
  const [refereeName, setRefereeName] = useState<string>("Arbitre Officiel HG");

  const tournamentMatches = matches.filter((m) => m.tournamentId === tournament.id);

  // Group matches by round
  const roundsMap = tournamentMatches.reduce((acc, m) => {
    const r = m.round || 1;
    if (!acc[r]) acc[r] = [];
    acc[r].push(m);
    return acc;
  }, {} as Record<number, EsportMatch[]>);

  const roundKeys = Object.keys(roundsMap)
    .map(Number)
    .sort((a, b) => a - b);

  const handleOpenScoreModal = (match: EsportMatch) => {
    setEditingMatch(match);
    setScore1(match.player1Score || 0);
    setScore2(match.player2Score || 0);
    setIsProvisional(Boolean(match.isProvisional));
    setRefereeName(match.referee || "Arbitre Officiel HG");
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;
    onRecordScore(editingMatch.id, score1, score2, isProvisional, refereeName.trim() || "Arbitre HG");
    setEditingMatch(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs font-bold text-emerald-400 uppercase">
            <Swords size={14} />
            <span>ARBRE DES RENCONTRES & MATCHS OFFICIELS</span>
          </div>
          <h3 className="font-['Orbitron'] text-lg sm:text-xl font-bold text-white mt-1">
            {tournament.title}
          </h3>
          <p className="font-['Chakra_Petch'] text-xs text-slate-400">
            Format : {tournament.format} • {tournamentMatches.length} match(s) programmés
          </p>
        </div>

        {isAdmin && onGenerateBracket && tournamentMatches.length === 0 && (
          <button
            onClick={onGenerateBracket}
            disabled={!canGenerate}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-40"
          >
            <Sparkles size={14} />
            <span>Générer l'arbre officiel ({validatedCount} joueurs validés)</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {tournamentMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Swords size={32} />
          </div>
          <h4 className="font-['Orbitron'] text-base font-bold text-white">
            Tableau des matchs en attente de tirage
          </h4>
          <p className="mt-1 max-w-md font-['Chakra_Petch'] text-xs text-slate-400">
            Le tableau officiel sera généré par les arbitres dès la clôture des inscriptions.
            Les participants recevront leurs horaires et postes de jeu.
          </p>
          {isAdmin && (
            <div className="mt-4">
              <button
                onClick={onGenerateBracket}
                disabled={!canGenerate}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white hover:bg-emerald-500 transition disabled:opacity-40"
              >
                <Sparkles size={13} />
                <span>Effectuer le tirage au sort & générer les rencontres</span>
              </button>
              {!canGenerate && (
                <p className="text-[11px] text-amber-400 font-['JetBrains_Mono'] mt-1">
                  (Au moins 2 inscriptions validées requises pour générer le tableau)
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Bracket Columns */
        <div className="overflow-x-auto pb-6">
          <div className="flex items-start gap-6 min-w-[760px]">
            {roundKeys.map((roundNum) => {
              const roundMatches = roundsMap[roundNum];
              const roundName = roundMatches[0]?.roundName || `Tour ${roundNum}`;

              return (
                <div key={roundNum} className="flex-1 space-y-4 min-w-[280px]">
                  {/* Round Header */}
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2">
                    <span className="font-['Orbitron'] text-xs font-bold text-white uppercase tracking-wider">
                      {roundName}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[10px] text-emerald-400">
                      {roundMatches.length} match(s)
                    </span>
                  </div>

                  {/* Matches list for this round */}
                  <div className="space-y-4">
                    {roundMatches.map((m) => {
                      const isFinished = m.status === "Terminé";
                      const p1Won = isFinished && m.player1Score > m.player2Score;
                      const p2Won = isFinished && m.player2Score > m.player1Score;

                      return (
                        <div
                          key={m.id}
                          className={`relative overflow-hidden rounded-2xl border p-4 transition shadow-lg ${
                            isFinished
                              ? "border-emerald-500/40 bg-[#0E131E]"
                              : m.status === "En cours"
                              ? "border-amber-400/50 bg-[#14120D] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                              : "border-white/10 bg-[#0C0F17]"
                          }`}
                        >
                          {/* Match Top Bar */}
                          <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-slate-400 border-b border-white/5 pb-2 mb-3">
                            <span className="text-white/60 font-bold">{m.id}</span>
                            <span className="flex items-center gap-1 text-slate-300">
                              <Tv size={11} className="text-[#3E9BFF]" />
                              <span>{m.tableOrScreen || "Poste standard"}</span>
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold ${
                                isFinished
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : m.status === "En cours"
                                  ? "bg-amber-500/20 text-amber-300 animate-pulse"
                                  : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>

                          {/* Player 1 Row */}
                          <div
                            className={`flex items-center justify-between p-2 rounded-xl transition ${
                              p1Won
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-white font-bold"
                                : "text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {p1Won && <Crown size={14} className="text-amber-400 shrink-0" />}
                              <span className="font-['Orbitron'] text-xs truncate">
                                {m.player1Tag}
                              </span>
                            </div>
                            <span className="font-['JetBrains_Mono'] text-sm font-black px-2 text-white">
                              {m.player1Score}
                            </span>
                          </div>

                          {/* VS Divider */}
                          <div className="py-1 text-center">
                            <span className="text-[10px] font-['JetBrains_Mono'] text-slate-600 uppercase">
                              vs
                            </span>
                          </div>

                          {/* Player 2 Row */}
                          <div
                            className={`flex items-center justify-between p-2 rounded-xl transition ${
                              p2Won
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-white font-bold"
                                : "text-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {p2Won && <Crown size={14} className="text-amber-400 shrink-0" />}
                              <span className="font-['Orbitron'] text-xs truncate">
                                {m.player2Tag}
                              </span>
                            </div>
                            <span className="font-['JetBrains_Mono'] text-sm font-black px-2 text-white">
                              {m.player2Score}
                            </span>
                          </div>

                          {/* Match Footer & Score Entry for Admin */}
                          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-['JetBrains_Mono']">
                            <span className="text-slate-500 text-[10px] truncate max-w-[140px]">
                              {m.referee ? `Ref: ${m.referee}` : "Arbitrage certifié"}
                            </span>

                            {isAdmin && (
                              <button
                                onClick={() => handleOpenScoreModal(m)}
                                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition text-[11px] font-bold"
                              >
                                <Edit2 size={11} />
                                <span>{isFinished ? "Corriger" : "Saisir score"}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCORE ENTRY MODAL */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/40 bg-[#0C0F17] p-6 shadow-2xl space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs font-bold text-emerald-400">
                <Swords size={13} />
                <span>SAISIE OFFICIELLE DU SCORE • {editingMatch.id}</span>
              </div>
              <h4 className="font-['Orbitron'] text-lg font-bold text-white mt-1">
                {editingMatch.roundName}
              </h4>
              <p className="font-['Chakra_Petch'] text-xs text-slate-400">
                L'enregistrement d'un résultat définitif qualifiera automatiquement le vainqueur pour le tour suivant.
              </p>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Score Player 1 */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1.5">
                  <label className="font-['Orbitron'] text-xs font-bold text-white block truncate">
                    {editingMatch.player1Tag}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    required
                    value={score1}
                    onChange={(e) => setScore1(Number(e.target.value))}
                    className="w-full text-center rounded-lg border border-white/20 bg-black/60 py-2 font-['JetBrains_Mono'] text-2xl font-black text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                {/* Score Player 2 */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-1.5">
                  <label className="font-['Orbitron'] text-xs font-bold text-white block truncate">
                    {editingMatch.player2Tag}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    required
                    value={score2}
                    onChange={(e) => setScore2(Number(e.target.value))}
                    className="w-full text-center rounded-lg border border-white/20 bg-black/60 py-2 font-['JetBrains_Mono'] text-2xl font-black text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Referee Name */}
              <div className="space-y-1">
                <label className="font-['JetBrains_Mono'] text-xs font-bold text-slate-300">
                  Nom de l'arbitre / organisateur responsable
                </label>
                <input
                  type="text"
                  required
                  value={refereeName}
                  onChange={(e) => setRefereeName(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-['Chakra_Petch'] text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Provisional checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isProvisional}
                  onChange={(e) => setIsProvisional(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                />
                <span className="font-['JetBrains_Mono'] text-xs text-slate-300">
                  Résultat provisoire (en attente de confirmation finale)
                </span>
              </label>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-['JetBrains_Mono'] text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-['JetBrains_Mono'] font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] transition"
                >
                  Valider le score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

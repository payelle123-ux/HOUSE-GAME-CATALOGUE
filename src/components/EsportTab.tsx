import React, { useState } from "react";
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Users,
  Coins,
  ShieldAlert,
  Plus,
  Edit3,
  Trash2,
  MessageCircle,
  Gamepad2,
  CheckCircle2,
  Flame,
  Swords,
  Info,
} from "lucide-react";
import { Tournament, ShopInfo } from "../types";
import { buildWhatsAppTournamentRegistrationUrl } from "../services/storage";

interface EsportTabProps {
  tournaments: Tournament[];
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onOpenAddTournament: () => void;
  onEditTournament: (tournament: Tournament) => void;
  onDeleteTournament: (tournament: Tournament) => void;
}

export const EsportTab: React.FC<EsportTabProps> = ({
  tournaments,
  shopInfo,
  isAdmin,
  onOpenAddTournament,
  onEditTournament,
  onDeleteTournament,
}) => {
  // Registration Modal State
  const [registeringTournament, setRegisteringTournament] = useState<Tournament | null>(null);
  const [gamerTag, setGamerTag] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [playerPhone, setPlayerPhone] = useState<string>("");
  const [platform, setPlatform] = useState<string>("PlayStation 5");

  // Rules Modal State
  const [viewingRulesTournament, setViewingRulesTournament] = useState<Tournament | null>(null);

  const handleConfirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringTournament) return;

    const url = buildWhatsAppTournamentRegistrationUrl(shopInfo.whatsapp, {
      tournament: registeringTournament,
      gamerTag: gamerTag.trim() || "Gamer Pro",
      fullName: fullName.trim() || "Joueur",
      playerPhone: playerPhone.trim() || shopInfo.whatsapp,
      preferredPlatform: platform,
    });

    window.open(url, "_blank");
    setRegisteringTournament(null);
    setGamerTag("");
    setFullName("");
    setPlayerPhone("");
  };

  return (
    <div id="esport-tab-view" className="space-y-10 pb-12 animate-fadeIn">
      {/* Admin Ribbon */}
      {isAdmin && (
        <div
          id="admin-esport-banner"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-['JetBrains_Mono'] font-bold">
              ESPACE PRO ESPORT : Créez, éditez les tournois officiels, fixez les cash prizes et les règles.
            </span>
          </div>
          <button
            onClick={onOpenAddTournament}
            id="admin-add-tournament-btn"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-3.5 py-1.5 font-['JetBrains_Mono'] font-bold text-emerald-300 hover:bg-emerald-500/30 transition shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          >
            <Plus size={14} />
            <span>+ Créer un tournoi officiel</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F17] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300">
            <Trophy size={13} />
            <span>CIRCUIT OFFICIEL ESPORT HOUSE GAME</span>
          </div>

          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl font-black text-white">
            TOURNOIS OFFICIELS & CASH PRIZES GARANTIS
          </h1>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-[#A0AEC0] leading-relaxed">
            Rejoignez l'élite des compétiteurs sur EA SPORTS FC 27, Tekken 8 et Naruto Storm Connections. Affrontez les meilleurs joueurs de la région dans des conditions de jeu professionnelles (écrans 144Hz, retransmission en direct et cash prizes en espèces).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 font-['JetBrains_Mono'] text-xs text-white">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Coins size={14} className="text-amber-400" />
              <span>Cash Prizes Payés le Jour J</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Swords size={14} className="text-[#3E9BFF]" />
              <span>Arbitrage Officiel Certifié</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Gamepad2 size={14} className="text-[#FF4438]" />
              <span>Setup PS5 Pro Gaming</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tournaments Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-3">
          <div>
            <h2 className="font-['Orbitron'] text-xl font-bold text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span>CALENDRIER DES TOURNOIS EN COURS & À VENIR ({tournaments.length})</span>
            </h2>
            <p className="font-['JetBrains_Mono'] text-xs text-[#7C8798] mt-0.5">
              Sélectionnez votre compétition et validez votre inscription directement sur WhatsApp.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenAddTournament}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-3.5 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
            >
              <Plus size={14} />
              <span>Ajouter un tournoi</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tournaments.map((t) => {
            const slotsPercent = Math.min(
              100,
              Math.round(((t.currentSlots || 0) / (t.maxSlots || 32)) * 100)
            );

            return (
              <div
                key={t.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#0E121B] shadow-xl transition hover:border-emerald-500/50 hover:bg-[#121723]"
              >
                <div>
                  {/* Banner Image & Overlay */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#141824]">
                    <img
                      src={t.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"}
                      alt={t.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E121B] via-black/40 to-black/60" />

                    {/* Game & Status Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="rounded-md border border-[#3E9BFF]/40 bg-black/80 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-[#3E9BFF] backdrop-blur-sm">
                        {t.game}
                      </span>
                      <span
                        className={`rounded-md border px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold backdrop-blur-sm ${
                          t.status === "Inscriptions ouvertes"
                            ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                            : "border-amber-500/50 bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    {/* Cash Prize Big Box */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] font-bold font-['JetBrains_Mono'] text-[#A0AEC0]">
                          CASH PRIZE TOTAL
                        </div>
                        <div className="font-['Orbitron'] text-xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                          {t.cashPrize}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-bold font-['JetBrains_Mono'] text-[#A0AEC0]">
                          INSCRIPTION
                        </div>
                        <div className="font-['JetBrains_Mono'] text-xs font-bold text-white">
                          {t.entryFee}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tournament Details */}
                  <div className="p-5 space-y-4">
                    <h3 className="font-['Orbitron'] text-base font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors">
                      {t.title}
                    </h3>

                    {/* Meta info */}
                    <div className="space-y-2 font-['JetBrains_Mono'] text-xs text-[#A0AEC0]">
                      <div className="flex items-center gap-2 text-white">
                        <Calendar size={14} className="text-emerald-400 flex-shrink-0" />
                        <span>{t.date} ({t.time})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#7C8798] flex-shrink-0" />
                        <span className="truncate">{t.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gamepad2 size={14} className="text-[#7C8798] flex-shrink-0" />
                        <span>{t.platform} • {t.format}</span>
                      </div>
                    </div>

                    {/* Slots progress bar */}
                    <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs">
                      <div className="flex justify-between text-[11px] text-[#A0AEC0]">
                        <span>Places réservées :</span>
                        <strong className="text-white">
                          {t.currentSlots || 0} / {t.maxSlots} joueurs
                        </strong>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#3E9BFF] transition-all"
                          style={{ width: `${slotsPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRegisteringTournament(t)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-500 transition active:scale-95"
                    >
                      <Trophy size={15} />
                      <span>S'inscrire au tournoi</span>
                    </button>

                    <button
                      onClick={() => setViewingRulesTournament(t)}
                      title="Voir le règlement complet"
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-[#A0AEC0] hover:border-[#3E9BFF]/40 hover:bg-[#3E9BFF]/10 hover:text-white transition"
                    >
                      <Info size={16} />
                    </button>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => onEditTournament(t)}
                        className="flex items-center gap-1 text-[11px] font-['JetBrains_Mono'] text-amber-300 hover:text-amber-200"
                      >
                        <Edit3 size={13} />
                        <span>Modifier</span>
                      </button>
                      <span className="text-white/20">•</span>
                      <button
                        onClick={() => onDeleteTournament(t)}
                        className="flex items-center gap-1 text-[11px] font-['JetBrains_Mono'] text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={13} />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Direct Registration Modal */}
      {registeringTournament && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setRegisteringTournament(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-emerald-500/40 bg-[#12151E] p-6 shadow-2xl space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 font-['JetBrains_Mono']">
                <span>FORMULAIRE D'INSCRIPTION OFFICIEL</span>
              </div>
              <h3 className="font-['Orbitron'] text-base font-bold text-white mt-1">
                {registeringTournament.title}
              </h3>
              <p className="font-['JetBrains_Mono'] text-xs text-amber-400">
                Cash Prize : {registeringTournament.cashPrize} • Frais : {registeringTournament.entryFee}
              </p>
            </div>

            <form onSubmit={handleConfirmRegistration} className="space-y-4 font-['JetBrains_Mono'] text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A0AEC0] mb-1">Pseudo Gamer (GamerTag) * :</label>
                  <input
                    type="text"
                    value={gamerTag}
                    onChange={(e) => setGamerTag(e.target.value)}
                    placeholder="Ex: Ghost_Sniper_242"
                    required
                    className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A0AEC0] mb-1">Nom & Prénom réels * :</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Brice Mabiala"
                    required
                    className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#A0AEC0] mb-1">Numéro WhatsApp * :</label>
                  <input
                    type="tel"
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                    placeholder="Ex: +242 06 123 4567"
                    required
                    className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A0AEC0] mb-1">Plateforme / Manette :</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="PlayStation 5 (DualSense)">PlayStation 5 (DualSense standard)</option>
                    <option value="PlayStation 5 (Manette Pro / Palettes)">PS5 Manette Pro / Edge</option>
                    <option value="Stick Arcade / Fightstick">Stick Arcade / Hitbox</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[11px] text-[#A0AEC0] space-y-1">
                <div className="text-white font-bold">Rappel des modalités :</div>
                <div>📍 Date & Lieu : {registeringTournament.date} à {registeringTournament.location}</div>
                <div>⚠️ Les places sont attribuées par ordre de validation via WhatsApp.</div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRegisteringTournament(null)}
                  className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-500"
                >
                  <MessageCircle size={15} />
                  <span>Valider mon inscription WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {viewingRulesTournament && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setViewingRulesTournament(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#12151E] p-6 shadow-2xl space-y-4">
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              RÈGLEMENT OFFICIEL DU TOURNOI
            </h3>
            <p className="font-['JetBrains_Mono'] text-xs text-[#3E9BFF]">
              {viewingRulesTournament.title}
            </p>

            <div className="space-y-2 border-y border-white/10 py-4 font-['Chakra_Petch'] text-xs text-[#D6DCE6]">
              {viewingRulesTournament.rules && viewingRulesTournament.rules.length > 0 ? (
                viewingRulesTournament.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 font-['JetBrains_Mono']">
                      {idx + 1}
                    </span>
                    <span>{rule}</span>
                  </div>
                ))
              ) : (
                <p className="text-[#7C8798]">Règlement standard Esport en vigueur (fair-play, respect des horaires).</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewingRulesTournament(null)}
                className="rounded-lg bg-white/10 px-5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white hover:bg-white/20"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

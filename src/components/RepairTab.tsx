import React, { useState } from "react";
import {
  Wrench,
  ShieldCheck,
  Zap,
  Clock,
  Tv,
  Fan,
  Gamepad2,
  Smartphone,
  Plus,
  Edit3,
  Trash2,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { RepairService, ShopInfo } from "../types";
import { buildWhatsAppRepairQuoteUrl } from "../services/storage";

interface RepairTabProps {
  services: RepairService[];
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onOpenAddService: () => void;
  onEditService: (service: RepairService) => void;
  onDeleteService: (service: RepairService) => void;
}

export const RepairTab: React.FC<RepairTabProps> = ({
  services,
  shopInfo,
  isAdmin,
  onOpenAddService,
  onEditService,
  onDeleteService,
}) => {
  // Quote form state
  const [deviceType, setDeviceType] = useState<string>("PlayStation 5");
  const [model, setModel] = useState<string>("PS5 Slim / Standard");
  const [issue, setIssue] = useState<string>("Port HDMI cassé / Pas d'affichage");
  const [urgency, setUrgency] = useState<string>("Standard (24h - 48h)");
  const [clientName, setClientName] = useState<string>("");

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const url = buildWhatsAppRepairQuoteUrl(shopInfo.whatsapp, {
      deviceType,
      model,
      issue,
      urgency,
      clientName,
    });
    window.open(url, "_blank");
  };

  const getServiceIcon = (iconName?: string) => {
    switch (iconName) {
      case "Tv":
        return Tv;
      case "Fan":
        return Fan;
      case "Gamepad2":
        return Gamepad2;
      case "Smartphone":
        return Smartphone;
      case "Zap":
        return Zap;
      default:
        return Wrench;
    }
  };

  return (
    <div id="repair-tab-view" className="space-y-10 pb-12 animate-fadeIn">
      {/* Admin Action Bar */}
      {isAdmin && (
        <div
          id="admin-repair-banner"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-['JetBrains_Mono'] font-bold">
              ESPACE PRO ATELIER : Ajoutez, modifiez ou supprimez les forfaits de réparation et tarifs.
            </span>
          </div>
          <button
            onClick={onOpenAddService}
            id="admin-add-repair-btn"
            className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 px-3.5 py-1.5 font-['JetBrains_Mono'] font-bold text-amber-300 hover:bg-amber-500/30 transition shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          >
            <Plus size={14} />
            <span>+ Ajouter un service / tarif</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F17] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold text-amber-300">
            <Wrench size={13} />
            <span>ATELIER TECHNIQUE DE POINTE</span>
          </div>

          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl font-black text-white">
            RÉPARATION & MAINTENANCE CONSOLES / MANETTES
          </h1>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-[#A0AEC0] leading-relaxed">
            Spécialistes en micro-soudure électronique, remplacement de ports HDMI 4K, application de métal liquide et calibration de joysticks magnétiques anti-drift. Diagnostic transparent et pièces d'origine garanties.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4 font-['JetBrains_Mono'] text-xs">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck size={16} />
              <span>Garantie 3 mois</span>
            </div>
            <div className="flex items-center gap-2 text-[#3E9BFF]">
              <Zap size={16} />
              <span>Diagnostic express</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <Clock size={16} />
              <span>Délai 24h - 48h</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <CheckCircle2 size={16} />
              <span>Pièces d'origine</span>
            </div>
          </div>
        </div>
      </section>

      {/* Express Quote Form & Quick Help */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive Quote Form */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="font-['Orbitron'] text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>FORMULAIRE DE DEVIS EXPRESS</span>
              </h2>
              <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] mt-0.5">
                Remplissez les détails de votre panne pour obtenir une estimation immédiate par nos techniciens sur WhatsApp.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendQuote} className="space-y-4 font-['JetBrains_Mono'] text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#A0AEC0] mb-1.5">Type d'équipement :</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="PlayStation 5">PlayStation 5 (Standard / Slim / Pro)</option>
                  <option value="PlayStation 4">PlayStation 4 (Fat / Slim / Pro)</option>
                  <option value="Xbox Series X/S">Xbox Series X / Series S</option>
                  <option value="Xbox One">Xbox One / One S / One X</option>
                  <option value="Nintendo Switch">Nintendo Switch / OLED / Lite</option>
                  <option value="Manette PS5 DualSense">Manette PS5 DualSense / Edge</option>
                  <option value="Manette Xbox">Manette Xbox Series / Elite</option>
                  <option value="Autre appareil">Autre console / accessoire</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A0AEC0] mb-1.5">Modèle ou détails :</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ex: PS5 Slim Edition Standard"
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#A0AEC0] mb-1.5">Nature de la panne constatée :</label>
              <textarea
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                rows={3}
                placeholder="Décrivez ce qui arrive (ex: la console s'allume mais écran noir, ventilateur très bruyant, joystick qui avance tout seul...)"
                className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#A0AEC0] mb-1.5">Délai souhaité :</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="Standard (24h - 48h)">Standard (24h - 48h)</option>
                  <option value="Urgent Express (Dans la journée)">Urgent Express (Dans la journée)</option>
                  <option value="Pas pressé / Dès que possible">Pas pressé / Dès que possible</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A0AEC0] mb-1.5">Votre Nom / Contact (optionnel) :</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Kevin M."
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              id="submit-repair-quote-btn"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_18px_rgba(16,185,129,0.4)] hover:bg-emerald-500 transition active:scale-95"
            >
              <MessageCircle size={17} />
              <span>Envoyer ma demande de devis sur WhatsApp</span>
            </button>
          </form>
        </div>

        {/* Why Choose House Game Workshop */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0E121B] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-['Orbitron'] text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span>PROCÉDURE ATELIER SÉCURISÉE</span>
            </h3>

            <div className="space-y-3 font-['Chakra_Petch'] text-xs text-[#A0AEC0]">
              <div className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 font-['JetBrains_Mono'] font-bold text-amber-400">
                  1
                </span>
                <div>
                  <strong className="text-white">Dépôt & Enregistrement</strong>
                  <p className="text-[#7C8798] mt-0.5">Dépôt en boutique ou envoi avec fiche de suivi personnalisée.</p>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#3E9BFF]/20 font-['JetBrains_Mono'] font-bold text-[#3E9BFF]">
                  2
                </span>
                <div>
                  <strong className="text-white">Diagnostic & Devis Gratuit</strong>
                  <p className="text-[#7C8798] mt-0.5">Inspection approfondie sous microscope et validation du coût avant tout travail.</p>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-['JetBrains_Mono'] font-bold text-emerald-400">
                  3
                </span>
                <div>
                  <strong className="text-white">Réparation & Banc de Test</strong>
                  <p className="text-[#7C8798] mt-0.5">Intervention avec pièces neuves certifiées et test d'effort prolongé.</p>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 font-['JetBrains_Mono'] font-bold text-purple-400">
                  4
                </span>
                <div>
                  <strong className="text-white">Remise & Garantie 90 Jours</strong>
                  <p className="text-[#7C8798] mt-0.5">Récupération avec facture et garantie pièces et main d'œuvre.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold font-['JetBrains_Mono']">
              <AlertCircle size={15} className="text-amber-400" />
              <span>Besoin d'un conseil technique direct ?</span>
            </div>
            <p className="mt-1 text-[11px] text-[#A0AEC0]">
              Notre équipe d'ingénieurs réparateurs vous répond directement sur WhatsApp au {shopInfo.whatsapp}.
            </p>
          </div>
        </div>
      </section>

      {/* Services & Price Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 gap-3">
          <div>
            <h2 className="font-['Orbitron'] text-xl font-bold text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3E9BFF]" />
              <span>CATALOGUE DES SERVICES DE RÉPARATION ({services.length})</span>
            </h2>
            <p className="font-['JetBrains_Mono'] text-xs text-[#7C8798] mt-0.5">
              Tarifs indicatifs pièces et main d'œuvre comprises.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenAddService}
              className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 px-3.5 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              <Plus size={14} />
              <span>Ajouter un service</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((srv) => {
            const Icon = getServiceIcon(srv.icon);
            return (
              <div
                key={srv.id}
                className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-[#0E121B] p-5 transition hover:border-amber-400/50 hover:bg-[#121723] shadow-lg"
              >
                <div className="space-y-4">
                  {/* Top category & badge */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-[#A0AEC0]">
                      {srv.category}
                    </span>
                    {srv.badge && (
                      <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold text-amber-300">
                        {srv.badge}
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-['Orbitron'] text-sm font-bold text-white leading-snug">
                      {srv.title}
                    </h3>
                  </div>

                  {/* Price & Delay highlight */}
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-3 font-['JetBrains_Mono']">
                    <div>
                      <div className="text-[10px] text-[#7C8798]">TARIF INDICATIF</div>
                      <div className="text-sm font-black text-amber-400">{srv.price}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#7C8798]">DÉLAI ESTIMÉ</div>
                      <div className="text-xs font-bold text-[#3E9BFF]">{srv.delay}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="font-['Chakra_Petch'] text-xs text-[#A0AEC0] leading-relaxed">
                    {srv.description}
                  </p>

                  {/* Features */}
                  {srv.features && srv.features.length > 0 && (
                    <ul className="space-y-1.5 border-t border-white/5 pt-3 font-['JetBrains_Mono'] text-[11px] text-[#D6DCE6]">
                      {srv.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/${shopInfo.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `🛠️ Bonjour House Game, je souhaite faire réparer ma console/manette pour le service : *${srv.title}* (${srv.price}). Merci de me donner la marche à suivre !`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 py-2 font-['JetBrains_Mono'] text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
                  >
                    <MessageCircle size={14} />
                    <span>Réserver sur WhatsApp</span>
                  </a>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditService(srv)}
                        title="Modifier ce service"
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#7C8798] hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-amber-300 transition"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteService(srv)}
                        title="Supprimer ce service"
                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-[#7C8798] hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

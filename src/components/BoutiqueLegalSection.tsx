import React, { useState } from "react";
import { FileText, RotateCcw, Smartphone, ShieldCheck, Banknote, CheckCircle, ChevronRight, X } from "lucide-react";

type LegalTab = "cgv" | "refund" | "payment" | null;

export const BoutiqueLegalSection: React.FC = () => {
  const [activeModal, setActiveModal] = useState<LegalTab>(null);

  return (
    <div id="boutique-legal-nav" className="my-6">
      {/* Quick Nav Cards / Pills for the 3 sub-pages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* CGV */}
        <button
          onClick={() => setActiveModal("cgv")}
          className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#0E121B] hover:border-[#3E9BFF]/50 hover:bg-[#131826] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3E9BFF]/10 text-[#3E9BFF] flex items-center justify-center shrink-0 border border-[#3E9BFF]/20 group-hover:scale-105 transition-transform">
              <FileText size={18} />
            </div>
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-white group-hover:text-[#3E9BFF] transition-colors">
                CGV
              </div>
              <div className="text-[11px] font-['JetBrains_Mono'] text-[#7C8798]">
                Conditions Générales de Vente
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#7C8798] group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Politique de remboursement et de retour */}
        <button
          onClick={() => setActiveModal("refund")}
          className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#0E121B] hover:border-amber-500/50 hover:bg-[#131826] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <RotateCcw size={18} />
            </div>
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                REMBOUSEMENT & RETOUR
              </div>
              <div className="text-[11px] font-['JetBrains_Mono'] text-[#7C8798]">
                Politique & Garanties
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#7C8798] group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Mode de paiement espèce & mobile phone */}
        <button
          onClick={() => setActiveModal("payment")}
          className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-[#0E121B] hover:border-emerald-500/50 hover:bg-[#131826] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Smartphone size={18} />
            </div>
            <div>
              <div className="font-['Orbitron'] text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                MODES DE PAIEMENT
              </div>
              <div className="text-[11px] font-['JetBrains_Mono'] text-[#7C8798]">
                Espèces & Mobile Money
              </div>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#7C8798] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Modal View for Selected Sub-page */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0E121B] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                {activeModal === "cgv" && <FileText className="w-5 h-5 text-[#3E9BFF]" />}
                {activeModal === "refund" && <RotateCcw className="w-5 h-5 text-amber-400" />}
                {activeModal === "payment" && <Smartphone className="w-5 h-5 text-emerald-400" />}
                <h3 className="font-['Orbitron'] text-base font-bold text-white">
                  {activeModal === "cgv" && "CONDITIONS GÉNÉRALES DE VENTE (CGV)"}
                  {activeModal === "refund" && "POLITIQUE DE REMBOURSEMENT ET DE RETOUR"}
                  {activeModal === "payment" && "MODES DE PAIEMENT : ESPÈCES & MOBILE MONEY"}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs font-['Chakra_Petch'] text-slate-300 leading-relaxed">
              {/* CGV Content */}
              {activeModal === "cgv" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <h4 className="font-bold text-white mb-1 text-sm font-['Orbitron']">
                      1. Authenticité & Conformité des Produits
                    </h4>
                    <p>
                      Tous les articles proposés par House Game (consoles de salon, manettes officielles, jeux vidéo neufs, high-tech et customisations) sont garantis 100% originaux, certifiés constructeur et scellés d'origine.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <h4 className="font-bold text-white mb-1 text-sm font-['Orbitron']">
                      2. Prise de Commande & Réservation
                    </h4>
                    <p>
                      Les commandes s'effectuent directement en ligne via notre interface avec validation instantanée sur WhatsApp auprès de nos conseillers officiels (Payelle, Gaëtan, Florence). Une facture numérique ou physique est systématiquement délivrée.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <h4 className="font-bold text-white mb-1 text-sm font-['Orbitron']">
                      3. Délais & Modalités de Livraison
                    </h4>
                    <p>
                      La livraison s'effectue sous 2h à 24h au Cameroun et ses environs. Le retrait direct et gratuit est également possible en boutique aux horaires d'ouverture (08h30 - 20h00).
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <h4 className="font-bold text-white mb-1 text-sm font-['Orbitron']">
                      4. Garantie Matérielle
                    </h4>
                    <p>
                      Les consoles bénéficient de la garantie constructeur de 12 mois. Les accessoires officiels bénéficient d'une garantie de remplacement sous 3 mois en cas de défaut matériel d'origine.
                    </p>
                  </div>
                </div>
              )}

              {/* Refund Content */}
              {activeModal === "refund" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200">
                    <p className="font-bold font-['Orbitron'] text-sm mb-1">
                      Engagement Sérénité House Game
                    </p>
                    <p>
                      Votre satisfaction est notre priorité absolue. Si un produit présente une anomalie dès l'ouverture, nous procédons à l'échange immédiat ou à la prise en charge sans frais.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <h4 className="font-bold text-white mb-1 text-sm font-['Orbitron']">
                      1. Délai de Signalement (48h à 7 jours)
                    </h4>
                    <p>
                      Tout article neuf scellé présentant un dysfonctionnement matériel constaté au déballage doit être signalé sous 48 heures ouvrées via WhatsApp avec photo/vidéo à l'appui et ticket de caisse.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <h4 className="font-bold text-white mb-1 text-sm font-['Orbitron']">
                      2. Conditions de Retour & Échange
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-300">
                      <li>L'article doit être rendu dans son emballage d'origine avec tous les câbles et manuels.</li>
                      <li>Diagnostic express immédiat en atelier House Game pour confirmer le défaut d'usine.</li>
                      <li>Échange à neuf immédiat selon disponibilité du stock.</li>
                      <li>En cas d'indisponibilité du produit, un avoir valable sans limite de durée ou un remboursement intégral est effectué.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <h4 className="font-bold text-white mb-1 text-sm font-['Orbitron']">
                      3. Articles Customisés (Créations Vicky)
                    </h4>
                    <p>
                      Les manettes et pièces d'art customisées à la main par Vicky font l'objet d'un contrôle rigoureux avant remise. La partie électronique (sticks, gâchettes, batterie) bénéficie de la garantie atelier de 3 mois.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Content */}
              {activeModal === "payment" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                    <p className="font-bold font-['Orbitron'] text-sm mb-1">
                      Paiements 100% Flexibles & Sécurisés
                    </p>
                    <p>
                      House Game accepte les paiements en espèces à la livraison ou directement par Mobile Money pour vous garantir un confort total.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Espèce */}
                    <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold font-['Orbitron'] text-sm">
                        <Banknote className="w-5 h-5 text-emerald-400" />
                        <span>Paiement en Espèces</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        <li>Au comptoir en boutique lors du retrait.</li>
                        <li>En mains propres à notre livreur officiel après vérification du colis.</li>
                        <li>Reçu et reçu de caisse remis sur place.</li>
                      </ul>
                    </div>

                    {/* Mobile Phone / Mobile Money */}
                    <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold font-['Orbitron'] text-sm">
                        <Smartphone className="w-5 h-5 text-[#3E9BFF]" />
                        <span>Mobile Phone & Transfert</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        <li>Airtel Money</li>
                        <li>MTN Mobile Money</li>
                        <li>Wave & Virements instantanés</li>
                        <li>Validation immédiate par SMS et WhatsApp</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <p className="text-slate-400">
                      Les coordonnées téléphoniques exactes pour le transfert Mobile Money vous sont confirmées directement sur WhatsApp lors de la finalisation de votre commande par Payelle, Gaëtan ou Florence.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end border-t border-slate-800">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
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

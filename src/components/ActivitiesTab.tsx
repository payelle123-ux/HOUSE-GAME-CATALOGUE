import React, { useState } from "react";
import { HomeContent, ShopInfo, NavTabId } from "../types";
import {
  Activity,
  ShoppingBag,
  Wrench,
  Trophy,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Award,
  Users,
} from "lucide-react";

interface ActivitiesTabProps {
  homeContent: HomeContent;
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onNavigateTab: (tabId: NavTabId) => void;
}

interface ActivityItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  features: string[];
  icon: string;
  targetTab?: NavTabId;
}

export const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  homeContent,
  shopInfo,
  isAdmin,
  onNavigateTab,
}) => {
  const [activitiesList, setActivitiesList] = useState<ActivityItem[]>([
    {
      id: "act-1",
      title: "Vente & Distribution Gaming Officielle",
      category: "Boutique & Matériel",
      badge: "100% Neuf & Scellé",
      description:
        "Importation et distribution directe de consoles de salon next-gen (PlayStation 5, Xbox Series X/S, Nintendo Switch OLED), accessoires d'origine, manettes scellées et jeux vidéo récents avec garantie constructeur.",
      features: [
        "Consoles scellées avec facture officielle",
        "Manettes officielles DualSense & Xbox Wireless",
        "Casques audio gaming haute immersion & volants",
        "Jeux vidéo originaux garantis zéro contrefaçon",
      ],
      icon: "ShoppingBag",
      targetTab: "shop",
    },
    {
      id: "act-2",
      title: "Atelier de Réparation Haute Précision",
      category: "Maintenance Électronique",
      badge: "Diagnostic Express 24h",
      description:
        "Atelier technique sur place équipé d'outils de micro-soudure et microscopes thermiques. Remplacement de connecteurs HDMI, résolution des surchauffes, réparation de pannes de cartes mères et sticks à effet Hall anti-drift.",
      features: [
        "Remplacement ports HDMI & connectique",
        "Nettoyage intégral & changement métal liquide / pâte thermique",
        "Installation de sticks anti-drift Hall Effect",
        "Garantie réparation pièces & main d'œuvre",
      ],
      icon: "Wrench",
      targetTab: "service",
    },
    {
      id: "act-3",
      title: "Esport & Tournois Officiels avec Cash Prizes",
      category: "Compétition & Circuit Pro",
      badge: "Cash Prizes Garantis",
      description:
        "Créateur et organisateur de circuits esportifs majeurs en présentiel et en ligne sur EA FC 25, Tekken 8, Naruto Storm Connections et Street Fighter 6. Arbitrage officiel, streaming et cash prizes remis sur place.",
      features: [
        "Tournois hebdomadaires et championnats saisonniers",
        "Cash prizes en espèces et lots partenaires",
        "Écrans haute fréquence et connectivité Starlink",
        "Classement officiel des meilleurs joueurs",
      ],
      icon: "Trophy",
      targetTab: "events",
    },
    {
      id: "act-4",
      title: "HG Event & Soirées Communautaires",
      category: "Événementiel & Afterworks",
      badge: "6 Formats Exclusifs",
      description:
        "Développement de 6 concepts exclusifs de rassemblement gaming pour fédérer la jeunesse, les familles et les entreprises : Apéro Gaming, House Game Day, HG Challenge, Question pour Gameur, Afro-Respawn et Fashion Week Otaku.",
      features: [
        "Apéro Gaming convivial et afterworks détendus",
        "House Game Day pour grands rassemblements",
        "Question pour Gameur : quiz et culture geek",
        "Fashion Week Otaku : cosplay et culture manga",
      ],
      icon: "Calendar",
      targetTab: "events",
    },
    {
      id: "act-5",
      title: "Customisation Artistique (Vicky Studio)",
      category: "Art & Création",
      badge: "Pièces Uniques",
      description:
        "Partenariat d'excellence avec Vicky pour des personnalisations artistiques haut de gamme de manettes, coques de consoles et casques : peintures acryliques vernies, coques custom et palettes compétition.",
      features: [
        "Manettes collector peintes à la main",
        "Coques PS5 et Xbox personnalisées sur mesure",
        "Ajout de boutons palettes arrière pour esport",
        "Finition vernis pro résistant à l'usure",
      ],
      icon: "Sparkles",
      targetTab: "shop",
    },
    {
      id: "act-6",
      title: "HG Campus & Initiation aux Métiers du Numérique",
      category: "Formation & Éducation",
      badge: "Ateliers & Mentorat",
      description:
        "Sessions pédagogiques d'initiation aux métiers de l'esport, du streaming, de l'animation d'événements et de la maintenance électronique pour la nouvelle génération de talents numériques.",
      features: [
        "Initiation au streaming et montage vidéo gaming",
        "Apprentissage des bases de l'entretien console",
        "Masterclasses avec des joueurs compétitifs",
        "Accompagnement et coaching de jeunes équipes",
      ],
      icon: "Activity",
      targetTab: "campus",
    },
  ]);

  return (
    <div id="activities-tab-view" className="space-y-10 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#1E160C] via-[#2A1E0E] to-[#0E121B] p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3.5 py-1 font-['JetBrains_Mono'] text-xs font-bold text-amber-300">
            <Activity size={14} className="text-amber-400" />
            <span>PÔLE D'EXPERTISE MULTI-SECTEUR</span>
          </div>

          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            NOS ACTIVITÉS & ENGAGEMENTS
          </h1>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-slate-300 leading-relaxed">
            De la vente de matériel scellé à la micro-soudure électronique, en passant par les tournois esport et les grandes soirées communautaires, découvrez les piliers opérationnels de House Game.
          </p>
        </div>
      </div>

      {/* Grand Bloc Présentation Complète À Propos de House Game (gardé pour la page activités) */}
      <section className="rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-10 space-y-6">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#3E9BFF] font-bold">
            <Users size={16} />
            <span>À PROPOS DE LA SOCIÉTÉ HOUSE GAME</span>
          </div>

          <h2 className="font-['Orbitron'] text-xl sm:text-3xl font-bold text-white leading-tight">
            L'exigence professionnelle au service de la communauté des joueurs
          </h2>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-slate-300 leading-relaxed">
            {homeContent.presentationText ||
              "House Game est la référence du jeu vidéo et de la culture gaming. Fondée pour répondre à une forte demande de fiabilité et d'authenticité, notre structure regroupe sous un même toit un pôle de distribution certifié, un laboratoire technique de réparation de pointe, un circuit d'événements immersifs et un pôle esport structuré. Nous combattons la contrefaçon en garantissant des équipements neufs, scellés d'origine avec suivi constructeur."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="text-amber-400 font-bold font-['Orbitron'] text-lg mb-1">
                Authenticité 100%
              </div>
              <p className="text-xs text-slate-400">
                Chaque console et manette est scellée avec numéro de série traçable.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="text-[#3E9BFF] font-bold font-['Orbitron'] text-lg mb-1">
                Laboratoire Sur Place
              </div>
              <p className="text-xs text-slate-400">
                Techniciens qualifiés, microscope électronique et outillage certifié.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <div className="text-purple-400 font-bold font-['Orbitron'] text-lg mb-1">
                Communauté Active
              </div>
              <p className="text-xs text-slate-400">
                Des centaines de passionnés réunis lors de nos sessions régulières.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grille Détaillée des 6 Pôles d'Activités */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-['Orbitron'] text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>LES 6 PÔLES OPÉRATIONNELS HOUSE GAME</span>
          </h2>
          <span className="text-xs font-['JetBrains_Mono'] text-slate-500">
            {activitiesList.length} domaines d'action
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activitiesList.map((act) => (
            <div
              key={act.id}
              className="rounded-2xl border border-white/10 bg-[#0E121B] p-6 flex flex-col justify-between hover:border-amber-500/40 hover:bg-[#121624] transition-all space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-['JetBrains_Mono'] uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {act.badge}
                  </span>
                  <span className="text-[11px] font-['JetBrains_Mono'] text-slate-500">
                    {act.category}
                  </span>
                </div>

                <h3 className="font-['Orbitron'] text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {act.title}
                </h3>

                <p className="font-['Chakra_Petch'] text-xs text-slate-300 leading-relaxed">
                  {act.description}
                </p>

                {/* Features Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  {act.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {act.targetTab && (
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab(act.targetTab!)}
                    className="w-full py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-amber-500 hover:text-slate-950 font-['Orbitron'] text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
                  >
                    <span>Accéder au pôle</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

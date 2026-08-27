import {
  RepairService,
  GamingEvent,
  Tournament,
  HomeContent,
  CustomTab,
} from "../types";

export const INITIAL_HOME_CONTENT: HomeContent = {
  heroTitle: "L'UNIVERS ULTIME DU GAMING & DE L'ESPORT",
  heroSubtitle: "Vente de consoles & accessoires neufs et certifiés, atelier de réparation haute précision, et tournois Esport d'envergure.",
  presentationText:
    "Fondée par des passionnés de jeux vidéo, HOUSE GAME est la référence incontournable pour la communauté des gamers. Nous combinons un catalogue complet des dernières consoles de salon (PlayStation 5, Xbox Series, Nintendo Switch), un atelier technique de réparation de pointe (micro-soudure HDMI, dérive joystick Hall Effect, maintenance thermique) et l'organisation régulière de tournois Esport officiels avec cash prizes garantis.",
  bannerImage:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80",
  stats: [
    {
      label: "CONSOLES LIVRÉES",
      value: "1 250+",
      desc: "Matériel neuf garanti & certifié",
    },
    {
      label: "RÉPARATIONS ATELIER",
      value: "850+",
      desc: "Composants d'origine & test 48h",
    },
    {
      label: "TOURNOIS ESPORT",
      value: "35+",
      desc: "Cash prizes distribués aux champions",
    },
    {
      label: "SATISFACTION CLIENT",
      value: "99.4%",
      desc: "Service après-vente & support WhatsApp",
    },
  ],
  values: [
    {
      title: "Matériel 100% Authentique",
      desc: "Toutes nos consoles, manettes et jeux sont scellés d'origine avec garantie constructeur certifiée.",
      iconName: "ShieldCheck",
    },
    {
      title: "Atelier Technique Spécialisé",
      desc: "Diagnostic express, micro-soudure haute précision, remplacement de ports HDMI et calibration de sticks.",
      iconName: "Wrench",
    },
    {
      title: "Compétitions & Cash Prizes",
      desc: "Organisation de championnats officiels sur EA FC, Tekken 8 et Storm Connexions pour révéler les talents.",
      iconName: "Trophy",
    },
    {
      title: "Commande & Suivi WhatsApp",
      desc: "Commandez en un clic avec devis immédiat, livraison rapide et service d'assistance réactif 7j/7.",
      iconName: "MessageCircle",
    },
  ],
};

export const INITIAL_REPAIR_SERVICES: RepairService[] = [
  {
    id: "rep-1",
    title: "Remplacement Port HDMI 4K (PS5 / Xbox Series / PS4)",
    category: "Micro-Soudure & Écran",
    price: "25 000 FCFA",
    delay: "24h - 48h",
    description:
      "Votre console s'allume mais aucun affichage sur la TV ? Port HDMI tordu ou broches cassées ? Remplacement complet avec port HDMI 2.1 renforcé haute durabilité et test vidéo 4K HDR 120Hz.",
    features: [
      "Port HDMI 2.1 d'origine renforcé",
      "Micro-soudure sous microscope",
      "Nettoyage complet du circuit",
      "Garantie réparation 3 mois",
    ],
    icon: "Tv",
    badge: "Très demandé",
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: "rep-2",
    title: "Changement Pâte Thermique & Métal Liquide + Dépoussiérage",
    category: "Refroidissement & Bruit",
    price: "15 000 FCFA",
    delay: "4h - 24h",
    description:
      "Console qui souffle fort, surchauffe ou s'éteint en plein jeu ? Dépoussiérage ultra-sonique du ventilateur et des grilles, réapplication de métal liquide de qualité aérospatiale ou pâte thermique haute conductivité.",
    features: [
      "Démontage complet et nettoyage intégral",
      "Métal liquide d'origine (PS5)",
      "Pâte thermique haute performance (Xbox/PS4)",
      "Baisse drastique du bruit et température",
    ],
    icon: "Fan",
    badge: "Entretien préventif",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "rep-3",
    title: "Réparation Stick Drift Manette (Capteurs Magnétiques Hall Effect)",
    category: "Manettes DualSense / Xbox / Switch",
    price: "10 000 FCFA",
    delay: "2h - 24h",
    description:
      "Votre personnage avance tout seul ou la visée dérive ? Remplacement du mécanisme analogique défaillant par des capteurs magnétiques Hall Effect inusables pour une précision chirurgicale permanente.",
    features: [
      "Capteurs magnétiques anti-drift",
      "Calibration logicielle précise",
      "Test complet des touches et gâchettes",
      "Compatible PS5, PS4, Xbox, Switch",
    ],
    icon: "Gamepad2",
    badge: "Anti-Drift définitif",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "rep-4",
    title: "Réparation Alimentation & Carte Mère (Console morte / BLOD)",
    category: "Électronique & Énergie",
    price: "Sur Devis (Dès 30 000 FCFA)",
    delay: "48h - 72h",
    description:
      "La console ne s'allume plus du tout (aucun voyant ou bip court) ? Diagnostic électronique complet, réparation des circuits d'alimentation, fusibles, MOSFETs et régulateurs de tension.",
    features: [
      "Diagnostic électronique approfondi",
      "Test des composants de puissance",
      "Remplacement des puces défectueuses",
      "Devis gratuit avant intervention",
    ],
    icon: "Zap",
    badge: "Diagnostic Gratuit",
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: "rep-5",
    title: "Réparation Écran & Port USB-C Nintendo Switch / OLED",
    category: "Portables",
    price: "20 000 FCFA",
    delay: "24h - 48h",
    description:
      "Port de charge USB-C endommagé, console qui ne charge plus, écran LCD/OLED cassé ou problème de connecteurs Joy-Con. Réparation rapide avec pièces d'origine Nintendo.",
    features: [
      "Port de charge USB-C officiel",
      "Remplacement écran tactile & LCD/OLED",
      "Réparation connecteurs Joy-Con",
      "Test de charge et mode Dock",
    ],
    icon: "Smartphone",
    badge: "Nintendo Certifié",
    createdAt: Date.now(),
  },
];

export const INITIAL_EVENTS: GamingEvent[] = [
  {
    id: "evt-1",
    title: "Soirée Lancement EA SPORTS FC & Tournoi Nocturne",
    date: "Vendredi 12 Septembre 2026",
    time: "18h00 - 23h30",
    location: "Salle Gaming House Game - Brazzaville",
    description:
      "Rejoignez la communauté House Game pour célébrer la sortie de la nouvelle saison de football virtuel ! Écrans géants 4K 120Hz, showmatchs en direct, tournoi blitz avec lots exclusifs et rafraîchissements offerts.",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80",
    entry: "Gratuit (Sur réservation WhatsApp)",
    status: "Inscriptions ouvertes",
    badge: "Événement Majeur",
    highlights: [
      "Tournoi Blitz 1v1",
      "Bornes PS5 Slim en libre accès",
      "Goodies & T-shirts House Game à gagner",
      "Buffet & Boissons offerts",
    ],
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: "evt-2",
    title: "Session Découverte Casques VR & Rétrogaming",
    date: "Samedi 20 Septembre 2026",
    time: "14h00 - 20h00",
    location: "Espace Expérience House Game",
    description:
      "Venez tester en exclusivité le PlayStation VR2 sur simulateurs de course et jeux d'action immersifs, ainsi que notre espace rétrogaming avec bornes d'arcade authentiques et consoles rétro cultes.",
    image:
      "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1000&q=80",
    entry: "2 500 FCFA / personne (Accès illimité 2h)",
    status: "Inscriptions ouvertes",
    badge: "Expérience Immersive",
    highlights: [
      "2 Postes PS VR2 Ultra-HD",
      "Volants avec retour de force Direct Drive",
      "Bornes Arcade Street Fighter & Metal Slug",
    ],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "evt-3",
    title: "Atelier Customisation Manettes & Démonstration Anti-Drift",
    date: "Samedi 27 Septembre 2026",
    time: "15h00 - 18h00",
    location: "Atelier Technique House Game",
    description:
      "Découvrez les secrets de fabrication et de personnalisation de vos manettes pro : installation de joysticks magnétiques Hall Effect, coques personnalisées, gravure laser et astuces pour prolonger la durée de vie de votre équipement.",
    image:
      "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1000&q=80",
    entry: "Gratuit",
    status: "À venir",
    badge: "Atelier Pro",
    highlights: [
      "Diagnostic gratuit de vos manettes",
      "Démonstration de micro-soudure en direct",
      "-20% sur les réparations effectuées sur place",
    ],
    createdAt: Date.now() - 86400000 * 1,
  },
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: "tourn-1",
    title: "HOUSE GAME CHAMPIONSHIP : EA SPORTS FC 27",
    game: "EA SPORTS FC 27",
    cashPrize: "300 000 FCFA",
    entryFee: "5 000 FCFA / Joueur",
    date: "Samedi 19 & Dimanche 20 Septembre 2026",
    time: "À partir de 10h00",
    location: "Arène Esport House Game - Brazzaville",
    maxSlots: 64,
    currentSlots: 42,
    platform: "PlayStation 5 (Moniteurs 144Hz)",
    format: "1v1 - Phase de poules puis Arbre à Double Élimination (Bo3)",
    rules: [
      "Durée mi-temps : 6 minutes",
      "Vitesse de jeu : Normale",
      "Équipes autorisées : Clubs uniquement (Pas de All-Star / Soccer Aid)",
      "Configuration manette : Tactique ou Classique (Assistance standard)",
      "Retard de plus de 10 min = Forfait direct",
    ],
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80",
    status: "Inscriptions ouvertes",
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "tourn-2",
    title: "KING OF IRON FIST BRAZZAVILLE : TEKKEN 8",
    game: "Tekken 8",
    cashPrize: "150 000 FCFA",
    entryFee: "3 000 FCFA / Joueur",
    date: "Dimanche 27 Septembre 2026",
    time: "13h00 - 19h00",
    location: "Salle Esport House Game",
    maxSlots: 32,
    currentSlots: 24,
    platform: "PlayStation 5",
    format: "1v1 - Arbre à Double Élimination (First to 2 / Top 8 en First to 3)",
    rules: [
      "Rounds : 3 rounds gagnants",
      "Timer : 60 secondes",
      "Tous les personnages officiels autorisés",
      "Sélection du stage : Random premier match, puis choix du perdant",
      "Manettes personnelles et sticks arcade acceptés après vérification",
    ],
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
    status: "Inscriptions ouvertes",
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: "tourn-3",
    title: "NINJA WARFARE : NARUTO X BORUTO STORM CONNECTIONS",
    game: "Naruto x Boruto Storm Connections",
    cashPrize: "100 000 FCFA",
    entryFee: "2 500 FCFA / Joueur",
    date: "Samedi 3 Octobre 2026",
    time: "14h00 - 19h30",
    location: "Espace House Game",
    maxSlots: 32,
    currentSlots: 18,
    platform: "PlayStation 5",
    format: "1v1 Équipes (Team Match) - Arbre à élimination directe (Bo3 / Finale Bo5)",
    rules: [
      "Mode : Combat en équipe classique 3v3",
      "Dégâts : Défaut",
      "Temps : 99 secondes",
      "Objets de combat désactivés",
      "Interdiction de répéter les glitchs d'invisibilité/boucle infinie",
    ],
    image:
      "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1000&q=80",
    status: "Inscriptions ouvertes",
    createdAt: Date.now() - 86400000 * 3,
  },
];

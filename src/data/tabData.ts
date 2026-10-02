import {
  RepairService,
  GamingEvent,
  Tournament,
  HomeContent,
  TickerItem,
  HgEventItem,
  CampusModule,
  CampusInfo,
  ActivityItem,
  ActivitiesBannerInfo,
} from "../types";
import { OFFICIAL_BANNER_SRC } from "./logo";

export const INITIAL_TICKER_ITEMS: TickerItem[] = [
  {
    id: "tick-1",
    tag: "PROMO DE LA SEMAINE",
    text: "Pack PS5 Slim Standard 1 To + 2ème Manette DualSense + EA Sports FC 25 à prix exclusif !",
    linkTab: "shop",
    highlight: true,
  },
  {
    id: "tick-2",
    tag: "NOUVEAUTÉ EXCLUSIVE",
    text: "Collection Customisation Vicky : Manettes PS5 peintes à la main & coques artistiques en stock limité.",
    linkTab: "shop",
    highlight: false,
  },
  {
    id: "tick-3",
    tag: "TOURNOI PROGRAMMÉ",
    text: "HG CHALLENGE EA SPORTS FC 27 : Cash Prize 300 000 FCFA — Réservez votre slot immédiatement !",
    linkTab: "events",
    highlight: true,
  },
  {
    id: "tick-4",
    tag: "RAYON HIGH-TECH",
    text: "Arrivage Chargeurs Rapides GaN 65W, Power Banks 20 000 mAh et Câbles 100W haute résistance.",
    linkTab: "shop",
    highlight: false,
  },
  {
    id: "tick-5",
    tag: "HG EVENT & SOIRÉES",
    text: "Nouvelle session APERO GAMING & AFRO-RESPAWN ce week-end à l'arène House Game !",
    linkTab: "events",
    highlight: true,
  },
];

export const INITIAL_HOME_CONTENT: HomeContent = {
  heroTitle: "L'UNIVERS ULTIME DU GAMING & DE L'ESPORT",
  heroSubtitle:
    "Vente de consoles & accessoires neufs et certifiés, atelier de réparation haute précision, et tournois Esport d'envergure.",
  presentationText:
    "Fondée par des passionnés de jeux vidéo, HOUSE GAME est la référence incontournable pour la communauté des gamers. Nous combinons un catalogue complet des dernières consoles de salon (PlayStation 5, Xbox Series, Nintendo Switch), un atelier technique de réparation de pointe (micro-soudure HDMI, dérive joystick Hall Effect, maintenance thermique) et l'organisation régulière de tournois Esport officiels avec cash prizes garantis.",
  aboutText:
    "House Game est né d'une vision ambitieuse : offrir aux joueurs et passionnés de la région un écosystème 100% dédié au jeu vidéo, fondé sur l'authenticité certifiée, la performance technique et le rassemblement communautaire. Que vous cherchiez la dernière console next-gen scellée d'origine, un accessoire introuvable, une réparation électronique haute précision sous microscope ou une arène pour mesurer vos talents esportifs, l'équipe House Game met son expertise et sa passion au service de votre expérience.",
  bannerImage: OFFICIAL_BANNER_SRC,
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
  partners: [
    {
      name: "Sony PlayStation",
      category: "Consoles & Accessoires Officiels",
      logo: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=150&auto=format&fit=crop&q=80",
      tagline: "Partenaire matériel & tournois officiels",
    },
    {
      name: "Microsoft Xbox",
      category: "Consoles Series X/S",
      logo: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=150&auto=format&fit=crop&q=80",
      tagline: "Distribution certifiée & manettes officielles",
    },
    {
      name: "Nintendo",
      category: "Switch & Jeux Portables",
      logo: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=150&auto=format&fit=crop&q=80",
      tagline: "Gamme nomade & univers familial",
    },
    {
      name: "EA SPORTS",
      category: "Éditeur de Jeux & Compétitions",
      logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80",
      tagline: "Licences FC & circuits compétitifs",
    },
    {
      name: "Starlink Pro",
      category: "Connectivité Fibre Satellitaire",
      logo: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=150&auto=format&fit=crop&q=80",
      tagline: "Réseau ultra-basse latence pour tournois en ligne",
    },
    {
      name: "Vicky Custom Studio",
      category: "Art & Personnalisation Gaming",
      logo: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=150&auto=format&fit=crop&q=80",
      tagline: "Créations exclusives de manettes & coques d'art",
    },
  ],
};

export const INITIAL_HG_EVENTS: HgEventItem[] = [
  {
    id: "hge-1",
    title: "APÉRO GAMING",
    slug: "apero-gaming",
    badge: "Convivialité & Gaming",
    coverImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    definition:
      "L'APÉRO GAMING est un rendez-vous convivial autour du gaming, permettant aux passionnés de jeux vidéo de se retrouver, jouer, échanger et passer un moment agréable dans l'univers HOUSE GAME.",
    iconName: "GlassWater",
    hasScheduledEvent: false,
    nextEdition: {
      title: "Prochaine Édition Apéro Gaming",
      date: "",
      time: "",
      location: "Lounge House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
      entryFee: "",
      description: "Informations pratiques et programme à venir.",
      bookingOpen: false,
    },
    archives: [
      {
        id: "arc-1",
        title: "Apéro Gaming — Édition Rétro & Convivialité",
        imageUrl:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Rencontre communautaire et sessions de jeux multijoueurs.",
      },
      {
        id: "arc-2",
        title: "Session multijoueur sur grands écrans",
        imageUrl:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Tournois amicaux et ambiance détente.",
      },
      {
        id: "arc-3",
        title: "Espace Lounge & échanges entre passionnés",
        imageUrl:
          "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Moments de partage au sein de la communauté.",
      },
    ],
  },
  {
    id: "hge-2",
    title: "HOUSE GAME DAY",
    slug: "house-game-day",
    badge: "Journée Spéciale",
    coverImage:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    definition:
      "Le HOUSE GAME DAY est une journée spéciale consacrée au gaming et au divertissement, avec différentes activités et animations proposées par HOUSE GAME.",
    iconName: "Sparkles",
    hasScheduledEvent: false,
    nextEdition: {
      title: "Prochaine Journée House Game Day",
      date: "",
      time: "",
      location: "Complexe House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      entryFee: "",
      description: "Programme et activités dévoilés très prochainement.",
      bookingOpen: false,
    },
    archives: [
      {
        id: "arc-4",
        title: "House Game Day — Animations grand public",
        imageUrl:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Jeux en libre accès et découverte de nouvelles consoles.",
      },
      {
        id: "arc-5",
        title: "Expériences Réalité Virtuelle & Simulateurs",
        imageUrl:
          "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Immersion VR pour petits et grands.",
      },
      {
        id: "arc-6",
        title: "Défis et animations en direct",
        imageUrl:
          "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Moments forts et récompenses partagés.",
      },
    ],
  },
  {
    id: "hge-3",
    title: "HG CHALLENGE",
    slug: "hg-challenge",
    badge: "Défis & Compétitions",
    coverImage:
      "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80",
    definition:
      "Le HG CHALLENGE est un concept de défis et de compétitions gaming permettant aux joueurs de s'affronter dans une ambiance compétitive et conviviale.",
    iconName: "Trophy",
    hasScheduledEvent: false,
    nextEdition: {
      title: "Prochain HG Challenge",
      date: "",
      time: "",
      location: "Arène House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80",
      entryFee: "",
      gameOrTheme: "",
      description: "Jeu en compétition et règlement communiqués bientôt.",
      bookingOpen: false,
    },
    archives: [
      {
        id: "arc-7",
        title: "Grande finale compétitive sur écran géant",
        imageUrl:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Affrontements intenses entre les meilleurs compétiteurs.",
      },
      {
        id: "arc-8",
        title: "Podium et remise des trophées",
        imageUrl:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Célébration des champions du tournoi.",
      },
    ],
  },
  {
    id: "hge-4",
    title: "QUESTION POUR GAMEUR",
    slug: "question-pour-gameur",
    badge: "Quiz Culture Gaming",
    coverImage:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    definition:
      "QUESTION POUR GAMEUR est un concept de quiz dédié à la culture gaming et à l'univers du jeu vidéo, permettant aux participants de tester leurs connaissances et de relever différents défis.",
    iconName: "HelpCircle",
    hasScheduledEvent: false,
    nextEdition: {
      title: "Prochaine Session Question Pour Gameur",
      date: "",
      time: "",
      location: "Scène House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
      entryFee: "",
      description: "Buzzers, blind-tests et énigmes gaming.",
      bookingOpen: false,
    },
    archives: [
      {
        id: "arc-9",
        title: "Plateau de quiz et buzzers en action",
        imageUrl:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Épreuves de culture générale et blind tests gaming.",
      },
      {
        id: "arc-10",
        title: "Manches éliminatoires et suspense",
        imageUrl:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Les meilleurs gameurs testent leurs connaissances.",
      },
    ],
  },
  {
    id: "hge-5",
    title: "AFRO-RESPAWN",
    slug: "afro-respawn",
    badge: "Culture Gaming Africaine",
    coverImage:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    definition:
      "AFRO-RESPAWN est un événement mettant à l'honneur la culture gaming et la culture africaine à travers une expérience mêlant jeux vidéo, communauté, divertissement et différentes animations.",
    iconName: "Flame",
    hasScheduledEvent: false,
    nextEdition: {
      title: "Prochaine Édition Afro-Respawn",
      date: "",
      time: "",
      location: "Espace Événementiel House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80",
      entryFee: "",
      description: "Programme et animations annoncés sous peu.",
      bookingOpen: false,
    },
    archives: [
      {
        id: "arc-11",
        title: "Afro-Respawn — Créations et jeux indépendants",
        imageUrl:
          "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Découverte de talents et créations du continent.",
      },
      {
        id: "arc-12",
        title: "Rencontres communautaires et gaming",
        imageUrl:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Partage entre passionnés de pop culture et de jeux.",
      },
    ],
  },
  {
    id: "hge-6",
    title: "FASHION WEEK OTAKU",
    slug: "fashion-week-otaku",
    badge: "Cosplay & Pop Culture",
    coverImage:
      "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1200&q=80",
    definition:
      "La FASHION WEEK OTAKU est un événement consacré à la culture Otaku, au cosplay, à la mode et à l'univers de la pop culture japonaise.",
    iconName: "Shirt",
    hasScheduledEvent: false,
    nextEdition: {
      title: "Prochaine Fashion Week Otaku",
      date: "",
      time: "",
      location: "Arène House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1200&q=80",
      entryFee: "",
      description: "Défilé cosplay, concours et exposition pop culture.",
      bookingOpen: false,
    },
    archives: [
      {
        id: "arc-13",
        title: "Fashion Week Otaku — Défilé Cosplay",
        imageUrl:
          "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Costumes d'exception et passion manga sur scène.",
      },
      {
        id: "arc-14",
        title: "Moments forts & Remise des prix",
        imageUrl:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        editionDate: "Édition précédente",
        description: "Séance shooting photo et récompenses cosplay.",
      },
    ],
    customLink: {
      label: "Découvrir la Fashion Week Otaku",
      url: "",
      note: "Lien à vérifier avec Rita avant publication",
    },
  },
];

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
    location: "Salle Gaming House Game - Cameroun",
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
    location: "Arène Esport House Game - Cameroun",
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
    title: "KING OF IRON FIST CAMEROUN : TEKKEN 8",
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
];

export const INITIAL_CAMPUS_INFO: CampusInfo = {
  badge: "FORMATION & TRANSMISSION DU SAVOIR",
  heroTitle: "HG CAMPUS • L'ACADÉMIE GAMING",
  heroDescription:
    "Parce que le jeu vidéo est un métier, une passion et un vecteur d'opportunités, House Game Campus transmet aux jeunes talents les compétences clés du streaming, de l'esport et de la technique.",
  partnerTitle: "Vous représentez une école, une université ou une association ?",
  partnerDescription:
    "House Game Campus propose des interventions personnalisées, des journées portes ouvertes et des ateliers de découverte des métiers du multimédia et du jeu vidéo.",
  partnerButtonText: "Proposer un partenariat",
};

export const INITIAL_CAMPUS_MODULES: CampusModule[] = [
  {
    id: "mod-1",
    title: "Initiation au Streaming & Création de Contenu Gaming",
    level: "Débutant à Intermédiaire",
    duration: "4 Sessions (12 heures)",
    iconName: "Video",
    color: "purple",
    description:
      "Maîtrisez OBS Studio, la configuration de cartes d'acquisition, la gestion du son et du micro, et apprenez à captiver votre audience sur Twitch, YouTube et TikTok.",
    outcomes: [
      "Configuration complète d'un setup de stream",
      "Overlays dynamiques et alertes interactives",
      "Techniques d'animation et de diction en direct",
    ],
    price: "Tarif accessible",
  },
  {
    id: "mod-2",
    title: "Coaching Compétitif Esport & Mental de Vainqueur",
    level: "Tous niveaux",
    duration: "Modules individuels ou équipes",
    iconName: "Trophy",
    color: "amber",
    description:
      "Analyse de gameplay détaillée sur EA FC 25 ou Tekken 8 avec des coachs expérimentés. Optimisation des mécaniques, gestion du stress et stratégies de tournois.",
    outcomes: [
      "Revue des matchs et correction des erreurs récurrentes",
      "Préparation mentale pour les grands tournois",
      "Perfectionnement tactique et exécution des combos",
    ],
    price: "Sur mesure",
  },
  {
    id: "mod-3",
    title: "Atelier Entretien Console & Maintenance Préventive",
    level: "Accessible à tous",
    duration: "Atelier pratique 3 heures",
    iconName: "Wrench",
    color: "cyan",
    description:
      "Apprenez les bons gestes pour dépoussiérer votre console sans risque, détecter les premiers signes d'usure de votre manette et prolonger la durée de vie de votre équipement.",
    outcomes: [
      "Démontage sécurisé des coques et ventilateurs",
      "Nettoyage des radiateurs et aérations",
      "Pratiques de stockage pour éviter les surchauffes",
    ],
    price: "Atelier pratique",
  },
  {
    id: "mod-4",
    title: "Organisation de Tournois & Arbitrage Esport",
    level: "Passionnés & Associatifs",
    duration: "Formation 2 jours",
    iconName: "Award",
    color: "emerald",
    description:
      "Comprendre la gestion des arbres de tournoi (simple/double élimination, suisses), l'arbitrage impartial, le respect du règlement officiel et l'accueil des joueurs.",
    outcomes: [
      "Maîtrise des logiciels de bracket (Toornament, Smash.gg)",
      "Gestion des litiges et vérification du matériel",
      "Logistique et respect des plannings de compétition",
    ],
    price: "Certification HG",
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    orderNumber: 1,
    numberStr: "01",
    title: "Salle de Gaming",
    category: "Gaming & Immersion",
    badge: "Console & PC",
    description: "Vivez une expérience gaming au maximum sur console et PC.",
    iconName: "Gamepad2",
    accentColor: "blue",
    targetTab: "shop",
  },
  {
    id: "act-2",
    orderNumber: 2,
    numberStr: "02",
    title: "Espace VR",
    category: "Gaming & Immersion",
    badge: "Réalité Virtuelle",
    description: "Venez vivre une expérience inoubliable avec notre espace de réalité virtuelle.",
    iconName: "Glasses",
    accentColor: "purple",
  },
  {
    id: "act-3",
    orderNumber: 3,
    numberStr: "03",
    title: "Espace Rétro Gaming",
    category: "Gaming & Immersion",
    badge: "Nostalgie & Arcade",
    description: "Pour tous ceux qui sont nostalgiques, nous avons ce qu’il vous faut.",
    iconName: "Joystick",
    accentColor: "amber",
  },
  {
    id: "act-4",
    orderNumber: 4,
    numberStr: "04",
    title: "Espace Just Dance",
    category: "Gaming & Immersion",
    badge: "Activité Physique & Danse",
    description: "Alliez activité physique et jeux vidéo, notre espace JUST DANCE est là pour ça.",
    iconName: "Music",
    accentColor: "rose",
  },
  {
    id: "act-5",
    orderNumber: 5,
    numberStr: "05",
    title: "Espace Lounge Gaming avec écran géant",
    category: "Gaming & Immersion",
    badge: "Confort VIP & Écran Géant",
    description: "Un confort garanti !!!",
    iconName: "Tv",
    accentColor: "cyan",
  },
  {
    id: "act-6",
    orderNumber: 6,
    numberStr: "06",
    title: "Espace Haut Débit Internet",
    category: "Connexion & Forfaits",
    badge: "Connexion Illimitée",
    description:
      "Pour toutes vos recherches, téléchargements et autres besoins, notre service Internet répond à toutes vos demandes.",
    price: {
      label: "Forfait journalier illimité",
      amount: "1 000 FCFA",
      period: "jour",
    },
    iconName: "Wifi",
    accentColor: "emerald",
  },
  {
    id: "act-7",
    orderNumber: 7,
    numberStr: "07",
    title: "Abonnement Gaming & Internet",
    category: "Connexion & Forfaits",
    badge: "Fibre Haut Débit Stable",
    description:
      "Connexion Internet haut débit et stable pour jouer, streamer, travailler et rester connecté selon vos besoins.",
    price: {
      label: "Forfait mensuel illimité",
      amount: "5 000 FCFA",
      period: "mois",
    },
    iconName: "Zap",
    accentColor: "amber",
  },
  {
    id: "act-8",
    orderNumber: 8,
    numberStr: "08",
    title: "Organisation de compétitions",
    category: "Esport & Événements",
    badge: "Circuit Esport & Tournois",
    description: "Tout plein de compétitions et de tournois intégrés dans notre circuit Esport !!!",
    iconName: "Trophy",
    accentColor: "amber",
    targetTab: "events",
  },
  {
    id: "act-9",
    orderNumber: 9,
    numberStr: "09",
    title: "Réparation de tous types de consoles de jeux",
    category: "Maintenance & Atelier",
    badge: "Diagnostic & Réparation",
    description: "Peu importe les soucis techniques, notre service de maintenance les règle en peu de temps.",
    iconName: "Wrench",
    accentColor: "blue",
    targetTab: "service",
  },
  {
    id: "act-10",
    orderNumber: 10,
    numberStr: "10",
    title: "Puçage de tous types de consoles de jeux",
    category: "Maintenance & Atelier",
    badge: "Installation & Jeux",
    description: "Nous puçons vos consoles et y installons les jeux de votre choix !",
    iconName: "Cpu",
    accentColor: "purple",
    targetTab: "service",
  },
  {
    id: "act-11",
    orderNumber: 11,
    numberStr: "11",
    title: "Location de salles",
    category: "Privatisation & Lieux",
    badge: "Événements & Anniversaires",
    description: "Anniversaires, événements de tous genres, notre salle est à votre disposition.",
    iconName: "Building2",
    accentColor: "cyan",
  },
  {
    id: "act-12",
    orderNumber: 12,
    numberStr: "12",
    title: "Organisation d’événements à thème",
    category: "Esport & Événements",
    badge: "Soirées Spéciales",
    description: "Nous vous proposons tout plein de moyens de terminer vos semaines chargées avec nos événements à thème.",
    iconName: "Calendar",
    accentColor: "rose",
    targetTab: "events",
  },
  {
    id: "act-13",
    orderNumber: 13,
    numberStr: "13",
    title: "Location de matériel de jeux vidéo",
    category: "Location & Matériel",
    badge: "Achat & Location",
    description: "Besoin de matériel ? Pas de souci, nous en avons à votre disposition pour achat ou location !",
    iconName: "Package",
    accentColor: "amber",
    targetTab: "shop",
  },
  {
    id: "act-14",
    orderNumber: 14,
    numberStr: "14",
    title: "Location de consoles de jeux vidéo",
    category: "Location & Matériel",
    badge: "À Domicile",
    description: "Besoin d’une console pour jouer chez vous ? Alors nous avons des consoles à louer !!!",
    iconName: "Gamepad",
    accentColor: "blue",
    targetTab: "shop",
  },
  {
    id: "act-15",
    orderNumber: 15,
    numberStr: "15",
    title: "Animation extérieure — Écoles ou à domicile",
    category: "Esport & Événements",
    badge: "Kermesses & Domicile",
    description: "Nous assurons l’animation de vos kermesses, anniversaires à domicile ou tout autre événement ! Peu importe le lieu, nous sommes là !",
    iconName: "Truck",
    accentColor: "emerald",
  },
  {
    id: "act-16",
    orderNumber: 16,
    numberStr: "16",
    title: "Espace Co-Working",
    category: "Espaces Professionnels",
    badge: "Espace de Travail",
    description: "Un espace de travail dédié au Co-Working est à votre disposition.",
    complementaryServices: [
      "Location de bureaux avec PC et Internet.",
      "Nous mettons également à votre disposition du matériel pour vos besoins bureautiques, secrétariat et tout autre besoin professionnel.",
    ],
    iconName: "Briefcase",
    accentColor: "blue",
  },
  {
    id: "act-17",
    orderNumber: 17,
    numberStr: "17",
    title: "Location de salle de conférence / formation",
    category: "Espaces Professionnels",
    badge: "Conférences & Formations",
    description: "Mettez à disposition notre espace pour vos conférences, formations, réunions et autres rencontres professionnelles.",
    iconName: "GraduationCap",
    accentColor: "purple",
    targetTab: "campus",
  },
];

export const DEFAULT_ACTIVITIES_BANNER: ActivitiesBannerInfo = {
  badge: "SERVICES & EXPÉRIENCES OFFICIELLES",
  title: "NOS ACTIVITÉS",
  description:
    "Découvrez nos activités dédiées au gaming, à la réalité virtuelle, au haut débit, à la maintenance technique de vos consoles, aux animations d'événements et aux espaces professionnels et de co-working.",
  locationTag: "Abidjan, Côte d'Ivoire",
  countLabel: "Activités disponibles",
  imageUrl: "",
};




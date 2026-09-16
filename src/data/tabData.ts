import {
  RepairService,
  GamingEvent,
  Tournament,
  HomeContent,
  TickerItem,
  HgEventItem,
  CampusModule,
  CampusInfo,
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
    title: "APERO GAMING",
    slug: "apero-gaming",
    badge: "Convivial & Afterwork",
    definition:
      "L'Apéro Gaming est le rendez-vous festif et détendu incontournable des gamers après le travail ou les cours. Un concept unique où se mêlent ambiance lounge, cocktails et rafraîchissements, tapas gourmandes et sessions de jeux multijoueurs sur grand écran dans une atmosphère chaleureuse et décontractée.",
    iconName: "GlassWater",
    nextEdition: {
      title: "Apéro Gaming Night — Spécial Mario Kart & Party Games",
      date: "Vendredi 26 Septembre 2026",
      time: "18h30 - 23h30",
      location: "Lounge House Game Cameroun",
      flyerUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
      entryFee: "3 000 FCFA (Consommation & snacks inclus)",
      description:
        "Sessions libres Mario Kart 8 Deluxe, Street Fighter 6, FC 25 et Just Dance. Boissons fraîches, musique gaming et ambiance conviviale garantie !",
      bookingOpen: true,
    },
    archives: [
      {
        id: "arc-1",
        title: "Apéro Gaming #12 — Édition Rétro & Funk",
        imageUrl:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        editionDate: "Août 2026",
      },
      {
        id: "arc-2",
        title: "Session multijoueur sur écrans 4K",
        imageUrl:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        editionDate: "Juillet 2026",
      },
      {
        id: "arc-3",
        title: "Espace détente & communauté",
        imageUrl:
          "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80",
        editionDate: "Juin 2026",
      },
    ],
  },
  {
    id: "hge-2",
    title: "HOUSE GAME DAY",
    slug: "house-game-day",
    badge: "Journée Portes Ouvertes",
    definition:
      "Le House Game Day est notre grande journée festival ouverte à toute la famille et à tous les profils de joueurs. Découverte gratuite des nouveautés hardware (consoles next-gen, réalité virtuelle PS VR2), mini-tournois éclair avec lots à gagner, démonstrations de réparation en direct et remises exclusives en boutique.",
    iconName: "Sparkles",
    nextEdition: {
      title: "House Game Day — Grand Festival Gaming & Découverte",
      date: "Samedi 4 Octobre 2026",
      time: "10h00 - 19h00",
      location: "Complexe House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
      entryFee: "Entrée Gratuite",
      description:
        "Accès libre à toutes les bornes PS5 et simulateurs de course, tombola gaming avec une console Switch OLED à gagner, animations et quiz avec récompenses !",
      bookingOpen: true,
    },
    archives: [
      {
        id: "arc-4",
        title: "House Game Day Édition Été 2026",
        imageUrl:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        editionDate: "Juillet 2026",
      },
      {
        id: "arc-5",
        title: "Démonstrations de réalité virtuelle",
        imageUrl:
          "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80",
        editionDate: "Mai 2026",
      },
      {
        id: "arc-6",
        title: "Remise des prix et vainqueurs tombola",
        imageUrl:
          "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80",
        editionDate: "Avril 2026",
      },
    ],
  },
  {
    id: "hge-3",
    title: "HG CHALLENGE",
    slug: "hg-challenge",
    badge: "Compétition & Cash Prize",
    definition:
      "Le HG Challenge est l'arène compétitive reine d'Esport de House Game. Tournois officiels à élimination directe ou phases de poules sur les jeux compétitifs majeurs (EA Sports FC, Tekken, Mortal Kombat, Naruto), retransmis sur écrans géants avec casteurs en direct, arbitres certifiés et cash prizes en espèces garantis.",
    iconName: "Trophy",
    nextEdition: {
      title: "HG Challenge #8 — Grand Championnat FC 27",
      date: "Samedi 18 & Dimanche 19 Octobre 2026",
      time: "À partir de 10h00",
      location: "Arène Esport House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80",
      entryFee: "5 000 FCFA / Joueur",
      description:
        "64 joueurs en lice pour 300 000 FCFA de Cash Prize direct et le trophée officiel du champion House Game.",
      bookingOpen: true,
    },
    archives: [
      {
        id: "arc-7",
        title: "Finale HG Challenge FC 26 — Grande arène",
        imageUrl:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        editionDate: "Juin 2026",
      },
      {
        id: "arc-8",
        title: "Vainqueur du Cash Prize 250 000 FCFA",
        imageUrl:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        editionDate: "Mai 2026",
      },
    ],
  },
  {
    id: "hge-4",
    title: "QUESTION POUR GAMEUR",
    slug: "question-pour-gameur",
    badge: "Quiz Culture Gaming",
    definition:
      "Question Pour Gameur est notre grand jeu télévisé et quiz interactif en direct qui teste la culture vidéoludique des passionnés. Musiques de jeux (blind-test), lore des licences cultes, histoire du rétrogaming, énigmes hardware et défis manette en main. Ambiance survoltée et cadeaux gaming à la clé !",
    iconName: "HelpCircle",
    nextEdition: {
      title: "Question Pour Gameur — Épisode 5 : Légendes du Jeu Vidéo",
      date: "Dimanche 25 Octobre 2026",
      time: "15h00 - 18h30",
      location: "Scène Principale House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
      entryFee: "2 000 FCFA / participant ou spectateur",
      description:
        "Venez vous mesurer aux meilleurs encyclopédies vivantes du gaming ! Buzzers électroniques, manches éliminatoires et lots collectors.",
      bookingOpen: true,
    },
    archives: [
      {
        id: "arc-9",
        title: "Plateau de jeu et buzzers électroniques",
        imageUrl:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        editionDate: "Août 2026",
      },
      {
        id: "arc-10",
        title: "Épreuve du Blind Test Musical",
        imageUrl:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
        editionDate: "Juillet 2026",
      },
    ],
  },
  {
    id: "hge-5",
    title: "AFRO-RESPAWN",
    slug: "afro-respawn",
    badge: "Culture & Renaissance Gaming",
    definition:
      "Afro-Respawn est un concept identitaire fort célébrant les créateurs, studios et talents africains du jeu vidéo et de la pop-culture. Une mise en lumière des jeux vidéo indépendants inspirés des mythologies et réalités du continent, des tables rondes avec des développeurs locaux et des sessions de jeu dédiées.",
    iconName: "Flame",
    nextEdition: {
      title: "Afro-Respawn Volume 3 — Les Nouveaux Héros du Gaming Africain",
      date: "Samedi 7 Novembre 2026",
      time: "14h00 - 20h00",
      location: "Espace Culturel & Gaming House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=1200&q=80",
      entryFee: "Entrée libre sur inscription",
      description:
        "Showcase de projets de jeux vidéo créés sur le continent, tournoi spécial sur les titres afrofuturistes et panels d'échange.",
      bookingOpen: true,
    },
    archives: [
      {
        id: "arc-11",
        title: "Afro-Respawn Vol. 2 — Démo des studios locaux",
        imageUrl:
          "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?auto=format&fit=crop&w=800&q=80",
        editionDate: "Juin 2026",
      },
      {
        id: "arc-12",
        title: "Rencontre entre développeurs et gamers",
        imageUrl:
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
        editionDate: "Mars 2026",
      },
    ],
  },
  {
    id: "hge-6",
    title: "FASHION WEEK OTAKU",
    slug: "fashion-week-otaku",
    badge: "Cosplay & Streetwear Manga",
    definition:
      "La Fashion Week Otaku est le festival glamour et créatif réunissant l'univers des mangas, de l'animation japonaise et du gaming à travers le Cosplay et le Streetwear Otaku. Défilés sur tapis rouge, concours de costumes confectionnés à la main, shooting photo professionnel et stands de créations artistiques en partenariat avec Rita.",
    iconName: "Shirt",
    nextEdition: {
      title: "Fashion Week Otaku Édition Annuelle — Grand Défilé & Concours",
      date: "Samedi 21 Novembre 2026",
      time: "13h00 - 21h00",
      location: "Palais des Congrès / Arène House Game",
      flyerUrl:
        "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1200&q=80",
      entryFee: "5 000 FCFA (Pass Visiteur) / Inscription Cosplay gratuite",
      description:
        "Grand défilé Cosplay, jury d'experts, exposition des collections de vêtements Otaku créées par Rita et récompenses pour les meilleurs costumes !",
      bookingOpen: true,
    },
    archives: [
      {
        id: "arc-13",
        title: "Fashion Week Otaku #1 — Défilé Cosplay",
        imageUrl:
          "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80",
        editionDate: "Novembre 2025",
      },
      {
        id: "arc-14",
        title: "Shootings photo et remises des prix",
        imageUrl:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        editionDate: "Novembre 2025",
      },
    ],
    customLink: {
      label: "Voir avec Rita & Découvrir la page officielle",
      url: "https://wa.me/242060000001?text=Bonjour%20Rita%20!%20Je%20vous%20contacte%20concernant%20la%20Fashion%20Week%20Otaku.",
      note: "Coordination & partenariat avec Rita",
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



import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  ArrowUpDown,
  ShoppingBag,
  Package,
} from "lucide-react";
import {
  Product,
  ShopInfo,
  CartItem,
  SortOption,
  NavTabId,
  RepairService,
  GamingEvent,
  Tournament,
  CustomTab,
  CustomTabItem,
  HomeContent,
} from "./types";
import {
  loadProducts,
  saveProducts,
  loadShopInfo,
  saveShopInfo,
  loadCart,
  saveCart,
  loadRepairServices,
  saveRepairServices,
  loadEvents,
  saveEvents,
  loadTournaments,
  saveTournaments,
  loadCustomTabs,
  saveCustomTabs,
  loadHomeContent,
  saveHomeContent,
  loadHgEvents,
  saveHgEvents,
  loadTickerItems,
  saveTickerItems,
} from "./services/storage";
import {
  subscribeToProducts,
  subscribeToShopInfo,
  saveProductCloud,
  deleteProductCloud,
  saveShopInfoCloud,
  restoreCatalogCloud,
  subscribeToRepairServices,
  saveRepairServiceCloud,
  deleteRepairServiceCloud,
  subscribeToEvents,
  saveEventCloud,
  deleteEventCloud,
  subscribeToTournaments,
  saveTournamentCloud,
  deleteTournamentCloud,
  subscribeToCustomTabs,
  saveCustomTabCloud,
  deleteCustomTabCloud,
  subscribeToHomeContent,
  saveHomeContentCloud,
  updateBannerImageCloud,
} from "./services/firebaseService";

// UI Components
import { Header } from "./components/Header";
import { TickerBanner } from "./components/TickerBanner";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { ProductCard } from "./components/ProductCard";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { CartDrawer } from "./components/CartDrawer";
import { LoginModal, ProductFormModal, ShopSettingsModal } from "./components/AdminModal";
import { Footer } from "./components/Footer";
import { BoutiqueLegalSection } from "./components/BoutiqueLegalSection";

// Tab Views
import { HomeTab } from "./components/HomeTab";
import { ActivitiesTab } from "./components/ActivitiesTab";
import { HgEventTab } from "./components/HgEventTab";
import { CampusTab } from "./components/CampusTab";
import { ServiceTab } from "./components/ServiceTab";
import { RepairTab } from "./components/RepairTab";
import { EventsTab } from "./components/EventsTab";
import { EsportTab } from "./components/EsportTab";
import { CustomTabContent } from "./components/CustomTabContent";

// Extended Admin Modals
import {
  HomeContentModal,
  RepairServiceModal,
  GamingEventModal,
  TournamentModal,
  CustomTabModal,
  CustomTabItemModal,
} from "./components/AdminModalsExtended";

const ORDERED_CATEGORIES = [
  "Tous",
  "Consoles de jeux",
  "Accessoires",
  "Jeux vidéo",
  "High-Tech",
  "Jouet de Noël",
  "Customisation",
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTabId>("home");

  // Core Data States
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => loadShopInfo());
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // New Tab Data States
  const [homeContent, setHomeContent] = useState<HomeContent>(() => loadHomeContent());
  const [repairServices, setRepairServices] = useState<RepairService[]>(() => loadRepairServices());
  const [events, setEvents] = useState<GamingEvent[]>(() => loadEvents());
  const [tournaments, setTournaments] = useState<Tournament[]>(() => loadTournaments());
  const [customTabs, setCustomTabs] = useState<CustomTab[]>(() => loadCustomTabs());
  const [hgEvents, setHgEvents] = useState(() => loadHgEvents());
  const [tickerItems, setTickerItems] = useState(() => loadTickerItems());

  // Shop Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  // Base Modals
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Extended Tab Admin Modals
  const [isEditHomeOpen, setIsEditHomeOpen] = useState<boolean>(false);

  const [isRepairModalOpen, setIsRepairModalOpen] = useState<boolean>(false);
  const [editingRepairService, setEditingRepairService] = useState<RepairService | null>(null);
  const [repairToDelete, setRepairToDelete] = useState<RepairService | null>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<GamingEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<GamingEvent | null>(null);

  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState<boolean>(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);

  const [isCustomTabModalOpen, setIsCustomTabModalOpen] = useState<boolean>(false);
  const [editingCustomTab, setEditingCustomTab] = useState<CustomTab | null>(null);
  const [customTabToDelete, setCustomTabToDelete] = useState<CustomTab | null>(null);

  const [isCustomTabItemModalOpen, setIsCustomTabItemModalOpen] = useState<boolean>(false);
  const [editingCustomTabItem, setEditingCustomTabItem] = useState<CustomTabItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ tabId: string; itemId: string } | null>(null);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubProducts = subscribeToProducts(
      (live) => {
        setProducts(live);
        saveProducts(live);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    const unsubInfo = subscribeToShopInfo(
      (live) => {
        setShopInfo(live);
        saveShopInfo(live);
      },
      () => setIsCloudConnected(false)
    );

    const unsubRepairs = subscribeToRepairServices(
      (live) => {
        setRepairServices(live);
        saveRepairServices(live);
      },
      (err) => console.warn("Repairs sync err:", err)
    );

    const unsubEvents = subscribeToEvents(
      (live) => {
        setEvents(live);
        saveEvents(live);
      },
      (err) => console.warn("Events sync err:", err)
    );

    const unsubTournaments = subscribeToTournaments(
      (live) => {
        setTournaments(live);
        saveTournaments(live);
      },
      (err) => console.warn("Tournaments sync err:", err)
    );

    const unsubCustomTabs = subscribeToCustomTabs(
      (live) => {
        setCustomTabs(live);
        saveCustomTabs(live);
      },
      (err) => console.warn("Custom tabs sync err:", err)
    );

    const unsubHome = subscribeToHomeContent(
      (live) => {
        setHomeContent(live);
        saveHomeContent(live);
      },
      (err) => console.warn("Home content sync err:", err)
    );

    return () => {
      unsubProducts();
      unsubInfo();
      unsubRepairs();
      unsubEvents();
      unsubTournaments();
      unsubCustomTabs();
      unsubHome();
    };
  }, []);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...prevCart, { product, quantity }];
      }
      saveCart(updated);
      return updated;
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prevCart) => {
      const updated = prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
      saveCart(updated);
      return updated;
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((item) => item.product.id !== productId);
      saveCart(updated);
      return updated;
    });
  };

  const handleClearCart = () => {
    setCart([]);
    saveCart([]);
  };

  // Product Admin Operations
  const handleSaveProduct = async (productData: Partial<Product>) => {
    let saved: Product;
    if (editingProduct) {
      saved = {
        ...editingProduct,
        ...productData,
        updatedAt: Date.now(),
      } as Product;
    } else {
      saved = {
        id: "prod_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        name: productData.name || "Nouvel Article",
        category: productData.category || "Consoles",
        price: Number(productData.price) || 0,
        originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
        description: productData.description || "",
        image: productData.image || "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
        badge: productData.badge || "",
        inStock: productData.inStock !== false,
        featured: !!productData.featured,
        specs: productData.specs || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      const updated = exists
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev];
      saveProducts(updated);
      return updated;
    });

    try {
      await saveProductCloud(saved);
    } catch (err) {
      console.error("Cloud save failed, saved locally:", err);
    }

    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (product: Product) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== product.id);
      saveProducts(updated);
      return updated;
    });

    try {
      await deleteProductCloud(product.id);
    } catch (err) {
      console.error("Cloud delete failed, deleted locally:", err);
    }

    setProductToDelete(null);
  };

  const handleSaveShopInfo = async (newInfo: ShopInfo) => {
    setShopInfo(newInfo);
    saveShopInfo(newInfo);

    try {
      await saveShopInfoCloud(newInfo);
    } catch (err) {
      console.error("Cloud info save failed, saved locally:", err);
    }
  };

  const handleRestoreProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    saveProducts(newProducts);

    try {
      await restoreCatalogCloud(newProducts);
    } catch (err) {
      console.error("Cloud restore failed, restored locally:", err);
    }
  };

  // Home Content Handlers
  const handleSaveHomeContent = async (newContent: HomeContent) => {
    setHomeContent(newContent);
    saveHomeContent(newContent);
    try {
      await saveHomeContentCloud(newContent);
    } catch (err) {
      console.error("Cloud home content save error:", err);
    }
  };

  // Repair Services Handlers
  const handleSaveRepairService = async (data: Partial<RepairService>) => {
    let saved: RepairService;
    if (editingRepairService) {
      saved = {
        ...editingRepairService,
        ...data,
      } as RepairService;
    } else {
      saved = {
        id: "rep_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        title: data.title || "Réparation",
        category: data.category || "Atelier",
        price: data.price || "Sur devis",
        delay: data.delay || "24h - 48h",
        description: data.description || "",
        features: data.features || [],
        icon: data.icon || "Wrench",
        badge: data.badge || "",
        createdAt: Date.now(),
      };
    }

    setRepairServices((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      const updated = exists
        ? prev.map((s) => (s.id === saved.id ? saved : s))
        : [saved, ...prev];
      saveRepairServices(updated);
      return updated;
    });

    try {
      await saveRepairServiceCloud(saved);
    } catch (err) {
      console.error("Cloud repair save error:", err);
    }

    setIsRepairModalOpen(false);
    setEditingRepairService(null);
  };

  const handleDeleteRepairService = async (service: RepairService) => {
    setRepairServices((prev) => {
      const updated = prev.filter((s) => s.id !== service.id);
      saveRepairServices(updated);
      return updated;
    });

    try {
      await deleteRepairServiceCloud(service.id);
    } catch (err) {
      console.error("Cloud repair delete error:", err);
    }

    setRepairToDelete(null);
  };

  // Events Handlers
  const handleSaveEvent = async (data: Partial<GamingEvent>) => {
    let saved: GamingEvent;
    if (editingEvent) {
      saved = {
        ...editingEvent,
        ...data,
      } as GamingEvent;
    } else {
      saved = {
        id: "evt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        title: data.title || "Événement Gaming",
        date: data.date || "Prochainement",
        time: data.time || "14h00",
        location: data.location || "House Game",
        description: data.description || "",
        image: data.image || "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
        entry: data.entry || "Gratuit",
        status: data.status || "Inscriptions ouvertes",
        badge: data.badge || "",
        highlights: data.highlights || [],
        createdAt: Date.now(),
      };
    }

    setEvents((prev) => {
      const exists = prev.some((e) => e.id === saved.id);
      const updated = exists
        ? prev.map((e) => (e.id === saved.id ? saved : e))
        : [saved, ...prev];
      saveEvents(updated);
      return updated;
    });

    try {
      await saveEventCloud(saved);
    } catch (err) {
      console.error("Cloud event save error:", err);
    }

    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (event: GamingEvent) => {
    setEvents((prev) => {
      const updated = prev.filter((e) => e.id !== event.id);
      saveEvents(updated);
      return updated;
    });

    try {
      await deleteEventCloud(event.id);
    } catch (err) {
      console.error("Cloud event delete error:", err);
    }

    setEventToDelete(null);
  };

  // Tournaments Handlers
  const handleSaveTournament = async (data: Partial<Tournament>) => {
    let saved: Tournament;
    if (editingTournament) {
      saved = {
        ...editingTournament,
        ...data,
      } as Tournament;
    } else {
      saved = {
        id: "tourn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        title: data.title || "Tournoi Officiel",
        game: data.game || "EA SPORTS FC 27",
        cashPrize: data.cashPrize || "200 000 FCFA",
        entryFee: data.entryFee || "5 000 FCFA",
        date: data.date || "Prochainement",
        time: data.time || "10h00",
        location: data.location || "Arène House Game",
        maxSlots: data.maxSlots || 32,
        currentSlots: data.currentSlots || 0,
        platform: data.platform || "PlayStation 5",
        format: data.format || "1v1",
        rules: data.rules || [],
        image: data.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
        status: data.status || "Inscriptions ouvertes",
        createdAt: Date.now(),
      };
    }

    setTournaments((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      const updated = exists
        ? prev.map((t) => (t.id === saved.id ? saved : t))
        : [saved, ...prev];
      saveTournaments(updated);
      return updated;
    });

    try {
      await saveTournamentCloud(saved);
    } catch (err) {
      console.error("Cloud tournament save error:", err);
    }

    setIsTournamentModalOpen(false);
    setEditingTournament(null);
  };

  const handleDeleteTournament = async (tournament: Tournament) => {
    setTournaments((prev) => {
      const updated = prev.filter((t) => t.id !== tournament.id);
      saveTournaments(updated);
      return updated;
    });

    try {
      await deleteTournamentCloud(tournament.id);
    } catch (err) {
      console.error("Cloud tournament delete error:", err);
    }

    setTournamentToDelete(null);
  };

  // Custom Tab Handlers
  const handleSaveCustomTab = async (data: Partial<CustomTab>) => {
    let saved: CustomTab;
    if (editingCustomTab) {
      saved = {
        ...editingCustomTab,
        ...data,
      } as CustomTab;
    } else {
      const newId = "tab_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
      saved = {
        id: newId,
        title: data.title || "Nouvel Onglet",
        slug: data.slug || newId,
        icon: data.icon || "Sparkles",
        description: data.description || "",
        items: [],
        createdAt: Date.now(),
      };
    }

    setCustomTabs((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      const updated = exists
        ? prev.map((t) => (t.id === saved.id ? saved : t))
        : [...prev, saved];
      saveCustomTabs(updated);
      return updated;
    });

    try {
      await saveCustomTabCloud(saved);
    } catch (err) {
      console.error("Cloud tab save error:", err);
    }

    setActiveTab(saved.id);
    setIsCustomTabModalOpen(false);
    setEditingCustomTab(null);
  };

  const handleDeleteCustomTab = async (tab: CustomTab) => {
    setCustomTabs((prev) => {
      const updated = prev.filter((t) => t.id !== tab.id);
      saveCustomTabs(updated);
      return updated;
    });

    try {
      await deleteCustomTabCloud(tab.id);
    } catch (err) {
      console.error("Cloud tab delete error:", err);
    }

    if (activeTab === tab.id) {
      setActiveTab("home");
    }
    setCustomTabToDelete(null);
  };

  // Custom Tab Item Handlers
  const handleSaveCustomTabItem = async (data: Partial<CustomTabItem>) => {
    const currentCustomTab = customTabs.find((t) => t.id === activeTab);
    if (!currentCustomTab) return;

    let updatedItems: CustomTabItem[];
    if (editingCustomTabItem) {
      const updatedItem: CustomTabItem = {
        ...editingCustomTabItem,
        ...data,
      } as CustomTabItem;
      updatedItems = currentCustomTab.items.map((i) =>
        i.id === updatedItem.id ? updatedItem : i
      );
    } else {
      const newItem: CustomTabItem = {
        id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        title: data.title || "Nouvel élément",
        subtitle: data.subtitle || "",
        description: data.description || "",
        image: data.image || "",
        priceOrTag: data.priceOrTag || "",
        buttonText: data.buttonText || "Contacter sur WhatsApp",
        buttonWhatsAppMessage: data.buttonWhatsAppMessage || "",
        createdAt: Date.now(),
      };
      updatedItems = [newItem, ...(currentCustomTab.items || [])];
    }

    const updatedTab: CustomTab = {
      ...currentCustomTab,
      items: updatedItems,
    };

    setCustomTabs((prev) => {
      const updated = prev.map((t) => (t.id === updatedTab.id ? updatedTab : t));
      saveCustomTabs(updated);
      return updated;
    });

    try {
      await saveCustomTabCloud(updatedTab);
    } catch (err) {
      console.error("Cloud tab item save error:", err);
    }

    setIsCustomTabItemModalOpen(false);
    setEditingCustomTabItem(null);
  };

  const handleDeleteCustomTabItem = async (tabId: string, itemId: string) => {
    const targetTab = customTabs.find((t) => t.id === tabId);
    if (!targetTab) return;

    const updatedTab: CustomTab = {
      ...targetTab,
      items: targetTab.items.filter((i) => i.id !== itemId),
    };

    setCustomTabs((prev) => {
      const updated = prev.map((t) => (t.id === tabId ? updatedTab : t));
      saveCustomTabs(updated);
      return updated;
    });

    try {
      await saveCustomTabCloud(updatedTab);
    } catch (err) {
      console.error("Cloud tab item delete error:", err);
    }

    setItemToDelete(null);
  };

  // Categories list for Shop (following requested order)
  const categories = useMemo(() => {
    const fromProducts = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ) as string[];
    const orderedList = ORDERED_CATEGORIES.filter(
      (cat) => cat === "Tous" || fromProducts.includes(cat)
    );
    const remaining = fromProducts.filter(
      (cat) => !ORDERED_CATEGORIES.includes(cat)
    );
    return [...orderedList, ...remaining];
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchCategory =
          selectedCategory === "Tous" || p.category === selectedCategory;
        const matchStock = onlyInStock ? p.inStock : true;
        const q = searchQuery.trim().toLowerCase();
        const matchQuery =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q);

        return matchCategory && matchStock && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") {
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        }
        if (sortBy === "price-desc") {
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        }
        if (sortBy === "name-asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "featured") {
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [products, selectedCategory, onlyInStock, searchQuery, sortBy]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Determine active custom tab if any
  const currentActiveCustomTab = customTabs.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-[#07090E] text-[#D6DCE6] flex flex-col font-['Chakra_Petch']">
      {/* Top Header */}
      <Header
        shopInfo={shopInfo}
        isAdmin={isAdmin}
        cartCount={totalCartCount}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogoutAdmin={() => setIsAdmin(false)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Bannière Défilante Publicités & Infos Flash (Au-dessus de la ligne Accueil) */}
      <TickerBanner
        items={tickerItems}
        onNavigateTab={(tabId) => setActiveTab(tabId as NavTabId)}
        isAdmin={isAdmin}
        onUpdateItems={(newItems) => {
          setTickerItems(newItems);
          saveTickerItems(newItems);
        }}
      />

      {/* Official Navigation Tabs Bar */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        customTabs={customTabs}
        isAdmin={isAdmin}
        onOpenCreateTabModal={() => {
          setEditingCustomTab(null);
          setIsCustomTabModalOpen(true);
        }}
        cartCount={totalCartCount}
      />

      {/* Main Dynamic Tab Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* TAB 1: ACCUEIL / OVERVIEW */}
        {activeTab === "home" && (
          <HomeTab
            homeContent={homeContent}
            shopInfo={shopInfo}
            isAdmin={isAdmin}
            onOpenEditHome={() => setIsEditHomeOpen(true)}
            onNavigateTab={(tabId) => setActiveTab(tabId)}
            onUpdateBannerImage={async (newUrl) => {
              const updated = { ...homeContent, bannerImage: newUrl };
              setHomeContent(updated);
              saveHomeContent(updated);
              try {
                await updateBannerImageCloud(newUrl);
              } catch (err) {
                console.error("Erreur lors de la synchronisation Firestore de la bannière:", err);
                throw err;
              }
            }}
          />
        )}

        {/* TAB 2: BOUTIQUE & VENTE */}
        {activeTab === "shop" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Search Banner */}
            <Hero
              shopInfo={shopInfo}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalProductsCount={products.length}
            />

            {/* Sous-page Légale intégrée (CGV, Remboursement & Retour, Mode de paiement) */}
            <BoutiqueLegalSection />

            {/* Controls Bar: Categories & Quick Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
              <div>
                <h2 className="flex items-center gap-2 font-['Orbitron'] text-xl font-bold text-white sm:text-2xl">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#FF4438]" />
                  CATALOGUE DISPONIBLE ({filteredProducts.length})
                </h2>
                <p className="font-['JetBrains_Mono'] text-xs text-[#7C8798] mt-1">
                  Sélectionnez vos articles et passez commande directement sur WhatsApp.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* In stock toggle */}
                <button
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-['JetBrains_Mono'] text-xs transition ${
                    onlyInStock
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                      : "border-white/10 bg-white/5 text-[#7C8798] hover:text-white"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      onlyInStock ? "bg-emerald-400" : "bg-[#7C8798]"
                    }`}
                  />
                  <span>En stock uniquement</span>
                </button>

                {/* Sort Selector */}
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-['JetBrains_Mono'] text-xs text-[#7C8798]">
                  <ArrowUpDown size={13} className="text-[#3E9BFF]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-xs text-[#D6DCE6] focus:outline-none cursor-pointer"
                  >
                    <option value="recent" className="bg-[#12151E] text-white">Nouveautés</option>
                    <option value="featured" className="bg-[#12151E] text-white">Sélection en vedette</option>
                    <option value="price-asc" className="bg-[#12151E] text-white">Prix croissant</option>
                    <option value="price-desc" className="bg-[#12151E] text-white">Prix décroissant</option>
                    <option value="name-asc" className="bg-[#12151E] text-white">Nom (A-Z)</option>
                  </select>
                </div>

                {/* Admin Add Button */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setIsProductFormOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-[#FF4438]/50 bg-[#FF4438] px-3.5 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(255,68,56,0.3)] transition hover:bg-[#ff6459] active:scale-95"
                  >
                    <Plus size={15} />
                    <span>Ajouter un article</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category Chips Bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const count =
                  cat === "Tous"
                    ? products.length
                    : products.filter((p) => p.category === cat).length;
                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex flex-shrink-0 items-center gap-2 rounded-md border px-4 py-2 font-['JetBrains_Mono'] text-xs font-semibold transition ${
                      isActive
                        ? "border-[#FF4438] bg-[#FF4438]/15 text-[#FF4438] shadow-[0_0_12px_rgba(255,68,56,0.2)]"
                        : "border-white/10 bg-[#12151E] text-[#7C8798] hover:border-[#3E9BFF]/40 hover:text-white"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isActive
                          ? "bg-[#FF4438]/30 text-white"
                          : "bg-white/5 text-[#7C8798]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#12151E]/40 p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#7C8798]">
                  <Package size={30} />
                </div>
                <h3 className="font-['Orbitron'] text-base font-bold text-white">
                  Aucun article trouvé
                </h3>
                <p className="mt-1 max-w-sm text-xs text-[#7C8798]">
                  {searchQuery
                    ? `Aucun résultat pour "${searchQuery}". Essayez un autre mot-clé.`
                    : "Aucun produit ne correspond aux filtres sélectionnés."}
                </p>
                {(searchQuery || selectedCategory !== "Tous" || onlyInStock) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("Tous");
                      setOnlyInStock(false);
                    }}
                    className="mt-4 rounded-lg border border-[#3E9BFF]/40 bg-[#3E9BFF]/10 px-4 py-2 font-['JetBrains_Mono'] text-xs text-[#3E9BFF] hover:bg-[#3E9BFF]/20"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    shopInfo={shopInfo}
                    isAdmin={isAdmin}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onEdit={(p) => {
                      setEditingProduct(p);
                      setIsProductFormOpen(true);
                    }}
                    onDelete={(p) => setProductToDelete(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOS ACTIVITES */}
        {activeTab === "activities" && (
          <ActivitiesTab
            homeContent={homeContent}
            shopInfo={shopInfo}
            isAdmin={isAdmin}
            onNavigateTab={(tabId) => setActiveTab(tabId)}
          />
        )}

        {/* TAB 4: HG EVENT (Official 6 Events, Archives & Flyers) */}
        {activeTab === "events" && (
          <HgEventTab
            events={hgEvents}
            shopInfo={shopInfo}
            isAdmin={isAdmin}
            onUpdateEvents={(updated) => {
              setHgEvents(updated);
              saveHgEvents(updated);
            }}
          />
        )}

        {/* TAB 5: HG CAMPUS */}
        {activeTab === "campus" && (
          <CampusTab
            shopInfo={shopInfo}
            isAdmin={isAdmin}
          />
        )}

        {/* TAB 6: HG SERVICE & RÉPARATION */}
        {(activeTab === "service" || activeTab === "repair") && (
          <ServiceTab
            services={repairServices}
            shopInfo={shopInfo}
            isAdmin={isAdmin}
            onOpenAddService={() => {
              setEditingRepairService(null);
              setIsRepairModalOpen(true);
            }}
            onEditService={(srv) => {
              setEditingRepairService(srv);
              setIsRepairModalOpen(true);
            }}
            onDeleteService={(srv) => setRepairToDelete(srv)}
          />
        )}

        {/* ESPORT & TOURNOIS (Accès direct) */}
        {activeTab === "esport" && (
          <EsportTab
            tournaments={tournaments}
            shopInfo={shopInfo}
            isAdmin={isAdmin}
            onOpenAddTournament={() => {
              setEditingTournament(null);
              setIsTournamentModalOpen(true);
            }}
            onEditTournament={(t) => {
              setEditingTournament(t);
              setIsTournamentModalOpen(true);
            }}
            onDeleteTournament={(t) => setTournamentToDelete(t)}
          />
        )}

        {/* DYNAMIC CUSTOM TABS */}
        {currentActiveCustomTab && (
          <CustomTabContent
            tab={currentActiveCustomTab}
            shopInfo={shopInfo}
            isAdmin={isAdmin}
            onOpenAddItem={() => {
              setEditingCustomTabItem(null);
              setIsCustomTabItemModalOpen(true);
            }}
            onEditItem={(item) => {
              setEditingCustomTabItem(item);
              setIsCustomTabItemModalOpen(true);
            }}
            onDeleteItem={(itemId) =>
              setItemToDelete({ tabId: currentActiveCustomTab.id, itemId })
            }
            onEditTabDetails={() => {
              setEditingCustomTab(currentActiveCustomTab);
              setIsCustomTabModalOpen(true);
            }}
            onDeleteTab={() => setCustomTabToDelete(currentActiveCustomTab)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        shopInfo={shopInfo}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* ================= MODALS SECTION ================= */}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        shopInfo={shopInfo}
        isAdmin={isAdmin}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onEdit={(p) => {
          setEditingProduct(p);
          setIsProductFormOpen(true);
        }}
        onDelete={(p) => setProductToDelete(p)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        shopInfo={shopInfo}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Login Modal (Espace Pro) */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => setIsAdmin(true)}
        expectedPin={shopInfo.adminPin || "4826"}
      />

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        existingCategories={categories.filter((c) => c !== "Tous")}
        currency={shopInfo.currency}
      />

      {/* Shop Settings Modal */}
      <ShopSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        shopInfo={shopInfo}
        onSaveShopInfo={handleSaveShopInfo}
        products={products}
        onRestoreProducts={handleRestoreProducts}
      />

      {/* Home Content Modal */}
      <HomeContentModal
        isOpen={isEditHomeOpen}
        onClose={() => setIsEditHomeOpen(false)}
        homeContent={homeContent}
        onSave={handleSaveHomeContent}
      />

      {/* Repair Service Modal */}
      <RepairServiceModal
        isOpen={isRepairModalOpen}
        onClose={() => {
          setIsRepairModalOpen(false);
          setEditingRepairService(null);
        }}
        onSave={handleSaveRepairService}
        editingService={editingRepairService}
      />

      {/* Gaming Event Modal */}
      <GamingEventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
      />

      {/* Tournament Modal */}
      <TournamentModal
        isOpen={isTournamentModalOpen}
        onClose={() => {
          setIsTournamentModalOpen(false);
          setEditingTournament(null);
        }}
        onSave={handleSaveTournament}
        editingTournament={editingTournament}
      />

      {/* Custom Tab Modal */}
      <CustomTabModal
        isOpen={isCustomTabModalOpen}
        onClose={() => {
          setIsCustomTabModalOpen(false);
          setEditingCustomTab(null);
        }}
        onSave={handleSaveCustomTab}
        editingTab={editingCustomTab}
      />

      {/* Custom Tab Item Modal */}
      <CustomTabItemModal
        isOpen={isCustomTabItemModalOpen}
        onClose={() => {
          setIsCustomTabItemModalOpen(false);
          setEditingCustomTabItem(null);
        }}
        onSave={handleSaveCustomTabItem}
        editingItem={editingCustomTabItem}
        tabTitle={currentActiveCustomTab?.title || "Onglet"}
      />

      {/* ================= DELETE CONFIRMATIONS ================= */}

      {/* Delete Product */}
      {productToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setProductToDelete(null);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-red-500/30 bg-[#12151E] p-6 shadow-2xl">
            <h3 className="font-['Orbitron'] text-base font-bold text-white mb-2">
              SUPPRIMER L'ARTICLE ?
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] mb-6">
              Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-white">"{productToDelete.name}"</strong> du catalogue ?
            </p>
            <div className="flex justify-end gap-3 font-['JetBrains_Mono'] text-xs font-bold">
              <button
                onClick={() => setProductToDelete(null)}
                className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteProduct(productToDelete)}
                className="rounded-lg bg-[#FF4438] px-4 py-2 text-white shadow-[0_0_15px_rgba(255,68,56,0.4)] hover:bg-[#ff6459]"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Repair Service */}
      {repairToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setRepairToDelete(null);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-red-500/30 bg-[#12151E] p-6 shadow-2xl">
            <h3 className="font-['Orbitron'] text-base font-bold text-white mb-2">
              SUPPRIMER LE SERVICE ?
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] mb-6">
              Supprimer le forfait de réparation <strong className="text-white">"{repairToDelete.title}"</strong> ?
            </p>
            <div className="flex justify-end gap-3 font-['JetBrains_Mono'] text-xs font-bold">
              <button
                onClick={() => setRepairToDelete(null)}
                className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteRepairService(repairToDelete)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Event */}
      {eventToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEventToDelete(null);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-red-500/30 bg-[#12151E] p-6 shadow-2xl">
            <h3 className="font-['Orbitron'] text-base font-bold text-white mb-2">
              SUPPRIMER L'ÉVÉNEMENT ?
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] mb-6">
              Supprimer l'événement <strong className="text-white">"{eventToDelete.title}"</strong> ?
            </p>
            <div className="flex justify-end gap-3 font-['JetBrains_Mono'] text-xs font-bold">
              <button
                onClick={() => setEventToDelete(null)}
                className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteEvent(eventToDelete)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Tournament */}
      {tournamentToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setTournamentToDelete(null);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-red-500/30 bg-[#12151E] p-6 shadow-2xl">
            <h3 className="font-['Orbitron'] text-base font-bold text-white mb-2">
              SUPPRIMER LE TOURNOI ?
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] mb-6">
              Supprimer la compétition <strong className="text-white">"{tournamentToDelete.title}"</strong> ?
            </p>
            <div className="flex justify-end gap-3 font-['JetBrains_Mono'] text-xs font-bold">
              <button
                onClick={() => setTournamentToDelete(null)}
                className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteTournament(tournamentToDelete)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Custom Tab */}
      {customTabToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCustomTabToDelete(null);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-red-500/30 bg-[#12151E] p-6 shadow-2xl">
            <h3 className="font-['Orbitron'] text-base font-bold text-white mb-2">
              SUPPRIMER L'ONGLET ?
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] mb-6">
              Supprimer l'onglet personnalisé <strong className="text-white">"{customTabToDelete.title}"</strong> ainsi que tous ses éléments associés ?
            </p>
            <div className="flex justify-end gap-3 font-['JetBrains_Mono'] text-xs font-bold">
              <button
                onClick={() => setCustomTabToDelete(null)}
                className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteCustomTab(customTabToDelete)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500"
              >
                Supprimer l'onglet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Custom Tab Item */}
      {itemToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setItemToDelete(null);
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-red-500/30 bg-[#12151E] p-6 shadow-2xl">
            <h3 className="font-['Orbitron'] text-base font-bold text-white mb-2">
              SUPPRIMER L'ÉLÉMENT ?
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] mb-6">
              Êtes-vous sûr de vouloir retirer cet élément de l'onglet ?
            </p>
            <div className="flex justify-end gap-3 font-['JetBrains_Mono'] text-xs font-bold">
              <button
                onClick={() => setItemToDelete(null)}
                className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteCustomTabItem(itemToDelete.tabId, itemToDelete.itemId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Gamepad2,
  Sparkles,
  ShoppingBag,
  Package,
  Layers,
  ChevronDown,
  Wifi,
} from "lucide-react";
import { Product, ShopInfo, CartItem, SortOption } from "./types";
import {
  loadProducts,
  saveProducts,
  loadShopInfo,
  saveShopInfo,
  loadCart,
  saveCart,
} from "./services/storage";
import {
  subscribeToProducts,
  subscribeToShopInfo,
  saveProductCloud,
  deleteProductCloud,
  saveShopInfoCloud,
  restoreCatalogCloud,
} from "./services/firebaseService";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { ProductCard } from "./components/ProductCard";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { CartDrawer } from "./components/CartDrawer";
import { LoginModal, ProductFormModal, ShopSettingsModal } from "./components/AdminModal";
import { Footer } from "./components/Footer";

export default function App() {
  // State
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => loadShopInfo());
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Delete confirm
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    // 1. Live Products
    const unsubscribeProducts = subscribeToProducts(
      (liveProducts) => {
        setProducts(liveProducts);
        saveProducts(liveProducts); // Keep local fallback in sync
        setIsCloudConnected(true);
      },
      (err) => {
        console.warn("Falling back to local data:", err);
        setIsCloudConnected(false);
      }
    );

    // 2. Live Store Info
    const unsubscribeInfo = subscribeToShopInfo(
      (liveInfo) => {
        setShopInfo(liveInfo);
        saveShopInfo(liveInfo); // Keep local fallback in sync
        setIsCloudConnected(true);
      },
      (err) => {
        console.warn("Falling back to local info:", err);
        setIsCloudConnected(false);
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeInfo();
    };
  }, []);

  // Save Cart on change
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let newCart: CartItem[];
    if (existingIndex > -1) {
      newCart = cart.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [{ product, quantity }, ...cart];
    }
    setCart(newCart);
    saveCart(newCart);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    const newCart = cart
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    setCart(newCart);
    saveCart(newCart);
  };

  const handleRemoveCartItem = (productId: string) => {
    const newCart = cart.filter((item) => item.product.id !== productId);
    setCart(newCart);
    saveCart(newCart);
  };

  const handleClearCart = () => {
    setCart([]);
    saveCart([]);
  };

  // Real-Time Product CRUD (Firestore Cloud Sync)
  const handleSaveProduct = async (product: Product) => {
    // Optimistic UI update
    const exists = products.some((p) => p.id === product.id);
    const updated = exists
      ? products.map((p) => (p.id === product.id ? product : p))
      : [product, ...products];
    setProducts(updated);
    saveProducts(updated);

    try {
      await saveProductCloud(product);
    } catch (err) {
      console.error("Cloud save failed, saved locally:", err);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    // Optimistic UI update
    const updated = products.filter((p) => p.id !== product.id);
    setProducts(updated);
    saveProducts(updated);
    setProductToDelete(null);
    if (selectedProduct?.id === product.id) {
      setSelectedProduct(null);
    }

    try {
      await deleteProductCloud(product.id);
    } catch (err) {
      console.error("Cloud delete failed, deleted locally:", err);
    }
  };

  const handleSaveShopInfo = async (info: ShopInfo) => {
    setShopInfo(info);
    saveShopInfo(info);
    try {
      await saveShopInfoCloud(info);
    } catch (err) {
      console.error("Cloud settings update failed, saved locally:", err);
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

  // Categories list
  const categories = useMemo(() => {
    const fromProducts = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    );
    return ["Tous", ...fromProducts];
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        const matchCategory =
          selectedCategory === "Tous" || p.category === selectedCategory;

        // In Stock filter
        const matchStock = onlyInStock ? p.inStock : true;

        // Search query
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
        // Recent default
        return b.createdAt - a.createdAt;
      });
  }, [products, selectedCategory, onlyInStock, searchQuery, sortBy]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#07090E] text-[#D6DCE6] flex flex-col font-['Chakra_Petch']">
      {/* Header */}
      <Header
        shopInfo={shopInfo}
        isAdmin={isAdmin}
        cartCount={totalCartCount}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogoutAdmin={() => setIsAdmin(false)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        shopInfo={shopInfo}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalProductsCount={products.length}
      />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* Section Top Controls Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-['Orbitron'] text-lg font-bold text-white sm:text-xl">
              <span className="h-2 w-2 rounded-full bg-[#FF4438]" />
              CATALOGUE ARTICLES ({filteredProducts.length})
            </h2>
            <p className="font-['JetBrains_Mono'] text-xs text-[#7C8798]">
              {selectedCategory === "Tous"
                ? "Toutes les catégories gaming disponibles"
                : `Articles dans la catégorie ${selectedCategory}`}
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
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
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
            {isAdmin && products.length === 0 && (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductFormOpen(true);
                }}
                className="mt-4 flex items-center gap-2 rounded-lg bg-[#FF4438] px-4 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white hover:bg-[#ff6459]"
              >
                <Plus size={15} />
                <span>Ajouter le premier article</span>
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
      </main>

      {/* Footer */}
      <Footer
        shopInfo={shopInfo}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

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

      {/* Login Modal */}
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

      {/* Shop Info Settings Modal */}
      <ShopSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        shopInfo={shopInfo}
        onSaveShopInfo={handleSaveShopInfo}
        products={products}
        onRestoreProducts={handleRestoreProducts}
      />

      {/* Delete Confirmation Dialog */}
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
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

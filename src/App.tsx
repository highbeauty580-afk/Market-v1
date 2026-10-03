/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  CartItem, 
  Order, 
  HeldOrder, 
  StoreConfig, 
  CategoryId, 
  PaymentMethod 
} from './types/pos';
import { INITIAL_PRODUCTS, DEFAULT_STORE_CONFIG } from './data/initialProducts';
import { Header } from './components/Header';
import { BarcodeScannerBar } from './components/BarcodeScannerBar';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductGrid } from './components/ProductGrid';
import { CartPanel } from './components/CartPanel';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { HeldOrdersModal } from './components/HeldOrdersModal';
import { CustomItemModal } from './components/CustomItemModal';
import { DailyReportModal } from './components/DailyReportModal';
import { ProductManagerModal } from './components/ProductManagerModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { SettingsModal } from './components/SettingsModal';
import { SupabaseConnectModal } from './components/SupabaseConnectModal';
import { posAudio } from './utils/audio';
import { 
  isSupabaseConfigured, 
  fetchProductsFromSupabase, 
  saveProductToSupabase, 
  deleteProductFromSupabase, 
  fetchOrdersFromSupabase, 
  saveOrderToSupabase 
} from './lib/supabase';

export default function App() {
  // Persistence state
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pos_products_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem('pos_config_v4');
    return saved ? JSON.parse(saved) : DEFAULT_STORE_CONFIG;
  });

  const [ordersHistory, setOrdersHistory] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pos_orders_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    const saved = localStorage.getItem('pos_held_orders_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [orderNumber, setOrderNumber] = useState<number>(() => {
    const saved = localStorage.getItem('pos_order_number_v4');
    return saved ? parseInt(saved, 10) : 1001;
  });

  // Active Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('عميل عام');
  const [orderDiscountAmount, setOrderDiscountAmount] = useState<number>(0);
  const [cashierName] = useState<string>('أحمد علي');

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Completed Receipt Modal Target
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Modals Visibility
  const [checkoutMethod, setCheckoutMethod] = useState<PaymentMethod>('cash');
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [isHeldOpen, setIsHeldOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isCustomItemOpen, setIsCustomItemOpen] = useState<boolean>(false);
  const [isProductManagerOpen, setIsProductManagerOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('pos_products_v4', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_config_v4', JSON.stringify(storeConfig));
  }, [storeConfig]);

  useEffect(() => {
    localStorage.setItem('pos_orders_v4', JSON.stringify(ordersHistory));
  }, [ordersHistory]);

  useEffect(() => {
    localStorage.setItem('pos_held_orders_v4', JSON.stringify(heldOrders));
  }, [heldOrders]);

  useEffect(() => {
    localStorage.setItem('pos_order_number_v4', orderNumber.toString());
  }, [orderNumber]);

  // Load from Supabase on initial load if configured
  useEffect(() => {
    if (isSupabaseConfigured) {
      handleSyncSupabase();
    }
  }, []);

  const handleSyncSupabase = async () => {
    if (!isSupabaseConfigured) return;
    const { products: remoteProducts, missingTable: missingProductsTable } = await fetchProductsFromSupabase();
    if (remoteProducts.length > 0) {
      setProducts(remoteProducts);
    }
    const { orders: remoteOrders, missingTable: missingOrdersTable } = await fetchOrdersFromSupabase();
    if (remoteOrders.length > 0) {
      setOrdersHistory(remoteOrders);
    }

    if (missingProductsTable || missingOrdersTable) {
      // Auto open setup modal if tables need creation
      setIsSupabaseOpen(true);
    }
  };

  const handleClearAllProducts = () => {
    if (window.confirm('هل أنت متأكد من تفريغ كافة المنتجات؟ ستبدأ بجدول فارغ تماماً لإضافة أصنافك.')) {
      setProducts([]);
      localStorage.removeItem('pos_products_v3');
      posAudio.playBeep();
    }
  };

  // Global Keyboard Shortcuts (F1, F2, F3, F4, F8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user typing inside input modal
      if (
        isPaymentOpen ||
        isCustomItemOpen ||
        isProductManagerOpen ||
        isSettingsOpen ||
        isSupabaseOpen
      ) {
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0) handleOpenCheckout('cash');
      } else if (e.key === 'F3') {
        e.preventDefault();
        if (cart.length > 0) handleOpenCheckout('card');
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) handleHoldOrder();
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) handleClearCart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isPaymentOpen, isCustomItemOpen, isProductManagerOpen, isSettingsOpen, isSupabaseOpen]);

  // Filter Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCat = selectedCategory === 'all' || prod.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.barcode.toLowerCase().includes(q) ||
        (prod.nameEn && prod.nameEn.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Add Item to Cart
  const handleAddToCart = (product: Product) => {
    posAudio.playBeep();
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((i) => i.product.id === product.id);
      if (existingIndex >= 0) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  // Barcode Submit Handler
  const handleBarcodeSubmit = (barcode: string) => {
    const found = products.find(
      (p) => p.barcode.toLowerCase() === barcode.toLowerCase()
    );
    if (found) {
      handleAddToCart(found);
      setSearchQuery('');
    } else {
      // If not exact match barcode, check if single product filtered
      if (filteredProducts.length === 1) {
        handleAddToCart(filteredProducts[0]);
        setSearchQuery('');
      } else {
        posAudio.playError();
      }
    }
  };

  // Cart Operations
  const handleUpdateQuantity = (index: number, delta: number) => {
    posAudio.playBeep();
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index] = { ...updated[index], quantity: newQty };
      }
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    posAudio.playBeep();
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    posAudio.playBeep();
    setCart([]);
    setOrderDiscountAmount(0);
  };

  // Hold Order
  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    posAudio.playBeep();

    const newHeld: HeldOrder = {
      id: `held-${Date.now()}`,
      orderNumber,
      heldAt: new Date().toISOString(),
      items: [...cart],
      customerName,
    };

    setHeldOrders((prev) => [newHeld, ...prev]);
    setCart([]);
    setOrderDiscountAmount(0);
    setOrderNumber((prev) => prev + 1);
  };

  // Restore Held Order
  const handleRestoreOrder = (held: HeldOrder) => {
    posAudio.playBeep();
    setCart(held.items);
    setCustomerName(held.customerName || 'عميل عام');
    setHeldOrders((prev) => prev.filter((h) => h.id !== held.id));
  };

  const handleDeleteHeldOrder = (id: string) => {
    posAudio.playBeep();
    setHeldOrders((prev) => prev.filter((h) => h.id !== id));
  };

  // Checkout Flow
  const handleOpenCheckout = (method: PaymentMethod) => {
    setCheckoutMethod(method);
    setIsPaymentOpen(true);
  };

  const handleCompleteSale = async (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    changeGiven: number,
    cashPaid?: number,
    cardPaid?: number
  ) => {
    // Calculate final order metrics
    const rawSubtotal = cart.reduce((sum, item) => {
      const price = item.customPrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const subtotalAfterDiscount = Math.max(0, rawSubtotal - orderDiscountAmount);
    const taxAmount = subtotalAfterDiscount * storeConfig.vatRate;
    const totalAmount = subtotalAfterDiscount + taxAmount;

    const completedOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      items: [...cart],
      subtotal: rawSubtotal,
      discountAmount: orderDiscountAmount,
      taxAmount,
      totalAmount,
      paymentMethod,
      amountPaid,
      cashPaid,
      cardPaid,
      changeGiven,
      cashierName,
      customerName,
      status: 'completed',
    };

    // Update Stock for purchased products
    const updatedProducts = products.map((p) => {
      const itemInCart = cart.find((ci) => ci.product.id === p.id);
      if (itemInCart) {
        const newProd = { ...p, stock: Math.max(0, p.stock - itemInCart.quantity) };
        if (isSupabaseConfigured) saveProductToSupabase(newProd);
        return newProd;
      }
      return p;
    });

    setProducts(updatedProducts);

    // Append to Order History
    setOrdersHistory((prev) => [completedOrder, ...prev]);

    // Sync Order to Supabase
    if (isSupabaseConfigured) {
      saveOrderToSupabase(completedOrder);
    }

    // Show Receipt Modal
    setLastCompletedOrder(completedOrder);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
  };

  const handleStartNewOrder = () => {
    setCart([]);
    setOrderDiscountAmount(0);
    setOrderNumber((prev) => prev + 1);
  };

  // Product Manager Handlers
  const handleSaveProduct = (prod: Product) => {
    posAudio.playBeep();
    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === prod.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = prod;
        return copy;
      }
      return [prod, ...prev];
    });

    if (isSupabaseConfigured) {
      saveProductToSupabase(prod);
    }
  };

  const handleDeleteProduct = (id: string) => {
    posAudio.playBeep();
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConfigured) {
      deleteProductFromSupabase(id);
    }
  };

  // Shift Reset
  const handleResetShift = () => {
    if (window.confirm('هل أنت تأكد من إغلاق وتصفير بيانات الوردية اليومية؟')) {
      posAudio.playBeep();
      setOrdersHistory([]);
      setIsReportOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen pos-ambient-bg text-slate-800 overflow-hidden select-none dir-rtl font-sans">
      {/* 1. Header Navigation Bar */}
      <Header
        storeConfig={storeConfig}
        cashierName={cashierName}
        heldOrdersCount={heldOrders.length}
        onOpenHeldOrders={() => setIsHeldOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenProductManager={() => setIsProductManagerOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSupabase={() => setIsSupabaseOpen(true)}
      />

      {/* 2. Main POS Workspace Grid Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative p-3 gap-3.5">
        {/* Left Column: Catalog, Categories, and Barcode Bar */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          {/* Barcode & Search Input Bar */}
          <BarcodeScannerBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onBarcodeSubmit={handleBarcodeSubmit}
            onOpenCustomItem={() => setIsCustomItemOpen(true)}
          />

          {/* Touch Category Filters */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryCounts={categoryCounts}
          />

          {/* Product Items Grid */}
          <ProductGrid
            products={filteredProducts}
            currency={storeConfig.currency}
            onAddToCart={handleAddToCart}
            onOpenCustomItem={() => setIsCustomItemOpen(true)}
          />
        </div>

        {/* Right Column: Order Cart & Cashier Total Display */}
        <CartPanel
          cart={cart}
          orderNumber={orderNumber}
          currency={storeConfig.currency}
          vatRate={storeConfig.vatRate}
          customerName={customerName}
          setCustomerName={setCustomerName}
          orderDiscountAmount={orderDiscountAmount}
          setOrderDiscountAmount={setOrderDiscountAmount}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onHoldOrder={handleHoldOrder}
          onOpenCheckout={handleOpenCheckout}
        />
      </div>

      {/* 3. MODALS SYSTEM */}
      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        grandTotal={
          Math.max(
            0,
            cart.reduce(
              (sum, i) => sum + (i.customPrice ?? i.product.price) * i.quantity,
              0
            ) - orderDiscountAmount
          ) * (1 + storeConfig.vatRate)
        }
        currency={storeConfig.currency}
        initialMethod={checkoutMethod}
        onCompleteSale={handleCompleteSale}
      />

      {/* Thermal Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={lastCompletedOrder}
        storeConfig={storeConfig}
        onNewOrder={handleStartNewOrder}
      />

      {/* Held Orders Modal */}
      <HeldOrdersModal
        isOpen={isHeldOpen}
        onClose={() => setIsHeldOpen(false)}
        heldOrders={heldOrders}
        currency={storeConfig.currency}
        onRestoreOrder={handleRestoreOrder}
        onDeleteHeldOrder={handleDeleteHeldOrder}
      />

      {/* Custom Item Modal */}
      <CustomItemModal
        isOpen={isCustomItemOpen}
        onClose={() => setIsCustomItemOpen(false)}
        currency={storeConfig.currency}
        onAddCustomItem={handleAddToCart}
      />

      {/* Daily Sales Report Modal */}
      <DailyReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        orders={ordersHistory}
        storeConfig={storeConfig}
        cashierName={cashierName}
        onResetShift={handleResetShift}
      />

      {/* Product & Stock Manager Modal */}
      <ProductManagerModal
        isOpen={isProductManagerOpen}
        onClose={() => setIsProductManagerOpen(false)}
        products={products}
        currency={storeConfig.currency}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Store Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={storeConfig}
        onSaveConfig={setStoreConfig}
      />

      {/* Supabase Integration & Setup Modal */}
      <SupabaseConnectModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        onSyncSupabase={handleSyncSupabase}
        onClearAllProducts={handleClearAllProducts}
        productsCount={products.length}
      />
    </div>
  );
}

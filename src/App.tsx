/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppContent, Product, Specialist, BusinessConfig, Order, OrderStatus, OrderItem, CustomMachineDetails } from './types';
import Navbar from './components/Navbar';
import Storefront from './components/Storefront';
import Customizer from './components/Customizer';
import Specialists from './components/Specialists';
import Tracker from './components/Tracker';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import { ShieldAlert, AlertTriangle, Cpu, Mail, Phone, Clock, RefreshCw } from 'lucide-react';
import { BrandProvider, useBrand } from './components/brand-demo/BrandProvider';
import { OnboardingModal, BrandResetButton } from './components/brand-demo/OnboardingModal';
import AdminConsole from './components/brand-demo/AdminConsole';

function SessionCountdownPill() {
  const { session, countdown } = useBrand();
  if (!session || !countdown) return null;
  return (
    <div className="fixed top-24 right-4 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2">
      <Clock className="w-3.5 h-3.5 text-amber-600" />
      <span className="text-xs font-mono text-gray-700 font-semibold">Session: {countdown}</span>
    </div>
  );
}

export default function App() {
  if (window.location.pathname === '/admin') {
    return (
      <BrandProvider>
        <AdminConsole />
      </BrandProvider>
    );
  }
  return (
    <BrandProvider>
      <AppInner />
    </BrandProvider>
  );
}

function AppInner() {
  // 1. Initial State Definitions
  const [activeTab, setActiveTab] = useState<string>('storefront');
  const [products, setProducts] = useState<Product[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [config, setConfig] = useState<BusinessConfig>({
    businessName: "Apex Industrial Systems India",
    tagline: "Engineering High-Performance Machinery for Atmanirbhar Bharat",
    operatingHours: "Monday - Saturday: 09:00 - 18:00 (IST)",
    email: "contact@apex-industrial.co.in",
    phone: "+91 (80) 555-APEX",
    address: "Plot 12, Phase-II, Peenya Industrial Area, Bengaluru, Karnataka 560058, India",
    accentColor: "#D97706"
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [customMachine, setCustomMachine] = useState<CustomMachineDetails | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Persistent Visitor token state
  const [visitorToken, setVisitorToken] = useState<string>('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Admin Authenticated token state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Polling control
  const [isPollingActive, setIsPollingActive] = useState(false);

  // Preselected product for loading base model inside Customizer
  const [preSelectedCustomizerProduct, setPreSelectedCustomizerProduct] = useState<Product | null>(null);

  // 2. Generate or Load persistent Client Token on Mount
  useEffect(() => {
    let token = localStorage.getItem('apex_visitor_token');
    if (!token) {
      token = `client-session-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('apex_visitor_token', token);
    }
    setVisitorToken(token);

    // Read Admin login session
    const storedAdminToken = localStorage.getItem('apex_admin_token');
    if (storedAdminToken) {
      setIsAdminLoggedIn(true);
      setAdminToken(storedAdminToken);
    }

    // Read active tracking order ID if previously placed
    const storedActiveOrderId = localStorage.getItem('apex_active_tracking_id');
    if (storedActiveOrderId) {
      setActiveOrderId(storedActiveOrderId);
    }
  }, []);

  // 3. Dynamic Hash Deep-Linking Routing Parser
  useEffect(() => {
    const parseHashRoute = () => {
      const hash = window.location.hash || '#/storefront';
      
      if (hash.startsWith('#/admin')) {
        setActiveTab('admin');
      } else if (hash.startsWith('#/tracker')) {
        setActiveTab('tracker');
        // Extract order ID query if present e.g. #/tracker?id=APX-123
        const match = hash.match(/\?id=([\w-]+)/);
        if (match && match[1]) {
          const matchedId = match[1];
          setActiveOrderId(matchedId);
          localStorage.setItem('apex_active_tracking_id', matchedId);
        }
      } else if (hash.startsWith('#/customizer')) {
        setActiveTab('customizer');
      } else if (hash.startsWith('#/specialists')) {
        setActiveTab('specialists');
      } else {
        setActiveTab('storefront');
      }
    };

    parseHashRoute();
    window.addEventListener('hashchange', parseHashRoute);
    return () => window.removeEventListener('hashchange', parseHashRoute);
  }, []);

  // Sync hash routing if user manually clicks tabs
  useEffect(() => {
    let hash = `#/${activeTab}`;
    if (activeTab === 'tracker' && activeOrderId) {
      hash += `?id=${activeOrderId}`;
    }
    // Update window hash quietly without triggering loop
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
    }
  }, [activeTab, activeOrderId]);

  // 4. Asynchronous Procurement APIs fetching
  const fetchAllData = async () => {
    setIsPollingActive(true);
    try {
      // Fetch catalog content
      const contentRes = await fetch('/api/contents');
      if (contentRes.ok) {
        const contentData: AppContent = await contentRes.json();
        setProducts(contentData.products || []);
        setSpecialists(contentData.specialists || []);
        setConfig(contentData.config);
      }

      // Fetch logged orders
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const ordersData: Order[] = await ordersRes.json();
        setOrders(ordersData || []);
      }
      
      setError(null);
    } catch (err) {
      console.error("Connection issue, syncing with offline fallbacks.", err);
      // We don't crash the UI, we gracefully log error
    } finally {
      setLoading(false);
      setIsPollingActive(false);
    }
  };

  // Run initial fetch and trigger continuous 5-second polling
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  // 5. App Cart and Builder Handlers
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prev, { productId: product.id, productName: product.name, quantity: 1, price: product.price }];
      }
    });
    setCartOpen(true);
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: qty } : item));
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleAddCustomMachineToCart = (details: CustomMachineDetails) => {
    setCustomMachine(details);
    setCartOpen(true);
  };

  const handleRemoveCustomMachine = () => {
    setCustomMachine(null);
  };

  // Load product to customizer and transition tabs
  const handleLoadProductIntoCustomizer = (product: Product) => {
    setPreSelectedCustomizerProduct(product);
    setActiveTab('customizer');
  };

  // Secure Checkout Session success callback
  const handleCheckoutSuccess = (orderId: string) => {
    setActiveOrderId(orderId);
    localStorage.setItem('apex_active_tracking_id', orderId);
    setCartItems([]);
    setCustomMachine(null);
    setCartOpen(false);
    setActiveTab('tracker');
    fetchAllData(); // Refresh immediately
  };

  // 6. Secure Admin Controller Session handlers
  const handleAdminLoginSuccess = (token: string) => {
    setIsAdminLoggedIn(true);
    setAdminToken(token);
    localStorage.setItem('apex_admin_token', token);
    fetchAllData();
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminToken(null);
    localStorage.removeItem('apex_admin_token');
    setActiveTab('storefront');
  };

  const handleSaveCatalog = async (updatedProducts: Product[]): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const response = await fetch('/api/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          products: updatedProducts,
          specialists,
          config
        })
      });

      if (response.ok) {
        setProducts(updatedProducts);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleSaveConfig = async (updatedConfig: BusinessConfig): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const response = await fetch('/api/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          products,
          specialists,
          config: updatedConfig
        })
      });

      if (response.ok) {
        setConfig(updatedConfig);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Calculate cart counts
  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0) + (customMachine ? 1 : 0);

  // Loading Screen Layout
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center space-y-5 px-4 font-mono">
        <div className="relative">
          <Cpu className="w-12 h-12 text-amber-600 animate-spin [animation-duration:4s]" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-dashed border-gray-200 animate-ping opacity-30"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-widest text-gray-800 uppercase">APEX SYSTEMS</p>
          <p className="text-xs text-gray-400">Initializing Precision Assembly Drawings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col">
      {/* 1. Header Navigation */}
      <Navbar
        config={config}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* 2. Main Tab router block */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'storefront' && (
          <Storefront
            products={products}
            config={config}
            onAddToCart={handleAddToCart}
            onConfigureProduct={handleLoadProductIntoCustomizer}
          />
        )}

        {activeTab === 'customizer' && (
          <Customizer
            products={products}
            config={config}
            preSelectedProduct={preSelectedCustomizerProduct}
            onAddCustomMachineToCart={handleAddCustomMachineToCart}
          />
        )}

        {activeTab === 'specialists' && (
          <Specialists
            specialists={specialists}
            config={config}
          />
        )}

        {activeTab === 'tracker' && (
          <Tracker
            orders={orders}
            config={config}
            visitorToken={visitorToken}
            activeOrderId={activeOrderId}
            onSelectOrder={(id) => {
              setActiveOrderId(id);
              localStorage.setItem('apex_active_tracking_id', id);
            }}
            onForceRefresh={fetchAllData}
            isPollingActive={isPollingActive}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanel
            orders={orders}
            products={products}
            specialists={specialists}
            config={config}
            onUpdateStatus={handleUpdateOrderStatus}
            onSaveCatalog={handleSaveCatalog}
            onSaveConfig={handleSaveConfig}
            isAdminLoggedIn={isAdminLoggedIn}
            onLoginSuccess={handleAdminLoginSuccess}
            onLogout={handleAdminLogout}
          />
        )}
      </main>

      {/* 3. Shopping Cart Slider Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        config={config}
        cartItems={cartItems}
        customMachine={customMachine}
        onRemoveItem={handleRemoveItem}
        onUpdateQty={handleUpdateQty}
        onRemoveCustomMachine={handleRemoveCustomMachine}
        onCheckoutSuccess={handleCheckoutSuccess}
        visitorToken={visitorToken}
      />

      {/* 4. Footer Brand Panel */}
      <footer className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-1">
              <span
                data-brand-text="business-name"
                data-brand-default="Apex Industrial Systems India"
                className="block text-sm font-bold font-display text-gray-900"
              >
                {config.businessName}
              </span>
              <p className="text-xs text-gray-400 max-w-sm">
                Precision manufacturing systems designed and verified by senior systems support architects.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-500 font-mono">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Hotline Support</span>
                <p
                  data-brand-text="phone"
                  data-brand-default="+91 (80) 555-APEX"
                  className="font-semibold text-gray-800 flex items-center justify-center sm:justify-start"
                >
                  <Phone className="w-3.5 h-3.5 mr-1" />
                  {config.phone}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Consulting Inquiry</span>
                <p className="font-semibold text-gray-800 flex items-center justify-center sm:justify-start">
                  <Mail className="w-3.5 h-3.5 mr-1" />
                  {config.email}
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Plant Operations</span>
                <p className="font-semibold text-gray-800 flex items-center justify-center sm:justify-start text-center sm:text-left leading-tight">
                  <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                  {config.operatingHours.split(' (')[0]}
                </p>
              </div>
            </div>
          </div>

          <p
            data-brand-text="address"
            data-brand-default="Plot 12, Phase-II, Peenya Industrial Area, Bengaluru, Karnataka 560058, India"
            className="text-xs text-gray-400 font-mono text-center sm:text-left mt-4"
          >
            {config.address}
          </p>

          <div className="border-t border-gray-50 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-gray-400 gap-4">
            <p>© 2026 {config.businessName}. All rights reserved.</p>
            <p>Certified micrometric tolerance & structural payload systems.</p>
          </div>
          <div className="mt-4 text-center text-[10px] font-mono text-gray-400">
            <p>
              Developer: <span className="font-semibold">Aniruddha Das</span> | Developed by{" "}
              <a href="https://leadspree.in" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                LeadSpree Business Solutions
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Brand Demo Onboarding Engine */}
      <OnboardingModal />
      <BrandResetButton />
      <SessionCountdownPill />
    </div>
  );
}


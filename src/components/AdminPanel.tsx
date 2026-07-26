/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, LayoutDashboard, Database, Sliders, ChevronRight, CheckCircle, Trash2, Edit2, Plus, LogOut, FileText, AlertTriangle, Sparkles } from 'lucide-react';
import { Order, Product, Specialist, BusinessConfig, OrderStatus, AppContent } from '../types';

interface AdminPanelProps {
  orders: Order[];
  products: Product[];
  specialists: Specialist[];
  config: BusinessConfig;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  onSaveCatalog: (updatedProducts: Product[]) => Promise<boolean>;
  onSaveConfig: (updatedConfig: BusinessConfig) => Promise<boolean>;
  isAdminLoggedIn: boolean;
  onLoginSuccess: (token: string) => void;
  onLogout: () => void;
}

export default function AdminPanel({
  orders,
  products,
  specialists,
  config,
  onUpdateStatus,
  onSaveCatalog,
  onSaveConfig,
  isAdminLoggedIn,
  onLoginSuccess,
  onLogout,
}: AdminPanelProps) {
  // Login Gate State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Admin View Sub-tabs: 'orders', 'catalog', 'config'
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'catalog' | 'config'>('orders');

  // Selected Order for Dispatch Details
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0] || null;

  // Dispatch Status Change state
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Catalog CRUD Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null); // 'new' for adding new product
  const [productForm, setProductForm] = useState<{
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isTopSeller: boolean;
    specifications: { key: string; val: string }[];
  }>({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'CNC & Milling',
    imageUrl: '',
    isTopSeller: false,
    specifications: [
      { key: 'Power', val: '15 kW' },
      { key: 'Weight', val: '1500 kg' }
    ]
  });

  // Global Config form state
  const [configForm, setConfigForm] = useState<BusinessConfig>({ ...config });

  // Preset branding colors
  const colorPresets = [
    { name: 'Amber Industrial', hex: '#D97706' },
    { name: 'Precision Blue', hex: '#2563EB' },
    { name: 'Heavy Graphite', hex: '#374151' },
    { name: 'Automation Green', hex: '#059669' },
    { name: 'Titanium Purple', hex: '#7C3AED' }
  ];

  // Trigger temporary Admin Notification Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError("Please enter both username and password parameters.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Verification failed. Invalid administrator credentials.');
      }

      const data = await response.json();
      if (data.success && data.token) {
        onLoginSuccess(data.token);
        // Load config form with current parameters
        setConfigForm({ ...config });
      } else {
        throw new Error('Invalid authentication state.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Error executing administrative validation.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleStatusChangeSubmit = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    const success = await onUpdateStatus(orderId, newStatus);
    setUpdatingOrderId(null);
    if (success) {
      triggerToast(`Order ${orderId} dispatch status successfully modified to [${newStatus}].`);
    } else {
      alert("Error writing order status. Ensure admin authorization remains valid.");
    }
  };

  // Catalog Form actions
  const startNewProductForm = () => {
    setProductForm({
      id: `m-${100 + products.length + 1}`,
      name: '',
      description: '',
      price: 45000,
      category: 'CNC & Milling',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60',
      isTopSeller: false,
      specifications: [
        { key: 'Configuration', val: 'Standard' },
        { key: 'Weight', val: '2,500 kg' }
      ]
    });
    setEditingProductId('new');
  };

  const startEditProductForm = (p: Product) => {
    const specsArray = Object.entries(p.specifications).map(([k, v]) => ({ key: k, val: v }));
    setProductForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      imageUrl: p.imageUrl,
      isTopSeller: p.isTopSeller,
      specifications: specsArray.length > 0 ? specsArray : [{ key: 'Configuration', val: 'Standard' }]
    });
    setEditingProductId(p.id);
  };

  const addSpecRow = () => {
    setProductForm(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', val: '' }]
    }));
  };

  const removeSpecRow = (idx: number) => {
    setProductForm(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== idx)
    }));
  };

  const handleCatalogFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.description || productForm.price <= 0) {
      alert("Please ensure product name, description, and valuation parameters are valid.");
      return;
    }

    // Convert specs array back to Record<string, string>
    const specsRecord: Record<string, string> = {};
    productForm.specifications.forEach(row => {
      if (row.key.trim()) {
        specsRecord[row.key.trim()] = row.val.trim();
      }
    });

    const newProduct: Product = {
      id: productForm.id,
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      category: productForm.category,
      imageUrl: productForm.imageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60',
      isTopSeller: productForm.isTopSeller,
      specifications: specsRecord
    };

    let updatedList: Product[];
    if (editingProductId === 'new') {
      updatedList = [...products, newProduct];
    } else {
      updatedList = products.map(p => p.id === editingProductId ? newProduct : p);
    }

    const success = await onSaveCatalog(updatedList);
    if (success) {
      triggerToast(`Catalog asset [${productForm.name}] successfully updated in system contents.`);
      setEditingProductId(null);
    } else {
      alert("Error saving catalog update. Check administrator session credentials.");
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you absolutely sure you want to retire and delete the catalog asset: "${productName}"?`)) {
      return;
    }

    const updatedList = products.filter(p => p.id !== productId);
    const success = await onSaveCatalog(updatedList);
    if (success) {
      triggerToast(`Asset [${productName}] removed from catalog listing.`);
    } else {
      alert("Error deleting catalog asset.");
    }
  };

  // General Config Submit
  const handleConfigFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSaveConfig(configForm);
    if (success) {
      triggerToast("Global configuration and branding metadata updated successfully.");
    } else {
      alert("Error saving configuration changes.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Standard Login Gate view if not logged in
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-in fade-in duration-500">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-md w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-900"></div>
          
          <div className="text-center space-y-2 mb-8">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 border border-gray-200/50">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-display text-gray-900 tracking-tight">
              Administrative Control Gate
            </h2>
            <p className="text-xs text-gray-400">
              Authorized personnel access only. Log in to manage orders & catalog.
            </p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase">
                Username Parameter
              </label>
              <input
                type="text"
                required
                placeholder="e.g. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
              />
            </div>

            <div className="space-y-1 relative">
              <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase">
                Password Key
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs pr-10 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-7.5 text-gray-400 hover:text-gray-900 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2 text-xs text-red-600 font-semibold font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gray-950 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all text-xs disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Authenticate Administrator'}
            </button>
          </form>

          <div className="text-center mt-6 text-[10px] font-mono text-gray-400 border-t border-gray-100 pt-4">
            Default sandbox key: <span className="font-bold text-gray-700">admin</span> / <span className="font-bold text-gray-700">admin</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-mono font-medium border border-gray-800 animate-bounce">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Panel Header */}
      <div className="border-b border-gray-100 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-700" style={{ color: config.accentColor }}>
            <Sliders className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">SECURE DISPATCH TERMINAL</span>
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900 mt-1">
            Staff Administrative Hub
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sub Tab Controls */}
          <div className="bg-gray-100 p-1 rounded-xl flex space-x-1 text-xs font-semibold">
            <button
              onClick={() => { setAdminSubTab('orders'); setEditingProductId(null); }}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                adminSubTab === 'orders' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Active Dispatch</span>
            </button>
            <button
              onClick={() => { setAdminSubTab('catalog'); setEditingProductId(null); }}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                adminSubTab === 'catalog' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Catalog Manager</span>
            </button>
            <button
              onClick={() => { setAdminSubTab('config'); setEditingProductId(null); }}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
                adminSubTab === 'config' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>General Settings</span>
            </button>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer"
            id="admin-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* SUB TAB VIEW 1: ACTIVE DISPATCH (Double-column) */}
      {adminSubTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Chronicles list of all logged orders (col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-extrabold font-mono tracking-wider text-gray-400 uppercase border-b border-gray-100 pb-2.5">
              Logged System Orders ({orders.length})
            </h3>
            
            {orders.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-xs font-mono">
                No customer orders currently logged.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[650px] overflow-y-auto pr-1">
                {orders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`w-full text-left p-4 border rounded-2xl transition-all flex justify-between items-start cursor-pointer ${
                        isSelected
                          ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                          : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1 flex-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-mono font-bold ${isSelected ? 'text-amber-400' : 'text-gray-900'}`}>
                            {order.id}
                          </span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                            {new Date(order.orderDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`block text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                          {order.customerInfo.name}
                        </span>
                        <span className={`block text-[11px] font-medium truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                          {order.customerInfo.company}
                        </span>
                      </div>
                      
                      <div className="text-right flex flex-col items-end justify-between h-full">
                        <span className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(order.totalPrice)}
                        </span>
                        <span 
                          className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase mt-2.5"
                          style={{
                            backgroundColor: order.status === 'Completed' ? '#DEF7EC' : '#FEF3C7',
                            color: order.status === 'Completed' ? '#03543F' : '#92400E'
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel: Complete receipt breakdown, client detail, dispatch controller (col-span-7) */}
          <div className="lg:col-span-7">
            {activeOrder ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-5">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-gray-400 uppercase">SELECTED CONSIGNMENT LOG</span>
                    <h3 className="text-xl font-bold font-display text-gray-900 mt-0.5">Order {activeOrder.id} Details</h3>
                  </div>

                  {/* Dispatch Controller status picker */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold text-gray-500">Dispatch:</span>
                    <select
                      value={activeOrder.status}
                      disabled={updatingOrderId === activeOrder.id}
                      onChange={(e) => handleStatusChangeSubmit(activeOrder.id, e.target.value as OrderStatus)}
                      className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-bold rounded-xl py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Received">Received</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Quality Check">Quality Check</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Logistics receipt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono bg-gray-50 p-4.5 rounded-2xl border border-gray-100/50 text-gray-500">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Consignee Name</span>
                    <span className="text-gray-900 font-bold block">{activeOrder.customerInfo.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Company / Facility</span>
                    <span className="text-gray-900 font-bold block">{activeOrder.customerInfo.company}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Business Email</span>
                    <span className="text-gray-900 font-bold block truncate">{activeOrder.customerInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Direct phone</span>
                    <span className="text-gray-900 font-bold block">{activeOrder.customerInfo.phone}</span>
                  </div>
                  {activeOrder.customerInfo.gstin && (
                    <div>
                      <span className="text-gray-400 block mb-0.5">Corporate GSTIN</span>
                      <span className="text-emerald-700 font-bold block">{activeOrder.customerInfo.gstin}</span>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block mb-0.5">Consignment destination</span>
                    <span className="text-gray-900 font-bold block">{activeOrder.customerInfo.address}</span>
                  </div>
                </div>

                {/* Build specs or cart items list */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold font-mono text-gray-400 uppercase tracking-wider">
                    Procurement Specifications
                  </h4>

                  {activeOrder.customMachine ? (
                    <div className="border border-gray-200/60 rounded-2xl p-4 space-y-3 font-mono text-xs">
                      <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 text-[11px] text-amber-800 font-bold flex justify-between items-center">
                        <span>CONFIGURED CUSTOM MACHINERY BUILD</span>
                        <span>Weight: {activeOrder.customMachine.totalWeightKg.toLocaleString()} kg</span>
                      </div>
                      <p><strong className="text-gray-700">Base System Platform:</strong> {activeOrder.customMachine.baseModelName}</p>
                      <p><strong className="text-gray-700">Structural Frame:</strong> {activeOrder.customMachine.chassis}</p>
                      <p><strong className="text-gray-700">Spindle Drive Upgrade:</strong> {activeOrder.customMachine.powerUnit}</p>
                      <p><strong className="text-gray-700">Automation Interface:</strong> {activeOrder.customMachine.controlSystem}</p>
                      
                      {activeOrder.customMachine.addedFeatures.length > 0 && (
                        <div>
                          <strong className="text-gray-700 block mb-1">Auxiliary Modules Installed:</strong>
                          <ul className="list-disc pl-5 text-gray-600 space-y-0.5">
                            {activeOrder.customMachine.addedFeatures.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 p-3 font-mono text-xs text-gray-600">
                      {activeOrder.items.map((item, idx) => (
                        <div key={idx} className="py-2 flex justify-between">
                          <span>{item.productName} (x{item.quantity})</span>
                          <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeOrder.notes && (
                    <div className="bg-amber-50/20 border border-amber-200/20 rounded-2xl p-4 text-xs">
                      <span className="font-bold text-amber-900 block font-mono text-[10px] uppercase">Special Factory Notes / Client Directives</span>
                      <p className="text-gray-600 mt-1 italic">"{activeOrder.notes}"</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 font-mono text-sm text-gray-900">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Logistics Valuation</p>
                      <p className="text-gray-500 font-normal">Terms: {activeOrder.paymentMethod} / {activeOrder.deliveryMethod}</p>
                    </div>
                    <span className="text-lg font-bold font-display text-amber-700" style={{ color: config.accentColor }}>
                      {formatCurrency(activeOrder.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-400 text-xs font-mono">
                Select a logged order from the terminal timeline to oversee active dispatch specs.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB VIEW 2: CONTENT CATALOG MANAGER (CRUD) */}
      {adminSubTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-display text-gray-900">
              Content Catalog Manager
            </h2>
            {editingProductId === null && (
              <button
                onClick={startNewProductForm}
                className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Machine</span>
              </button>
            )}
          </div>

          {/* CRUD Form overlay/block */}
          {editingProductId !== null ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 relative max-w-2xl">
              <h3 className="text-lg font-bold font-display text-gray-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-amber-600" style={{ color: config.accentColor }} />
                <span>{editingProductId === 'new' ? 'Add New Catalog System' : 'Edit Catalog System'}</span>
              </h3>

              <form onSubmit={handleCatalogFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Machine Model ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. m-105"
                      disabled={editingProductId !== 'new'}
                      value={productForm.id}
                      onChange={(e) => setProductForm({ ...productForm, id: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">System Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="CNC & Milling">CNC & Milling</option>
                      <option value="Heavy Machinery">Heavy Machinery</option>
                      <option value="Automated Robots">Automated Robots</option>
                      <option value="Precision Tools">Precision Tools</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">System Asset Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Titan-Z Heavy Press"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Base Valuation Price ($) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 95000"
                      value={productForm.price || ''}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Unsplash Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://images.unsplash.com/..."
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">System Asset Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Comprehensive description of operations, axis travels, thermal parameters..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  ></textarea>
                </div>

                <div className="flex items-center space-x-2.5 py-1">
                  <input
                    type="checkbox"
                    id="isTopSeller"
                    checked={productForm.isTopSeller}
                    onChange={(e) => setProductForm({ ...productForm, isTopSeller: e.target.checked })}
                    className="rounded-sm border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <label htmlFor="isTopSeller" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                    Highlight as [Top Seller] on Public Storefront
                  </label>
                </div>

                {/* Sub specifications editing */}
                <div className="space-y-3.5 border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold font-mono text-gray-400 uppercase">Technical Specifications Grid</span>
                    <button
                      type="button"
                      onClick={addSpecRow}
                      className="text-amber-700 hover:text-amber-950 text-xs font-mono font-bold flex items-center space-x-0.5 cursor-pointer"
                    >
                      <span>[+ Add Parameter Row]</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {productForm.specifications.map((row, idx) => (
                      <div key={idx} className="flex gap-2.5 items-center">
                        <input
                          type="text"
                          required
                          placeholder="Key e.g. Power Rating"
                          value={row.key}
                          onChange={(e) => {
                            const temp = [...productForm.specifications];
                            temp[idx].key = e.target.value;
                            setProductForm({ ...productForm, specifications: temp });
                          }}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Value e.g. 15 kW"
                          value={row.val}
                          onChange={(e) => {
                            const temp = [...productForm.specifications];
                            temp[idx].val = e.target.value;
                            setProductForm({ ...productForm, specifications: temp });
                          }}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        {productForm.specifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSpecRow(idx)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingProductId(null)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-white font-bold rounded-xl text-xs hover:brightness-110 cursor-pointer"
                    style={{ backgroundColor: config.accentColor || '#D97706' }}
                  >
                    Save Catalog Asset
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Catalog CRUD table list */
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-bold font-mono text-gray-400 uppercase bg-gray-50/50">
                      <th className="py-3 px-4">Ref ID</th>
                      <th className="py-3 px-4">System Asset</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Base price</th>
                      <th className="py-3 px-4">Spotlight</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-500">{p.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-7 rounded object-cover border border-gray-100"
                            />
                            <div>
                              <span className="font-bold text-gray-900 block">{p.name}</span>
                              <span className="text-[10px] text-gray-400 block truncate max-w-xs">{p.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-500">{p.category}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-950">{formatCurrency(p.price)}</td>
                        <td className="py-3.5 px-4">
                          {p.isTopSeller ? (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                              TOP SELLER
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2.5">
                            <button
                              onClick={() => startEditProductForm(p)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                              title="Edit listing details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                              title="Retire listing from database"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB VIEW 3: GENERAL CONFIGURATION SETTINGS */}
      {adminSubTab === 'config' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-2xs max-w-2xl">
          <h2 className="text-lg font-bold font-display text-gray-900 mb-5">
            Branding Configurations & Operating Parameters
          </h2>

          <form onSubmit={handleConfigFormSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Registered Business Name *</label>
              <input
                type="text"
                required
                value={configForm.businessName}
                onChange={(e) => setConfigForm({ ...configForm, businessName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Core Tagline Headline</label>
              <input
                type="text"
                value={configForm.tagline}
                onChange={(e) => setConfigForm({ ...configForm, tagline: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Corporate Email</label>
                <input
                  type="email"
                  value={configForm.email}
                  onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Toll-free Hotline Phone</label>
                <input
                  type="text"
                  value={configForm.phone}
                  onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Corporate Headquarters Address</label>
              <input
                type="text"
                value={configForm.address}
                onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-gray-400 uppercase">Plant Working Hours</label>
              <input
                type="text"
                value={configForm.operatingHours}
                onChange={(e) => setConfigForm({ ...configForm, operatingHours: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Custom Accent Branding colors selection */}
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <span className="text-[10px] font-bold font-mono text-gray-400 uppercase block">Branding Signature Theme Accent Color</span>
              <div className="flex flex-wrap gap-3 items-center">
                {colorPresets.map((cp) => (
                  <button
                    key={cp.hex}
                    type="button"
                    onClick={() => setConfigForm({ ...configForm, accentColor: cp.hex })}
                    className={`h-9 px-3 rounded-xl text-xs font-mono font-medium flex items-center space-x-1.5 transition-all cursor-pointer border ${
                      configForm.accentColor === cp.hex
                        ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900 font-bold'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cp.hex }}></span>
                    <span className="text-[10px]">{cp.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 text-white font-bold rounded-xl text-xs hover:brightness-110 cursor-pointer"
                style={{ backgroundColor: configForm.accentColor || '#D97706' }}
              >
                Save General Configurations
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

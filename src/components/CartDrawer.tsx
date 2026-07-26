/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, ShoppingCart, User, Building2, MapPin, Mail, Phone, CreditCard, Ship, FileText, CheckCircle } from 'lucide-react';
import { OrderItem, CustomMachineDetails, CustomerInfo, BusinessConfig } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: BusinessConfig;
  cartItems: OrderItem[];
  customMachine: CustomMachineDetails | null;
  onRemoveItem: (productId: string) => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemoveCustomMachine: () => void;
  onCheckoutSuccess: (orderId: string) => void;
  visitorToken: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  config,
  cartItems,
  customMachine,
  onRemoveItem,
  onUpdateQty,
  onRemoveCustomMachine,
  onCheckoutSuccess,
  visitorToken,
}: CartDrawerProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('RTGS / NEFT Bank Transfer');
  const [deliveryMethod, setDeliveryMethod] = useState('Freight Carrier (VRL Logistics)');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate price tallies
  const itemsTotal = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const customMachineTotal = customMachine ? customMachine.totalPrice : 0;
  const grandTotal = itemsTotal + customMachineTotal;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.company || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      setSubmitError("Please fill out all required client details and facility addresses.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      visitorToken,
      customerInfo,
      items: cartItems,
      customMachine,
      totalPrice: grandTotal,
      notes: orderNotes,
      paymentMethod,
      deliveryMethod,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create purchase request order. Server rejected transaction.');
      }

      const data = await response.json();
      if (data.success && data.order) {
        onCheckoutSuccess(data.order.id);
        // Clear local variables
        setOrderNotes('');
        setCustomerInfo({ name: '', company: '', email: '', phone: '', address: '', gstin: '' });
      } else {
        throw new Error('Server returned unsuccessful state.');
      }
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Network error communicating with procurement server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-700" style={{ color: config.accentColor, backgroundColor: `${config.accentColor}10` }}>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold font-display text-gray-900 tracking-tight">
                Order Configuration Basket
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Basket Items List */}
            {cartItems.length === 0 && !customMachine ? (
              <div className="text-center py-12 space-y-3">
                <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-medium text-gray-500">Your configuration basket is empty.</p>
                <p className="text-xs text-gray-400">Browse the storefront or customization panel to build assets.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. Custom Machine Item if present */}
                {customMachine && (
                  <div className="border border-amber-200/50 bg-amber-50/15 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                          CUSTOM ASSEMBLED ASSET
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 mt-1">
                          {customMachine.baseModelName}
                        </h4>
                      </div>
                      <button
                        onClick={onRemoveCustomMachine}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-white transition-all cursor-pointer"
                        title="Delete custom build"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[11px] text-gray-500 font-mono space-y-1">
                      <p><strong className="text-gray-700">Chassis:</strong> {customMachine.chassis}</p>
                      <p><strong className="text-gray-700">Drive:</strong> {customMachine.powerUnit}</p>
                      <p><strong className="text-gray-700">Control:</strong> {customMachine.controlSystem}</p>
                      {customMachine.addedFeatures.length > 0 && (
                        <p><strong className="text-gray-700">Auxiliaries:</strong> {customMachine.addedFeatures.join(', ')}</p>
                      )}
                      <p><strong className="text-gray-700">Weight:</strong> {customMachine.totalWeightKg.toLocaleString()} kg</p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                      <span className="text-xs text-gray-400 font-mono font-bold">VALUATION:</span>
                      <span className="text-sm font-mono font-bold text-amber-700" style={{ color: config.accentColor }}>
                        {formatCurrency(customMachine.totalPrice)}
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Stock Catalog Items */}
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center p-3.5 border border-gray-100 rounded-xl space-x-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-400 font-mono uppercase block">Catalog Menu Item</span>
                      <h4 className="font-bold text-sm text-gray-900 truncate">{item.productName}</h4>
                      <p className="text-xs text-amber-700 font-mono font-semibold mt-0.5">{formatCurrency(item.price)}</p>
                    </div>
                    
                    {/* Qty edit */}
                    <div className="flex items-center space-x-2.5">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-gray-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.productId)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Price tally banner */}
            {(cartItems.length > 0 || customMachine) && (
              <div className="bg-gray-50 rounded-2xl p-4.5 border border-gray-100 space-y-2 font-mono text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Stock Catalog Items Valuation:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(itemsTotal)}</span>
                </div>
                {customMachine && (
                  <div className="flex justify-between">
                    <span>Custom Configuration Build Valuation:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(customMachineTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 text-gray-900 font-display">
                  <span>Grand Total Valuation:</span>
                  <span className="text-amber-700 font-mono text-base" style={{ color: config.accentColor }}>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            )}

            {/* Formal B2B Procurement Request Form */}
            {(cartItems.length > 0 || customMachine) && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <h3 className="text-xs font-extrabold font-mono tracking-wider text-gray-400 uppercase border-b border-gray-100 pb-2">
                  Client and Consignment Logistics
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-gray-400 uppercase flex items-center">
                    <User className="w-3.5 h-3.5 mr-1" />
                    Consignee Representative Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Richard Hendricks"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1" />
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vortex Automotive India"
                      value={customerInfo.company}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 27AADCV1234A1Z5"
                      value={customerInfo.gstin || ''}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, gstin: e.target.value.toUpperCase() })}
                      maxLength={15}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-wider"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-1" />
                      Business Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rhendricks@hooli.com"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1" />
                      Direct Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 012-9843"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-gray-400 uppercase flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    Delivery Consignment Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 Industrial Blvd, Suite A, Houston, TX 77001"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                 <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase flex items-center">
                      <CreditCard className="w-3.5 h-3.5 mr-1" />
                      Payment terms
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option>RTGS / NEFT Bank Transfer</option>
                      <option>Letter of Credit (L/C 60 Days - SBI/HDFC)</option>
                      <option>B2B Pro-forma Invoice (Net 30)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-gray-400 uppercase flex items-center">
                      <Ship className="w-3.5 h-3.5 mr-1" />
                      Delivery mode
                    </label>
                    <select
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option>Freight Carrier (VRL Logistics)</option>
                      <option>Gati Cargo Express Delivery</option>
                      <option>Self Pickup (EXW Bengaluru Factory)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-gray-400 uppercase flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1" />
                    Special Notes / Factory Directives
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specify target spindle calibration, floor anchor blueprints, or custom dock delivery clearances..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:text-gray-400"
                  ></textarea>
                </div>

                {submitError && (
                  <p className="text-xs text-red-500 font-semibold font-mono bg-red-50 border border-red-100 p-2.5 rounded-xl">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 text-center text-white font-bold rounded-xl shadow-xs hover:shadow-md transition-all text-xs disabled:opacity-50 flex items-center justify-center space-x-1 hover:brightness-110 cursor-pointer"
                  style={{ backgroundColor: config.accentColor || '#D97706' }}
                >
                  {isSubmitting ? (
                    <span>Registering Purchase Request...</span>
                  ) : (
                    <span>Submit Formal Purchase Request</span>
                  )}
                </button>
              </form>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

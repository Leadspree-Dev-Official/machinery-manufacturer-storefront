/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle, Package, ArrowRight, MessageSquare, RefreshCw, Layers, ShieldCheck, DollarSign } from 'lucide-react';
import { Order, OrderStatus, BusinessConfig } from '../types';

interface TrackerProps {
  orders: Order[];
  config: BusinessConfig;
  visitorToken: string;
  activeOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  onForceRefresh: () => void;
  isPollingActive: boolean;
}

export default function Tracker({
  orders,
  config,
  visitorToken,
  activeOrderId,
  onSelectOrder,
  onForceRefresh,
  isPollingActive,
}: TrackerProps) {
  // Find customer's personal orders based on their persistent visitor session token
  const customerOrders = orders.filter((o) => o.visitorToken === visitorToken);
  
  // Currently tracked order
  const trackedOrder = orders.find((o) => o.id === activeOrderId) || (customerOrders.length > 0 ? customerOrders[0] : null);

  const statusMilestones: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'Received', label: 'Order Logged', desc: 'System requirements received and registered.' },
    { status: 'Preparing', label: 'Base Assembly', desc: 'Chassis castings, spindle units & frame alignment.' },
    { status: 'Quality Check', label: 'Micrometric Calibration', desc: 'Tolerance verification, telemetry checks.' },
    { status: 'Out for Delivery', label: 'Freight Transit', desc: 'Secured on freight carrier with cargo coverage.' },
    { status: 'Completed', label: 'Facility Hand-off', desc: 'Commissioned on-site and hand-off complete.' },
  ];

  const getStatusIndex = (currentStatus: OrderStatus) => {
    const idx = statusMilestones.findIndex((m) => m.status === currentStatus);
    return idx === -1 ? 0 : idx;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate beautiful WhatsApp summary message
  const handleWhatsAppShare = () => {
    if (!trackedOrder) return;

    let payload = `*${config.businessName.toUpperCase()} - ORDER RECEIPT SUMMARY*\n`;
    payload += `--------------------------------------\n`;
    payload += `*Order Reference:* ${trackedOrder.id}\n`;
    payload += `*Order Date:* ${new Date(trackedOrder.orderDate).toLocaleDateString()}\n`;
    payload += `*Status:* ${trackedOrder.status.toUpperCase()}\n\n`;

    if (trackedOrder.customMachine) {
      const cm = trackedOrder.customMachine;
      payload += `*MACHINE CONFIGURATION:*\n`;
      payload += `• *Base Model:* ${cm.baseModelName}\n`;
      payload += `• *Chassis:* ${cm.chassis}\n`;
      payload += `• *Spindle Drive:* ${cm.powerUnit}\n`;
      payload += `• *Control Platform:* ${cm.controlSystem}\n`;
      if (cm.addedFeatures.length > 0) {
        payload += `• *Auxiliaries:* ${cm.addedFeatures.join(', ')}\n`;
      }
      payload += `• *System Weight:* ${cm.totalWeightKg.toLocaleString()} kg\n\n`;
    } else if (trackedOrder.items.length > 0) {
      payload += `*ORDERED ITEMS:*\n`;
      trackedOrder.items.forEach((item) => {
        payload += `• ${item.productName} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}\n`;
      });
      payload += `\n`;
    }

    payload += `*TOTAL INVESTMENT:* ${formatCurrency(trackedOrder.totalPrice)}\n`;
    payload += `*Delivery Mode:* ${trackedOrder.deliveryMethod}\n`;
    payload += `*Client Contact:* ${trackedOrder.customerInfo.name} (${trackedOrder.customerInfo.company})\n`;
    if (trackedOrder.notes) {
      payload += `*Special Directives:* "${trackedOrder.notes}"\n`;
    }
    payload += `--------------------------------------\n`;
    payload += `Track your heavy machinery live: ${window.location.origin}/#/tracker?id=${trackedOrder.id}`;

    const encodedText = encodeURIComponent(payload);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      <div className="border-b border-gray-100 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
            Real-Time Order Tracker
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor the dispatch, calibration, testing, and delivery parameters of your customized industrial heavy assets.
          </p>
        </div>

        {/* Polling diagnostic / status indicator */}
        <div className="flex items-center space-x-3.5 bg-gray-50 border border-gray-200/50 p-2.5 rounded-xl self-start">
          <button
            onClick={onForceRefresh}
            className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-950 transition-all cursor-pointer"
            id="tracker-refresh-btn"
            title="Force status refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isPollingActive ? 'animate-spin [animation-duration:10s]' : ''}`} />
          </button>
          <div className="text-left leading-none">
            <span className="block text-[9px] font-mono font-bold text-gray-400 uppercase">
              Polling Status
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block mr-1 animate-ping"></span>
              Live Tracking Connected (every 5s)
            </span>
          </div>
        </div>
      </div>

      {/* Lookup view if no orders active */}
      {!trackedOrder ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-2xs text-center max-w-xl mx-auto space-y-5">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold font-display text-gray-900">No Active Machinery Tracked</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Your device session does not have any active customized orders yet. 
              Configure a custom CNC spindle or hydraulic press in our interactive builder to begin procurement.
            </p>
          </div>
          <div className="pt-2">
            {customerOrders.length > 0 ? (
              <div className="space-y-2 text-left">
                <span className="block text-xs font-bold font-mono text-gray-400 uppercase mb-2">
                  Select Order To View
                </span>
                {customerOrders.map((co) => (
                  <button
                    key={co.id}
                    onClick={() => onSelectOrder(co.id)}
                    className="w-full text-left p-3 border rounded-xl hover:border-amber-600 hover:bg-amber-50/10 flex justify-between items-center cursor-pointer transition-all"
                  >
                    <div>
                      <span className="font-bold text-sm text-gray-900 block">{co.id}</span>
                      <span className="text-xs text-gray-400 font-mono block">Placed {new Date(co.orderDate).toLocaleDateString()}</span>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                      {co.status}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Main Tracker Panel (col-span-8) */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Live Milestone Progress (Stepper) */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold font-mono text-gray-400 uppercase block">
                    CURRENT STATE
                  </span>
                  <h3 className="text-xl font-bold font-display text-gray-900 tracking-tight mt-1">
                    System Milestone Progress
                  </h3>
                </div>
                <div className="bg-amber-50 border border-amber-200/50 px-3.5 py-1.5 rounded-xl">
                  <span className="text-xs font-mono font-bold text-amber-800">
                    STATUS: {trackedOrder.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Milestones stepper */}
              <div className="relative pt-2 pl-3 sm:pl-0">
                {/* Vertical line on mobile, horizontal line on desktop */}
                <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-100 sm:left-auto sm:top-6 sm:bottom-auto sm:left-10 sm:right-10 sm:h-0.5 sm:w-auto z-0"></div>

                {/* Stepper Progress bar overlay */}
                <div 
                  className="absolute left-4 w-0.5 bg-amber-600 transition-all duration-1000 sm:left-auto sm:top-6 sm:bottom-auto sm:left-10 sm:right-10 sm:h-0.5 sm:w-auto z-0"
                  style={{
                    height: window.innerWidth < 640 ? `${(getStatusIndex(trackedOrder.status) / (statusMilestones.length - 1)) * 100}%` : '0.5px',
                    width: window.innerWidth >= 640 ? `${(getStatusIndex(trackedOrder.status) / (statusMilestones.length - 1)) * 100}%` : '2px',
                    backgroundColor: config.accentColor || '#D97706'
                  }}
                ></div>

                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-5 gap-8 sm:gap-4">
                  {statusMilestones.map((m, idx) => {
                    const isCompleted = idx <= getStatusIndex(trackedOrder.status);
                    const isActive = idx === getStatusIndex(trackedOrder.status);

                    return (
                      <div key={m.status} className="flex sm:flex-col items-start sm:items-center sm:text-center space-x-4 sm:space-x-0">
                        {/* Step Circle */}
                        <div 
                          className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all shrink-0 ${
                            isCompleted 
                              ? 'text-white border-transparent' 
                              : 'bg-white border-gray-200 text-gray-400'
                          }`}
                          style={{
                            backgroundColor: isCompleted ? (config.accentColor || '#D97706') : 'white',
                            borderColor: isActive ? (config.accentColor || '#D97706') : undefined,
                            boxShadow: isActive ? `0 0 12px ${config.accentColor || '#D97706'}40` : undefined
                          }}
                        >
                          {isCompleted ? <CheckCircle className="w-4 h-4 text-white" /> : idx + 1}
                        </div>

                        {/* Step Description */}
                        <div className="mt-0 sm:mt-3 space-y-0.5">
                          <span className={`block text-xs font-bold tracking-tight ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {m.label}
                          </span>
                          <span className="block text-[10px] text-gray-400 leading-normal max-w-[140px] mx-auto">
                            {m.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Receipt / Specs breakdown */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              <h3 className="text-lg font-bold font-display text-gray-900 tracking-tight flex items-center">
                <Layers className="w-5 h-5 mr-2 text-amber-600" style={{ color: config.accentColor }} />
                <span>Assembled Specification Details</span>
              </h3>

              {trackedOrder.customMachine ? (
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <span className="block text-[10px] font-mono text-gray-400 uppercase font-semibold">
                        Custom Assembled Machinery Build
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                        {trackedOrder.customMachine.baseModelName}
                      </h4>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase self-start">
                      Unique Configuration Custom Build
                    </span>
                  </div>

                  <div className="p-5 space-y-4 font-mono text-xs text-gray-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 block">Structural Frame & Chassis</span>
                        <span className="text-gray-800 font-semibold block">{trackedOrder.customMachine.chassis}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Spindle Drive & Power Unit</span>
                        <span className="text-gray-800 font-semibold block">{trackedOrder.customMachine.powerUnit}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Automation Control Software</span>
                        <span className="text-gray-800 font-semibold block">{trackedOrder.customMachine.controlSystem}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">System Total Assembled Weight</span>
                        <span className="text-gray-800 font-semibold block">{trackedOrder.customMachine.totalWeightKg.toLocaleString()} kg</span>
                      </div>
                    </div>

                    {trackedOrder.customMachine.addedFeatures.length > 0 && (
                      <div className="border-t border-gray-100 pt-3">
                        <span className="text-gray-400 block mb-1">Auxiliary Modules Commissioned</span>
                        <ul className="list-disc pl-4 space-y-0.5 text-gray-700">
                          {trackedOrder.customMachine.addedFeatures.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-gray-100 rounded-2xl overflow-hidden font-mono text-xs">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 text-gray-500 font-bold">
                    Standard Catalog Machinery Order
                  </div>
                  <div className="divide-y divide-gray-100 p-4">
                    {trackedOrder.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex justify-between">
                        <span>{item.productName} (x{item.quantity})</span>
                        <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Metadata, Logistics Panel (col-span-4) */}
          <div className="xl:col-span-4 space-y-8">
            {/* Procurement Details */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-base font-bold font-display text-gray-900 tracking-tight flex items-center">
                <Clock className="w-4.5 h-4.5 mr-2 text-amber-600" style={{ color: config.accentColor }} />
                <span>Logistic Parameters</span>
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-gray-400">Order ID</span>
                  <span className="font-bold text-gray-900">{trackedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-gray-400">Order Date</span>
                  <span className="font-bold text-gray-900">{new Date(trackedOrder.orderDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-gray-400">Payment Term</span>
                  <span className="font-bold text-amber-700">{trackedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2.5">
                  <span className="text-gray-400">Delivery Cargo Mode</span>
                  <span className="font-bold text-gray-900">{trackedOrder.deliveryMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Valuation</span>
                  <span className="font-bold text-amber-700 text-sm" style={{ color: config.accentColor }}>
                    {formatCurrency(trackedOrder.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Customer summary */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <span className="block text-[10px] font-bold font-mono text-gray-400 uppercase">
                  Consignee Details
                </span>
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-gray-900">{trackedOrder.customerInfo.name}</p>
                  <p className="font-medium text-gray-600">{trackedOrder.customerInfo.company}</p>
                  <p className="text-gray-500 font-mono text-[11px]">{trackedOrder.customerInfo.phone}</p>
                  {trackedOrder.customerInfo.gstin && (
                    <p className="text-emerald-700 font-mono font-bold text-[10px] mt-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded inline-block">
                      GSTIN: {trackedOrder.customerInfo.gstin}
                    </p>
                  )}
                  <div className="flex items-start text-gray-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{trackedOrder.customerInfo.address}</span>
                  </div>
                </div>

                {trackedOrder.notes && (
                  <div className="border-t border-gray-200/60 pt-2.5 mt-2 text-[11px] italic text-gray-500">
                    <strong>Special Directives:</strong> "{trackedOrder.notes}"
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                  id="tracker-whatsapp-btn"
                >
                  <MessageSquare className="w-4h-4 fill-white text-emerald-600" />
                  <span>Send Receipt to WhatsApp</span>
                </button>
              </div>
            </div>

            {/* List other orders placed by client in this session if any */}
            {customerOrders.length > 1 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold font-mono text-gray-400 uppercase">
                  Your Other Orders in Session
                </h4>
                <div className="space-y-2">
                  {customerOrders
                    .filter((o) => o.id !== trackedOrder.id)
                    .map((co) => (
                      <button
                        key={co.id}
                        onClick={() => onSelectOrder(co.id)}
                        className="w-full text-left p-3 border border-gray-100 rounded-xl hover:border-amber-600 hover:bg-amber-50/5 flex justify-between items-center transition-all cursor-pointer text-xs"
                      >
                        <div className="font-mono">
                          <span className="font-bold text-gray-900 block">{co.id}</span>
                          <span className="text-[10px] text-gray-400 block">{new Date(co.orderDate).toLocaleDateString()}</span>
                        </div>
                        <span className="bg-gray-100 text-gray-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                          {co.status}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

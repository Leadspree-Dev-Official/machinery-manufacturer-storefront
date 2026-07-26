/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, ShoppingBag, Menu, X, Shield, Clock, Phone } from 'lucide-react';
import { BusinessConfig } from '../types';

interface NavbarProps {
  config: BusinessConfig;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
}

export default function Navbar({
  config,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  isAdminLoggedIn,
  onLogoutAdmin,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'storefront', label: 'Storefront' },
    { id: 'customizer', label: 'Machine Configurator' },
    { id: 'specialists', label: 'Engineering Advisory' },
    { id: 'tracker', label: 'Order Tracker' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Brand area */}
          <div className="flex items-center">
            <button
              onClick={() => setActiveTab('storefront')}
              className="flex items-center space-x-3 cursor-pointer group"
              id="nav-logo-btn"
            >
              <div 
                className="p-2.5 rounded-xl text-white transition-all duration-300 shadow-sm"
                style={{ backgroundColor: config.accentColor || '#D97706' }}
              >
                <Cpu className="w-6 h-6 group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div className="text-left">
                <span
                  data-brand-text="business-name"
                  data-brand-default="Apex Industrial Systems India"
                  className="block text-lg font-bold font-display tracking-tight text-gray-900 group-hover:text-amber-600 transition-colors"
                >
                  {config.businessName || 'Apex Industrial'}
                </span>
                <span
                  data-brand-text="contact-name"
                  className="block text-[10px] font-mono tracking-wider text-gray-400 uppercase -mt-1"
                >
                  Precision Systems
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium tracking-tight transition-all duration-200 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-gray-50 text-gray-900 shadow-2xs font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
                id={`nav-item-${item.id}`}
              >
                {item.label}
              </button>
            ))}

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {/* Admin Hub direct link */}
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-50 text-amber-700 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-amber-600 hover:bg-amber-50/30'
              }`}
              id="nav-item-admin"
            >
              <Shield className="w-4 h-4" />
              <span>{isAdminLoggedIn ? 'Admin Panel' : 'Staff Access'}</span>
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={onLogoutAdmin}
                className="text-xs text-red-500 hover:text-red-700 font-mono hover:underline pl-2 cursor-pointer"
                id="nav-logout-btn"
              >
                [Exit]
              </button>
            )}
          </div>

          {/* Cart & Mobile actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full hover:bg-gray-100/80 text-gray-700 transition-all cursor-pointer"
              aria-label="Open cart"
              id="nav-cart-btn"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white animate-pulse"
                  style={{ backgroundColor: config.accentColor || '#D97706' }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
                aria-label="Toggle mobile menu"
                id="nav-mobile-toggle"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 px-4 pt-2 pb-4 space-y-1 shadow-md animate-in slide-in-from-top duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="h-px bg-gray-100 my-2"></div>
          <button
            onClick={() => {
              setActiveTab('admin');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-2 w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-amber-50 text-amber-700 font-semibold'
                : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50/20'
            }`}
          >
            <Shield className="w-5 h-5 text-amber-600" />
            <span>{isAdminLoggedIn ? 'Admin Panel' : 'Staff Access Portal'}</span>
          </button>
          
          {isAdminLoggedIn && (
            <button
              onClick={() => {
                onLogoutAdmin();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-500 font-mono"
            >
              Logout Admin Session
            </button>
          )}

          <div className="bg-gray-50 rounded-xl p-3 mt-4 text-xs text-gray-400 space-y-1 font-mono">
            <div className="flex items-center text-[10px]">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>{config.operatingHours}</span>
            </div>
            <div className="flex items-center text-[10px]">
              <Phone className="w-3.5 h-3.5 mr-1" />
              <span>{config.phone}</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowRight, Zap, Info, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Product, BusinessConfig } from '../types';

interface StorefrontProps {
  products: Product[];
  config: BusinessConfig;
  onAddToCart: (product: Product) => void;
  onConfigureProduct: (product: Product) => void;
}

export default function Storefront({
  products,
  config,
  onAddToCart,
  onConfigureProduct,
}: StorefrontProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOnlyTopSellers, setShowOnlyTopSellers] = useState(false);
  const [expandedSpecs, setExpandedSpecs] = useState<Record<string, boolean>>({});
  const [priceRange, setPriceRange] = useState<number>(12000000);

  // Extract unique categories dynamically
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  // Filtering logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.entries(product.specifications).some(([key, val]) =>
        val.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesTopSeller = !showOnlyTopSellers || product.isTopSeller;
    const matchesPrice = product.price <= priceRange;

    return matchesSearch && matchesCategory && matchesTopSeller && matchesPrice;
  });

  const toggleSpecs = (productId: string) => {
    setExpandedSpecs((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-radial from-gray-50 to-gray-100 border border-gray-100 rounded-3xl p-8 sm:p-12 lg:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        <div className="relative max-w-3xl z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200/50 text-amber-800 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide">
            <Zap className="w-3.5 h-3.5" style={{ color: config.accentColor }} />
            <span>EXCELLENCE IN HEAVY ENGINEERING</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-gray-900 tracking-tight leading-none">
            {config.tagline || 'Engineering High-Performance Industrial Machinery'}
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600 max-w-xl font-normal leading-relaxed">
            Our premium, automated industrial solutions are manufactured with extreme micrometric precision. 
            Customize structural dimensions, spindle payloads, and software modules to align with your facility's requirements.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => {
                const element = document.getElementById('catalog-start');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm flex items-center space-x-2 group cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onConfigureProduct(products[0])}
              className="px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Launch Custom Configurator
            </button>
          </div>
        </div>

        {/* Decorative Grid Element */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:block opacity-10 pointer-events-none">
          <div className="h-full w-full border-l border-b border-dashed border-gray-900/30 flex items-center justify-center">
            <div className="border border-dashed border-gray-900 p-12 rounded-full animate-spin [animation-duration:40s]">
              <div className="border border-dashed border-gray-900 p-12 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Search & Filtering Area */}
      <section id="catalog-start" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-gray-900">
              System Catalog
            </h2>
            <p className="text-sm text-gray-500">
              Browse standard base configurations, select models, or load into builder.
            </p>
          </div>

          {/* Dynamic Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-gray-100/70 p-1 rounded-xl self-start">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-white text-gray-900 shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Micro filters Panel */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by model, specifications, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* Price Range Filter */}
          <div className="md:col-span-4 flex flex-col space-y-1">
            <div className="flex justify-between text-xs font-mono text-gray-400">
              <span>Max Price:</span>
              <span className="font-semibold text-gray-700">{formatCurrency(priceRange)}</span>
            </div>
            <input
              type="range"
              min="3000000"
              max="12000000"
              step="100000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Top Sellers filter checkbox */}
          <div className="md:col-span-3 flex items-center md:justify-end">
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyTopSellers}
                onChange={(e) => setShowOnlyTopSellers(e.target.checked)}
                className="rounded-sm border-gray-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <span className="text-xs font-medium text-gray-700">
                Show Only Top Sellers
              </span>
            </label>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
            <SlidersHorizontal className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No matching machinery found.</p>
            <p className="text-xs text-gray-400 mt-1">Adjust search strings or reset category filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setShowOnlyTopSellers(false);
                setPriceRange(12000000);
              }}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredProducts.map((product) => {
              const isExpanded = !!expandedSpecs[product.id];
              return (
                <article
                  key={product.id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden flex flex-col group hover:shadow-md hover:border-gray-200 transition-all duration-300"
                  id={`product-card-${product.id}`}
                >
                  {/* Image container */}
                  <div className="relative aspect-video w-full bg-gray-50 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Tags overlay */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="bg-white/90 backdrop-blur-xs text-gray-900 border border-gray-200/50 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase font-mono">
                        {product.category}
                      </span>
                      {product.isTopSeller && (
                        <span 
                          className="text-white px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase font-mono flex items-center space-x-1"
                          style={{ backgroundColor: config.accentColor || '#D97706' }}
                        >
                          <Zap className="w-3 h-3 fill-white" />
                          <span>Top Seller</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 right-4">
                      <span className="bg-gray-950/90 text-white font-mono font-semibold text-sm px-3.5 py-1.5 rounded-lg">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 flex-1 flex flex-col space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold font-display text-gray-900 tracking-tight group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Expandable Technical Specs Area */}
                    <div className="bg-gray-50 rounded-xl p-3.5 transition-all">
                      <button
                        onClick={() => toggleSpecs(product.id)}
                        className="flex items-center justify-between w-full text-left text-xs font-bold tracking-tight text-gray-700 hover:text-gray-900 cursor-pointer"
                      >
                        <div className="flex items-center space-x-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-600" style={{ color: config.accentColor }} />
                          <span>TECHNICAL SPECIFICATIONS</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-3.5 mt-2 border-t border-gray-200/60 text-[11px] font-mono text-gray-500">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="space-y-0.5">
                              <span className="text-gray-400 block font-normal">{key}</span>
                              <span className="text-gray-800 block font-semibold">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Call-to-actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
                      <button
                        onClick={() => onConfigureProduct(product)}
                        className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center space-x-1 group cursor-pointer"
                      >
                        <span>Configure Custom</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={() => onAddToCart(product)}
                        className="px-4 py-2.5 text-white rounded-xl text-xs font-bold tracking-tight transition-all flex items-center justify-center space-x-1 hover:brightness-110 cursor-pointer"
                        style={{ backgroundColor: config.accentColor || '#D97706' }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add To Order</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

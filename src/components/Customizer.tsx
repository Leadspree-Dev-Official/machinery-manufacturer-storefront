/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Settings, Weight, DollarSign, Layers, CheckCircle, Info, Sparkles, Sliders, Cpu, Activity, Zap } from 'lucide-react';
import { Product, CustomMachineDetails, BusinessConfig } from '../types';

interface CustomizerProps {
  products: Product[];
  config: BusinessConfig;
  preSelectedProduct?: Product | null;
  onAddCustomMachineToCart: (customDetails: CustomMachineDetails) => void;
}

interface ChassisOption {
  id: string;
  name: string;
  weightDelta: number;
  priceDelta: number;
  materials: { material: string; percentage: number }[];
}

interface PowerOption {
  id: string;
  name: string;
  weightDelta: number;
  priceDelta: number;
  copperAdd: number;
}

interface ControlOption {
  id: string;
  name: string;
  priceDelta: number;
}

interface AuxiliaryOption {
  id: string;
  name: string;
  weightDelta: number;
  priceDelta: number;
}

export default function Customizer({
  products,
  config,
  preSelectedProduct,
  onAddCustomMachineToCart,
}: CustomizerProps) {
  // Base model state
  const [selectedProduct, setSelectedProduct] = useState<Product>(
    preSelectedProduct || products[0] || {
      id: "m-101",
      name: "Apex G-300 CNC Milling Center",
      description: "CNC milling machine",
      price: 10500000,
      category: "CNC & Milling",
      imageUrl: "",
      specifications: { "Base Weight": "4,500 kg" },
      isTopSeller: true
    }
  );

  // Sync state if preSelectedProduct changes
  useEffect(() => {
    if (preSelectedProduct) {
      setSelectedProduct(preSelectedProduct);
    }
  }, [preSelectedProduct]);

  // Customizable Options
  const chassisOptions: ChassisOption[] = [
    {
      id: 'cast-iron',
      name: 'High-Density Structural Cast Iron (Standard)',
      weightDelta: 0,
      priceDelta: 0,
      materials: [
        { material: "Structural Carbon Steel", percentage: 80 },
        { material: "Titanium Alloy", percentage: 0 },
        { material: "Copper & Electronics", percentage: 5 },
        { material: "High-Grade Quartz Composite", percentage: 15 }
      ]
    },
    {
      id: 'titanium',
      name: 'Reinforced Aerospace Titanium Alloy',
      weightDelta: 1200,
      priceDelta: 1250000,
      materials: [
        { material: "Structural Carbon Steel", percentage: 40 },
        { material: "Titanium Alloy", percentage: 45 },
        { material: "Copper & Electronics", percentage: 5 },
        { material: "High-Grade Quartz Composite", percentage: 10 }
      ]
    },
    {
      id: 'carbon',
      name: 'Ultralight Carbon Fiber Matrix Composite',
      weightDelta: -500,
      priceDelta: 2350000,
      materials: [
        { material: "Structural Carbon Steel", percentage: 30 },
        { material: "Titanium Alloy", percentage: 5 },
        { material: "Copper & Electronics", percentage: 5 },
        { material: "High-Grade Quartz Composite", percentage: 60 } // Representing polymer/carbon composite
      ]
    }
  ];

  const powerOptions: PowerOption[] = [
    { id: 'standard', name: 'Standard Spindle Unit', weightDelta: 0, priceDelta: 0, copperAdd: 0 },
    { id: 'hybrid', name: 'High-Torque 15kW Hybrid Drive Unit', weightDelta: 200, priceDelta: 550000, copperAdd: 10 },
    { id: 'supercharged', name: 'Supercharged 30kW Spindle Drive Unit', weightDelta: 450, priceDelta: 1050000, copperAdd: 15 }
  ];

  const controlOptions: ControlOption[] = [
    { id: 'standard', name: 'Manual HMI Interface System', priceDelta: 0 },
    { id: 'valkyrie', name: 'Valkyrie RTOS v4 CNC Automation', priceDelta: 380000 },
    { id: 'ai-suite', name: 'Smart CNC Autonomous AI Suite (with Computer Vision)', priceDelta: 670000 }
  ];

  const auxOptions: AuxiliaryOption[] = [
    { id: 'enclosure', name: 'Acoustic Dampening Enclosure Block', weightDelta: 250, priceDelta: 270000 },
    { id: 'coolant', name: 'High-Volume Coolant Flood Jet Injectors', weightDelta: 100, priceDelta: 210000 },
    { id: 'laser', name: 'Active Laser Interferometer Auto-Calibration', weightDelta: 50, priceDelta: 420000 },
    { id: 'lubrication', name: 'Automated Micro-Lubrication Recycler', weightDelta: 80, priceDelta: 150000 }
  ];

  // Selected Option States
  const [selectedChassis, setSelectedChassis] = useState<string>('cast-iron');
  const [selectedPower, setSelectedPower] = useState<string>('standard');
  const [selectedControl, setSelectedControl] = useState<string>('standard');
  const [selectedAux, setSelectedAux] = useState<string[]>([]);

  // Calculate dynamic outputs
  const baseWeightStr = selectedProduct.specifications["Base Weight"] || "1000 kg";
  const baseWeight = parseInt(baseWeightStr.replace(/[^0-9]/g, '')) || 1000;

  const chassisOpt = chassisOptions.find(o => o.id === selectedChassis) || chassisOptions[0];
  const powerOpt = powerOptions.find(o => o.id === selectedPower) || powerOptions[0];
  const controlOpt = controlOptions.find(o => o.id === selectedControl) || controlOptions[0];
  const activeAuxOpts = auxOptions.filter(o => selectedAux.includes(o.id));

  const totalWeight = baseWeight + chassisOpt.weightDelta + powerOpt.weightDelta + activeAuxOpts.reduce((acc, curr) => acc + curr.weightDelta, 0);
  const totalPrice = selectedProduct.price + chassisOpt.priceDelta + powerOpt.priceDelta + controlOpt.priceDelta + activeAuxOpts.reduce((acc, curr) => acc + curr.priceDelta, 0);

  // Materials percentage logic
  const materialsBreakdown = React.useMemo(() => {
    // Start with the base chassis percentages
    const baseMat = [...chassisOpt.materials];
    
    // Add copper add from power units
    const copperModifier = powerOpt.copperAdd;
    if (copperModifier > 0) {
      return baseMat.map(item => {
        if (item.material === "Copper & Electronics") {
          return { ...item, percentage: item.percentage + copperModifier };
        } else if (item.material === "Structural Carbon Steel" && item.percentage >= copperModifier) {
          return { ...item, percentage: item.percentage - copperModifier };
        }
        return item;
      });
    }
    return baseMat;
  }, [chassisOpt, powerOpt]);

  const toggleAuxOption = (id: string) => {
    setSelectedAux(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAssembleAndOrder = () => {
    const customMachine: CustomMachineDetails = {
      baseModelId: selectedProduct.id,
      baseModelName: selectedProduct.name,
      chassis: chassisOpt.name,
      powerUnit: powerOpt.name,
      controlSystem: controlOpt.name,
      addedFeatures: activeAuxOpts.map(o => o.name),
      totalWeightKg: totalWeight,
      totalPrice: totalPrice,
      materialsBreakdown: materialsBreakdown
    };

    onAddCustomMachineToCart(customMachine);
  };

  return (
    <div className="space-y-10 pb-16 animate-in fade-in duration-500">
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
          Interactive Machine Configurator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize industrial base systems, test structural payloads, adjust control layers, and calculate shipping weights.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Side: Customize Options (col-span-7) */}
        <div className="xl:col-span-7 space-y-8">
          {/* 1. Base Model Selector */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-4">
            <label className="block text-xs font-bold tracking-wider font-mono text-gray-400 uppercase">
              1. Select System Base Platform
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedProduct.id === p.id
                      ? 'border-amber-600 bg-amber-50/20 ring-1 ring-amber-600'
                      : 'border-gray-200 hover:border-gray-400 bg-white'
                  }`}
                >
                  <span className="block text-xs font-mono font-bold text-gray-400 uppercase">
                    {p.category}
                  </span>
                  <span className="block text-sm font-bold text-gray-900 mt-1">
                    {p.name}
                  </span>
                  <span className="block text-xs font-mono font-medium text-amber-700 mt-2">
                    Base: {formatCurrency(p.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Chassis / Frame Customizer */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-4">
            <label className="block text-xs font-bold tracking-wider font-mono text-gray-400 uppercase">
              2. Structural Frame & Chassis Construction
            </label>
            <div className="space-y-3">
              {chassisOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedChassis === opt.id
                      ? 'border-amber-600 bg-amber-50/10 ring-1 ring-amber-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="chassis"
                      checked={selectedChassis === opt.id}
                      onChange={() => setSelectedChassis(opt.id)}
                      className="mt-1 accent-amber-600 h-4 w-4"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">{opt.name}</span>
                      <span className="block text-xs text-gray-400 mt-0.5">
                        Weight: {opt.weightDelta >= 0 ? `+${opt.weightDelta} kg` : `${opt.weightDelta} kg`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right mt-2 sm:mt-0 pl-7 sm:pl-0">
                    <span className="text-xs font-mono font-bold text-gray-900">
                      {opt.priceDelta === 0 ? 'Standard' : `+ ${formatCurrency(opt.priceDelta)}`}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Spindle / Power Unit Upgrade */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-4">
            <label className="block text-xs font-bold tracking-wider font-mono text-gray-400 uppercase">
              3. Spindle Power & Drive Engineering
            </label>
            <div className="space-y-3">
              {powerOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedPower === opt.id
                      ? 'border-amber-600 bg-amber-50/10 ring-1 ring-amber-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="power"
                      checked={selectedPower === opt.id}
                      onChange={() => setSelectedPower(opt.id)}
                      className="mt-1 accent-amber-600 h-4 w-4"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">{opt.name}</span>
                      <span className="block text-xs text-gray-400 mt-0.5">
                        Weight Payload Impact: {opt.weightDelta >= 0 ? `+${opt.weightDelta} kg` : `${opt.weightDelta} kg`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right mt-2 sm:mt-0 pl-7 sm:pl-0">
                    <span className="text-xs font-mono font-bold text-gray-900">
                      {opt.priceDelta === 0 ? 'Standard' : `+ ${formatCurrency(opt.priceDelta)}`}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Control Intelligence */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-4">
            <label className="block text-xs font-bold tracking-wider font-mono text-gray-400 uppercase">
              4. Software Control System & Automation
            </label>
            <div className="space-y-3">
              {controlOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedControl === opt.id
                      ? 'border-amber-600 bg-amber-50/10 ring-1 ring-amber-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="control"
                      checked={selectedControl === opt.id}
                      onChange={() => setSelectedControl(opt.id)}
                      className="mt-1 accent-amber-600 h-4 w-4"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">{opt.name}</span>
                      <span className="block text-xs text-gray-400 mt-0.5 flex items-center">
                        <Cpu className="w-3 h-3 mr-1" />
                        Integrated firmware layer & system diagnostic interface.
                      </span>
                    </div>
                  </div>
                  <div className="text-right mt-2 sm:mt-0 pl-7 sm:pl-0">
                    <span className="text-xs font-mono font-bold text-gray-900">
                      {opt.priceDelta === 0 ? 'Standard' : `+ ${formatCurrency(opt.priceDelta)}`}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 5. Auxiliary Modules */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs space-y-4">
            <label className="block text-xs font-bold tracking-wider font-mono text-gray-400 uppercase">
              5. Specialized Auxiliary Systems & Add-Ons
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {auxOptions.map((opt) => {
                const isSelected = selectedAux.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleAuxOption(opt.id)}
                    className={`p-4 border rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/10 ring-1 ring-amber-600'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-bold text-gray-900 leading-tight">
                          {opt.name}
                        </span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded-sm border-gray-300 text-amber-600 focus:ring-amber-500 h-4.5 w-4.5 pointer-events-none"
                        />
                      </div>
                      <span className="block text-[11px] text-gray-400 mt-1 font-mono">
                        Weight Impact: +{opt.weightDelta} kg
                      </span>
                    </div>
                    <span className="block text-xs font-mono font-bold text-amber-700 mt-4 self-end">
                      + {formatCurrency(opt.priceDelta)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Visualizer, Tally & Action (col-span-5) */}
        <div className="xl:col-span-5 space-y-8 sticky top-28">
          {/* Live Industrial Blueprint Visualizer */}
          <div className="bg-gray-950 text-white rounded-3xl p-6 shadow-lg overflow-hidden border border-gray-800 relative">
            <div className="absolute top-4 right-4 flex items-center space-x-1 text-emerald-400 font-mono text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/20 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>Visualizer Online</span>
            </div>
            
            <h3 className="text-xs font-bold font-mono text-gray-500 tracking-wider uppercase mb-5">
              SYSTEM 2D Blueprint Schematic
            </h3>

            {/* Industrial Wireframe Render Stage */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl h-64 relative flex items-center justify-center overflow-hidden">
              {/* Engineering Gridlines background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:20px_20px] opacity-70"></div>
              
              {/* Central Schematic Elements */}
              <div className="w-52 h-44 relative z-10 border border-dashed border-gray-700 flex flex-col p-4 rounded-lg bg-gray-900/40">
                {/* 1. Chassis Frame visual block */}
                <div 
                  className={`border-2 rounded-lg p-2.5 transition-all flex-1 flex flex-col justify-between ${
                    selectedChassis === 'titanium'
                      ? 'border-amber-500/80 bg-amber-500/5 shadow-[0_0_15px_rgba(217,119,6,0.15)]'
                      : selectedChassis === 'carbon'
                      ? 'border-gray-400 bg-gray-800/20'
                      : 'border-blue-500/50 bg-blue-500/5'
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-gray-400">CHASSIS LAYER</span>
                    <span className={selectedChassis === 'titanium' ? 'text-amber-500' : 'text-gray-500'}>
                      {selectedChassis.toUpperCase()}
                    </span>
                  </div>

                  {/* 2. Spindle / Power Visual Indicator */}
                  <div 
                    className={`border border-dashed p-1.5 rounded-md text-center transition-all flex items-center justify-center space-x-1.5 ${
                      selectedPower !== 'standard' 
                        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-400 animate-pulse' 
                        : 'border-gray-700 text-gray-500'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${selectedPower !== 'standard' ? 'text-emerald-400 animate-spin [animation-duration:3s]' : 'text-gray-600'}`} />
                    <span className="text-[8px] font-mono font-bold">
                      {selectedPower === 'standard' ? 'SPINDLE: STANDARD' : 'SPINDLE: UPGRADED'}
                    </span>
                  </div>

                  {/* 3. Screen display readouts for Control Intelligent */}
                  <div className="bg-black/60 border border-gray-800 rounded-md p-1.5 text-[8px] font-mono text-emerald-500/90 space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">SYS:</span>
                      <span className="font-bold">{selectedControl === 'standard' ? 'MANUAL' : selectedControl === 'valkyrie' ? 'VALKYRIE-RTOS' : 'SMART-AI.v9'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SPEED:</span>
                      <span>{selectedPower === 'supercharged' ? '18,500 RPM' : '12,000 RPM'}</span>
                    </div>
                  </div>
                </div>

                {/* Auxiliary Add-On Indicators side slots */}
                <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full border ${selectedAux.includes('enclosure') ? 'bg-amber-500 border-amber-400 animate-ping' : 'bg-gray-800 border-gray-700'}`}></span>
                  <span className={`h-2.5 w-2.5 rounded-full border ${selectedAux.includes('coolant') ? 'bg-blue-500 border-blue-400 animate-pulse' : 'bg-gray-800 border-gray-700'}`}></span>
                </div>
                
                <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full border ${selectedAux.includes('laser') ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-gray-800 border-gray-700'}`}></span>
                  <span className={`h-2.5 w-2.5 rounded-full border ${selectedAux.includes('lubrication') ? 'bg-emerald-500 border-emerald-400' : 'bg-gray-800 border-gray-700'}`}></span>
                </div>
              </div>
            </div>

            {/* Customizer Spec Readout */}
            <div className="mt-5 border-t border-gray-800 pt-5 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="block text-[10px] font-mono text-gray-500 uppercase">
                  Base Machine Model
                </span>
                <span className="block text-xs font-bold text-gray-200">
                  {selectedProduct.name}
                </span>
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-mono text-gray-500 uppercase">
                  Control Architecture
                </span>
                <span className="block text-xs font-bold text-amber-500">
                  {controlOpt.name.split(' (')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Weight, Price, and Materials Tally Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold font-display text-gray-900 tracking-tight flex items-center">
              <Sliders className="w-4 h-4 mr-2 text-amber-600" style={{ color: config.accentColor }} />
              <span>Configuration Tally</span>
            </h3>

            {/* Weight and Price Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center space-x-3.5">
                <div className="p-2.5 bg-gray-100 rounded-xl text-gray-700">
                  <Weight className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-mono text-gray-400 uppercase">
                    Total Weight
                  </span>
                  <span className="block text-lg font-bold font-mono text-gray-800">
                    {totalWeight.toLocaleString()} kg
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center space-x-3.5">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700" style={{ color: config.accentColor, backgroundColor: `${config.accentColor}10` }}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-mono text-gray-400 uppercase">
                    Configured Price
                  </span>
                  <span className="block text-lg font-bold font-mono text-amber-700" style={{ color: config.accentColor }}>
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Materials Breakdown Graph */}
            <div className="space-y-3">
              <span className="block text-xs font-bold tracking-wider font-mono text-gray-400 uppercase">
                Dynamic Materials Composition %
              </span>

              <div className="space-y-2.5 text-xs">
                {materialsBreakdown.map((mat) => (
                  <div key={mat.material} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-600">{mat.material}</span>
                      <span className="font-semibold text-gray-800">{mat.percentage}%</span>
                    </div>
                    {/* Material percentage bar */}
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${mat.percentage}%`,
                          backgroundColor: mat.material.includes("Steel") 
                            ? "#4b5563" 
                            : mat.material.includes("Titanium") 
                            ? config.accentColor 
                            : mat.material.includes("Copper") 
                            ? "#10b981" 
                            : "#6b7280"
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-3">
              <button
                onClick={handleAssembleAndOrder}
                className="w-full text-center text-white font-bold py-3.5 px-4 rounded-xl shadow-xs hover:shadow-md hover:brightness-115 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                style={{ backgroundColor: config.accentColor || '#D97706' }}
              >
                <Sparkles className="w-5 h-5 text-white/80 animate-bounce" />
                <span>Add Customized System to Order</span>
              </button>
              
              <div className="flex items-center justify-center space-x-1 text-[11px] text-gray-400 font-mono">
                <Info className="w-3.5 h-3.5" />
                <span>Assembled on demand at our primary facility.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

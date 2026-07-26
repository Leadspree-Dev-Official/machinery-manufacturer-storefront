/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, Calendar, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { Specialist, BusinessConfig } from '../types';

interface SpecialistsProps {
  specialists: Specialist[];
  config: BusinessConfig;
}

export default function Specialists({ specialists, config }: SpecialistsProps) {
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    machineType: 'Apex G-300 CNC Milling Center',
    notes: '',
  });

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Please provide at least your name and email address.");
      return;
    }
    // Simulate real database submission / action confirmation
    setInquirySubmitted(true);
    setTimeout(() => {
      // Clear form after a short delay
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        machineType: 'Apex G-300 CNC Milling Center',
        notes: '',
      });
    }, 4000);
  };

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500">
      {/* Intro Header */}
      <div className="border-b border-gray-100 pb-5">
        <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
          Heavy Industry Engineering Advisory
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Consult directly with our systems architects, mechanical designers, and smart factory integration engineers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Specialist Profile Cards (col-span-7) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {specialists.map((specialist) => (
              <div
                key={specialist.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-2xs overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-square bg-gray-50 overflow-hidden relative">
                  <img
                    src={specialist.imageUrl}
                    alt={specialist.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 bg-gray-950/80 backdrop-blur-xs px-3 py-1 rounded-lg">
                    <span className="text-[10px] font-mono text-amber-500 tracking-wider uppercase font-semibold">
                      ENGINEERING TEAM
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">
                      {specialist.name}
                    </h3>
                    <p className="text-xs text-amber-700 font-medium tracking-tight">
                      {specialist.role}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-col space-y-2 text-xs font-mono text-gray-500">
                    <a
                      href={`mailto:${specialist.contact}`}
                      className="flex items-center space-x-2 text-gray-600 hover:text-amber-700 transition-colors"
                    >
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{specialist.contact}</span>
                    </a>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{config.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Core Support Guarantee Card */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start space-x-4">
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700" style={{ color: config.accentColor, backgroundColor: `${config.accentColor}10` }}>
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                Our Systems Support Guarantee
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                All customized machinery configurations are audited by our chief architects prior to material procurement. 
                Our experts will host a dedicated 45-minute architectural review call to ensure voltage compatibility, footplate load-bearing ratios, and controller system setups align with your plant requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Consultation Booking Form (col-span-5) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: config.accentColor || '#D97706' }}></div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-display text-gray-900 tracking-tight flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-amber-600" style={{ color: config.accentColor }} />
                <span>Book Advisory Session</span>
              </h3>
              <p className="text-xs text-gray-500">
                Submit your facility's system blueprints to coordinate an engineer consultation call.
              </p>
            </div>

            {inquirySubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200/50 rounded-2xl p-5 text-center space-y-3.5 py-10">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-950">Inquiry Logged Successfully</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed max-w-xs mx-auto">
                    An advisory ticket has been dispatched. One of our engineers will contact you at <strong>{formData.email}</strong> within 4 business hours.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elizabeth Parker"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase">
                    Company / Facility Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Aerospace Systems"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. eparker@apex.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 018-1934"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase">
                    Machinery System of Interest
                  </label>
                  <select
                    value={formData.machineType}
                    onChange={(e) => setFormData({ ...formData, machineType: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  >
                    <option>Apex G-300 CNC Milling Center</option>
                    <option>Titan-X Heavy Duty Hydraulic Press</option>
                    <option>Aegis Sentinel Robotic Arm</option>
                    <option>Vanguard Precision Laser Cutter</option>
                    <option>Other / Completely Custom Machinery</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold font-mono text-gray-400 uppercase">
                    Requirements / Project Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Specify target materials, space constraints, timeline thresholds, or software integrations..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-gray-400"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full text-center text-white font-bold py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition-all text-xs cursor-pointer"
                  style={{ backgroundColor: config.accentColor || '#D97706' }}
                >
                  Request Architecture Consultation
                </button>
              </form>
            )}

            <div className="bg-amber-50/50 border border-amber-200/40 rounded-2xl p-4 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-900 leading-normal">
                All consultations are subject to mutual non-disclosure agreements (NDA). Digital engineering drawings can be shared during the scheduled session.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

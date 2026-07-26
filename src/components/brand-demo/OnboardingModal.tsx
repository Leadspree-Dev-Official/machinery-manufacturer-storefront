import React, { useState, useEffect } from "react";
import { X, Palette, Copy, Check, RotateCcw, Clock, Sparkles } from "lucide-react";
import { useBrand } from "./BrandProvider";
import { generateDemoLink, DEFAULT_COLOR, BrandSession } from "./SessionManager";

const COLOR_PRESETS = [
  "#a9c126", "#e11d48", "#7c3aed", "#2563eb", "#059669",
  "#d97706", "#0891b2", "#be185d", "#4f46e5", "#ea580c",
];

export function OnboardingModal() {
  const { session, showModal, applySession, skipOnboarding, resetBrand } = useBrand();
  const [form, setForm] = useState({
    businessName: "",
    contactName: "",
    phone: "",
    address: "",
    brandColor: DEFAULT_COLOR,
  });
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (session) {
      setForm({
        businessName: session.businessName,
        contactName: session.contactName,
        phone: session.phone,
        address: session.address,
        brandColor: session.brandColor || DEFAULT_COLOR,
      });
    }
  }, [session]);

  if (!showModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessName.trim()) return;
    applySession({
      ...form,
      timestamp: Date.now(),
    });
  };

  const handleCopyLink = () => {
    const link = generateDemoLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    if (showResetConfirm) {
      resetBrand();
      setShowResetConfirm(false);
      setForm({
        businessName: "",
        contactName: "",
        phone: "",
        address: "",
        brandColor: DEFAULT_COLOR,
      });
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={skipOnboarding} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-fade-in border border-neutral-800 bg-neutral-950">
        {/* Top accent stripe */}
        <div className="h-1.5 w-full" style={{ backgroundColor: form.brandColor }} />

        {/* Header */}
        <div className="relative px-6 pt-5 pb-4 border-b border-neutral-800">
          <button
            onClick={skipOnboarding}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${form.brandColor}18`, border: `1px solid ${form.brandColor}30` }}
            >
              <Sparkles className="w-4.5 h-4.5" style={{ color: form.brandColor }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Design Your Brand Demo</h2>
              <p className="text-[11px] text-neutral-500">Customize this demo with your brand identity</p>
            </div>
          </div>

          {/* Session Policy */}
          <div className="mt-3 flex items-center gap-2 text-[10px] text-neutral-500">
            <Clock className="w-3 h-3" />
            <span>Session opens on visit & auto-resets every 3 hours</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Business Name */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Business Name *</label>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="Your Business Name"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition"
            />
          </div>

          {/* Contact Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Contact Name</label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                placeholder="Your Name"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Phone/WhatsApp</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">Business Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="City, State"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
              <Palette className="w-3 h-3" />
              Brand Theme Color
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, brandColor: c })}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                    form.brandColor === c ? "ring-2 ring-offset-2 ring-offset-neutral-950 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c, ringColor: c }}
                />
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={form.brandColor}
                  onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                  className="w-6 h-6 rounded-full cursor-pointer border border-neutral-700"
                />
              </div>
              <span className="text-[11px] text-neutral-500 font-mono ml-1">{form.brandColor}</span>
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: form.brandColor }} />
            <span className="text-[11px] text-neutral-500">Preview:</span>
            <span className="text-sm font-semibold truncate" style={{ color: form.brandColor }}>
              {form.businessName || "Your Brand"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-bold text-neutral-950 transition-all hover:brightness-110 cursor-pointer"
              style={{ backgroundColor: form.brandColor }}
            >
              Apply Brand & Continue
            </button>
            <button
              type="button"
              onClick={skipOnboarding}
              className="px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition cursor-pointer"
            >
              Skip for now
            </button>
          </div>

          {/* Share & Reset Row */}
          {session && (
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-2 text-[11px] text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Share Personalized Demo Link"}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className={`flex items-center gap-1.5 text-[11px] transition cursor-pointer ${
                  showResetConfirm ? "text-red-400 font-semibold" : "text-neutral-500 hover:text-red-400"
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{showResetConfirm ? "Click again to confirm" : "Reset Brand"}</span>
              </button>
            </div>
          )}

          {/* Developer credit */}
          <p className="text-[10px] text-neutral-600 text-center pt-1">
            Developer: Aniruddha Das | Developed by LeadSpree Business Solutions
          </p>
        </form>
      </div>
    </div>
  );
}

export function BrandResetButton() {
  const { session, resetBrand } = useBrand();
  const [confirming, setConfirming] = useState(false);

  if (!session) return null;

  const handleClick = () => {
    if (confirming) {
      resetBrand();
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-2">
      {confirming && (
        <div className="bg-red-950 border border-red-800 text-red-300 text-[11px] px-3 py-1.5 rounded-lg shadow-lg">
          Click again to reset brand
        </div>
      )}
      <button
        onClick={handleClick}
        className={`w-11 h-11 rounded-full shadow-xl flex items-center justify-center transition-all cursor-pointer border ${
          confirming
            ? "bg-red-600 border-red-500 text-white animate-pulse"
            : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white"
        }`}
      >
        <RotateCcw className="w-4.5 h-4.5" />
      </button>
    </div>
  );
}

export default OnboardingModal;

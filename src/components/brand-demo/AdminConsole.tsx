import React, { useState, useEffect } from "react";
import { Shield, X, Settings, FileText, Package, RotateCcw, Eye, EyeOff, Clock } from "lucide-react";
import { useBrand } from "./BrandProvider";
import { getSession, saveSession, clearSession, getAdminPin, setAdminPin, applyBrandColor, resetBrandColor, BrandSession, DEFAULT_COLOR } from "./SessionManager";

type AdminTab = "content" | "orders" | "settings";

export default function AdminConsole() {
  const { session, resetBrand } = useBrand();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("content");
  const [adminSession, setAdminSession] = useState<BrandSession | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("brand_admin_auth");
    if (saved === "true") {
      setAuthenticated(true);
      setAdminSession(getSession());
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === getAdminPin()) {
      setAuthenticated(true);
      sessionStorage.setItem("brand_admin_auth", "true");
      setAdminSession(getSession());
      setError("");
    } else {
      setError("Invalid PIN");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-brand-base flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-raised/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-raised" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Admin Console</h2>
              <p className="text-xs text-white/50">Enter PIN to access</p>
            </div>
          </div>

          <div className="relative">
            <input
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter admin PIN"
              maxLength={6}
              className="w-full px-4 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-brand-raised/50 transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 cursor-pointer"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-raised text-brand-secondary rounded-xl text-sm font-bold hover:brightness-110 transition cursor-pointer"
          >
            Access Admin Panel
          </button>
          <p className="text-[11px] text-white/30 text-center">Default PIN: 1234</p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-base text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-raised/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-raised" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Console</h1>
              <p className="text-xs text-white/50">Manage your brand demo</p>
            </div>
          </div>
          <a
            href="/"
            className="px-4 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition"
          >
            Back to Site
          </a>
        </div>

        {/* Session Info */}
        {adminSession && (
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: adminSession.brandColor || DEFAULT_COLOR }} />
              <span className="text-sm font-medium">{adminSession.businessName}</span>
              {adminSession.phone && <span className="text-xs text-white/40">| {adminSession.phone}</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Clock className="w-3 h-3" />
              <span>3-hour session</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
          {[
            { id: "content" as AdminTab, label: "Live Content Editor", icon: FileText },
            { id: "orders" as AdminTab, label: "Order & Inquiry Tracker", icon: Package },
            { id: "settings" as AdminTab, label: "Site Settings", icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === id ? "bg-white/10 text-white" : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6">
          {activeTab === "content" && <ContentEditor />}
          {activeTab === "orders" && <OrderTracker />}
          {activeTab === "settings" && <SiteSettings resetBrand={resetBrand} />}
        </div>
      </div>
    </div>
  );
}

function ContentEditor() {
  const session = getSession();
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white/80">Live Content Editor</h3>
      <div className="grid gap-3">
        {[
          { label: "Business Name", value: session?.businessName || "Not set", action: "Edit header & footer" },
          { label: "Contact Name", value: session?.contactName || "Not set", action: "Update contact" },
          { label: "Phone", value: session?.phone || "Not set", action: "Update phone" },
          { label: "Address", value: session?.address || "Not set", action: "Update address" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]">
            <div>
              <span className="text-xs text-white/50 block">{item.label}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
            <span className="text-[11px] text-white/30">{item.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderTracker() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white/80">Order & Inquiry Tracker</h3>
      <div className="text-center py-12 text-white/30">
        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-xs">No orders or inquiries yet</p>
        <p className="text-[11px] text-white/20">Orders and inquiries will appear here as they come in</p>
      </div>
    </div>
  );
}

function SiteSettings({ resetBrand }: { resetBrand: () => void }) {
  const session = getSession();
  const [settings, setSettings] = useState({
    businessName: session?.businessName || "",
    color: session?.brandColor || DEFAULT_COLOR,
    phone: session?.phone || "",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (session) {
      const updated = { ...session, ...settings };
      saveSession(updated);
      applyBrandColor(settings.color);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white/80">Site Settings</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-white/50 mb-1">Business Name</label>
          <input
            type="text"
            value={settings.businessName}
            onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
            className="w-full px-4 py-2 bg-white/[0.06] border border-white/10 rounded-xl text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Phone</label>
          <input
            type="tel"
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            className="w-full px-4 py-2 bg-white/[0.06] border border-white/10 rounded-xl text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Brand Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.color}
              onChange={(e) => setSettings({ ...settings, color: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-white/40">{settings.color}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} className="px-4 py-2 bg-brand-raised text-brand-secondary rounded-xl text-xs font-bold cursor-pointer hover:brightness-110 transition">
          {saved ? "Saved!" : "Save Settings"}
        </button>
        <button
          onClick={resetBrand}
          className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-xl text-xs font-medium cursor-pointer hover:bg-red-600/30 transition"
        >
          <RotateCcw className="w-3 h-3 inline mr-1.5" />
          Reset Demo Data
        </button>
      </div>
    </div>
  );
}

export interface BrandSession {
  businessName: string;
  contactName: string;
  phone: string;
  address: string;
  brandColor: string;
  timestamp: number;
}

const STORAGE_KEY = "brand_demo_session";
const SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours
const DEFAULT_COLOR = "#D97706";

export function getSession(): BrandSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: BrandSession = JSON.parse(raw);
    if (Date.now() - session.timestamp > SESSION_DURATION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session: BrandSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getSessionCountdown(): string | null {
  const session = getSession();
  if (!session) return null;
  const remaining = SESSION_DURATION - (Date.now() - session.timestamp);
  if (remaining <= 0) return null;
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export function getTimeRemainingMs(): number {
  const session = getSession();
  if (!session) return 0;
  return Math.max(0, SESSION_DURATION - (Date.now() - session.timestamp));
}

export function applyBrandColor(color: string): void {
  const root = document.documentElement;
  root.style.setProperty("--color-brand-raised", color);
  root.style.setProperty("--brand-color", color);
  root.style.setProperty("--brand-color-light", `${color}1a`);
  root.style.setProperty("--brand-color-hover", adjustBrightness(color, -15));
  root.style.setProperty("--ring", color);
  root.style.setProperty("--saffron", color);
}

export function resetBrandColor(): void {
  const root = document.documentElement;
  root.style.removeProperty("--color-brand-raised");
  root.style.removeProperty("--brand-color");
  root.style.removeProperty("--brand-color-light");
  root.style.removeProperty("--brand-color-hover");
  root.style.removeProperty("--ring");
  root.style.removeProperty("--saffron");
}

export function applySessionToUI(session: BrandSession): void {
  document.querySelectorAll("[data-brand-text]").forEach((el) => {
    const attr = el.getAttribute("data-brand-text");
    if (attr === "business-name" && session.businessName) {
      el.textContent = session.businessName;
    } else if (attr === "address" && session.address) {
      el.textContent = session.address;
    } else if (attr === "phone" && session.phone) {
      el.textContent = session.phone;
    } else if (attr === "contact-name" && session.contactName) {
      el.textContent = session.contactName;
    }
  });
  if (session.brandColor) {
    applyBrandColor(session.brandColor);
  }
}

export function generateDemoLink(): string {
  const session = getSession();
  if (!session) return window.location.href;
  const token = btoa(JSON.stringify(session));
  const url = new URL(window.location.href);
  url.searchParams.set("token", token);
  return url.toString();
}

export function applyFromURL(): BrandSession | null {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (!token) return null;
  try {
    const session: BrandSession = JSON.parse(atob(token));
    if (session.businessName) {
      saveSession(session);
      applySessionToUI(session);
      return session;
    }
  } catch {
    // invalid token
  }
  return null;
}

export function getAdminPin(): string {
  return localStorage.getItem("brand_admin_pin") || "1234";
}

export function setAdminPin(pin: string): void {
  localStorage.setItem("brand_admin_pin", pin);
}

function adjustBrightness(hex: string, percent: number): string {
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + percent));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  } catch {
    return hex;
  }
}

export { DEFAULT_COLOR, SESSION_DURATION, STORAGE_KEY };

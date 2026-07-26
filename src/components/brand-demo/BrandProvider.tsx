import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  BrandSession,
  getSession,
  saveSession,
  clearSession,
  applySessionToUI,
  resetBrandColor,
  applyFromURL,
  getSessionCountdown,
  getTimeRemainingMs,
  DEFAULT_COLOR,
} from "./SessionManager";

interface BrandContextType {
  session: BrandSession | null;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  countdown: string | null;
  applySession: (session: BrandSession) => void;
  resetBrand: () => void;
  skipOnboarding: () => void;
}

const BrandContext = createContext<BrandContextType>({
  session: null,
  showModal: false,
  setShowModal: () => {},
  countdown: null,
  applySession: () => {},
  resetBrand: () => {},
  skipOnboarding: () => {},
});

export function useBrand() {
  return useContext(BrandContext);
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<BrandSession | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    // Try URL token first
    const urlSession = applyFromURL();
    if (urlSession) {
      setSession(urlSession);
      setShowModal(false);
      return;
    }

    // Check existing session
    const existing = getSession();
    if (existing) {
      setSession(existing);
      applySessionToUI(existing);
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!session) return;

    const update = () => {
      const remaining = getTimeRemainingMs();
      if (remaining <= 0) {
        resetBrand();
        return;
      }
      setCountdown(getSessionCountdown());
    };

    update();
    countdownRef.current = setInterval(update, 30000);
    return () => clearInterval(countdownRef.current);
  }, [session]);

  const applySession = useCallback((newSession: BrandSession) => {
    saveSession(newSession);
    setSession(newSession);
    applySessionToUI(newSession);
    setShowModal(false);
  }, []);

  const resetBrand = useCallback(() => {
    clearSession();
    setSession(null);
    resetBrandColor();
    setShowModal(true);
    setCountdown(null);

    // Reset text elements to defaults
    document.querySelectorAll("[data-brand-text]").forEach((el) => {
      const defaultText = el.getAttribute("data-brand-default");
      if (defaultText) {
        el.textContent = defaultText;
      }
    });
  }, []);

  const skipOnboarding = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <BrandContext.Provider
      value={{ session, showModal, setShowModal, countdown, applySession, resetBrand, skipOnboarding }}
    >
      {children}
    </BrandContext.Provider>
  );
}

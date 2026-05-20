"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { dict, defaultLang, type Lang, type DictKey } from "./dict";

const STORAGE_KEY = "aet-lang";

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey) => string;
};

const I18nContext = createContext<I18nContextValue>({
  lang: defaultLang,
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "en" || stored === "zh") {
      document.documentElement.lang = stored;
      queueMicrotask(() => setLangState(stored));
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    }
  }, []);

  const t = useCallback(
    (key: DictKey) => {
      return dict[lang][key] || dict[defaultLang][key] || key;
    },
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

import { useState, useCallback, type ReactNode } from "react";

import { getKey, storeKey } from "@/services/store";

import en from "./translations/en";
import fr from "./translations/fr";

import type { TranslationsContextType, Locale, Translations } from "./types";

import TranslationsContext from "./TranslationsContext";

const translations: Translations = { fr, en } as const;

const setDocumentLanguage = (locale: Locale) => {
  document.documentElement.lang = locale;
};

export default function TranslationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(() => {
    const storedLocale = getKey("locale");

    if (storedLocale) {
      setDocumentLanguage(storedLocale);
      return storedLocale;
    }

    const userLang = navigator.language || navigator.languages[0];

    if (userLang.startsWith("fr")) {
      setDocumentLanguage("fr");
      return "fr";
    }

    setDocumentLanguage("en");
    return "en";
  });

  const translate: TranslationsContextType["translate"] = useCallback(
    (key) => {
      return translations[currentLocale][key];
    },
    [currentLocale],
  );

  const setLocale = (locale: Locale) => {
    setCurrentLocale(locale);
    setDocumentLanguage(locale);
    storeKey("locale", locale);
  };

  return (
    <TranslationsContext
      value={{ currentLocale, translate, setCurrentLocale: setLocale }}
    >
      {children}
    </TranslationsContext>
  );
}

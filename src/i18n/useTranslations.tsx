import { useContext } from "react";

import TranslationsContext from "./TranslationsContext";

export default function useTranslations() {
  const context = useContext(TranslationsContext);

  if (!context) {
    throw new Error(
      "useTranslations must be used within a TranslationsProvider",
    );
  }

  return context;
}

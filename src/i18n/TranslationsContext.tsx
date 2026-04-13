import { createContext } from "react";

import type { TranslationsContextType } from "./types";

const TranslationsContext = createContext<TranslationsContextType>({
  currentLocale: "fr",
  translate: () => "",
  setCurrentLocale: () => {},
} as TranslationsContextType);

export default TranslationsContext;

export type Locale = "fr" | "en";

export type Texts = {
  "action.play": string;
  "action.confirm": string;
  "action.cancel": string;
};

export type TranslationKey = keyof Texts;

export type Translations = Record<Locale, Texts>;

export type TranslationsContextType = {
  currentLocale: Locale;
  translate: <T extends TranslationKey>(key: T) => Texts[T];
  setCurrentLocale: (locale: Locale) => void;
};

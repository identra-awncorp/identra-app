import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { en } from './locales/en';
import { vi } from './locales/vi';

const translations = { vi, en };

export type Locale = keyof typeof translations;

type TranslationTree = typeof vi;
type Primitive = string | number | boolean | null | undefined;
type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;
type I18nDepth = 0 | 1 | 2 | 3 | 4 | 5;
type PreviousDepth = {
  0: 0;
  1: 0;
  2: 1;
  3: 2;
  4: 3;
  5: 4;
};
export type I18nKey<T = TranslationTree, Depth extends I18nDepth = 5> = Depth extends 0
  ? never
  : T extends string
    ? never
    : {
        [K in keyof T & string]: T[K] extends string ? K : `${K}${DotPrefix<I18nKey<T[K], PreviousDepth[Depth]>>}`;
      }[keyof T & string];

export type I18nParams = Record<string, Primitive>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: I18nKey, params?: I18nParams) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readTranslation(locale: Locale, key: I18nKey) {
  const parts = key.split('.');
  let current: unknown = translations[locale];

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) return key;
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : key;
}

function interpolate(value: string, params?: I18nParams) {
  if (!params) return value;

  return value.replace(/\{\{(\w+)\}\}/g, (match, name: string) => {
    const replacement = params[name];
    return replacement === undefined || replacement === null ? match : String(replacement);
  });
}

export function translate(locale: Locale, key: I18nKey, params?: I18nParams): string {
  return interpolate(readTranslation(locale, key), params);
}

export function I18nProvider({
  children,
  initialLocale = 'vi',
  locale: controlledLocale,
}: PropsWithChildren<{ initialLocale?: Locale; locale?: Locale }>) {
  const [localLocale, setLocalLocale] = useState<Locale>(initialLocale);
  const locale = controlledLocale ?? localLocale;
  const t = useCallback(
    (key: I18nKey, params?: I18nParams) => translate(locale, key, params),
    [locale],
  );
  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale: setLocalLocale, t }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}

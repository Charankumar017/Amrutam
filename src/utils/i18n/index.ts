import { NativeModules, Platform } from 'react-native';
import { en, type TranslationKey } from '@/utils/i18n/en';
import { hi } from '@/utils/i18n/hi';

export type Locale = 'en' | 'hi';

export type { TranslationKey };

const DICTIONARIES: Record<Locale, Partial<Record<TranslationKey, string>>> = {
  en,
  hi,
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  hi: 'हि',
};

export const LOCALES = Object.keys(LOCALE_LABELS) as Locale[];

export function deviceLocale(): Locale {
  try {
    const tag =
      Platform.OS === 'ios'
        ? (NativeModules.SettingsManager?.settings?.AppleLocale as string | undefined) ??
          (NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] as string | undefined)
        : (NativeModules.I18nManager?.localeIdentifier as string | undefined);
    return tag?.toLowerCase().startsWith('hi') ? 'hi' : 'en';
  } catch {
    return 'en';
  }
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const template = DICTIONARIES[locale][key] ?? en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { localeChanged, selectLocale } from '@/redux/slices/preferencesSlice';
import { translate, type Locale, type TranslationKey } from '@/utils/i18n';

export function useTranslation() {
  const locale = useAppSelector(selectLocale);
  const dispatch = useAppDispatch();
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );
  const setLocale = useCallback((next: Locale) => dispatch(localeChanged(next)), [dispatch]);
  return {
    t,
    locale,
    setLocale,
  };
}

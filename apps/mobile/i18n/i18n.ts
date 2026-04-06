import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/translation.json';
import ptBR from '../locales/pt-BR/translation.json';

const LANGUAGE_KEY = 'language';

function deviceLanguage(): 'pt-BR' | 'en' {
  const tag = Localization.getLocales()[0]?.languageTag ?? 'pt-BR';
  const lower = tag.toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('en')) return 'en';
  return 'pt-BR';
}

const languageDetector = {
  type: 'languageDetector' as const,
  async: true as const,
  init: () => undefined,
  detect: async (callback: (lng: string) => void) => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (stored === 'pt-BR' || stored === 'en') {
        callback(stored);
        return;
      }
    } catch {
      /* ignore */
    }
    callback(deviceLanguage());
  },
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lng);
    } catch {
      /* ignore */
    }
  },
};

/* eslint-disable import/no-named-as-default-member -- i18next instance .use() chain, not the `use` export */
void i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      en: { translation: en },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18next;

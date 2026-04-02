import { useContext } from 'react'
import { I18nContext } from './i18n-context'
import type { I18nContextValue } from './i18n-context'

export const isBrowser = typeof window !== 'undefined'

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!isBrowser) {
    return {
      currentCountry: 'BR',
      changeLanguage: () => {},
    }
  }
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}

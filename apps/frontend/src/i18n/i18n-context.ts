import { createContext } from 'react'
import type { CountryCode } from './language-maps'

export interface I18nContextValue {
  currentCountry: CountryCode
  changeLanguage: (country: CountryCode) => void
}

export const I18nContext = createContext<I18nContextValue | null>(null)

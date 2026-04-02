import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { I18nContext } from './i18n-context'
import type { CountryCode } from './language-maps'
import { localeFromCountry, localeFromI18nLanguage } from './language-maps'

export function I18nProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [currentCountry, setCurrentCountry] = useState<CountryCode>(() =>
    localeFromI18nLanguage(i18n.language),
  )

  const changeLanguage = useCallback(
    (country: CountryCode) => {
      const lng = localeFromCountry(country)
      setCurrentCountry(country)
      void i18n.changeLanguage(lng)
    },
    [i18n],
  )

  useEffect(() => {
    const onLanguageChanged = (lng: string) => {
      setCurrentCountry(localeFromI18nLanguage(lng))
    }
    i18n.on('languageChanged', onLanguageChanged)
    return () => {
      i18n.off('languageChanged', onLanguageChanged)
    }
  }, [i18n])

  const value = useMemo(
    () => ({ currentCountry, changeLanguage }),
    [currentCountry, changeLanguage],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

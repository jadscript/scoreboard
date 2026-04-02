export type CountryCode = 'BR' | 'US'

export type AppLocale = 'pt-BR' | 'en'

export const countryToLocale: Record<CountryCode, AppLocale> = {
  BR: 'pt-BR',
  US: 'en',
}

export const localeToCountry: Record<AppLocale, CountryCode> = {
  'pt-BR': 'BR',
  en: 'US',
}

export function localeFromI18nLanguage(language: string): CountryCode {
  if (language.startsWith('pt')) {
    return 'BR'
  }
  return 'US'
}

export function localeFromCountry(country: CountryCode): AppLocale {
  return countryToLocale[country]
}

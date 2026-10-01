import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../translations/translations'
import { enPhrases } from '../translations/enPhrases'

const englishCopy = { ...enPhrases }
function addKeyedCopy(french, english) {
  for (const [key, value] of Object.entries(french)) {
    if (typeof value === 'string' && typeof english?.[key] === 'string') {
      englishCopy[value.trim()] ??= english[key].trim()
    } else if (value && typeof value === 'object') addKeyedCopy(value, english?.[key])
  }
}
addKeyedCopy(translations.fr, translations.en)

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('app_lang')
    return ['fr', 'ar', 'en'].includes(saved) ? saved : 'fr'
  })

  // Synchronize document dir (RTL/LTR) & lang attribute whenever language changes
  useEffect(() => {
    const isRtl = lang === 'ar'
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    localStorage.setItem('app_lang', lang)

    if (isRtl) {
      document.body.classList.add('rtl-mode')
    } else {
      document.body.classList.remove('rtl-mode')
    }
  }, [lang])

  const setLanguage = (newLang) => {
    if (['fr', 'ar', 'en'].includes(newLang)) {
      setLang(newLang)
    }
  }

  const text = (value) => {
    if (lang !== 'en' || typeof value !== 'string') return value
    const translated = englishCopy[value.trim()]
    return translated === undefined ? value : value.replace(value.trim(), translated)
  }

  // Translation lookup helper t('nav.accueil', 'Accueil')
  const t = (path, fallback = '') => {
    if (!path) return fallback
    const parts = path.split('.')
    let current = translations[lang]
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part]
      } else {
        // Fallback to French if key missing in Arabic
        let frFallback = translations.fr
        for (const fPart of parts) {
          if (frFallback && frFallback[fPart] !== undefined) {
            frFallback = frFallback[fPart]
          } else {
            return text(fallback || path)
          }
        }
        return text(typeof frFallback === 'string' ? frFallback : fallback || path)
      }
    }
    return typeof current === 'string' ? current : fallback || path
  }

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t, text, locale: { fr: 'fr-FR', ar: 'ar-TN', en: 'en-GB' }[lang], isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export function useText() {
  return useLanguage().text
}

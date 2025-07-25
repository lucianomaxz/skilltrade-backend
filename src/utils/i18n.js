import es from '../locales/es.js'
import en from '../locales/en.js'

const langs = { es, en }

export const t = (key, lang = 'es') => {
  const traducciones = langs[lang] || langs['es']
  return traducciones[key] || key
}

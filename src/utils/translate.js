import { messages } from './messages.js'

export const translate = (key, lang = 'es') => {
  return messages[key]?.[lang] || key
}

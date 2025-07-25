export const detectarIdioma = (req, res, next) => {
  const lang = req.headers['accept-language']?.split(',')[0] || 'es'
  req.lang = lang.toLowerCase().startsWith('en') ? 'en' : 'es'
  next()
}

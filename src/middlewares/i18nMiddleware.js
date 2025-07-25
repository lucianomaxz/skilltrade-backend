export const i18n = (req, res, next) => {
  const lang = req.headers['accept-language']
  req.lang = ['en', 'es'].includes(lang) ? lang : 'es'
  next()
}

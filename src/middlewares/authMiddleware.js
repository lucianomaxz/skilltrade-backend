import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protegerRuta = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      console.error('❌ Token inválido:', error)
      return res.status(401).json({ msg: 'Token inválido' })
    }
  }

  if (!token) {
    return res.status(401).json({ msg: 'No hay token, acceso denegado' })
  }
}

export default protegerRuta

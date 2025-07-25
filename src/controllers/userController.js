import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { sendEmail } from '../utils/emailService.js'
import { t } from '../utils/i18n.js'
import { translate } from '../utils/translate.js'


export const updateProfile = async (req, res) => {
  const usuario = await User.findById(req.usuario._id)

  if (!usuario) {
    return res.status(404).json({ msg: t('userNotFound', req.lang) })
  }

  const { nombre, email, password, descripcion } = req.body

  if (nombre) usuario.nombre = nombre
  if (email) usuario.email = email
  if (descripcion) usuario.descripcion = descripcion
  if (password) {
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
  }

  try {
    const usuarioActualizado = await usuario.save()
    res.json({
      msg: translate('PROFILE_UPDATED', req.lang),
      usuario: {
        id: usuarioActualizado._id,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        descripcion: usuarioActualizado.descripcion
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: 'Error al actualizar el perfil' })
  }
}

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}
export const getProfile = (req, res) => {
  res.json(req.usuario)
}

export const registerUser = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHasheado = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = new User({
      nombre,
      email,
      password: passwordHasheado
    });

    await nuevoUsuario.save();

    try {
    await sendEmail({
      to: ratedUser.email,
      subject: 'You received a new rating!',
      text: `Hi ${ratedUser.nombre}, someone rated you on SkillTrade.`,
      html: `<p>Hi <strong>${ratedUser.nombre}</strong>,</p>
            <p>You received a new rating. Go check it out!</p>`
    })} catch (err) {
      console.error('❌ Error enviando email:', err)
    }
    res.status(201).json({
      msg: translate('REGISTER_SUCCESS', req.lang)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al registrar usuario' });
  }
}
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ msg: t('userNotFound', req.lang) })
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ msg: 'Contraseña incorrecta' });
    }

    res.status(200).json({
        msg: translate('LOGIN_SUCCESS', req.lang),
        usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        token: generarToken(usuario._id)
  }
})
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al iniciar sesión' });
  }
};

export const addFavorite = async (req, res) => {
  const userId = req.user.id
  const productId = req.params.productId

  try {
    const user = await User.findById(userId)

    if (!user.favoritos.includes(productId)) {
      user.favoritos.push(productId)
      await user.save()
    }

    res.status(200).json({ msg: 'Producto agregado a favoritos' })
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar a favoritos' })
  }
}
export const removeFavorite = async (req, res) => {
  const userId = req.user.id
  const productId = req.params.productId

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { favoritos: productId }
    })

    res.status(200).json({ msg: 'Producto eliminado de favoritos' })
  } catch (err) {
    res.status(500).json({ error: 'Error al quitar de favoritos' })
  }
}
export const getFavorites = async (req, res) => {
  const userId = req.user.id

  try {
    const user = await User.findById(userId).populate('favoritos')

    res.status(200).json(user.favoritos)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener favoritos' })
  }
}
export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user._id
    const { productId } = req.params

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ msg: t('userNotFound', req.lang) })

    const index = user.favoritos.indexOf(productId)

    if (index !== -1) {
      // Ya está → eliminar
      user.favoritos.splice(index, 1)
    } else {
      // No está → agregar
      user.favoritos.push(productId)
    }

    await user.save()
    res.json({ msg: 'Favoritos actualizados', favoritos: user.favoritos })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Error al actualizar favoritos', err })
  }
}


export const getMyFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favoritos',
      populate: [
        { path: 'user', select: 'nombre email' },
        { path: 'category', select: 'name' }
      ]
    })

    if (!user) return res.status(404).json({ msg: t('userNotFound', req.lang) })

    res.json(user.favoritos)
  } catch (err) {
    console.error('❌ Error al obtener favoritos:', err)
    res.status(500).json({ msg: 'Error al obtener favoritos', err })
  }
}


export const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ msg: 'Email no registrado' })
    }

    // Generar token y vencimiento
    const token = crypto.randomBytes(32).toString('hex')
    const expires = Date.now() + 1000 * 60 * 15 // 15 minutos

    user.resetPasswordToken = token
    user.resetPasswordExpires = expires
    await user.save()

    const resetLink = `http://localhost:3000/reset-password/${token}`

    try {
    await sendEmail({
      to: user.email,
      subject: 'SkillTrade – Recuperá tu contraseña',
      text: `Para recuperar tu contraseña, usá el siguiente link: ${resetLink}`,
      html: `
        <p>Hola <strong>${user.nombre}</strong>,</p>
        <p>Hacé click en el siguiente enlace para recuperar tu contraseña:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Este enlace expirará en 15 minutos.</p>
      `
    })} catch (err){
        console.error('❌ Error enviando email:', err)
    }

    res.json({ msg: translate('EMAIL_SENT', req.lang) })
  } catch (error) {
    console.error('❌ Error en forgotPassword:', error)
    res.status(500).json({ msg: 'Error interno' })
  }
}
export const resetPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ msg: 'Token inválido o expirado' })
    }

    // Actualizar contraseña
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)

    // Limpiar token
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined

    await user.save()

    res.json({ msg: translate('PASSWORD_UPDATED', req.lang) })
  } catch (error) {
    console.error('❌ Error en resetPassword:', error)
    res.status(500).json({ msg: 'Error interno' })
  }
}

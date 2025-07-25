/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

import express from 'express'
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  toggleFavorite,
  getMyFavorites,
  forgotPassword,
  resetPassword
} from '../controllers/userController.js'

import auth from '../middlewares/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: El correo ya está registrado
 */
router.post('/register', registerUser)

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Contraseña incorrecta
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/login', loginUser)

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtener perfil de usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado
 *   put:
 *     summary: Actualizar perfil de usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/profile', auth, getProfile)
router.put('/profile', auth, updateProfile)

/**
 * @swagger
 * /api/users/perfil:
 *   get:
 *     summary: Ruta protegida de prueba
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario autenticado
 */
router.get('/perfil', auth, (req, res) => {
  res.json({
    msg: 'Ruta protegida',
    usuario: req.usuario
  })
})

/**
 * @swagger
 * /api/users/favoritos/{productId}:
 *   post:
 *     summary: Agregar o quitar un producto de favoritos (toggle)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Favoritos actualizados
 */
router.post('/favoritos/:productId', auth, toggleFavorite)

/**
 * @swagger
 * /api/users/favoritos:
 *   get:
 *     summary: Obtener todos los productos favoritos del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos favoritos
 */
router.get('/favoritos', auth, getMyFavorites)

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Enviar email para recuperación de contraseña
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Enlace de recuperación enviado al correo
 *       404:
 *         description: Email no registrado
 */
router.post('/forgot-password', forgotPassword)

/**
 * @swagger
 * /api/users/reset-password/{token}:
 *   post:
 *     summary: Restaurar contraseña con token
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token enviado al correo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/reset-password/:token', resetPassword)

export default router

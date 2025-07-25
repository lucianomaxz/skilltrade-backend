/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email sending and testing endpoints
 */

import { Router } from 'express'
import { sendEmail } from '../utils/emailService.js'
import auth from '../middlewares/authMiddleware.js'

const router = Router()

/**
 * @swagger
 * /api/email/test:
 *   post:
 *     summary: Enviar un email de prueba
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - nombre
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email enviado correctamente
 *       500:
 *         description: Error al enviar el email
 */
router.post('/test', auth, async (req, res) => {
  try {
    const { email, nombre } = req.body

    await sendEmail({
      to: email,
      subject: 'Email de prueba desde SkillTrade',
      text: `Hola ${nombre}, este es un email de prueba.`,
      html: `<p><strong>Hola ${nombre}</strong>, este es un <i>email de prueba</i> desde SkillTrade.</p>`
    })

    res.json({ msg: 'Email enviado correctamente' })
  } catch (err) {
    console.error('❌ Error en /email/test:', err)
    res.status(500).json({ msg: 'Error al enviar email', err })
  }
})

export default router

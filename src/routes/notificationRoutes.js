/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management endpoints
 */

import { Router } from 'express'
import { getMyNotifications, markAsRead } from '../controllers/notificationController.js'
import auth from '../middlewares/authMiddleware.js'

const router = Router()

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener las notificaciones del usuario autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 */
router.get('/', auth, getMyNotifications)

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 */
router.patch('/:id/read', auth, markAsRead)

export default router

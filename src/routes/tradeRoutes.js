/**
 * @swagger
 * tags:
 *   name: Trades
 *   description: Trade management endpoints
 */

import express from 'express'
import auth from '../middlewares/authMiddleware.js'
import {
  createTrade,
  respondTrade,
  completeTrade,
  addMessage,
  getMyTrades
} from '../controllers/tradeController.js'

const router = express.Router()

/**
 * @swagger
 * /api/trades:
 *   post:
 *     summary: Proponer un nuevo trueque
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offeredProduct
 *               - requestedProduct
 *             properties:
 *               offeredProduct:
 *                 type: string
 *               requestedProduct:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trueque propuesto exitosamente
 */
router.post('/', auth, createTrade)

/**
 * @swagger
 * /api/trades/{id}/respond:
 *   post:
 *     summary: Aceptar o rechazar un trueque
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *     responses:
 *       200:
 *         description: Trueque aceptado o rechazado
 */
router.post('/:id/respond', auth, respondTrade)

/**
 * @swagger
 * /api/trades/{id}/complete:
 *   post:
 *     summary: Marcar un trueque como completado
 *     tags: [Trades]
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
 *         description: Trueque completado exitosamente
 */
router.post('/:id/complete', auth, completeTrade)

/**
 * @swagger
 * /api/trades/{id}/message:
 *   post:
 *     summary: Agregar mensaje al mini-chat de un trueque
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mensaje agregado exitosamente
 */
router.post('/:id/message', auth, addMessage)

/**
 * @swagger
 * /api/trades/mine:
 *   get:
 *     summary: Obtener los trueques del usuario autenticado
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trueques del usuario
 */
router.get('/mine', auth, getMyTrades)

export default router

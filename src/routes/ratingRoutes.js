/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Rating management endpoints
 */

import express from 'express'
import {
  createRating,
  getUserRatings,
  getAvgRating
} from '../controllers/ratingController.js'
import auth from '../middlewares/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Crear una nueva calificación
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ratedUser
 *               - trade
 *               - score
 *             properties:
 *               ratedUser:
 *                 type: string
 *               trade:
 *                 type: string
 *               score:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Calificación creada exitosamente
 */
router.post('/', auth, createRating)

/**
 * @swagger
 * /api/ratings/{userId}:
 *   get:
 *     summary: Obtener todas las calificaciones de un usuario
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de calificaciones del usuario
 */
router.get('/:userId', getUserRatings)

/**
 * @swagger
 * /api/ratings/{userId}/avg:
 *   get:
 *     summary: Obtener el promedio de calificación de un usuario
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promedio de calificaciones del usuario
 */
router.get('/:userId/avg', getAvgRating)

export default router

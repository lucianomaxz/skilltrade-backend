// ───────────────────────────────────────────────────────────────
// 🔹 Core & Setup
// ───────────────────────────────────────────────────────────────
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import http from 'http'
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import { Server as IOServer } from 'socket.io'

// ───────────────────────────────────────────────────────────────
// 🔹 Database
// ───────────────────────────────────────────────────────────────
import connectDB from './config/db.js'

// ───────────────────────────────────────────────────────────────
// 🔹 Swagger
// ───────────────────────────────────────────────────────────────
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swagger.js'

// ───────────────────────────────────────────────────────────────
// 🔹 Middlewares
// ───────────────────────────────────────────────────────────────
import auth from './middlewares/authMiddleware.js'
import { i18n } from './middlewares/i18nMiddleware.js'
import { detectarIdioma } from './middlewares/langMiddleware.js'

// ───────────────────────────────────────────────────────────────
// 🔹 Main Routes
// ───────────────────────────────────────────────────────────────
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import tradeRoutes from './routes/tradeRoutes.js'
import ratingRoutes from './routes/ratingRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import emailRoutes from './routes/emailRoutes.js'

// ───────────────────────────────────────────────────────────────
// 🔹 Controllers used directly in routes
// ───────────────────────────────────────────────────────────────
import { getFilteredProducts } from './controllers/productController.js'
import {
  addFavorite,
  removeFavorite,
  getFavorites
} from './controllers/userController.js'
import {
  getTradeDetail,
  getMyTrades
} from './controllers/tradeController.js'
import {
  getReceivedRatings,
  getSentRatings
} from './controllers/ratingController.js'

// ───────────────────────────────────────────────────────────────
// 🔹 Sockets
// ───────────────────────────────────────────────────────────────
import initChat from './sockets/chat.js'

// ───────────────────────────────────────────────────────────────
// 🔸 Express App Init
// ───────────────────────────────────────────────────────────────
dotenv.config()
const app = express()

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ───────────────────────────────────────────────────────────────
// 🔸 Middlewares
// ───────────────────────────────────────────────────────────────
app.use(i18n)
app.use(cors())
app.use(express.json())
app.use(detectarIdioma)

// ───────────────────────────────────────────────────────────────
// 🔸 API Routes
// ───────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/trades', tradeRoutes)
app.use('/api/ratings', ratingRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/notifications', notificationRoutes)

// 🔸 Custom endpoints
app.get('/myTrades', auth, getMyTrades)
app.get('/trade/:id', auth, getTradeDetail)
app.get('/products', getFilteredProducts)

app.post('/favorites/:productId', auth, addFavorite)
app.delete('/favorites/:productId', auth, removeFavorite)
app.get('/favorites', auth, getFavorites)

app.get('/ratings/received', auth, getReceivedRatings)
app.get('/ratings/sent', auth, getSentRatings)

// ───────────────────────────────────────────────────────────────
// 🔸 Static Files (Uploads)
// ───────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// ───────────────────────────────────────────────────────────────
// 🔸 Test Route
// ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('SkillTrade API is running')
})

// ───────────────────────────────────────────────────────────────
// 🔸 Server & WebSockets
// ───────────────────────────────────────────────────────────────
const server = http.createServer(app)
const io = new IOServer(server, {
  cors: { origin: '*' }
})

// Middleware para autenticar sockets (con JWT)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('No token, access denied'))

  try {
    const jwtString = token.startsWith('Bearer ')
      ? token.split(' ')[1]
      : token

    const { id: userId } = jwt.verify(jwtString, process.env.JWT_SECRET)
    socket.userId = userId
    next()
  } catch (err) {
    next(new Error('Invalid token'))
  }
})

// Conexión de sockets
io.on('connection', (socket) => {
  const token = socket.handshake.auth?.token?.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    socket.join(decoded.id) // Cada usuario entra a su propia sala
  } catch (e) {
    console.warn('Invalid token on socket connection')
  }
})

// Inicializar chat
initChat(io)

// ───────────────────────────────────────────────────────────────
// 🔸 Start Server
// ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5050
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  })
})

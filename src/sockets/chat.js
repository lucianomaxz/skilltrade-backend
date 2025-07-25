import mongoose from 'mongoose'
import Trade from '../models/Trade.js'

export default function initChat(io) {
  io.on('connection', (socket) => {
    const token = socket.handshake.auth?.token?.split(' ')[1]
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      socket.join(decoded.id) // 🟩 esto permite recibir notifyMessage
    } catch (e) {
      console.warn('❌ Token inválido en conexión de socket')
    }
    socket.on('joinTrade', async (tradeId) => {
      try {
        socket.join(tradeId)

        const trade = await Trade.findById(tradeId)
          .populate('messages.sender', 'nombre')

        if (!trade) return

        console.log('📦 Mensajes con populate:', trade.messages)

        socket.emit('chatHistory', trade.messages)
      } catch (err) {
        console.error('❌ Error al unirse al trade:', err)
      }
    })

socket.on('sendMessage', async ({ tradeId, text }) => {
  try {
    const trade = await Trade.findById(tradeId)
    if (!trade) return

    const senderId = new mongoose.Types.ObjectId(socket.userId)

    const message = {
      sender: senderId,
      text,
      timestamp: new Date()
    }

    trade.messages.push(message)
    await trade.save()

    // 🔁 Emitir al room
    io.to(tradeId).emit('newMessage', message)

    // 👥 Identificar destinatario para notificar (el que NO es el sender)
    const recipientId = trade.requester.equals(senderId)
      ? trade.requestedTo
      : trade.requester

    // 📢 Emitir notificación personalizada
    io.to(recipientId.toString()).emit('notifyMessage', {
      tradeId,
      text,
      from: socket.userId
    })
    console.log(`📢 Notificación enviada a ${recipientId}: ${text}`)
  } catch (err) {
    console.error('❌ Error sendMessage:', err)
  }
})


    socket.on('disconnect', () => {
      console.log(`🔴 Cliente desconectado: ${socket.id}`)
    })
  })
}

// testClient.js
import { io }       from 'socket.io-client'
import readline     from 'readline'

// 1. Conectate al servidor
const socket = io('http://localhost:5050', {
  transports: ['websocket'],
  auth: { token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NjZmYzg4OWRlZTE2NWI5YmZhNWQwNyIsImlhdCI6MTc1MjI3MzM2NSwiZXhwIjoxNzU0ODY1MzY1fQ.815E82UzLZPfhKN4DsOndPUsERwRsYfLrSFmsIoAo1U' }
})

socket.on('connect', () => {
  console.log('🔌 Conectado como', socket.id)

  // 2. Unite a la misma sala de TRUEQUE (usa tu ID real)
  const tradeId = '68703ee13a5a30810e7b6bee'
  socket.emit('joinTrade', tradeId)
  console.log(`🛋 Uniéndome a la sala trade:${tradeId}`)

  // 3. Escucha nuevos mensajes
  socket.on('newMessage', (msg) => {
    console.log('💬 Mensaje recibido:', msg)
  })

socket.on('chatHistory', (messages) => {
  console.log('📜 Historial de mensajes previos:')
  for (const msg of messages) {
    const nombre = msg.sender?.nombre || 'Usuario'
    const fecha = new Date(msg.timestamp).toLocaleString()
    console.log(`🕒 ${fecha} - ${nombre}: ${msg.text}`)
  }
})


  // 4. Prepara stdin para leer líneas
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  })

  rl.prompt()
  rl.on('line', (line) => {
    const text = line.trim()
    if (!text) return rl.prompt()

    // 5. Emití cada línea como sendMessage
      socket.emit('sendMessage', {
        tradeId,
        senderId: '6866fc889dee165b9bfa5d07', // tu ObjectId real
        text
      })

    rl.prompt()
  })
})
socket.on('notifyMessage', ({ tradeId, text, from }) => {
  console.log(`📢 NOTIFICACIÓN: mensaje nuevo en trade ${tradeId} de ${from}: ${text}`)
})
socket.on('disconnect', () => console.log('❌ Desconectado'))

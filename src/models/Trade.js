import mongoose from 'mongoose'

const tradeSchema = new mongoose.Schema(
  {
    // Producto que inicia el trueque
    offeredProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    // Producto que se pide a cambio
    requestedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    // Usuario que inicia la propuesta
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Usuario dueño del producto solicitado
    requestedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'rejected', 'completed'],
      default: 'requested'
    },
    // Mini-chat: array de mensajes {sender, text, timestamp}
    messages: [
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // ✅ esto es CLAVE
    },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }
]


  },
  { timestamps: true }
)

const Trade = mongoose.model('Trade', tradeSchema)
export default Trade

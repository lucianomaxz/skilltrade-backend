import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // elimina espacios al principio y final
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  price: {
    type: Number,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true // cada producto debe tener una categoría
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // cada producto pertenece a un usuario
  },
  image: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  },
    status: {
    type: String,
    enum: ['disponible', 'en_trueque', 'intercambiado'],
    default: 'disponible'
  },
}, {
  timestamps: true // crea automáticamente createdAt y updatedAt
})

const Product = mongoose.model('Product', productSchema)
export default Product

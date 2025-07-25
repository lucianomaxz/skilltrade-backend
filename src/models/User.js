import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  fotoPerfil: {
    type: String,
    default: ''
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  calificaciones: [
    {
      puntuacion: Number,
      comentario: String,
      usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  ],
  favoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  desactivado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;

import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema({
  rater: {            // quien califica
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratedUser: {        // quien recibe la calificación
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trade: {            // opcional: relacionarlo con un trueque
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade'
  },
  score: {            // puntaje 1–5
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true })

export default mongoose.model('Rating', ratingSchema)

import Rating from '../models/Rating.js'
import User   from '../models/User.js'
import { translate } from '../utils/translate.js'

export const createRating = async (req, res) => {
  const { ratedUser, trade, score, comment } = req.body
  const rater = req.user._id

  try {
    const exists = await Rating.findOne({ rater, ratedUser, trade })
    if (exists) return res.status(400).json({ msg: translate('ALREADY_RATED', req.lang) })

    const rating = new Rating({ rater, ratedUser, trade, score, comment })
    await rating.save()

    const stats = await Rating.aggregate([
      { $match: { ratedUser: rating.ratedUser } },
      { $group: { _id: '$ratedUser', avgScore: { $avg: '$score' }, count: { $sum: 1 } } }
    ])

    if (stats.length) {
      await User.findByIdAndUpdate(ratedUser, {
        avgRating: stats[0].avgScore,
        ratingsCount: stats[0].count
      })
    }

    res.status(201).json({ msg: translate('RATING_CREATED', req.lang), rating })
  } catch (error) {
    res.status(500).json({ msg: translate('RATING_CREATE_ERROR', req.lang), error })
  }
}

export const getUserRatings = async (req, res) => {
  const { userId } = req.params
  try {
    const ratings = await Rating.find({ ratedUser: userId })
      .populate('rater', 'nombre email')
      .sort('-createdAt')
    res.json(ratings)
  } catch (error) {
    res.status(500).json({ msg: translate('RATING_GET_ERROR', req.lang) })
  }
}

export const getAvgRating = async (req, res) => {
  const { userId } = req.params
  try {
    const stats = await Rating.aggregate([
      { $match: { ratedUser: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ])
    res.json({ avg: stats[0]?.avg || 0 })
  } catch (error) {
    res.status(500).json({ msg: translate('RATING_AVG_ERROR', req.lang) })
  }
}

export const getReceivedRatings = async (req, res) => {
  try {
    const userId = req.user.id
    const ratings = await Rating.find({ to: userId })
      .populate('from', 'nombre')
      .sort({ createdAt: -1 })

    const promedio = ratings.length > 0 ?
      ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length : 0

    res.json({ promedio, cantidad: ratings.length, ratings })
  } catch (err) {
    res.status(500).json({ error: translate('RATING_RECEIVED_ERROR', req.lang) })
  }
}

export const getSentRatings = async (req, res) => {
  try {
    const userId = req.user.id
    const ratings = await Rating.find({ from: userId })
      .populate('to', 'nombre')
      .sort({ createdAt: -1 })

    res.json({ cantidad: ratings.length, ratings })
  } catch (err) {
    res.status(500).json({ error: translate('RATING_SENT_ERROR', req.lang) })
  }
}

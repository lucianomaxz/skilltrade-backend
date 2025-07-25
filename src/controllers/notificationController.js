import Notification from '../models/notification.js'
import mongoose from 'mongoose'
import { translate } from '../utils/translate.js'

export const getMyNotifications = async (req, res) => {
  try {
    const notifs = await Notification.find({
      user: new mongoose.Types.ObjectId(req.user._id)
    }).sort({ createdAt: -1 })
    res.status(200).json(notifs)
  } catch (err) {
    res.status(500).json({ msg: translate('NOTIF_FETCH_ERROR', req.lang), error: err.message })
  }
}

export const markAsRead = async (req, res) => {
  const { id } = req.params
  const notif = await Notification.findOne({ _id: id, user: req.user._id })
  if (!notif) return res.status(404).json({ msg: translate('NOTIF_NOT_FOUND', req.lang) })
  notif.read = true
  await notif.save()
  res.json({ msg: translate('NOTIF_MARKED_READ', req.lang) })
}

export const createNotification = async ({ userId, type, message, link = '' }) => {
  try {
    const notif = new Notification({ user: userId, type, message, link })
    await notif.save()
    return notif
  } catch (err) {
    console.error('❌ Error creando notificación:', err)
  }
}
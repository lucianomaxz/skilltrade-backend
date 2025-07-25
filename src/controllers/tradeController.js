import Trade from '../models/Trade.js'
import Product from '../models/Product.js'
import { createNotification } from './notificationController.js'
import { sendEmail } from '../utils/emailService.js'
import User from '../models/User.js'
import { translate } from '../utils/translate.js'

export const createTrade = async (req, res) => {
  try {
    const { offeredProduct, requestedProduct } = req.body
    const requester = req.user._id

    const prodA = await Product.findById(offeredProduct)
    const prodB = await Product.findById(requestedProduct)
    if (!prodA || !prodB)
      return res.status(404).json({ msg: translate('PRODUCT_NOT_FOUND', req.lang) })

    if (prodA.user.toString() !== requester.toString())
      return res.status(403).json({ msg: translate('NOT_OWNER', req.lang) })

    const trade = new Trade({
      offeredProduct,
      requestedProduct,
      requester,
      requestedTo: prodB.user
    })

    await trade.save()

    await createNotification({
      userId: prodB.user,
      type: 'trade',
      message: translate('NEW_TRADE_NOTIFICATION', req.lang),
      link: `/trades/${trade._id}`
    })

    const receptor = await User.findById(prodB.user)

    await sendEmail({
      to: receptor.email,
      subject: 'You received a new trade proposal!',
      text: `Hello ${receptor.nombre}, you received a new trade proposal on SkillTrade.`,
      html: `
        <p>Hello <strong>${receptor.nombre}</strong>,</p>
        <p>You received a new trade proposal on <strong>SkillTrade</strong>.</p>
        <p>
          <a href="http://localhost:3000/trades/${trade._id}" target="_blank">
            View trade details
          </a>
        </p>
      `
    })

    res.status(201).json({ msg: translate('TRADE_CREATED', req.lang), trade })
  } catch (error) {
    console.error('❌ Error en createTrade:', error)
    res.status(500).json({ msg: translate('TRADE_CREATE_ERROR', req.lang), error })
  }
}

/* 2. Aceptar / Rechazar ------------------------------------------ */
export const respondTrade = async (req, res) => {
  const { id } = req.params
  const { action } = req.body
  const userId = req.usuario._id

  try {
    const trade = await Trade.findById(id)
    if (!trade) return res.status(404).json({ msg: translate('TRADE_NOT_FOUND', req.lang) })

    if (trade.requestedTo.toString() !== userId.toString())
      return res.status(403).json({ msg: translate('NOT_AUTHORIZED', req.lang) })

    if (action === 'accept') trade.status = 'accepted'
    if (action === 'reject') trade.status = 'rejected'

    await trade.save()

    const requester = await User.findById(trade.requester)

    await sendEmail({
      to: requester.email,
      subject: 'Your trade was responded',
      text: `Hi ${requester.nombre}, your trade was ${action}ed on SkillTrade.`,
      html: `<p>Hi <strong>${requester.nombre}</strong>,</p>
             <p>Your trade was <strong>${action}ed</strong>. Visit the site for more info.</p>`
    })

    res.json({ msg: translate(`TRADE_${action.toUpperCase()}`, req.lang), trade })
  } catch (error) {
    res.status(500).json({ msg: translate('TRADE_RESPOND_ERROR', req.lang), error })
  }
}

/* 3. Completar trueque ------------------------------------------- */
export const completeTrade = async (req, res) => {
  const { id } = req.params
  const userId = req.usuario._id

  try {
    const trade = await Trade.findById(id)
    if (!trade || trade.status !== 'accepted')
      return res.status(400).json({ msg: translate('TRADE_NOT_COMPLETABLE', req.lang) })

    if (
      trade.requester.toString() !== userId.toString() &&
      trade.requestedTo.toString() !== userId.toString()
    )
      return res.status(403).json({ msg: translate('NOT_AUTHORIZED', req.lang) })

    trade.status = 'completed'
    await trade.save()

    const usuario1 = await User.findById(trade.requester)
    const usuario2 = await User.findById(trade.requestedTo)

    for (const u of [usuario1, usuario2]) {
      await sendEmail({
        to: u.email,
        subject: 'Trade completed!',
        text: `Hi ${u.nombre}, your trade has been marked as completed.`,
        html: `<p>Hi <strong>${u.nombre}</strong>,</p>
              <p>Your trade was successfully completed. You can now rate your partner.</p>`
      })
    }

    res.json({ msg: translate('TRADE_COMPLETED', req.lang), trade })
  } catch (error) {
    res.status(500).json({ msg: translate('TRADE_COMPLETE_ERROR', req.lang), error })
  }
}

/* 4. Agregar mensaje al mini-chat -------------------------------- */
export const addMessage = async (req, res) => {
  const { id } = req.params
  const { text } = req.body
  const sender = req.usuario._id

  try {
    const trade = await Trade.findById(id)
    if (!trade) return res.status(404).json({ msg: translate('TRADE_NOT_FOUND', req.lang) })

    if (
      sender.toString() !== trade.requester.toString() &&
      sender.toString() !== trade.requestedTo.toString()
    )
      return res.status(403).json({ msg: translate('NOT_AUTHORIZED', req.lang) })

    trade.messages.push({ sender, text })
    await trade.save()
    res.json({ msg: translate('MESSAGE_ADDED', req.lang), trade })
  } catch (error) {
    res.status(500).json({ msg: translate('MESSAGE_ADD_ERROR', req.lang), error })
  }
}

/* 5. Obtener mis trueques --------------------------------------- */
export const getMyTrades = async (req, res) => {
  try {
    const userId = req.user.id

    const trades = await Trade.find({
      $or: [
        { requester: userId },
        { requestedTo: userId }
      ]
    })
      .populate('offeredProduct', 'titulo')
      .populate('requestedProduct', 'titulo')
      .populate('requester', 'nombre')
      .populate('requestedTo', 'nombre')
      .sort({ updatedAt: -1 })

    res.json(trades)
  } catch (err) {
    console.error('❌ Error al obtener mis trueques:', err)
    res.status(500).json({ error: translate('INTERNAL_SERVER_ERROR', req.lang) })
  }
}

export const getTradeDetail = async (req, res) => {
  try {
    const tradeId = req.params.id

    const trade = await Trade.findById(tradeId)
      .populate('offeredProduct', 'titulo descripcion imagen')
      .populate('requestedProduct', 'titulo descripcion imagen')
      .populate('requester', 'nombre')
      .populate('requestedTo', 'nombre')
      .populate('messages.sender', 'nombre')

    if (!trade) {
      return res.status(404).json({ msg: translate('TRADE_NOT_FOUND', req.lang) })
    }

    res.json(trade)
  } catch (error) {
    console.error('❌ Error al obtener detalle de trueque:', error)
    res.status(500).json({ msg: translate('INTERNAL_SERVER_ERROR', req.lang) })
  }
}

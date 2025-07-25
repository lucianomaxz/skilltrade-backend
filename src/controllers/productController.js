import Product from '../models/Product.js'
import Category from '../models/Category.js'
import { translate } from '../utils/translate.js'

// Crear un nuevo producto
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body
    const user = req.user._id

    if (!name || !category) {
      return res.status(400).json({ msg: translate('NAME_AND_CATEGORY_REQUIRED', req.lang) })
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      user,
      image
    })

    await product.save()
    res.status(201).json({ msg: translate('PRODUCT_CREATED', req.lang), product })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: translate('INTERNAL_ERROR', req.lang), error })
  }
}

// Obtener todos los productos
export const getProducts = async (req, res) => {
  try {
    const filter = {}

    if (req.query.category) {
      const categoryParam = req.query.category

      if (/^[0-9a-fA-F]{24}$/.test(categoryParam)) {
        filter.category = categoryParam
      } else {
        const foundCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${categoryParam}$`, 'i') }
        })

        if (foundCategory) {
          filter.category = foundCategory._id
        } else {
          return res.status(404).json({ msg: translate('CATEGORY_NOT_FOUND', req.lang) })
        }
      }
    }

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('user', 'nombre email')

    res.json(products)
  } catch (error) {
    console.error('❌ Error al obtener productos:', error)
    res.status(500).json({ msg: translate('INTERNAL_ERROR', req.lang), error })
  }
}

// Editar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, price, category, image, active } = req.body

    const product = await Product.findById(id)
    if (!product) return res.status(404).json({ msg: translate('PRODUCT_NOT_FOUND', req.lang) })

    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: translate('NOT_OWNER', req.lang) })
    }

    if (name) product.name = name
    if (description) product.description = description
    if (price !== undefined) product.price = price
    if (category) product.category = category
    if (image) product.image = image
    if (active !== undefined) product.active = active

    await product.save()
    res.json({ msg: translate('PRODUCT_UPDATED', req.lang), product })
  } catch (error) {
    res.status(500).json({ msg: translate('INTERNAL_ERROR', req.lang), error })
  }
}

// Borrar producto
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)
    if (!product) return res.status(404).json({ msg: translate('PRODUCT_NOT_FOUND', req.lang) })

    if (product.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: translate('NOT_OWNER', req.lang) })
    }

    await product.deleteOne()
    res.json({ msg: translate('PRODUCT_DELETED', req.lang) })
  } catch (error) {
    res.status(500).json({ msg: translate('INTERNAL_ERROR', req.lang), error })
  }
}

// Subir imagen
export const uploadProductImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: translate('NO_IMAGE_SENT', req.lang) })
  }
  res.json({ imageUrl: `/uploads/products/${req.file.filename}` })
}

// Filtro avanzado
export const getFilteredProducts = async (req, res) => {
  try {
    const { category, user, status, q, priceMin, priceMax } = req.query
    const filter = {}

    if (category) {
      if (/^[0-9a-fA-F]{24}$/.test(category)) {
        filter.category = category
      } else {
        const foundCategory = await Category.findOne({
          name: { $regex: new RegExp(`^${category}$`, 'i') }
        })
        if (foundCategory) {
          filter.category = foundCategory._id
        } else {
          return res.status(404).json({ msg: translate('CATEGORY_NOT_FOUND', req.lang) })
        }
      }
    }

    if (user) filter.user = user
    if (status) filter.status = status

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }

    if (priceMin || priceMax) {
      filter.price = {}
      if (priceMin) filter.price.$gte = parseFloat(priceMin)
      if (priceMax) filter.price.$lte = parseFloat(priceMax)
    }

    const products = await Product.find(filter)
      .populate('user', 'nombre')
      .populate('category', 'name')
      .sort({ createdAt: -1 })

    res.json(products)
  } catch (err) {
    console.error('❌ Error al filtrar productos:', err)
    res.status(500).json({ msg: translate('INTERNAL_ERROR', req.lang), error: err.message })
  }
}

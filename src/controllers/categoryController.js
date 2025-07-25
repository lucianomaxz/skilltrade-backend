import Category from '../models/Category.js'
import { translate } from '../utils/translate.js'

export const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body
    const exists = await Category.findOne({ name })
    if (exists) {
      return res.status(400).json({ msg: translate('CATEGORY_EXISTS', req.lang) })
    }
    const category = new Category({ name, icon })
    await category.save()
    res.status(201).json({ msg: translate('CATEGORY_CREATED', req.lang), category })
  } catch (error) {
    res.status(500).json({ msg: translate('ERROR_CREATING_CATEGORY', req.lang), error })
  }
}

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
    res.json(categories)
  } catch (error) {
    res.status(500).json({ msg: translate('ERROR_FETCHING_CATEGORIES', req.lang), error })
  }
}

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name, icon } = req.body
    const category = await Category.findByIdAndUpdate(
      id,
      { name, icon },
      { new: true }
    )
    if (!category) return res.status(404).json({ msg: translate('CATEGORY_NOT_FOUND', req.lang) })
    res.json({ msg: translate('CATEGORY_UPDATED', req.lang), category })
  } catch (error) {
    res.status(500).json({ msg: translate('ERROR_UPDATING_CATEGORY', req.lang), error })
  }
}

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params
    const category = await Category.findByIdAndDelete(id)
    if (!category) return res.status(404).json({ msg: translate('CATEGORY_NOT_FOUND', req.lang) })
    res.json({ msg: translate('CATEGORY_DELETED', req.lang) })
  } catch (error) {
    res.status(500).json({ msg: translate('ERROR_DELETING_CATEGORY', req.lang), error })
  }
}

import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads/products')
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname)
    cb(null, `${Date.now()}-${file.fieldname}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Formato de archivo no permitido'), false)
  }
}

const upload = multer({ storage, fileFilter })

export default upload

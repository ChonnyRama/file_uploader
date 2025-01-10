const fs = require('node:fs/promises')
const multer = require('multer')
const { join } = require('node:path')
const { format } = require('date-fns')
const { v2: cloudinary } = require('cloudinary')
const upload = multer({ dest: `uploads/toCloud` })



async function fileFolderPost(req,res,next) {
  const uploadFolder = join(__dirname,'..', 'uploads', req.params.id, req.body.dirName)
  await fs.mkdir(uploadFolder, { recursive: true })
  
  res.redirect('/')
}

async function fileFolderGet(req, res, next) {
  const currentFolder = join(__dirname, '..', 'uploads', req.params.id, req.params.folderName)
  const fileNames = await fs.readdir(currentFolder)

  const files = await Promise.all(
    fileNames.map(async (fileName) => {
      const fullPath = join(currentFolder, fileName)
      const stats = await fs.stat(fullPath)

      return {
        name: fileName,
        folderName: req.params.folderName,
        stats: {
          ...stats,
          birthtime: format(stats.birthtime, 'MMMM dd, yyyy h:mm a'),
          mtime: format(stats.mtime, 'MMMM dd, yyyy h:mm a')
        }
      }
    })
  )
  res.render('folder', {user: res.locals.currentUser, files: files, currentPath: req.originalUrl})
}

async function fileFolderDownload(req, res, next) {
  try {
    const filePath = join(__dirname, '..', 'uploads', req.params.id, req.params.folderName, req.params.fileName)
    res.download(filePath)
  } catch (err) {
    console.error('Error downloading file:', err)
  }
}

const fileFolderUpload = [
  upload.single('fileToUp'),
  async (req, res, next) => {
    //req.file contains contains the files uploaded from form
    //req.body golds the text fields
    try {
      const file = req.file.path
      const uploadResult = await cloudinary.uploader.upload(
        file, {
          folder: `uploads/${req.params.id}/${req.params.folderName}`,
          display_name: req.body.fileName,
        }
      )
      res.status(200).json({url: uploadResult.secure_url})


    } catch (err) {
      console.error("Error uploading file to cloudinary:", err)
    }
  }
]

module.exports = {
  fileFolderPost,
  fileFolderGet,
  fileFolderDownload,
  fileFolderUpload
}
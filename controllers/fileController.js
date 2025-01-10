const fs = require('node:fs/promises')
const multer = require('multer')
const { join } = require('node:path')
const { format } = require('date-fns')
const { v2: cloudinary } = require('cloudinary')
const upload = multer({ dest: `uploads/toCloud` })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()



async function fileFolderPost(req,res,next) {
  // const uploadFolder = join(__dirname,'..', 'uploads', req.params.id, req.body.dirName)
  // await fs.mkdir(uploadFolder, { recursive: true })
  await prisma.folder.create({
    data: {
      name: req.body.dirName,
      size: 0,
      userId: res.locals.currentUser.id
    }
  })
  
  res.redirect('/')
}

async function fileFolderGet(req, res, next) {
  try {
    const files = await prisma.file.findMany({
      where: {
        name: req.params.folderName,
        userId: res.locals.currentUser.id
      }
    })

    res.render('folder', {user: res.locals.currentUser, files: files, currentPath: req.originalUrl})
  } catch (err) {
    console.error('Error retrieving folder contents:', err)
    next(err)
  }
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

      const folder = await prisma.folder.findUnique({
        where: {
          userId_folderName: {
            userId: res.locals.currentUser.id,
            name: req.params.folderName
          }
        }
      })
      await prisma.file.create({
        data: {
          name: req.body.fileName,
          size: uploadResult.bytes,
          url: uploadResult.secure_url,
          userId: res.locals.currentUser.id,
          folderId: folder.id
        }
      })
      res.redirect(`/files/${res.locals.currentUser.id}/${req.params.folderName}`)


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
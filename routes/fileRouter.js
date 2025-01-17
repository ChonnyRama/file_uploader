const { Router } = require('express')
const fileController = require('../controllers/fileController')

const fileRouter = Router()

fileRouter.get('/:id/:folderName', fileController.fileFolderGet)
fileRouter.get('/:id/:folderId/:fileName',fileController.fileFolderDownload)

fileRouter.post('/:id/create-folder',fileController.fileFolderPost)
fileRouter.post('/:id/:folderName/upload', fileController.fileFolderUpload)

module.exports = fileRouter
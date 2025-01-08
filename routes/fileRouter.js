const { Router } = require('express')
const fileController = require('../controllers/fileController')

const fileRouter = Router()

fileRouter.get('/:id/:folderName', fileController.fileFolderGet)
fileRouter.get('/:id/:folderName/:fileName',fileController.fileFolderDownload)

fileRouter.post('/:id/create-folder',fileController.fileFolderPost)


module.exports = fileRouter
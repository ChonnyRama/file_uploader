const { Router } = require('express')
const fileController = require('../controllers/fileController')

const fileRouter = Router()

fileRouter.get('/:id/folders',)

fileRouter.post('/:id/create-folder',fileController.makeFolder)


module.exports = fileRouter
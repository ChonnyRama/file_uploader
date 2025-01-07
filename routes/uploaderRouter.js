const { Router } = require("express")
const uploaderController = require('../controllers/uploaderController')

const uploaderRouter = Router()

uploaderRouter.get('/', uploaderController.uploadIndexGet)

module.exports = uploaderRouter
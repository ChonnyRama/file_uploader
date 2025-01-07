const { Router } = require("express")
const uploaderController = require('../controllers/uploaderController')

const uploaderRouter = Router()

uploaderRouter.get('/', uploaderController.uploadIndexGet)
uploaderRouter.get('/register', uploaderController.uploadSignupGet)
uploaderRouter.post('/register', uploaderController.uploadSignupPost)

module.exports = uploaderRouter
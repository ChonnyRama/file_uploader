const { Router } = require("express")
const userController = require('../controllers/userController')

const userRouter = Router()

userRouter.get('/', userController.uploadIndexGet)
userRouter.get('/register', userController.uploadSignupGet)
userRouter.post('/register', userController.uploadSignupPost)

module.exports = userRouter
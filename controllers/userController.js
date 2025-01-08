const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const fs = require('node:fs/promises')
const { join } = require('node:path')
const {format} = require('date-fns')


const prisma = new PrismaClient()

const validateUser = [
  body("username").trim()
    .isAlphanumeric().withMessage("Must be alphanumeric")
    .isLength({min:1, max: 14}).withMessage('Has to be between 1-14 characters'),
  body("email")
    .isEmail().withMessage('Not a valid email'),
  body("password")
    .isLength({ min: 5 }).withMessage('Must be at least 5 characters'),
  body('confPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error()
    }
    return true
  }).withMessage('Passwords do not match')
]

async function uploadIndexGet(req, res, next) {
  try {
    //get all folders in the user's directory
    const userFolderPath = join(__dirname, '..', 'uploads',res.locals.currentUser.id.toString())
    const folderNames = await fs.readdir(userFolderPath)

    const folders = await Promise.all(
      folderNames.map(async (folderName) => {
        const fullPath = join(userFolderPath, folderName)
        const stats = await fs.stat(fullPath)

        return {
          name: folderName,
          stats: {
            ...stats,
            birthtime: format(stats.birthtime, 'MMMM dd, yyyy h:mm a'),
            mtime: format(stats.mtime, 'MMMM dd, yyyy h:mm a')
          }
        }
      }))

    res.render('index', { user: res.locals.currentUser, folders: folders})
  } catch (err) {
    console.error('Error rendering', err)
    next(err)
  }
}

async function uploadSignupGet(req, res, next) {
  try {
    res.render('register')
  } catch (err) {
    console.error('Error rendering sign up page')
    next(err)
  }
}

const uploadSignupPost = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).render("register", {
        errors: errors.array
      })
    }
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
        await prisma.user.create({
          data: {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
          }
        })
      res.redirect("/")
    } catch (err) {
      console.error('Error creating user: ',err)
  }
}]

async function gracefulShutdown(callback) {
  try {
    await callback()
  } catch (e) {
    console.error('Error: ',e)
  } finally {
    await prisma.$disconnect()
  }
}



module.exports = {
  uploadIndexGet,
  uploadSignupGet,
  gracefulShutdown,
  uploadSignupPost
  }
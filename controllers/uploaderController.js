const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function uploadIndexGet(req, res, next) {
  try {
    res.render('index')
  } catch (err) {
    console.error('Error rendering', err)
    next(err)
  }
}

async function main() {

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

module.exports = {
    uploadIndexGet
  }
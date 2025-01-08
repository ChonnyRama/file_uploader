const fs = require('node:fs/promises')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const { join } = require('node:path')

async function makeFolder(req,res,next) {
  const uploadFolder = join(__dirname,'..', 'uploads', req.params.id, req.body.dirName)
  await fs.mkdir(uploadFolder, { recursive: true })
  
  res.redirect('/')
}

module.exports = {
  makeFolder
}
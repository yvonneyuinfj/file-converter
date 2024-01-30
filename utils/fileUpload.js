const fs = require('fs')
const path = require('path')
const formidable = require('formidable')

const uploadDir = path.join(__dirname, '../public/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
async function handleFileUpload(req) {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    uploadDir: uploadDir,
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve(files.file)
    })
  })
}

module.exports = {
  handleFileUpload,
}

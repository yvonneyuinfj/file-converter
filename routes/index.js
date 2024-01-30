const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { handleFileUpload } = require('../utils/fileUpload')
const { convertToMarkdown } = require('../utils/fileConvert')
const { createArchive } = require('../utils/fileArchive')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/file-converter', function (req, res) {
  res.render('file-converter')
})

const uploadDir = path.join(__dirname, '../public/uploads')
const convertedDir = uploadDir

router.post('/file-converter', async function (req, res, next) {
  try {
    // 确保上传目录存在。
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    // 处理文件上传
    const file = await handleFileUpload(req)
    if (!file) next(new Error('文件上传失败'))
    if (file) {
      // 文件处理逻辑
      const oldPath = file.filepath
      const folderName = path.parse(file.newFilename).name
      const folderPath = path.join(uploadDir, folderName)
      if (!fs.existsSync(folderPath)) {
        await fs.promises.mkdir(folderPath, { recursive: true })
      }
      const newFileName = file.originalFilename
      const newPath = path.join(uploadDir, newFileName)
      await fs.promises.rename(oldPath, newPath)

      // 文件转换逻辑
      await convertToMarkdown(newPath, folderPath, newFileName)

      // 文件与图片打包压缩逻辑
      const archiveName = await createArchive(folderPath)

      res.redirect('/download/uploads/' + archiveName)
    }
  } catch (err) {
    next(err)
    return
  }
})
// TODO: 优化下载传参
router.get('/download/:foldername/:filename', (req, res) => {
  const foldername = req.params.foldername
  const filename = req.params.filename
  // 构建完整的路径
  const filePath = path.join(uploadDir, filename)
  // console.log('下载路径：', filePath)
  res.download(filePath, err => {
    if (err) {
      console.log('下载时发生错误：', err.message)
      res.status(404).send('文件未找到！').status(500).send('内部服务器错误')
      next(err)
    }
  })
})

module.exports = router

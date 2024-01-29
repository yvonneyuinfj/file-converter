var express = require('express')
const formidable = require('formidable')
var router = express.Router()
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const convertFile = require('../utils/pandoc.js')
const uploadDir = path.join(__dirname, '../public/uploads')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/file-converter', function (req, res) {
  res.render('file-converter')
})

// const uploadDir = path.join(__dirname, '../public/uploads')
// const convertedDir = path.join(__dirname, '../public/converted')
// console.log(uploadDir)
const convertedDir = uploadDir

router.post('/file-converter', function (req, res, next) {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    uploadDir: uploadDir,
  })
  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    // 处理文件名
    for (const file of Object.values(files)) {
      const oldPath = file.filepath
      const folderName = path.parse(file.newFilename).name
      const newFileName = folderName + '-' + file.originalFilename
      // 创建文件夹
      fs.mkdirSync(path.join(uploadDir, folderName))
      const newPath = path.join(uploadDir, folderName, newFileName)
      fs.renameSync(oldPath, newPath)

      // TODO: 转换文件
      // 转换文件
      const convertedPath = path.join(
        convertedDir,
        folderName,
        path.parse(newFileName).name + '.md'
      )
      const options = {
        sourceType: 'docx',
        sourceFilePath: newPath,
        targetType: 'markdown',
        targetFilePath: convertedPath,
      }
      // console.log(options)
      await convertFile(options)

      // 将转换后的文件与图片打包压缩
      const output = fs.createWriteStream(
        path.join(uploadDir, folderName + '.zip')
      )
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Sets the compression level.
      })
      archive.pipe(output)
      archive.directory(path.join(uploadDir, folderName), false)
      archive.finalize()

      // 在完成时执行的回调
      output.on('close', () => {
        console.log('文件夹已成功压缩为')
        res.redirect('/download/uploads/' + folderName + '.zip')
      })

      output.on('end', () => {
        console.log('数据流已关闭')
      })

      archive.on('warning', err => {
        if (err.code === 'ENOENT') {
          console.warn('警告：文件或文件夹不存在', err)
        } else {
          throw err
        }
      })

      archive.on('error', err => {
        throw err
      })

      // 重定向到下载
      // res.redirect(
      //   '/download/' + folderName + '/' + path.parse(newFileName).name + '.md'
      // )
    }

    // res.status(200).json({ message: '文件上传成功！' })
  })
})

router.get('/download/:foldername/:filename', (req, res) => {
  const foldername = req.params.foldername
  const filename = req.params.filename
  // 构建完整的路径
  const filePath = path.join(uploadDir, filename)
  console.log(filePath)
  // 使用 Express 的 res.download() 方法提供下载
  res.download(filePath, err => {
    if (err) {
      // 处理下载失败的情况，可以发送错误响应或者记录日志
      res.status(404).send('文件未找到')
    }
  })
})

module.exports = router

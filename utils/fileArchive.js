const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

async function createArchive(sourceDir) {
  // ... 文件压缩和打包逻辑 ...
  return new Promise((resolve, reject) => {
    const archiveName = path.parse(sourceDir).name + '.zip'
    const output = fs.createWriteStream(sourceDir + '.zip')
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    })
    archive.pipe(output)
    archive.directory(sourceDir, false)
    archive.finalize()

    // 在完成时执行的回调
    output.on('close', () => {
      console.log('已成功压缩为', archiveName)
      resolve(archiveName)
    })

    output.on('end', () => {
      console.log('数据流已关闭')
    })

    archive.on('warning', err => {
      if (err.code === 'ENOENT') {
        console.warn('警告：文件或文件夹不存在', err)
      } else {
        reject(err)
      }
    })

    archive.on('error', err => {
      reject(err)
    })
  })
}

module.exports = {
  createArchive,
}

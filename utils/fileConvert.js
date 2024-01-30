const path = require('path')
const convertFile = require('../utils/pandoc.js')

async function convertToMarkdown(sourceFilePath, targetDir, newFileName) {
  const convertedPath = path.join(targetDir, newFileName + '.md')
  const options = {
    sourceType: 'docx',
    sourceFilePath: sourceFilePath,
    targetType: 'markdown',
    targetFilePath: convertedPath,
  }

  await convertFile(options)
  return convertedPath
}

module.exports = {
  convertToMarkdown,
}

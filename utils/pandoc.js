// import { existsSync } from 'fs'
// import { execa } from 'execa'
// import path from 'path'
const fs = require('fs')
const execa = require('execa')
const path = require('path')

async function convertFile({
  sourceType,
  sourceFilePath,
  targetType,
  targetFilePath,
}) {
  if (!fs.existsSync(sourceFilePath)) {
    throw new Error('Source file does not exist')
  }

  // 获取输入文件的目录作为工作目录
  const workingDirectory = path.dirname(targetFilePath)

  // const imagesDir = path.join(workingDirectory, '../images')
  const args = [
    // '--from',
    // sourceType,
    sourceFilePath,
    '--extract-media',
    './images',
    '--to',
    targetType,
    '-o',
    targetFilePath,
  ]

  // const command = `pandoc -f ${sourceType} -t ${targetType} -o "${targetFilePath}" "${sourceFilePath}"`

  try {
    await execa('pandoc', args, {
      cwd: workingDirectory,
      shell: true,
    })
    return targetFilePath
  } catch (error) {
    throw new Error(`Pandoc failed: ${error.message}`)
  }
}

module.exports = convertFile

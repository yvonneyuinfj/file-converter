var express = require('express')
const formidable = require('formidable')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/file-converter', function (req, res) {
  res.render('file-converter')
})

router.post('/file-converter', function (req, res, next) {
  const form = formidable({ multiples: true, keepExtensions: true })
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    console.log(fields)
    console.log(files)
    res.send('ok')
  })
})

module.exports = router

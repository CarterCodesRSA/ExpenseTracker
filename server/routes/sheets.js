const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
  // res.json({ success: true })
  console.log('res: ', res);
  res.json({ success: true })
})

router.post('/', (req, res) => {
  // return res.json({ message: 'Thank you for voting' })
  console.log('res: ', res);
  return res.json({ message: 'Thank you for voting' })
})

module.exports = router
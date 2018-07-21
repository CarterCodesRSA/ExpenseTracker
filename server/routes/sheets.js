const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  // res.json({ success: true })
  console.log('res: ', res);
  res.json({ success: true });
});

router.post('/', (req, res) => {
  const { date, data } = req.body;
  

  res.json({
    success: 1,
    message: `Thank you for your data, submitted for date ${date}`
  });
});

module.exports = router;

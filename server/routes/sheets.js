const express = require('express');

const AuthClient = require('../api/AuthClient');

const GoogleSheet = new AuthClient();

const router = express.Router();

router.get('/', async (req, res) => {
  GoogleSheet.getDataByRange('A:V')
    .then(data => {
      res.json({ success: 1, payload: data });
    })
    .catch(err => {
      res.json({ success: 0, error: err });
    });
});

router.post('/', (req, res) => {
  GoogleSheet.writeData(req.body)
    .then(payload => {
      console.log(payload);

      res.json({
        success: 1,
        payload
      });
    })
    .catch(err => {
      console.log('err: ', err);
      res.json({
        success: 0,
        payload: `${err}`
      });
    });
});

module.exports = router;

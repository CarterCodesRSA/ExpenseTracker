const express = require('express');

const AuthClient = require('../api/AuthClient');

const GoogleSheet = new AuthClient();

const router = express.Router();

router.get('/', (req, res) => {
  console.log(`GET /Sheets - ${req.connection.remoteAddress}`);
  GoogleSheet.getDataByRange('A:V')
    .then(data => {
      console.log(`GET /Sheets - ${req.connection.remoteAddress} - Success`);
      res.json({ success: 1, payload: data });
    })
    .catch(err => {
      console.log(`GET /Sheets - ${req.connection.remoteAddress} - Error:\n`, err);
      res.json({ success: 0, error: err });
    });
});

router.get('/getSheets', (req, res) => {
  console.log(`GET /Sheets/getSheets - ${req.connection.remoteAddress}`);
  GoogleSheet.getSheets()
    .then(data => {
      console.log(`POST /Sheets - ${req.connection.remoteAddress} - Success:\n`, data);
      res.json({ success: 1, payload: data });
    })
    .catch(err => {
      console.log(`GET /Sheets/getSheets - ${req.connection.remoteAddress} - Error:\n`, err);
      res.json({ success: 0, error: err });
    });
});

router.post('/', (req, res) => {
  console.log(`POST /Sheets - ${req.connection.remoteAddress}`);
  // GoogleSheet.writeDataRequest(req.body)
  GoogleSheet.writeData(req.body)
    .then(payload => {
      console.log(`POST /Sheets - ${req.connection.remoteAddress} - Success:\n`, payload);
      res.json({
        success: 1,
        payload
      });
    })
    .catch(err => {
      console.log(`POST /Sheets - ${req.connection.remoteAddress} - Error:\n`, err);
      res.json({
        success: 0,
        payload: `${err}`
      });
    });
});

module.exports = router;

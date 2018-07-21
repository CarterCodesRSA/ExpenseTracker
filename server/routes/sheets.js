const express = require('express');

const AuthClient = require('../api/AuthClient');

// const GoogleSheet = require('../api/singleton').getInstance();
// GoogleSheet.then(data => {
//   const { auth, sheets, ...leftOver } = data;
//   console.log(leftOver);
// });

const GoogleSheet = new AuthClient();

const router = express.Router();

router.get('/', async (req, res) => {
  res.json({ success: true, payload: sheet });
});

router.post('/', (req, res) => {
  const { date, expenses } = req.body;

  res.json({
    success: 1,
    message: `Thank you for your data, submitted for date ${date}`,
    receivedData: expenses
  });
});

module.exports = router;

/*

const getPrintAllData = async id => {
  const request = { spreadsheetId: id, range: 'A:V' };
  const sampleData = await client.getAllData(request);
  client.printAllData(sampleData);
};

const createSheet = async () => {
  const create = await client.createSheet();
}

*/

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { validateInsertionPayload, getSheetNameFromDate, formatRequestExpenses } = require('../lib/util');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.js';
const PATH_TO_CLIENT_SECRET = './client_secret.json';
const TEST_SHEET_ID = '1Ic99dYelSgX1h_AJwpOFAHaso6O1-RuCo8d8TfoNcAw';
const PRODUCTION_SHEET_ID = '1HeeWipNHovcnUYR4BTFnWdVLOZodoxT1I3ZVMky5F8k';
const SHEET_ID = process.env.NODE_ENV === 'production' ? PRODUCTION_SHEET_ID : TEST_SHEET_ID;

class AuthClient {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.worksheets = [];

    this.authClient().then(() => {
      this.getSheets();
    });
  }

  authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return this.getNewToken(oAuth2Client, callback);

      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', code => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return callback(err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
          if (err) console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  authClient() {
    return new Promise((resolve, reject) => {
      fs.readFile(PATH_TO_CLIENT_SECRET, (err, content) => {
        if (err) reject(`Error loading client secret file: ${err}`);

        this.authorize(JSON.parse(content), auth => {
          this.auth = Object.assign({}, auth);
          this.sheets = google.sheets({ version: 'v4', auth });
          console.log("We're authed!");
          resolve();
        });
      });
    });
  }

  writeData(importData) {
    return new Promise(async (resolve, reject) => {
      const isPayloadValid = validateInsertionPayload(importData);

      if (isPayloadValid.isValid) {
        const { date } = importData;

        const sheetName = getSheetNameFromDate(date);
        const sheetExists = this.worksheets.some(item => {
          return item.title === sheetName;
        });

        const appendRequestPayload = Object.assign({}, { sheetName }, importData);

        try {
          if (!sheetExists) {
            await this.createSheet(sheetName);

            const appendRequest = await this.appendDataToSheet(appendRequestPayload);
            const responsePayload = Object.assign({}, appendRequest, { sheetNameCreated: sheetName });
            resolve(responsePayload);
          } else {
            const appendRequest = await this.appendDataToSheet(appendRequestPayload);
            resolve(appendRequest);
          }
        } catch (err) {
          reject('Something went wrong trying to append the data.');
        }
      } else {
        reject(isPayloadValid.error);
      }
    });
  }

  appendDataToSheet({ sheetName, date, expenses }) {
    return new Promise(async (resolve, reject) => {
      const existingSheetData = await this.getDataByRange(`${sheetName}!A:A`);
      const startRow = existingSheetData.values.length + 1;

      const resultArray = formatRequestExpenses({ date, expenses });
      const expensesLength = resultArray.length;

      const targetRange = `${sheetName}!A${startRow}:V${startRow + expensesLength}`;

      try {
        const request = await this.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: {
            data: {
              range: targetRange,
              values: resultArray
            },
            valueInputOption: 'RAW'
          }
        });

        const { spreadsheetId, responses } = request.data;
        const responsePayload = Object.assign({}, responses[0], {
          url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
        });

        resolve(responsePayload);
      } catch (err) {
        reject('There was an error writing the data to the sheet.');
      }
    });
  }

  createSheet(sheetName) {
    return new Promise(async (resolve, reject) => {
      const { spreadsheets } = this.sheets;

      try {
        const createSheetRequest = await spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName
                  }
                }
              }
            ]
          }
        });

        const addHeaderRequest = await spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: {
            data: {
              range: `${sheetName}!A1:V5`,
              values: [['Date', 'Name', 'Amount', 'Type']]
            },
            valueInputOption: 'RAW'
          }
        });

        await this.getSheets();
        resolve();
      } catch (err) {
        reject(err.response.data);
      }
    });
  }

  getSheets() {
    return new Promise((resolve, reject) => {
      this.sheets.spreadsheets.get({ spreadsheetId: SHEET_ID }, (err, data) => {
        if (err) reject(`Error trying to get spreadsheets: ${err}`);

        const {
          data: { sheets }
        } = data;

        const responsePayload = sheets.map(sheet => {
          const {
            properties: { title, index }
          } = sheet;

          return { title, index };
        });

        this.worksheets = responsePayload;
        resolve(responsePayload);
      });
    });
  }

  getDataByRange(range) {
    return new Promise((resolve, reject) => {
      this.sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range }, (err, { data }) => {
        if (err) reject(`Something went trying to get data by range: ${err}`);
        resolve(data);
      });
    });
  }
}

module.exports = AuthClient;

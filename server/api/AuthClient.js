const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.js';
const PATH_TO_CLIENT_SECRET = './client_secret.json';
const SHEET_ID = '1HeeWipNHovcnUYR4BTFnWdVLOZodoxT1I3ZVMky5F8k';

class AuthClient {
  constructor() {
    this.auth = null;
    this.sheets = null;

    this.authClient();
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
      const { date, expenses } = importData;

      if (!date) {
        reject("Please include a date, or ensure it's spelled correctly.");
        return;
      }
      if (!expenses) {
        reject("Please include an expenses payload, or ensure it's spelled correctly.");
        return;
      }

      const resultArray = [];
      const expenseLength = Object.keys(expenses).length;

      const isExpenseKeysValid = expenses.every(expenseItem => {
        const { name, amount, type } = expenseItem;

        if (!name || !amount || !type) {
          reject('One of your payload object keys are incorrect. Looking for name, amount, type');
          return false;
        }
        return true;
      });

      if (isExpenseKeysValid) {
        expenses.map(expenseItem => {
          const { name, amount, type } = expenseItem;

          if (!name || !amount || !type) {
            reject('One of your payload object keys are incorrect. Looking for name, amount, type');
          }

          resultArray.push([`${date}`, `${name}`, `${amount}`, `${type}`]);
        });

        const existingSheetData = await this.getDataByRange('A:V');
        const startRow = existingSheetData.values.length + 1;

        const request = await this.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SHEET_ID,
          resource: {
            data: {
              range: `A${startRow}:V${startRow + expenseLength}`,
              values: resultArray
            },
            valueInputOption: 'RAW'
          }
        });

        if (request.status === 200) {
          const { spreadsheetId } = request.data;

          const payload = Object.assign({}, request.data.responses[0], {
            url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
          });

          resolve(payload);
        } else {
          reject(reject);
        }
      }

      return;
    });
  }

  getDataByRange(range) {
    return new Promise((resolve, reject) => {
      this.sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range }, (err, { data }) => {
        if (err) reject(`Something went wrong: ${err}`);
        resolve(data);
      });
    });
  }
}

module.exports = AuthClient;

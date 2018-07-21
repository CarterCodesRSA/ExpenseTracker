const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.js';
const PATH_TO_CLIENT_SECRET = './client_secret.json';

class AuthClient {
  constructor() {
    this.auth = null;
    this.sheets = null;

    this.authClient();
  }

  authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Check if we have previously stored a token.
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

  createSheet() {
    const request = {
      resource: {
        properties: {
          title: 'New Sheet!',
          locale: 'en'
        }
      }
    };

    return new Promise((resolve, reject) => {
      this.sheets.spreadsheets.create(request, (err, { data }) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }

  getAllData({ spreadsheetId, range }) {
    return new Promise((resolve, reject) => {
      this.sheets.spreadsheets.values.get(
        { spreadsheetId, range },
        (err, { data }) => {
          if (err) reject(`Something went wrong: ${err}`);
          resolve({ data, spreadsheetId, range });
        }
      );
    });
  }

  printAllData({ data, spreadsheetId, range }) {
    const rows = data.values;

    if (spreadsheetId) {
      console.log(
        `This sheet is ranged: ${range}
        https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit
        `
      );
    }

    if (rows.length) {
      rows.map(row => console.log(row.join(', ')));
    } else {
      console.log('No data found.');
    }
  }
}

module.exports = AuthClient;

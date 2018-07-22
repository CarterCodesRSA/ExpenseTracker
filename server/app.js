const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const sheets = require('./routes/sheets');

// Set Public Folder
app.use(express.static('public'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Enable Cors
app.use(cors());

app.use('/sheets', sheets);

const portNumber = 80;

// Start Server
app.listen(portNumber, () => console.log(`Server started on ${portNumber}`));


const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/database.config.js');
const routes = require('./app/routers/index.js');
const {seedAdminUser} = require('./script/sedeer.js');

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const TIMEOUT_DURATION = 3000;

// Utility function to handle connection timeout
const withTimeout = (promise, name) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${name} connection timed out`)), TIMEOUT_DURATION)
    ),
  ]);
};

// MongoDB connection with timeout
withTimeout(mongoose.connect(config.url, { useNewUrlParser: true, useUnifiedTopology: true }), 'MongoDB')
  .then(() => {
    console.log('Connected to the Database');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1); // Exit if MongoDB connection fails
  });

// Seeder script
seedAdminUser();


const apiBasePath = process.env.API_BASE_PATH

// Router
app.use(apiBasePath, routes);

app.get('/', (req, res) => {
  res.json({ message: 'Testing is okay' });
});

// Start the server
const port = process.env.PORT_DEV ;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
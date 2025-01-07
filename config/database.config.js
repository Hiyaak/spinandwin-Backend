
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = (() => {
  const isRunningLocally = process.env.NODE_ENV === 'true'; 

  if (isRunningLocally) {
    console.log("Running docker:", process.env.NODE_ENV);
    return {
      url: process.env.MONGO_URL_DEV_LOC 
    };
  } else {
    return {
      url: process.env.MONGO_URL_DEV 
    };
  }
})();

module.exports = dbConfig;

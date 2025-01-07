const jwt = require('jsonwebtoken');
const { format, addMinutes } = require('date-fns');

const accessSecret = process.env.JWT_ACCESS_TOKEN_SECRET;
const refreshSecret = process.env.JWT_ACCESS_TOKEN_SECRET;


const accessExpiryTime = {
  expiresIn:365* 24 * 60 * 60
};

const refreshExpiryTime = {
  expiresIn:365 * 2* 24 * 60 * 60
};

const timeFormat = 'dd-MMM-yyyy hh:mm:ss a';
const todayDate = new Date();

const createAccessToken = (payload) => {
  return jwt.sign({ ...payload }, accessSecret, accessExpiryTime);
};

const createRefreshToken = (payload) => {
  return jwt.sign({ ...payload }, refreshSecret, refreshExpiryTime);
};

const getAccessTokenExpiry = () => {
  return format(addMinutes(todayDate, +accessExpiryTime.expiresIn), timeFormat);
};

const getRefreshTokenExpiry = () => {
  return format(addMinutes(todayDate, +refreshExpiryTime.expiresIn), timeFormat);
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new Error('Invalid tokens');
  }
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  getAccessTokenExpiry,
  getRefreshTokenExpiry,
  verifyAccessToken
};
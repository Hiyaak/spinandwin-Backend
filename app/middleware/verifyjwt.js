const jwt = require('jsonwebtoken');
const {get_current_user } = require('../utils/central.middleware');
const {verifyAccessToken} = require('../utils/jwt.service')
  const authVerify = async (req, res, next) => {
    try {
      let token = '';
      
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      if (!token) {
        return res.status(400).send({ Status: false, message: 'Please login to access this resource' });
      }
      const verify = verifyAccessToken(token)
      req.user = verify;
      if (verify.type === 'USER') {
        return get_current_user(req, res, next);
      } 
    } catch (err) {
      console.error('Error caught', err);
      return res.status(400).send({ Status: false, message: 'Please login to access this resource' });
    }
  };
  module.exports = authVerify
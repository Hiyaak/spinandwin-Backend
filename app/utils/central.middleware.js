
const userModel = require('../models/adminmodel');
const { sendErrorResponse } = require('./responsehandler.js');
const logger = require('../../config/logger.js');
const get_current_user = async (req, res, next) => {
  try {
    let user;
    logger.info('Retrieving current user', { userId: req.user.id });

    try {
      user = await userModel.findById(req.user.id);
      logger.info('User found', { user });

      if (user) {
        return next();
      } else {
        logger.warn('User session expired or user not found', { userId: req.user.id });
        return sendErrorResponse(res, 'Session expired! Please log in to continue');
      }
    } catch (error) {
      logger.error('Error finding user by ID', { error: error.message });
      return sendErrorResponse(res, 'Internal Server Error');
    }
  } catch (err) {
    logger.error('Error in get_current_user function', { error: err.message });
    return sendErrorResponse(res, 'Error in getting user');
  }
};


module.exports = {
  get_current_user,
};

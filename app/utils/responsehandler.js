
const sendSuccessResponse = (res, message, data = {}, statusCode = 200) => {
    res.status(statusCode).json({
      status: true,
      message: message,
      data: data
    });
};
const sendErrorResponse = (res, message, statusCode = 500) => {
    res.status(statusCode).json({
      status: false,
      message: message,
    });
  };
  
  module.exports = {
    sendSuccessResponse,
    sendErrorResponse
  };
  

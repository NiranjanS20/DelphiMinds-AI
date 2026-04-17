const { sendError } = require('../utils/response');
const errorCodes = require('../utils/errorCodes');
const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, code = errorCodes.INTERNAL_ERROR, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const notFoundHandler = (req, res) =>
  sendError(res, 'Route not found', 404, errorCodes.NOT_FOUND);

const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const code = error.code || errorCodes.INTERNAL_ERROR;
  const message = error.message || 'Internal server error';

  logger.error('Request failed', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    code,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });

  return sendError(res, message, statusCode, code, error.details);
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};

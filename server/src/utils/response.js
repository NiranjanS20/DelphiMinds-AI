const sendSuccess = (res, data, message, statusCode = 200) => {
  const payload = { success: true, data };
  if (message) {
    payload.message = message;
  }
  return res.status(statusCode).json(payload);
};

const sendError = (
  res,
  message = 'Something went wrong',
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details
) => {
  const payload = {
    success: false,
    message,
    code,
  };

  if (details) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = {
  sendSuccess,
  sendError,
  asyncHandler,
};

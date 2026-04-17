const rateLimit = require('express-rate-limit');

const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again shortly.',
  },
});

const strictAiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI endpoint rate limit exceeded. Please retry in a minute.',
  },
});

module.exports = {
  generalApiLimiter,
  strictAiLimiter,
};

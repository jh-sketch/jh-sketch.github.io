const createError = require('http-errors');

class ApiError extends Error {
  constructor(status, message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options.code;
  }

  static notFound(message, options = {}) {
    return new ApiError(404, message, options);
  }
}

// Forward asynchronous controller errors to Express
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve()
    .then(() => fn(req, res, next))
    .catch(next);
};


// Handle API routes that do not exist
const apiNotFound = (req, res, next) => {
  next(createError(404, 'API endpoint not found'));
};

// Handle API errors with consistent JSON responses
const apiErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let status = err.status || err.statusCode || 500;
  let code = err.code;

  // Handle malformed JSON requests
if (err.type === 'entity.parse.failed') {
  status = 400;
  code = 'BAD_REQUEST';
}
// Handle invalid Mongoose values
if (err.name === 'CastError') {
  status = 400;
  code = 'INVALID_VALUE';
}

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
  }

  // Handle duplicate MongoDB keys
  if (err.code === 11000) {
    status = 409;
    code = 'DUPLICATE_KEY';
  }

  if (status < 400 || status > 599) {
    status = 500;
  }

  if (typeof code !== 'string') {
    const codes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT'
    };

    code = codes[status] || 'SERVER_ERROR';
  }

  if (status >= 500) {
    console.error(
      `[API ERROR] ${req.method} ${req.originalUrl}`,
      err
    );
  }

  const message = status >= 500
    ? 'An unexpected server error occurred'
    : err.type === 'entity.parse.failed'
      ? 'Invalid JSON request body'
      : err.message || 'Request failed';

  return res.status(status).json({
    status,
    code,
    message
  });
};

module.exports = {
  ApiError,
  asyncHandler,
  apiNotFound,
  apiErrorHandler
};
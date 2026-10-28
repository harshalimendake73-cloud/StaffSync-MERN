export const errorHandler = (err, req, res, next) => {
  console.error('[Application Error]:', err.stack || err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field}: ${err.keyValue[field]}`;
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};


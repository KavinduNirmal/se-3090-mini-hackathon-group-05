import { env } from '../../config/env.js';

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  const response = {
    status,
    message: err.message || 'Internal Server Error',
  };

  if (err.details) {
    response.details = err.details;
  }

  if (env.nodeEnv === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

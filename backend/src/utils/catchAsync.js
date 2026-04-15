/**
 * Wraps async route handlers to eliminate try/catch boilerplate.
 * Passes errors to Express's next() for centralized error handling.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;

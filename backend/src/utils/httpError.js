/**
 * Creates a structured HTTP error that the global error handler will forward.
 */
const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

module.exports = { createError };

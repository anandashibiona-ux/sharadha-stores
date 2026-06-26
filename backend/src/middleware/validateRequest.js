const { z } = require('zod');

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * On failure it passes a ZodError to next() — picked up by the global error handler.
 */
const validate = (schema) => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = validate;

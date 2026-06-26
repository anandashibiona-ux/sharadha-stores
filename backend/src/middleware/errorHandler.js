/**
 * Global error handler — never exposes stack traces to the client.
 */
const errorHandler = (err, _req, res, _next) => {
  // Zod validation errors (thrown manually)
  if (err.name === 'ZodError') {
    const errorMessages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      error: `Validation failed: ${errorMessages}`,
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Prisma known request errors
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Conflict: resource already exists' });
  }

  // Application-defined HTTP errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Fallback — log the full error server-side, return generic message to client
  console.error('[ERROR]', err);
  return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
};

module.exports = errorHandler;

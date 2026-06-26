/**
 * Simple admin authentication via x-admin-key header.
 * In production you'd replace this with proper JWT/session auth.
 */
const adminAuth = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorised: invalid or missing admin key' });
  }
  next();
};

module.exports = adminAuth;

const { verifyToken } = require('../utils/tokens');
const { findUserById, sanitizeUser } = require('../data/db');

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return null;
}

function authenticate(optional = false) {
  return (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
      if (optional) {
        return next();
      }
      return res.status(401).json({ message: 'Authentication required' });
    }
    const payload = verifyToken(token);
    if (!payload) {
      if (optional) {
        return next();
      }
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    const user = findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    req.token = token;
    next();
  };
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  return next();
}

function currentUser(req) {
  return sanitizeUser(req.user);
}

module.exports = {
  authenticate,
  requireAdmin,
  currentUser,
};

const { verifyToken } = require('../utils/tokens');
const { findUserById, sanitizeUser } = require('../data/store');

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
  return async (req, res, next) => {
    try {
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
      const user = await findUserById(payload.sub);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function requireRoles(...roles) {
  const allowed = new Set(roles);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (allowed.size === 0 || allowed.has(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: 'Insufficient permissions' });
  };
}

const requireAdmin = requireRoles('admin');
const requireInstructor = requireRoles('instructor', 'admin');

function currentUser(req) {
  return sanitizeUser(req.user);
}

module.exports = {
  authenticate,
  requireAdmin,
  requireInstructor,
  requireRoles,
  currentUser,
};

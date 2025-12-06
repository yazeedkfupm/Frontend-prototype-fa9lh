const express = require('express');
const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/tokens');
const { findUserByEmail, createUser, sanitizeUser } = require('../data/db');
const { authenticate, currentUser } = require('../middleware/auth');
const { assertString } = require('../utils/validation');

const router = express.Router();

function respondWithSession(res, user, status = 200) {
  const token = signToken({ sub: user.id, role: user.role });
  return res.status(status).json({ user: sanitizeUser(user), token });
}

router.post('/signup', async (req, res, next) => {
  try {
    const name = assertString(req.body?.name, 'name', { minLength: 2 });
    const email = assertString(req.body?.email, 'email', { email: true, lowercase: true });
    const password = assertString(req.body?.password, 'password', { minLength: 6, trim: false });
    if (findUserByEmail(email)) {
      return res.status(409).json({ message: 'Account already exists for this email' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = createUser({ name, email, passwordHash });
    return respondWithSession(res, user, 201);
  } catch (error) {
    next(error);
  }
});

router.post('/signin', async (req, res, next) => {
  try {
    const email = assertString(req.body?.email, 'email', { email: true, lowercase: true });
    const password = assertString(req.body?.password, 'password', { minLength: 1, trim: false });
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    return respondWithSession(res, user);
  } catch (error) {
    next(error);
  }
});

router.post('/signout', authenticate(true), (req, res) => {
  res.json({ message: 'Signed out' });
});

router.get('/me', authenticate(), (req, res) => {
  res.json({ user: currentUser(req) });
});

module.exports = router;

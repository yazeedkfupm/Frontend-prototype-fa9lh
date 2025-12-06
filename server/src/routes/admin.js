const express = require('express');
const {
  getAdminUsers,
  updateUserStatus,
  getApprovals,
  resolveApproval,
} = require('../data/db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { assertEnum } = require('../utils/validation');

const router = express.Router();

router.use(authenticate());
router.use(requireAdmin);

router.get('/users', (req, res) => {
  res.json({ users: getAdminUsers() });
});

router.patch('/users/:id', (req, res, next) => {
  try {
    const status = assertEnum(req.body?.status, 'status', ['Active', 'Pending', 'Suspended']);
    const user = updateUserStatus(req.params.id, status);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/approvals', (req, res) => {
  res.json({ approvals: getApprovals() });
});

router.post('/approvals/:id/decision', (req, res, next) => {
  try {
    const decision = assertEnum(req.body?.decision, 'decision', ['approved', 'rejected']);
    const item = resolveApproval(req.params.id);
    res.json({
      item,
      message: `${item.author}'s ${item.type.toLowerCase()} ${decision}.`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

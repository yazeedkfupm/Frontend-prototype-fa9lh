const express = require('express');
const {
  getAdminUsers,
  updateUserStatus,
  getApprovals,
  resolveApproval,
} = require('../data/store');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { assertEnum } = require('../utils/validation');

const router = express.Router();

router.use(authenticate());
router.use(requireAdmin);

router.get('/users', async (req, res, next) => {
  try {
    const users = await getAdminUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.patch('/users/:id', async (req, res, next) => {
  try {
    const status = assertEnum(req.body?.status, 'status', ['Active', 'Pending', 'Suspended']);
    const user = await updateUserStatus(req.params.id, status);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/approvals', async (req, res, next) => {
  try {
    const approvals = await getApprovals();
    res.json({ approvals });
  } catch (error) {
    next(error);
  }
});

router.post('/approvals/:id/decision', async (req, res, next) => {
  try {
    const decision = assertEnum(req.body?.decision, 'decision', ['approved', 'rejected']);
    const rawId = req.params.id;
    const numericId = Number(rawId);
    const identifier = Number.isNaN(numericId) ? rawId : numericId;
    const adminId = req.user._id || req.user.id;
    const item = await resolveApproval(identifier, decision, adminId);
    res.json({
      item,
      message: `${item.author}'s ${item.type.toLowerCase()} ${decision}.`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

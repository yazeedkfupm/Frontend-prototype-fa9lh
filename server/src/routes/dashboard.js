const express = require('express');
const {
  getDashboard,
  markUnitComplete,
  continueCourse,
  startRecommendation,
} = require('../data/store');
const { authenticate } = require('../middleware/auth');
const { assertString, assertEnum, assertNumber } = require('../utils/validation');

const router = express.Router();

router.use(authenticate());

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const dashboard = await getDashboard(userId);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
});

router.post('/courses/:courseId/progress', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const courseId = assertString(req.params.courseId, 'courseId');
    const unitType = assertEnum(req.body?.unitType, 'unitType', ['lesson', 'quiz']);
    const unitId = assertString(req.body?.unitId, 'unitId');
    const result = await markUnitComplete(userId, courseId, unitType, unitId);
    const dashboard = await getDashboard(userId);
    res.json({
      ...result,
      dashboard,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/courses/:courseId/continue', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const courseId = assertString(req.params.courseId, 'courseId');
    const result = await continueCourse(userId, courseId);
    const dashboard = await getDashboard(userId);
    res.json({
      ...result,
      dashboard,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/recommendations/:id/start', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const recommendationId = assertNumber(req.params.id, 'recommendationId', { integer: true, min: 1 });
    const rec = await startRecommendation(userId, recommendationId);
    const dashboard = await getDashboard(userId);
    res.json({
      recommendation: rec,
      dashboard,
      message: `${rec.label} added to plan`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

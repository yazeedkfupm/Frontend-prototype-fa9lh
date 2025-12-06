const express = require('express');
const {
  getDashboard,
  markUnitComplete,
  continueCourse,
  startRecommendation,
} = require('../data/db');
const { authenticate } = require('../middleware/auth');
const { assertString, assertEnum, assertNumber } = require('../utils/validation');

const router = express.Router();

router.use(authenticate());

router.get('/', (req, res) => {
  res.json(getDashboard(req.user.id));
});

router.post('/courses/:courseId/progress', (req, res, next) => {
  try {
    const courseId = assertString(req.params.courseId, 'courseId');
    const unitType = assertEnum(req.body?.unitType, 'unitType', ['lesson', 'quiz']);
    const unitId = assertString(req.body?.unitId, 'unitId');
    const result = markUnitComplete(req.user.id, courseId, unitType, unitId);
    res.json({
      ...result,
      dashboard: getDashboard(req.user.id),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/courses/:courseId/continue', (req, res, next) => {
  try {
    const courseId = assertString(req.params.courseId, 'courseId');
    const result = continueCourse(req.user.id, courseId);
    res.json({
      ...result,
      dashboard: getDashboard(req.user.id),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/recommendations/:id/start', (req, res, next) => {
  try {
    const recommendationId = assertNumber(req.params.id, 'recommendationId', { integer: true, min: 1 });
    const rec = startRecommendation(req.user.id, recommendationId);
    res.json({
      recommendation: rec,
      dashboard: getDashboard(req.user.id),
      message: `${rec.label} added to plan`,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

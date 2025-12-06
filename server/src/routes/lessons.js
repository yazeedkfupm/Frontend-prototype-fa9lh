const express = require('express');
const { getLesson } = require('../data/db');
const { authenticate } = require('../middleware/auth');
const { assertString, assertNumber, assertBoolean } = require('../utils/validation');

const router = express.Router();
const progressStore = new Map();

router.use(authenticate());

router.get('/:lessonId', (req, res) => {
  const lessonId = assertString(req.params.lessonId, 'lessonId');
  const lesson = getLesson(lessonId);
  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }
  const progressKey = `${req.user.id}:${lesson.id}`;
  const progress = progressStore.get(progressKey) || { percent: 25, bookmarked: false };
  res.json({ lesson, progress });
});

router.post('/:lessonId/progress', (req, res) => {
  const lessonId = assertString(req.params.lessonId, 'lessonId');
  const lesson = getLesson(lessonId);
  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }
  const percent = assertNumber(req.body?.percent, 'percent', { min: 0, max: 100 });
  const rawBookmark = req.body?.bookmarked;
  const bookmarked = rawBookmark == null ? false : assertBoolean(rawBookmark, 'bookmarked');
  const progressKey = `${req.user.id}:${lesson.id}`;
  const entry = { percent, bookmarked };
  progressStore.set(progressKey, entry);
  res.json({ progress: entry, message: 'Progress updated' });
});

module.exports = router;

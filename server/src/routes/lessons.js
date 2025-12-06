const express = require('express');
const {
  getLesson,
  getLessonProgress,
  setLessonProgress,
  getLessonFeedbackForStudent,
  submitLessonFeedback,
} = require('../data/store');
const { authenticate } = require('../middleware/auth');
const { assertString, assertNumber, assertBoolean, assertEnum } = require('../utils/validation');

const router = express.Router();

router.use(authenticate());

router.get('/:lessonId', async (req, res, next) => {
  try {
    const lessonId = assertString(req.params.lessonId, 'lessonId');
    const lesson = await getLesson(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    const userId = req.user._id || req.user.id;
    const progress = await getLessonProgress(userId, lessonId);
    res.json({ lesson, progress });
  } catch (error) {
    next(error);
  }
});

router.post('/:lessonId/progress', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const lessonId = assertString(req.params.lessonId, 'lessonId');
    const lesson = await getLesson(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    const percent = assertNumber(req.body?.percent, 'percent', { min: 0, max: 100 });
    const rawBookmark = req.body?.bookmarked;
    const bookmarked = rawBookmark == null ? false : assertBoolean(rawBookmark, 'bookmarked');
    const progress = await setLessonProgress(userId, lessonId, { percent, bookmarked });
    res.json({ progress, message: 'Progress updated' });
  } catch (error) {
    next(error);
  }
});

router.get('/:lessonId/feedback', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const lessonId = assertString(req.params.lessonId, 'lessonId');
    const feedback = await getLessonFeedbackForStudent(userId, lessonId);
    res.json({ feedback });
  } catch (error) {
    next(error);
  }
});

router.post('/:lessonId/feedback', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const lessonId = assertString(req.params.lessonId, 'lessonId');
    const content = assertString(req.body?.content, 'content', { minLength: 3 });
    const rating = assertNumber(req.body?.rating, 'rating', { integer: true, min: 1, max: 5 });
    const visibility = assertEnum(req.body?.visibility, 'visibility', ['private', 'shared'], { optional: true }) || 'private';
    const feedback = await submitLessonFeedback(userId, lessonId, { content, rating, visibility });
    res.status(201).json({ feedback, message: 'Feedback submitted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

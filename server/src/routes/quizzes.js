const express = require('express');
const { getQuiz, submitQuiz } = require('../data/store');
const { authenticate } = require('../middleware/auth');
const { assertString, assertObject, assertNumber } = require('../utils/validation');

const router = express.Router();

router.use(authenticate());

router.get('/:quizId', async (req, res, next) => {
  try {
    const quizId = assertString(req.params.quizId, 'quizId');
    const quiz = await getQuiz(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json({ quiz });
  } catch (error) {
    next(error);
  }
});

router.post('/:quizId/submit', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const quizId = assertString(req.params.quizId, 'quizId');
    const answersPayload = assertObject(req.body?.answers || {}, 'answers');
    const sanitizedAnswers = Object.entries(answersPayload).reduce((acc, [questionId, choice]) => {
      acc[questionId] = assertNumber(choice, `answers.${questionId}`, { integer: true, min: 0 });
      return acc;
    }, {});
    const summary = await submitQuiz(userId, quizId, sanitizedAnswers);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

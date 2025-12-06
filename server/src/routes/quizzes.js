const express = require('express');
const { getQuiz, submitQuiz } = require('../data/db');
const { authenticate } = require('../middleware/auth');
const { assertString, assertObject, assertNumber } = require('../utils/validation');

const router = express.Router();

router.use(authenticate());

router.get('/:quizId', (req, res) => {
  const quizId = assertString(req.params.quizId, 'quizId');
  const quiz = getQuiz(quizId);
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  res.json({ quiz });
});

router.post('/:quizId/submit', (req, res, next) => {
  try {
    const quizId = assertString(req.params.quizId, 'quizId');
    const answersPayload = assertObject(req.body?.answers || {}, 'answers');
    const sanitizedAnswers = Object.entries(answersPayload).reduce((acc, [questionId, choice]) => {
      acc[questionId] = assertNumber(choice, `answers.${questionId}`, { integer: true, min: 0 });
      return acc;
    }, {});
    const summary = submitQuiz(req.user.id, quizId, sanitizedAnswers);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const {
  getInstructorStudio,
  createLessonDraft,
  updateLessonDraft,
  createQuizDraft,
  updateQuizDraft,
  getLessonFeedbackForInstructor,
  getInstructorWorkspaces,
  createWorkspace,
  addWorkspaceCollaborator,
  removeWorkspaceCollaborator,
  appendWorkspaceNote,
  findUserByEmail,
  createCategorySuggestion,
} = require('../data/store');
const { authenticate, requireInstructor } = require('../middleware/auth');
const { assertString, assertNumber } = require('../utils/validation');
const { AppError } = require('../utils/errors');

const router = express.Router();

router.use(authenticate());
router.use(requireInstructor);

function sanitizeBlocks(blocks) {
  if (blocks == null) {
    return [];
  }
  if (!Array.isArray(blocks)) {
    throw AppError.badRequest('blocks must be an array');
  }
  return blocks.map((block, index) => {
    if (!block || typeof block !== 'object') {
      throw AppError.badRequest(`blocks[${index}] must be an object`);
    }
    const heading = typeof block.heading === 'string' ? block.heading.trim() : '';
    const copy = typeof block.copy === 'string' ? block.copy.trim() : '';
    const code = typeof block.code === 'string' ? block.code : '';
    const list = Array.isArray(block.list)
      ? block.list.map((item, idx) => assertString(item, `blocks[${index}].list[${idx}]`, { optional: true }) || '').filter(Boolean)
      : [];
    return { heading, copy, code, list };
  });
}

function sanitizeChallenge(challenge) {
  if (!challenge) {
    return undefined;
  }
  if (typeof challenge !== 'object') {
    throw AppError.badRequest('challenge must be an object');
  }
  const prompt = assertString(challenge.prompt, 'challenge.prompt', { optional: true });
  const fields = Array.isArray(challenge.fields)
    ? challenge.fields
        .map((field, idx) => assertString(field, `challenge.fields[${idx}]`, { optional: true }) || '')
        .filter(Boolean)
    : [];
  if (!prompt && fields.length === 0) {
    return undefined;
  }
  return { prompt, fields };
}

function sanitizeQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw AppError.badRequest('questions must include at least one item');
  }
  return questions.map((question, index) => {
    if (!question || typeof question !== 'object') {
      throw AppError.badRequest(`questions[${index}] must be an object`);
    }
    const prompt = assertString(question.prompt, `questions[${index}].prompt`, { minLength: 3 });
    const options = Array.isArray(question.options)
      ? question.options.map((option, optIndex) => assertString(option, `questions[${index}].options[${optIndex}]`, { minLength: 1 }))
      : [];
    if (options.length < 2) {
      throw AppError.badRequest(`questions[${index}] must include at least two options`);
    }
    const answer = assertNumber(question.answer, `questions[${index}].answer`, {
      integer: true,
      min: 0,
      max: options.length - 1,
    });
    return {
      id: question.id || `q${index + 1}`,
      prompt,
      options,
      answer,
      explanation: typeof question.explanation === 'string' ? question.explanation : '',
      correctFeedback: typeof question.correctFeedback === 'string' ? question.correctFeedback : '',
      incorrectFeedback: typeof question.incorrectFeedback === 'string' ? question.incorrectFeedback : '',
    };
  });
}

router.get('/studio', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const studio = await getInstructorStudio(userId);
    res.json(studio);
  } catch (error) {
    next(error);
  }
});

router.get('/lessons/:lessonId/feedback', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const lessonId = assertString(req.params.lessonId, 'lessonId');
    const feedback = await getLessonFeedbackForInstructor(userId, lessonId);
    res.json({ feedback });
  } catch (error) {
    next(error);
  }
});

router.post('/lessons', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const title = assertString(req.body?.title, 'title', { minLength: 3 });
    const courseId = assertString(req.body?.courseId, 'courseId', { optional: true });
    const level = assertString(req.body?.level, 'level', { optional: true }) || 'Beginner';
    const duration = assertString(req.body?.duration, 'duration', { optional: true }) || '15 min read';
    const notes = assertString(req.body?.notes, 'notes', { optional: true });
    const blocks = sanitizeBlocks(req.body?.blocks);
    const challenge = sanitizeChallenge(req.body?.challenge);

    const lesson = await createLessonDraft(userId, {
      title,
      courseId,
      level,
      duration,
      blocks,
      challenge,
      notes,
    });

    res.status(201).json({ lesson, message: 'Lesson draft submitted for review' });
  } catch (error) {
    next(error);
  }
});

router.put('/lessons/:lessonId', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const lessonId = assertString(req.params.lessonId, 'lessonId');
    const payload = {};
    const title = assertString(req.body?.title, 'title', { optional: true });
    if (title) payload.title = title;
    const courseId = assertString(req.body?.courseId, 'courseId', { optional: true });
    if (courseId) payload.courseId = courseId;
    const level = assertString(req.body?.level, 'level', { optional: true });
    if (level) payload.level = level;
    const duration = assertString(req.body?.duration, 'duration', { optional: true });
    if (duration) payload.duration = duration;
    if (req.body?.blocks) {
      payload.blocks = sanitizeBlocks(req.body.blocks);
    }
    if (req.body?.challenge) {
      payload.challenge = sanitizeChallenge(req.body.challenge);
    }
    const notes = assertString(req.body?.notes, 'notes', { optional: true });
    if (notes) payload.notes = notes;

    const lesson = await updateLessonDraft(userId, lessonId, payload);
    res.json({ lesson, message: 'Lesson draft updated' });
  } catch (error) {
    next(error);
  }
});

router.post('/quizzes', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const title = assertString(req.body?.title, 'title', { minLength: 3 });
    const courseId = assertString(req.body?.courseId, 'courseId', { optional: true });
    const description = assertString(req.body?.description, 'description', { optional: true }) || '';
    const notes = assertString(req.body?.notes, 'notes', { optional: true });
    const questions = sanitizeQuestions(req.body?.questions);

    const quiz = await createQuizDraft(userId, {
      title,
      courseId,
      description,
      questions,
      notes,
    });

    res.status(201).json({ quiz, message: 'Quiz draft submitted for review' });
  } catch (error) {
    next(error);
  }
});

router.put('/quizzes/:quizId', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const quizId = assertString(req.params.quizId, 'quizId');
    const payload = {};
    const title = assertString(req.body?.title, 'title', { optional: true });
    if (title) payload.title = title;
    const courseId = assertString(req.body?.courseId, 'courseId', { optional: true });
    if (courseId) payload.courseId = courseId;
    const description = assertString(req.body?.description, 'description', { optional: true });
    if (description !== undefined) payload.description = description;
    if (req.body?.questions) {
      payload.questions = sanitizeQuestions(req.body.questions);
    }
    const notes = assertString(req.body?.notes, 'notes', { optional: true });
    if (notes) payload.notes = notes;

    const quiz = await updateQuizDraft(userId, quizId, payload);
    res.json({ quiz, message: 'Quiz draft updated' });
  } catch (error) {
    next(error);
  }
});

router.get('/workspaces', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const workspaces = await getInstructorWorkspaces(userId);
    res.json({ workspaces });
  } catch (error) {
    next(error);
  }
});

async function resolveCollaboratorIds(rawList = []) {
  const identifiers = Array.isArray(rawList) ? rawList : [];
  const collaboratorIds = [];
  for (const entry of identifiers) {
    const email = assertString(entry, 'collaborators[]', { email: true, lowercase: true });
    const user = await findUserByEmail(email);
    if (!user) {
      throw AppError.badRequest(`No account found for ${email}`);
    }
    collaboratorIds.push(user._id);
  }
  return collaboratorIds;
}

router.post('/workspaces', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const title = assertString(req.body?.title, 'title', { minLength: 3 });
    const lessonId = assertString(req.body?.lessonId, 'lessonId', { optional: true });
    const collaborators = await resolveCollaboratorIds(req.body?.collaborators);
    const notes = assertString(req.body?.notes, 'notes', { optional: true });
    const workspace = await createWorkspace(userId, {
      title,
      lessonId,
      memberIds: collaborators,
      notes,
    });
    res.status(201).json({ workspace, message: 'Workspace created' });
  } catch (error) {
    next(error);
  }
});

router.post('/workspaces/:workspaceId/collaborators', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const workspaceId = assertString(req.params.workspaceId, 'workspaceId');
    const email = assertString(req.body?.email, 'email', { email: true, lowercase: true });
    const collaborator = await findUserByEmail(email);
    if (!collaborator) {
      throw AppError.badRequest('Collaborator not found');
    }
    const workspace = await addWorkspaceCollaborator(userId, workspaceId, collaborator._id);
    res.json({ workspace, message: `${collaborator.name || email} added` });
  } catch (error) {
    next(error);
  }
});

router.delete('/workspaces/:workspaceId/collaborators/:memberId', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const workspaceId = assertString(req.params.workspaceId, 'workspaceId');
    const memberId = assertString(req.params.memberId, 'memberId');
    const workspace = await removeWorkspaceCollaborator(userId, workspaceId, memberId);
    res.json({ workspace, message: 'Collaborator removed' });
  } catch (error) {
    next(error);
  }
});

router.post('/workspaces/:workspaceId/threads', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const workspaceId = assertString(req.params.workspaceId, 'workspaceId');
    const body = assertString(req.body?.body, 'body', { minLength: 2 });
    const workspace = await appendWorkspaceNote(userId, workspaceId, body);
    res.json({ workspace, message: 'Note posted' });
  } catch (error) {
    next(error);
  }
});

router.post('/categories/suggestions', async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const name = assertString(req.body?.name, 'name', { minLength: 3 });
    const description = assertString(req.body?.description, 'description', { minLength: 10 });
    const suggestion = await createCategorySuggestion(userId, { name, description });
    res.status(201).json({ suggestion, message: 'Category suggestion submitted for review' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const { Types } = require('mongoose');

const {
  User,
  Course,
  Lesson,
  Quiz,
  Submission,
  ApprovalRequest,
  Topic,
  Recommendation,
  Activity,
  Progress,
} = require('../models');

function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const source = typeof user.toObject === 'function' ? user.toObject() : user;
  const { passwordHash, __v, _id, ...rest } = source;
  return {
    id: (_id || source.id || '').toString(),
    ...rest,
  };
}

async function findUserByEmail(email) {
  if (!email) return null;
  return User.findOne({ email: email.toLowerCase() }).exec();
}

async function findUserById(id) {
  if (!id) return null;
  return User.findById(id).exec();
}

async function createUser({ name, email, passwordHash }) {
  return User.create({ name, email: email.toLowerCase(), passwordHash, role: 'student', status: 'Active' });
}

async function ensureProgress(userId) {
  let doc = await Progress.findOne({ user: userId }).exec();
  if (!doc) {
    doc = await Progress.create({ user: userId });
  }
  return doc;
}

function normalizeProgress(progressDoc) {
  const completedLessons = new Set(progressDoc.completedLessons || []);
  const completedQuizzes = new Set(progressDoc.completedQuizzes || []);
  const completedCourses = new Set(progressDoc.completedCourses || []);
  const startedRecommendations = new Set(progressDoc.startedRecommendations || []);
  const lessonStates = new Map(
    (progressDoc.lessonStates || []).map((entry) => [entry.lessonId, { percent: entry.percent, bookmarked: entry.bookmarked }])
  );
  return {
    doc: progressDoc,
    completedLessons,
    completedQuizzes,
    completedCourses,
    startedRecommendations,
    lessonStates,
  };
}

function loadCourseWithUnits(filter) {
  return Course.findOne(filter).populate('lessons').populate('quizzes').lean();
}

async function fetchCourse(identifier) {
  if (!identifier) return null;
  let course = await loadCourseWithUnits({ legacyId: identifier });
  if (!course && Types.ObjectId.isValid(identifier)) {
    course = await loadCourseWithUnits({ _id: identifier });
  }
  return course;
}

async function resolveLessonByIdentifier(identifier) {
  if (!identifier) {
    return null;
  }
  let lesson = await Lesson.findOne({ legacyId: identifier }).populate('course').exec();
  if (!lesson && Types.ObjectId.isValid(identifier)) {
    lesson = await Lesson.findById(identifier).populate('course').exec();
  }
  return lesson;
}

function topicPayload(topicDoc) {
  return {
    id: topicDoc.legacyId ?? topicDoc._id.toString(),
    name: topicDoc.name,
    courses: topicDoc.courses,
    lessons: topicDoc.lessons,
    quizzes: topicDoc.quizzes,
  };
}

function recommendationPayload(recDoc, startedSet) {
  const id = recDoc.legacyId ?? recDoc._id.toString();
  return {
    id,
    label: recDoc.label,
    meta: recDoc.meta,
    lessons: recDoc.lessons,
    quizzes: recDoc.quizzes,
    started: startedSet.has(id),
  };
}

function categorySuggestionPayload(doc) {
  if (!doc) {
    return null;
  }
  const source = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: source._id?.toString() || source.id,
    name: source.name,
    description: source.description,
    status: source.status,
    submittedBy: source.submittedBy?.toString() || null,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
}

function activityPayload(activityDoc) {
  return {
    id: activityDoc._id.toString(),
    text: activityDoc.text,
    when: formatRelativeTime(activityDoc.createdAt) || activityDoc.when,
  };
}

function formatRelativeTime(date) {
  if (!date) return 'Just now';
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function mapUnitList(units, completionSet) {
  return (units || []).map((unit) => {
    const legacyId = unit.legacyId || unit.slug || unit._id.toString();
    return {
      id: legacyId,
      title: unit.title,
      done: completionSet.has(legacyId),
    };
  });
}

function buildCoursePayload(courseDoc, progressMeta) {
  const lessons = mapUnitList(courseDoc.lessons, progressMeta.completedLessons);
  const quizzes = mapUnitList(courseDoc.quizzes, progressMeta.completedQuizzes);
  const totalUnits = lessons.length + quizzes.length;
  const doneUnits = lessons.filter((lesson) => lesson.done).length + quizzes.filter((quiz) => quiz.done).length;
  const pct = totalUnits ? Math.round((doneUnits / totalUnits) * 100) : 0;
  return {
    id: courseDoc.legacyId || courseDoc._id.toString(),
    title: courseDoc.title,
    desc: courseDoc.desc || courseDoc.description,
    lessons,
    quizzes,
    pct,
  };
}

function buildStats(progressMeta, totalCourses = 12) {
  const completed = progressMeta.completedCourses.size;
  return {
    courses: `${completed}/${totalCourses}`,
    hours: `${120 + completed * 2}h`,
    certificates: 4 + Math.floor(completed / 2),
  };
}

async function getDashboard(userId) {
  const [coursesRaw, topicsRaw, recsRaw, activitiesRaw, progressDoc] = await Promise.all([
    Course.find({ status: { $ne: 'archived' } })
      .populate('lessons')
      .populate('quizzes')
      .lean(),
    Topic.find().lean(),
    Recommendation.find().lean(),
    Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(6).lean(),
    ensureProgress(userId),
  ]);

  const progressMeta = normalizeProgress(progressDoc);
  const courses = coursesRaw.map((course) => buildCoursePayload(course, progressMeta)).filter((course) => course.pct < 100);
  const topics = topicsRaw.map(topicPayload);
  const recommendations = recsRaw.map((rec) => recommendationPayload(rec, progressMeta.startedRecommendations));
  const activities = activitiesRaw.map(activityPayload);
  const stats = buildStats(progressMeta);

  return { courses, topics, recommendations, activities, stats };
}

async function pushActivity(userId, text) {
  await Activity.create({ user: userId, text, when: 'Just now' });
}

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

function assertLessonCollaboration(lessonDoc, userId) {
  const normalized = typeof userId === 'string' ? userId : userId.toString();
  const ownerId = lessonDoc.owner?.toString();
  const collaboratorIds = (lessonDoc.collaborators || []).map((collab) => collab.toString());
  if (ownerId === normalized || collaboratorIds.includes(normalized)) {
    return;
  }
  const err = new Error('You are not authorized to view this lesson feedback');
  err.status = 403;
  throw err;
}

function feedbackPayload(feedbackDoc) {
  const base = typeof feedbackDoc.toObject === 'function' ? feedbackDoc.toObject() : feedbackDoc;
  return {
    id: base._id?.toString() || base.id,
    content: base.content,
    rating: base.rating,
    visibility: base.visibility,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
    student: base.student
      ? {
          id: base.student._id?.toString() || base.student.id,
          name: base.student.name,
        }
      : null,
  };
}

async function markUnitComplete(userId, courseLegacyId, unitType, unitLegacyId) {
  const course = await fetchCourse(courseLegacyId);
  if (!course) {
    throw notFound('Course not found');
  }

  const targetCollection = unitType === 'lesson' ? course.lessons : course.quizzes;
  const target = (targetCollection || []).find((entry) => (entry.legacyId || entry._id.toString()) === unitLegacyId);
  if (!target) {
    throw notFound('Unit not found');
  }

  const progressDoc = await ensureProgress(userId);
  const progressMeta = normalizeProgress(progressDoc);
  const completedSet = unitType === 'lesson' ? progressMeta.completedLessons : progressMeta.completedQuizzes;
  if (completedSet.has(unitLegacyId)) {
    return { message: `${target.title} already completed`, activity: null };
  }

  completedSet.add(unitLegacyId);
  if (unitType === 'lesson') {
    const existing = progressMeta.lessonStates.get(unitLegacyId);
    if (existing) {
      existing.percent = 100;
      existing.bookmarked = existing.bookmarked ?? false;
    } else {
      progressDoc.lessonStates.push({ lessonId: unitLegacyId, percent: 100, bookmarked: false });
      progressMeta.lessonStates.set(unitLegacyId, { percent: 100, bookmarked: false });
    }
    progressDoc.completedLessons = Array.from(progressMeta.completedLessons);
  } else {
    progressDoc.completedQuizzes = Array.from(progressMeta.completedQuizzes);
  }

  const descriptor = unitType === 'lesson' ? 'Lesson' : 'Quiz';
  const activityText = `${descriptor} "${target.title}" in ${course.title}`;
  await pushActivity(userId, activityText);

  const totalLessons = (course.lessons || []).length;
  const totalQuizzes = (course.quizzes || []).length;
  const allLessonsDone = totalLessons === 0 || (course.lessons || []).every((lesson) => progressMeta.completedLessons.has(lesson.legacyId || lesson._id.toString()));
  const allQuizzesDone = totalQuizzes === 0 || (course.quizzes || []).every((quiz) => progressMeta.completedQuizzes.has(quiz.legacyId || quiz._id.toString()));

  if (allLessonsDone && allQuizzesDone && !progressMeta.completedCourses.has(courseLegacyId)) {
    progressMeta.completedCourses.add(courseLegacyId);
    progressDoc.completedCourses = Array.from(progressMeta.completedCourses);
    await pushActivity(userId, `${course.title} completed (all lessons & quizzes)`);
  }

  await progressDoc.save();

  return { message: `${descriptor} complete: ${target.title}`, activity: activityText };
}

async function continueCourse(userId, courseLegacyId) {
  const course = await fetchCourse(courseLegacyId);
  if (!course) {
    throw notFound('Course not found');
  }
  const progressDoc = await ensureProgress(userId);
  const progressMeta = normalizeProgress(progressDoc);

  const pendingLesson = (course.lessons || []).find((lesson) => !progressMeta.completedLessons.has(lesson.legacyId || lesson._id.toString()));
  if (pendingLesson) {
    return markUnitComplete(userId, courseLegacyId, 'lesson', pendingLesson.legacyId || pendingLesson._id.toString());
  }
  const pendingQuiz = (course.quizzes || []).find((quiz) => !progressMeta.completedQuizzes.has(quiz.legacyId || quiz._id.toString()));
  if (pendingQuiz) {
    return markUnitComplete(userId, courseLegacyId, 'quiz', pendingQuiz.legacyId || pendingQuiz._id.toString());
  }
  return { message: `${course.title} already completed`, activity: `${course.title} already complete` };
}

async function startRecommendation(userId, legacyId) {
  const recommendation = await Recommendation.findOne({ legacyId }).lean();
  if (!recommendation) {
    throw notFound('Recommendation not found');
  }
  const progressDoc = await ensureProgress(userId);
  if (!progressDoc.startedRecommendations.includes(legacyId)) {
    progressDoc.startedRecommendations.push(legacyId);
    await progressDoc.save();
    await pushActivity(userId, `Started recommended path: ${recommendation.label}`);
  }
  const payload = recommendationPayload(recommendation, new Set([recommendation.legacyId ?? recommendation._id]));
  payload.started = true;
  return payload;
}

async function getLesson(lessonLegacyId) {
  const lesson = await Lesson.findOne({ legacyId: lessonLegacyId }).populate('course').lean();
  if (!lesson) {
    return null;
  }
  return {
    id: lesson.legacyId,
    title: lesson.title,
    course: lesson.course?.title,
    breadcrumb: lesson.breadcrumb,
    duration: lesson.duration,
    level: lesson.level,
    order: lesson.order,
    blocks: lesson.blocks,
    challenge: lesson.challenge,
  };
}

async function getLessonProgress(userId, lessonLegacyId) {
  const progressDoc = await ensureProgress(userId);
  const progressMeta = normalizeProgress(progressDoc);
  return progressMeta.lessonStates.get(lessonLegacyId) || { percent: 25, bookmarked: false };
}

async function setLessonProgress(userId, lessonLegacyId, { percent, bookmarked }) {
  const progressDoc = await ensureProgress(userId);
  const existing = progressDoc.lessonStates.find((entry) => entry.lessonId === lessonLegacyId);
  if (existing) {
    existing.percent = percent;
    existing.bookmarked = bookmarked;
  } else {
    progressDoc.lessonStates.push({ lessonId: lessonLegacyId, percent, bookmarked });
  }
  await progressDoc.save();
  if (percent === 100) {
    const courseLegacyId = await findCourseLegacyIdByLesson(lessonLegacyId);
    if (courseLegacyId) {
      try {
        await markUnitComplete(userId, courseLegacyId, 'lesson', lessonLegacyId);
      } catch (error) {
        // ignore completion errors so progress update still succeeds
      }
    }
  }
  return { percent, bookmarked };
}

async function getLessonFeedbackForStudent(userId, lessonLegacyId) {
  const lesson = await resolveLessonByIdentifier(lessonLegacyId);
  if (!lesson) {
    throw notFound('Lesson not found');
  }
  const filters = {
    lesson: lesson._id,
    $or: [{ visibility: 'shared' }, { student: userId }],
  };
  const rows = await Feedback.find(filters)
    .populate('student', 'name')
    .sort({ createdAt: -1 })
    .lean();
  return rows.map(feedbackPayload);
}

async function getLessonFeedbackForInstructor(userId, lessonLegacyId) {
  const lesson = await resolveLessonByIdentifier(lessonLegacyId);
  if (!lesson) {
    throw notFound('Lesson not found');
  }
  assertLessonCollaboration(lesson, userId);
  const rows = await Feedback.find({ lesson: lesson._id })
    .populate('student', 'name')
    .sort({ createdAt: -1 })
    .lean();
  return rows.map(feedbackPayload);
}

async function submitLessonFeedback(userId, lessonLegacyId, { content, rating, visibility }) {
  const lesson = await resolveLessonByIdentifier(lessonLegacyId);
  if (!lesson) {
    throw notFound('Lesson not found');
  }
  const feedback = await Feedback.create({
    lesson: lesson._id,
    student: userId,
    content,
    rating,
    visibility: visibility || 'private',
  });
  const hydrated = await feedback.populate('student', 'name');
  return feedbackPayload(hydrated);
}

async function findCourseLegacyIdByLesson(lessonLegacyId) {
  const lesson = await Lesson.findOne({ legacyId: lessonLegacyId }).lean();
  if (!lesson || !lesson.course) return null;
  const course = await Course.findById(lesson.course).lean();
  return course?.legacyId || null;
}

async function getQuiz(quizLegacyId) {
  const quiz = await Quiz.findOne({ legacyId: quizLegacyId }).lean();
  if (!quiz) {
    return null;
  }
  return {
    id: quiz.legacyId,
    title: quiz.title,
    description: quiz.description,
    questions: quiz.questions,
  };
}

async function submitQuiz(userId, quizLegacyId, answers) {
  const quiz = await Quiz.findOne({ legacyId: quizLegacyId }).lean();
  if (!quiz) {
    throw notFound('Quiz not found');
  }
  const summary = quiz.questions.reduce(
    (acc, question) => {
      const response = Number(answers?.[question.id]);
      if (Number.isInteger(response)) {
        acc.attempted += 1;
        if (response === question.answer) {
          acc.correct += 1;
        } else {
          acc.incorrect += 1;
        }
      }
      return acc;
    },
    { attempted: 0, correct: 0, incorrect: 0 }
  );
  summary.accuracy = summary.attempted ? Math.round((summary.correct / summary.attempted) * 100) : 0;

  await Submission.create({
    user: userId,
    quiz: quiz._id,
    attempted: summary.attempted,
    correct: summary.correct,
    incorrect: summary.incorrect,
    accuracy: summary.accuracy,
    answers,
  });

  const courseLegacyId = await findCourseLegacyIdByQuiz(quizLegacyId, quiz.course);
  if (courseLegacyId) {
    await markUnitComplete(userId, courseLegacyId, 'quiz', quizLegacyId).catch(() => {});
  }

  return summary;
}

async function findCourseLegacyIdByQuiz(quizLegacyId, courseId) {
  if (courseId) {
    const course = await Course.findById(courseId).lean();
    if (course?.legacyId) {
      return course.legacyId;
    }
  }
  const quizDoc = await Quiz.findOne({ legacyId: quizLegacyId }).lean();
  if (!quizDoc?.course) return null;
  const course = await Course.findById(quizDoc.course).lean();
  return course?.legacyId || null;
}

async function getAdminUsers() {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return users.map(sanitizeUser);
}

async function updateUserStatus(userId, status) {
  const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).exec();
  if (!user) {
    throw notFound('User not found');
  }
  return sanitizeUser(user);
}

function approvalPayload(request, details = null) {
  return {
    id: request.legacyId ?? request._id.toString(),
    author: request.submittedBy?.name || 'Contributor',
    type: request.type === 'lesson' ? 'Lesson' : request.type === 'quiz' ? 'Quiz' : 'Category',
    submitted: formatRelativeTime(request.createdAt),
    status: request.status,
    details,
  };
}

async function getApprovals() {
  const requests = await ApprovalRequest.find({ status: 'pending' })
    .populate('submittedBy')
    .sort({ createdAt: -1 })
    .lean();
  const details = await Promise.all(requests.map(buildApprovalDetails));
  return requests.map((request, index) => approvalPayload(request, details[index]));
}

async function buildApprovalDetails(request) {
  if (!request) {
    return null;
  }
  try {
    if (request.type === 'lesson') {
      const lesson = await Lesson.findById(request.targetId).populate('course', 'title').lean();
      if (!lesson) return null;
      return {
        kind: 'lesson',
        title: lesson.title,
        status: lesson.status,
        course: lesson.course?.title || null,
        version: lesson.version,
      };
    }
    if (request.type === 'quiz') {
      const quiz = await Quiz.findById(request.targetId).populate('course', 'title').lean();
      if (!quiz) return null;
      return {
        kind: 'quiz',
        title: quiz.title,
        questions: quiz.questions?.length || 0,
        course: quiz.course?.title || null,
      };
    }
    if (request.type === 'category') {
      const suggestion = await CategorySuggestion.findById(request.targetId).lean();
      if (!suggestion) return null;
      return {
        kind: 'category',
        name: suggestion.name,
        description: suggestion.description,
      };
    }
  } catch (error) {
    // Swallow detail errors so approvals list still renders
    return null;
  }
  return null;
}

async function resolveApproval(identifier, decision, adminId) {
  let request = null;
  if (typeof identifier === 'number' && !Number.isNaN(identifier)) {
    request = await ApprovalRequest.findOne({ legacyId: identifier }).exec();
  }
  if (!request && Types.ObjectId.isValid(identifier)) {
    request = await ApprovalRequest.findById(identifier).exec();
  }
  if (!request) {
    request = await ApprovalRequest.findOne({ legacyId: identifier }).exec();
  }
  if (!request) {
    throw notFound('Approval request not found');
  }
  request.status = decision;
  request.history.push({ action: decision, by: adminId, note: `Marked as ${decision}` });
  await request.save();
  if (request.type === 'category') {
    await CategorySuggestion.findByIdAndUpdate(request.targetId, { status: decision }).exec();
  }
  return approvalPayload(await request.populate('submittedBy'));
}

function slugify(value = '') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'draft';
}

function generateLegacyId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

async function nextApprovalLegacyId() {
  const latest = await ApprovalRequest.findOne().sort({ legacyId: -1 }).lean();
  const baseline = Number.isFinite(latest?.legacyId) ? latest.legacyId : 1000;
  return baseline + 1;
}

async function createApprovalEntry({ type, targetModel, targetId, submittedBy, note }) {
  const legacyId = await nextApprovalLegacyId();
  const timestamp = new Date();
  return ApprovalRequest.create({
    legacyId,
    type,
    targetModel,
    targetId,
    submittedBy,
    status: 'pending',
    notes: note,
    history: [{ action: 'submitted', by: submittedBy, note: note || 'Awaiting review', at: timestamp }],
  });
}

async function resolveCourseByIdentifier(identifier) {
  if (!identifier) {
    return null;
  }
  let course = await Course.findOne({ legacyId: identifier }).exec();
  if (!course && Types.ObjectId.isValid(identifier)) {
    course = await Course.findById(identifier).exec();
  }
  if (!course) {
    throw notFound('Course not found');
  }
  return course;
}

async function createCategorySuggestion(userId, { name, description }) {
  const suggestion = await CategorySuggestion.create({
    name,
    description,
    submittedBy: userId,
    status: 'pending',
  });
  const approval = await createApprovalEntry({
    type: 'category',
    targetModel: 'CategorySuggestion',
    targetId: suggestion._id,
    submittedBy: userId,
    note: description || `New category: ${name}`,
  });
  suggestion.approvalRequest = approval._id;
  await suggestion.save();
  const hydrated = await CategorySuggestion.findById(suggestion._id).lean();
  return categorySuggestionPayload(hydrated);
}

function normalizeLessonBlocks(blocks = []) {
  if (!Array.isArray(blocks)) {
    return [];
  }
  return blocks.map((block) => ({
    heading: block.heading || '',
    copy: block.copy || '',
    code: block.code || '',
    list: Array.isArray(block.list) ? block.list : [],
  }));
}

function normalizeQuizQuestions(questions = []) {
  if (!Array.isArray(questions)) {
    return [];
  }
  return questions.map((question, index) => ({
    id: question.id || `q${index + 1}`,
    prompt: question.prompt || '',
    options: Array.isArray(question.options) ? question.options : [],
    answer: Number.isInteger(question.answer) ? question.answer : 0,
    explanation: question.explanation || '',
    correctFeedback: question.correctFeedback || '',
    incorrectFeedback: question.incorrectFeedback || '',
  }));
}

function instructorApprovalPayload(request) {
  return {
    id: request.legacyId ?? request._id.toString(),
    status: request.status,
    type: request.type,
    submittedAt: request.createdAt,
    notes: request.notes,
    history: (request.history || []).map((entry) => ({
      action: entry.action,
      at: entry.at || entry.createdAt,
      note: entry.note,
      by: entry.by ? entry.by.toString() : null,
    })),
  };
}

function lessonStudioPayload(lessonDoc) {
  const approval = lessonDoc.approvalRequest ? instructorApprovalPayload(lessonDoc.approvalRequest) : null;
  return {
    id: lessonDoc.legacyId,
    title: lessonDoc.title,
    status: lessonDoc.status,
    level: lessonDoc.level,
    duration: lessonDoc.duration,
    course: lessonDoc.course?.title || null,
    courseId: lessonDoc.course?.legacyId || lessonDoc.course?._id?.toString() || null,
    updatedAt: lessonDoc.updatedAt,
    blocks: lessonDoc.blocks || [],
    challenge: lessonDoc.challenge || null,
    approval,
  };
}

function quizStudioPayload(quizDoc) {
  const approval = quizDoc.approvalRequest ? instructorApprovalPayload(quizDoc.approvalRequest) : null;
  return {
    id: quizDoc.legacyId,
    title: quizDoc.title,
    status: quizDoc.status,
    course: quizDoc.course?.title || null,
    courseId: quizDoc.course?.legacyId || quizDoc.course?._id?.toString() || null,
    description: quizDoc.description || '',
    questions: quizDoc.questions || [],
    updatedAt: quizDoc.updatedAt,
    approval,
  };
}

function assertOwnership(ownerId, userId) {
  if (!ownerId || ownerId.toString() !== userId.toString()) {
    const err = new Error('You can only modify your own drafts');
    err.status = 403;
    throw err;
  }
}

async function getInstructorStudio(userId) {
  const [lessons, quizzes, approvals] = await Promise.all([
    Lesson.find({ owner: userId })
      .populate('course')
      .populate('approvalRequest')
      .sort({ updatedAt: -1 })
      .lean(),
    Quiz.find({ owner: userId })
      .populate('course')
      .populate('approvalRequest')
      .sort({ updatedAt: -1 })
      .lean(),
    ApprovalRequest.find({ submittedBy: userId })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return {
    lessons: lessons.map(lessonStudioPayload),
    quizzes: quizzes.map(quizStudioPayload),
    approvals: approvals.map(instructorApprovalPayload),
  };
}

async function createLessonDraft(userId, payload) {
  const course = payload.courseId ? await resolveCourseByIdentifier(payload.courseId) : null;
  const lesson = await Lesson.create({
    legacyId: payload.legacyId || generateLegacyId('lesson'),
    title: payload.title,
    slug: slugify(payload.title),
    course: course?._id,
    owner: userId,
    collaborators: [userId],
    level: payload.level || 'Beginner',
    duration: payload.duration || '15 min read',
    breadcrumb: payload.breadcrumb || (course ? ['Courses', course.title, payload.title] : ['Instructor', payload.title]),
    blocks: normalizeLessonBlocks(payload.blocks),
    challenge: payload.challenge || null,
    status: 'draft',
    categories: payload.categories || [],
  });
  const approval = await createApprovalEntry({
    type: 'lesson',
    targetModel: 'Lesson',
    targetId: lesson._id,
    submittedBy: userId,
    note: payload.notes,
  });
  lesson.approvalRequest = approval._id;
  await lesson.save();
  const hydrated = await Lesson.findById(lesson._id).populate('course').populate('approvalRequest').lean();
  return lessonStudioPayload(hydrated);
}

async function updateLessonDraft(userId, legacyId, payload) {
  const lesson = await Lesson.findOne({ legacyId }).exec();
  if (!lesson) {
    throw notFound('Lesson not found');
  }
  assertOwnership(lesson.owner, userId);
  const course = payload.courseId ? await resolveCourseByIdentifier(payload.courseId) : null;
  if (course) {
    lesson.course = course._id;
  }
  if (payload.title) {
    lesson.title = payload.title;
    lesson.slug = slugify(payload.title);
  }
  if (payload.level) {
    lesson.level = payload.level;
  }
  if (payload.duration) {
    lesson.duration = payload.duration;
  }
  if (payload.blocks) {
    lesson.blocks = normalizeLessonBlocks(payload.blocks);
  }
  if (payload.challenge) {
    lesson.challenge = payload.challenge;
  }
  lesson.status = 'draft';
  lesson.version = (lesson.version || 1) + 1;
  const approval = await createApprovalEntry({
    type: 'lesson',
    targetModel: 'Lesson',
    targetId: lesson._id,
    submittedBy: userId,
    note: payload.notes || 'Updated draft',
  });
  lesson.approvalRequest = approval._id;
  await lesson.save();
  const hydrated = await Lesson.findById(lesson._id).populate('course').populate('approvalRequest').lean();
  return lessonStudioPayload(hydrated);
}

async function createQuizDraft(userId, payload) {
  const course = payload.courseId ? await resolveCourseByIdentifier(payload.courseId) : null;
  const quiz = await Quiz.create({
    legacyId: payload.legacyId || generateLegacyId('quiz'),
    title: payload.title,
    description: payload.description,
    course: course?._id,
    owner: userId,
    collaborators: [userId],
    questions: normalizeQuizQuestions(payload.questions),
    status: 'draft',
  });
  const approval = await createApprovalEntry({
    type: 'quiz',
    targetModel: 'Quiz',
    targetId: quiz._id,
    submittedBy: userId,
    note: payload.notes,
  });
  quiz.approvalRequest = approval._id;
  await quiz.save();
  const hydrated = await Quiz.findById(quiz._id).populate('course').populate('approvalRequest').lean();
  return quizStudioPayload(hydrated);
}

async function updateQuizDraft(userId, legacyId, payload) {
  const quiz = await Quiz.findOne({ legacyId }).exec();
  if (!quiz) {
    throw notFound('Quiz not found');
  }
  assertOwnership(quiz.owner, userId);
  const course = payload.courseId ? await resolveCourseByIdentifier(payload.courseId) : null;
  if (course) {
    quiz.course = course._id;
  }
  if (payload.title) {
    quiz.title = payload.title;
  }
  if (payload.description !== undefined) {
    quiz.description = payload.description;
  }
  if (payload.questions) {
    quiz.questions = normalizeQuizQuestions(payload.questions);
  }
  quiz.status = 'draft';
  const approval = await createApprovalEntry({
    type: 'quiz',
    targetModel: 'Quiz',
    targetId: quiz._id,
    submittedBy: userId,
    note: payload.notes || 'Updated draft',
  });
  quiz.approvalRequest = approval._id;
  await quiz.save();
  const hydrated = await Quiz.findById(quiz._id).populate('course').populate('approvalRequest').lean();
  return quizStudioPayload(hydrated);
}

async function hydrateWorkspace(workspaceId) {
  return Workspace.findById(workspaceId)
    .populate('lesson', 'title legacyId')
    .populate('members', 'name email role')
    .populate('threads.author', 'name email role')
    .lean();
}

function assertWorkspaceMembership(workspaceDoc, userId) {
  const normalized = typeof userId === 'string' ? userId : userId.toString();
  const memberIds = (workspaceDoc.members || []).map((member) =>
    member?._id ? member._id.toString() : member.toString()
  );
  if (memberIds.includes(normalized)) {
    return;
  }
  const err = new Error('You are not a member of this workspace');
  err.status = 403;
  throw err;
}

function workspaceThreadPayload(entry) {
  if (!entry) {
    return null;
  }
  return {
    body: entry.body,
    createdAt: entry.createdAt,
    author: entry.author
      ? {
          id: entry.author._id?.toString() || entry.author.id,
          name: entry.author.name,
          email: entry.author.email,
        }
      : null,
  };
}

function workspacePayload(workspaceDoc) {
  const base = typeof workspaceDoc.toObject === 'function' ? workspaceDoc.toObject() : workspaceDoc;
  return {
    id: base._id?.toString() || base.id,
    title: base.title,
    lesson: base.lesson
      ? {
          id: base.lesson.legacyId || base.lesson._id?.toString(),
          title: base.lesson.title,
        }
      : null,
    notes: base.notes,
    members: (base.members || []).map((member) => ({
      id: member._id?.toString() || member.id,
      name: member.name,
      email: member.email,
      role: member.role,
    })),
    threads: (base.threads || [])
      .map((entry) => workspaceThreadPayload(entry))
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  };
}

async function getInstructorWorkspaces(userId) {
  const rows = await Workspace.find({ members: userId })
    .populate('lesson', 'title legacyId')
    .populate('members', 'name email role')
    .populate('threads.author', 'name email role')
    .sort({ updatedAt: -1 })
    .lean();
  return rows.map(workspacePayload);
}

async function createWorkspace(userId, { title, lessonId, memberIds = [], notes }) {
  const lesson = lessonId ? await resolveLessonByIdentifier(lessonId) : null;
  const normalizedMembers = new Set([userId.toString(), ...memberIds.map((id) => id.toString())]);
  const workspace = await Workspace.create({
    title,
    lesson: lesson?._id,
    createdBy: userId,
    members: Array.from(normalizedMembers).map((id) => new Types.ObjectId(id)),
    notes: notes || '',
  });
  const hydrated = await hydrateWorkspace(workspace._id);
  return workspacePayload(hydrated);
}

async function addWorkspaceCollaborator(requestorId, workspaceId, memberId) {
  const workspace = await Workspace.findById(workspaceId).exec();
  if (!workspace) {
    throw notFound('Workspace not found');
  }
  assertWorkspaceMembership(workspace, requestorId);
  const memberToken = memberId.toString();
  const alreadyMember = workspace.members.some((member) => member.toString() === memberToken);
  if (!alreadyMember) {
    workspace.members.push(new Types.ObjectId(memberId));
    workspace.updatedAt = new Date();
    await workspace.save();
  }
  const hydrated = await hydrateWorkspace(workspace._id);
  return workspacePayload(hydrated);
}

async function removeWorkspaceCollaborator(requestorId, workspaceId, memberId) {
  const workspace = await Workspace.findById(workspaceId).exec();
  if (!workspace) {
    throw notFound('Workspace not found');
  }
  assertWorkspaceMembership(workspace, requestorId);
  const normalized = memberId.toString();
  const nextMembers = workspace.members.filter((member) => member.toString() !== normalized);
  if (!nextMembers.length) {
    const err = new Error('A workspace must keep at least one member');
    err.status = 400;
    throw err;
  }
  workspace.members = nextMembers;
  workspace.updatedAt = new Date();
  await workspace.save();
  const hydrated = await hydrateWorkspace(workspace._id);
  return workspacePayload(hydrated);
}

async function appendWorkspaceNote(requestorId, workspaceId, body) {
  const workspace = await Workspace.findById(workspaceId).exec();
  if (!workspace) {
    throw notFound('Workspace not found');
  }
  assertWorkspaceMembership(workspace, requestorId);
  workspace.threads.push({ author: requestorId, body, createdAt: new Date() });
  workspace.updatedAt = new Date();
  await workspace.save();
  const hydrated = await hydrateWorkspace(workspace._id);
  return workspacePayload(hydrated);
}

module.exports = {
  sanitizeUser,
  findUserByEmail,
  findUserById,
  createUser,
  getDashboard,
  markUnitComplete,
  continueCourse,
  startRecommendation,
  getLesson,
  getLessonProgress,
  setLessonProgress,
  getLessonFeedbackForStudent,
  getLessonFeedbackForInstructor,
  submitLessonFeedback,
  getQuiz,
  submitQuiz,
  getAdminUsers,
  updateUserStatus,
  getApprovals,
  resolveApproval,
  createCategorySuggestion,
  getInstructorStudio,
  createLessonDraft,
  updateLessonDraft,
  createQuizDraft,
  updateQuizDraft,
  getInstructorWorkspaces,
  createWorkspace,
  addWorkspaceCollaborator,
  removeWorkspaceCollaborator,
  appendWorkspaceNote,
};

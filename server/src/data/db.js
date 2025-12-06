const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const hashPassword = (value) => bcrypt.hashSync(value, 10);

const basePassword = hashPassword('password123');

const users = [
  {
    id: 'u-admin',
    name: 'Admin',
    email: 'admin@gmail.com',
    role: 'admin',
    status: 'Active',
    passwordHash: basePassword,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-student',
    name: 'Student',
    email: 'student@gmail.com',
    role: 'student',
    status: 'Active',
    passwordHash: basePassword,
    createdAt: new Date().toISOString(),
  },
];

const courseSeed = [
  {
    id: 'course-js',
    title: 'JavaScript Fundamentals',
    desc: 'Chapter 5: Functions and Scope',
    lessons: [
      { id: 'js-l1', title: 'Function Basics' },
      { id: 'js-l2', title: 'Scope & Hoisting' },
      { id: 'js-l3', title: 'Arrow Functions' },
      { id: 'js-l4', title: 'Closures in Practice' },
    ],
    quizzes: [
      { id: 'js-q1', title: 'Functions Mid-check' },
      { id: 'js-q2', title: 'Scope Challenge' },
    ],
  },
  {
    id: 'course-ux',
    title: 'UI/UX Design Principles',
    desc: 'Module 3: Color Theory',
    lessons: [
      { id: 'ux-l1', title: 'Color Psychology' },
      { id: 'ux-l2', title: 'Contrast & Accessibility' },
      { id: 'ux-l3', title: 'Building Palettes' },
    ],
    quizzes: [
      { id: 'ux-q1', title: 'Palette Quiz' },
      { id: 'ux-q2', title: 'Accessibility Check' },
    ],
  },
  {
    id: 'course-be',
    title: 'Backend Foundations',
    desc: 'REST APIs and Databases',
    lessons: [
      { id: 'be-l1', title: 'RESTful Concepts' },
      { id: 'be-l2', title: 'Designing Endpoints' },
      { id: 'be-l3', title: 'Persistent Storage' },
    ],
    quizzes: [
      { id: 'be-q1', title: 'HTTP Status Quiz' },
    ],
  },
];

const topics = [
  { id: 1, name: 'Web Development', courses: 18, lessons: ['Modern HTML', 'Responsive Layouts', 'Intro to React'], quizzes: ['Flexbox', 'React Basics'] },
  { id: 2, name: 'Mobile Development', courses: 14, lessons: ['Flutter Widgets', 'SwiftUI Essentials'], quizzes: ['Layouts', 'Navigation'] },
  { id: 3, name: 'Data Science', courses: 21, lessons: ['Data Cleaning', 'Exploratory Analysis', 'Model Evaluation'], quizzes: ['Pandas', 'Probability'] },
  { id: 4, name: 'Design', courses: 16, lessons: ['Typography', 'Color Theory', 'Visual Hierarchy'], quizzes: ['Accessibility', 'Visual Tests'] },
  { id: 5, name: 'Cybersecurity', courses: 12, lessons: ['Threat Modeling', 'Secure Auth'], quizzes: ['OWASP Top 10'] },
  { id: 6, name: 'AI & ML', courses: 19, lessons: ['Supervised Learning', 'Model Deployment'], quizzes: ['ML Concepts', 'Bias Detection'] },
];

const recommendations = [
  {
    id: 1,
    label: 'React Advanced Patterns',
    meta: '4.8★ • 12h',
    lessons: ['Render Props', 'Compound Components'],
    quizzes: ['Hooks Deep Dive'],
  },
  {
    id: 2,
    label: 'Node.js Backend',
    meta: '4.9★ • 16h',
    lessons: ['API Hardening', 'Streaming'],
    quizzes: ['Event Loop', 'Scaling'],
  },
];

const baseActivities = [
  { id: 1, text: 'Completed "Arrays and Objects" lesson', when: '2 hours ago' },
  { id: 2, text: 'Earned "JavaScript Basics" certificate', when: '1 day ago' },
  { id: 3, text: 'Started "UI Design Fundamentals"', when: '3 days ago' },
];

const approvals = [
  { id: 1, author: 'Alex Kumar', type: 'Article', submitted: '2 hours ago' },
  { id: 2, author: 'Lisa Wong', type: 'Video', submitted: '4 hours ago' },
];

const lessons = {
  'lesson-js-variables': {
    id: 'lesson-js-variables',
    title: 'Variables and Data Types',
    course: 'JavaScript Fundamentals',
    breadcrumb: ['Courses', 'JavaScript Fundamentals', 'Variables and Data Types'],
    duration: '15 min read',
    level: 'Beginner',
    order: { current: 3, total: 12 },
    blocks: [
      {
        heading: 'Understanding Variables',
        copy: 'Variables store data values and can be declared using let, const, or var.',
        code: `let userName = "John Doe";\nconst userAge = 25;\nvar isActive = true;\nconsole.log(userName); // Output: John Doe`,
      },
      {
        heading: 'Primitive Types',
        list: ['String', 'Number', 'Boolean', 'Undefined', 'Null'],
      },
      {
        heading: 'Complex Types',
        list: ['Object', 'Array', 'Function', 'Date'],
      },
    ],
    challenge: {
      prompt: 'Create variables for a user profile including name, age, email, and active status.',
      fields: ['name', 'age', 'email', 'active'],
    },
  },
};

const quizzes = [
  {
    id: 'quiz-js-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    questions: [
      {
        id: 'q1',
        prompt: 'Which of the following is the correct way to declare a variable in JavaScript?',
        options: ['variable x = 10;', 'let x = 10;', 'x := 10;', 'declare x = 10;'],
        answer: 1,
        explanation: 'In JavaScript, use let/const/var. let is preferred for reassignable variables.',
        correctFeedback: 'Correct! "let" is a valid declaration keyword.',
        incorrectFeedback: 'Incorrect. Only let/const/var work in modern JavaScript.',
      },
      {
        id: 'q2',
        prompt: 'Which method converts JSON text into a JavaScript object?',
        options: ['JSON.stringify', 'JSON.parse', 'Object.fromJSON', 'JSON.toObject'],
        answer: 1,
        explanation: 'JSON.parse converts JSON strings into objects.',
        correctFeedback: 'Correct! JSON.parse reads JSON text and returns objects.',
        incorrectFeedback: 'Incorrect. JSON.stringify turns objects into strings, the opposite direction.',
      },
      {
        id: 'q3',
        prompt: 'What keyword declares a variable whose value cannot be reassigned?',
        options: ['let', 'var', 'const', 'static'],
        answer: 2,
        explanation: 'const creates a read-only binding to the value.',
        correctFeedback: 'Correct! const prevents reassignment of the binding.',
        incorrectFeedback: 'Incorrect. Remember that const locks the identifier to its initial value.',
      },
    ],
  },
];

const quizToCourseMap = {
  'quiz-js-fundamentals': { courseId: 'course-js', unitId: 'js-q1' },
};

const progressStore = new Map();
const recommendationStore = new Map();
const userActivityStore = new Map();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureProgress(userId) {
  if (!progressStore.has(userId)) {
    progressStore.set(userId, {
      lessons: new Set(),
      quizzes: new Set(),
      completedCourses: new Set(),
    });
  }
  return progressStore.get(userId);
}

function ensureRecommendationState(userId) {
  if (!recommendationStore.has(userId)) {
    recommendationStore.set(userId, new Set());
  }
  return recommendationStore.get(userId);
}

function ensureActivities(userId) {
  if (!userActivityStore.has(userId)) {
    userActivityStore.set(userId, [...baseActivities]);
  }
  return userActivityStore.get(userId);
}

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

function findUserByEmail(email) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function findUserById(id) {
  return users.find((user) => user.id === id);
}

function createUser({ name, email, passwordHash }) {
  const user = {
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'student',
    status: 'Active',
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

function buildCourse(course, progress) {
  const lessonsWithProgress = course.lessons.map((lesson) => ({
    ...lesson,
    done: progress.lessons.has(lesson.id),
  }));
  const quizzesWithProgress = course.quizzes.map((quiz) => ({
    ...quiz,
    done: progress.quizzes.has(quiz.id),
  }));
  const totalUnits = lessonsWithProgress.length + quizzesWithProgress.length;
  const doneUnits =
    lessonsWithProgress.filter((lesson) => lesson.done).length +
    quizzesWithProgress.filter((quiz) => quiz.done).length;
  const pct = totalUnits ? Math.round((doneUnits / totalUnits) * 100) : 0;
  return { ...course, lessons: lessonsWithProgress, quizzes: quizzesWithProgress, pct };
}

function getCoursesForUser(userId) {
  const progress = ensureProgress(userId);
  return courseSeed
    .map((course) => buildCourse(course, progress))
    .filter((course) => course.pct < 100);
}

function pushActivity(userId, text) {
  const list = ensureActivities(userId);
  const entry = { id: Date.now(), text, when: 'Just now' };
  list.unshift(entry);
  if (list.length > 6) {
    list.pop();
  }
  return entry;
}

function markUnitComplete(userId, courseId, unitType, unitId) {
  const course = courseSeed.find((c) => c.id === courseId);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  const collectionName = unitType === 'lesson' ? 'lessons' : 'quizzes';
  const source = course[collectionName];
  const target = source.find((item) => item.id === unitId);
  if (!target) {
    const err = new Error('Unit not found');
    err.status = 404;
    throw err;
  }
  const progress = ensureProgress(userId);
  const set = unitType === 'lesson' ? progress.lessons : progress.quizzes;
  if (set.has(unitId)) {
    return { message: `${target.title} already completed`, activity: null };
  }
  set.add(unitId);
  const built = buildCourse(course, progress);
  if (built.pct === 100) {
    progress.completedCourses.add(courseId);
    pushActivity(userId, `${course.title} completed (all lessons & quizzes)`);
    return { message: `${course.title} finished!`, activity: `${course.title} completed (all lessons & quizzes)` };
  }
  const descriptor = unitType === 'lesson' ? 'Lesson' : 'Quiz';
  const activity = `${descriptor} "${target.title}" in ${course.title}`;
  pushActivity(userId, activity);
  return { message: `${descriptor} complete: ${target.title}`, activity };
}

function continueCourse(userId, courseId) {
  const course = courseSeed.find((c) => c.id === courseId);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  const progress = ensureProgress(userId);
  const pendingLesson = course.lessons.find((lesson) => !progress.lessons.has(lesson.id));
  if (pendingLesson) {
    return markUnitComplete(userId, courseId, 'lesson', pendingLesson.id);
  }
  const pendingQuiz = course.quizzes.find((quiz) => !progress.quizzes.has(quiz.id));
  if (pendingQuiz) {
    return markUnitComplete(userId, courseId, 'quiz', pendingQuiz.id);
  }
  return { message: `${course.title} already completed`, activity: `${course.title} already complete` };
}

function startRecommendation(userId, recommendationId) {
  const rec = recommendations.find((item) => item.id === Number(recommendationId));
  if (!rec) {
    const err = new Error('Recommendation not found');
    err.status = 404;
    throw err;
  }
  const bag = ensureRecommendationState(userId);
  bag.add(rec.id);
  pushActivity(userId, `Started recommended path: ${rec.label}`);
  return rec;
}

function getRecommendationsForUser(userId) {
  const started = ensureRecommendationState(userId);
  return recommendations.map((rec) => ({ ...rec, started: started.has(rec.id) }));
}

function getDashboard(userId) {
  const courses = getCoursesForUser(userId);
  const stats = {
    courses: `${5 + (courseSeed.length - courses.length)}/${12}`,
    hours: `${120 + (courseSeed.length - courses.length) * 2}h`,
    certificates: 4 + Math.floor((courseSeed.length - courses.length) / 2),
  };
  return {
    courses,
    topics: clone(topics),
    recommendations: getRecommendationsForUser(userId),
    activities: clone(ensureActivities(userId)),
    stats,
  };
}

function getLesson(lessonId) {
  return lessons[lessonId] ? clone(lessons[lessonId]) : null;
}

function getQuiz(quizId) {
  const quiz = quizzes.find((q) => q.id === quizId);
  return quiz ? clone(quiz) : null;
}

function submitQuiz(userId, quizId, answers) {
  const quiz = quizzes.find((q) => q.id === quizId);
  if (!quiz) {
    const err = new Error('Quiz not found');
    err.status = 404;
    throw err;
  }
  const progress = ensureProgress(userId);
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
  quiz.questions.forEach((question) => {
    const response = Number(answers?.[question.id]);
    if (response === question.answer) {
      progress.quizzes.add(question.id);
    }
  });
  if (summary.correct === quiz.questions.length) {
    pushActivity(userId, `${quiz.title} quiz mastered`);
    const mapping = quizToCourseMap[quizId];
    if (mapping) {
      markUnitComplete(userId, mapping.courseId, 'quiz', mapping.unitId);
    }
  } else {
    pushActivity(userId, `${quiz.title} quiz attempted`);
  }
  return summary;
}

function getAdminUsers() {
  return users.map((user) => sanitizeUser(user));
}

function updateUserStatus(userId, status) {
  const user = findUserById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  user.status = status;
  return sanitizeUser(user);
}

function getApprovals() {
  return clone(approvals);
}

function resolveApproval(id) {
  const idx = approvals.findIndex((item) => item.id === Number(id));
  if (idx === -1) {
    const err = new Error('Approval item not found');
    err.status = 404;
    throw err;
  }
  const [removed] = approvals.splice(idx, 1);
  return removed;
}

module.exports = {
  users,
  findUserByEmail,
  findUserById,
  createUser,
  sanitizeUser,
  getDashboard,
  markUnitComplete,
  continueCourse,
  startRecommendation,
  getLesson,
  getQuiz,
  submitQuiz,
  getAdminUsers,
  updateUserStatus,
  getApprovals,
  resolveApproval,
};

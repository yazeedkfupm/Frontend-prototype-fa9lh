require('dotenv').config();

const bcrypt = require('bcryptjs');
const { connectMongo } = require('../config/mongo');
const {
  User,
  Course,
  Lesson,
  Quiz,
  Feedback,
  Workspace,
  CategorySuggestion,
  ApprovalRequest,
  Topic,
  Recommendation,
  Activity,
  Progress,
} = require('../models');

async function seed() {
  await connectMongo();

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Lesson.deleteMany({}),
    Quiz.deleteMany({}),
    Feedback.deleteMany({}),
    Workspace.deleteMany({}),
    CategorySuggestion.deleteMany({}),
    ApprovalRequest.deleteMany({}),
    Topic.deleteMany({}),
    Recommendation.deleteMany({}),
    Activity.deleteMany({}),
    Progress.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);

  const [admin, instructor, student] = await User.create([
    {
      name: 'Admin',
      email: 'admin@gmail.com',
      role: 'admin',
      status: 'Active',
      passwordHash,
    },
    {
      name: 'Instructor',
      email: 'instructor@gmail.com',
      role: 'instructor',
      status: 'Active',
      passwordHash,
    },
    {
      name: 'Student',
      email: 'student@gmail.com',
      role: 'student',
      status: 'Active',
      passwordHash,
    },
  ]);

  const course = await Course.create({
    legacyId: 'course-js',
    title: 'JavaScript Fundamentals',
    description: 'Chapter 5: Functions and Scope',
    desc: 'Chapter 5: Functions and Scope',
    level: 'Intermediate',
    durationMinutes: 180,
    topics: ['Web Development'],
    owners: [admin._id],
    status: 'published',
  });

  const lesson = await Lesson.create({
    legacyId: 'lesson-js-variables',
    title: 'Variables and Data Types',
    slug: 'variables-and-data-types',
    course: course._id,
    owner: instructor._id,
    collaborators: [admin._id],
    level: 'Beginner',
    duration: '15 min read',
    breadcrumb: ['Courses', 'JavaScript Fundamentals', 'Variables and Data Types'],
    order: { current: 3, total: 12 },
    blocks: [
      {
        heading: 'Understanding Variables',
        copy: 'Variables store data values and can be declared using let, const, or var.',
        code: 'let userName = "John Doe";',
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
    status: 'published',
  });

  const quiz = await Quiz.create({
    legacyId: 'quiz-js-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    course: course._id,
    owner: instructor._id,
    questions: [
      {
        id: 'q1',
        prompt: 'Which keyword declares a variable whose value cannot be reassigned?',
        options: ['let', 'var', 'const', 'static'],
        answer: 2,
        explanation: 'const creates a read-only binding.',
        correctFeedback: 'Correct! const prevents reassignment.',
        incorrectFeedback: 'Incorrect. Remember that const locks the identifier.',
      },
      {
        id: 'q2',
        prompt: 'Which method converts JSON text into a JavaScript object?',
        options: ['JSON.stringify', 'JSON.parse', 'Object.fromJSON', 'JSON.toObject'],
        answer: 1,
        explanation: 'JSON.parse converts JSON strings into objects.',
        correctFeedback: 'Correct! JSON.parse reads JSON text.',
        incorrectFeedback: 'Incorrect. JSON.stringify turns objects into strings.',
      },
    ],
    status: 'published',
  });

  course.lessons = [lesson._id];
  course.quizzes = [quiz._id];
  await course.save();

  const approval = await ApprovalRequest.create({
    legacyId: 1,
    type: 'lesson',
    targetModel: 'Lesson',
    targetId: lesson._id,
    submittedBy: instructor._id,
    status: 'approved',
    history: [
      { action: 'submitted', by: instructor._id, note: 'Initial content submission.' },
      { action: 'approved', by: admin._id, note: 'Looks great!' },
    ],
  });

  lesson.approvalRequest = approval._id;
  await lesson.save();

  await Feedback.create({
    lesson: lesson._id,
    student: student._id,
    content: 'Loved the clarity on primitives vs objects!',
    rating: 5,
    visibility: 'shared',
  });

  await Workspace.create({
    title: 'Lesson Enhancements',
    lesson: lesson._id,
    createdBy: instructor._id,
    members: [instructor._id, admin._id],
    notes: 'Track improvements for next release.',
    threads: [
      {
        author: instructor._id,
        body: 'Can we add a section on template literals?',
      },
      {
        author: admin._id,
        body: 'Yes, adding to backlog. Also cover let vs var edge cases.',
      },
    ],
  });

  await CategorySuggestion.create({
    name: 'AI Ethics',
    description: 'Content focused on responsible AI patterns.',
    submittedBy: instructor._id,
    status: 'pending',
  });

  await Topic.insertMany([
    { legacyId: 1, name: 'Web Development', courses: 18, lessons: ['Modern HTML', 'Responsive Layouts', 'Intro to React'], quizzes: ['Flexbox', 'React Basics'] },
    { legacyId: 2, name: 'Data Science', courses: 21, lessons: ['Data Cleaning', 'Model Evaluation'], quizzes: ['Probability'] },
  ]);

  await Recommendation.insertMany([
    { legacyId: 1, label: 'React Advanced Patterns', meta: '4.8★ • 12h', lessons: ['Render Props', 'Compound Components'], quizzes: ['Hooks Deep Dive'] },
    { legacyId: 2, label: 'Node.js Backend', meta: '4.9★ • 16h', lessons: ['API Hardening', 'Streaming'], quizzes: ['Event Loop'] },
  ]);

  await Activity.create({
    user: student._id,
    text: 'Completed "Arrays and Objects" lesson',
    when: '2 hours ago',
  });

  await Progress.create({
    user: student._id,
  });

  console.log('Mongo seed complete.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});

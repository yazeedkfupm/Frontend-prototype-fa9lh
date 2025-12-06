const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
  status: { type: String, enum: ['Active', 'Pending', 'Suspended'], default: 'Active' },
  avatarUrl: String,
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

const courseSchema = new Schema({
  legacyId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  summary: String,
  desc: String,
  level: { type: String, default: 'Beginner' },
  durationMinutes: { type: Number, default: 60 },
  topics: [{ type: String }],
  owners: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lessons: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    default: [],
  },
  quizzes: {
    type: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }],
    default: [],
  },
  status: { type: String, enum: ['draft', 'pending', 'published', 'archived'], default: 'published' },
}, { timestamps: true });

const lessonBlockSchema = new Schema({
  heading: String,
  copy: String,
  code: String,
  list: [{ type: String }],
}, { _id: false });

const lessonSchema = new Schema({
  legacyId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, index: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  level: String,
  duration: String,
  breadcrumb: [{ type: String }],
  order: {
    current: { type: Number, default: 1 },
    total: { type: Number, default: 1 },
  },
  blocks: [lessonBlockSchema],
  challenge: {
    prompt: String,
    fields: [{ type: String }],
  },
  status: { type: String, enum: ['draft', 'pending', 'published', 'rejected'], default: 'draft' },
  approvalRequest: { type: Schema.Types.ObjectId, ref: 'ApprovalRequest' },
  categories: [{ type: String }],
  version: { type: Number, default: 1 },
}, { timestamps: true });

const quizQuestionSchema = new Schema({
  id: { type: String, required: true },
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: Number, required: true },
  explanation: String,
  correctFeedback: String,
  incorrectFeedback: String,
}, { _id: false });

const quizSchema = new Schema({
  legacyId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  questions: [quizQuestionSchema],
  status: { type: String, enum: ['draft', 'pending', 'published', 'rejected'], default: 'draft' },
  approvalRequest: { type: Schema.Types.ObjectId, ref: 'ApprovalRequest' },
}, { timestamps: true });

const submissionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  attempted: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  incorrect: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  answers: Schema.Types.Mixed,
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const feedbackSchema = new Schema({
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  visibility: { type: String, enum: ['private', 'shared'], default: 'private' },
}, { timestamps: true });

const workspaceThreadSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  body: String,
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const workspaceSchema = new Schema({
  title: { type: String, required: true },
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  notes: String,
  threads: [workspaceThreadSchema],
}, { timestamps: true });

const categorySuggestionSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvalRequest: { type: Schema.Types.ObjectId, ref: 'ApprovalRequest' },
}, { timestamps: true });

const approvalHistorySchema = new Schema({
  action: { type: String, enum: ['submitted', 'approved', 'rejected', 'updated'], required: true },
  by: { type: Schema.Types.ObjectId, ref: 'User' },
  note: String,
  at: { type: Date, default: Date.now },
}, { _id: false });

const approvalRequestSchema = new Schema({
  legacyId: { type: Number, required: true, unique: true },
  type: { type: String, enum: ['lesson', 'quiz', 'category'], required: true },
  targetModel: { type: String, required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: String,
  history: [approvalHistorySchema],
}, { timestamps: true });

const topicSchema = new Schema({
  legacyId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  courses: { type: Number, default: 0 },
  lessons: [{ type: String }],
  quizzes: [{ type: String }],
}, { timestamps: true });

const recommendationSchema = new Schema({
  legacyId: { type: Number, required: true, unique: true },
  label: { type: String, required: true },
  meta: String,
  lessons: [{ type: String }],
  quizzes: [{ type: String }],
}, { timestamps: true });

const activitySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  when: { type: String, default: 'Just now' },
}, { timestamps: true });

const lessonStateSchema = new Schema({
  lessonId: { type: String, required: true },
  percent: { type: Number, default: 0 },
  bookmarked: { type: Boolean, default: false },
}, { _id: false });

const progressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  completedLessons: { type: [String], default: [] },
  completedQuizzes: { type: [String], default: [] },
  completedCourses: { type: [String], default: [] },
  lessonStates: { type: [lessonStateSchema], default: [] },
  startedRecommendations: { type: [Number], default: [] },
}, { timestamps: true });

module.exports = {
  User: model('User', userSchema),
  Course: model('Course', courseSchema),
  Lesson: model('Lesson', lessonSchema),
  Quiz: model('Quiz', quizSchema),
  Submission: model('Submission', submissionSchema),
  Feedback: model('Feedback', feedbackSchema),
  Workspace: model('Workspace', workspaceSchema),
  CategorySuggestion: model('CategorySuggestion', categorySuggestionSchema),
  ApprovalRequest: model('ApprovalRequest', approvalRequestSchema),
  Topic: model('Topic', topicSchema),
  Recommendation: model('Recommendation', recommendationSchema),
  Activity: model('Activity', activitySchema),
  Progress: model('Progress', progressSchema),
};

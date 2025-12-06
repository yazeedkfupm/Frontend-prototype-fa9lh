const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const lessonRoutes = require('./routes/lessons');
const quizRoutes = require('./routes/quizzes');
const adminRoutes = require('./routes/admin');
const instructorRoutes = require('./routes/instructor');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  const isJsonSyntaxError = err instanceof SyntaxError && err.type === 'entity.parse.failed';
  const status = err.status || (isJsonSyntaxError ? 400 : 500);
  const payload = {
    message: isJsonSyntaxError ? 'Invalid JSON payload' : (err.message || 'Internal server error'),
  };
  if (err.details) {
    payload.details = err.details;
  }
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
});

module.exports = app;

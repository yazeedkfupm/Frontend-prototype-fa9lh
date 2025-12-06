# Fa9lh — Full Front-End (CRA + Tailwind)

Title: Fa9lh — Learning Made Fast

Description: A responsive React application with the following high-level flows:

Authentication (Sign In / Sign Up UI)

Dashboard (continue learning, explore topics, progress & activity)

Lesson view (key concepts, code sample, try-it section, progress footer)

Quiz flow (question feedback, progress bar, summary tiles)

Admin console (overview metrics, user list, content approvals)

Dark mode toggle (persisted per user) — icon next to the Sign out button with auto detection of system preference

Instructor-focused additions now include a lesson feedback loop (students can rate/comment, instructors see the full feed), a shared workspace that lets multiple instructors collaborate on drafts with threaded notes, and a category suggestion workflow so instructors can propose new taxonomy entries for admin review.

Create React App (React 18, React Router 6)

Tailwind CSS via PostCSS

# Usage Instructions & Examples

- `npm start` – runs the React client on http://localhost:3000
- `npm run build` – builds the app to the build/ folder
- `npm test` – runs tests (add your tests under src/)
- `npm run api` – starts the REST API on http://localhost:4000 (runs from `/server`)

## Back-end Server

```bash
# install dependencies (only once)
cd server
npm install

# run development server with hot reload
npm run dev

# run production build (no nodemon)
npm start
```

Environment-specific overrides can be passed via a `.env` (loaded by your process manager) or inline when starting the server, e.g. `PORT=5000 JWT_SECRET=supersecret npm run dev`.

### Database (MongoDB)

1. Ensure MongoDB is running locally (default URI `mongodb://127.0.0.1:27017/fa9lh`).
2. Copy `server/.env.example` to `server/.env` and tweak values if you use a different cluster.
3. Seed the database (clears all collections, then inserts default users/content):

```bash
npm run seed
```

> Re-run the seed whenever you need a clean slate; it is safe because it wipes the collections first.

> Tip: keep one terminal running `npm run api` and another running `npm start` so the client always points at the live API.

Key Routes

/sign — Sign In / Sign Up tabs

/dashboard — user dashboard (cards, progress, recommendations)

/lesson — lesson details (content blocks + code sample)

/quiz — quiz flow (question with inline feedback)

/admin — admin panel (overview + approvals)

# Project Structure
src/
  components/
    Footer.jsx
    Navbar.jsx
    ProfileMenu.jsx
  context/
    AppContext.jsx
  pages/
    Admin.jsx
    Dashboard.jsx
    Lesson.jsx
    NotFound.jsx
    Quiz.jsx
    Sign.jsx
  App.js
  index.css
  index.js
tailwind.config.js
postcss.config.js

## Run
1. `npm install`
2. `cd server && npm install`
3. In terminal A run `npm run api`
4. In terminal B run `npm start`
5. Visit http://localhost:3000 (default API base: http://localhost:4000)

### Default Accounts
- Student: `student@gmail.com` / `password123`
- Admin: `admin@gmail.com` / `password123`
- Instructor: `instructor@gmail.com` / `password123`

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `4000` | Port for the Express API server. |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Comma-separated list of allowed CORS origins. |
| `JWT_SECRET` | `dev-secret` | Secret used to sign/verify access tokens. Set to a long, random value in production. |
| `REACT_APP_API_URL` | `http://localhost:4000` (frontend) | React client base URL for API requests. Must be prefixed with `REACT_APP_` to be embedded at build time. |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/fa9lh` | Connection string for MongoDB. |
| `MONGO_DB_NAME` | `fa9lh` | Optional override when sharing a cluster across projects. |

MongoDB is now required; run it before the API or the server will refuse to boot.

## REST API Overview
The Express API lives under `server/` and exposes the following authenticated routes (all prefixed with `/api`). The React app reads `REACT_APP_API_URL` (default `http://localhost:4000`) to know where to send requests.

| Area | Method & Path | Description |
| --- | --- | --- |
| Auth | `POST /auth/signup` | Create account, returns `{ user, token }` |
|  | `POST /auth/signin` | Login, returns `{ user, token }` |
|  | `GET /auth/me` | Validate token & fetch profile |
| Dashboard | `GET /dashboard` | Courses, topics, recommendations, activity, stats |
|  | `POST /dashboard/courses/:courseId/progress` | Mark lesson/quiz complete |
|  | `POST /dashboard/courses/:courseId/continue` | Auto-complete next pending unit |
|  | `POST /dashboard/recommendations/:id/start` | Track recommendation start |
| Lessons | `GET /lessons/:lessonId` | Retrieve lesson content + progress |
|  | `POST /lessons/:lessonId/progress` | Persist lesson bookmark/progress |
|  | `GET /lessons/:lessonId/feedback` | List shared feedback for the authenticated learner |
|  | `POST /lessons/:lessonId/feedback` | Submit rating/comments for a lesson |
| Quizzes | `GET /quizzes/:quizId` | Fetch quiz questions/explanations |
|  | `POST /quizzes/:quizId/submit` | Score answers and update progress |
| Instructor | `GET /instructor/lessons/:id/feedback` | Instructors fetch all lesson feedback they own/collaborate on |
|  | `GET /instructor/workspaces` | List shared workspaces the instructor belongs to |
|  | `POST /instructor/workspaces` | Create a workspace tied to a lesson and invite collaborators |
|  | `POST /instructor/workspaces/:id/collaborators` | Invite another instructor via email |
|  | `DELETE /instructor/workspaces/:id/collaborators/:memberId` | Remove a collaborator from a workspace |
|  | `POST /instructor/workspaces/:id/threads` | Append a collaboration note/comment thread |
|  | `POST /instructor/categories/suggestions` | Submit a new category proposal for approval |
| Admin | `GET /admin/users` | List users (admin only) |
|  | `PATCH /admin/users/:id` | Update user status |
|  | `GET /admin/approvals` | Pending content submissions |
|  | `POST /admin/approvals/:id/decision` | Approve or reject content |

### Request & Response Shapes

#### Auth
- **POST `/api/auth/signup`**
  - Request: `{ "name": "Student", "email": "user@example.com", "password": "secret123" }`
  - Response: `201` with `{ "user": {id,name,email,role,...}, "token": "<jwt>" }`
- **POST `/api/auth/signin`**
  - Request: `{ "email": "user@example.com", "password": "secret123" }`
  - Response: `200` with `{ "user": {...}, "token": "<jwt>" }`
- **GET `/api/auth/me`**
  - Headers: `Authorization: Bearer <jwt>`
  - Response: `200` with `{ "user": {...} }`

#### Dashboard
- **GET `/api/dashboard`** → returns `{ courses, topics, recommendations, activities, stats }` tailored to the authenticated user.
- **POST `/api/dashboard/courses/:courseId/progress`**
  - Request body: `{ "unitType": "lesson" | "quiz", "unitId": "js-l1" }`
  - Response: `200` with `{ message, dashboard }` reflecting updated progress.

#### Lessons
- **GET `/api/lessons/:lessonId`** → `{ lesson, progress }`
- **POST `/api/lessons/:lessonId/progress`**
  - Body: `{ "percent": 45, "bookmarked": true }`
  - Response: `{ "progress": { percent, bookmarked }, "message": "Progress updated" }`

#### Quizzes
- **GET `/api/quizzes/:quizId`** → `{ quiz }`
- **POST `/api/quizzes/:quizId/submit`**
  - Body: `{ "answers": { "q1": 1, "q2": 3 } }`
  - Response: `{ "summary": { attempted, correct, incorrect, accuracy } }`

#### Admin (requires `role=admin`)
- **GET `/api/admin/users`** → `{ users: [...] }`
- **PATCH `/api/admin/users/:id`**
  - Body: `{ "status": "Active" | "Pending" | "Suspended" }`
  - Response: `{ user }`
- **GET `/api/admin/approvals`** → `{ approvals: [...] }`
- **POST `/api/admin/approvals/:id/decision`**
  - Body: `{ "decision": "approved" | "rejected" }`
  - Response: `{ item, message }`

## Notes
- UI now hydrates from the API for auth, dashboard data, lesson content, quiz scoring, and admin workflows.
- All REST endpoints perform input validation and return consistent HTTP status codes/details on failure.
- Dark mode preference is stored in localStorage (`fa9lh:theme`) and also respects `prefers-color-scheme` on first load.

Team Members & Roles

Ali Almatrook — 202267500 — Front-End / UI Integration / QA

Yazeed Almutairi — 202164390 —  Front-End Lead / UI Integration / Routing & State 

Ali Alqatari — 202279780 — Documentation / Accessibility & Testing

# Fa9lh — Full Front-End (CRA + Tailwind)

Title: Fa9lh — Learning Made Fast

Description: A responsive React application with the following high-level flows:

Authentication (Sign In / Sign Up UI)

Dashboard (continue learning, explore topics, progress & activity)

Lesson view (key concepts, code sample, try-it section, progress footer)

Quiz flow (question feedback, progress bar, summary tiles)

Admin console (overview metrics, user list, content approvals)

Dark mode toggle (persisted per user) — icon next to the Sign out button with auto detection of system preference

Create React App (React 18, React Router 6)

Tailwind CSS via PostCSS

# Usage Instructions & Examples

npm start – runs the app in development mode on http://localhost:3000

npm run build – builds the app to the build/ folder

npm test – runs tests (add your tests under src/)

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
2. `npm start` -> http://localhost:3000

## Notes
- Static UI with light interactivity for demos (quiz selection, progress visuals).
- Dark mode preference is stored in localStorage (`fa9lh:theme`) and also respects `prefers-color-scheme` on first load.

Team Members & Roles

Ali Almatrook — 202267500 — Front-End / UI Integration / QA

Yazeed Almutairi — 202164390 —  Front-End Lead / UI Integration / Routing & State 

Ali Alqatari — 202279780 — Documentation / Accessibility & Testing

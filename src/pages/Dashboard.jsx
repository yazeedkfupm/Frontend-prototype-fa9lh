import { useEffect, useMemo, useState } from "react";

const courseSeed = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    desc: "Chapter 5: Functions and Scope",
    lessons: [
      { id: "js-l1", title: "Function Basics", done: true },
      { id: "js-l2", title: "Scope & Hoisting", done: true },
      { id: "js-l3", title: "Arrow Functions", done: true },
      { id: "js-l4", title: "Closures in Practice", done: false },
    ],
    quizzes: [
      { id: "js-q1", title: "Functions Mid-check", done: false },
      { id: "js-q2", title: "Scope Challenge", done: true },
    ],
  },
  {
    id: 2,
    title: "UI/UX Design Principles",
    desc: "Module 3: Color Theory",
    lessons: [
      { id: "ux-l1", title: "Color Psychology", done: true },
      { id: "ux-l2", title: "Contrast & Accessibility", done: false },
      { id: "ux-l3", title: "Building Palettes", done: false },
    ],
    quizzes: [
      { id: "ux-q1", title: "Palette Quiz", done: false },
      { id: "ux-q2", title: "Accessibility Check", done: false },
    ],
  },
  {
    id: 3,
    title: "Backend Foundations",
    desc: "REST APIs and Databases",
    lessons: [
      { id: "be-l1", title: "RESTful Concepts", done: true },
      { id: "be-l2", title: "Designing Endpoints", done: false },
      { id: "be-l3", title: "Persistent Storage", done: false },
    ],
    quizzes: [
      { id: "be-q1", title: "HTTP Status Quiz", done: false },
    ],
  },
];

const topicSeed = [
  {
    id: 1,
    name: "Web Development",
    courses: 18,
    lessons: ["Modern HTML", "Responsive Layouts", "Intro to React"],
    quizzes: ["Flexbox", "React Basics"],
  },
  {
    id: 2,
    name: "Mobile Development",
    courses: 14,
    lessons: ["Flutter Widgets", "SwiftUI Essentials"],
    quizzes: ["Layouts", "Navigation"],
  },
  {
    id: 3,
    name: "Data Science",
    courses: 21,
    lessons: ["Data Cleaning", "Exploratory Analysis", "Model Evaluation"],
    quizzes: ["Pandas", "Probability"],
  },
  {
    id: 4,
    name: "Design",
    courses: 16,
    lessons: ["Typography", "Color Theory", "Visual Hierarchy"],
    quizzes: ["Accessibility", "Visual Tests"],
  },
  {
    id: 5,
    name: "Cybersecurity",
    courses: 12,
    lessons: ["Threat Modeling", "Secure Auth"],
    quizzes: ["OWASP Top 10"],
  },
  {
    id: 6,
    name: "AI & ML",
    courses: 19,
    lessons: ["Supervised Learning", "Model Deployment"],
    quizzes: ["ML Concepts", "Bias Detection"],
  },
];

const recommendationsSeed = [
  {
    id: 1,
    label: "React Advanced Patterns",
    meta: "4.8★ • 12h",
    lessons: ["Render Props", "Compound Components"],
    quizzes: ["Hooks Deep Dive"],
    started: false,
  },
  {
    id: 2,
    label: "Node.js Backend",
    meta: "4.9★ • 16h",
    lessons: ["API Hardening", "Streaming"],
    quizzes: ["Event Loop", "Scaling"],
    started: false,
  },
];

const activitySeed = [
  { id: 1, text: "Completed \"Arrays and Objects\" lesson", when: "2 hours ago" },
  { id: 2, text: "Earned \"JavaScript Basics\" certificate", when: "1 day ago" },
  { id: 3, text: "Started \"UI Design Fundamentals\"", when: "3 days ago" },
];

const TOTAL_TRACKED_COURSES = 12;
const BASE_COMPLETED = 5;

const withProgress = (course) => {
  const totalUnits = course.lessons.length + course.quizzes.length;
  const doneUnits =
    course.lessons.filter((lesson) => lesson.done).length +
    course.quizzes.filter((quiz) => quiz.done).length;
  const pct = totalUnits ? Math.round((doneUnits / totalUnits) * 100) : 0;
  return { ...course, pct };
};

export default function Dashboard() {
  const [courses, setCourses] = useState(courseSeed.map(withProgress));
  const [activeTopicId, setActiveTopicId] = useState(topicSeed[0].id);
  const [recommendations, setRecommendations] = useState(recommendationsSeed);
  const [activities, setActivities] = useState(activitySeed);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!notification) return;
    const id = setTimeout(() => setNotification(null), 2200);
    return () => clearTimeout(id);
  }, [notification]);

  const activeTopic = useMemo(
    () => topicSeed.find((topic) => topic.id === activeTopicId),
    [activeTopicId]
  );

  const overallProgress = useMemo(() => {
    if (!courses.length) return 100;
    const totalPct = courses.reduce((sum, course) => sum + course.pct, 0);
    return Math.round(totalPct / courses.length);
  }, [courses]);

  const stats = useMemo(() => {
    const completedVisible = courseSeed.length - courses.length;
    const completed = BASE_COMPLETED + completedVisible;
    return {
      courses: `${completed}/${TOTAL_TRACKED_COURSES}`,
      hours: `${120 + completed * 2}h`,
      certificates: 4 + Math.floor(completed / 2),
    };
  }, [courses.length]);

  function logActivity(text) {
    setActivities((prev) =>
      [{ id: Date.now(), text, when: "Just now" }, ...prev].slice(0, 6)
    );
  }

  function pushNotification(message) {
    setNotification({ message, id: Date.now() });
  }

  // Handles marking a lesson/quiz complete and calculates resulting progress.
  function applyCourseUnit(course, unitType, unitId) {
    const collectionName = unitType === "lesson" ? "lessons" : "quizzes";
    const sourceList = course[collectionName];
    const target = sourceList.find((item) => item.id === unitId);
    if (!target || target.done) {
      return { course, message: null, log: null };
    }
    const updatedCourse = {
      ...course,
      [collectionName]: sourceList.map((item) =>
        item.id === unitId ? { ...item, done: true } : item
      ),
    };
    const totalUnits = updatedCourse.lessons.length + updatedCourse.quizzes.length;
    const doneUnits =
      updatedCourse.lessons.filter((lesson) => lesson.done).length +
      updatedCourse.quizzes.filter((quiz) => quiz.done).length;
    updatedCourse.pct = Math.round((doneUnits / totalUnits) * 100);
    if (doneUnits === totalUnits) {
      return {
        course: null,
        message: `${course.title} finished!`,
        log: `${course.title} completed (all lessons & quizzes)`,
      };
    }
    const descriptor = unitType === "lesson" ? "Lesson complete" : "Quiz complete";
    const logDescriptor = unitType === "lesson" ? "Finished lesson" : "Completed quiz";
    return {
      course: updatedCourse,
      message: `${descriptor}: ${target.title}`,
      log: `${logDescriptor} "${target.title}" in ${course.title}`,
    };
  }

  function mutateCourse(courseId, unitType, unitId) {
    let message = null;
    let log = null;
    setCourses((prev) =>
      prev.flatMap((course) => {
        if (course.id !== courseId) return [course];
        const result = applyCourseUnit(course, unitType, unitId);
        if (!message && result.message) message = result.message;
        if (!log && result.log) log = result.log;
        return result.course ? [result.course] : [];
      })
    );
    if (message) pushNotification(message);
    if (log) logActivity(log);
  }

  function handleContinue(courseId) {
    setCourses((prev) =>
      prev.flatMap((course) => {
        if (course.id !== courseId) return [course];
        const pendingLesson = course.lessons.find((lesson) => !lesson.done);
        const pendingQuiz = pendingLesson
          ? null
          : course.quizzes.find((quiz) => !quiz.done);
        const target = pendingLesson || pendingQuiz;
        if (!target) {
          pushNotification(`${course.title} already completed`);
          logActivity(`${course.title} already complete`);
          return [];
        }
        const result = applyCourseUnit(
          course,
          pendingLesson ? "lesson" : "quiz",
          target.id
        );
        if (result.message) pushNotification(result.message);
        if (result.log) logActivity(result.log);
        return result.course ? [result.course] : [];
      })
    );
  }

  function handleViewAll() {
    const pending = courses.filter((c) => c.pct < 100).length;
    const message = pending
      ? `${pending} courses still in progress`
      : "Great! All courses completed";
    pushNotification(message);
    logActivity(message);
  }

  function selectTopic(topicId) {
    setActiveTopicId(topicId);
    const topic = topicSeed.find((t) => t.id === topicId);
    if (topic) {
      pushNotification(`${topic.name} resources loaded`);
      logActivity(`Viewing ${topic.name} resources`);
    }
  }

  function handleTopicResource(topic, kind, title) {
    const label = kind === "lesson" ? "Lesson" : "Quiz";
    pushNotification(`${label} ready: ${title}`);
    logActivity(`${label} "${title}" opened in ${topic.name}`);
  }

  function startRecommendation(id) {
    let startedLabel = null;
    setRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;
        startedLabel = rec.label;
        return { ...rec, started: true };
      })
    );
    if (startedLabel) {
      pushNotification(`${startedLabel} added to plan`);
      logActivity(`Started recommended path: ${startedLabel}`);
    }
  }

  function handleRecommendationResource(recId, kind, title) {
    const rec = recommendations.find((item) => item.id === recId);
    if (!rec) return;
    const label = kind === "lesson" ? "Lesson" : "Quiz";
    pushNotification(`${rec.label}: ${title}`);
    logActivity(`${label} "${title}" from ${rec.label}`);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
      {notification && (
        <div className="fixed top-4 right-4 z-20 rounded-md bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {notification.message}
        </div>
      )}
      <div className="lg:col-span-2 space-y-6">
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Continue Learning</h2>
            <button className="text-sm underline" onClick={handleViewAll}>
              View all
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {courses.map((c) => (
              <div key={c.id} className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-lg bg-gray-100 grid place-items-center dark:bg-gray-800">
                    {"</>"}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-sm text-gray-600">{c.desc}</div>
                    <div className="mt-2 h-2 rounded bg-gray-200 overflow-hidden dark:bg-gray-800">
                      <div className="h-full bg-black dark:bg-white" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                  <button className="btn btn-ghost" onClick={() => handleContinue(c.id)}>
                    Continue
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs uppercase text-gray-500">Lessons</div>
                    <ul className="mt-1 space-y-1">
                      {c.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center justify-between">
                          <span>{lesson.title}</span>
                          {lesson.done ? (
                            <span className="text-xs text-green-600">Done</span>
                          ) : (
                            <button
                              className="text-xs underline"
                              onClick={() => mutateCourse(c.id, "lesson", lesson.id)}
                            >
                              Start
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-gray-500">Quizzes</div>
                    <ul className="mt-1 space-y-1">
                      {c.quizzes.map((quiz) => (
                        <li key={quiz.id} className="flex items-center justify-between">
                          <span>{quiz.title}</span>
                          {quiz.done ? (
                            <span className="text-xs text-green-600">Done</span>
                          ) : (
                            <button
                              className="text-xs underline"
                              onClick={() => mutateCourse(c.id, "quiz", quiz.id)}
                            >
                              Take
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                All caught up! 🎉
              </div>
            )}
          </div>
        </section>

        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Explore Topics</h2>
            <button
              className="text-sm underline"
              onClick={() => pushNotification("Topic library opening soon")}
            >
              Browse all
            </button>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topicSeed.map((t) => (
              <button
                key={t.id}
                className={`border rounded-xl p-4 flex items-center gap-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 ${
                  activeTopicId === t.id
                    ? "border-black bg-gray-50 dark:border-white/70 dark:bg-gray-800"
                    : ""
                }`}
                onClick={() => selectTopic(t.id)}
              >
                <span className="h-8 w-8 rounded-lg bg-gray-100 grid place-items-center dark:bg-gray-800">📚</span>
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-gray-600">{t.courses} courses</div>
                </div>
              </button>
            ))}
          </div>
          {activeTopic && (
            <div className="mt-4 rounded-xl border p-4">
              <div className="font-semibold">{activeTopic.name} resources</div>
              <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs uppercase text-gray-500">Lessons</div>
                  <ul className="mt-1 space-y-1">
                    {activeTopic.lessons.map((lesson) => (
                      <li key={lesson} className="flex items-center justify-between">
                        <span>{lesson}</span>
                        <button
                          className="text-xs underline"
                          onClick={() => handleTopicResource(activeTopic, "lesson", lesson)}
                        >
                          Open
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500">Quizzes</div>
                  <ul className="mt-1 space-y-1">
                    {activeTopic.quizzes.map((quiz) => (
                      <li key={quiz} className="flex items-center justify-between">
                        <span>{quiz}</span>
                        <button
                          className="text-xs underline"
                          onClick={() => handleTopicResource(activeTopic, "quiz", quiz)}
                        >
                          Take
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card p-4">
          <h2 className="font-semibold mb-3">Your Progress</h2>
          <div className="text-center">
            <div className="mx-auto h-24 w-24 rounded-full border-8 border-dashed grid place-items-center">
              {overallProgress}%
            </div>
            <div className="mt-2 text-sm text-gray-700">Overall Progress</div>
            <div className="mt-3 grid grid-cols-3 text-xs gap-2">
              <div>
                <div className="font-semibold">{stats.courses}</div>
                <div className="text-gray-500">Courses</div>
              </div>
              <div>
                <div className="font-semibold">{stats.hours}</div>
                <div className="text-gray-500">Hours</div>
              </div>
              <div>
                <div className="font-semibold">{stats.certificates}</div>
                <div className="text-gray-500">Certificates</div>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold mb-3">Recent Activity</h2>
          <ul className="space-y-2 text-sm">
            {activities.map((activity) => (
              <li key={activity.id}>• {activity.text} — {activity.when}</li>
            ))}
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold mb-3">Recommended</h2>
          {recommendations.map((rec) => (
            <div key={rec.id} className="border rounded-lg p-3 mb-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{rec.label}</div>
                  <div className="text-xs text-gray-600">{rec.meta}</div>
                </div>
                <button
                  className="btn btn-ghost"
                  onClick={() => startRecommendation(rec.id)}
                  disabled={rec.started}
                >
                  {rec.started ? "Added" : "Start"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs uppercase text-gray-500">Lessons</div>
                  <ul className="mt-1 space-y-1">
                    {rec.lessons.map((lesson) => (
                      <li key={lesson} className="flex items-center justify-between">
                        <span>{lesson}</span>
                        <button
                          className="text-xs underline"
                          onClick={() => handleRecommendationResource(rec.id, "lesson", lesson)}
                        >
                          Open
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500">Quizzes</div>
                  <ul className="mt-1 space-y-1">
                    {rec.quizzes.map((quiz) => (
                      <li key={quiz} className="flex items-center justify-between">
                        <span>{quiz}</span>
                        <button
                          className="text-xs underline"
                          onClick={() => handleRecommendationResource(rec.id, "quiz", quiz)}
                        >
                          Take
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}

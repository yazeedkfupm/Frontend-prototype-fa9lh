import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";

export default function Dashboard() {
  const { api } = useApp();
  const [data, setData] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionPending, setActionPending] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await api("/dashboard");
      setData(payload);
      setActiveTopicId((prev) => prev ?? payload.topics?.[0]?.id ?? null);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!notification) return;
    const id = setTimeout(() => setNotification(null), 2200);
    return () => clearTimeout(id);
  }, [notification]);

  const courses = data?.courses || [];
  const topics = data?.topics || [];
  const recommendations = data?.recommendations || [];
  const activities = data?.activities || [];
  const stats = data?.stats || { courses: "0/0", hours: "0h", certificates: 0 };

  const activeTopic = useMemo(
    () => topics.find((topic) => topic.id === activeTopicId),
    [topics, activeTopicId]
  );

  const overallProgress = useMemo(() => {
    if (!courses.length) return 100;
    const totalPct = courses.reduce((sum, course) => sum + course.pct, 0);
    return Math.round(totalPct / courses.length);
  }, [courses]);

  function pushNotification(message){
    setNotification({ message, id: Date.now() });
  }

  async function mutateCourse(courseId, unitType, unitId){
    setActionPending(true);
    try {
      const response = await api(`/dashboard/courses/${courseId}/progress`, {
        method: "POST",
        body: { unitType, unitId },
      });
      setData(response.dashboard);
      pushNotification(response.message || "Progress updated");
    } catch (err) {
      pushNotification(err.message || "Unable to update course");
    } finally {
      setActionPending(false);
    }
  }

  async function handleContinue(courseId){
    setActionPending(true);
    try {
      const response = await api(`/dashboard/courses/${courseId}/continue`, { method: "POST" });
      setData(response.dashboard);
      pushNotification(response.message || "Course updated");
    } catch (err) {
      pushNotification(err.message || "Unable to continue course");
    } finally {
      setActionPending(false);
    }
  }

  function handleViewAll(){
    const pending = courses.filter((course) => course.pct < 100).length;
    const message = pending
      ? `${pending} courses still in progress`
      : "Great! All courses completed";
    pushNotification(message);
  }

  function selectTopic(topicId){
    setActiveTopicId(topicId);
    const topic = topics.find((t) => t.id === topicId);
    if (topic){
      pushNotification(`${topic.name} resources loaded`);
    }
  }

  function handleTopicResource(topic, kind, title){
    const label = kind === "lesson" ? "Lesson" : "Quiz";
    pushNotification(`${label} ready: ${title}`);
  }

  async function startRecommendation(id){
    setActionPending(true);
    try {
      const response = await api(`/dashboard/recommendations/${id}/start`, { method: "POST" });
      setData(response.dashboard);
      pushNotification(response.message || "Recommendation added");
    } catch (err) {
      pushNotification(err.message || "Unable to start recommendation");
    } finally {
      setActionPending(false);
    }
  }

  function handleRecommendationResource(recId, kind, title){
    const rec = recommendations.find((item) => item.id === recId);
    if (!rec) return;
    const label = kind === "lesson" ? "Lesson" : "Quiz";
    pushNotification(`${rec.label}: ${title}`);
  }

  if (loading){
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center text-sm text-gray-500">
        Loading your dashboard…
      </div>
    );
  }

  if (error){
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-red-600">{error}</p>
        <button className="btn mt-4" onClick={loadDashboard}>Retry</button>
      </div>
    );
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
                  <button
                    className="btn btn-ghost"
                    onClick={() => handleContinue(c.id)}
                    disabled={actionPending}
                  >
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
                              disabled={actionPending}
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
                              disabled={actionPending}
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
            {topics.length === 0 ? (
              <div className="col-span-full rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">
                Topic catalog coming soon
              </div>
            ) : (
              topics.map((t) => (
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
              ))
            )}
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
                  disabled={rec.started || actionPending}
                >
                  {rec.started ? "Added" : actionPending ? "Working…" : "Start"}
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

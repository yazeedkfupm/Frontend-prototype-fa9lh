import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const LESSON_ID = "lesson-js-variables";

export default function Lesson() {
  const navigate = useNavigate();
  const { api, user } = useApp();
  const [bookmark, setBookmark] = useState(false);
  const [challenge, setChallenge] = useState({ name: "", age: "", email: "", active: false });
  const [challengeResult, setChallengeResult] = useState(null);
  const [progress, setProgress] = useState(25);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, content: "", visibility: "shared" });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const loadLesson = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api(`/lessons/${LESSON_ID}`);
      setLesson(response.lesson);
      setProgress(response.progress?.percent ?? 25);
      setBookmark(Boolean(response.progress?.bookmarked));
    } catch (err) {
      setError(err.message || "Failed to load lesson");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  const loadFeedback = useCallback(async () => {
    setFeedbackLoading(true);
    setFeedbackError(null);
    try {
      const response = await api(`/lessons/${LESSON_ID}/feedback`);
      setFeedback(response.feedback || []);
    } catch (err) {
      setFeedbackError(err.message || "Failed to load feedback");
    } finally {
      setFeedbackLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const persistProgress = useCallback(async (nextProgress, nextBookmark) => {
    try {
      await api(`/lessons/${LESSON_ID}/progress`, {
        method: "POST",
        body: { percent: nextProgress, bookmarked: nextBookmark },
      });
    } catch (err) {
      // keep UI responsive even if persistence fails
      console.error(err);
    }
  }, [api]);

  function toggleBookmark(){
    setBookmark((prev) => {
      const next = !prev;
      persistProgress(progress, next);
      return next;
    });
  }

  function handleChallengeChange(evt){
    const { name, value, type, checked } = evt.target;
    setChallenge((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function runChallenge(){
    if (!challenge.name || !challenge.email) {
      setChallengeResult({ kind: "error", message: "Please fill name and email." });
      return;
    }
    const summary = `const user = { name: "${challenge.name}", age: ${challenge.age || '"?"'}, email: "${challenge.email}", active: ${challenge.active} };`;
    setChallengeResult({ kind: "success", message: summary });
  }

  function handleProgress(delta){
    setProgress((prev) => {
      const next = Math.max(0, Math.min(100, prev + delta));
      persistProgress(next, bookmark);
      return next;
    });
  }

  function handleFeedbackField(field, value) {
    setFeedbackForm((prev) => ({
      ...prev,
      [field]: field === "rating" ? Number(value) : value,
    }));
  }

  async function handleFeedbackSubmit(event) {
    event.preventDefault();
    if (!feedbackForm.content.trim()) {
      setFeedbackError("Share a quick note before submitting");
      return;
    }
    setFeedbackSubmitting(true);
    setFeedbackError(null);
    try {
      await api(`/lessons/${LESSON_ID}/feedback`, {
        method: "POST",
        body: {
          content: feedbackForm.content.trim(),
          rating: Number(feedbackForm.rating) || 5,
          visibility: feedbackForm.visibility,
        },
      });
      setFeedbackForm({ rating: 5, content: "", visibility: feedbackForm.visibility });
      await loadFeedback();
    } catch (err) {
      setFeedbackError(err.message || "Unable to submit feedback");
    } finally {
      setFeedbackSubmitting(false);
    }
  }

  const feedbackList = useMemo(() => feedback || [], [feedback]);

  const renderFeedbackStatus = () => {
    if (feedbackLoading) {
      return <div className="text-sm text-gray-500">Loading feedback…</div>;
    }
    if (feedbackError) {
      return (
        <div className="text-sm text-red-600">
          {feedbackError}
          <button className="ml-2 underline" type="button" onClick={loadFeedback}>Retry</button>
        </div>
      );
    }
    if (!feedbackList.length) {
      return <div className="text-sm text-gray-500">Be the first to share how this lesson felt.</div>;
    }
    return null;
  };

  if (loading){
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        Loading lesson…
      </div>
    );
  }

  if (error){
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <p className="text-red-600">{error}</p>
        <button className="btn mt-4" onClick={loadLesson}>Retry</button>
      </div>
    );
  }

  if (!lesson){
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
      <nav className="text-sm text-gray-600">
        {lesson.breadcrumb.join(" › ")} › <span className="text-gray-900">{lesson.title}</span>
      </nav>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <span className="text-xs border rounded-full px-2 py-1">Lesson {lesson.order.current} of {lesson.order.total}</span>
      </div>
      <div className="text-sm text-gray-600 mt-1">{lesson.duration} • {lesson.level}</div>

      <section className="mt-6 card p-4">
        {lesson.blocks.map((block, index) => (
          <div key={index} className="mb-6 last:mb-0">
            <h2 className="font-semibold mb-2">{block.heading}</h2>
            {block.copy && <p>{block.copy}</p>}
            {block.code && (
              <div className="mt-4">
                <div className="text-xs text-gray-600 mb-1">Code Example</div>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto">
{block.code}
                </pre>
              </div>
            )}
            {block.list && (
              <ul className="mt-4 text-sm list-disc ml-5 space-y-1">
                {block.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <div className="mt-6 card p-6 bg-gray-800 text-gray-100 text-center">
          <div className="text-lg">Variable Declaration Flowchart</div>
          <div className="text-xs opacity-75">Interactive diagram placeholder</div>
        </div>

        <div className="mt-6 card p-4">
          <div className="font-semibold">Try It Yourself</div>
          <p className="text-sm text-gray-600">Practice declaring variables with different data types.</p>
          <div className="mt-3 border rounded-md p-3 text-sm bg-gray-50">
            Challenge: {lesson.challenge.prompt}
          </div>
          <form className="mt-4 grid sm:grid-cols-2 gap-4 text-sm" onSubmit={(e)=>e.preventDefault()}>
            <label className="block">
              <span className="text-xs uppercase text-gray-500">Name</span>
              <input name="name" value={challenge.name} onChange={handleChallengeChange} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2" placeholder="John" />
            </label>
            <label className="block">
              <span className="text-xs uppercase text-gray-500">Age</span>
              <input name="age" value={challenge.age} onChange={handleChallengeChange} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2" placeholder="25" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs uppercase text-gray-500">Email</span>
              <input name="email" value={challenge.email} onChange={handleChallengeChange} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2" placeholder="john@example.com" />
            </label>
            <label className="inline-flex items-center gap-2 text-xs uppercase text-gray-500">
              <input type="checkbox" name="active" checked={challenge.active} onChange={handleChallengeChange} />
              Active user
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <button type="button" className="btn btn-primary" onClick={runChallenge}>Run code</button>
              <button type="button" className="btn" onClick={()=>setChallenge({ name:"", age:"", email:"", active:false })}>Reset</button>
            </div>
          </form>
          {challengeResult && (
            <div className={`mt-4 rounded-lg border p-3 text-sm ${challengeResult.kind==='error' ? 'border-red-200 text-red-700 bg-red-50' : 'border-green-200 text-green-700 bg-green-50'}`}>
              <div className="font-semibold mb-1">Output</div>
              <code className="block break-words">{challengeResult.message}</code>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button className="btn" onClick={()=>handleProgress(-5)}>← Previous Lesson</button>
          <div className="flex gap-2">
            <button className="btn" onClick={toggleBookmark}>{bookmark ? 'Bookmarked ✓' : 'Bookmark'}</button>
            <button className="btn btn-primary" onClick={()=>navigate('/quiz')}>Take Quiz →</button>
          </div>
        </div>
      </section>

      <section className="mt-6 card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Student Feedback</h2>
            <p className="text-sm text-gray-500">Share your takeaways so instructors can iterate faster.</p>
          </div>
          <button className="btn btn-ghost text-xs" type="button" onClick={loadFeedback} disabled={feedbackLoading}>
            Refresh
          </button>
        </div>
        <form className="space-y-3" onSubmit={handleFeedbackSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="text-xs uppercase text-gray-500">Rating</span>
              <select
                className="input mt-1"
                value={feedbackForm.rating}
                onChange={(event) => handleFeedbackField("rating", event.target.value)}
              >
                {[5, 4, 3, 2, 1].map((score) => (
                  <option key={score} value={score}>{score} — {score === 5 ? "Loved it" : score === 1 ? "Needs work" : ""}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="text-xs uppercase text-gray-500">Visibility</span>
              <select
                className="input mt-1"
                value={feedbackForm.visibility}
                onChange={(event) => handleFeedbackField("visibility", event.target.value)}
              >
                <option value="shared">Share with instructors</option>
                <option value="private">Keep between us</option>
              </select>
            </label>
          </div>
          <textarea
            className="input min-h-[96px]"
            placeholder="What clicked? What should change?"
            value={feedbackForm.content}
            onChange={(event) => handleFeedbackField("content", event.target.value)}
          />
          <div className="flex items-center gap-3 text-sm">
            <button className="btn btn-primary" type="submit" disabled={feedbackSubmitting}>
              {feedbackSubmitting ? "Sending…" : "Submit feedback"}
            </button>
            <span className="text-gray-500">Signed in as {user?.name || "student"}</span>
          </div>
        </form>
        <div className="mt-6 space-y-3 max-h-80 overflow-auto">
          {renderFeedbackStatus()}
          {!feedbackLoading && !feedbackError && feedbackList.map((entry) => (
            <article key={entry.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{entry.student?.name || "Anonymous"}</div>
                  <div className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</div>
                </div>
                <span className="text-xs rounded-full bg-gray-100 px-2 py-1">{entry.rating}/5</span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{entry.content}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="fixed left-0 right-0 bottom-0 bg-white border-t">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-sm">Progress:</span>
          <div className="flex-1 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-black rounded" style={{width:`${progress}%`}} />
          </div>
          <span className="text-sm">{progress}%</span>
          <button className="ml-auto btn btn-primary" onClick={()=>handleProgress(5)}>Continue Learning</button>
        </div>
      </div>
    </div>
  );
}

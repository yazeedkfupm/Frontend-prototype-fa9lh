import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const LESSON_ID = "lesson-js-variables";

export default function Lesson() {
  const navigate = useNavigate();
  const { api } = useApp();
  const [bookmark, setBookmark] = useState(false);
  const [challenge, setChallenge] = useState({ name: "", age: "", email: "", active: false });
  const [challengeResult, setChallengeResult] = useState(null);
  const [progress, setProgress] = useState(25);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="max-w-3xl mx-auto px-4 py-6">
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

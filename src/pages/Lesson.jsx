import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Lesson() {
  const navigate = useNavigate();
  const [bookmark, setBookmark] = useState(false);
  const [challenge, setChallenge] = useState({ name: "", age: "", email: "", active: false });
  const [challengeResult, setChallengeResult] = useState(null);
  const [progress, setProgress] = useState(25);

  const lessonMeta = useMemo(() => ({
    current: 3,
    total: 12,
  }), []);

  function toggleBookmark(){
    setBookmark((prev) => !prev);
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
    setProgress((prev) => Math.max(0, Math.min(100, prev + delta)));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-600">Courses › JavaScript Fundamentals › <span className="text-gray-900">Variables and Data Types</span></nav>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Variables and Data Types</h1>
        <span className="text-xs border rounded-full px-2 py-1">Lesson {lessonMeta.current} of {lessonMeta.total}</span>
      </div>
      <div className="text-sm text-gray-600 mt-1">15 min read • Beginner</div>

      <section className="mt-6 card p-4">
        <h2 className="font-semibold mb-2">Understanding Variables</h2>
        <p>Variables store data values and can be declared using <code>let</code>, <code>const</code>, or <code>var</code>.</p>
        <div className="mt-4">
          <div className="text-xs text-gray-600 mb-1">Code Example</div>
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto">
{`let userName = "John Doe";
const userAge = 25;
var isActive = true;
console.log(userName); // Output: John Doe`}
          </pre>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="card p-3">
            <div className="font-medium mb-1">Primitive Types</div>
            <ul className="text-sm list-disc ml-5">
              <li>String</li><li>Number</li><li>Boolean</li><li>Undefined</li><li>Null</li>
            </ul>
          </div>
          <div className="card p-3">
            <div className="font-medium mb-1">Complex Types</div>
            <ul className="text-sm list-disc ml-5">
              <li>Object</li><li>Array</li><li>Function</li><li>Date</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 card p-6 bg-gray-800 text-gray-100 text-center">
          <div className="text-lg">Variable Declaration Flowchart</div>
          <div className="text-xs opacity-75">Interactive diagram placeholder</div>
        </div>

        <div className="mt-6 card p-4">
          <div className="font-semibold">Try It Yourself</div>
          <p className="text-sm text-gray-600">Practice declaring variables with different data types.</p>
          <div className="mt-3 border rounded-md p-3 text-sm bg-gray-50">
            Challenge: Create variables for a user profile including name, age, email, and active status.
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

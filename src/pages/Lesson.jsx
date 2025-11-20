export default function Lesson() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <nav className="text-sm text-gray-600">Courses › JavaScript Fundamentals › <span className="text-gray-900">Variables and Data Types</span></nav>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Variables and Data Types</h1>
        <span className="text-xs border rounded-full px-2 py-1">Lesson 3 of 12</span>
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
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button className="btn">← Previous Lesson</button>
          <div className="flex gap-2">
            <button className="btn">Bookmark</button>
            <button className="btn btn-primary">Take Quiz →</button>
          </div>
        </div>
      </section>

      <div className="fixed left-0 right-0 bottom-0 bg-white border-t">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <span className="text-sm">Progress:</span>
          <div className="flex-1 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-black rounded" style={{width:'25%'}} />
          </div>
          <span className="text-sm">25%</span>
          <button className="ml-auto btn btn-primary">Continue Learning</button>
        </div>
      </div>
    </div>
  );
}

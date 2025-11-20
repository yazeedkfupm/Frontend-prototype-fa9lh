export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Continue Learning</h2>
            <button className="text-sm underline">View all</button>
          </div>
          <div className="mt-4 space-y-3">
            {[
              {title:'JavaScript Fundamentals', desc:'Chapter 5: Functions and Scope', pct:65},
              {title:'UI/UX Design Principles', desc:'Module 3: Color Theory', pct:42}
            ].map((c,i)=>(
              <div key={i} className="rounded-lg border p-3 flex items-center gap-3">
                <span className="h-10 w-10 rounded-lg bg-gray-100 grid place-items-center">{"</>"}</span>
                <div className="flex-1">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-gray-600">{c.desc}</div>
                  <div className="mt-2 h-2 rounded bg-gray-200 overflow-hidden">
                    <div className="h-full bg-black" style={{width:`${c.pct}%`}}/>
                  </div>
                </div>
                <button className="btn btn-ghost">Continue</button>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Explore Topics</h2>
            <button className="text-sm underline">Browse all</button>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {['Web Development','Mobile Development','Data Science','Design','Cybersecurity','AI & ML'].map((t,i)=>(
              <div key={i} className="border rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50">
                <span className="h-8 w-8 rounded-lg bg-gray-100 grid place-items-center">📚</span>
                <div>
                  <div className="font-medium">{t}</div>
                  <div className="text-xs text-gray-600">{Math.floor(Math.random()*20)+10} courses</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card p-4">
          <h2 className="font-semibold mb-3">Your Progress</h2>
          <div className="text-center">
            <div className="mx-auto h-24 w-24 rounded-full border-8 border-dashed grid place-items-center">72%</div>
            <div className="mt-2 text-sm text-gray-700">Overall Progress</div>
            <div className="mt-3 grid grid-cols-3 text-xs gap-2">
              <div><div className="font-semibold">8/12</div><div className="text-gray-500">Courses</div></div>
              <div><div className="font-semibold">124h</div><div className="text-gray-500">Hours</div></div>
              <div><div className="font-semibold">5</div><div className="text-gray-500">Certificates</div></div>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold mb-3">Recent Activity</h2>
          <ul className="space-y-2 text-sm">
            <li>• Completed "Arrays and Objects" lesson — 2 hours ago</li>
            <li>• Earned "JavaScript Basics" certificate — 1 day ago</li>
            <li>• Started "UI Design Fundamentals" — 3 days ago</li>
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="font-semibold mb-3">Recommended</h2>
          {['React Advanced Patterns','Node.js Backend'].map((t,i)=>(
            <div key={i} className="border rounded-lg p-3 flex items-center justify-between mb-2">
              <div>
                <div className="font-medium">{t}</div>
                <div className="text-xs text-gray-600">{i? '4.9★ • 16h':'4.8★ • 12h'}</div>
              </div>
              <button className="btn btn-ghost">Start</button>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}

export default function Admin() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[240px,1fr] gap-6">
      <aside className="card p-3">
        <div className="font-semibold mb-3">Dashboard</div>
        <nav className="space-y-1 text-sm">
          <a className="block px-3 py-2 rounded hover:bg-gray-50">Overview</a>
          <a className="block px-3 py-2 rounded hover:bg-gray-50">User Management</a>
          <a className="block px-3 py-2 rounded hover:bg-gray-50">Content Approval</a>
          <a className="block px-3 py-2 rounded hover:bg-gray-50">Analytics</a>
          <div className="mt-4 text-xs text-gray-500 uppercase">System</div>
          <a className="block px-3 py-2 rounded hover:bg-gray-50">Settings</a>
          <a className="block px-3 py-2 rounded hover:bg-gray-50">Security</a>
        </nav>
      </aside>

      <main className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, approve content, and monitor system performance</p>
        </div>

        <section className="grid md:grid-cols-4 gap-3">
          {[
            {label:'Total Users', value:'12,847', sub:'+12% from last month'},
            {label:'Pending Content', value:'248', sub:'+5% from yesterday'},
            {label:'Reports', value:'23', sub:'+3 new reports'},
            {label:'Server Status', value:'Online', sub:'99.9% uptime'},
          ].map((m,i)=>(
            <div key={i} className="card p-4">
              <div className="text-sm text-gray-500">{m.label}</div>
              <div className="text-2xl font-semibold">{m.value}</div>
              <div className="text-xs text-gray-500 mt-1">{m.sub}</div>
            </div>
          ))}
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Recent Users</h2>
              <button className="btn btn-ghost text-xs">View All</button>
            </div>
            <div className="space-y-2 text-sm">
              {['Sarah Johnson','Mike Chen','Emma Davis'].map((n,i)=>(
                <div key={i} className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-gray-200 grid place-items-center">👤</span>
                    <div>
                      <div className="font-medium">{n}</div>
                      <div className="text-xs text-gray-500">{n.split(' ')[0].toLowerCase()}@example.com</div>
                    </div>
                  </div>
                  <span className="text-xs border rounded-full px-2 py-1">{['Active','Pending','Suspended'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Pending Approvals</h2>
              <button className="btn btn-ghost text-xs">Review All</button>
            </div>
            <div className="space-y-3">
              {['Article','Video'].map((t,i)=>(
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-gray-200 grid place-items-center">👤</span>
                      <div>
                        <div className="font-medium">{['Alex Kumar','Lisa Wong'][i]}</div>
                        <div className="text-xs text-gray-500">{i? '4 hours ago':'2 hours ago'}</div>
                      </div>
                    </div>
                    <span className="text-xs border rounded-full px-2 py-1">{t}</span>
                  </div>
                  <div className="mt-3 h-24 bg-gray-100 rounded-lg grid place-items-center text-gray-500">Preview</div>
                  <div className="mt-3 flex gap-2">
                    <button className="btn btn-primary">✓ Approve</button>
                    <button className="btn">✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

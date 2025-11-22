import { useEffect, useMemo, useState } from "react";

const navItems = [
  "Overview",
  "User Management",
  "Content Approval",
  "Analytics",
  "Settings",
  "Security",
];

const userSeed = [
  { id: 1, name: "Sarah Johnson", email: "sarah@example.com", status: "Active" },
  { id: 2, name: "Mike Chen", email: "mike@example.com", status: "Pending" },
  { id: 3, name: "Emma Davis", email: "emma@example.com", status: "Suspended" },
];

const approvalSeed = [
  { id: 1, author: "Alex Kumar", type: "Article", submitted: "2 hours ago" },
  { id: 2, author: "Lisa Wong", type: "Video", submitted: "4 hours ago" },
];

export default function Admin() {
  const [activeNav, setActiveNav] = useState(navItems[0]);
  const [users, setUsers] = useState(userSeed);
  const [approvals, setApprovals] = useState(approvalSeed);
  const [serverOnline, setServerOnline] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!notification) return;
    const id = setTimeout(() => setNotification(null), 2000);
    return () => clearTimeout(id);
  }, [notification]);

  const metricCards = useMemo(() => ([
    {
      label: "Total Users",
      value: users.length.toLocaleString(),
      sub: `${users.filter((u) => u.status === "Active").length} active right now`,
    },
    {
      label: "Pending Content",
      value: approvals.length,
      sub: approvals.length ? `${approvals.length} items waiting review` : "Up to date",
    },
    {
      label: "Reports",
      value: String(23 + approvals.filter((a) => a.type === "Article").length),
      sub: "+3 new reports",
    },
    {
      label: "Server Status",
      value: serverOnline ? "Online" : "Maintenance",
      sub: serverOnline ? "99.9% uptime" : "Performing updates",
    },
  ]), [users, approvals, serverOnline]);

  function cycleUserStatus(id){
    const order = ["Active", "Pending", "Suspended"];
    setUsers((prev) => prev.map((user) => {
      if (user.id !== id) return user;
      const idx = order.indexOf(user.status);
      const next = order[(idx + 1) % order.length];
      setNotification(`${user.name} marked as ${next}`);
      return { ...user, status: next };
    }));
  }

  function handleDecision(id, decision){
    const item = approvals.find((ap) => ap.id === id);
    if (!item) return;
    setApprovals((prev) => prev.filter((ap) => ap.id !== id));
    setNotification(`${item.author}'s ${item.type.toLowerCase()} ${decision}.`);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-[240px,1fr] gap-6">
      {notification && (
        <div className="fixed top-4 left-1/2 z-20 -translate-x-1/2 rounded-md bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {notification}
        </div>
      )}
      <aside className="card p-3">
        <div className="font-semibold mb-3">Dashboard</div>
        <nav className="space-y-1 text-sm">
          {navItems.map((item) => (
            <button
              key={item}
              className={`block w-full rounded px-3 py-2 text-left ${activeNav === item ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
              onClick={()=>setActiveNav(item)}
            >
              {item}
            </button>
          ))}
          <div className="mt-4 text-xs text-gray-500 uppercase">System</div>
        </nav>
      </aside>

      <main className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, approve content, and monitor system performance</p>
        </div>

        <section className="grid md:grid-cols-4 gap-3">
          {metricCards.map((m,i)=>(
            <div key={i} className="card p-4">
              <div className="text-sm text-gray-500">{m.label}</div>
              <div className="text-2xl font-semibold">{m.value}</div>
              <div className="text-xs text-gray-500 mt-1">{m.sub}</div>
              {m.label === 'Server Status' && (
                <button className="mt-3 text-xs underline" onClick={()=>setServerOnline((prev)=>!prev)}>
                  Toggle status
                </button>
              )}
            </div>
          ))}
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Recent Users</h2>
              <button className="btn btn-ghost text-xs" onClick={()=>setNotification('Full roster coming soon')}>View All</button>
            </div>
            <div className="space-y-2 text-sm">
              {users.map((user)=>(
                <div key={user.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full bg-gray-200 grid place-items-center">👤</span>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <button className="text-xs border rounded-full px-2 py-1" onClick={()=>cycleUserStatus(user.id)}>
                    {user.status}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Pending Approvals</h2>
              <button className="btn btn-ghost text-xs" onClick={()=>setNotification('Batch review not available in demo')}>Review All</button>
            </div>
            <div className="space-y-3">
              {approvals.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-500">All caught up! 🎉</div>
              )}
              {approvals.map((item)=>(
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-full bg-gray-200 grid place-items-center">👤</span>
                      <div>
                        <div className="font-medium">{item.author}</div>
                        <div className="text-xs text-gray-500">{item.submitted}</div>
                      </div>
                    </div>
                    <span className="text-xs border rounded-full px-2 py-1">{item.type}</span>
                  </div>
                  <div className="mt-3 h-24 bg-gray-100 rounded-lg grid place-items-center text-gray-500">Preview</div>
                  <div className="mt-3 flex gap-2">
                    <button className="btn btn-primary" onClick={()=>handleDecision(item.id, 'approved')}>✓ Approve</button>
                    <button className="btn" onClick={()=>handleDecision(item.id, 'rejected')}>✕ Reject</button>
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

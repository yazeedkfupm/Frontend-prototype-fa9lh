import { Link, NavLink, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const nav = (to, label) => (
    <NavLink to={to} className={({isActive}) => `px-3 py-2 rounded-md ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
      {label}
    </NavLink>
  );
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/dashboard" className="font-bold text-lg">Fa9lh</Link>
        <nav className="hidden md:flex gap-2">
          {nav('/dashboard','Home')}
          {nav('/quiz','Quizzes')}
          {nav('/lesson','Progress')}
          {nav('/admin','Admin')}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/sign" className="btn btn-ghost">Sign In</Link>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">👤</span>
        </div>
      </div>
    </header>
  );
}

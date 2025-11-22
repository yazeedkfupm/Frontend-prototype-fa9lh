import { Link, NavLink, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ProfileMenu from "./ProfileMenu";

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, signOut, theme, toggleTheme } = useApp();
  const isDark = theme === "dark";

  const nav = (to, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-md ${
          isActive
            ? "bg-gray-100 dark:bg-gray-800"
            : "hover:bg-gray-50 dark:hover:bg-gray-800"
        }`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <header className="bg-white border-b dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/dashboard" className="font-bold text-lg">
          Fa9lh
        </Link>
        <nav className="hidden md:flex gap-2">
          {nav("/dashboard", "Home")}
          {nav("/quiz", "Quizzes")}
          {nav("/lesson", "Progress")}
          {nav("/admin", "Admin")}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {!user ? (
            <Link to="/sign" className="btn btn-ghost">
              Sign In
            </Link>
          ) : (
            <>
              <ProfileMenu />
              <button className="btn btn-ghost" onClick={signOut}>
                Sign out
              </button>
              <button
                type="button"
                className="btn btn-ghost px-2"
                aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
                title={`Switch to ${isDark ? "light" : "dark"} mode`}
                onClick={toggleTheme}
              >
                <span className="text-lg" aria-hidden>
                  {isDark ? "☀️" : "🌙"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
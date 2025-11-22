import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const LS_KEY = "fa9lh:user";
const THEME_KEY = "fa9lh:theme";

function getPreferredTheme(){
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function AppProvider({ children }){
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [theme, setTheme] = useState(getPreferredTheme);

  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function toggleTheme(){
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  // very lightweight "auth" simulation
  function fakeNetwork(delay=800){
    return new Promise((res) => setTimeout(res, delay));
  }

  async function signIn({ email, password }){
    await fakeNetwork();
    // In a real app, you'd call your API. Here we succeed if password length >= 6
    if (!email || !password || password.length < 6){
      throw new Error("Invalid credentials");
    }
    const profile = { id: email, name: email.split("@")[0], email };
    setUser(profile);
    return profile;
  }

  async function signUp({ name, email, password }){
    await fakeNetwork();
    if (!name || name.length < 2){
      throw new Error("Please enter your full name");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      throw new Error("Please enter a valid email");
    }
    if (!password || password.length < 6){
      throw new Error("Password must be at least 6 characters");
    }
    const profile = { id: email, name, email };
    setUser(profile);
    return profile;
  }

  function signOut(){
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    setUser,
    signIn,
    signUp,
    signOut,
    theme,
    toggleTheme,
  }), [user, theme]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
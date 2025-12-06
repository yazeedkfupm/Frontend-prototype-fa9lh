import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const SESSION_KEY = "fa9lh:session";
const THEME_KEY = "fa9lh:theme";
const API_ROOT = (process.env.REACT_APP_API_URL || "http://localhost:4000").replace(/\/$/, "");
const API_BASE = `${API_ROOT}/api`;

function getPreferredTheme(){
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function getStoredSession(){
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function http(path, options = {}, token){
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${normalizedPath}`;
  const config = {
    method: options.method || (options.body ? "POST" : "GET"),
    headers: new Headers(options.headers || {}),
    credentials: options.credentials || "include",
  };
  if (!(options.body instanceof FormData) && options.body && typeof options.body === "object" && !options.rawBody){
    config.headers.set("Content-Type", "application/json");
    config.body = JSON.stringify(options.body);
  } else if (options.body){
    config.body = options.body;
  }
  config.headers.set("Accept", "application/json");
  if (token){
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));
  if (!response.ok){
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

export default function AppProvider({ children }){
  const [session, setSession] = useState(getStoredSession);
  const [theme, setTheme] = useState(getPreferredTheme);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (session){
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const token = session?.token;

  useEffect(() => {
    let mounted = true;
    async function hydrate(){
      if (!token){
        setReady(true);
        return;
      }
      try {
        const result = await http("/auth/me", {}, token);
        if (mounted){
          setSession((prev) => (prev ? { ...prev, user: result.user } : { token, user: result.user }));
        }
      } catch {
        if (mounted){
          setSession(null);
        }
      } finally {
        if (mounted){
          setReady(true);
        }
      }
    }
    hydrate();
    return () => {
      mounted = false;
    };
  }, [token]);

  function toggleTheme(){
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const api = useCallback((path, options = {}) => http(path, options, token), [token]);

  const signIn = useCallback(async ({ email, password }) => {
    const payload = await http("/auth/signin", { method: "POST", body: { email, password } });
    setSession(payload);
    return payload.user;
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    const payload = await http("/auth/signup", { method: "POST", body: { name, email, password } });
    setSession(payload);
    return payload.user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (token){
        await http("/auth/signout", { method: "POST" }, token);
      }
    } catch {
      // ignore network errors on sign-out
    } finally {
      setSession(null);
    }
  }, [token]);

  const value = useMemo(() => ({
    user: session?.user || null,
    token,
    signIn,
    signUp,
    signOut,
    theme,
    toggleTheme,
    api,
    ready,
  }), [session, token, signIn, signUp, signOut, theme, api, ready]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
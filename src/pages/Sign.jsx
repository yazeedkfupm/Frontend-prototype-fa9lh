import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

function Input({ label, type="text", value, onChange, name, placeholder, autoComplete, error }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-black ${error ? 'border-red-400 ring-red-300' : 'border-gray-300'}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}

function Toast({ message, kind='success', onClose }){
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 rounded-md px-4 py-2 shadow-lg ${kind==='success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {message}
    </div>
  );
}

export default function Sign() {
  const [tab, setTab] = useState("in"); // 'in' | 'up'
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { user, signIn, signUp } = useApp();

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  function validate(){
    const e = {};
    if (tab === "up" && (!form.name || form.name.trim().length < 2)) {
      e.name = "Please enter your name";
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Enter a valid email";
    }
    if (!form.password || form.password.length < 6) {
      e.password = "At least 6 characters";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e){
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      if (tab === "in"){
        await signIn({ email: form.email, password: form.password });
        setToast({ message: "Welcome back!", kind: "success" });
      } else {
        await signUp({ name: form.name.trim(), email: form.email, password: form.password });
        setToast({ message: "Account created 🎉", kind: "success" });
      }
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      setToast({ message: err.message || "Something went wrong", kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-center">fa9lh</h1>
      <p className="text-gray-600 text-center">Learn smarter, achieve more</p>

      <div className="mt-6 card p-2">
        <div className="flex bg-gray-100 rounded-md p-1">
          <button onClick={()=>setTab('in')} className={`flex-1 rounded-md px-4 py-2 text-sm ${tab==='in' ? 'bg-black text-white' : ''}`}>Sign In</button>
          <button onClick={()=>setTab('up')} className={`flex-1 rounded-md px-4 py-2 text-sm ${tab==='up' ? 'bg-black text-white' : ''}`}>Sign Up</button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          {tab === 'up' && (
            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={(e)=>setForm(f=>({...f, name: e.target.value}))}
              placeholder="e.g. Ali Al-..."
              autoComplete="name"
              error={errors.name}
            />
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e)=>setForm(f=>({...f, email: e.target.value}))}
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e)=>setForm(f=>({...f, password: e.target.value}))}
            placeholder="••••••••"
            autoComplete={tab==='in' ? 'current-password' : 'new-password'}
            error={errors.password}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn w-full flex items-center justify-center"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-black"></span>
                {tab==='in' ? 'Signing in…' : 'Creating account…'}
              </span>
            ) : (
              <span>{tab==='in' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="btn btn-ghost w-full" onClick={()=>setToast({message:'Google sign-in is coming soon', kind:'error'})}>🟢 Google</button>
            <button type="button" className="btn btn-ghost w-full" onClick={()=>setToast({message:'Microsoft sign-in is coming soon', kind:'error'})}>🪟 Microsoft</button>
          </div>
        </form>
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        By continuing, you agree to our terms and privacy policy
      </p>

      {toast && <Toast message={toast.message} kind={toast.kind} onClose={()=>setToast(null)} />}
    </div>
  );
}
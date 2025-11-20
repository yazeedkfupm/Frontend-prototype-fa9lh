import { useState } from "react";

export default function Sign() {
  const [tab, setTab] = useState("in");
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-center">fa9lh</h1>
      <p className="text-gray-600 text-center">Learn smarter, achieve more</p>

      <div className="mt-6 card p-2">
        <div className="flex bg-gray-100 rounded-md p-1">
          <button onClick={()=>setTab('in')} className={`flex-1 py-2 rounded-md ${tab==='in' ? 'bg-black text-white' : ''}`}>Sign In</button>
          <button onClick={()=>setTab('up')} className={`flex-1 py-2 rounded-md ${tab==='up' ? 'bg-black text-white' : ''}`}>Sign Up</button>
        </div>

        <form className="mt-6 space-y-4">
          <label className="label">Email Address
            <div className="relative mt-1">
              <input className="input pr-10" placeholder="john.doe@example.com" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">✉️</span>
            </div>
            <p className="text-xs text-gray-500">We'll never share your email</p>
          </label>
          <label className="label">Password
            <div className="relative mt-1">
              <input className="input pr-10" type="password" placeholder="Enter your password" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">👁️</button>
            </div>
            <p className="text-xs text-gray-600 mt-1">Password must be at least 8 characters</p>
          </label>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" /> Remember me
            </label>
            <button type="button" className="text-sm underline">Forgot password?</button>
          </div>

          <button className="btn btn-primary w-full">↪ Sign In</button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-500">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="btn btn-ghost w-full">🟢 Google</button>
            <button type="button" className="btn btn-ghost w-full">🪟 Microsoft</button>
          </div>
        </form>
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        By continuing, you agree to our terms and privacy policy
      </p>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext";

export default function ProfileMenu(){
  const { user, setUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name || "", email: user.email || "" });
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(evt){
      if (wrapperRef.current && !wrapperRef.current.contains(evt.target)){
        setIsOpen(false);
        setIsEditing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  function toggleMenu(){
    setIsOpen((prev) => !prev);
    if (isOpen){
      setIsEditing(false);
    }
  }

  function startEdit(evt){
    evt.stopPropagation();
    setIsEditing(true);
  }

  function handleChange(evt){
    const { name, value } = evt.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSave(){
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName || !trimmedEmail) return;
    setUser((prev) => ({ ...prev, name: trimmedName, email: trimmedEmail }));
    setIsEditing(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={toggleMenu}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span className="hidden text-right sm:block">
          <span className="block leading-none">{user.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Profile</span>
        </span>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-lg dark:bg-gray-700" aria-hidden>
          👤
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {!isEditing ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase text-gray-400">Account</p>
                <p className="font-semibold">{user.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-500"
                onClick={startEdit}
              >
                Edit profile
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs uppercase text-gray-500 dark:text-gray-400">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-gray-500 dark:text-gray-400">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-500"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

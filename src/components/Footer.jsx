export default function Footer() {
  return (
    <footer className="border-t dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <span>© 2025 Fa9lh</span>
        <div className="flex gap-4">
          <a className="hover:underline" href="#terms">
            Terms
          </a>
          <a className="hover:underline" href="#privacy">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
export default function NotFound(){
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">404 — Not Found</h1>
      <p className="text-gray-600">Try going back to the dashboard.</p>
      <Link to="/dashboard" className="underline">Go home</Link>
    </div>
  );
}

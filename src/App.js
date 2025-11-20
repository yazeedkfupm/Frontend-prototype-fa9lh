import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sign from "./pages/Sign";
import Dashboard from "./pages/Dashboard";
import Lesson from "./pages/Lesson";
import Quiz from "./pages/Quiz";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/sign" replace />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson" element={<Lesson />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

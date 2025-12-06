import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sign from "./pages/Sign";
import Dashboard from "./pages/Dashboard";
import Lesson from "./pages/Lesson";
import Quiz from "./pages/Quiz";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AppProvider, { useApp } from "./context/AppContext";

function Protected({ children }){
  const { user, ready } = useApp();
  if (!ready){
    return (
      <div className="flex items-center justify-center py-10 text-sm text-gray-500">
        Checking your session…
      </div>
    );
  }
  if (!user) return <Navigate to="/sign" replace />;
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/sign" element={<Sign />} />
            <Route path="/dashboard" element={
              <Protected><Dashboard /></Protected>
            } />
            <Route path="/lesson" element={
              <Protected><Lesson /></Protected>
            } />
            <Route path="/quiz" element={
              <Protected><Quiz /></Protected>
            } />
            <Route path="/admin" element={
              <Protected><Admin /></Protected>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}
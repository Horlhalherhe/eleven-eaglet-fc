import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useClub } from "./contexts/ClubContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PublicView from "./pages/PublicView";
import Settings from "./pages/Settings";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-brand-400 font-display text-xl tracking-wider animate-pulse">Loading...</div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { loading } = useClub();

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-brand-400 font-display text-xl tracking-wider animate-pulse">Loading...</div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/squad" element={<PublicView tab="squad" />} />
      <Route path="/matches" element={<PublicView tab="matches" />} />
      <Route path="/stats" element={<PublicView tab="stats" />} />
      <Route path="/manage/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

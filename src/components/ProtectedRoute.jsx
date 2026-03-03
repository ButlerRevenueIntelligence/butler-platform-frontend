import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("butler_token");
  const auth = localStorage.getItem("butler_auth");

  // If you don’t use tokens yet, auth alone is fine.
  const isAuthed = Boolean(token || auth);

  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}

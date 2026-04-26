import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isLogged = localStorage.getItem("kyd_admin_auth") === "true";

  if (!isLogged) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
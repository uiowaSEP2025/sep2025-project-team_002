import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "./context/UserContext";

// This is the main component that will be used in the app
function RequireAuth({ children }) {
  const { isLoggedIn, fetchUser } = useUser();
  const token = localStorage.getItem("token");

  // Check token validity on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  if (!token || !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// This is a test-only version that accepts props for testing
export function TestRequireAuth({ children, isLoggedIn = true, fetchUser = () => {} }) {
  const token = localStorage.getItem("token");

  // Check token validity on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  if (!token || !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RequireAuth;

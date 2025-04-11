import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "./context/UserContext";

// This is the main component that will be used in the app
function RequireAuth({ children }) {
  const { isLoggedIn, fetchUser } = useUser();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

  // Check token validity on mount and when token changes
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        await fetchUser();
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, fetchUser]);

  // If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Always render children if there's a token
  // This prevents flashing to login page on refresh
  return children;
}

// This is a test-only version that accepts props for testing
export function TestRequireAuth({ children, isLoggedIn = true, fetchUser = () => {} }) {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);

  // Check token validity on mount and when token changes
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        await fetchUser();
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, fetchUser]);

  // If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Always render children if there's a token
  // This prevents flashing to login page on refresh
  return children;
}

export default RequireAuth;

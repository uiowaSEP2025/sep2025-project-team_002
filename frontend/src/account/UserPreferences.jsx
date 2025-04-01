import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserPreferences() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");  // Redirect if not logged in
    }
  }, [navigate]);

  return (
    <div>
      <h1>User Preferences</h1>
      <p>This is where users can complete their preference form.</p>
    </div>
  );
}

export default UserPreferences;

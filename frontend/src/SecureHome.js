import React from "react";
import { useNavigate } from "react-router-dom";

function SecureHome() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the auth token
    navigate("/"); // Redirect to the public home page
  };

  return (
    <div>
      <h1>Welcome to the Secure Home Page</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default SecureHome;


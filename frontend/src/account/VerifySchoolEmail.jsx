import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API_BASE_URL from '../utils/config.js';

function VerifySchoolEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your school email...");

  useEffect(() => {
    const uid = searchParams.get("uid");
    const token = searchParams.get("token");

    if (!uid || !token) {
      setMessage("Invalid verification link.");
      return;
    }

    fetch(`${API_BASE_URL}/users/verify-school-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setMessage(data.message);
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setMessage("Something went wrong. Please try again later.");
      });
  }, []);

  return (
    <div style={{ padding: "3rem", textAlign: "  center" }}>
      <h2>{message}</h2>
      <p>You will be redirected shortly...</p>
    </div>
  );
}

export default VerifySchoolEmail;
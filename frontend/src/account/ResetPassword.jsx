// ResetPassword.js
import React, { useState } from "react";
import { Typography, Box } from "@mui/material";
import PasswordForm from "./PasswordForm";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../utils/config.js";
import Bugsnag from '@bugsnag/js';

function ResetPassword() {
  const query = new URLSearchParams(useLocation().search);
  const uid = query.get("uid");
  const token = query.get("token");

  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleResetPasswordSubmit = async ({ newPassword }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          token,
          new_password: newPassword,
          confirm_password: newPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || errorData.error || "Unable to reset password.");
      }
    } catch (err) {
      console.error("ResetPassword error:", err);
      Bugsnag.notify(err);

      if (err.message.includes("Failed to fetch")) {
        setMessage(
          "Unable to connect to the server. Check your network connection."
        );
      } else {
        setMessage("Network error: " + err.message);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Reset Password
      </Typography>
      {message && (
        <Typography variant="body1" color="error" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}
      <PasswordForm onSubmit={handleResetPasswordSubmit} includeCurrentPassword={false} />
    </Box>
  );
}

export default ResetPassword;
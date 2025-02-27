// ResetPassword.js
import React, { useState } from "react";
import { Typography, Box } from "@mui/material";
import PasswordForm from "./PasswordForm";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../utils/config.js";

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
      const data = await response.json();
      if (response.ok) {
        setMessage("Your password has been reset successfully. Please log in.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage("Network error: " + err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
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
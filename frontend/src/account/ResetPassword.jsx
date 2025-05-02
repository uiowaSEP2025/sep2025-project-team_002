// ResetPassword.js
import React, { useState, useEffect } from "react";
import { Typography, Box, Container, Paper, Alert, Button, useTheme, alpha } from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PasswordForm from "./PasswordForm";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../utils/config.js";

function ResetPassword() {
  const query = new URLSearchParams(useLocation().search);
  const uid = query.get("uid");
  const token = query.get("token");

  const navigate = useNavigate();
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);

    // Check if we have the required parameters
    if (!uid || !token) {
      setMessage("Invalid password reset link. Please request a new one.");
      setMessageType("error");
    }
  }, [uid, token]);

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
        setMessage(data.message || "Password reset successful!");
        setMessageType("success");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || errorData.error || "Unable to reset password.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("ResetPassword error:", err);

      if (err.message.includes("Failed to fetch")) {
        setMessage(
          "Unable to connect to the server. Check your network connection."
        );
      } else {
        setMessage("Network error: " + err.message);
      }
      setMessageType("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box
        sx={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 4 }}>
          <Button
            component={Link}
            to="/login"
            startIcon={<ArrowBackIcon />}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) }
            }}
          >
            Back to Login
          </Button>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <LockResetIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
            </Box>
          </Box>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Reset Password
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please enter your new password below.
          </Typography>

          {message && (
            <Alert
              severity={messageType}
              sx={{ mb: 3, borderRadius: 2 }}
              variant="filled"
            >
              {message}
            </Alert>
          )}

          {(uid && token) && (
            <PasswordForm onSubmit={handleResetPasswordSubmit} includeCurrentPassword={false} />
          )}

          {(!uid || !token) && (
            <Box sx={{ mt: 3 }}>
              <Button
                component={Link}
                to="/forgot-password"
                variant="contained"
                color="primary"
                sx={{
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                  },
                  '&:active': {
                    transform: 'translateY(1px)'
                  }
                }}
              >
                Request New Reset Link
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default ResetPassword;
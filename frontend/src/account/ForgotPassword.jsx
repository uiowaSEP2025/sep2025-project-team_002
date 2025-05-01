import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Paper, Alert, Container, useTheme, alpha, Link as MuiLink } from '@mui/material';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import API_BASE_URL from "../utils/config.js";
import { Link, useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/users/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message || "Reset email sent successfully. Please check your inbox.");
        setMessageType('success');
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || errorData.error || "Failed to send reset email.");
        setMessageType('error');
      }
    } catch (error) {
      console.error("ForgotPassword error:", error);

      if (error.message.includes("Failed to fetch")) {
        setMessage(
          "Unable to connect to the server. Check your network connection."
        );
      } else {
        setMessage("Network error: " + error.message);
      }
      setMessageType('error');
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
              <EmailIcon sx={{ fontSize: 36, color: theme.palette.primary.main }} />
            </Box>
          </Box>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Forgot Password
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email address and we'll send you a link to reset your password.
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

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                py: 1.5,
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
              Send Reset Email
            </Button>
          </form>
        </Paper>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Remember your password?{' '}
            <Link
              to="/login"
              style={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Back to login
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default ForgotPassword;

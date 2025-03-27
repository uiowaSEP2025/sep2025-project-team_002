import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import API_BASE_URL from "../utils/config.js";
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
        setMessage(data.message);
      } else {
        const errorData = await response.json();
        setMessage(errorData.detail || errorData.error || "Failed to send reset email.");
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
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: '0 auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Forgot Password
      </Typography>
      {message && <Typography variant="body1" color="error">{message}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Send Reset Email
        </Button>
      </form>
    </Box>
  );
}

export default ForgotPassword;

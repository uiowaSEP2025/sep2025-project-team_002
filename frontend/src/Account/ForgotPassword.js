import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import API_BASE_URL from "../utils/config";
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
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Internet Error: " + error.message);
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

import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@mui/material';
import API_BASE_URL from "./utils/config";
import { useLocation, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const query = new URLSearchParams(useLocation().search);
  const uid = query.get("uid");
  const token = query.get("token");

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/users/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: newPassword, confirm_password: confirmPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        // Re-direct to Login
        navigate("/login");
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage("Internet Server Error:" + error.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: '0 auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reset Password
      </Typography>
      {message && <Typography variant="body1" color="error">{message}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Reset Password
        </Button>
      </form>
    </Box>
  );
}

export default ResetPassword;

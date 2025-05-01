import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';

function getPasswordStrength(password) {
  const length = password.length;
  // Checks
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  // For "very strong" bonus
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Default values
  let label = "Poor";
  let color = "#f44336";
  let percentage = 25;

  // CASE 0: Nothing typed
  if (length === 0) {
    label = "Poor";
    color = "#d59c9c";
    percentage = 5;
    return { label, color, percentage };
  }

  // CASE 1: Typed something, but length < 6
  if (length < 6) {
    label = "Poor";
    color = "#f44336"; // red
    percentage = 25;
    return { label, color, percentage };
  }

  // Now length >= 6
  // Check if uppercase + lowercase + number are ALL present
  const hasAllThree = hasUpper && hasLower && hasNumber;

  // If not all three, it's just "Fair"
  if (!hasAllThree) {
    label = "Fair";
    color = "#ff9800"; // orange
    percentage = 50;
    return { label, color, percentage };
  }

  // If we reach here, length >= 6 AND hasUpper + hasLower + hasNumber
  // That's at least "Strong"
  label = "Strong";
  color = "#4bff4f"; // green
  percentage = 70;

  // Check "Very Strong" bonus: if length >= 10 or has special char
  if (length >= 10 || hasSpecial) {
    label = "Very Strong";
    color = "#00c10b";
    percentage = 100;
  }

  return { label, color, percentage };
}

const PasswordStrengthBar = ({ password }) => {
  const { label, color, percentage } = getPasswordStrength(password);
  const theme = useTheme();

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
        <LockIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} />
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
          Password Strength:
        </Typography>
        <Typography variant="caption" sx={{ ml: 1, fontWeight: 600, color }}>
          {label}
        </Typography>
      </Box>

      {/* Outer bar */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: theme.palette.grey[200],
          height: 6,
          borderRadius: "10px",
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
        }}
      >
        {/* Filled portion */}
        <Box
          data-testid="password-strength-fill"
          sx={{
            width: `${percentage}%`,
            backgroundColor: color,
            height: "100%",
            borderRadius: "10px",
            transition: "width 0.3s ease",
            boxShadow: percentage > 50 ? '0 0 5px rgba(0,0,0,0.2)' : 'none'
          }}
        />
      </Box>
    </Box>
  );
};

export default PasswordStrengthBar;

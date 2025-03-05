import React from "react";
import { Box, Typography } from "@mui/material";

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

  return (
    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
      {/* Outer bar */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: "#e0e0e0",
          height: 8,
          borderRadius: "4px",
          mr: 2
        }}
      >
        {/* Filled portion */}
        <Box
            data-testid="password-strength-fill"
          sx={{
            width: `${percentage}%`,
            backgroundColor: color,
            height: "100%",
            borderRadius: "4px",
            transition: "width 0.3s"
          }}
        />
      </Box>

      {/* Strength label */}
      <Typography variant="body2" sx={{ color }}>
        {label}
      </Typography>
    </Box>
  );
};

export default PasswordStrengthBar;

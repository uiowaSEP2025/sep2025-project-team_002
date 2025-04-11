// PasswordForm.js
import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InfoIcon from "@mui/icons-material/Info";
import PasswordStrengthBar from "../components/PasswordStrengthBar.jsx";

function PasswordForm({ onSubmit, includeCurrentPassword = false }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmNewPass, setShowConfirmNewPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (includeCurrentPassword && !currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword || !confirmNewPassword) {
      setPasswordError("Please fill in the new password fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordError("");
    if (includeCurrentPassword) {
      onSubmit({ currentPassword, newPassword });
    } else {
      onSubmit({ newPassword });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {includeCurrentPassword && (
        <TextField
          fullWidth
          margin="normal"
          label="Current Password"
          type={showCurrentPass ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowCurrentPass(!showCurrentPass)}>
                  {showCurrentPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}

      <TextField
        fullWidth
        margin="normal"
        label="New Password"
        type={showNewPass ? "text" : "password"}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowNewPass(!showNewPass)}>
                {showNewPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
              <Tooltip title="Min 6 chars, must have uppercase, lowercase, and number.">
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
      <PasswordStrengthBar password={newPassword} />

      <TextField
        fullWidth
        margin="normal"
        label="Confirm New Password"
        type={showConfirmNewPass ? "text" : "password"}
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        error={confirmNewPassword.length > 0 && newPassword !== confirmNewPassword}
        helperText={
          confirmNewPassword.length > 0 &&
          (newPassword === confirmNewPassword ? (
            <Typography component="span" sx={{ color: "green" }}>
              Passwords match
            </Typography>
          ) : (
            <Typography component="span" sx={{ color: "red" }}>
              Passwords do not match
            </Typography>
          ))
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}>
                {showConfirmNewPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {passwordError && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {passwordError}
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          sx={{
            borderRadius: "40px",
            width: "140px",
            margin: "0 auto",
          }}
        >
          Submit
        </Button>
      </Box>
    </form>
  );
}

export default PasswordForm;
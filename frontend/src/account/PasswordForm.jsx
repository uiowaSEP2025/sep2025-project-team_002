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
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import InfoIcon from "@mui/icons-material/Info";
import PasswordStrengthBar from "../components/PasswordStrengthBar.jsx";

function PasswordForm({ onSubmit, includeCurrentPassword = false }) {
  const theme = useTheme();
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
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
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
        sx={{ mb: 1 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowNewPass(!showNewPass)}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showNewPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
              <Tooltip
                title="Min 6 chars, must have uppercase, lowercase, and number."
                arrow
                placement="top"
              >
                <IconButton size="small">
                  <InfoIcon fontSize="small" color="info" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ mb: 2 }}>
        <PasswordStrengthBar password={newPassword} />
      </Box>

      <TextField
        fullWidth
        margin="normal"
        label="Confirm New Password"
        type={showConfirmNewPass ? "text" : "password"}
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        error={confirmNewPassword.length > 0 && newPassword !== confirmNewPassword}
        sx={{ mb: 2 }}
        helperText={
          confirmNewPassword.length > 0 &&
          (newPassword === confirmNewPassword ? (
            <Typography component="span" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>
              Passwords match
            </Typography>
          ) : (
            <Typography component="span" sx={{ color: theme.palette.error.main, fontWeight: 500 }}>
              Passwords do not match
            </Typography>
          ))
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmNewPass(!showConfirmNewPass)}
                edge="end"
                aria-label="toggle password visibility"
              >
                {showConfirmNewPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {passwordError && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          variant="outlined"
        >
          {passwordError}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
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
          Submit
        </Button>
      </Box>
    </form>
  );
}

export default PasswordForm;
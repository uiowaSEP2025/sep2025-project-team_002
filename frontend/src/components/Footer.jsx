import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Snackbar, Alert, Grid, Divider, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import API_BASE_URL from "../utils/config.js";

function Footer() {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // State for notification
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal and reset all inputs
  const closeModal = () => {
    setIsModalOpen(false);
    setIssueDescription('');
    setEmail('');
    setName('');
  };

  // Close the notification
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Check if required fields are filled
  const isFormValid = email.trim() !== '' && issueDescription.trim() !== '';

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // If form is invalid, do nothing
    if (!isFormValid) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/report/report_issue/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          name: name,
          description: issueDescription
        }),
      });
      if (response.ok) {
        // Show success notification
        setSnackbar({
          open: true,
          message: 'Your issue has been submitted. Thank you for your feedback!',
          severity: 'success'
        });

        // Close the modal on success
        closeModal();
      } else {
        // Show error notification
        setSnackbar({
          open: true,
          message: 'Submission failed. Please try again later.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error(error);
      // Show error notification
      setSnackbar({
        open: true,
        message: 'Submission error. Please check your network or server.',
        severity: 'error'
      });
    }
  };

  return (
    <>
      {/* Modern footer */}
      <Box
        component="footer"
        sx={{
          position: 'relative',
          bottom: 0,
          left: 0,
          width: '100%',
          bgcolor: theme.palette.background.dark,
          color: '#fff',
          py: 1.5,
          zIndex: 10,
          mt: 'auto',
          boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container alignItems="center" justifyContent="space-between">

            <Grid item xs={12} sm={4} sx={{ textAlign: 'center', my: { xs: 1, sm: 0 } }}>
              <Typography variant="body2">
                © 2025 Athletic Insider
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2 }}>
                <Typography
                  variant="body2"
                  component="span"
                  onClick={openModal}
                  sx={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'transform 0.2s ease, color 0.2s ease',
                    '&:hover': {
                      color: theme.palette.primary.light,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <ReportProblemOutlinedIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                  Report Issue
                </Typography>

                <Typography
                  variant="body2"
                  component={Link}
                  to="/about"
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'transform 0.2s ease, color 0.2s ease',
                    '&:hover': {
                      color: theme.palette.primary.light,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <InfoOutlinedIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                  About Us
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Report Issue Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            maxWidth: 500
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              Report an Issue
            </Typography>
            <IconButton onClick={closeModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="dense"
              id="email"
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              id="name"
              label="Name (optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              id="description"
              label="Issue Description"
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Please describe the issue in detail..."
              required
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={closeModal} sx={{ mr: 2 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isFormValid}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Footer;
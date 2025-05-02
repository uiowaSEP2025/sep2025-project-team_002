import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Grid,
  Typography, TextField, Button, MenuItem, Tooltip, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Container, Paper, Alert, useTheme, alpha, Divider
} from "@mui/material";
import Slider from '@mui/material/Slider';
import API_BASE_URL from "../utils/config";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import TuneIcon from "@mui/icons-material/Tune";
import Bugsnag from '@bugsnag/js';


const PreferenceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [hasExistingPreferences, setHasExistingPreferences] = useState(false);
  const [existingPreferenceId, setExistingPreferenceId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [preference, setPreference] = useState({
    sport: "",
    head_coach: 0,
    assistant_coaches: 0,
    team_culture: 0,
    campus_life: 0,
    athletic_facilities: 0,
    athletic_department: 0,
    player_development: 0,
    nil_opportunity: 0,
  });

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);

    if (location.state?.isEditing) {
      setIsEditing(true);
    }

    const checkExistingPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/preferences/user-preferences/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setHasExistingPreferences(true);
            setExistingPreferenceId(data[0].id);
            // Set the form with existing preferences
            setPreference({
              sport: data[0].sport,
              head_coach: data[0].head_coach,
              assistant_coaches: data[0].assistant_coaches,
              team_culture: data[0].team_culture,
              campus_life: data[0].campus_life,
              athletic_facilities: data[0].athletic_facilities,
              athletic_department: data[0].athletic_department,
              player_development: data[0].player_development,
              nil_opportunity: data[0].nil_opportunity,
            });
          }
        }
      } catch (error) {
        console.error("Error checking preferences:", error);
        Bugsnag.notify(error);
      }
    };

    checkExistingPreferences();
  }, [location.state]);

  const handleChange = (e) => {
    setPreference({ ...preference, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (name, newValue) => {
    setPreference({ ...preference, [name]: newValue });
  };

  const isFormValid = () => {
    return (
      preference.sport
    );
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);

    // Final validation check before submission
    if (!isFormValid()) {
      alert("Please fill out all required fields before submitting.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = isEditing && existingPreferenceId
        ? `${API_BASE_URL}/api/preferences/preferences-form/${existingPreferenceId}/`
        : `${API_BASE_URL}/api/preferences/preferences-form/`;

      const method = isEditing && existingPreferenceId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(preference),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error Response:", data);
        alert(data?.message || "Failed to submit preference. Please try again.");
        return;
      }

      // Success case
      setOpenConfirm(false);
      navigate("/secure-home");
    } catch (error) {
      console.error("Submission failed", error);
      Bugsnag.notify(error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (isFormValid()) {
      setOpenConfirm(true);
    } else {
      alert("Please fill out all required fields before submitting.");
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}
      >
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, position: 'relative' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/secure-home")}
            sx={{
              position: { xs: 'relative', md: 'absolute' },
              left: 0,
              borderRadius: 2,
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Back
          </Button>

          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Athletic Insider
          </Typography>
        </Box>

        <Grid container justifyContent="center" spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  color: theme.palette.text.primary
                }}
              >
                {isEditing ? "Modify your Preferences" : "Share your Preferences"}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 400,
                  mb: 2,
                  color: theme.palette.text.secondary
                }}
              >
                Please rank the following factors based on their importance to you in your school search.
                Your rankings will help us match you with schools that align with your preferences.
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 500,
                  mb: 4,
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  p: 2,
                  borderRadius: 2,
                  maxWidth: 700,
                  mx: 'auto'
                }}
              >
                <strong>NOTE:</strong> A rating of 10 indicates that this factor is extremely important in your decision,
                while a 1 means it has little to no impact on your choice.
                If a factor doesn't matter to you at all, select 0.
              </Typography>
            </Box>

          <Paper
              component="form"
              onSubmit={handleSubmit}
              elevation={2}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
              }}>
           <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SportsTennisIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Select Your Sport</Typography>
              </Box>
              <TextField
                id="sport-select"
                select
                fullWidth
                label="Sport *"
                name="sport"
                value={preference.sport}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
                error={!preference.sport && isSubmitted}
                helperText={!preference.sport && isSubmitted ? "This field is required" : ""}
              >
              {["Football", "Men's Basketball", "Women's Basketball", "Volleyball", "Baseball", "Men's Soccer", "Women's Soccer", "Wrestling"].map((sport, index) => (
                <MenuItem key={index} value={sport}>
                  {sport}
                </MenuItem>
              ))}
              </TextField>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TuneIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Rate Importance Factors</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                Drag the sliders to indicate how important each factor is to you in your decision.
              </Typography>
              <Divider sx={{ mb: 3 }} />


            {/* Ratings */}
            {[
                  { label: "Head Coach* ", name: "head_coach", info: "Select the importance of the quality of the head coach in your decision." },
                  { label: "Assistant Coaches* ", name: "assistant_coaches", info: "Evaluate the importance of support provided by assistant coaches in your decision." },
                  { label: "Team Culture* ", name: "team_culture", info: "Select the importance of the atmosphere, team chemistry, and overall culture of the program in your decision." },
                  { label: "Campus Life* ", name: "campus_life", info: "Select the importance of the school's campus environment, student experience, and activities in your decision." },
                  { label: "Athletic Facilities* ", name: "athletic_facilities", info: "Evaluate the importance of quality of training rooms, venues, and practice facilities in your decision." },
                  { label: "Athletic Department* ", name: "athletic_department", info: "Evaluate the importance of the support, culture, and effectiveness of the school's overall athletic department in your decision." },
                  { label: "Player Development* ", name: "player_development", info: "Assess the importance of player development and skill improvement in your decision." },
                  { label: "NIL Opportunity* ", name: "nil_opportunity", info: "Select the importance of NIL potential and  opportunities for profit in your decision ." }
              ].map((field, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: index % 2 === 0 ? alpha(theme.palette.primary.light, 0.05) : alpha(theme.palette.secondary.light, 0.05),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary
                      }}
                    >
                      {field.label}
                      <Tooltip title={field.info} arrow placement="top">
                        <IconButton size="small" sx={{ ml: 1, color: theme.palette.primary.main }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                  </Box>

                  <Box sx={{ px: 1 }}>
                    <Slider
                      value={preference[field.name]}
                      onChange={(e, newValue) => handleRatingChange(field.name, newValue)}
                      min={0}
                      max={10}
                      step={1}
                      marks={[
                        { value: 0, label: '0' },
                        { value: 5, label: '5' },
                        { value: 10, label: '10' }
                      ]}
                      valueLabelDisplay="auto"
                      sx={{
                        color: theme.palette.primary.main,
                        '& .MuiSlider-thumb': {
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}`
                          },
                        },
                      }}
                    />
                  </Box>

                  {isSubmitted && !preference[field.name] && (
                    <Typography sx={{ color: theme.palette.error.main, mt: 1, fontSize: "0.85rem", fontWeight: 500 }}>
                      This rating is required
                    </Typography>
                  )}
                </Box>
              ))}

              <Box sx={{ mt: 4 }}>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSubmitClick}
                  disabled={!isFormValid()}
                  data-testid="submit-preferences-button"
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
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
                  {isEditing ? "Update Preferences" : "Submit Preferences"}
                </Button>
              </Box>

            <Dialog
              open={openConfirm}
              onClose={() => setOpenConfirm(false)}
              PaperProps={{
                elevation: 3,
                sx: {
                  borderRadius: 3,
                  p: 2,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <DialogTitle
                id="confirm-dialog-title"
                data-testid="confirm-dialog-title"
                sx={{
                  textAlign: 'center',
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  pb: 1
                }}
              >
                {isEditing ? "Confirm Update":"Confirm Submission"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ textAlign: 'center', mb: 2 }}>
                  {isEditing ? "Are you sure you want to update your preferences? ":"Are you sure you want to submit your preferences?"}
                  <br />
                  You may update these once they are submitted.
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
                <Button
                  onClick={() => setOpenConfirm(false)}
                  color="secondary"
                  sx={{
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.light, 0.1),
                      borderColor: theme.palette.error.light,
                      color: theme.palette.error.main
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  color="primary"
                  variant="contained"
                  sx={{
                    px: 3,
                    py: 1,
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
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </Container>
  );
};

export default PreferenceForm;

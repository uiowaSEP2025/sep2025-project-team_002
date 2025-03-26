import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Grid,
  Typography, TextField, Button, MenuItem, Rating, Tooltip, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import Slider from '@mui/material/Slider';
import {
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import { motion } from "framer-motion";
import API_BASE_URL from "../utils/config";
import InfoIcon from "@mui/icons-material/Info";
import Bugsnag from '@bugsnag/js';


const PreferenceForm = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [hasExistingPreferences, setHasExistingPreferences] = useState(false);
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
          }
        }
      } catch (error) {
        console.error("Error checking preferences:", error);
        Bugsnag.notify(error);
      }
    };

    checkExistingPreferences();
  }, []);

  const handleChange = (e) => {
    setPreference({ ...preference, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (name, newValue) => {
    setPreference({ ...preference, [name]: newValue });
  };

  const isFormValid = () => {
    return (
      preference.sport &&
      preference.head_coach > 0 &&
      preference.assistant_coaches > 0 &&
      preference.team_culture > 0 &&
      preference.campus_life > 0 &&
      preference.athletic_facilities > 0 &&
      preference.athletic_department > 0 &&
      preference.player_development > 0 &&
      preference.nil_opportunity > 0
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
      const response = await fetch(`${API_BASE_URL}/api/preferences/preferences-form/`, {
        method: "POST",
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

  if (hasExistingPreferences) {
    return (
      <>
        {/* Keep your header */}
        <div style={{
          maxWidth: '800px',
          margin: 'auto',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 25px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              position: 'absolute',
              left: 0
            }}
          >
            ← Back
          </button>
          <h2 style={{
            flex: 1,
            textAlign: 'center',
            margin: 0
          }}>
            Athletic Insider
          </h2>
        </div>

        <Dialog open={hasExistingPreferences} onClose={() => navigate("/secure-home")}>
          <DialogTitle>Preferences Already Submitted</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You've already submitted your preferences!
              <br />
              You can only submit one preference at this time.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
              onClick={() => navigate("/secure-home")}
              color="primary"
              variant="contained"
            >
              Return to Dashboard
            </Button>
              </Box>
          </DialogActions>
        </Dialog>
      </>
    );
  }


  return (
      <>
        <div style={{
        maxWidth: '800px',
        margin: 'auto',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 25px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            position: 'absolute',
            left: 0
          }}
        >
          ← Back
        </button>
        <h2 style={{
          flex: 1,
          textAlign: 'center',
          margin: 0
        }}>
          Athletic Insider
        </h2>
      </div>
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", p: 4 }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center" }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Share your Preferences
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 400, mb: 2 }}>
              Please rank the following factors based on their importance to you in your school search.
                Your rankings will help us match you with schools that align with your preferences.
            </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 200, mb: 4 }}>
              <strong>NOTE:</strong> A rating of 10 indicates that this factor is extremely important in your decision,
                  while a 1 means it has little to no impact on your choice.
                  If a factor doesn’t matter to you at all, select 0.
            </Typography>
          </motion.div>

          <Box component="form" onSubmit={handleSubmit} sx={{ backgroundColor: "#fff", p: 4, borderRadius: 2, boxShadow: 3 }}>
           <TextField
              select
              fullWidth
              label="Sport *"
              name="sport"
              value={preference.sport}
              onChange={handleChange}
              sx={{ mb: 2 }}
              error={!preference.sport && isSubmitted}
              helperText={!preference.sport && isSubmitted ? "This field is required" : ""}
            >
              {["Football", "Men’s Basketball", "Women’s Basketball"].map((sport, index) => (
                <MenuItem key={index} value={sport}>
                  {sport}
                </MenuItem>
              ))}
            </TextField>


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
                <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography sx={{ width: "50%" }}>
                    {field.label}:
                    <Tooltip title={field.info} arrow>
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>

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
                  sx={{ width: '80%' }}
                />
                  {isSubmitted && !preference[field.name] && (
                    <Typography sx={{ color: "red", ml: 2, fontSize: "0.9rem" }}>
                      Required
                    </Typography>
                  )}
                </Box>
              ))}

              <Button
                type="button"
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSubmitClick}
                disabled={!isFormValid()}
              >
                Submit Preferences
              </Button>

            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
              <DialogTitle>Confirm Submission</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to submit your preferences?
                  <br />
                  You cannot change your preferences once it is submitted.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)} color="secondary">Cancel</Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">
                      Confirm
                    </Button>
                  </DialogActions>
            </Dialog>

          </Box>
        </Grid>
      </Grid>
    </Box>
        </>
  );
};

export default PreferenceForm;

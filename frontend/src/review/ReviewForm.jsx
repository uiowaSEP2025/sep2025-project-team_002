import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Box, Grid,
  Typography, TextField, Button, MenuItem, Rating, Tooltip, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE_URL from "../utils/config";
import InfoIcon from "@mui/icons-material/Info";


const fetchUserReviews = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/reviews/user-reviews/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user reviews");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return [];
  }
};

const fetchSchools = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/schools/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch schools");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching schools:", error);
    return [];
  }
};

const submitReview = async (review) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/reviews/review-form/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(review),
    });

    const data = await response.json(); // Get error response from API

    if (!response.ok) {
      console.error("API Error Response:", data); // Log exact validation errors
      throw new Error("Failed to submit review");
    }

    return data;
  } catch (error) {
    console.error("Error submitting review:", error);
    return null;
  }
};


const ReviewForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { schoolId, schoolName, selectedSport } = location.state || {};
  const [searchParams] = useSearchParams();
  const [schools, setSchools] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);
  const [userReviews, setUserReviews] = useState([]); // Store user's past reviews
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [review, setReview] = useState({
    school: schoolId || "",
    sport: selectedSport || "",
    head_coach_name: "",
    review_message: "",
    head_coach: 0,
    assistant_coaches: 0,
    team_culture: 0,
    campus_life: 0,
    athletic_facilities: 0,
    athletic_department: 0,
    player_development: 0,
    nil_opportunity: 0,
  });

  const isMobile = useMediaQuery("(max-width: 600px)");

  useEffect(() => {
    const loadData = async () => {
      const fetchedSchools = await fetchSchools();
      const fetchedReviews = await fetchUserReviews();
      setSchools(fetchedSchools);
      setUserReviews(fetchedReviews);

      // If we have a schoolId, find and set the selected school
      if (schoolId) {
        const school = fetchedSchools.find(s => s.id.toString() === schoolId.toString());
        if (school) {
          setSelectedSchool(school);
          // Set available sports based on the pre-selected school
          const sports = [];
          if (school.mbb) sports.push("Men's Basketball");
          if (school.wbb) sports.push("Women's Basketball");
          if (school.fb) sports.push("Football");
          setAvailableSports(sports);
        }
      }
    };
    loadData();

  }, [schoolId]);

  const handleChange = (e) => {
    setReview({ ...review, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (name, newValue) => {
    setReview({ ...review, [name]: newValue });
  };

  const handleSchoolChange = (e) => {
    const schoolId = e.target.value;
    setReview({ ...review, school: schoolId });
    
    const selectedSchool = schools.find(s => s.id.toString() === schoolId.toString());
    if (selectedSchool) {
      setSelectedSchool(selectedSchool);
      // Update available sports
      const sports = [];
      if (selectedSchool.mbb) sports.push("Men's Basketball");
      if (selectedSchool.wbb) sports.push("Women's Basketball");
      if (selectedSchool.fb) sports.push("Football");
      setAvailableSports(sports);
    }
  };

  const isFormValid = () => {
  return (
    review.school &&
    review.sport &&
    review.head_coach_name.trim() &&
    review.review_message &&
    review.head_coach > 0 &&
    review.assistant_coaches > 0 &&
    review.team_culture > 0 &&
    review.campus_life > 0 &&
    review.athletic_facilities > 0 &&
    review.athletic_department > 0 &&
    review.player_development > 0 &&
    review.nil_opportunity > 0
  );
};

  const normalizeString = (str) => str.replace(/\s+/g, "").toLowerCase();
  const isDuplicateReview = userReviews.some(
    (r) =>
      r.school === review.school &&
      r.sport === review.sport &&
      normalizeString(r.head_coach_name) === normalizeString(review.head_coach_name)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  
    // Check for duplicate review dynamically
    const duplicateReview = userReviews.some(
      (r) =>
        r.school === review.school &&
        r.sport === review.sport &&
        normalizeString(r.head_coach_name) === normalizeString(review.head_coach_name)
    );
  
    if (duplicateReview) {
      console.warn("Duplicate review detected, preventing submission.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/reviews/review-form/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(review),
      });
  
      if (!response.ok) {
        const data = await response.json();
        console.error("API Error Response:", data);
        return;
      }
  
      navigate("/secure-home");
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
      <>
        <div style={{
        maxWidth: '800px',
        margin: 'auto',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        width: "100%",
        boxSizing: "border-box"
      }}>
        <button
          id="back-button"
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
        <h2 id="form-title" style={{
          flex: 1,
          textAlign: 'center',
          margin: 0
        }}>
          Athletic Insider
        </h2>
      </div>
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", p: { xs: 2, md: 4 }, overflowX: "hidden"}}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center" }}
          >
            <Typography id="page-title" variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Submit Your Review
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4 }}>
              Share your experience with the school's athletic program.
            </Typography>
          </motion.div>

<<<<<<< HEAD
          <Box component="form" onSubmit={handleSubmit} sx={{ backgroundColor: "#fff", p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 3 }}>
=======
          <Box id="review-form" component="form" onSubmit={handleSubmit} sx={{ backgroundColor: "#fff", p: 4, borderRadius: 2, boxShadow: 3 }}>
>>>>>>> 1d7eff8c22bc9491584a4dbfdcaf23ff05d4e4d0
          <TextField
            id="school-select"
            select
            fullWidth
            label="School *"
            name="school"
            value={review.school}
            onChange={handleSchoolChange}  // Update available sports when a school is selected
            sx={{ mb: 2 }}
            error={!review.school && isSubmitted} // Highlight field if empty
            helperText={!review.school && isSubmitted ? "This field is required" : ""}
          >
            {schools.map((school) => (
              <MenuItem id={`school-option-${school.id}`} key={school.id} value={school.id}>
                {school.school_name}
              </MenuItem>
            ))}
          </TextField>

            <TextField
              id="sport-select"
              select
              fullWidth
              label="Sport *"
              name="sport"
              value={review.sport}
              onChange={handleChange}
              sx={{ mb: 2 }}
              disabled={!availableSports.length} 
              error={!review.sport && isSubmitted}
              helperText={!review.sport && isSubmitted ? "This field is required" : ""}
            >
              {availableSports.map((sport, index) => (
                <MenuItem id={`sport-option-${sport.replace(/\s+/g, '-').toLowerCase()}`} key={index} value={sport}>
                  {sport}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              id="coach-name-input"
              fullWidth
              label="Head Coach's Name *"
              name="head_coach_name"
              rows={1}
              value={review.head_coach_name}
              onChange={handleChange}
              sx={{ mb: 2 }}
              error={!review.head_coach_name.trim() && isSubmitted}
              helperText={!review.head_coach_name.trim() && isSubmitted ? "This field is required" : ""}
              InputProps={{
                endAdornment: (
                  <Tooltip title="Enter ONLY the full first and last name of the coach." arrow>
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />

            {/* Ratings */}
            {[
                  { label: "Head Coach* ", name: "head_coach", info: "Rate the quality of the head coach's leadership and coaching ability." },
                  { label: "Assistant Coaches* ", name: "assistant_coaches", info: "Evaluate the knowledge and support provided by assistant coaches." },
                  { label: "Team Culture* ", name: "team_culture", info: "Rate the atmosphere, team chemistry, and overall culture of the program." },
                  { label: "Campus Life* ", name: "campus_life", info: "Assess the school's campus environment, student experience, and activities." },
                  { label: "Athletic Facilities* ", name: "athletic_facilities", info: "Evaluate the quality of training rooms, venues, and practice facilities." },
                  { label: "Athletic Department* ", name: "athletic_department", info: "Rate the support, culture, and effectiveness of the school's overall athletic department." },
                  { label: "Player Development* ", name: "player_development", info: "Assess how well the coaches helps athletes improve their skills." },
                  { label: "NIL Opportunity* ", name: "nil_opportunity", info: "Rate your school's NIL potential and the opportunities for athletes to profit." }
              ].map((field, index) => (
<<<<<<< HEAD
                <Box key={index} sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, mb: 2 }}>
                  <Typography sx={{ width: "50%" }}>
=======
                <Box id={`rating-container-${field.name}`} key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography id={`rating-label-${field.name}`} sx={{ width: "50%" }}>
>>>>>>> 1d7eff8c22bc9491584a4dbfdcaf23ff05d4e4d0
                    {field.label}:
                    <Tooltip title={field.info} arrow>
                      <IconButton id={`info-button-${field.name}`} size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Rating
                    id={`rating-${field.name}`}
                    data-testid={`rating-${field.name.toLowerCase().replace(' ', '-')}`}
                    name={field.name}
                    value={review[field.name]}
                    max={10}
                    onChange={(event, newValue) => handleRatingChange(field.name, newValue)}
                    sx={{ color: !review[field.name] && isSubmitted ? "red" : "" }}
                  />
                  {isSubmitted && !review[field.name] && (
                    <Typography sx={{ color: "red", ml: 2, fontSize: "0.9rem" }}>
                      Required
                    </Typography>
                  )}
                </Box>
              ))}

            <TextField
              id="review-message"
              fullWidth
              label="Share additional thoughts on your experience. *"
              name="review_message"
              multiline
              rows={4}
              value={review.review_message}
              onChange={handleChange}
              sx={{ mb: 2 }}
              error={!review.review_message && isSubmitted}
              helperText={!review.review_message && isSubmitted ? "This field is required" : ""}
            />

            <Button 
              id="submit-review-button"
              type="button"  
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={() => setOpenConfirm(true)}
              disabled={(!isFormValid() )|| userReviews.some(
                (r) =>
                  r.school === review.school &&
                  r.sport === review.sport &&
                  normalizeString(r.head_coach_name) === normalizeString(review.head_coach_name)
              )}
            >
              Submit Review
            </Button>

            {isDuplicateReview && (
              <Typography id="duplicate-error" color="error" sx={{ mt: 2, textAlign: "center" }}>
                You have already submitted a review for this school, sport, and head coach.
              </Typography>
            )}

            <Dialog id="confirm-dialog" open={openConfirm} onClose={() => setOpenConfirm(false)}>
              <DialogTitle>Confirm Submission</DialogTitle>
              <DialogContent><DialogContentText>Are you sure you want to submit your review?
              <br />You cannot change your review once it is submitted.</DialogContentText></DialogContent>
              <DialogActions>
                <Button id="cancel-button" onClick={() => setOpenConfirm(false)} color="secondary">Cancel</Button>
                <Button id="confirm-button" onClick={handleSubmit} color="primary" variant="contained">Confirm</Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Grid>
      </Grid>
    </Box>
        </>
  );
};

export default ReviewForm;
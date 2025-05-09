import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import {
  Box, Grid,
  Typography, TextField, Button, MenuItem, Rating, Tooltip, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery,
  Autocomplete, Container, Paper, Alert, useTheme, alpha, Divider
} from "@mui/material";
import API_BASE_URL from "../utils/config";
import InfoIcon from "@mui/icons-material/Info";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SchoolIcon from "@mui/icons-material/School";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";

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
      // Try to extract a meaningful error message from the backend response
      let errorMsg = "Failed to submit review. Please try again.";
      if (data) {
        if (typeof data === "string") {
          errorMsg = data;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (Array.isArray(data)) {
          errorMsg = data.join(" ");
        } else if (typeof data === "object") {
          // Join all error messages from the object
          errorMsg = Object.values(data).flat().join(" ");
        }
      }
      setOpenConfirm(false);
      setError(errorMsg);
      return null;
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
  const theme = useTheme();
  const { schoolId, schoolName, selectedSport } = location.state || {};
  const [searchParams] = useSearchParams();
  const [schools, setSchools] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);
  const [userReviews, setUserReviews] = useState([]); // Store user's past reviews
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [error, setError] = useState(null); // Add error state
  const [searchQuery, setSearchQuery] = useState("");
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // Get school and sport from URL parameters as fallback
  const schoolIdFromURL = searchParams.get("school");
  const sportFromURL = searchParams.get("sport");

  const [review, setReview] = useState({
    school: schoolId || schoolIdFromURL || "",
    sport: selectedSport || sportFromURL || "",
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

  const sortedSchools = useMemo(() => {
    return [...schools].sort((a, b) =>
      a.school_name.localeCompare(b.school_name)
    );
  }, [schools]);

  const filteredSchools = useMemo(() => {
    return sortedSchools.filter((school) =>
      school.school_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, sortedSchools]);


  const isMobile = useMediaQuery("(max-width: 600px)");

  useEffect(() => {
    const loadData = async () => {
      const fetchedSchools = await fetchSchools();
      const fetchedReviews = await fetchUserReviews();
      setSchools(fetchedSchools);
      setUserReviews(fetchedReviews);

      // If we have a schoolId (either from state or URL), find and set the selected school
      const effectiveSchoolId = schoolId || schoolIdFromURL;
      if (effectiveSchoolId) {
        const school = fetchedSchools.find(s => s.id.toString() === effectiveSchoolId.toString());
        if (school) {
          setSelectedSchool(school);
          // Set available sports based on the pre-selected school
          const sports = [];
          if (school.mbb) sports.push("Men's Basketball");
          if (school.wbb) sports.push("Women's Basketball");
          if (school.fb) sports.push("Football");
          if (school.vb) sports.push("Volleyball");
          if (school.ba) sports.push("Baseball");
           if (school.msoc) sports.push("Men's Soccer");
          if (school.wsoc) sports.push("Women's Soccer");
          if (school.wr) sports.push("Wrestling");
          setAvailableSports(sports);

          // Update the review state with the school ID
          setReview(prev => ({ ...prev, school: effectiveSchoolId }));
        }
      }
    };
    loadData();

  }, [schoolId, schoolIdFromURL]);

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
      if (selectedSchool.vb) sports.push("Volleyball");
      if (selectedSchool.ba) sports.push("Baseball");
      if (selectedSchool.msoc) sports.push("Men's Soccer");
      if (selectedSchool.wsoc) sports.push("Women's Soccer");
      if (selectedSchool.wr) sports.push("Wrestling");
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

  const normalizeString = (str) => {
    if (!str) return '';
    return str.trim().toLowerCase().replace(/\s+/g, ' ');
  };

  const isDuplicateReview = userReviews.some(
    (r) =>
      r.school === review.school &&
      r.sport === review.sport &&
      normalizeString(r.head_coach_name) === normalizeString(review.head_coach_name)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setError(null); // Clear any previous errors

    // Normalize the coach name before checking for duplicates
    const normalizedCoachName = normalizeString(review.head_coach_name);
    
    // Check for duplicate review with case-insensitive comparison
    const duplicateReview = userReviews.some(
      (r) =>
        r.school === review.school &&
        r.sport === review.sport &&
        normalizeString(r.head_coach_name) === normalizedCoachName
    );

    if (duplicateReview) {
      setError("You have already submitted a review for this coach at this school. Only one review per coach per school is allowed.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/reviews/review-form/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(review),
      });

      const data = await response.json();

      if (!response.ok) {
        // Try to extract a meaningful error message from the backend response
        let errorMsg = "Failed to submit review. Please try again.";
        if (data) {
          if (typeof data === "string") {
            errorMsg = data;
          } else if (data.detail) {
            errorMsg = data.detail;
          } else if (Array.isArray(data)) {
            errorMsg = data.join(" ");
          } else if (typeof data === "object") {
            // Join all error messages from the object
            errorMsg = Object.values(data).flat().join(" ");
          }
        }
        setOpenConfirm(false);
        setError(errorMsg);
        return;
      }
      navigate("/secure-home");
    } catch (error) {
      console.error("Submission failed", error);
      setError("An unexpected error occurred. Please try again.");
    }
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
            id="back-button"
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
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
            id="form-title"
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
                id="page-title"
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  color: theme.palette.text.primary
                }}
              >
                Submit Your Review
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  color: theme.palette.text.secondary
                }}
              >
                Share your experience with the school's athletic program.
              </Typography>
            </Box>
          <Paper
              id="review-form"
              component="form"
              onSubmit={handleSubmit}
              elevation={2}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
              }}
            >
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2 }}
                variant="filled"
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Autocomplete
              id="school-autocomplete"
              options={sortedSchools}
              getOptionLabel={(option) => option.school_name}
              value={selectedSchool}
              onChange={(event, newValue) => {
                if (newValue) {
                  setSelectedSchool(newValue);
                  setReview({ ...review, school: newValue.id });

                  const sports = [];
                  if (newValue.mbb) sports.push("Men's Basketball");
                  if (newValue.wbb) sports.push("Women's Basketball");
                  if (newValue.fb) sports.push("Football");
                  if (newValue.vb) sports.push("Volleyball");
                  if (newValue.ba) sports.push("Baseball");
                  if (newValue.msoc) sports.push("Men's Soccer");
                  if (newValue.wsoc) sports.push("Women's Soccer");
                  if (newValue.wr) sports.push("Wrestling");
                  setAvailableSports(sports);
                } else {
                  setSelectedSchool(null);
                  setReview({ ...review, school: "" });
                  setAvailableSports([]);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="School *"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={!review.school && isSubmitted}
                  helperText={!review.school && isSubmitted ? "This field is required" : ""}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
            />

            <TextField
              id="sport-select"
              select
              fullWidth
              label="Sport *"
              name="sport"
              value={availableSports.includes(review.sport) ? review.sport : ""}
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
                <Box id={`rating-container-${field.name}`} key={index} sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  mb: 3,
                  pb: { xs: 1, sm: 0 },
                  borderBottom: { xs: `1px solid ${alpha(theme.palette.divider, 0.1)}`, sm: "none" }
                }}>
                  <Typography
                    id={`rating-label-${field.name}`}
                    sx={{
                      width: { xs: "100%", sm: "50%" },
                      mb: { xs: 1, sm: 0 },
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    {field.label}:
                    <Tooltip title={field.info} arrow>
                      <IconButton id={`info-button-${field.name}`} size="small" sx={{ ml: 1 }}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    width: { xs: "100%", sm: "auto" }
                  }}>
                    <Rating
                      id={`rating-${field.name}`}
                      data-testid={`rating-${field.name.toLowerCase().replace(' ', '-')}`}
                      name={field.name}
                      value={review[field.name]}
                      max={10}
                      onChange={(event, newValue) => handleRatingChange(field.name, newValue)}
                      sx={{
                        color: !review[field.name] && isSubmitted ? "red" : "",
                        ml: { xs: 0, sm: 0 }
                      }}
                    />
                    {isSubmitted && !review[field.name] && (
                      <Typography sx={{ color: "red", ml: 2, fontSize: "0.9rem" }}>
                        Required
                      </Typography>
                    )}
                  </Box>
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
              Submit Review
            </Button>

            {isDuplicateReview && (
              <Alert
                id="duplicate-error"
                severity="error"
                sx={{ mt: 3, borderRadius: 2 }}
                variant="outlined"
              >
                You have already submitted a review for this school, sport, and head coach.
              </Alert>
            )}

            <Dialog
              id="confirm-dialog"
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
                sx={{
                  textAlign: 'center',
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  pb: 1
                }}
              >
                Confirm Submission
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ textAlign: 'center', mb: 2 }}>
                  Are you sure you want to submit your review?
                  <br />You cannot change your review once it is submitted.
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
                <Button
                  id="cancel-button"
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
                  id="confirm-button"
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
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </Container>
  );
};

export default ReviewForm;
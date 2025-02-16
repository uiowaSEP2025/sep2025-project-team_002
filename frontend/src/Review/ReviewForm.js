import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Rating, 
  Tooltip,
  IconButton
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE_URL from "../utils/config";
import InfoIcon from "@mui/icons-material/Info";


const fetchSchools = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schools/`);
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
  }
};


const ReviewForm = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);
  const [review, setReview] = useState({
    school: "", // Updated to an empty string for better selection handling
    sport: "",
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

  useEffect(() => {
    const loadSchools = async () => {
      const fetchedSchools = await fetchSchools();
      setSchools(fetchedSchools);
    };
    loadSchools();
  }, []);

  const handleChange = (e) => {
    setReview({ ...review, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (name, newValue) => {
    setReview({ ...review, [name]: newValue });
  };

  const handleSchoolChange = (e) => {
    const selectedSchoolId = e.target.value;
    setReview({ ...review, school: selectedSchoolId, sport: "" });
  
    // Find the selected school and update the available sports list
    const selectedSchool = schools.find((school) => school.id === parseInt(selectedSchoolId));
    setAvailableSports(selectedSchool ? selectedSchool.available_sports : []);
  };

  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission attempt

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true); // Mark form as attempted
  
    // Check if required fields are empty
    const requiredFields = ["school", "sport", "review_message", "head_coach_name"];
    const ratingFields = [
      "head_coach",
      "assistant_coaches",
      "team_culture",
      "campus_life",
      "athletic_facilities",
      "athletic_department",
      "player_development",
      "nil_opportunity",
    ];
  
    const isFormValid =
      requiredFields.every((field) => review[field]) &&
      ratingFields.every((field) => review[field] > 0); // Ensure ratings are filled
  
    if (!isFormValid) {
      return; // Stop submission if validation fails
    }
  
    try {
      await submitReview(review);
      navigate("/secure-home"); // Redirect after successful submission
    } catch (error) {
      console.error("Submission failed", error);
    }
  };  

  return (
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
              Submit Your Review
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4 }}>
              Share your experience with the school's athletic program.
            </Typography>
          </motion.div>

          <Box component="form" onSubmit={handleSubmit} sx={{ backgroundColor: "#fff", p: 4, borderRadius: 2, boxShadow: 3 }}>
          <TextField
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
              <MenuItem key={school.id} value={school.id}>
                {school.school_name}
              </MenuItem>
            ))}
          </TextField>

            <TextField
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
                <MenuItem key={index} value={sport}>
                  {sport}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Head Coach's Name *"
              name="head_coach_name"
              rows={1}
              value={review.head_coach_name}
              onChange={handleChange}
              sx={{ mb: 2 }}
              error={!review.head_coach_name.trim() && isSubmitted}
              helperText={!review.head_coach_name.trim() && isSubmitted ? "This field is required" : ""}

            />

            {/* Ratings */}
            {[
                  { label: "Head Coach* ", name: "head_coach", info: "Rate the quality of the head coach's leadership and coaching ability." },
                  { label: "Assistant Coaches* ", name: "assistant_coaches", info: "Evaluate the knowledge and support provided by assistant coaches." },
                  { label: "Team Culture* ", name: "team_culture", info: "Rate the atmosphere, team chemistry, and overall culture of the program." },
                  { label: "Campus Life* ", name: "campus_life", info: "Assess the school's campus environment, student experience, and activities." },
                  { label: "Athletic Facilities* ", name: "athletic_facilities", info: "Evaluate the quality of training rooms, venues, and practice facilities." },
                  { label: "Athletic Department* ", name: "athletic_department", info: "Rate the support, culture, and effectiveness of the school's athletic department." },
                  { label: "Player Development* ", name: "player_development", info: "Assess how well the coaches helps athletes improve their skills." },
                  { label: "NIL Opportunity* ", name: "nil_opportunity", info: "Rate your school's NIL potential and the opportunities for athletes to profit." }
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
                  <Rating
                    name={field.name}
                    value={review[field.name]}
                    max={10}
                    onChange={(event, newValue) => handleRatingChange(field.name, newValue)}
                    sx={{ color: !review[field.name] && isSubmitted ? "red" : "" }} // Highlight error
                  />
                  {isSubmitted && !review[field.name] && (
                    <Typography sx={{ color: "red", ml: 2, fontSize: "0.9rem" }}>
                      Required
                    </Typography>
                  )}
                </Box>
              ))}

            <TextField
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

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit Review
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReviewForm;
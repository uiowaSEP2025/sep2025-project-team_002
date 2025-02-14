import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  Rating
} from "@mui/material";
import { motion } from "framer-motion";
import API_BASE_URL from "./utils/config";

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
    const token = localStorage.getItem("token"); // Get JWT token
    const response = await fetch(`${API_BASE_URL}/api/reviews/review-form/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      throw new Error("Failed to submit review");
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
  }
};

const ReviewForm = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [review, setReview] = useState({
    school: "", // Updated to an empty string for better selection handling
    sport: "",
    review_message: "",
    head_coach: 0,
    assistant_coaches: 0,
    team_culture: 0,
    campus_life: 0,
    athletic_facilities: 0,
    athletic_department: 0,
    player_development: 0,
    nil_opportunity: 0,
    date_of_review: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
              label="School"
              name="school"
              value={review.school}
              onChange={handleChange}
              sx={{ mb: 2 }}
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
              label="Sport"
              name="sport"
              value={review.sport}
              onChange={handleChange}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Basketball">Basketball</MenuItem>
              <MenuItem value="Football">Football</MenuItem>
              <MenuItem value="Soccer">Soccer</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Review Message"
              name="review_message"
              multiline
              rows={4}
              value={review.review_message}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            {/* Ratings */}
            {[
              { label: "Head Coach", name: "head_coach" },
              { label: "Assistant Coaches", name: "assistant_coaches" },
              { label: "Team Culture", name: "team_culture" },
              { label: "Campus Life", name: "campus_life" },
              { label: "Athletic Facilities", name: "athletic_facilities" },
              { label: "Athletic Department", name: "athletic_department" },
              { label: "Player Development", name: "player_development" },
              { label: "NIL Opportunity", name: "nil_opportunity" }
            ].map((field, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography sx={{ width: "50%" }}>{field.label}:</Typography>
                <Rating
                  name={field.name}
                  value={review[field.name]}
                  onChange={(event, newValue) => handleRatingChange(field.name, newValue)}
                />
              </Box>
            ))}

            <TextField
              fullWidth
              type="date"
              label="Date of Review"
              name="date_of_review"
              InputLabelProps={{ shrink: true }}
              value={review.date_of_review}
              onChange={handleChange}
              sx={{ mb: 3 }}
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
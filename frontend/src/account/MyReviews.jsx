import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent
} from "@mui/material";
import API_BASE_URL from "../utils/config";

export async function fetchUserReviews() {
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
}

function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await fetchUserReviews();
        setReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", marginTop: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body1">
        {error}
      </Typography>
    );
  }

  if (reviews.length === 0) {
    return <Typography>No reviews found.</Typography>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        My Reviews
      </Typography>
       {reviews.map((review) => (
        <Card key={review.review_id} sx={{ mb: 2 }}>
          <CardContent>
            {/* If your serializer has "school_name": */}
            <Typography variant="h6">
              {review.school_name ?? "Untitled School"}
            </Typography>

            {/* Sport */}
            <Typography variant="subtitle1" sx={{ color: "gray" }}>
              Sport: {review.sport || "N/A"}
            </Typography>

            {/* The main review text/content */}
            <Typography variant="body1" sx={{ mt: 1 }}>
              {review.review_message ?? "No review text"}
            </Typography>

            {/* Example: Head Coach Name + rating */}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Head Coach: {review.head_coach_name || "Unknown"}
              {" • "}
              Rating: {review.head_coach}/5
            </Typography>

            <Typography variant="body2">
              Assistant Coaches: {review.assistant_coaches}/5
            </Typography>
            <Typography variant="body2">
              Team Culture: {review.team_culture}/5
            </Typography>
            <Typography variant="body2">
              Campus Life: {review.campus_life}/5
            </Typography>
            <Typography variant="body2">
              Athletic Facilities: {review.athletic_facilities}/5
            </Typography>
            <Typography variant="body2">
              Athletic Department: {review.athletic_department}/5
            </Typography>
            <Typography variant="body2">
              Player Development: {review.player_development}/5
            </Typography>
            <Typography variant="body2">
              NIL Opportunity: {review.nil_opportunity}/5
            </Typography>

            {/* Example: creation date (if your Review model has created_at) */}
            {review.created_at && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {new Date(review.created_at).toLocaleDateString()}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default MyReviews;

import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Card, CardContent } from "@mui/material";

// src/reviews/api.js (an example utility file)
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
        <Card key={review.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{review.school_name ?? "Untitled School"}</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {review.content}
            </Typography>
            {/* any other fields, rating, date, etc. */}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

export default MyReviews;

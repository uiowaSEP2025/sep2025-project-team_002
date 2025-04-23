import React from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import RatingRow from './RatingRow';

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          No reviews available
        </Typography>
      </Box>
  );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Reviews
      </Typography>
      {reviews.map((review, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">
            Head Coach: {review.head_coach_name}
          </Typography>
          
          <Typography variant="body1" sx={{ my: 2 }}>
            {review.review_message}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <RatingRow label="Head Coach" value={review.head_coach} />
              <RatingRow label="Assistant Coaches" value={review.assistant_coaches} />
              <RatingRow label="Team Culture" value={review.team_culture} />
              <RatingRow label="Campus Life" value={review.campus_life} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RatingRow label="Athletic Facilities" value={review.athletic_facilities} />
              <RatingRow label="Athletic Department" value={review.athletic_department} />
              <RatingRow label="Player Development" value={review.player_development} />
              <RatingRow label="NIL Opportunity" value={review.nil_opportunity} />
            </Grid>
          </Grid>
          
          <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
            Posted on {new Date(review.created_at).toLocaleDateString()}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default ReviewList; 
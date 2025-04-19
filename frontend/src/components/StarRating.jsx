import React from 'react';
import { Box, Rating, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const StarRating = ({ rating, showValue = false, size = "small" }) => {
  // Ensure rating is a number and between 0-10
  const numericRating = Number(rating) || 0;
  const normalizedRating = Math.min(Math.max(numericRating, 0), 10);
  
  // Convert 0-10 scale to 0-5 scale for the Rating component
  const fiveStarRating = normalizedRating / 2;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Rating 
        value={fiveStarRating} 
        precision={0.5}
        readOnly
        size={size}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize={size} />}
      />
      {showValue && (
        <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
          {normalizedRating.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};

export default StarRating;

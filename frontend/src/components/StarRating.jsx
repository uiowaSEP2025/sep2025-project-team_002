import React from 'react';
import { Box, Rating, Typography, useTheme, alpha } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

const StarRating = ({ rating, showValue = false, size = "small" }) => {
  const theme = useTheme();

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
        sx={{
          color: theme.palette.warning.main,
          '& .MuiRating-iconEmpty': {
            color: alpha(theme.palette.warning.main, 0.3)
          }
        }}
        emptyIcon={<StarIcon fontSize={size} />}
      />
      {showValue && (
        <Typography
          variant="body2"
          sx={{
            ml: 0.5,
            fontWeight: 600,
            color: theme.palette.text.primary,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            px: 0.8,
            py: 0.2,
            borderRadius: 1,
            fontSize: size === 'small' ? '0.75rem' : '0.875rem'
          }}
        >
          {normalizedRating.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};

export default StarRating;

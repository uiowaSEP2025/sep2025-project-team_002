import React from 'react';
import { Chip, Box } from '@mui/material';

const ReviewTags = ({ tags, sentiment }) => {
  if (!tags || tags.length === 0) return null;

  // Get sentiment color
  const getSentimentColor = () => {
    if (!sentiment) return 'default';
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      case 'neutral':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {/* Sentiment tag */}
      {sentiment && (
        <Chip
          label={sentiment}
          color={getSentimentColor()}
          size="small"
          sx={{ mr: 1 }}
        />
      )}
      
      {/* Content tags */}
      {tags.map((tag, index) => (
        <Chip
          key={index}
          label={tag}
          variant="outlined"
          size="small"
          sx={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
            }
          }}
        />
      ))}
    </Box>
  );
};

export default ReviewTags; 
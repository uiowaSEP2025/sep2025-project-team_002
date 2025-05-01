import React, { useState, useEffect } from 'react';
import { Typography, Box, Skeleton, useTheme, alpha, Chip, Divider } from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import API_BASE_URL from '../utils/config';

const ReviewSummary = ({ schoolId, sport }) => {
  const theme = useTheme();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sport code mapping
  const sportToCode = {
    "Men's Basketball": "mbb",
    "Women's Basketball": "wbb",
    "Football": "fb"
  };

  // Helper function to parse markdown bold and italic syntax
  const renderFormattedText = (text) => {
    // First split by bold syntax
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Handle bold text
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('*') && part.endsWith('*')) {
        // Handle italic text with custom color for the status tag
        return (
          <em key={i} style={{ color: '#ff6b6b', fontStyle: 'italic', marginLeft: '8px' }}>
            {part.slice(1, -1)}
          </em>
        );
      }
      // Further split remaining text by italic syntax
      return part.split(/(\*.*?\*)/).map((subPart, j) => {
        if (subPart.startsWith('*') && subPart.endsWith('*')) {
          return (
            <em key={`${i}-${j}`} style={{ color: '#ff6b6b', fontStyle: 'italic', marginLeft: '8px' }}>
              {subPart.slice(1, -1)}
            </em>
          );
        }
        return subPart;
      });
    });
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        // Convert sport display name to code if needed
        const sportCode = sportToCode[sport] || sport;

        // Use public route if no token, otherwise use protected route
        const endpoint = token
          ? `${API_BASE_URL}/api/schools/${schoolId}/reviews/summary/?sport=${encodeURIComponent(sportCode)}`
          : `${API_BASE_URL}/api/public/schools/${schoolId}/reviews/summary/?sport=${encodeURIComponent(sportCode)}`;

        const headers = token
          ? {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          : {
              'Content-Type': 'application/json'
            };

        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (response.ok) {
          setSummary(data.summary);
        } else {
          setError(data.error || 'Failed to fetch summary');
        }
      } catch (error) {
        console.error('Error in fetchSummary:', error);
        setError('Failed to fetch summary');
      } finally {
        setLoading(false);
      }
    };

    if (schoolId && sport) {
      fetchSummary();
    }
  }, [schoolId, sport]);

  if (!sport) return null;
  if (loading) return <Typography>Loading summary...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!summary) return <Typography>No summary available</Typography>;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {sport} Program Reviews Summary
      </Typography>
      {summary.split('\n').map((paragraph, index) => (
        paragraph ? (
          <Typography
            key={index}
            sx={{
              mb: 0.5, // Reduced margin bottom
              ...(paragraph.includes('**') && { mt: 1.5 }) // Add margin top only for new coach sections
            }}
          >
            {renderFormattedText(paragraph)}
          </Typography>
        ) : <Box key={index} sx={{ height: '0.5em' }} /> // Reduced empty line spacing
      ))}
    </Box>
  );
};

export default ReviewSummary;
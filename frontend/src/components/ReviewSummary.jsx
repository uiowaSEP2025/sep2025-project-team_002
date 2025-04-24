import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import API_BASE_URL from '../utils/config';

const ReviewSummary = ({ schoolId, sport }) => {
  const [summary, setSummary] = useState('');
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
    console.log('ReviewSummary component mounted');
    console.log('Props received:', { schoolId, sport });
    
    const fetchSummary = async () => {
      try {
        // Convert sport display name to code if needed
        const sportCode = sportToCode[sport] || sport;
        console.log('Sport conversion:', { original: sport, code: sportCode });

        const url = `${API_BASE_URL}/api/public/schools/${schoolId}/reviews/summary/?sport=${encodeURIComponent(sportCode)}`;
        console.log('Fetching summary from URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
          const fullSummary = data.summary;
          setSummary(fullSummary);
          console.log('Summary set:', fullSummary);

        } else {
          setError(data.error || 'Failed to fetch summary');
          console.error('Error fetching summary:', data.error);
        }
      } catch (error) {
        console.error('Error in fetchSummary:', error);
        setError('Failed to fetch summary');
      }
    };

    if (schoolId && sport) {
      console.log('Initiating summary fetch');
      fetchSummary();
    } else {
      console.log('Missing required props:', { schoolId, sport });
    }
  }, [schoolId, sport]);

  if (error) {
    console.error('Rendering error state:', error);
    return <Typography color="error">{error}</Typography>;
  }

  if (!summary) {
    console.log('No summary available');
    return <Typography>Loading summary...</Typography>;
  }

  console.log('Rendering summary:', summary);
  // Split the summary into paragraphs and render each with proper spacing
  return (
    <Box>
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
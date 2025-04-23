import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
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
          console.log('FULL REVIEW SUMMARY RECEIVED:', fullSummary); 

          // Extract and log only the tenure part
          const lines = fullSummary.split('\n');
          // Find the tenure lines - they should be between "Reviews for" and the next empty line
          const startIndex = lines.findIndex(line => line.includes('Reviews for')) + 1;
          const endIndex = lines.findIndex((line, idx) => idx > startIndex && line.trim() === '');
          
          if (startIndex > 0 && endIndex > startIndex) {
            const tenureLines = lines.slice(startIndex, endIndex).filter(line => line.trim());
            if (tenureLines.length > 0) {
              console.log('TENURE HISTORY:');
              tenureLines.forEach(line => console.log(line.trim()));
            }
          } else {
            console.log('No tenure information found in expected format');
          }

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
  return <Typography>{summary}</Typography>;
};

export default ReviewSummary; 
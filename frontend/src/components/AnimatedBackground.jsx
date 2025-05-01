import React from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AnimatedBackground = ({ variant = 'default' }) => {
  const theme = useTheme();

  // Get background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'sports':
        return `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;
      case 'bubbles':
        return `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.light} 100%)`;
      case 'minimal':
        return `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`;
      default:
        return `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`;
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        opacity: 0.2,
        background: getBackgroundColor(),
      }}
    />
  );
};

export default AnimatedBackground;

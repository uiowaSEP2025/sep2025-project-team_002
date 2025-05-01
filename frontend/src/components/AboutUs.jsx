import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardMedia, 
  Divider, 
  useTheme, 
  alpha 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SchoolIcon from '@mui/icons-material/School';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import GroupsIcon from '@mui/icons-material/Groups';

import annaImage from '../../public/assets/aboutus/anna.png';
import yusufImage from '../../public/assets/aboutus/yusuf.png';
import samImage from '../../public/assets/aboutus/sam.png';
import rodImage from '../../public/assets/aboutus/rod.png';
import jingmingImage from '../../public/assets/aboutus/jingming.png';


function AboutUs() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [fadeIn, setFadeIn] = useState(false);
  
  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // Assign a unique image to each team member
  const teamMembers = [
    { name: "Samantha Pothitakis", role: "Electrical and Computer Engineering, MS student", image: samImage },
    { name: "Rodrigo Medina", role: "Computer Science, BS student", image: rodImage },
    { name: "Jingming Liang", role: "Electrical and Computer Engineering PhD student", image: jingmingImage },
    { name: "Yusuf Halim", role: "Computer Science and Engineering, BSE student", image: yusufImage },
    { name: "Anna Davis", role: "Master of Computer Science student", image: annaImage }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}
      >
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, position: 'relative' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ 
              position: { xs: 'relative', md: 'absolute' },
              left: 0,
              borderRadius: 2,
              transition: 'transform 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Back
          </Button>
          
          <Typography 
            variant="h4" 
            component="h1" 
            align="center" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Athletic Insider
          </Typography>
        </Box>
        
        {/* Main content */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            mb: 4
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            gap: 2
          }}>
            <SchoolIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              Who we are
            </Typography>
          </Box>
          
          <Typography variant="h5" sx={{ mb: 3, color: theme.palette.secondary.main, fontWeight: 600 }}>
            Your go-to platform for the latest in sports transfer insights.
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            We're a team of five passionate students from the University of Iowa who came together with a shared mission:
            to make the student-athlete transfer process smoother, more transparent, and fair.
            Our journey started in our Software Engineering Projects course, where we realized we had the desire to create something meaningful.
          </Typography>

          <Typography variant="body1" paragraph>
            The spark for this project came from Anna, a former D1 volleyball player who experienced
            firsthand how challenging and unclear the transfer process can be. She brought the idea to the group,
            and from that moment, we were all in. We saw the real impact our platform could have on thousands of
            student-athletes navigating big changes in their careers and lives. Now, we're turning that vision into
            reality—one line of code at a time!
          </Typography>
        </Paper>
        
        {/* Team section */}
        <Paper 
          elevation={2} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4,
            gap: 2
          }}>
            <GroupsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              Meet our team
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={member.image}
                    alt={member.name}
                    sx={{ 
                      height: 220,
                      objectFit: 'cover',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}

export default AboutUs;

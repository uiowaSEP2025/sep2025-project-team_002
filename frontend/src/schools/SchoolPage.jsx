import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Rating,
  Stack,
  Grid,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import API_BASE_URL from "../utils/config";

function SchoolPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const endpoint = isAuthenticated 
          ? `${API_BASE_URL}/api/schools/${id}/`
          : `${API_BASE_URL}/api/public/schools/${id}/`;
        
        const headers = {
          'Content-Type': 'application/json',
        };

        if (isAuthenticated) {
          headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        }

        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSchool(data);
      } catch (error) {
        console.error('Error fetching school:', error);
      }
    };

    fetchSchool();
  }, [id, isAuthenticated]);

  const ratingFields = [
    { label: "Head Coach", field: "head_coach" },
    { label: "Assistant Coaches", field: "assistant_coaches" },
    { label: "Team Culture", field: "team_culture" },
    { label: "Campus Life", field: "campus_life" },
    { label: "Athletic Facilities", field: "athletic_facilities" },
    { label: "Athletic Department", field: "athletic_department" },
    { label: "Player Development", field: "player_development" },
    { label: "NIL Opportunity", field: "nil_opportunity" },
  ];

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", pt: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate(isAuthenticated ? '/secure-home' : '/')}
            variant="contained"
          >
            Back to Home
          </Button>
        </Box>

        {school ? (
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                  {school.school_name}
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Conference: {school.conference}
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Location: {school.location}
                </Typography>
                
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Available Sports:
                </Typography>
                <Typography variant="body1">
                  {school.available_sports && school.available_sports.length > 0 
                    ? school.available_sports.join(' • ')
                    : 'No sports listed'
                  }
                </Typography>
              </CardContent>
            </Card>

            {isAuthenticated && (
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
                    Reviews
                  </Typography>
                  
                  {school.reviews && school.reviews.length > 0 ? (
                    school.reviews.map((review, index) => (
                      <Box key={index} sx={{ mb: 4 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {review.sport} - Coach {review.head_coach_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Posted on {new Date(review.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          {ratingFields.map((field) => (
                            <Grid item xs={12} sm={6} md={3} key={field.field}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Typography variant="body2" color="text.secondary">
                                  {field.label}
                                </Typography>
                                <Rating 
                                  value={review[field.field]} 
                                  readOnly 
                                  max={10}
                                />
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                          {review.review_message}
                        </Typography>

                        <Divider sx={{ mt: 3 }} />
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      No reviews yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {!isAuthenticated && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ textAlign: 'center' }}>
                    <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main' }}>
                      Log in to view and submit reviews
                    </Link>
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Container>
    </Box>
  );
}

export default SchoolPage; 
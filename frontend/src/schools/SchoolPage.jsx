import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Tabs,
  Tab,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import API_BASE_URL from "../utils/config";
import Bugsnag from '@bugsnag/js';
import ReviewSummary from '../components/ReviewSummary';

function SchoolPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = token 
          ? `${API_BASE_URL}/api/schools/${id}/`
          : `${API_BASE_URL}/api/public/schools/${id}/`;

        const headers = token
          ? {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          : {
              'Content-Type': 'application/json'
            };

        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSchool(data);
        
        // Set default selected sport if available
        if (data.mbb) setSelectedSport("Men's Basketball");
        else if (data.wbb) setSelectedSport("Women's Basketball");
        else if (data.fb) setSelectedSport("Football");
      } catch (error) {
        console.error('Error fetching school:', error);
        Bugsnag.notify(error);
      }
    };

    fetchSchool();
  }, [id]);

  if (!school) return <div>Loading...</div>;

  const availableSports = [];
  if (school.mbb) availableSports.push("Men's Basketball");
  if (school.wbb) availableSports.push("Women's Basketball");
  if (school.fb) availableSports.push("Football");

  const handleWriteReview = (sport) => {
    navigate(`/reviews/new?school=${id}&sport=${encodeURIComponent(sport)}`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Navigation */}
        <Button
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{ mb: 2 }}
        >
          Back to Schools
        </Button>

        {/* School Header */}
        <Typography variant="h3" component="h1" gutterBottom>
          {school.school_name}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {school.conference} • {school.location}
        </Typography>

        {/* Sport Selection Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={selectedSport}
            onChange={(e, newValue) => setSelectedSport(newValue)}
            aria-label="sports tabs"
          >
            {availableSports.map((sport) => (
              <Tab
                key={sport}
                label={sport}
                value={sport}
              />
            ))}
          </Tabs>
        </Box>

        {/* Sport-specific Content */}
        {selectedSport && (
          <Box>
            <Typography variant="h4" gutterBottom>
              {selectedSport} Program
            </Typography>
            
            {/* Reviews Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Program Summary
                </Typography>
                <ReviewSummary schoolId={id} sport={selectedSport} />
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Reviews
                  </Typography>
                  {isAuthenticated && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/reviews/new`, {
                        state: { 
                          schoolId: id,
                          schoolName: school.school_name,
                          selectedSport: selectedSport 
                        }
                      })}
                    >
                      Write a Review
                    </Button>
                  )}
                </Box>
                
                {/* Filter reviews by sport */}
                {school.reviews
                  .filter(review => review.sport === selectedSport)
                  .map((review) => (
                    <Card key={review.review_id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Head Coach: {review.head_coach_name}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {review.review_message}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2">Head Coach</Typography>
                            <Rating value={review.head_coach} readOnly max={10} />
                            <Typography variant="caption">{review.head_coach}/10</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2">Assistant Coaches</Typography>
                            <Rating value={review.assistant_coaches} readOnly max={10} />
                            <Typography variant="caption">{review.assistant_coaches}/10</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2">Team Culture</Typography>
                            <Rating value={review.team_culture} readOnly max={10} />
                            <Typography variant="caption">{review.team_culture}/10</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2">Campus Life</Typography>
                            <Rating value={review.campus_life} readOnly max={10} />
                            <Typography variant="caption">{review.campus_life}/10</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2">Athletic Facilities</Typography>
                            <Rating value={review.athletic_facilities} readOnly max={10} />
                            <Typography variant="caption">{review.athletic_facilities}/10</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2">Athletic Department</Typography>
                            <Rating value={review.athletic_department} readOnly max={10} />
                            <Typography variant="caption">{review.athletic_department}/10</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2">Player Development</Typography>
                            <Rating value={review.player_development} readOnly max={10} />
                            <Typography variant="caption">{review.player_development}/10</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2">NIL Opportunity</Typography>
                            <Rating value={review.nil_opportunity} readOnly max={10} />
                            <Typography variant="caption">{review.nil_opportunity}/10</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default SchoolPage; 
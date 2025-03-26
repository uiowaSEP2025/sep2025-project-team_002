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
          id="back-button"
          startIcon={<HomeIcon />}
          onClick={() => navigate("/")}
          sx={{ mb: 2 }}
        >
          Back to Schools
        </Button>

        {/* School Header */}
        <Typography id="school-name" variant="h3" component="h1" gutterBottom>
          {school.school_name}
        </Typography>
        <Typography id="school-info" variant="h6" color="text.secondary" gutterBottom>
          {school.conference} • {school.location}
        </Typography>

        {/* Sport Selection Tabs */}
        <Box id="sports-tabs" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={selectedSport}
            onChange={(e, newValue) => setSelectedSport(newValue)}
            aria-label="sports tabs"
          >
            {availableSports.map((sport) => (
              <Tab
                id={`sport-tab-${sport.replace(/\s+/g, '-').toLowerCase()}`}
                key={sport}
                label={sport}
                value={sport}
              />
            ))}
          </Tabs>
        </Box>

        {/* Sport-specific Content */}
        {selectedSport && (
          <Box id={`${selectedSport.replace(/\s+/g, '-').toLowerCase()}-content`}>
            <Typography id="program-title" variant="h4" gutterBottom>
              {selectedSport} Program
            </Typography>
            
            {/* Reviews Summary */}
            <Card id="summary-card" sx={{ mb: 3 }}>
              <CardContent>
                <Typography id="summary-title" variant="h6" gutterBottom>
                  Program Summary
                </Typography>
                <ReviewSummary schoolId={id} sport={selectedSport} />
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card id="reviews-section">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography id="reviews-title" variant="h6">
                    Reviews
                  </Typography>
                  {isAuthenticated && (
                    <Button
                      id="write-review-button"
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
                    <Card 
                      id={`review-${review.review_id}`}
                      key={review.review_id} 
                      sx={{ mb: 2 }}
                    >
                      <CardContent>
                        <Typography id={`coach-name-${review.review_id}`} variant="h6" gutterBottom>
                          Head Coach: {review.head_coach_name}
                        </Typography>
                        <Typography id={`review-text-${review.review_id}`} variant="body1" paragraph>
                          {review.review_message}
                        </Typography>
                        <Grid container spacing={2}>
                          {[
                            ['head_coach', 'Head Coach'],
                            ['assistant_coaches', 'Assistant Coaches'],
                            ['team_culture', 'Team Culture'],
                            ['campus_life', 'Campus Life'],
                            ['athletic_facilities', 'Athletic Facilities'],
                            ['athletic_department', 'Athletic Department'],
                            ['player_development', 'Player Development'],
                            ['nil_opportunity', 'NIL Opportunity']
                          ].map(([field, label]) => (
                            <Grid item xs={6} sm={3} key={field}>
                              <Typography id={`${field}-label-${review.review_id}`} variant="subtitle2">
                                {label}
                              </Typography>
                              <Rating 
                                id={`${field}-rating-${review.review_id}`}
                                value={review[field]} 
                                readOnly 
                                max={10} 
                              />
                              <Typography id={`${field}-score-${review.review_id}`} variant="caption">
                                {review[field]}/10
                              </Typography>
                            </Grid>
                          ))}
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
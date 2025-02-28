import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import API_BASE_URL from "../utils/config";

function SchoolPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/schools/${id}/`);
        const data = await response.json();
        setSchool(data);
      } catch (error) {
        console.error('Error fetching school:', error);
      }
    };

    fetchSchool();
  }, [id]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", pt: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/secure-home')}
            variant="contained"
          >
            Back to Home
          </Button>
        </Box>

        {school ? (
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
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Container>
    </Box>
  );
}

export default SchoolPage; 
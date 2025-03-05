import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"
import { Stack, Card, CardContent, Box, Typography } from "@mui/material";
import API_BASE_URL from "../utils/config";

function Home() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSchoolClick = (schoolId) => {
    navigate(`/school/${schoolId}`);
  };

  const fetchSchools = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/schools/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
      setSchools([]);
    }
  };

  return (
    <div>
        {/* Navbar */}
        <nav style = {styles.navbar}>
            <h2 style = {styles.logo}>Athletic Insider </h2>
            <div>
                <Link to = "/signup" style = {styles.navLink}> Sign Up</Link>
                <Link to = "/login" style = {styles.navLink}> Login </Link>
            </div>
        </nav>
        {/* Main Content */}
        <div style={styles.container}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                Schools
            </Typography>
            <Stack spacing={2} sx={{ px: 2, pb: 4 }}>
              {schools?.map((school) => (
                <Card 
                  key={school.id} 
                  sx={{ 
                    width: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                  onClick={() => handleSchoolClick(school.id)}
                >
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      flexWrap: 'wrap'
                    }}>
                      <Typography variant="h6" sx={{ my: 0, fontWeight: 700 }}>
                        {school.school_name}
                      </Typography>
                      <Typography variant="body2">
                        {school.available_sports && school.available_sports.length > 0 
                          ? school.available_sports.join(' • ')
                          : 'No sports listed'
                        }
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
        </div>
    </div>
  );
}

const styles = {
    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#333",
        padding: "1rem",
        color: "#fff",
    },
    logo: {
        margin: "0",
    },
    navLink: {
        color: "#fff",
        textDecoration: "none",
        margin: "0 10px",
    },
    container: {
        textAlign: "center",
        marginTop: "50px",
        marginBottom: "50px",
    },
};

export default Home;
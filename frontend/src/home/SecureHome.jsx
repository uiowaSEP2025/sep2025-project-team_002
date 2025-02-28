import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Card,
  CardContent,
  Stack,
  Grid as MuiGrid
} from "@mui/material";
import { motion } from "framer-motion";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import API_BASE_URL from "../utils/config";

function SecureHome() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [schools, setSchools] = useState([]);

  // Handle opening the dropdown menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the dropdown menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Logout handler: clear token and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

    // Navigate to review form
    const handleGoToReviewForm = () => {
      navigate("/review-form");
    };

  // Account info handler: redirect to account info page (update route as needed)
  const handleAccountInfo = () => {
    navigate("/account");
  };

  const handleSchoolClick = (schoolId) => {
    navigate(`/school/${schoolId}`);
  };

  useEffect(() => {
    // Fetch schools data when component mounts
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/schools/`);
      const data = await response.json();
      console.log('Schools data:', data);
      setSchools(data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  return (
    <Box sx={{ position: "relative", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Top Right Circular Icon */}
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}>
        <IconButton
          onClick={handleMenuOpen}
          size="large"
          sx={{ bgcolor: "#fff", borderRadius: "50%" }}
        >
          <AccountCircleIcon fontSize="large" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={() => { handleAccountInfo(); handleMenuClose(); }}>
            Account Info
          </MenuItem>
          <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
            Logout
          </MenuItem>
        </Menu>
      </Box>

      <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "100vh", py: 4 }}>
        <Grid item xs={12} md={10}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}>
              Schools and Sports
            </Typography>

            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGoToReviewForm}
              >
                Submit a Review
              </Button>
            </Box>

            <Stack spacing={2} sx={{ px: 2 }}>
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
                      <Typography variant="body2" color="text.secondary">
                        Sports:
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
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SecureHome;

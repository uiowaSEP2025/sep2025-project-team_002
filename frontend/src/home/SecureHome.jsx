import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  Grid as MuiGrid,
  Pagination,
  TextField
} from "@mui/material";
import { motion } from "framer-motion";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import API_BASE_URL from "../utils/config";

function SecureHome() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [schools, setSchools] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const schoolsPerPage = 10;


  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  const query = useQuery();
  const initialPage = parseInt(query.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const initialSearchQuery = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  // User info state
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    transfer_type: "",
    profile_picture: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch User Info
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/user/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            transfer_type: data.transfer_type || "",
            profile_picture: data.profile_picture || "",

          });
        } else {
          const errorData = await response.json();
          // setMessage(errorData.detail || errorData.error || "Unknown Error");
        }
      } catch (error) {
        console.error("Account page error:", error);
        // setMessage("Network error: " + error.message);
      }
    };

    // Fetch Schools
    const fetchSchools = async () => {
      try {
        console.log("Fetching schools from:", `${API_BASE_URL}/api/schools/`);
        const response = await fetch(`${API_BASE_URL}/api/schools/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Schools data:", data);
        setSchools(data);
      } catch (error) {
        console.error("Error fetching schools:", error);
        setSchools([]);
      }
    };

    // Call both functions in parallel
    fetchUserInfo();
    fetchSchools();
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("page", currentPage);
    navigate({ search: params.toString() });
  }, [currentPage]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromURL = parseInt(params.get("page"), 10) || 1;
    if (pageFromURL !== currentPage) {
      setCurrentPage(pageFromURL);
    }
  }, [location.search]);

  useEffect(() => {
    if (searchQuery !== prevSearchQuery) {
      setCurrentPage(1);
      const params = new URLSearchParams(location.search);
      params.set("page", 1);
      navigate({ search: params.toString() });
      setPrevSearchQuery(searchQuery);
    }
  }, [searchQuery, prevSearchQuery, navigate]);

  useEffect(() => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    if (currentPage) params.page = currentPage;
    setSearchParams(params);
  }, [currentPage, searchQuery, setSearchParams]);

  // 当 URL 发生变化时，同步更新页面状态（防止浏览器的返回/前进）
  useEffect(() => {
    const pageFromURL = parseInt(searchParams.get("page"), 10) || 1;
    const searchFromURL = searchParams.get("search") || "";
    if (pageFromURL !== currentPage) setCurrentPage(pageFromURL);
    if (searchFromURL !== searchQuery) setSearchQuery(searchFromURL);
  }, [searchParams]);

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

  // Navigate to review form
  const handleGoToPreferenceForm = () => {
    navigate("/preference-form");
  };

  // Account info handler: redirect to account info page (update route as needed)
  const handleAccountInfo = () => {
    navigate("/account");
  };

  const handleSchoolClick = (schoolId) => {
    navigate(`/school/${schoolId}`);
  };

  // useEffect(() => {
  //   // Fetch schools data when component mounts
  //   fetchSchools();
  // }, []);
  //
  // const fetchSchools = async () => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     console.log('Fetching schools from:', `${API_BASE_URL}/api/schools/`);
  //
  //     const response = await fetch(`${API_BASE_URL}/api/schools/`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json',
  //       },
  //     });
  //
  //     console.log('Response status:', response.status);
  //
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }
  //
  //     const data = await response.json();
  //     console.log('Schools data:', data);
  //     setSchools(data);
  //   } catch (error) {
  //     console.error('Error fetching schools:', error);
  //     console.error('Error details:', error.message);
  //     setSchools([]);
  //   }
  // };

  const filteredSchools = schools.filter((school) => 
    school.school_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = filteredSchools.slice(indexOfFirstSchool, indexOfLastSchool);

  return (
    <Box id="secure-home" sx={{ position: "relative", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Top Right Circular Icon */}
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}>
        <IconButton
            id={"account-icon"}
          onClick={handleMenuOpen}
          size="large"
          sx={{ bgcolor: "#fff", borderRadius: "50%" }}
        >
          {user.profile_picture ? (
            <img
              src={`/assets/profile-pictures/${user.profile_picture}`}
              alt="Profile"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />
          ) : (
          <AccountCircleIcon fontSize="large" />
              )}
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem id="account-info" onClick={() => { handleAccountInfo(); handleMenuClose(); }}>
            Account Info
          </MenuItem>
          <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>
            Logout
          </MenuItem>
        </Menu>
      </Box>

      <Grid container justifyContent="center" sx={{ pt: 4, pb: 4 }}>
        <Grid item xs={12} md={10}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}>
              Schools and Sports
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <TextField
                label="Search Schools"
                variant="outlined"
                fullWidth
                sx={{ width: "90%", maxWidth: 600 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>

            {user.transfer_type !== "high_school" && (
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGoToReviewForm}
              >
                Submit a Review
              </Button>
            </Box> )}

            {user.transfer_type !== "graduate" && (
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGoToPreferenceForm}
              >
                Submit your Preferences
              </Button>
            </Box> )}

            <Stack spacing={2} sx={{ px: 2 }}>
              {currentSchools.length > 0 ? (
                currentSchools.map((school) => (
                  <Card 
                    key={school.id}
                    id={`school-${school.id}`}
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
                ))
              ) : (
                <Typography variant="h6" sx={{ mt: 3, textAlign: "center" }}>
                  No results found
                </Typography>
              )}
            </Stack>

            {filteredSchools.length > schoolsPerPage && (
              <Box sx={{ position: "relative", mt: 5, mb: 5 }}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Pagination
                    count={Math.ceil(filteredSchools.length / schoolsPerPage)}
                    page={currentPage}
                    onChange={(event, value) => setCurrentPage(value)}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    showFirstButton
                    showLastButton
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontSize: "1.1rem",
                        fontWeight: 500,
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    left: "50%",
                    ml: "180px",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Jump to:
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    variant="outlined"
                    value={currentPage}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      const maxPage = Math.ceil(filteredSchools.length / schoolsPerPage);
                      if (!isNaN(value) && value >= 1 && value <= maxPage) {
                        setCurrentPage(value);
                      }
                    }}
                    inputProps={{
                      min: 1,
                      max: Math.ceil(filteredSchools.length / schoolsPerPage),
                      style: { width: 60, textAlign: "center" }
                    }}
                  />
                </Box>
              </Box>
            )}
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SecureHome;

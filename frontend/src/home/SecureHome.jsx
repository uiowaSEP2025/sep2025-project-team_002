import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Stack,
  Grid as MuiGrid,
  Pagination,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { motion } from "framer-motion";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import LoginIcon from "@mui/icons-material/Login";
import API_BASE_URL from "../utils/config";

function SecureHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [schools, setSchools] = useState([]);

  const [loading, setLoading] = useState(true);

  const schoolsPerPage = 10;

  const queryParams = new URLSearchParams(location.search);
  const pageFromURL = parseInt(queryParams.get("page")) || 1;
  const searchFromURL = queryParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(searchFromURL);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchFromURL);
  const [currentPage, setCurrentPage] = useState(pageFromURL);

  const [recommendedSchools, setRecommendedSchools] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

    // Add a new state to track if the user has submitted preferences
  const [hasPreferences, setHasPreferences] = useState(null);


  // Filter state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    coach: "",
    head_coach: "",
    assistant_coaches: "",
    team_culture: "",
    campus_life: "",
    athletic_facilities: "",
    athletic_department: "",
    player_development: "",
    nil_opportunity: "",
    sport: "",
  });
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);

  // Get user from context
  const { user, logout } = useUser();



  // State to track if data has been loaded at least once
  const [dataLoaded, setDataLoaded] = useState(false);
  // State to track if we're in a refresh scenario
  const [isRefreshing, setIsRefreshing] = useState(false);
  // State to track load attempts
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Check if this is a page refresh by using sessionStorage
  useEffect(() => {
    const isFirstLoad = sessionStorage.getItem('secureHomeLoaded') !== 'true';
    if (!isFirstLoad) {
      console.log("SecureHome: This appears to be a page refresh");
      setIsRefreshing(true);
    } else {
      console.log("SecureHome: This appears to be a first load");
      sessionStorage.setItem('secureHomeLoaded', 'true');
    }

    // Clean up function
    return () => {
      // We don't clear the sessionStorage here to detect refreshes
    };
  }, []);

  // This effect runs once on component mount to fetch initial data
  useEffect(() => {
    console.log(`SecureHome: Initial data loading effect running (attempt ${loadAttempts + 1})`);

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("SecureHome: Loading timeout triggered");
      if (schools.length === 0) {
        // If we still don't have schools data after timeout
        if (loadAttempts < 2) {
          console.log("SecureHome: No schools data after timeout, forcing reload");
          setLoadAttempts(prev => prev + 1);
          window.location.reload();
        } else {
          console.log("SecureHome: Max load attempts reached, showing UI anyway");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }, 2000); // 2 second timeout

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("SecureHome: No token found, redirecting to login");
      navigate("/login");
      return;
    }

    // Set a flag to ensure we don't get stuck in loading state
    let isMounted = true;

    // Fetch Schools function
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/schools/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("SecureHome: Schools data loaded successfully");
          setSchools(data);
          setDataLoaded(true);
          setLoading(false);
        } else if (response.status === 401) {
          // Token expired
          logout();
          navigate("/login");
        } else {
          console.error(`HTTP error! status: ${response.status}`);
          setSchools([]);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
        setSchools([]);
        setLoading(false);
      }
    };

    // Fetch Recommended Schools
    const fetchRecommendedSchools = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/recommendations/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.hasOwnProperty('no_preferences') && data.no_preferences === true) {
            setHasPreferences(false);
            setRecommendedSchools([]);
            setShowRecommendations(false);
          } else {
            setHasPreferences(true);
            setRecommendedSchools(data);
            if (data.length > 0 && data[0].sport) {
              setFilters(prev => ({ ...prev }));
            }
            setShowRecommendations(data.length > 0);
          }
        } else {
          const errorText = await response.text();
          console.error("Error response:", response.status, errorText);
          setHasPreferences(false);
          setShowRecommendations(false);
        }
      } catch (error) {
        console.error("Error in fetchRecommendedSchools:", error);
        setHasPreferences(false);
        setShowRecommendations(false);
      }
    };
    // Fetch data for user, schools, and recommendations
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user info');
          return;
        }

        // Parse and use the user data if needed
        const userData = await response.json();
        // If there's sport preference in the user data, update filters
        if (userData && userData.sport_preference) {
          setFilters(prev => ({ ...prev, sport: userData.sport_preference }));
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
    fetchSchools();
    fetchRecommendedSchools();

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [loadAttempts, schools.length]); // Re-run if loadAttempts changes or schools are loaded

  // Sync state with URL when location changes (handles back/forward navigation)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newPage = parseInt(params.get("page")) || 1;
    const newSearch = params.get("search") || "";
    setCurrentPage(newPage);
    setSearchQuery(newSearch);
    setPrevSearchQuery(newSearch);
  }, [location.search]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (searchQuery !== prevSearchQuery) {
      setPrevSearchQuery(searchQuery);
      const params = new URLSearchParams(location.search);
      params.set("page", "1");
      if (searchQuery.trim() !== "") {
        params.set("search", searchQuery);
      } else {
        params.delete("search");
      }
      navigate({ search: params.toString() }, { replace: false });
    }
  }, [searchQuery, prevSearchQuery, navigate, location.search]);

  const updatePageInURL = (page) => {
    const params = new URLSearchParams(location.search);
    params.set("page", page.toString());
    if (searchQuery.trim() !== "") {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    navigate({ search: params.toString() }, { replace: false });
  };

  // Handle page change function - THIS WAS MISSING
  const handlePageChange = (event, newPage) => {
    updatePageInURL(newPage);
  };

  // Handle opening the dropdown menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const handleAccountInfo = () => {
    navigate("/account");
  };

  // Navigation handlers for review & preference forms
  const handleGoToReviewForm = () => {
    navigate("/review-form");
  };
  const handleGoToPreferenceForm = () => {
    navigate("/preference-form");
  };
  const handleSchoolClick = (schoolId) => {
    navigate(`/school/${schoolId}`);
  };

  // Filter dialog handlers
  const openFilterDialog = () => {
    setFilterDialogOpen(true);
  };
  const closeFilterDialog = () => {
    setFilterDialogOpen(false);
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  const applyFilters = async () => {
    closeFilterDialog();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setFilterDialogOpen(false);

    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.coach) queryParams.append("coach", filters.coach);
      if (filters.head_coach) queryParams.append("head_coach", filters.head_coach);
      // Append rating filters if provided
      [
        "assistant_coaches",
        "team_culture",
        "campus_life",
        "athletic_facilities",
        "athletic_department",
        "player_development",
        "nil_opportunity",
      ].forEach((field) => {
        if (filters[field]) {
          queryParams.append(field, filters[field]);
        }
      });
      const response = await fetch(`${API_BASE_URL}/api/filter/?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFilteredSchools(data);
        setFilterApplied(true);
        setLoading(false);
        setCurrentPage(1);
        updatePageInURL(1);
      } else if (response.status === 401) {
        // Token expired
        logout();
        navigate("/login");
      } else {
        console.error("Error applying filters");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setLoading(false);
    }
  };
  const clearFilters = () => {
    setFilters({
      coach: "",
      head_coach: "",
      assistant_coaches: "",
      team_culture: "",
      campus_life: "",
      athletic_facilities: "",
      athletic_department: "",
      player_development: "",
      nil_opportunity: "",
      sport: "",
    });
    setFilterApplied(false);  // This is key - it resets to show all schools
    setFilteredSchools([]);
    closeFilterDialog();
  };

  const schoolsToDisplay = Array.isArray(filterApplied ? filteredSchools : schools)
    ? (filterApplied ? filteredSchools : schools)
    : [];

  // Apply search filter on top
  const filteredBySearch = schoolsToDisplay.filter((school) =>
    school.school_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = filteredBySearch.slice(indexOfFirstSchool, indexOfLastSchool);

  // Ensure loading state is properly managed
  useEffect(() => {
    if (hasPreferences !== null || schools.length > 0) {
      setLoading(false);  // Set loading to false after data is fetched
    }
  }, [hasPreferences, schools]);

  // Add a fallback in case loading gets stuck
  useEffect(() => {
    // Force loading to false after 2 seconds as a fallback
    const timer = setTimeout(() => {
      if (loading) {
        console.log("SecureHome: Forcing loading state to false after timeout");
        setLoading(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Handle page refresh - check if we have data
  useEffect(() => {
    // If this is a refresh and we have a user but no schools data
    if (isRefreshing && user && schools.length === 0 && !loading && !dataLoaded) {
      console.log("SecureHome: Detected refresh with no data, reloading data");
      // Reload the page to force a fresh data fetch, but only if we haven't tried too many times
      if (loadAttempts < 2) {
        setLoadAttempts(prev => prev + 1);
        // Use a short timeout to allow React to update state before reload
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        console.log("SecureHome: Max refresh attempts reached, showing UI anyway");
      }
    }
  }, [isRefreshing, user, schools, loading, dataLoaded, loadAttempts]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", marginTop: 4, p: 3 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Loading Schools and Sports
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Please wait while we fetch the latest data...
        </Typography>
      </Box>
    );
  }

  // Handle the case where we have no schools data but we're not loading
  if (schools.length === 0 && !loading) {
    return (
      <Box sx={{ textAlign: "center", marginTop: 4, p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          No Schools Data Available
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          We couldn't load the schools data. This might be due to a connection issue.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '300px', mx: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            startIcon={<RefreshIcon />}
            size="large"
            sx={{ py: 1.5 }}
          >
            Refresh Page
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              // Clear session storage and reload
              sessionStorage.removeItem('secureHomeLoaded');
              window.location.reload();
            }}
            startIcon={<RestartAltIcon />}
          >
            Reset & Reload
          </Button>
          <Button
            variant="text"
            onClick={() => navigate('/login')}
            startIcon={<LoginIcon />}
          >
            Return to Login
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box id="secure-home" sx={{ position: "relative", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Top Right Account Icon */}
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}>
        <IconButton id={"account-icon"} onClick={handleMenuOpen} size="large" sx={{ bgcolor: "#fff", borderRadius: "50%" }}>
          {user && user.profile_picture ? (
            <img
              src={`/assets/profile-pictures/${user.profile_picture}`}
              alt="Profile"
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
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
          <MenuItem id="account-info" onClick={() => { handleAccountInfo(); handleMenuClose(); }}>Account Info</MenuItem>
          <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>Logout</MenuItem>
        </Menu>
      </Box>

      <Grid container justifyContent="center" sx={{ pt: 4, pb: 4 }}>
        <Grid item xs={12} md={10}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}>
              Schools and Sports
            </Typography>

            {/* Search and Filters Section */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4, gap: 2 }}>
              <TextField
                id="school-search"
                label="Search Schools"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: "100%", sm: "400px" }, borderRadius: "20px" }}
                InputProps={{
                  sx: { borderRadius: "40px" }
                }}
              />

              <Button
                id="filter-button"
                variant="contained"
                color="primary"
                onClick={openFilterDialog}
              >
                Filter
              </Button>
              {filterApplied && (
                <Button variant="outlined" color="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Box>

            {/* Recommendations Section - Only shown for non-graduate users */}
            {user.transfer_type !== "graduate" ? (
              hasPreferences ? (
                recommendedSchools && recommendedSchools.length > 0 ? (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                      Recommended Schools Based on Your Preferences
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                      These schools match your preferences and have received positive reviews from other athletes.
                    </Typography>
                    <Stack spacing={2} sx={{ px: 2 }}>
                      {recommendedSchools.map((rec, index) => (
                        <Card
                          key={index}
                          sx={{
                            width: "100%",
                            cursor: "pointer",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              backgroundColor: "#f0f7ff",
                              transform: "translateY(-2px)",
                              boxShadow: 2
                            }
                          }}
                          onClick={() => handleSchoolClick(rec.school.id)}
                        >
                          <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
                              <Box>
                                <Typography
                                  variant="h6"
                                  sx={{ my: 0, fontWeight: 700 }}
                                  data-testid={`recommended-school-name-${rec.school?.id || 'unknown'}`}
                                >
                                  {rec.school?.school_name || 'Unknown School'}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    data-testid={`recommended-school-location-${rec.school?.id || 'unknown'}`}
                                  >
                                    {rec.school?.location || 'Unknown Location'}
                                  </Typography>
                                  {rec.sport && (
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        backgroundColor: "#e3f2fd",
                                        color: "#1976d2",
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: 1,
                                        fontSize: "0.75rem"
                                      }}
                                      data-testid={`recommended-sport-name-${rec.school?.id || 'unknown'}`}
                                    >
                                      {rec.sport}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 1,
                                backgroundColor: '#e3f2fd',
                                borderRadius: 1
                              }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                                  Match Score: {rec.similarity_score}/10
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ mb: 4, textAlign: 'center', p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No Recommendations Available
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      We don't have any reviews yet for your preferred sport.
                      Check back later as our community grows!
                    </Typography>
                    {user.transfer_type !== "graduate" && !hasPreferences && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGoToPreferenceForm}
                      sx={{ mt: 1, mr: 2 }}
                    >
                      {filters.sport ? "Update Preferences" : "Set Your Preferences"}
                    </Button>
                  )}
                    {filters.sport && (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleGoToReviewForm}
                        sx={{ mt: 1 }}
                      >
                        Submit a Review
                      </Button>
                    )}
                  </Box>
                )
              ) : (
                <Box sx={{ mb: 4, textAlign: 'center', p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {filters.sport ? "No Recommendations Available" : "Fill Out Your Preferences"}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {filters.sport
                      ? `We don't have any reviews yet for your preferred sport (${filters.sport}). Check back later as our community grows!`
                      : "Please fill out your preferences to see personalized school recommendations based on what matters most to you."}
                  </Typography>

                  {user.transfer_type !== "graduate" && !hasPreferences && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGoToPreferenceForm}
                      sx={{ mt: 1, mr: 2 }}
                    >
                      {filters.sport ? "Update Preferences" : "Set Your Preferences"}
                    </Button>
                  )}
                  {filters.sport && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleGoToReviewForm}
                      sx={{ mt: 1 }}
                    >
                      Submit a Review
                    </Button>
                  )}
                </Box>
              )
            ) : null}

            {/* Show review form button for transfer students */}
            {user && user.transfer_type && user.transfer_type !== "high_school" && (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <Button
                  id="submit-review-button"
                  variant="contained"
                  color="secondary"
                  onClick={handleGoToReviewForm}
                  sx={{ mr: 2 }}
                >
                  Submit a Review
                </Button>
                {!hasPreferences && (
                  <Button
                    id="preference-form-button"
                    variant="outlined"
                    color="primary"
                    onClick={handleGoToPreferenceForm}
                  >
                    Fill Preference Form
                  </Button>
                )}
              </Box>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <Stack spacing={2} sx={{ px: 2 }}>
                {currentSchools.length > 0 ? (
                  currentSchools.map((school) => (
                    <Card
                      key={school.id}
                      id={`school-${school.id}`}
                      sx={{ width: "100%", cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                      onClick={() => handleSchoolClick(school.id)}
                    >
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                          <Typography variant="h6" sx={{ my: 0, fontWeight: 700 }}>
                            {school.school_name}
                          </Typography>
                          <Typography variant="body2">
                            {school.available_sports && school.available_sports.length > 0
                              ? school.available_sports.join(" • ")
                              : "No sports listed"}
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
            )}
            {filteredBySearch.length > schoolsPerPage && (
              <Box sx={{ position: "relative", mt: 5, mb: 5 }}>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Pagination
                    count={Math.ceil(filteredBySearch.length / schoolsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
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
                    gap: 3,
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
                      const maxPage = Math.ceil(filteredBySearch.length / schoolsPerPage);
                      if (!isNaN(value) && value >= 1 && value <= maxPage) {
                        setCurrentPage(value);
                        const params = new URLSearchParams(location.search);
                        params.set("page", value.toString());
                        if (searchQuery.trim() !== "") {
                          params.set("search", searchQuery);
                        } else {
                          params.delete("search");
                        }
                        navigate({ search: params.toString() }, { replace: false });
                      }
                    }}
                    inputProps={{
                      min: 1,
                      max: Math.ceil(filteredBySearch.length / schoolsPerPage),
                      style: { width: 60, textAlign: "center" }
                    }}
                  />
                </Box>
              </Box>
            )}
          </motion.div>
        </Grid>
      </Grid>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={closeFilterDialog} fullWidth maxWidth="sm">
        <DialogTitle>Apply Filters</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              fullWidth
              label="Coach"
              value={filters.coach}
              onChange={(e) => setFilters({ ...filters, coach: e.target.value })}
            >
              <MenuItem value="">All Coaches</MenuItem>
              <MenuItem value="head">Head Coach</MenuItem>
              <MenuItem value="assistant">Assistant Coach</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Sport"
              name="sport"
              value={filters.sport}
              onChange={handleFilterChange}
              variant="outlined"
            >
              <MenuItem value="">All Sports</MenuItem>
              <MenuItem value="basketball">Basketball</MenuItem>
              <MenuItem value="football">Football</MenuItem>
              <MenuItem value="baseball">Baseball</MenuItem>
              <MenuItem value="soccer">Soccer</MenuItem>
              <MenuItem value="volleyball">Volleyball</MenuItem>
              <MenuItem value="tennis">Tennis</MenuItem>
              <MenuItem value="swimming">Swimming</MenuItem>
              <MenuItem value="track">Track & Field</MenuItem>
            </TextField>

            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
              Rating Filters (Minimum Rating)
            </Typography>

            {/* Rating filters */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Head Coach</InputLabel>
                  <Select
                    id="head_coach-select"
                    name="head_coach"
                    value={filters.head_coach}
                    onChange={handleFilterChange}
                    label="Head Coach"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}+
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assistant Coaches</InputLabel>
                  <Select
                    name="assistant_coaches"
                    value={filters.assistant_coaches}
                    onChange={handleFilterChange}
                    label="Assistant Coaches"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}+
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Team Culture</InputLabel>
                  <Select
                    name="team_culture"
                    value={filters.team_culture}
                    onChange={handleFilterChange}
                    label="Team Culture"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}+
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Campus Life</InputLabel>
                  <Select
                    name="campus_life"
                    value={filters.campus_life}
                    onChange={handleFilterChange}
                    label="Campus Life"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}+
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Athletic Facilities</InputLabel>
                  <Select
                    name="athletic_facilities"
                    value={filters.athletic_facilities}
                    onChange={handleFilterChange}
                    label="Athletic Facilities"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}+
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Athletic Department</InputLabel>
                  <Select
                    name="athletic_department"
                    value={filters.athletic_department}
                    onChange={handleFilterChange}
                    label="Athletic Department"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}+
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Player Development</InputLabel>
                  <Select
                    name="player_development"
                    value={filters.player_development}
                    onChange={handleFilterChange}
                    label="Player Development"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}+
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>NIL Opportunity</InputLabel>
                  <Select
                    name="nil_opportunity"
                    value={filters.nil_opportunity}
                    onChange={handleFilterChange}
                    label="NIL Opportunity"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}+
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>



          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={clearFilters} color="secondary">
            Clear All
          </Button>
          <Button onClick={closeFilterDialog} color="primary">
            Cancel
          </Button>
          <Button
            id="apply-filters-button"
            onClick={applyFilters}
            variant="contained"
            color="primary"
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SecureHome;
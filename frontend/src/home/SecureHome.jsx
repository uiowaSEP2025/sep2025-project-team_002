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
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import LoginIcon from "@mui/icons-material/Login";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import API_BASE_URL from "../utils/config";

function SecureHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [schools, setSchools] = useState([]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));


  // Simple loading state
  const [loading, setLoading] = useState(true);
  // Error state to track if data fetching failed
  const [error, setError] = useState(null);

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

  // Single useEffect for data fetching
  useEffect(() => {
    // Set a timeout to prevent infinite loading, but don't set error
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Loading timeout triggered, showing UI anyway");
        setLoading(false);
        // Don't set error here, just show whatever data we have
      }
    }, 8000); // 8 second timeout - give more time for data to load

    // Function to fetch all data
    const fetchAllData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch schools
        const schoolsResponse = await fetch(`${API_BASE_URL}/api/schools/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (schoolsResponse.status === 401) {
          logout();
          navigate("/login");
          return;
        }

        if (!schoolsResponse.ok) {
          console.error(`Failed to fetch schools: ${schoolsResponse.status}`);
          // Only set error if it's a critical failure (not 404)
          if (schoolsResponse.status !== 404) {
            setError(`Failed to fetch schools: ${schoolsResponse.status}`);
          }
          // Continue execution to try loading other data
        }

        try {
          const schoolsData = await schoolsResponse.json();
          setSchools(schoolsData || []);
        } catch (jsonError) {
          console.error("Error parsing schools JSON:", jsonError);
          // Don't set error, just use empty array
          setSchools([]);
        }

        // Fetch recommendations
        try {
          const recommendationsResponse = await fetch(`${API_BASE_URL}/api/recommendations/`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (recommendationsResponse.ok) {
            const recommendationsData = await recommendationsResponse.json();
            if (recommendationsData.hasOwnProperty('no_preferences') && recommendationsData.no_preferences === true) {
              setHasPreferences(false);
              setRecommendedSchools([]);
              setShowRecommendations(false);
            } else {
              setHasPreferences(true);
              setRecommendedSchools(recommendationsData);
              if (recommendationsData.length > 0 && recommendationsData[0].sport) {
                setFilters(prev => ({ ...prev }));
              }
              setShowRecommendations(recommendationsData.length > 0);
            }
          } else {
            console.log("No recommendations available");
            setHasPreferences(false);
            setShowRecommendations(false);
          }
        } catch (recError) {
          console.error("Error fetching recommendations:", recError);
          // Don't fail the whole page load if recommendations fail
          setHasPreferences(false);
          setShowRecommendations(false);
        }

        // Fetch user profile
        try {
          const userResponse = await fetch(`${API_BASE_URL}/users/user/`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData && userData.sport_preference) {
              setFilters(prev => ({ ...prev, sport: userData.sport_preference }));
            }
          }
        } catch (userError) {
          console.error("Error fetching user profile:", userError);
          // Don't fail the whole page load if user profile fetch fails
        }

        // All critical data loaded successfully
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Only set error if schools data is empty
        if (schools.length === 0) {
          setError("Unable to load schools data. Please try again later.");
        }
        setLoading(false);
      }
    };

    fetchAllData();

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - run once on mount

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
      if (filters.sport) queryParams.append("sport", filters.sport);
      if (filters.head_coach) queryParams.append("head_coach", filters.head_coach);
      if (filters.assistant_coaches) queryParams.append("assistant_coaches", filters.assistant_coaches);
      if (filters.team_culture) queryParams.append("team_culture", filters.team_culture);
      if (filters.campus_life) queryParams.append("campus_life", filters.campus_life);
      if (filters.athletic_facilities) queryParams.append("athletic_facilities", filters.athletic_facilities);
      if (filters.athletic_department) queryParams.append("athletic_department", filters.athletic_department);
      if (filters.player_development) queryParams.append("player_development", filters.player_development);
      if (filters.nil_opportunity) queryParams.append("nil_opportunity", filters.nil_opportunity);

      const token = localStorage.getItem("token");
      console.log("Filter params:", queryParams.toString());
      const response = await fetch(`${API_BASE_URL}/api/filter/?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Filtered response:", data);
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
    // closeFilterDialog();
  };
  const clearFilters = () => {
    setFilters({
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
    // closeFilterDialog();
  };

  const schoolsToDisplay = Array.isArray(filterApplied ? filteredSchools : schools)
    ? (filterApplied ? filteredSchools : schools)
    : [];

  // Apply search filter on top
  const filteredBySearch = schoolsToDisplay
  .filter((school) =>
    school.school_name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) => a.school_name.localeCompare(b.school_name));

  // Sort alphabetically
  const sortedFilteredSchools = [...filteredBySearch].sort((a, b) =>
    a.school_name.localeCompare(b.school_name)
  );
  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = sortedFilteredSchools.slice(indexOfFirstSchool, indexOfLastSchool);

  // No additional useEffects needed - all loading logic is in the main useEffect

  // Simple loading UI
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

  // Only show error UI if we have an error AND no schools data
  if (error && schools.length === 0) {
    return (
      <Box sx={{ textAlign: "center", marginTop: 4, p: 3 }}>
        <WarningIcon color="warning" sx={{ fontSize: 60 }} />
        <Typography variant="h5" sx={{ mb: 2, mt: 2, fontWeight: 600 }}>
          We're having trouble loading data
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
          Please try refreshing the page or check your internet connection.
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
            variant="text"
            onClick={() => {
              setError(null);
              setLoading(true);
              // Try fetching data again
              window.location.reload();
            }}
            startIcon={<RestartAltIcon />}
          >
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }

  // Handle the case where we have no schools data but we're not loading
  if (schools.length === 0) {
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
      {!isSmallScreen && (
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
      </Box> )}

      <Grid container justifyContent="center" sx={{ pt: 4, pb: 4 }}>
        <Grid item xs={12} md={10}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            {isSmallScreen && (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <IconButton id={"account-icon-mobile"} onClick={handleMenuOpen} size="large" sx={{ bgcolor: "#fff", borderRadius: "50%" }}>
                    {user.profile_picture ? (
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
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                  >
                    <MenuItem onClick={() => { handleAccountInfo(); handleMenuClose(); }}>Account Info</MenuItem>
                    <MenuItem onClick={() => { handleLogout(); handleMenuClose(); }}>Logout</MenuItem>
                  </Menu>
                </Box>
              )}

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
                data-testid="filter-button"
                variant="contained"
                color="primary"
                onClick={openFilterDialog}
                sx={{
                  borderRadius: "20px",
                  py: 0.8,
                  px: 2.5,
                  textTransform: "none",
                  fontWeight: 500,
                  boxShadow: 1
                }}
              >
                Filter
              </Button>
              {filterApplied && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={clearFilters}
                  sx={{
                    borderRadius: "20px",
                    py: 0.8,
                    px: 2.5,
                    textTransform: "none",
                    fontWeight: 500
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>

            {/* Recommendations Section - Only shown for non-graduate users */}
            {user.transfer_type !== "graduate" && (
              <Box sx={{ mb: 4 }}>
                {hasPreferences ? (
                  recommendedSchools && recommendedSchools.length > 0 ? (
                    <>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, mb: 2, color: "#1976d2" }}
                      >
                        Recommended Schools Based on Your Preferences
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, color: "text.secondary" }}
                      >
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
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  flexWrap: "wrap",
                                  justifyContent: "space-between"
                                }}
                              >
                                <Box>
                                  <Typography
                                    variant="h6"
                                    sx={{ my: 0, fontWeight: 700 }}
                                    data-testid={`recommended-school-name-${rec.school?.id || "unknown"}`}
                                  >
                                    {rec.school?.school_name || "Unknown School"}
                                  </Typography>
                                  <Box
                                    sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      data-testid={`recommended-school-location-${rec.school?.id || "unknown"}`}
                                    >
                                      {rec.school?.location || "Unknown Location"}
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
                                        data-testid={`recommended-sport-name-${rec.school?.id || "unknown"}`}
                                      >
                                        {rec.sport}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    p: 1,
                                    backgroundColor: "#e3f2fd",
                                    borderRadius: 1
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600, color: "#1976d2" }}
                                  >
                                    Match Score: {rec.similarity_score}/10
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </>
                  ) : (
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 3,

                        backgroundColor: "#f5f5f5",
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        No Recommendations Available
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        We don't have any reviews yet for your preferred sport.
                        Check back later as our community grows!
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 3,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Fill Out Your Preferences
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      Please fill out your preferences to see personalized school recommendations based on what matters most to you.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGoToPreferenceForm}
                      sx={{
                        mt: 1,
                        mr: 2,
                        borderRadius: "20px",
                        py: 0.8,
                        px: 2.5,
                        textTransform: "none",
                        fontWeight: 500,
                        boxShadow: 1
                      }}
                    >
                      Set your preferences
                    </Button>
                  </Box>
                )}
                {hasPreferences && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGoToPreferenceForm}
                        sx={{
                          borderRadius: "20px",
                          py: 0.8,
                          px: 2.5,
                          textTransform: "none",
                          fontWeight: 500
                        }}
                      >
                        Modify Preferences
                      </Button>
                    </Box>
                  )}
              </Box>
            )}
            {/*        /!*{filters.sport && (*!/*/}
            {/*        /!*  <Button*!/*/}
            {/*        /!*    variant="outlined"*!/*/}
            {/*        /!*    color="primary"*!/*/}
            {/*        /!*    onClick={handleGoToReviewForm}*!/*/}
            {/*        /!*    sx={{*!/*/}
            {/*        /!*      mt: 1,*!/*/}
            {/*        /!*      borderRadius: "20px",*!/*/}
            {/*        /!*      py: 0.8,*!/*/}
            {/*        /!*      px: 2.5,*!/*/}
            {/*        /!*      textTransform: "none",*!/*/}
            {/*        /!*      fontWeight: 500*!/*/}
            {/*        /!*    }}*!/*/}
            {/*        /!*  >*!/*/}
            {/*        /!*    Submit a Review*!/*/}
            {/*        /!*  </Button>*!/*/}
            {/*        /!*)}*!/*/}
            {/*      </Box>*/}
            {/*    )*/}
            {/*  ) : (*/}
            {/*    <Box sx={{ mb: 4, textAlign: 'center', p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>*/}
            {/*      <Typography variant="h6" sx={{ mb: 1 }}>*/}
            {/*        {filters.sport ? "No Recommendations Available" : "Fill Out Your Preferences"}*/}
            {/*      </Typography>*/}
            {/*      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>*/}
            {/*        {filters.sport*/}
            {/*          ? `We don't have any reviews yet for your preferred sport (${filters.sport}). Check back later as our community grows!`*/}
            {/*          : "Please fill out your preferences to see personalized school recommendations based on what matters most to you."}*/}
            {/*      </Typography>*/}

            {/*      {user.transfer_type !== "graduate" && !hasPreferences && (*/}
            {/*        <Button*/}
            {/*          variant="contained"*/}
            {/*          color="primary"*/}
            {/*          onClick={handleGoToPreferenceForm}*/}
            {/*          sx={{*/}
            {/*            mt: 1,*/}
            {/*            mr: 2,*/}
            {/*            borderRadius: "20px",*/}
            {/*            py: 0.8,*/}
            {/*            px: 2.5,*/}
            {/*            textTransform: "none",*/}
            {/*            fontWeight: 500,*/}
            {/*            boxShadow: 1*/}
            {/*          }}*/}
            {/*        >*/}
            {/*          {filters.sport ? "Update Preferences" : "Set Your Preferences"}*/}
            {/*        </Button>*/}
            {/*      )}*/}
            {/*      /!*{filters.sport && (*!/*/}
            {/*      /!*  <Button*!/*/}
            {/*      /!*    variant="outlined"*!/*/}
            {/*      /!*    color="primary"*!/*/}
            {/*      /!*    onClick={handleGoToReviewForm}*!/*/}
            {/*      /!*    sx={{*!/*/}
            {/*      /!*      mt: 1,*!/*/}
            {/*      /!*      borderRadius: "20px",*!/*/}
            {/*      /!*      py: 0.8,*!/*/}
            {/*      /!*      px: 2.5,*!/*/}
            {/*      /!*      textTransform: "none",*!/*/}
            {/*      /!*      fontWeight: 500*!/*/}
            {/*      /!*    }}*!/*/}
            {/*      /!*  >*!/*/}
            {/*      /!*    Submit a Review*!/*/}
            {/*      /!*  </Button>*!/*/}
            {/*      /!*)}*!/*/}
            {/*    </Box>*/}
            {/*  )*/}
            {/*) : null}*/}

            {/* Show review form button for transfer students */}
            {user.transfer_type !== "high_school" && (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <Button
                  id="submit-review-button"
                  variant="contained"
                  color="secondary"
                  onClick={handleGoToReviewForm}
                  sx={{
                    mr: 2,
                    borderRadius: "20px",
                    py: 0.8,
                    px: 2.5,
                    textTransform: "none",
                    fontWeight: 500,
                    boxShadow: 1
                  }}
                >
                  Submit a Review
                </Button>
                {/*{!hasPreferences && (*/}
                {/*  <Button*/}
                {/*    id="preference-form-button"*/}
                {/*    variant="outlined"*/}
                {/*    color="primary"*/}
                {/*    onClick={handleGoToPreferenceForm}*/}
                {/*    sx={{*/}
                {/*      borderRadius: "20px",*/}
                {/*      py: 0.8,*/}
                {/*      px: 2.5,*/}
                {/*      textTransform: "none",*/}
                {/*      fontWeight: 500*/}
                {/*    }}*/}
                {/*  >*/}
                {/*    Fill Preference Form*/}
                {/*  </Button>*/}
                {/*)}*/}
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
                          <Typography variant="h6" sx={{ my: 0, fontWeight: 700 }} data-testid={`school-list-name-${school.id}`}>
                            {school.school_name}
                          </Typography>
                          <Typography variant="body2" data-testid={`school-list-sports-${school.id}`}>
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
              {!isSmallScreen && (
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
                </Box> )}
              </Box>
            )}
          </motion.div>
        </Grid>
      </Grid>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={closeFilterDialog}
        fullWidth
        maxWidth="sm"
        disableRestoreFocus
        TransitionProps={{
          onExited: () => {
            const el = document.getElementById("school-search");
            if (el) el.focus();
          },
        }}
      >
        <DialogTitle>Apply Filters</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              fullWidth
              id="sport-select"
              label="Choose Sport"
              name="sport"
              value={filters.sport}
              onChange={handleFilterChange}
              variant="outlined"
              margin="normal"
            >
              <MenuItem value="">All Sports</MenuItem>
              <MenuItem value="Men's Basketball">Men's Basketball</MenuItem>
              <MenuItem value="Women's Basketball">Women's Basketball</MenuItem>
              <MenuItem value="Football">Football</MenuItem>
              {/*<MenuItem value="baseball">Baseball</MenuItem>*/}
              {/*<MenuItem value="soccer">Soccer</MenuItem>*/}
              {/*<MenuItem value="volleyball">Volleyball</MenuItem>*/}
              {/*<MenuItem value="tennis">Tennis</MenuItem>*/}
              {/*<MenuItem value="swimming">Swimming</MenuItem>*/}
              {/*<MenuItem value="track">Track & Field</MenuItem>*/}
            </TextField>

            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
              Rating Filters (Minimum Rating)
            </Typography>

            {/* Rating filters */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Head Coach Rating</InputLabel>
                  <Select
                    id="head_coach-select"
                    data-testid="head_coach-select"
                    name="head_coach"
                    value={filters.head_coach}
                    onChange={handleFilterChange}
                    label="Head Coach Rating"
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
          <Button
            onClick={clearFilters}
            color="secondary"
            sx={{
              borderRadius: "20px",
              py: 0.6,
              px: 2,
              textTransform: "none",
              fontWeight: 500
            }}
          >
            Clear All
          </Button>
          <Button
            onClick={closeFilterDialog}
            color="primary"
            sx={{
              borderRadius: "20px",
              py: 0.6,
              px: 2,
              textTransform: "none",
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button
            id="apply-filters-button"
            onClick={applyFilters}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "20px",
              py: 0.6,
              px: 2,
              textTransform: "none",
              fontWeight: 500,
              boxShadow: 1
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SecureHome;

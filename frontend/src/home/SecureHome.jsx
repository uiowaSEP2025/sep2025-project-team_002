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
  Paper,
  Chip,
  Avatar,
  Divider,
  Container,
  alpha,
  Tooltip
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RefreshIcon from "@mui/icons-material/Refresh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import LoginIcon from "@mui/icons-material/Login";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import FilterListIcon from "@mui/icons-material/FilterList";
import SchoolIcon from "@mui/icons-material/School";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TuneIcon from "@mui/icons-material/Tune";
import SearchIcon from "@mui/icons-material/Search";
import API_BASE_URL from "../utils/config";
import StarRating from "../components/StarRating";

function SecureHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [schools, setSchools] = useState([]);

  // Animation state
  const [fadeIn, setFadeIn] = useState(false);

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

  // Trigger fade-in animation after component mounts
  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

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

  const handleModifyPreferenceForm = () => {
    navigate("/preference-form", { state: { isEditing: true } });
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
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            p: 3
          }}
        >
          <CircularProgress
            size={70}
            thickness={4}
            role="progressbar"
            aria-label="Loading"
            sx={{
              color: theme.palette.primary.main,
              mb: 3
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Loading Schools and Sports
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Please wait while we fetch the latest data...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Only show error UI if we have an error AND no schools data
  if (error && schools.length === 0) {
    return (
      <Container maxWidth="lg">
        <Paper
          elevation={2}
          sx={{
            textAlign: "center",
            p: 5,
            mt: 5,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningIcon
              color="warning"
              sx={{
                fontSize: 80,
                mb: 2,
                color: theme.palette.warning.main
              }}
            />
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: theme.palette.text.primary
              }}
            >
              We're having trouble loading data
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: theme.palette.text.secondary,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Please try refreshing the page or check your internet connection.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '300px', mx: 'auto' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.reload()}
                startIcon={<RefreshIcon />}
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                  },
                  '&:active': {
                    transform: 'translateY(1px)'
                  }
                }}
              >
                Refresh Page
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Try fetching data again
                  window.location.reload();
                }}
                startIcon={<RestartAltIcon />}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
              >
                Try Again
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Handle the case where we have no schools data but we're not loading
  if (schools.length === 0) {
    return (
      <Container maxWidth="lg">
        <Paper
          elevation={2}
          sx={{
            textAlign: "center",
            p: 5,
            mt: 5,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SchoolIcon
              sx={{
                fontSize: 80,
                mb: 2,
                color: alpha(theme.palette.primary.main, 0.7)
              }}
            />
            <Typography
              variant="h4"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: theme.palette.text.primary
              }}
            >
              No Schools Data Available
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                color: theme.palette.text.secondary,
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              We couldn't load the schools data. This might be due to a connection issue.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '300px', mx: 'auto' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.reload()}
                startIcon={<RefreshIcon />}
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                  },
                  '&:active': {
                    transform: 'translateY(1px)'
                  }
                }}
              >
                Refresh Page
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                startIcon={<LoginIcon />}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
              >
                Return to Login
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      id="secure-home"
      sx={{
        position: "relative",
        minHeight: "100vh",
        background: 'linear-gradient(135deg, rgba(58, 134, 255, 0.1) 0%, rgba(131, 56, 236, 0.05) 100%)',
        backgroundImage: `
          linear-gradient(135deg, rgba(58, 134, 255, 0.1) 0%, rgba(131, 56, 236, 0.05) 100%),
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${theme.palette.primary.main.substring(1)}' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")
        `,
        opacity: fadeIn ? 1 : 0,
        transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease'
      }}
    >


      <Container maxWidth="lg" sx={{ pt: 6, pb: 6 }}>




            <Box sx={{ textAlign: "center", mb: 5 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  letterSpacing: '-0.5px'
                }}
              >
                Schools and Sports
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 400,
                  color: theme.palette.text.secondary,
                  maxWidth: 700,
                  mx: 'auto'
                }}
              >
                Discover schools and sports programs that match your preferences
              </Typography>
            </Box>

            {/* Search and Filters Section */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
              }}
            >
              <Box sx={{ display: "flex", flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
                <Box sx={{ position: 'relative', flexGrow: 1 }}>
                  <TextField
                    id="school-search"
                    label="Search Schools"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                </Box>

                <Button
                  id="filter-button"
                  data-testid="filter-button"
                  variant="contained"
                  color="primary"
                  onClick={openFilterDialog}
                  startIcon={<FilterListIcon />}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 3,
                    fontWeight: 600,
                    minWidth: { xs: '100%', md: 'auto' },
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                    },
                    '&:active': {
                      transform: 'translateY(1px)'
                    }
                  }}
                >
                  Filter
                </Button>
              </Box>
            </Paper>

            {filterApplied && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={clearFilters}
                  startIcon={<RestartAltIcon />}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 3,
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            )}

            {/* Recommendations Section - Only shown for non-graduate users */}
            {user.transfer_type !== "graduate" && (
              <Box sx={{ mb: 4 }}>
                {hasPreferences ? (
                  recommendedSchools && recommendedSchools.length > 0 ? (
                    <>
                      <Box
                        sx={{
                          mb: 4,
                          p: 3,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
                          textAlign: 'center',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: alpha(theme.palette.primary.main, 0.1),
                            zIndex: 0
                          }}
                        />
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              mb: 2,
                              color: theme.palette.primary.main,
                              display: 'inline-flex',
                              alignItems: 'center',
                              '&::before': {
                                content: '"🎯"',
                                marginRight: '8px',
                                fontSize: '1.5rem'
                              }
                            }}
                          >
                            Recommended Schools Based on Your Preferences
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: theme.palette.text.secondary,
                              maxWidth: 800,
                              mx: 'auto'
                            }}
                          >
                            These schools match your preferences and have received positive reviews from other athletes.
                          </Typography>
                        </Box>
                      </Box>
                      <Stack spacing={2} sx={{ px: 2 }}>
                        {recommendedSchools.map((rec, index) => (
                          <Card
                            key={index}
                            sx={{
                              width: "100%",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              position: 'relative',
                              borderRadius: 3,
                              overflow: 'hidden',
                              mb: 2,
                              background: `linear-gradient(to right, ${alpha(theme.palette.secondary.main, 0.05)}, ${alpha(theme.palette.background.paper, 1)} 20%)`,
                              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.15)}`,
                              },
                              '&::before': {
                                content: '"🏆"', // Trophy emoji
                                position: 'absolute',
                                right: 15,
                                top: 15,
                                fontSize: '1.2rem',
                                opacity: 0.7,
                                zIndex: 1
                              }
                            }}
                            onClick={() => handleSchoolClick(rec.school.id)}
                            elevation={2}
                          >
                            <CardContent sx={{ pl: 3 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 2,
                                  flexWrap: "wrap",
                                  justifyContent: "space-between"
                                }}
                              >
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <SchoolIcon sx={{ color: theme.palette.secondary.main, mr: 1, fontSize: '1.2rem' }} />
                                    <Typography
                                      variant="h6"
                                      sx={{ my: 0, fontWeight: 700, color: theme.palette.secondary.main }}
                                      data-testid={`recommended-school-name-${rec.school?.id || "unknown"}`}
                                    >
                                      {rec.school?.school_name || "Unknown School"}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{ display: "flex", alignItems: "center", mb: 1 }}
                                  >
                                    <LocationOnIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: '0.9rem' }} />
                                    <Typography
                                      variant="body2"
                                      sx={{ color: theme.palette.text.secondary }}
                                      data-testid={`recommended-school-location-${rec.school?.id || "unknown"}`}
                                    >
                                      {rec.school?.location || "Unknown Location"}
                                    </Typography>
                                    {rec.sport && (
                                      <Chip
                                        size="small"
                                        label={rec.sport}
                                        sx={{
                                          ml: 1,
                                          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                          color: theme.palette.secondary.main,
                                          fontWeight: 500,
                                          fontSize: "0.75rem"
                                        }}
                                        data-testid={`recommended-sport-name-${rec.school?.id || "unknown"}`}
                                      />
                                    )}
                                  </Box>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      p: 1.5,
                                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                      borderRadius: 2
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 600, color: theme.palette.secondary.main }}
                                    >
                                      Match Score: {rec.similarity_score}/10
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1,
                                        backgroundColor: "#f0f7ff",
                                        borderRadius: 1
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 500, color: "#1976d2" }}
                                      >
                                        {rec.school.review_count > 500 ? "500+" : rec.school.review_count || 0} {rec.school.review_count === 1 ? "review" : "reviews"}
                                      </Typography>
                                    </Box>
                                    {rec.school.review_count > 0 && (
                                      <Box sx={{ mt: 0.5 }}>
                                        <StarRating rating={rec.school.average_rating} showValue={true} />
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </>
                  ) : (
                    <Paper
                      elevation={2}
                      sx={{
                        textAlign: "center",
                        p: 4,
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      }}
                    >
                      <Box sx={{ py: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            color: theme.palette.primary.main
                          }}
                        >
                          No Recommendations Available
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            mb: 2,
                            color: theme.palette.text.secondary,
                            maxWidth: 500,
                            mx: 'auto'
                          }}
                        >
                          We don't have any reviews yet for your preferred sport.
                          Check back later as our community grows!
                        </Typography>
                      </Box>
                    </Paper>
                  )
                ) : (
                  <Paper
                    elevation={2}
                    sx={{
                      textAlign: "center",
                      p: 4,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    }}
                  >
                    <Box sx={{ py: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          color: theme.palette.primary.main
                        }}
                      >
                        Fill Out Your Preferences
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          mb: 3,
                          color: theme.palette.text.secondary,
                          maxWidth: 500,
                          mx: 'auto'
                        }}
                      >
                        Please fill out your preferences to see personalized school recommendations based on what matters most to you.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGoToPreferenceForm}
                        sx={{
                          py: 1.5,
                          px: 3,
                          fontWeight: 600,
                          borderRadius: 2,
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                          },
                          '&:active': {
                            transform: 'translateY(1px)'
                          }
                        }}
                    >
                      Set your preferences
                    </Button>
                  </Box>
                  </Paper>
                )}
                {hasPreferences && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleModifyPreferenceForm}
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
                      sx={{
                        width: "100%",
                        cursor: "pointer",
                        mb: 3,
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '4px',
                          backgroundColor: theme.palette.primary.main,
                          borderTopLeftRadius: 3,
                          borderBottomLeftRadius: 3,
                        }
                      }}
                      onClick={() => handleSchoolClick(school.id)}
                      elevation={2}
                    >
                      <CardContent sx={{ pl: 3 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <SchoolIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: '1.2rem' }} />
                              <Typography variant="h6" sx={{ my: 0, fontWeight: 700 }} data-testid={`school-list-name-${school.id}`}>
                                {school.school_name}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SportsSoccerIcon sx={{ color: theme.palette.text.secondary, mr: 1, fontSize: '0.9rem' }} />
                              <Typography
                                variant="body2"
                                data-testid={`school-list-sports-${school.id}`}
                                sx={{ color: theme.palette.text.secondary }}
                              >
                                {school.available_sports && school.available_sports.length > 0
                                  ? school.available_sports.join(" • ")
                                  : "No sports listed"}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                            <Box sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5
                            }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.primary.main
                                }}
                              >
                                {school.review_count > 500 ? "500+" : school.review_count || 0} {school.review_count === 1 ? "review" : "reviews"}
                              </Typography>
                            </Box>
                            {school.review_count > 0 && (
                              <Box sx={{ mt: 0.5 }}>
                                <StarRating rating={school.average_rating} showValue={true} />
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Paper
                    elevation={2}
                    sx={{
                      textAlign: "center",
                      p: 4,
                      mt: 3,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    }}
                  >
                    <Box sx={{ py: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 600,
                          color: theme.palette.primary.main
                        }}
                      >
                        No Results Found
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          mb: 2,
                          color: theme.palette.text.secondary,
                          maxWidth: 500,
                          mx: 'auto'
                        }}
                      >
                        Try adjusting your search criteria or filters to find more schools.
                      </Typography>
                    </Box>
                  </Paper>
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
                      mt: 2,
                      "& .MuiPaginationItem-root": {
                        fontSize: "1rem",
                        fontWeight: 500,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                      },
                      "& .Mui-selected": {
                        backgroundColor: `${theme.palette.primary.main} !important`,
                        color: '#fff',
                        fontWeight: 600,
                      },
                      "& .MuiPaginationItem-root:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateY(-2px)',
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
                    gap: 2,
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary
                    }}
                  >
                    Jump to:
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    variant="outlined"
                    value={currentPage}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
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
      </Container>

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
              <MenuItem value="Volleyball">Volleyball</MenuItem>
              <MenuItem value="Baseball">Baseball</MenuItem>
              <MenuItem value="Women's Soccer">Women's Soccer</MenuItem>
              {/*<MenuItem value="soccer">Soccer</MenuItem>*/}
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
              borderRadius: 2,
              py: 1.5,
              px: 3,
              fontWeight: 600,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
              },
              '&:active': {
                transform: 'translateY(1px)'
              }
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

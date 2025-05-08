import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Stack,
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  InputLabel,
  FormControl,
  useMediaQuery,
  useTheme,
  MenuItem,
  Grid,
  Container,
  InputAdornment,
  Chip,
  IconButton,
  Paper,
  Divider,
  Avatar,
  Tooltip,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SchoolIcon from "@mui/icons-material/School";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import StarIcon from "@mui/icons-material/Star";
import ClearIcon from "@mui/icons-material/Clear";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Fade from "@mui/material/Fade";
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { getTeamPrimaryColor } from "../utils/teamColorLookup";
import API_BASE_URL from "../utils/config";
import StarRating from "../components/StarRating";

function Home() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);

  const sportIcons = {
  "Men's Basketball": <SportsBasketballIcon fontSize="small" />,
  "Women's Basketball": <SportsBasketballIcon fontSize="small" />,
  "Football": <SportsFootballIcon fontSize="small" />,
  "Volleyball": <SportsVolleyballIcon fontSize="small" />,
  "Baseball": <SportsBaseballIcon fontSize="small" />,
  "Men's Soccer": <SportsSoccerIcon fontSize="small" />,
  "Women's Soccer": <SportsSoccerIcon fontSize="small" />,
  "Wrestling": <SportsMmaIcon fontSize="small" />,
};

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromURL = parseInt(queryParams.get("page")) || 1;
  const searchFromURL = queryParams.get("search") || "";

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const schoolsPerPage = 12;

  const [searchQuery, setSearchQuery] = useState(searchFromURL);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchFromURL);
  const [currentPage, setCurrentPage] = useState(pageFromURL);

  // i icon
  const [popupOpen, setPopupOpen] = useState(false);
  const handleClose = () => setPopupOpen(false);
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
  // Temporary filters state to store changes while dialog is open
  const [tempFilters, setTempFilters] = useState({
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
  // State to track if a dropdown is currently closing
  const [dropdownClosing, setDropdownClosing] = useState(false);
  // State to track the last selected filter to prevent rapid changes
  const [lastSelectedFilter, setLastSelectedFilter] = useState(null);
  // State to track if clicks should be blocked
  const [blockClicks, setBlockClicks] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/secure-home");
    } else {
      fetchSchools();
    }
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newPage = parseInt(params.get("page")) || 1;
    const newSearch = params.get("search") || "";
    setCurrentPage(newPage);
    setSearchQuery(newSearch);
    setPrevSearchQuery(newSearch);
  }, [location.search]);

  useEffect(() => {
    if (searchQuery !== prevSearchQuery) {
      setPrevSearchQuery(searchQuery);
      // Whenever searchQuery changes, update the URL and reset the page to 1
      const params = new URLSearchParams(location.search);
      params.set("page", "1");
      if (searchQuery.trim() !== "") {
        params.set("search", searchQuery);
      } else {
        params.delete("search");
      }
      navigate({search: params.toString()}, {replace: false});
    }
  }, [searchQuery, navigate, location.search]);

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

  const handleSchoolClick = (schoolId) => {
    navigate(`/school/${schoolId}`);
  };

  const fetchSchools = async () => {
    try {
      setSchoolsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/public/schools/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
      setSchools([]);
    } finally {
      setSchoolsLoading(false);
    }
  };

  // Handling outside click of i icon
  const handleClickOutside = (event) => {
    if (event.target.id !== 'popup' && popupOpen) {
      setPopupOpen(false);
    }
  };

  // Filter dialog handlers
  const openFilterDialog = () => {
    // Initialize temp filters with current filter values when opening dialog
    setTempFilters({...filters});
    setFilterDialogOpen(true);
  };

  const closeFilterDialog = () => {
    // Just close the dialog without applying changes
    setFilterDialogOpen(false);
    // Reset temp filters to match the current applied filters
    setTempFilters({...filters});
  };

  const handleFilterChange = (e) => {
    // Prevent changes if clicks are blocked or a dropdown is closing
    if (blockClicks || dropdownClosing) return;

    const { name, value } = e.target;

    // If this is the same filter that was just changed, ignore rapid changes
    if (lastSelectedFilter && lastSelectedFilter.name === name &&
        Date.now() - lastSelectedFilter.timestamp < 500) {
      return;
    }

    // Block all clicks for a short period
    setBlockClicks(true);
    // Set the dropdown closing state to true
    setDropdownClosing(true);
    // Track the last selected filter with a timestamp
    setLastSelectedFilter({ name, timestamp: Date.now() });

    // Update only the temporary filters while dialog is open
    setTempFilters((prevFilters) => ({ ...prevFilters, [name]: value }));

    // Reset the states after a delay
    setTimeout(() => {
      setDropdownClosing(false);
      setBlockClicks(false);
    }, 500); // 500ms delay should be enough to prevent accidental clicks
  };

  const cancelFilters = () => {
    // Discard changes by resetting temp filters to match current filters
    setTempFilters({...filters});
    closeFilterDialog();
  };

  const applyFilters = async () => {
    // Apply temp filters to the actual filters
    setFilters({...tempFilters});
    closeFilterDialog();

    const queryParams = new URLSearchParams();
    if (tempFilters.sport) queryParams.append("sport", tempFilters.sport);
    // Append rating filters if provided
    [
      "head_coach",
      "assistant_coaches",
      "team_culture",
      "campus_life",
      "athletic_facilities",
      "athletic_department",
      "player_development",
      "nil_opportunity",
    ].forEach((field) => {
      if (tempFilters[field]) {
        queryParams.append(field, tempFilters[field]);
      }
    });

    try {
      setLoading(true);
      setSchoolsLoading(true);
      console.log("Applying filters with params:", queryParams.toString());
      const response = await fetch(
        `${API_BASE_URL}/api/filter/?${queryParams.toString()}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Filter response:", data);
        setFilteredSchools(data);
        setFilterApplied(true);
        setCurrentPage(1);
        updatePageInURL(1);
      } else {
        console.error("Error applying filters");
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setLoading(false);
      setSchoolsLoading(false);
    }
  };

  const clearFilters = () => {
    // Set loading state when clearing filters
    setSchoolsLoading(true);

    const emptyFilters = {
      head_coach: "",
      assistant_coaches: "",
      team_culture: "",
      campus_life: "",
      athletic_facilities: "",
      athletic_department: "",
      player_development: "",
      nil_opportunity: "",
      sport: "",
    };
    // Clear both actual and temporary filters
    setFilters(emptyFilters);
    setTempFilters(emptyFilters);
    setFilterApplied(false);
    setFilteredSchools([]);
    // closeFilterDialog();

    // Set loading to false after a short delay to allow the UI to update
    setTimeout(() => {
      setSchoolsLoading(false);
    }, 300);
  };

  // Determine which schools to display: filtered if applied, else all
  const schoolsToDisplay = filterApplied ? filteredSchools : schools;
  // Apply search filter on top
  const filteredBySearch = schoolsToDisplay.filter((school) =>
    school.school_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

    // Sort alphabetically
  const sortedFilteredSchools = [...filteredBySearch].sort((a, b) =>
    a.school_name.localeCompare(b.school_name)
  );
  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = sortedFilteredSchools.slice(indexOfFirstSchool, indexOfLastSchool);



  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
          overflow: 'hidden',
          mb: 6,
        }}
      >
        {/* Background gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(58, 134, 255, 0.9) 0%, rgba(131, 56, 236, 0.8) 100%)',
            zIndex: 1,
          }}
        >
            {/* Info Icon (i) inside the background gradient overlay */}
  <IconButton
    sx={{
      position: 'absolute',
      top: '20px',  // Adjust this value to position it vertically
      left: '20px', // Adjust this value to position it horizontally
      zIndex: 2,
    background: 'linear-gradient(135deg, rgba(131, 56, 236, 0.8) 0%, rgba(58, 134, 255, 0.9) 100%)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(131, 56, 236, 0.8) 0%, rgba(58, 134, 255, 0.9) 100%)',
    },
    }}
    onClick={() => setPopupOpen(true)} // Open the popup
  >
    <InfoOutlinedIcon fontSize="large" />
  </IconButton>


</Box>

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              animation: 'fadeInUp 0.8s ease-out',
              '@keyframes fadeInUp': {
                '0%': { opacity: 0, transform: 'translateY(30px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >

            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              Athletic Insider
            </Typography>

      {/* MUI Dialog w/ Fade */}
      <Dialog
        open={popupOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        closeAfterTransition
        TransitionComponent={Fade}
        transitionDuration={400}
        PaperProps={{
          sx: {
            background: 'linear-gradient(90deg, #3a86ff, #8338ec)',
            borderRadius: 2,
            p: 3,
            boxShadow: 3,

            mx: 'auto',
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>
          About the Website
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>
            This website helps college athletes make informed decisions on
            the schools they can go to.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{ background: '#fff', color: '#333' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

            <Typography
              variant="h5"
              sx={{
                mb: 4,
                fontWeight: 400,
                maxWidth: '800px',
                mx: 'auto',
                opacity: 0.9
              }}
            >
              Discover and explore collegiate athletic programs across the country
            </Typography>

            {/* Search Bar */}
            <Box
              sx={{
                animation: 'fadeIn 0.5s ease-out 0.3s both',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'scale(0.9)' },
                  '100%': { opacity: 1, transform: 'scale(1)' },
                },
              }}
            >
              <Paper
                elevation={4}
                sx={{
                  p: 0.5,
                  display: 'flex',
                  width: '100%',
                  maxWidth: '600px',
                  mx: 'auto',
                  borderRadius: 30,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <TextField
                  placeholder="Search for schools..."
                  fullWidth
                  variant="standard"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    disableUnderline: true,
                    sx: { px: 2, py: 1 }
                  }}
                />
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <Tooltip title="Filter schools">
                  <IconButton
                    aria-label="Filters"
                    color="primary"
                    onClick={openFilterDialog}
                    sx={{ mx: 1 }}
                  >
                    <FilterListIcon />
                  </IconButton>
                </Tooltip>
              </Paper>

              {filterApplied && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Chip
                    label="Clear Filters"
                    onDelete={clearFilters}
                    color="primary"
                    variant="outlined"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '& .MuiChip-deleteIcon': {
                        color: theme.palette.primary.main
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg">
        {/* Schools List */}
        <Typography
          variant="h4"
          component="h2"
          sx={{
            mb: 4,
            fontWeight: 700,
            textAlign: 'center',
            background: 'linear-gradient(90deg, #3a86ff, #8338ec)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Explore Schools
        </Typography>

        <Box
          sx={{
            opacity: 1,
            animation: 'fadeIn 0.5s ease-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 },
            },
          }}
        >
          <Grid container spacing={3}>
            {schoolsLoading ? (
              // Loading skeleton
              Array.from(new Array(6)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
                  <Box
                    sx={{
                      opacity: 1,
                      animation: 'pulse 1.5s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.6 },
                        '50%': { opacity: 0.8 },
                        '100%': { opacity: 0.6 },
                      },
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        height: 300,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.paper, 0.7),
                      }}
                    />
                  </Box>
                </Grid>
              ))
            ) : currentSchools.length > 0 ? (
              currentSchools.map((school) => {
                const primaryColor = getTeamPrimaryColor(school.school_name, theme.palette.primary.main);
                return (
                  <Grid item xs={12} sm={6} md={4} key={school.id}>
                    <Box
                      sx={{
                        opacity: 1,
                        animation: 'fadeInUp 0.5s ease-out',
                        '@keyframes fadeInUp': {
                          '0%': {opacity: 0, transform: 'translateY(20px)'},
                          '100%': {opacity: 1, transform: 'translateY(0)'},
                        },
                        animationFillMode: 'both',
                      }}
                    >
                      <Card
                        id={`school-${school.id}`}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          borderRadius: 3,
                          overflow: 'hidden',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
                          },
                        }}
                        onClick={() => handleSchoolClick(school.id)}
                      >
                        <Box
                          sx={{
                            height: 120,
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${alpha(primaryColor, 0.6)} 100%)`,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              zIndex: 1,
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 60,
                                height: 60,
                                bgcolor: 'white',
                                color: theme.palette.primary.main,
                                fontWeight: 'bold',
                                fontSize: '1.5rem'
                              }}
                            >
                              {school.school_name.charAt(0)}
                            </Avatar>
                          </Box>
                        </Box>

                        <CardContent sx={{flexGrow: 1, p: 3}}>
                          <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                            <Typography variant="h6" sx={{fontWeight: 700}}>
                              {school.school_name}
                            </Typography>

                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                px: 1,
                                py: 0.5,
                                borderRadius: 10,
                              }}
                            >
                              <StarIcon sx={{color: theme.palette.warning.main, fontSize: '0.9rem', mr: 0.5}}/>
                              <Typography variant="body2" sx={{fontWeight: 600, color: theme.palette.primary.main}}>
                                {school.average_rating ? school.average_rating.toFixed(1) : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{display: 'flex', alignItems: 'center', mb: 1.5}}>
                            <LocationOnIcon sx={{color: theme.palette.text.secondary, fontSize: '0.9rem', mr: 0.5}}/>
                            <Typography variant="body2" color="text.secondary">
                              {school.location}
                            </Typography>
                          </Box>

                          <Box sx={{display: 'flex', alignItems: 'center', mb: 1.5}}>
                            <SchoolIcon sx={{color: theme.palette.text.secondary, fontSize: '0.9rem', mr: 0.5}}/>
                            <Typography variant="body2" color="text.secondary">
                              {school.conference}
                            </Typography>
                          </Box>

                          <Divider sx={{my: 1.5}}/>

                          <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 2}}>
                            {school.available_sports?.map((sport, index) => (
                              <Chip
                                key={index}
                                label={sport}
                                size="small"
                                icon={sportIcons[sport] || <SportsSoccerIcon fontSize="small" />}
                                sx={{
                                  borderRadius: '16px',
                                  bgcolor: alpha(theme.palette.primary.light, 0.1),
                                  color: theme.palette.primary.dark,
                                  fontWeight: 500,
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                            {(!school.available_sports || school.available_sports.length === 0) && (
                              <Typography variant="body2" color="text.secondary">
                                No sports listed
                              </Typography>
                            )}
                          </Box>
                        </CardContent>

                        <Box
                          sx={{
                            p: 2,
                            pt: 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {school.review_count || 0} {school.review_count === 1 ? "Review" : "Reviews"}
                          </Typography>
                        </Box>
                      </Card>
                    </Box>
                  </Grid>
                );
              })
            ) : !schoolsLoading ? (
              <Grid item xs={12}>
                <Box
                  sx={{
                    opacity: 1,
                    animation: 'fadeInUp 0.5s ease-out',
                    '@keyframes fadeInUp': {
                      '0%': { opacity: 0, transform: 'translateY(20px)' },
                      '100%': { opacity: 1, transform: 'translateY(0)' },
                    },
                    animationFillMode: 'both',
                  }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                    }}
                  >
                    <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                      No schools found matching your criteria
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={clearFilters}
                      sx={{ mt: 2 }}
                      startIcon={<ClearIcon />}
                    >
                      Clear Filters
                    </Button>
                  </Paper>
                </Box>
              </Grid>
            ) : null}
          </Grid>
        </Box>

        {filteredBySearch.length > schoolsPerPage && (
          <Box sx={{ mt: 5, mb: 8, display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={2}
              sx={{
                p: 1,
                borderRadius: 10,
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
              }}
            >
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
                  '& .MuiPaginationItem-root': {
                    fontSize: '1rem',
                    fontWeight: 500,
                    mx: 0.5,
                  },
                  '& .Mui-selected': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                  },
                }}
              />
            </Paper>

            {!isSmallScreen && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  ml: 2,
                  gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
                  Jump to:
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  variant="outlined"
                  value={currentPage}
                  InputProps={{
                    sx: { borderRadius: 2, width: '80px' }
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
                style: { textAlign: "center" }
              }}
            />
              </Box>
            )}
          </Box>
        )}

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={cancelFilters} // Use cancelFilters to handle clicking outside the dialog
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}>
        <DialogTitle>Apply Filters</DialogTitle>
        <DialogContent>
          {/* Click blocker overlay */}
          {blockClicks && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                backgroundColor: 'transparent',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              fullWidth
              id="sport-select"
              label="Choose Sport"
              name="sport"
              value={tempFilters.sport}
              onChange={handleFilterChange}
              variant="outlined"
              margin="normal"
            >
              <MenuItem
                value=""
                onClick={(e) => {
                  if (dropdownClosing) {
                    e.stopPropagation();
                    return;
                  }
                }}
              >All Sports</MenuItem>
              <MenuItem
                value="Men's Basketball"
                onClick={(e) => {
                  if (dropdownClosing) {
                    e.stopPropagation();
                    return;
                  }
                }}
              >Men's Basketball</MenuItem>
              <MenuItem
                value="Women's Basketball"
                onClick={(e) => {
                  if (dropdownClosing) {
                    e.stopPropagation();
                    return;
                  }
                }}
              >Women's Basketball</MenuItem>
              <MenuItem
                value="Football"
                onClick={(e) => {
                  if (dropdownClosing) {
                    e.stopPropagation();
                    return;
                  }
                }}
              >Football</MenuItem>
                <MenuItem
                value="Volleyball"
                onClick={(e) => {
                  if (dropdownClosing) {
                    e.stopPropagation();
                    return;
                  }
                }}
              >Volleyball</MenuItem>
                <MenuItem
                value="Baseball"
                onClick={(e) => {
                  if (dropdownClosing) {
                    e.stopPropagation();
                    return;
                  }
                }}
              >Baseball</MenuItem>
                <MenuItem
                value="Men's Soccer"
                onClick={(e) => {
                  if (dropdownClosing) {
                    e.stopPropagation();
                    return;
                  }
                }}
              >Men's Soccer</MenuItem>
                <MenuItem
                value="Women's Soccer"
                onClick={(e) => {
                  if (dropdownClosing) {
                    e.stopPropagation();
                    return;
                  }
                }}
              >Women's Soccer</MenuItem>
                <MenuItem
                value="Wrestling"
                onClick={(e) => {
                  if (dropdownClosing) {
                    e.stopPropagation();
                    return;
                  }
                }}
              >Wrestling</MenuItem>
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
                    value={tempFilters.head_coach}
                    onChange={handleFilterChange}
                    label="Head Coach Rating"
                  >
                    <MenuItem value="">Any</MenuItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <MenuItem
                        key={rating}
                        value={rating}
                        // Add a small delay when clicking to prevent rapid clicks
                        onClick={(e) => {
                          if (dropdownClosing) {
                            e.stopPropagation();
                            return;
                          }
                        }}
                      >
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
                    value={tempFilters.assistant_coaches}
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
                    value={tempFilters.team_culture}
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
                    value={tempFilters.campus_life}
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
                    value={tempFilters.athletic_facilities}
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
                    value={tempFilters.athletic_department}
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
                    value={tempFilters.player_development}
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
                    value={tempFilters.nil_opportunity}
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
            startIcon={<ClearIcon />}
            sx={{
              borderRadius: 30,
              py: 1,
              px: 3,
              fontWeight: 600
            }}
          >
            Clear Filters
          </Button>
          <Button
            onClick={cancelFilters}
            color="inherit"
            sx={{
              borderRadius: 30,
              py: 1,
              px: 3,
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            id="apply-filters-button"
            data-testid="apply-filters-button"
            name="apply-filters-button"
            onClick={applyFilters}
            color="primary"
            variant="contained"
            startIcon={<FilterListIcon />}
            sx={{
              borderRadius: 30,
              py: 1,
              px: 3,
              fontWeight: 600
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
}

// These styles are kept for backward compatibility but are no longer used
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
  searchContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
    marginBottom: "20px",
  },
  container: {
    textAlign: "center",
    marginTop: "50px",
    marginBottom: "50px",
  },
};

export default Home;

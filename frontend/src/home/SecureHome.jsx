import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import API_BASE_URL from "../utils/config";

function SecureHome() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [schools, setSchools] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
  });
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);

  // Get user from context
  const { user, logout } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

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
          setSchools(data);
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

    fetchSchools();
  }, []);  // Empty dependency array to run only once on mount

  // Account menu handlers
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

    const queryParams = new URLSearchParams();
    if (filters.coach) queryParams.append("coach", filters.coach);
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
      if (filters[field]) {
        queryParams.append(field, filters[field]);
      }
    });

    try {
      setLoading(true);
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
    });
    setFilterApplied(false);
    setFilteredSchools([]);
    closeFilterDialog();
  };

  // Determine which schools to display: filtered if applied, else all
  const schoolsToDisplay = filterApplied ? filteredSchools : schools;
  // Apply search filter on top
  const filteredBySearch = schoolsToDisplay.filter((school) =>
    school.school_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

            <Box sx={{ display: "flex", justifyContent: "center", mb: 4, gap: 2 }}>
              <TextField
                label="Search Schools"
                variant="outlined"
                fullWidth
                sx={{ width: "90%", maxWidth: 600 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                id="filter-button"
                variant="contained"
                color="primary"
                onClick={openFilterDialog}
              >
                Filter
              </Button>
            </Box>

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
                <Button
                  id="preference-form-button"
                  variant="outlined"
                  color="primary"
                  onClick={handleGoToPreferenceForm}
                >
                  Fill Preference Form
                </Button>
              </Box>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <Stack spacing={2} sx={{ px: 2 }}>
                {filteredBySearch.length > 0 ? (
                  filteredBySearch.map((school) => (
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
          </motion.div>
        </Grid>
      </Grid>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={closeFilterDialog} fullWidth maxWidth="sm">
        <DialogTitle>Apply Filters</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Coach Name"
              name="coach"
              value={filters.coach}
              onChange={handleFilterChange}
              fullWidth
              variant="outlined"
              placeholder="Enter coach name"
            />

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

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import API_BASE_URL from "../utils/config";

function SecureHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [schools, setSchools] = useState([]);

  const schoolsPerPage = 10;

  const queryParams = new URLSearchParams(location.search);
  const pageFromURL = parseInt(queryParams.get("page")) || 1;
  const searchFromURL = queryParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(searchFromURL);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchFromURL);
  const [currentPage, setCurrentPage] = useState(pageFromURL);

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
        }
      } catch (error) {
        console.error("Account page error:", error);
      }
    };

    // Fetch Schools
    const fetchSchools = async () => {
      try {
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
        setSchools(data);
      } catch (error) {
        console.error("Error fetching schools:", error);
        setSchools([]);
      }
    };

    fetchUserInfo();
    fetchSchools();
  }, [navigate]);

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
    localStorage.removeItem("token");
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
    const token = localStorage.getItem("token");
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
        setCurrentPage(1);
        updatePageInURL(1);
      } else {
        console.error("Error applying filters");
      }
    } catch (error) {
      console.error("Error applying filters:", error);
    }
    closeFilterDialog();
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

  return (
    <Box id="secure-home" sx={{ position: "relative", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Top Right Account Icon */}
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}>
        <IconButton id={"account-icon"} onClick={handleMenuOpen} size="large" sx={{ bgcolor: "#fff", borderRadius: "50%" }}>
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
              <Button variant="contained" color="primary" onClick={openFilterDialog}>
                Filters
              </Button>
              {filterApplied && (
                <Button variant="outlined" color="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Box>

            {user.transfer_type !== "high_school" && (
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Button variant="contained" color="primary" onClick={handleGoToReviewForm}>
                  Submit a Review
                </Button>
              </Box>
            )}

            {user.transfer_type !== "graduate" && (
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Button variant="contained" color="primary" onClick={handleGoToPreferenceForm}>
                  Submit your Preferences
                </Button>
              </Box>
            )}

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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Coach Name"
              name="coach"
              value={filters.coach}
              onChange={handleFilterChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel htmlFor="head_coach-select" id="head_coach-label">
                Head Coach Rating
              </InputLabel>
              <Select
                native
                labelId="head_coach-label"
                id="head_coach-select"
                label="Head Coach Rating"
                name="head_coach"
                value={filters.head_coach}
                onChange={handleFilterChange}
              >
                <option value=""> </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="assistant_coaches-select" id="assistant_coaches-label">
                Assistant Coaches Rating
              </InputLabel>
              <Select
                native
                labelId="assistant_coaches-label"
                id="assistant_coaches-select"
                label="Assistant Coaches Rating"
                name="assistant_coaches"
                value={filters.assistant_coaches}
                onChange={handleFilterChange}
              >
                <option value=""> </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="team_culture-select" id="team_culture-label">
                Team Culture Rating
              </InputLabel>
              <Select
                native
                labelId="team_culture-label"
                id="team_culture-select"
                label="Team Culture Rating"
                name="team_culture"
                value={filters.team_culture}
                onChange={handleFilterChange}
              >
                <option value=""> </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="campus_life-select" id="campus_life-label">
                Campus Life Rating
              </InputLabel>
              <Select
                native
                labelId="campus_life-label"
                id="campus_life-select"
                label="Campus Life Rating"
                name="campus_life"
                value={filters.campus_life}
                onChange={handleFilterChange}
              >
                <option value=""> </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="athletic_facilities-select" id="athletic_facilities-label">
                Athletic Facilities Rating
              </InputLabel>
              <Select
                native
                labelId="athletic_facilities-label"
                id="athletic_facilities-select"
                label="Athletic Facilities Rating"
                name="athletic_facilities"
                value={filters.athletic_facilities}
                onChange={handleFilterChange}
              >
                <option value=""> </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="athletic_department-select" id="athletic_department-label">
                Athletic Department Rating
              </InputLabel>
              <Select
                native
                labelId="athletic_department-label"
                id="athletic_department-select"
                label="Athletic Department Rating"
                name="athletic_department"
                value={filters.athletic_department}
                onChange={handleFilterChange}
              >
                <option value=""> </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="player_development-select" id="player_development-label">
                Player Development Rating
              </InputLabel>
              <Select
                native
                labelId="player_development-label"
                id="player_development-select"
                label="Player Development Rating"
                name="player_development"
                value={filters.player_development}
                onChange={handleFilterChange}
              >
                <option value=""> </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="nil_opportunity-select" id="nil_opportunity-label">
                NIL Opportunity Rating
              </InputLabel>
              <Select
                native
                labelId="nil_opportunity-label"
                id="nil_opportunity-select"
                label="NIL Opportunity Rating"
                name="nil_opportunity"
                value={filters.nil_opportunity}
                onChange={handleFilterChange}
              >
                <option value=""> </option>
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={clearFilters} color="secondary">
            Clear
          </Button>
          <Button onClick={applyFilters} color="primary" variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SecureHome;

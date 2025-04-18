import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"
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
} from "@mui/material";
import API_BASE_URL from "../utils/config";

function Home() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromURL = parseInt(queryParams.get("page")) || 1;
  const searchFromURL = queryParams.get("search") || "";

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const schoolsPerPage = 10;

  const [searchQuery, setSearchQuery] = useState(searchFromURL);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchFromURL);
  const [currentPage, setCurrentPage] = useState(pageFromURL);

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
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(`${API_BASE_URL}/api/public/schools/`);
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

  // Filter dialog handlers
  const openFilterDialog = () => {
    setFilterDialogOpen(true);
  };
  const closeFilterDialog = () => {
    setFilterDialogOpen(false);
  };
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };
  const applyFilters = async () => {
    closeFilterDialog();

    const queryParams = new URLSearchParams();
    if (filters.sport) queryParams.append("sport", filters.sport);
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
    }
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
    setFilterApplied(false);
    setFilteredSchools([]);
    // closeFilterDialog();
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
    <div>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>Athletic Insider</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <Link to="/signup" style={styles.navLink}>
            Sign Up
          </Link>
          <Link to="/login" style={styles.navLink}>
            Login
          </Link>
        </div>
      </nav>
      {/* Main Content */}
      <div style={styles.searchContainer}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
          Explore the Schools and their Sports!
        </Typography>
        {/* Search Bar */}
        <TextField
          label="Search Schools"
          variant="outlined"
          fullWidth
          sx={{ width: "90%", maxWidth: "500px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button variant="contained" color="primary" onClick={openFilterDialog}>
            Filters
          </Button>
          {filterApplied && (
            <Button variant="outlined" color="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Box>
      </div>
      {/* Schools List */}
      <Stack spacing={2} sx={{ px: 2, pb: 4, textAlign: "center" }}>
        {currentSchools.length > 0 ? (
          currentSchools.map((school) => (
            <Card
              key={school.id}
              id={`school-${school.id}`}
              sx={{
                width: "100%",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
              onClick={() => handleSchoolClick(school.id)}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {school.school_name}
                  </Typography>
                  <Typography variant="body2">
                    {school.available_sports?.length > 0
                      ? school.available_sports.join(" • ")
                      : "No sports listed"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="h6" sx={{ mt: 3 }}>
            No results found
          </Typography>
        )}
      </Stack>
      {filteredBySearch.length > schoolsPerPage && (
        <Box sx={{ position: "relative", mt: 3, mb: 9 }}>
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

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={closeFilterDialog} fullWidth maxWidth="sm">
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
            Clear Filters
          </Button>
          <Button
            id="apply-filters-button"
            data-testid="apply-filters-button"
            name="apply-filters-button"
            onClick={applyFilters}
            color="primary"
            variant="contained"
            sx={{
              borderRadius: "20px",
              py: 0.6,
              px: 2,
              textTransform: "none",
              fontWeight: 500
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
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

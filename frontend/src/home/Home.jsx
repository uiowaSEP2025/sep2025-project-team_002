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
  });
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);

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
      const response = await fetch(
        `${API_BASE_URL}/api/filter/?${queryParams.toString()}`
      );
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
          <Button id="apply-filters-button" onClick={applyFilters} color="primary" variant="contained">
            Apply
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

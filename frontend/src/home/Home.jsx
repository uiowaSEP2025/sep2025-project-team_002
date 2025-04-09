import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Stack, Card, CardContent, Box, Typography, TextField, Pagination } from "@mui/material";
import API_BASE_URL from "../utils/config";

function Home() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromURL = parseInt(queryParams.get("page")) || 1;
  const searchFromURL = queryParams.get("search") || "";

  const schoolsPerPage = 10;

  const [searchQuery, setSearchQuery] = useState(searchFromURL);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchFromURL);
  const [currentPage, setCurrentPage] = useState(pageFromURL);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/secure-home");
    } else {
      fetchSchools();
    }
  }, []);

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

  const handlePageChange = (event, newPage) => {
    const params = new URLSearchParams(location.search);
    params.set("page", newPage.toString());
    if (searchQuery.trim() !== "") {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    navigate({ search: params.toString() }, { replace: false });
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
      console.error('Error fetching schools:', error);
      setSchools([]);
    }
  };

  const filteredSchools = schools.filter((school) => school.school_name.toLowerCase().includes(searchQuery.toLowerCase()));
  const indexOfLastSchool = currentPage * schoolsPerPage;
  const indexOfFirstSchool = indexOfLastSchool - schoolsPerPage;
  const currentSchools = filteredSchools.slice(indexOfFirstSchool, indexOfLastSchool);

  return (
    <div>
        {/* Navbar */}
        <nav style = {styles.navbar}>
            <h2 style = {styles.logo}>Athletic Insider </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <Link to = "/signup" style = {styles.navLink}> Sign Up</Link>
                <Link to = "/login" style = {styles.navLink}> Login </Link>
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
        </div>


        {/* Schools List */}
        <Stack spacing={2} sx={{ px: 2, pb: 4, textAlign: "center" }}>
            {currentSchools.length > 0 ? (
                currentSchools.map((school) => (
                    <Card
                        key={school.id}
                        id={`school-${school.id}`}
                        sx={{ width: "100%", cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                        onClick={() => navigate(`/school/${school.id}`)}
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
                <Typography variant="h6" sx={{ mt: 3 }}>No results found</Typography>
            )}
        </Stack>

        {filteredSchools.length > schoolsPerPage && (
          <Box sx={{ position: "relative", mt: 3, mb: 9 }}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Pagination
                count={Math.ceil(filteredSchools.length / schoolsPerPage)}
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
                  max: Math.ceil(filteredSchools.length / schoolsPerPage),
                  style: { width: 60, textAlign: "center" }
                }}
              />
            </Box>
          </Box>
        )}
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
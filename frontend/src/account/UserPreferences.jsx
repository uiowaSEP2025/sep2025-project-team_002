import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Button,
Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from "@mui/material";
import API_BASE_URL from "../utils/config.js";

function UserPreferences() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(null);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);


  useEffect(() => {
      const fetchPreferences = async () => {
        try {
            const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login"); // Redirect if not logged in
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/preferences/user-preferences/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch preferences.");
        }

        const data = await response.json();
        if (data.length === 0){
           setOpenDialog(true);
          return;
        }
        setPreferences(data[0]); // Assuming API returns an array, use the first item
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPreferences();
  }, [navigate]);

  if (error) return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;

    if (openDialog) {
    return (
      <Dialog open={openDialog} onClose={() => navigate("/preference-form")}>
        <DialogTitle>No Preferences Found</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You haven't submitted any preferences yet.
            <br />
            Please complete the preference form to continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
              onClick={() => navigate("/preference-form")}
              color="primary"
              variant="contained"
            >
              Go to Preference Form
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  }
     if (!preferences) {
    return null; // or you could return a loading spinner here
  }


return (
    <Box sx={{ maxWidth: "600px", margin: "auto", padding: "20px", textAlign: "center", backgroundColor: "#fff", borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>Your Submitted Preferences</Typography>

      <Typography variant="h5" sx={{ mt: 2, fontWeight: "bold" }}>Sport:</Typography>
      <Typography variant="h6" sx={{ color: "#333", fontSize: "1.2rem" }}>{preferences.sport}</Typography>

      <Box sx={{ mt: 3, textAlign: "left" }}>
        {[
          { label: "Head Coach", value: preferences.head_coach },
          { label: "Assistant Coaches", value: preferences.assistant_coaches },
          { label: "Team Culture", value: preferences.team_culture },
          { label: "Campus Life", value: preferences.campus_life },
          { label: "Athletic Facilities", value: preferences.athletic_facilities },
          { label: "Athletic Department", value: preferences.athletic_department },
          { label: "Player Development", value: preferences.player_development },
          { label: "NIL Opportunity", value: preferences.nil_opportunity },
        ].map((item, index) => (
          <Box key={index} sx={{ display: "flex", justifyContent: "space-between", mb: 2, borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#444" }}>{item.label}:</Typography>
            <Typography variant="h6" sx={{ color: "#222", fontSize: "1.2rem" }}>{item.value}/10</Typography>
          </Box>
        ))}
      </Box>


      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4, fontSize: "1rem",  padding: "10px 20px" }}
        onClick={() => navigate("/account")}
      >
        Back to Account
      </Button>

    </Box>
  );
}

export default UserPreferences;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Button,
Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import RateReviewIcon from "@mui/icons-material/RateReview";
import API_BASE_URL from "../utils/config.js";
import { useUser } from "../context/UserContext.jsx";
import SidebarWrapper from "../components/SidebarWrapper.jsx";

function UserPreferences() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(null);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  // Get user context for logout functionality
  const {logout, user} = useUser();  // 从 context 中获取 user

  const menuItems = [
    {
      text: "Return to Dashboard",
      action: () => navigate("/secure-home"),
      icon: <DashboardIcon fontSize="medium"/>
    },
    {
      text: "Account Info",
      action: () => navigate("/account"),
      icon: <AccountCircleIcon fontSize="medium"/>
    },
    {
      text: "Account Settings",
      action: () => navigate("/account/settings"),
      icon: <SettingsIcon fontSize="medium"/>
    },
    ...(user?.transfer_type && user.transfer_type !== "graduate"
      ? [{
        text: "Completed Preference Form",
        action: () => navigate("/user-preferences/"),
        icon: <CheckCircleIcon fontSize="medium"/>
      }]
      : []),
    ...(user?.transfer_type && user.transfer_type !== "high_school"
      ? [{
        text: "My Reviews",
        action: () => navigate("/account/my-reviews"),
        icon: <RateReviewIcon fontSize="medium"/>
      }]
      : []),
    {
      text: "Logout",
      action: () => {
        logout();
        navigate("/login");
      },
      icon: <LogoutIcon fontSize="medium"/>
    }
  ];


  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login"); // Redirect if not logged in
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/preferences/user-preferences/`, {
          headers: {Authorization: `Bearer ${token}`},
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            logout();
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch preferences.");
        }
        const data = await response.json();
        if (data.length === 0) {
          setOpenDialog(true);
          return;
        }
        setPreferences(data[0]); // Assuming API returns an array, use the first item
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPreferences();
  }, [navigate, logout]);

  const handleModifyPreferenceForm = () => {
    navigate("/preference-form", { state: { isEditing: true } });
  };

  return (
    <SidebarWrapper title="My Preferences" menuItems={menuItems}>
      {error && (
        <Typography color="error" align="center" sx={{mt: 4}}>
          {error}
        </Typography>
      )}

      {openDialog ? (
        <Dialog
          open={openDialog}
          onClose={() => navigate("/preference-form")}
          sx={{
            "& .MuiDialog-container": {
              justifyContent: "flex-start",
            },
            "& .MuiPaper-root": {
              marginLeft: { xs: "0", md: "calc(40% + 60px)" },
              transform: "translateY(0%)",
            }
          }}
        >
          <DialogTitle id={"no-preferences-dialog"}>No Preferences Found</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You haven't submitted any preferences yet.
              <br/>
              Please complete the preference form to continue.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Box sx={{display: 'flex', justifyContent: 'center', width: '100%'}}>
              <Button
                onClick={() => navigate("/preference-form")}
                color="primary"
                variant="contained"
                id="fillout-pref-btn"
              >
                Go to Preference Form
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      ) : !preferences ? null : (
        <Box sx={{
          maxWidth: "600px",
          margin: "auto",
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: 3
        }}>
          <Typography id="submitted-preferences-title" variant="h4" sx={{mb: 3, fontWeight: "bold"}}>Your Submitted Preferences</Typography>
          <Typography variant="h5" sx={{mt: 2, fontWeight: "bold"}}>Sport:</Typography>
          <Typography id="user-sport" variant="h6" sx={{color: "#333", fontSize: "1.2rem"}}>{preferences.sport}</Typography>
          <Box sx={{mt: 3, textAlign: "left"}}>
            {[
              {label: "Head Coach", value: preferences.head_coach},
              {label: "Assistant Coaches", value: preferences.assistant_coaches},
              {label: "Team Culture", value: preferences.team_culture},
              {label: "Campus Life", value: preferences.campus_life},
              {label: "Athletic Facilities", value: preferences.athletic_facilities},
              {label: "Athletic Department", value: preferences.athletic_department},
              {label: "Player Development", value: preferences.player_development},
              {label: "NIL Opportunity", value: preferences.nil_opportunity},
            ].map((item, index) => (
              <Box key={index} sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                borderBottom: "1px solid #ddd",
                paddingBottom: "5px"
              }}>
                <Typography variant="h6" sx={{fontWeight: "bold", color: "#444"}}>{item.label}:</Typography>
                <Typography variant="h6" sx={{color: "#222", fontSize: "1.2rem"}}>{item.value}/10</Typography>
              </Box>
            ))}
          </Box>
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
    </SidebarWrapper>
  );
}

export default UserPreferences;

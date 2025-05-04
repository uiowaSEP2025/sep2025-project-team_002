import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Chip,
  Divider,
  useTheme,
  alpha,
  Rating,
  Grid
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import RateReviewIcon from "@mui/icons-material/RateReview";
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsMmaIcon from '@mui/icons-material/SportsMma';
import StarIcon from "@mui/icons-material/Star";
import API_BASE_URL from "../utils/config.js";
import { useUser } from "../context/UserContext.jsx";
import SidebarWrapper from "../components/SidebarWrapper.jsx";

function UserPreferences() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [preferences, setPreferences] = useState(null);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  // Get user context for logout functionality
  const {logout, user} = useUser();

  const sportIcons = {
  "Men's Basketball": <SportsBasketballIcon />,
  "Women's Basketball": <SportsBasketballIcon />,
  "Football": <SportsFootballIcon />,
  "Volleyball": <SportsVolleyballIcon />,
  "Baseball": <SportsBaseballIcon />,
  "Men's Soccer": <SportsSoccerIcon />,
  "Women's Soccer": <SportsSoccerIcon />,
  "Wrestling": <SportsMmaIcon />,
};

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

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
      <Box
        sx={{
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 4,
            textAlign: "center",
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          My Preferences
        </Typography>

        {error && (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            }}
          >
            <Typography color="error.main" align="center" sx={{ fontWeight: 500 }}>
              {error}
            </Typography>
          </Paper>
        )}

      {openDialog ? (
        <Dialog
          open={openDialog}
          onClose={() => navigate("/preference-form")}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: 3,
              p: 2,
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle
            id={"no-preferences-dialog"}
            sx={{
              textAlign: 'center',
              fontWeight: 600,
              color: theme.palette.primary.main,
              pb: 1
            }}
          >
            No Preferences Found
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ textAlign: 'center', mb: 2 }}>
              You haven't submitted any preferences yet.
              <br/>
              Please complete the preference form to continue.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              onClick={() => navigate("/preference-form")}
              color="primary"
              variant="contained"
              id="fillout-pref-btn"
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
              Go to Preference Form
            </Button>
          </DialogActions>
        </Dialog>
      ) : !preferences ? null : (
        <Paper
          elevation={2}
          sx={{
            maxWidth: "700px",
            margin: "auto",
            p: 4,
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              id="submitted-preferences-title"
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: theme.palette.primary.main
              }}
            >
              Your Submitted Preferences
            </Typography>

            <Chip
              icon={sportIcons[preferences.sport] || <SportsBasketballIcon />}
              label={preferences.sport}
              color="primary"
              variant="outlined"
              data-testid="preference-sport"
              sx={{
                fontSize: '1rem',
                fontWeight: 500,
                py: 2.5,
                px: 1,
                borderRadius: 3
              }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
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
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{
                  display: "flex",
                  flexDirection: "column",
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  height: '100%'
                }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 1
                    }}
                  >
                    {item.label}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <Rating
                      value={item.value / 2}
                      precision={0.5}
                      readOnly
                      emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                      sx={{
                        color: theme.palette.warning.main,
                        mr: 1
                      }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.secondary,
                        ml: 'auto'
                      }}
                    >
                      {item.value}/10
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleModifyPreferenceForm}
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
              Modify Preferences
            </Button>
          </Box>
        </Paper>
      )}
      </Box>
    </SidebarWrapper>
  );
}

export default UserPreferences;

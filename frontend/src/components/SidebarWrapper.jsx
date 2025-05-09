import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  alpha,
  Paper,
  Container
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";

const SidebarWrapper = ({ title = "My Account", menuItems = [], children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [menuOpen, setMenuOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  // Render menu items
  const renderMenuList = () =>
    menuItems.map((item, index) => (
      <ListItem key={index} disablePadding
      sx={{
        mt: isMobile && index === 0 ? 2 : 0  // Add margin-top to the first item on mobile
      }}>
        <ListItemButton
          onClick={() => {
            item.action();
            // If on mobile, close the overlay after navigating
            if (isMobile) setMobileMenuOpen(false);
          }}
          sx={{
            borderRadius: 2,
            mb: 1,
            pl: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha('#fff', 0.1),
              transform: 'translateX(4px)'
            }
          }}
        >
          {item.icon && React.cloneElement(item.icon, {
            sx: { color: alpha('#fff', 0.9) }
          })}
          {/* Desktop: only show text if side menu is expanded */}
          {!isMobile && menuOpen && (
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                sx: {
                  ml: 1,
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: alpha('#fff', 0.9)
                }
              }}
            />
          )}
          {/* Mobile: always show text in overlay */}
          {isMobile && (
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                sx: {
                  ml: 1,
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: alpha('#fff', 0.9)
                }
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
    ));

  // Sidebar dimensions
  const sidebarWidth = {
    open: 240,
    closed: 72
  };

  return (
    <Grid container sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.default }}>
       {/* DESKTOP / LARGE TABLET: Collapsible Side Menu */}
       {!isMobile && (
         <Grid item xs={12} md={3} sx={{ p: 0 }}>
           <Box
             sx={{
               width: menuOpen ? sidebarWidth.open : sidebarWidth.closed,
               background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
               color: "white",
               height: "100vh",
               padding: 2,
               boxSizing: "border-box",
               overflow: "hidden",
               position: "fixed",
               transition: 'width 0.3s ease',
               boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
               zIndex: 10
             }}
          >
            {/* Top bar with title & arrow */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: menuOpen ? "space-between" : "center",
                mb: 2
              }}
            >
              {menuOpen && (
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: alpha('#fff', 0.95),
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {title}
                </Typography>
              )}
              <IconButton
                onClick={() => setMenuOpen(!menuOpen)}
                sx={{
                  color: "white",
                  bgcolor: alpha('#fff', 0.1),
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.2),
                  }
                }}
              >
                <ArrowBackIcon
                  sx={{
                    transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s"
                  }}
                />
              </IconButton>
            </Box>
            <Divider sx={{ bgcolor: alpha('#fff', 0.2), mb: 3 }} />
            <List sx={{ px: 0 }}>{renderMenuList()}</List>
          </Box>
        </Grid>
      )}

      {/* MOBILE: Hamburger icon in top-right corner */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 3000
          }}
        >
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: "white",
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0,0,0,0.2)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* MOBILE OVERLAY MENU */}
      {isMobile && mobileMenuOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            zIndex: 4000,
            display: "flex",
            color: "white",
            flexDirection: "column",
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            boxShadow: '0 0 30px rgba(0,0,0,0.2)'
          }}
        >
            {/* Sticky header */}
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 4500,
                p: 2
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: alpha('#fff', 0.95),
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {title}
                </Typography>
                <IconButton
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{
                    color: "white",
                    bgcolor: alpha('#fff', 0.1),
                    '&:hover': {
                      bgcolor: alpha('#fff', 0.2),
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ bgcolor: alpha('#fff', 0.2), mt: 2 }} />
            </Box>
            {/* Scrollable menu list */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2
              }}
            >
              <List>{renderMenuList()}</List>
            </Box>
        </Box>
      )}

      {/* Main content */}
      <Grid
        item
        xs={12}
        md={isMobile ? 12 : 9}
        sx={{
          p: { xs: 2, md: 4 },
          mt: isMobile ? 6 : 0,
          ml: !isMobile ? `${menuOpen ? sidebarWidth.open : sidebarWidth.closed}px` : 0,
          transition: 'margin-left 0.3s ease',
          width: !isMobile ? `calc(100% - ${menuOpen ? sidebarWidth.open : sidebarWidth.closed}px)` : '100%',
        }}
      >
        <Box
          sx={{
            opacity: fadeIn ? 1 : 0,
            transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease'
          }}
        >
          {children}
        </Box>
      </Grid>
    </Grid>
  );
};

export default SidebarWrapper;
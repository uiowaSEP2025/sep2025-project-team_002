import React, { useState } from "react";
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
  useMediaQuery
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const SidebarWrapper = ({ title = "My Account", menuItems = [], children }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [menuOpen, setMenuOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Render menu items
  const renderMenuList = () =>
    menuItems.map((item, index) => (
      <ListItem key={index} disablePadding>
        <ListItemButton
          onClick={() => {
            item.action();
            // If on mobile, close the overlay after navigating
            if (isMobile) setMobileMenuOpen(false);
          }}
          sx={{ borderRadius: "20px", mb: 1, pl: 2 }}
        >
          {item.icon}
          {/* Desktop: only show text if side menu is expanded */}
          {!isMobile && menuOpen && (
            <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
          )}
          {/* Mobile: always show text in overlay */}
          {isMobile && (
            <ListItemText primary={item.text} sx={{ ml: 2, fontSize: "1.2rem" }} />
          )}
        </ListItemButton>
      </ListItem>
    ));

  // Collapsible side menu (desktop)
  const menuVariants = {
    open: { width: 240, transition: { duration: 0.3 } },
    closed: { width: 72, transition: { duration: 0.3 } }
  };

  // Mobile overlay slide-in/out
  const overlayVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
    exit: { x: "-100%" }
  };

  return (
    <Grid container sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
       {/* DESKTOP / LARGE TABLET: Collapsible Side Menu */}
       {!isMobile && (
         <Grid item xs={12} md={3} sx={{ p: 0 }}>
           <motion.div
             variants={menuVariants}
             animate={menuOpen ? "open" : "closed"}
             initial="open"
             style={{
               backgroundColor: "#1a1a1a",
               color: "white",
               height: "100vh",
               padding: 16,
               boxSizing: "border-box",
               overflow: "hidden"
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
                <Typography variant="h6" sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                  My Account
                </Typography>
              )}
              <IconButton onClick={() => setMenuOpen(!menuOpen)} sx={{ color: "white" }}>
                <ArrowBackIcon
                  sx={{
                    transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s"
                  }}
                />
              </IconButton>
            </Box>
            <Divider sx={{ bgcolor: "grey.600", mb: 2 }} />
            <List>{renderMenuList()}</List>
          </motion.div>
        </Grid>
      )}

      {/* MOBILE: Hamburger icon in top-left corner */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 3000
          }}
        >
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            sx={{
              bgcolor: "#1a1a1a",
              color: "white",
              "&:hover": { backgroundColor: "#333" }
            }}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>
      )}

      {/* MOBILE OVERLAY MENU */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "#1a1a1a",
              zIndex: 4000,
              display: "flex",
              color: "white",
              flexDirection: "column"
            }}
          >
            {/* Sticky header */}
            <Box
              sx={{
                position: "sticky",
                top: 0,
                backgroundColor: "#1a1a1a",
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
                  sx={{ fontSize: "1.5rem", fontWeight: 600, color: "#fff" }}
                >
                  My Account
                </Typography>
                <IconButton
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{ color: "white" }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Divider sx={{ bgcolor: "grey.600", mt: 2 }} />
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <Grid item xs={12} md={isMobile ? 12 : 9} sx={{ p: 4, mt: isMobile ? 6 : 0 }}>
          {children}
      </Grid>
    </Grid>
  );
};

export default SidebarWrapper;
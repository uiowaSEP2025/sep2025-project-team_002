import { useEffect, useState } from "react";
import React from 'react';
import { UserProvider } from "./context/UserContext.jsx";
import Signup from './account/Signup.jsx';
import Home from './home/Home.jsx';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Login from './account/Login.jsx';
import SecureHome from "./home/SecureHome.jsx";
import RequireAuth from "./RequireAuth.jsx";
import API_BASE_URL from "./utils/config.js";
import Account from "./account/Account.jsx";
import AccountSettings from "./account/AccountSettings.jsx";
import MyReviews from "./account/MyReviews.jsx"
import ForgotPassword from './account/ForgotPassword.jsx';
import ResetPassword from './account/ResetPassword.jsx';
import ReviewForm from './review/ReviewForm.jsx';
import PreferenceForm from './review/PreferenceForm.jsx';
import VerifySchoolEmail from './account/VerifySchoolEmail.jsx'
import Footer from './components/Footer.jsx';
import AboutUs from './components/AboutUs.jsx'
import SchoolPage from "./schools/SchoolPage";
import UserPreferences from "./account/UserPreferences.jsx"
import Navbar from './components/Navbar.jsx';
import AnimatedBackground from './components/AnimatedBackground.jsx';
import { Box } from '@mui/material';

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    console.log("App API Fetch Debugging... API_BASE_URL:", API_BASE_URL);
    fetch(`${API_BASE_URL}/users/test/`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Backend Response:", data);
        setMessage(data.message);
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        setMessage("Error: " + error.message);
      });
  }, []);

  return (
      <UserProvider>
        <Box className="App" sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100vw'
        }}>
          <Router>
            <AppContent />
          </Router>
        </Box>
      </UserProvider>
  );
}

// Separate component to use useLocation hook inside Router
function AppContent() {
  const location = useLocation();

  // Determine which background variant to use based on the route
  const getBackgroundVariant = () => {
    if (location.pathname === '/' || location.pathname === '/secure-home') {
      return 'default';
    } else if (location.pathname.includes('/school/')) {
      return 'sports';
    } else if (location.pathname.includes('/login') || location.pathname.includes('/signup')) {
      return 'minimal';
    } else {
      return 'bubbles';
    }
  };

  // Skip navbar on login and signup pages
  const showNavbar = !location.pathname.includes('/login') && !location.pathname.includes('/signup');

  return (
    <>
      <AnimatedBackground variant={getBackgroundVariant()} />
      {showNavbar && <Navbar />}

      <Box component="main" sx={{
          flexGrow: 1,
          pt: showNavbar ? 2 : 0,
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100vw'
        }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Public Home Page */}
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/settings" element={<AccountSettings />} />
          <Route path="/user-preferences" element={<UserPreferences />} />
          <Route path="/account/my-reviews" element={<MyReviews />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-school-email" element={<VerifySchoolEmail />} />

          {/* Secure Home Page (Only Accessible When Logged In) */}
          <Route
            path="/secure-home"
            element={
              <RequireAuth>
                <SecureHome />
              </RequireAuth>
            }
          />
          <Route
            path="/review-form"
            element={
              <RequireAuth>
                <ReviewForm />
              </RequireAuth>
            }
          />
          <Route
            path="/preference-form"
            element={
              <RequireAuth>
                <PreferenceForm />
              </RequireAuth>
            }
          />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/school/:id" element={<SchoolPage />} />
          <Route path="/reviews/new" element={<ReviewForm />} />
        </Routes>
      </Box>

      <Footer />
    </>
  );


}

export default App;

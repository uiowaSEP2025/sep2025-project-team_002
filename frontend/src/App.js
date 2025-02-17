import { useEffect, useState } from "react";
import React from 'react';
import Signup from './account/Signup';
import Home from './home/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './account/Login';
import SecureHome from "./home/SecureHome";
import RequireAuth from "./RequireAuth";
import API_BASE_URL from "./utils/config";
import Account from "./account/Account";
import AccountSettings from "./account/AccountSettings";
import ForgotPassword from './account/ForgotPassword';
import ResetPassword from './account/ResetPassword';
import ReviewForm from "./review/ReviewForm";


function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    console.log("API_BASE_URL:", API_BASE_URL);
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
    <div className="App">
      <header className="App-header">

        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Public Home Page */}
            <Route path="/" element={<Home />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/settings" element={<AccountSettings />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />


            {/* Secure Home Page (Only Accessible When Logged In) */}
            <Route
              path="/secure-home"
              element={
                <RequireAuth>
                  <SecureHome />
                </RequireAuth>
              }
            />
            <Route path="/review-form" element={<ReviewForm />} />
          </Routes>
        </Router>

      </header>
    </div>
  );

}

export default App;

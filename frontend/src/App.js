import { useEffect, useState } from "react";
import React from 'react';
import Signup from './Signup';
import Home from './Home';
import {createTheme, ThemeProvider} from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import SecureHome from "./SecureHome";
import RequireAuth from "./RequireAuth";

// const theme = createTheme({
//   palette: {
//     primary: { main: '#1976d2' },   // blue tone
//     secondary: { main: '#dc004e' }, // pink/red tone
//   },
// });

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("https://theathleticinsider.com/users/test/")
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

{/* //           <ThemeProvider theme={theme}>
//             <CssBaseline /> */}
                {/* <Signup /> */}
{/* //           </ThemeProvider> */}
{/* 
        <h1>Backend Response:</h1>
        <p>{message}</p> */}

        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Public Home Page */}
            <Route path="/" element={<Home />} />

            {/* Secure Home Page (Only Accessible When Logged In) */}
            <Route
              path="/secure-home"
              element={
                <RequireAuth>
                  <SecureHome />
                </RequireAuth>
              }
            />
          </Routes>
        </Router>

      </header>
    </div>
  );

}

export default App;

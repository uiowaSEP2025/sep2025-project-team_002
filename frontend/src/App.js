import { useEffect, useState } from "react";
import React from 'react';
import Signup from './Signup';
import {createTheme, ThemeProvider} from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },   // blue tone
    secondary: { main: '#dc004e' }, // pink/red tone
  },
});

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://localhost:8000/users/test/")
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
          <ThemeProvider theme={theme}>
            <CssBaseline />
                <Signup />
          </ThemeProvider>
      </header>
    </div>
  );

}

export default App;

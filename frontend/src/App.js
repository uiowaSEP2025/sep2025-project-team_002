import { useEffect, useState } from "react";
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login'; // Import the Login component
// import Signup from './Signup'; // If you need Signup route as well, import it here

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
        <h1>Backend Response:</h1>
        <p>{message}</p>

        <Router>
          <Routes>
            {/* Define route for login */}
            <Route path="/login" element={<Login />} />
            {/* Define route for signup */}
            {/* <Route path="/signup" element={<Signup />} /> */}
            {/* Example route for Home page */}
          </Routes>
        </Router>
      </header>
    </div>
  );
}

export default App;

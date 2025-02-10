import React from "react";
import { Link } from "react-router-dom"


function Home() {

  return (
    <div>
        {/* Navbar */}
        <nav style = {styles.navbar}>
            <h2 style = {styles.logo}>Athletic Insider </h2>
            <div>
                <Link to = "/signup" style = {styles.navLink}> Sign Up</Link>
                <Link to = "/login" style = {styles.navLink}> Login </Link>
            </div>
        </nav>
        {/* Main Content */}
        <div style = {styles.container}>
            <h1> Welcome to Athletic Insider! </h1>
        </div>
    </div>
  );
}

const styles = {
    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#333",
        padding: "1rem",
        color: "#fff",
    },
    logo: {
        margin: "0",
    },
    navLink: {
        color: "#fff",
        textDecoration: "none",
        margin: "0 10px",
    },
    container: {
        textAlign: "center",
        marginTop: "50px",
    },
};

export default Home;
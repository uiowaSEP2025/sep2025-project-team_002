import { createContext, useContext, useState, useEffect } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Import the icon


// Ensure the correct path to assets
const defaultProfilePic = null;

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Load the profile picture from localStorage or set a default picture
  const [profilePic, setProfilePic] = useState(() => {
    return localStorage.getItem("profilePic") || defaultProfilePic;
  });

  // Save the profile picture to localStorage whenever it changes
  useEffect(() => {
    if (profilePic) {
      localStorage.setItem("pic1", profilePic);
    }
  }, [profilePic]);

  // Function to update profile picture
  const updateProfilePic = (newPic) => {
    const fullPath = `/assets/profile-pictures/${newPic}`;
    setProfilePic(fullPath);
    localStorage.setItem("profilePic", fullPath); // Ensure it persists
  };

  return (
    <UserContext.Provider value={{ profilePic, updateProfilePic }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook to use the user context
export const useUser = () => {
  return useContext(UserContext);
};

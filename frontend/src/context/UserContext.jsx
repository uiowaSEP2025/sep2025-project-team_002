import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Load the profile picture from localStorage (if it exists)
  const [profilePic, setProfilePic] = useState(() => {
    return localStorage.getItem("profilePic") || ""; // Default empty string or initial pic
  });

  // Save the profile picture to localStorage whenever it changes
  useEffect(() => {
    if (profilePic) {
      localStorage.setItem("profilePic", profilePic);
    }
  }, [profilePic]);

  // Function to update profile picture
  const updateProfilePic = (newPic) => {
    setProfilePic(newPic);
  };

  return (
    <UserContext.Provider value={{ profilePic, updateProfilePic }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

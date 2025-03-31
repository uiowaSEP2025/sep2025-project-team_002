import { createContext, useState, useEffect, useContext } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Function to fetch the user data from the backend
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8000/users/user/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsLoggedIn(true);
      }
      else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };



  // Function to update user profile picture in state and backend
  const updateProfilePic = async (newPic) => {
    console.log("Profile picture update triggered:", newPic); // Debug log
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/users/update-profile-picture/", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile_picture: newPic }),
      });

      if (response.ok) {
        await fetchUser();
        // setUser((prevUser) => ({ ...prevUser, profile_picture: newPic }));
        // fetchUser();
      }
    } catch (error) {
      console.error("Failed to update profile picture:", error);
    }
  };

  // Ensure profile picture is correctly formatted
  const profilePic = user?.profile_picture
    ? `/assets/profile-pictures/${user.profile_picture}`
    : "/assets/profile-pictures/pic1.jpg"; // Default image

  useEffect(() => {
    fetchUser()
  }, [isLoggedIn]);

  return (
    <UserContext.Provider value={{ user, setUser, updateProfilePic, profilePic, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Export the custom hook
export const useUser = () => {
  return useContext(UserContext);
};

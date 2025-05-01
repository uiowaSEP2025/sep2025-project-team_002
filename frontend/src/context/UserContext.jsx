import { createContext, useState, useEffect, useContext } from "react";
import API_BASE_URL from "../utils/config";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Initialize isLoggedIn based on token presence
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Function to fetch the user data from the backend
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      setUser(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/user/`, {
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
        // If we get a 401 Unauthorized, the token is invalid or expired
        if (response.status === 401) {
          // Don't call logout() directly to avoid infinite loops
          // Just clear the token and state
          localStorage.removeItem("token");
          setUser(null);
          setIsLoggedIn(false);
          // Don't navigate here - let the RequireAuth component handle navigation
        } else {
          setIsLoggedIn(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };
  // Function to handle logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsLoggedIn(false);
    // Force a page reload to ensure all components update correctly
    window.location.href = '/';
  };

  // Function to update user profile picture in state and backend
  const updateProfilePic = async (newPic) => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/users/update-profile-picture/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile_picture: newPic }),
      });

      if (response.ok) {
        await fetchUser();
      }
    } catch (error) {
      console.error("Failed to update profile picture:", error);
    }
  };

  // Ensure profile picture is correctly formatted
  const profilePic = user?.profile_picture
    ? `/assets/profile-pictures/${user.profile_picture}`
    : "/assets/profile-pictures/pic1.png"; // Default image

  useEffect(() => {
    // Fetch user data on mount if token exists
    if (localStorage.getItem("token")) {
      fetchUser();
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, updateProfilePic, profilePic, fetchUser, isLoggedIn, loading, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Export the custom hook
export const useUser = () => {
  return useContext(UserContext);
};

import { createContext, useState, useEffect, useContext } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8000/users/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUser();
  }, []);

  // Function to update user profile picture in state and backend
  const updateProfilePic = async (newPic) => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/users/update-profile-picture/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile_picture: newPic }),
      });

      if (response.ok) {
        setUser((prevUser) => ({ ...prevUser, profile_picture: newPic }));
      }
    } catch (error) {
      console.error("Failed to update profile picture:", error);
    }
  };

  // Ensure profile picture is correctly formatted
  const profilePic = user?.profile_picture
    ? `/assets/profile-pictures/${user.profile_picture}`
    : "/assets/profile-pictures/pic1.jpg"; // Default image

  return (
    <UserContext.Provider value={{ user, setUser, updateProfilePic, profilePic }}>
      {children}
    </UserContext.Provider>
  );
};

// Export the custom hook
export const useUser = () => {
  return useContext(UserContext);
};

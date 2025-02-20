const API_BASE_URL =
  import.meta.env.MODE === "test"
    ? "http://backend:8000"
    : import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default API_BASE_URL;
const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:8000"
  : "http://52.15.224.36:8000";

export default API_BASE_URL;
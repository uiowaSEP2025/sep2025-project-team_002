/* global navigator */

const isSelenium = navigator.webdriver === true;

const API_BASE_URL =
  isSelenium || import.meta.env.MODE === "test"
    ? "http://backend:8000"
    : import.meta.env.VITE_API_BASE_URL;

document.body.setAttribute("data-api-url", API_BASE_URL);

console.log("API Config Debugging... API_BASE_URL:", API_BASE_URL);
console.log("API Config Debugging... VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

export default API_BASE_URL;
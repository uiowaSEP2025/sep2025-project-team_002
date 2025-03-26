import { Builder, By, until } from "selenium-webdriver";
import { expect } from "chai"; // Using Chai for assertions
import { describe, it, before, after } from "mocha";

describe("Selenium Signup & Login Test", function () {
  let driver;
  const testEmail = `testuser${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";

  // Set timeout to prevent tests from failing due to long execution time
  this.timeout(30000); // 30 seconds timeout

  // Initialize WebDriver before running tests
  before(async function () {
    driver = await new Builder()
      .forBrowser("chrome")
      .usingServer("http://selenium:4444/wd/hub") // Connect to Selenium running in Docker
      .build();
  });

  // Quit WebDriver after all tests have completed
  after(async function () {
    await driver.quit();
  });

  it("should successfully sign up and log in", async function () {
    try {
      // Navigate to the Signup page
      await driver.get("http://frontend:3000/signup");

      // Retrieve API URL for debugging
      const apiUrl = await driver.findElement(By.css("body")).getAttribute("data-api-url");
      console.log("Selenium Debugging: API URL =", apiUrl);

      // Locate form elements
      let firstNameInput = await driver.findElement(By.id("signup-first-name"));
      let lastNameInput = await driver.findElement(By.id("signup-last-name"));
      let emailInput = await driver.findElement(By.id("signup-email"));
      let passwordInput = await driver.findElement(By.id("signup-password"));
      let confirmPasswordInput = await driver.findElement(By.id("signup-confirm-password"));
      let signupButton = await driver.findElement(By.id("signup-button"));
      let highSchoolRadio = await driver.findElement(By.id("signup-high_school"));
      let transferRadio = await driver.findElement(By.id("signup-transfer"));
      let graduateRadio = await driver.findElement(By.id("signup-graduate"));

      let transferOptions = [highSchoolRadio, transferRadio, graduateRadio];
      let randomIndex = Math.floor(Math.random() * transferOptions.length);

      // Fill in the registration form
      await firstNameInput.sendKeys("Test");
      await lastNameInput.sendKeys("User");
      await emailInput.sendKeys(testEmail);
      await passwordInput.sendKeys(testPassword);
      await confirmPasswordInput.sendKeys(testPassword);
      await transferOptions[randomIndex].click();
      await signupButton.click();

      // let pageSource = await driver.getPageSource();
      // console.log(pageSource);

      // Wait for redirection to the login page
      await driver.wait(until.urlContains("/login"), 10000);

      // Navigate to the Login page
      await driver.get("http://frontend:3000/login");

      // Locate login form elements
      let loginEmailInput = await driver.findElement(By.id("email"));
      let loginPasswordInput = await driver.findElement(By.id("password"));
      let loginButton = await driver.findElement(By.id("login-button"));

      // Fill in the login form
      await loginEmailInput.sendKeys(testEmail);
      await loginPasswordInput.sendKeys(testPassword);
      await loginButton.click();

      // Wait for redirection to the secure home page
      await driver.wait(until.urlContains("/secure-home"), 5000);

      // Verify that the user is on the secure home page
      let pageText = await driver.findElement(By.tagName("body")).getText();
      expect(pageText).to.include("Schools and Sports"); // Assert that the page contains the expected text

      console.log("Test passed: User successfully signed up, logged in, and accessed secure home.");
    } catch (error) {
      console.error("Test failed:", error);
      throw error; // Ensure Mocha detects test failure
    }
  });
});
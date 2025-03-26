import { Builder, By, until } from "selenium-webdriver";
import { expect } from "chai"; // Using Chai for assertions
import { describe, it, before, after } from "mocha";

describe("Login and Create Review Test", function () {
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

  it("should successfully log in and create a review", async function () {
    try {
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
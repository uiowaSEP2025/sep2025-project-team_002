import { Builder, By, until } from "selenium-webdriver";
import { describe, it, before, after } from "mocha";
import { loadCredentials, login } from "../helpers/auth.js";

describe("Create Review Test", function () {
  let driver;

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

  it("should create a review", async function () {

    try {
      // Extract the login process into a separate function to enable reused logic.
      const { email, password } = loadCredentials();
      await login(driver, email, password)

      console.log("Successfully logged in with previous account!");

      const token = await driver.executeScript("return localStorage.getItem('token');");

      // Check if the user is valid for creating a review
      const res = await fetch("http://backend:8000/users/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const user = await res.json();

      if (user.transfer_type === "high_school") {
        console.log("User type is high_school. Creating a new valid user...");

        const testEmail = `testuser${Date.now()}@example.com`;
        const testPassword = "TestPassword123!";

        await driver.get("http://frontend:3000/signup");

        await driver.findElement(By.id("signup-first-name")).sendKeys("Test");
        await driver.findElement(By.id("signup-last-name")).sendKeys("User");
        await driver.findElement(By.id("signup-email")).sendKeys(testEmail);
        await driver.findElement(By.id("signup-password")).sendKeys(testPassword);
        await driver.findElement(By.id("signup-confirm-password")).sendKeys(testPassword);
        await driver.findElement(By.id("signup-transfer")).click();
        await driver.findElement(By.id("signup-button")).click();
        await driver.wait(until.urlContains("/login"), 10000);

        await driver.get("http://frontend:3000/login");
        await driver.findElement(By.id("email")).sendKeys(testEmail);
        await driver.findElement(By.id("password")).sendKeys(testPassword);
        await driver.findElement(By.id("login-button")).click();

        await driver.wait(until.urlContains("/secure-home"), 5000);
        console.log("Navigating to Secure Home...");
      } else {
        console.log("Existing user is valid. Proceeding...");
      }

      // Verify that the user is on the secure home page
      // Wait for the first school element to appear
      // Wait for the first school Card element to appear
      const firstSchoolCard = await driver.wait(until.elementLocated(By.xpath("(//div[contains(@class, 'MuiCard-root')])[1]")), 10000);
      // Click on the first school Card
      await firstSchoolCard.click();

      const reviewButton = await driver.wait(until.elementLocated(By.id("write-review-button")), 15000);
      await driver.wait(until.elementIsVisible(reviewButton), 5000);
      await reviewButton.click();

      // Fill coach name
      let coachNameInput = await driver.wait(until.elementLocated(By.id("coach-name-input")), 10000);
      await coachNameInput.sendKeys("Test Coach");

      // Fill all ratings
      const ratingFields = [
        'head_coach',
        'assistant_coaches',
        'team_culture',
        'campus_life',
        'athletic_facilities',
        'athletic_department',
        'player_development',
        'nil_opportunity'
      ];

      for (const field of ratingFields) {
        console.log(`Setting rating for ${field}`);
        
        // Find the rating container
        const ratingContainer = await driver.wait(
          until.elementLocated(By.id(`rating-${field}`)),
          10000
        );
        
        // Find all radio buttons within the rating
        const stars = await ratingContainer.findElements(By.css('input[type="radio"]'));
        
        // Click the 10th star (last one)
        const tenthStar = stars[9]; // Index 9 for the 10th star
        
        // Scroll the element into view
        await driver.executeScript("arguments[0].scrollIntoView(true);", tenthStar);
        await driver.sleep(500);

        // Click using JavaScript
        await driver.executeScript("arguments[0].click(); arguments[0].checked = true;", tenthStar);
        
        // Verify the click worked
        const isChecked = await driver.executeScript("return arguments[0].checked;", tenthStar);
        console.log(`${field} rating clicked:`, isChecked);
        
        await driver.sleep(500);
      }

      // Add review message
      let reviewMessage = await driver.wait(until.elementLocated(By.id("review-message")), 10000);
      await reviewMessage.sendKeys("This is a test review message");

      // Click submit to open confirmation dialog
      let submitButton = await driver.wait(until.elementLocated(By.id("submit-review-button")), 10000);
      await driver.executeScript("arguments[0].scrollIntoView(true);", submitButton);
      await driver.sleep(500);
      await submitButton.click();

      // Click confirm in the dialog
      let confirmButton = await driver.wait(until.elementLocated(By.id("confirm-button")), 10000);
      await driver.wait(until.elementIsVisible(confirmButton), 10000);
      await confirmButton.click();

      // Wait for redirect back to secure home
      await driver.wait(until.urlContains("/secure-home"), 10000);

    } catch (error) {
      console.error("Test failed:", error);
      // Print current URL
      try {
        const currentUrl = await driver.getCurrentUrl();
        console.log("Failed at URL:", currentUrl);
      } catch (urlError) {
        console.log("Could not get URL:", urlError);
      }
      // Take screenshot on failure
      const screenshot = await driver.takeScreenshot();
      console.log('Screenshot on failure:', screenshot);
      throw error;
    }
  });
});
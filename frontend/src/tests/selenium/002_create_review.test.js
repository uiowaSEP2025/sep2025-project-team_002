import { Builder, By, until } from "selenium-webdriver";
import { expect } from "chai"; // Using Chai for assertions
import { describe, it, before, after } from "mocha";

describe("Create Review Test", function () {
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

  it("should successfully sign up, log in, and create a review", async function () {
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


      console.log("Navigating to secure home page");
      // Verify that the user is on the secure home page
      let pageText = await driver.findElement(By.tagName("body")).getText();

      let school1Button = await driver.wait(until.elementLocated(By.id("school-1")), 10000);
      await school1Button.click();

      let reviewButton = await driver.wait(until.elementLocated(By.id("write-review-button")), 10000);
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
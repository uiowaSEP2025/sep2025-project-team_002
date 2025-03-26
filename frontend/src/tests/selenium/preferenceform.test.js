import { Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { describe, it, before, after } from "mocha";

describe("PreferenceForm Selenium Test", function () {
  let driver;
  const testEmail = `testuser${Date.now()}@example.com`; // Unique email for each test run
  const testPassword = "TestPassword123!";
  const baseUrl = "http://frontend:3000";

  // Increase timeout to 90 seconds for account creation
  this.timeout(90000);

  before(async function () {
    try {
      // Initialize driver
      driver = await new Builder()
        .forBrowser("chrome")
        .usingServer("http://selenium:4444/wd/hub")
        .build();

      // Create test account
      await driver.get(`${baseUrl}/signup`);

      // Debug API URL
      const apiUrl = await driver.findElement(By.css("body")).getAttribute("data-api-url");
      console.log("API Base URL:", apiUrl);

      // Fill signup form
      await driver.findElement(By.id("signup-first-name")).sendKeys("Test");
      await driver.findElement(By.id("signup-last-name")).sendKeys("User");
      await driver.findElement(By.id("signup-email")).sendKeys(testEmail);
      await driver.findElement(By.id("signup-password")).sendKeys(testPassword);
      await driver.findElement(By.id("signup-confirm-password")).sendKeys(testPassword);

      // Randomly select user type
      const userTypes = [
        await driver.findElement(By.id("signup-high_school")),
        await driver.findElement(By.id("signup-transfer")),
        await driver.findElement(By.id("signup-graduate"))
      ];
      await userTypes[1].click();

      // Submit form
      await driver.findElement(By.id("signup-button")).click();

      // Wait for success (either login page or direct to secure home)
      await Promise.race([
        driver.wait(until.urlContains("/login"), 15000),
        driver.wait(until.urlContains("/secure-home"), 15000)
      ]);

      console.log(`Test account created: ${testEmail}`);
    } catch (error) {
      console.error("Account creation failed:", error);
      throw error;
    }
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  async function login() {
    await driver.get(`${baseUrl}/login`);
    await driver.findElement(By.id("email")).sendKeys(testEmail);
    await driver.findElement(By.id("password")).sendKeys(testPassword);
    await driver.findElement(By.id("login-button")).click();
    await driver.wait(until.urlContains("/secure-home"), 15000);
  }

  it("should submit preferences successfully", async function () {
    try {
      // Login with the created account
      await login();

      // Rest of your preference form test...
      await driver.get(`${baseUrl}/preference-form`);
      // ... (continue with your preference form test logic)

    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });

});



import { Builder, By, until } from "selenium-webdriver";
import { describe, it, before, after } from "mocha";
import {login, loadCredentials} from "../helpers/auth.js";

describe("PreferenceForm Selenium Test", function () {
  let driver;

  // Increase timeout to 90 seconds for account creation
  this.timeout(90000);

  before(async function () {
    // Initialize driver
    driver = await new Builder()
      .forBrowser("chrome")
      .usingServer("http://selenium:4444/wd/hub")
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("should submit preferences successfully", async function () {
    try {
      // Login with the created account
      const { email, password } = loadCredentials();
      await login(driver, email, password)
      console.log("Successfully logged in with previous account! Now navigating to secure home page...");

      // Rest of your preference form test...
      await driver.get("frontend:3000/preference-form");
      // ... (continue with your preference form test logic)

    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });

});



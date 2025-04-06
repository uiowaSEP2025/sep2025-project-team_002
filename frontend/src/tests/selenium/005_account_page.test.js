import { Builder, By, until } from "selenium-webdriver";
import { expect } from "chai";
import { describe, it, before, after } from "mocha";
import fs from "fs";
import path from "path";

describe("Selenium Account Page & Settings Test", function () {
  let driver;
  let testCredentials;

  // Increase timeout for slower environments (30 seconds)
  this.timeout(30000);

  before(async function () {
    // 1) Initialize Selenium WebDriver
    driver = await new Builder()
      .forBrowser("chrome")
      .usingServer("http://selenium:4444/wd/hub") // Connect to Selenium in Docker
      .build();

    // 2) Read user credentials from test-user.json (which was created by your signup test)
    const credsPath = path.join(process.cwd(), "test-user.json");
    try {
      const rawData = fs.readFileSync(credsPath, "utf-8");
      testCredentials = JSON.parse(rawData);
      console.log("Using test credentials:", testCredentials);
    } catch (err) {
      console.error("Could not read test-user.json. Make sure signup test ran first!");
      throw err;
    }
  });

  after(async function () {
    // Quit WebDriver after all tests are done
    await driver.quit();
  });

  it("should log into an existing account and display Account Info", async function () {
    try {
      // Navigate to the Login page
      await driver.get("http://frontend:3000/login");

      // Fill in login form
      const loginEmailInput = await driver.findElement(By.id("email"));
      const loginPasswordInput = await driver.findElement(By.id("password"));
      const loginButton = await driver.findElement(By.id("login-button"));

      await loginEmailInput.sendKeys(testCredentials.email);
      await loginPasswordInput.sendKeys(testCredentials.password);
      await loginButton.click();

      // Wait until we're redirected to /secure-home
      await driver.wait(until.urlContains("/secure-home"), 10000);

      // Then navigate to /account
      await driver.get("http://frontend:3000/account");

      // Wait for the Account Info page to fully load (check the main title's ID or text)
      await driver.wait(
        until.elementLocated(By.id("account-info-title")),
        10000
      );

      // Locate the first name and email fields by ID
      const firstNameField = await driver.findElement(By.id("account-first-name"));
      const emailField = await driver.findElement(By.id("account-email"));

      const firstNameValue = await firstNameField.getAttribute("value");
      const emailValue = await emailField.getAttribute("value");

      // Basic assertions
      expect(firstNameValue).to.not.be.empty;
      expect(emailValue).to.equal(testCredentials.email);

      // Now click the "Edit / Change Info" button
      const editChangeInfoBtn = await driver.findElement(By.id("edit-change-info-button"));
      await editChangeInfoBtn.click();

      // Wait until the URL changes to /account/settings
      await driver.wait(until.urlContains("/account/settings"), 5000);

      console.log("Successfully navigated to the Account Settings page!");
    } catch (error) {
      console.error("Test for Account Info page failed:", error);
      throw error;
    }
  });

  it("should update user info in Account Settings", async function () {
    try {
      // The user is already logged in from the previous test
      // Ensure we are on the account settings page:
      await driver.get("http://frontend:3000/account/settings");
      await driver.wait(until.urlContains("/account/settings"), 5000);

      // Grab the "First Name" field by ID and update it
      const firstNameInput = await driver.findElement(By.id("settings-first-name"));
      await firstNameInput.clear();
      await firstNameInput.sendKeys("UpdatedFirstName");

      // Grab the "Last Name" field by ID and update it
      const lastNameInput = await driver.findElement(By.id("settings-last-name"));
      await lastNameInput.clear();
      await lastNameInput.sendKeys("UpdatedLastName");

      // Click Save Changes
      const saveChangesButton = await driver.findElement(By.id("save-changes-button"));
      await saveChangesButton.click();

      // Wait for success message
      await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'Account info updated successfully')]")),
        5000
      );

      console.log("Successfully updated account info in Account Settings!");
    } catch (error) {
      console.error("Test for Account Settings failed:", error);
      throw error;
    }
  });

  it("should open and cancel the Change Password dialog", async function () {
    try {
      // Navigate again to /account/settings
      await driver.get("http://frontend:3000/account/settings");
      await driver.wait(until.urlContains("/account/settings"), 5000);

      // Locate and click "Change Password"
      const changePassButton = await driver.findElement(By.id("change-password-button"));
      await changePassButton.click();

      // Wait for the dialog to show up
      await driver.wait(
        until.elementLocated(By.id("change-password-dialog")),
        5000
      );

      // Then cancel
      const cancelButton = await driver.findElement(By.id("cancel-change-password-button"));
      await cancelButton.click();

      // Optionally wait a second to confirm it closed
      await driver.sleep(1000);

      console.log("Change Password dialog opened and was canceled successfully.");
    } catch (error) {
      console.error("Change Password dialog test failed:", error);
      throw error;
    }
  });

});

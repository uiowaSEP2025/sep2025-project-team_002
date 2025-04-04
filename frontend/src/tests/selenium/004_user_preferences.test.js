import { Builder, By, until } from "selenium-webdriver";
import { describe, it, before, after } from "mocha";
import { loadCredentials, login } from "../helpers/auth.js";


describe("User Preferences Page Test", function () {
  let driver;

  this.timeout(90000);

 before(async function () {
  driver = await new Builder()
      .forBrowser("chrome")
      .usingServer("http://selenium:4444/wd/hub")
      .build();
});

  after(async function () {
    await driver.quit();
  });

  it("should display dialog when form hasn't been completed", async function () {
  try {
    const { email, password } = loadCredentials();
    await login(driver, email, password);
    console.log("Successfully logged in with previous account!");

    // Wait for home page to load
    await driver.wait(until.elementLocated(By.id("secure-home")), 10000);

    // Click through UI to reach User Preferences page
    let accountIcon = await driver.wait(until.elementLocated(By.id("account-icon")), 10000);
    await accountIcon.click();
    console.log("Clicked account icon")

    let accountButton = await driver.wait(until.elementLocated(By.id("account-info")), 5000);
    await accountButton.click();
    console.log("Clicked account info button")

    const prefsButton = await driver.wait(
      until.elementLocated(
        By.xpath('//*[contains(text(), "Completed Preference Form")]')
      ),
      15000
    );
    await prefsButton.click();
    console.log("Clicked Completed Preference Form button")

    await driver.wait(until.urlContains('/user-preferences'), 15000);
    console.log("On user preferences page")

    // Wait for preferences page to load
    await driver.wait(until.elementLocated(By.id("no-preferences-dialog")), 15000);

    let fillPrefFormButton = await driver.wait(until.elementLocated(By.id("fillout-pref-btn")), 5000);
    await fillPrefFormButton.click();

    console.log("Test passed! User preferences no filled out; message to fill out form.");
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
});
});

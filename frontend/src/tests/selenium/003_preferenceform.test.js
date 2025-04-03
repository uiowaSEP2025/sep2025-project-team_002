import { Builder, By, until, Key } from "selenium-webdriver";
import { describe, it, before, after } from "mocha";
import { loadCredentials, login } from "../helpers/auth.js";

describe("Preference Form Test", function () {
  let driver;

  this.timeout(60000); // 60 seconds

  before(async function () {
    driver = await new Builder()
      .forBrowser("chrome")
      .usingServer("http://selenium:4444/wd/hub")
      .build();
  });

  after(async function () {
    await driver.quit();
  });

  it("should submit preferences successfully", async function () {
     const { email, password } = loadCredentials();
    await login(driver, email, password);
    console.log("Logged in");

    await driver.get("http://frontend:3000/preference-form");

    const header = await driver.wait(
      until.elementLocated(By.xpath("//h4[contains(text(), 'Share your Preferences')]")),
      10000
    );
    console.log("'Share your Preferences' header is present:", await header.isDisplayed());


    const sportSelect = await driver.wait(
      until.elementLocated(By.id("sport-select")),
      10000
    );
    console.log("Sport select dropdown is present:", await sportSelect.isDisplayed());

    const submitBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(), 'Submit Preferences')]")),
      10000
    );
    console.log("Submit button is present:", await submitBtn.isDisplayed());
  });
});

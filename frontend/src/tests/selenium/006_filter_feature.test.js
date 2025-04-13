import { Builder, By, until } from "selenium-webdriver";
import { describe, it, before, after } from "mocha";
import { expect } from "chai";
import { login, loadCredentials } from "../helpers/auth.js";

describe("Filter Feature Test", function () {
  // Increase timeout to prevent slow environments from failing
  this.timeout(60000);
  let driver;

  before(async function () {
    driver = await new Builder()
      .forBrowser("chrome")
      .usingServer("http://selenium:4444/wd/hub")
      .build();
  });

  after(async function () {
    await driver.quit();
  });

  /**
   * Helper: Returns the number of school cards (elements with id starting with "school-")
   */
  async function getSchoolCount() {
    const elements = await driver.findElements(By.css("div[id^='school-']"));
    return elements.length;
  }

  describe("Secure Home Filter Feature", function () {
    it("should change the list of schools after filtering in Secure Home", async function () {
      // Log in using an existing account
      const { email, password } = loadCredentials();
      await login(driver, email, password);
      console.log("Successfully logged in for secure home filter test");

      // Wait until we're on the secure home page
      await driver.wait(until.urlContains("/secure-home"), 10000);

      // Wait for schools to load and count initial number of schools
      await driver.wait(until.elementLocated(By.css("div[id^='school-']")), 10000);
      const initialCount = await getSchoolCount();
      console.log("Initial school count:", initialCount);

      // Click the Filters button
      const filtersButton = await driver.findElement(By.id("filter-button"));
      await filtersButton.click();

      // Wait for the filter dialog to open
      await driver.wait(until.elementLocated(By.css('[role="dialog"]')), 10000);

      // Find and click the Head Coach Rating dropdown
      const headCoachSelect = await driver.findElement(By.id("head_coach-rating-select"));
      await headCoachSelect.click();

      // Wait for the dropdown options to appear and select rating 8
      const ratingOption = await driver.wait(until.elementLocated(By.xpath("//li[contains(text(), '8')]")), 10000);
      await ratingOption.click();

      // Click the Apply button
      const applyButton = await driver.findElement(By.id("apply-filters-button"));
      await applyButton.click();

      // Wait for the filtered results
      await driver.wait(async () => {
        const newCount = await getSchoolCount();
        return newCount !== initialCount;
      }, 10000);

      const newCount = await getSchoolCount();
      console.log("New school count:", newCount);
      expect(newCount).to.not.equal(initialCount);
    });
  });

  describe("Home Filter Feature", function () {
    it("should change the list of schools after filtering in Home page", async function () {
      // Ensure user is signed out by clearing localStorage
      await driver.executeScript("localStorage.clear();");
      // Navigate to the home page
      await driver.get("http://frontend:3000/");

      // Wait for the home page content to load (e.g., heading text)
      await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Explore the Schools and their Sports!')]")),
        10000
      );

      // Wait for schools to load and count the initial number of schools
      await driver.wait(until.elementLocated(By.css("div[id^='school-']")), 10000);
      const initialCount = await getSchoolCount();
      console.log("Initial public school count:", initialCount);

      // Click the Filters button
      const filtersButton = await driver.findElement(
        By.xpath("//button[normalize-space()='Filters']")
      );
      await filtersButton.click();

      // Wait for the filter dialog to open
      await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(),'Apply Filters')]")),
        10000
      );

      // Find the Head Coach Rating dropdown by its id and set its value to "9"
      const headCoachSelect = await driver.findElement(By.id("head_coach-select"));
      await headCoachSelect.sendKeys("9");

      // Click the Apply button
      const applyButton = await driver.findElement(
        By.xpath("//button[normalize-space()='Apply']")
      );
      await applyButton.click();

      // Wait a bit for the page to refresh the list
      await driver.sleep(2000);

      // Check the new school count or that "No results found" is visible
      let newCount = await getSchoolCount();
      let noResults;
      try {
        noResults = await driver.findElement(By.xpath("//*[contains(text(),'No results found')]"));
      } catch {
        noResults = null;
      }
      console.log("New public school count:", newCount);
      // Expect that either "No results found" appears or the count has changed
      expect(noResults || newCount).to.not.equal(initialCount);
    });
  });
});

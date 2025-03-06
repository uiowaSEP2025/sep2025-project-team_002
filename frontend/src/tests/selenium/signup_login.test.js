import { Builder, By, until } from "selenium-webdriver";

async function runTest() {
  let driver = await new Builder()
    .forBrowser("chrome")
    .usingServer("http://selenium:4444/wd/hub") // Connect to Selenium running in Docker
    .build();

  try {
    const testEmail = `testuser${Date.now()}@example.com`; // Unique email for each test run
    const testPassword = "TestPassword123!";

    // Navigate to Signup Page
    await driver.get("http://frontend:3000/signup");

    // let pageSource = await driver.getPageSource();
    // console.log(pageSource);

    const apiUrl = await driver.findElement(By.css("body")).getAttribute("data-api-url");
    console.log("Selenium Debugging: API URL =", apiUrl);

    let firstNameInput = await driver.findElement(By.id("signup-first-name"));
    let lastNameInput = await driver.findElement(By.id("signup-last-name"));
    let emailInput = await driver.findElement(By.id("signup-email"));
    let passwordInput = await driver.findElement(By.id("signup-password"));
    let confirmPasswordInput = await driver.findElement(By.id("signup-confirm-password"));
    let signupButton = await driver.findElement(By.id("signup-button"));
    let transferInRadio = await driver.findElement(By.id("signup-transfer-in"));
    let transferOutRadio = await driver.findElement(By.id("signup-transfer-out"));

    let transferOptions = [transferInRadio, transferOutRadio];
    let randomIndex = Math.floor(Math.random() * transferOptions.length);

    // Fill in registration form
    await firstNameInput.sendKeys("Test");
    await lastNameInput.sendKeys("User");
    await emailInput.sendKeys(testEmail);
    await passwordInput.sendKeys(testPassword);
    await confirmPasswordInput.sendKeys(testPassword);
    await transferOptions[randomIndex].click();
    await signupButton.click();

    await driver.sleep(3000);

    let pageText_1 = await driver.findElement(By.tagName("body")).getText();
    console.log("Page text after signup attempt:", pageText_1);

    // Wait for redirect to login page
    await driver.wait(until.urlContains("/login"), 10000);

    // Navigate to Login Page
    await driver.get("http://frontend:3000/login");

    let loginEmailInput = await driver.findElement(By.id("email"));
    let loginPasswordInput = await driver.findElement(By.id("password"));
    let loginButton = await driver.findElement(By.id("login-button"));

    // Fill in login form
    await loginEmailInput.sendKeys(testEmail);
    await loginPasswordInput.sendKeys(testPassword);
    await loginButton.click();

    // Wait for redirect to secure home page
    await driver.wait(until.urlContains("/secure-home"), 5000);

    // Verify the user is on the secure home page
    let pageText = await driver.findElement(By.tagName("body")).getText();
    if (!pageText.includes("Schools and Sports")) {
      throw new Error("Test failed: Could not verify secure home page content");
    }

    console.log("Test passed: User successfully signed up, logged in, and accessed secure home.");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await driver.quit();
  }
}

// Run the test function
runTest();
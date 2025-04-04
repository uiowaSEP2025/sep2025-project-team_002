import fs from "fs";
import { By, until } from "selenium-webdriver";

export function loadCredentials() {
  return JSON.parse(fs.readFileSync("test-user.json", "utf8"));
}

export async function login(driver, email, password) {
  await driver.get("http://frontend:3000/login");

  const emailInput = await driver.findElement(By.id("email"));
  const passwordInput = await driver.findElement(By.id("password"));
  const loginButton = await driver.findElement(By.id("login-button"));

  await emailInput.sendKeys(email);
  await passwordInput.sendKeys(password);
  await loginButton.click();

  await driver.wait(until.urlContains("/secure-home"), 10000);
}

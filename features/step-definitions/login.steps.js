import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { expect } from 'chai';
import fs from 'fs';
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import page_login from '../../pages/page_login.js';

Before(async function () {
    // Setup WebDriver before each scenario
    const options = new chrome.Options();
    this.driver = await new Builder().forBrowser('chrome').build();
});

After(async function () {
    // Take screenshot if test fails
    if (this.result && this.result.status === 'FAILED') {
        const screenshot = await this.driver.takeScreenshot();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        fs.writeFileSync(`failed-test-${timestamp}.png`, Buffer.from(screenshot, "base64"));
    }
    
    // Cleanup
    if (this.driver) {
        await this.driver.quit();
    }
});

Given('I am on the SauceDemo login page', async function () {
    await this.driver.get('https://www.saucedemo.com');
    const title = await this.driver.getTitle();
    expect(title).to.equal('Swag Labs');
});

When('I enter username {string}', async function (username) {
    const inputUsername = await this.driver.findElement(page_login.inputUsername);
    await inputUsername.sendKeys(username);
});

When('I enter password {string}', async function (password) {
    const inputPassword = await this.driver.findElement(page_login.inputPassword);
    await inputPassword.sendKeys(password);
});

When('I click the login button', async function () {
    const buttonLogin = await this.driver.findElement(page_login.buttonLogin);
    await buttonLogin.click();
});

When('I take a screenshot of the login page', async function () {
    const screenshot = await this.driver.takeScreenshot();
    const imgBuffer = Buffer.from(screenshot, "base64");
    fs.writeFileSync("current.png", imgBuffer);
});

Then('I should be logged in successfully', async function () {
    // Wait for the shopping cart to appear, indicating successful login
    const buttonCart = await this.driver.wait(
        until.elementLocated(By.xpath('//*[@data-test="shopping-cart-link"]')), 
        10000
    );
    await this.driver.wait(until.elementIsVisible(buttonCart), 5000, 'Shopping cart should be visible');
});

Then('I should see the shopping cart button', async function () {
    const buttonCart = await this.driver.findElement(By.xpath('//*[@data-test="shopping-cart-link"]'));
    const isDisplayed = await buttonCart.isDisplayed();
    expect(isDisplayed).to.be.true;
});

Then('the page title should be {string}', async function (expectedTitle) {
    const title = await this.driver.getTitle();
    expect(title).to.equal(expectedTitle);
});

Then('I should see the login form', async function () {
    const loginForm = await this.driver.findElement(By.css('.login-box'));
    const isDisplayed = await loginForm.isDisplayed();
    expect(isDisplayed).to.be.true;
});

Then('I should see the username input field', async function () {
    const inputUsername = await this.driver.findElement(page_login.inputUsername);
    const isDisplayed = await inputUsername.isDisplayed();
    expect(isDisplayed).to.be.true;
});

Then('I should see the password input field', async function () {
    const inputPassword = await this.driver.findElement(page_login.inputPassword);
    const isDisplayed = await inputPassword.isDisplayed();
    expect(isDisplayed).to.be.true;
});

Then('I should see the login button', async function () {
    const buttonLogin = await this.driver.findElement(page_login.buttonLogin);
    const isDisplayed = await buttonLogin.isDisplayed();
    expect(isDisplayed).to.be.true;
});

Then('the current page should match the baseline image', async function () {
    // If baseline doesn't exist, create it
    if (!fs.existsSync("baseline.png")) {
        fs.copyFileSync("current.png", "baseline.png");
        console.log("Baseline image created.");
        return;
    }

    // Compare baseline and current images
    const img1 = PNG.sync.read(fs.readFileSync("baseline.png"));
    const img2 = PNG.sync.read(fs.readFileSync("current.png"));
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });

    fs.writeFileSync("diff.png", PNG.sync.write(diff));

    if (numDiffPixels > 0) {
        console.log(`Visual differences found! Pixels different: ${numDiffPixels}`);
        expect(numDiffPixels).to.equal(0, `Visual regression test failed. Found ${numDiffPixels} different pixels.`);
    } else {
        console.log("No visual differences found.");
    }
});

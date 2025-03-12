const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');

describe('Ini Test Suite', function () {
    let driver;
    options = new chrome.Options();

    it('Ini Test Case Pertama', async function () {
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        await driver.get('https://www.saucedemo.com');
        await driver.quit();
    });

    it('Ini Test Case Kedua', async function () {
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        await driver.get('https://www.google.com');
        await driver.quit();
    });

    it('Ini Test Case Ketiga', async function () {
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        await driver.get('https://www.gmail.com');
        await driver.quit();
    });
});

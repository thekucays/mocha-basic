const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

describe('Google Search Test', function () {
    let driver;

    it('Headless Chrome - Visit SauceDemo dan cek page title', async function () {
        options = new chrome.Options();
        options.addArguments("--headless");

        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

        // driver = await new Builder().forBrowser('chrome').build();

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();

        await driver.quit()
    })

    it('Headless Firefox - Visit SauceDemo dan cek page title', async function () {
        options = new firefox.Options()
        options.addArguments("--headless");

        driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build();

        // driver = await new Builder().forBrowser('chrome').build();

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();

        await driver.quit()
    })
});

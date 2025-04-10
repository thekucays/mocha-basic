const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const chrome = require('selenium-webdriver/chrome');

describe('Google Search Test', function () {
    let driver;

    before(async function () {
        console.log('ini di dalam before() hook')
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function () {
        console.log('ini di dalam after() hook')
        await driver.quit();
    });

    it('Visit SauceDemo', async function () {
        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();
    })

    it('Visit Google', async function () {
        await driver.get('https://www.google.com');
        const title = await driver.getTitle();
    })
});

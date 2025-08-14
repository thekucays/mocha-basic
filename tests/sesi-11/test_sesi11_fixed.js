import { Builder, By, until } from 'selenium-webdriver';
import assert from 'assert';
import chrome from 'selenium-webdriver/chrome.js';

import fs from 'fs';
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import page_login from '../../pages/page_login.js';

describe('Google Search Test', function () {
    let driver;

    // hook afterEach buat screenshot jika test gagal
    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            try {
                let ss_full = await driver.takeScreenshot();
                fs.writeFileSync("ss failed: " + this.currentTest.title + ".png", Buffer.from(ss_full, "base64"));
            } catch (error) {
                console.log('Failed to take screenshot:', error.message);
            }
        }
        if (driver) {
            await driver.quit();
        }
    });

    it('Visit SauceDemo dan cek page title', async function () {
        let options = new chrome.Options();
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();

        // assert: memastikan object sama persis
        assert.strictEqual(title, 'Swag Labs');

        // inputs
        let inputUsername = await driver.findElement(By.css('[data-test="username"]'))
        let inputUsernamePOM = await driver.findElement(page_login.inputUsername)

        let inputPassword = await driver.findElement(By.xpath('//*[@data-test="password"]'))
        let buttonLogin = await driver.findElement(By.className('submit-button btn_action'))
        await inputUsernamePOM.sendKeys('standard_user')
        await inputPassword.sendKeys('secret_sauce')
        await buttonLogin.click()
        
        // tunggu element tampil
        let buttonCart = await driver.wait(
            until.elementLocated(By.xpath('//*[@data-test="shopping-cart-link"]')), 
            10000
        );
        await driver.wait(until.elementIsVisible(buttonCart), 5000, 'Shopping cart harus tampil');
        
        // assert: elememt ada
        await buttonCart.isDisplayed()

        // assert: text dalam element benar
        let textAppLogo = await driver.findElement(By.className('app_logo'))
        let logotext = await textAppLogo.getText()
        assert.strictEqual(logotext, 'Swag Labs')

        await driver.sleep(1700)
    });

    it('Take screenshots of SauceDemo page', async function () {
        let options = new chrome.Options();
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');

        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();

        // Wait for page to load completely
        await driver.sleep(2000);

        // full screenshot
        let ss_full = await driver.takeScreenshot();
        fs.writeFileSync("full_screenshot.png", Buffer.from(ss_full, "base64"));

        // partial screenshot
        let inputUsernamePOM = await driver.findElement(page_login.inputUsername)
        let ss_inputusername = await inputUsernamePOM.takeScreenshot();
        fs.writeFileSync("inputusername.png", Buffer.from(ss_inputusername, "base64"));
    })

    it('Cek Visual halaman login', async function () {
        // visit page
        let options = new chrome.Options();
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        await driver.get('https://www.saucedemo.com');

        const title = await driver.getTitle();
        assert.strictEqual(title, 'Swag Labs');

        // Wait for page to load completely
        await driver.sleep(2000);

        // screenshot keadaan login page sekarang, current.png
        let screenshot = await driver.takeScreenshot();
        let imgBuffer = Buffer.from(screenshot, "base64");
        fs.writeFileSync("current.png", imgBuffer);

        // ambil baseline untuk komparasi
        // jika belum ada baseline, jadikan current.png sebagai baseline
        if (!fs.existsSync("baseline.png")) {
            fs.copyFileSync("current.png", "baseline.png");
            console.log("Baseline image saved.");
        }

        // Compare baseline.png dan current.png apakah sama
        let img1 = PNG.sync.read(fs.readFileSync("baseline.png"));
        let img2 = PNG.sync.read(fs.readFileSync("current.png"));
        let { width, height } = img1;
        let diff = new PNG({ width, height });

        let numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });

        fs.writeFileSync("diff.png", PNG.sync.write(diff));

        if (numDiffPixels > 0) {
            console.log(`Visual differences found! Pixels different: ${numDiffPixels}`);
            // For visual testing, you might want to fail the test if differences are found
            // assert.strictEqual(numDiffPixels, 0, `Visual differences found: ${numDiffPixels} pixels different`);
        } else {
            console.log("No visual differences found.");
        }
    })
});

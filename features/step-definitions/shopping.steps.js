import { Given, When, Then } from '@cucumber/cucumber';
import { By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import page_login from '../../pages/page_login.js';

When('I click on the first product', async function () {
    const firstProduct = await this.driver.findElement(By.css('.inventory_item:first-child .inventory_item_name'));
    await firstProduct.click();
});

When('I click the {string} button', async function (buttonText) {
    const button = await this.driver.findElement(By.xpath(`//button[contains(text(), '${buttonText}')]`));
    await button.click();
});

Then('the shopping cart should show {string} item', async function (itemCount) {
    const cartBadge = await this.driver.findElement(By.css('.shopping_cart_badge'));
    const count = await cartBadge.getText();
    expect(count).to.equal(itemCount);
});

Then('the shopping cart should show {string} items', async function (itemCount) {
    const cartBadge = await this.driver.findElement(By.css('.shopping_cart_badge'));
    const count = await cartBadge.getText();
    expect(count).to.equal(itemCount);
});

Then('I should see the {string} button', async function (buttonText) {
    const button = await this.driver.findElement(By.xpath(`//button[contains(text(), '${buttonText}')]`));
    const isDisplayed = await button.isDisplayed();
    expect(isDisplayed).to.be.true;
});

Given('I have added an item to the cart', async function () {
    // This step assumes we're already on a product page or inventory page
    const addToCartButton = await this.driver.findElement(By.css('[data-test="add-to-cart-sauce-labs-backpack"]'));
    await addToCartButton.click();
});

When('I click on the shopping cart icon', async function () {
    const cartIcon = await this.driver.findElement(By.css('[data-test="shopping-cart-link"]'));
    await cartIcon.click();
});

Then('I should be on the cart page', async function () {
    const currentUrl = await this.driver.getCurrentUrl();
    expect(currentUrl).to.include('/cart.html');
});

Then('I should see the cart contents', async function () {
    const cartList = await this.driver.findElement(By.css('.cart_list'));
    const isDisplayed = await cartList.isDisplayed();
    expect(isDisplayed).to.be.true;
});

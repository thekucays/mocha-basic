Feature: SauceDemo Shopping Cart Functionality
  As a logged in user
  I want to interact with the shopping cart
  So that I can manage my purchases

  Background:
    Given I am on the SauceDemo login page
    When I enter username "standard_user"
    And I enter password "secret_sauce"
    And I click the login button
    Then I should be logged in successfully

  Scenario: Add item to shopping cart
    When I click on the first product
    And I click the "Add to cart" button
    Then the shopping cart should show "1" item
    And I should see the "Remove" button

  Scenario: Remove item from shopping cart
    Given I have added an item to the cart
    When I click the "Remove" button
    Then the shopping cart should show "0" items
    And I should see the "Add to cart" button

  Scenario: View shopping cart
    When I click on the shopping cart icon
    Then I should be on the cart page
    And I should see the cart contents

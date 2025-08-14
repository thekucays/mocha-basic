Feature: SauceDemo Login Functionality
  As a user
  I want to be able to login to SauceDemo
  So that I can access the shopping cart and browse products

  Background:
    Given I am on the SauceDemo login page

  Scenario: Successful login with valid credentials
    When I enter username "standard_user"
    And I enter password "secret_sauce"
    And I click the login button
    Then I should be logged in successfully
    And I should see the shopping cart button
    And the page title should be "Swag Labs"

  Scenario: Verify page title and visual elements
    Then the page title should be "Swag Labs"
    And I should see the login form
    And I should see the username input field
    And I should see the password input field
    And I should see the login button

  Scenario: Visual regression test for login page
    When I take a screenshot of the login page
    Then the current page should match the baseline image

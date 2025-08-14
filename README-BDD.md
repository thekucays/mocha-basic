# BDD (Behavior Driven Development) Version

This project now includes both traditional Mocha tests and BDD tests using Cucumber.js.

## What is BDD?

BDD (Behavior Driven Development) is a software development methodology that encourages collaboration between developers, QA, and non-technical stakeholders. It uses natural language descriptions of software behavior to drive the development process.

## Project Structure

```
├── features/                          # BDD Feature files (Gherkin syntax)
│   ├── login.feature                  # Login functionality scenarios
│   ├── shopping.feature               # Shopping cart functionality scenarios
│   ├── step-definitions/              # Step definitions (JavaScript)
│   │   ├── login.steps.js
│   │   └── shopping.steps.js
│   └── support/                       # Support files
│       ├── hooks.js                   # Global hooks
│       └── world.js                   # Custom World object
├── pages/                             # Page Object Model (shared with Mocha tests)
│   └── page_login.js
├── tests/                             # Original Mocha tests
│   └── sesi-11/
│       └── test_sesi11.js
├── cucumber.js                        # Cucumber configuration
└── package.json                       # Updated with BDD dependencies
```

## Key Differences: Mocha vs BDD

### Mocha (Original)
```javascript
describe('Google Search Test', function () {
    it('Visit SauceDemo dan cek page title', async function () {
        // Technical implementation
        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();
        assert.strictEqual(title, 'Swag Labs');
    });
});
```

### BDD (Cucumber.js)
```gherkin
Feature: SauceDemo Login Functionality
  As a user
  I want to be able to login to SauceDemo
  So that I can access the shopping cart and browse products

  Scenario: Successful login with valid credentials
    Given I am on the SauceDemo login page
    When I enter username "standard_user"
    And I enter password "secret_sauce"
    And I click the login button
    Then I should be logged in successfully
```

## Benefits of BDD

1. **Business Readable**: Non-technical stakeholders can understand and contribute to test scenarios
2. **Living Documentation**: Feature files serve as executable documentation
3. **Collaboration**: Bridges the gap between business requirements and technical implementation
4. **Reusability**: Step definitions can be reused across multiple scenarios
5. **Maintainability**: Changes in business logic are reflected in both documentation and tests

## Running BDD Tests

### Install Dependencies
```bash
npm install
```

### Run BDD Tests
```bash
# Run all BDD tests
npm run test:bdd

# Run BDD tests in parallel
npm run test:bdd:parallel

# Run specific feature
npx cucumber-js features/login.feature

# Run with specific tags
npx cucumber-js --tags @smoke
```

### Available Scripts
- `npm run test:bdd` - Run BDD tests with HTML and JSON reports
- `npm run test:bdd:parallel` - Run BDD tests in parallel
- `npm run test` - Run original Mocha tests
- `npm run test-visual` - Run visual regression tests

## Reports

BDD tests generate:
- `cucumber-report.html` - HTML report with detailed test results
- `cucumber-report.json` - JSON report for CI/CD integration

## Adding New Features

1. **Create Feature File**: Write scenarios in Gherkin syntax
```gherkin
Feature: New Feature
  Scenario: Test scenario
    Given some precondition
    When some action
    Then some expected result
```

2. **Create Step Definitions**: Implement the steps in JavaScript
```javascript
Given('some precondition', async function () {
    // Implementation
});
```

3. **Run Tests**: Execute the new feature
```bash
npx cucumber-js features/new-feature.feature
```

## Best Practices

1. **Use Background**: Common setup steps for multiple scenarios
2. **Parameterize Steps**: Use data tables and examples for multiple test cases
3. **Keep Steps Atomic**: Each step should do one thing
4. **Use Tags**: Organize scenarios with @smoke, @regression, etc.
5. **Maintain Page Objects**: Reuse existing POM for consistency

## Migration from Mocha

The BDD version maintains compatibility with your existing:
- Page Object Model (`pages/page_login.js`)
- Visual testing capabilities
- Screenshot functionality
- Selenium WebDriver setup

You can run both test suites simultaneously or migrate gradually.

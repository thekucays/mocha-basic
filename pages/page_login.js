import { By } from "selenium-webdriver";

class PageLogin {
    static inputUsername = By.css('[data-test="username"]');
    static inputPassword = By.xpath('//*[@data-test="password"]');
    static buttonLogin = By.className('submit-button btn_action');
}

// module.exports = PageLogin;

// pakai ini buat ESM support
export default PageLogin;

import { setWorldConstructor } from '@cucumber/cucumber';

class CustomWorld {
    constructor() {
        this.driver = null;
        this.screenshots = [];
    }

    addScreenshot(screenshot) {
        this.screenshots.push(screenshot);
    }

    getLastScreenshot() {
        return this.screenshots[this.screenshots.length - 1];
    }
}

setWorldConstructor(CustomWorld);

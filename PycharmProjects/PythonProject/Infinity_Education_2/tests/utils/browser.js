const puppeteer = require('puppeteer');
const config = require('../config');

class BrowserManager {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async launch() {
    this.browser = await puppeteer.launch(config.browser);
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport(config.browser.defaultViewport);
    
    // Set user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Enable request interception for debugging
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      if (request.resourceType() === 'stylesheet' || request.resourceType() === 'font') {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    return this.page;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async screenshot(name) {
    if (this.page) {
      await this.page.screenshot({
        path: `tests/screenshots/${name}.png`,
        fullPage: true
      });
    }
  }

  async waitForSelector(selector, options = {}) {
    const defaultOptions = { timeout: config.timeout };
    return await this.page.waitForSelector(selector, { ...defaultOptions, ...options });
  }

  async waitForNavigation(options = {}) {
    const defaultOptions = { timeout: config.timeout, waitUntil: 'networkidle2' };
    return await this.page.waitForNavigation({ ...defaultOptions, ...options });
  }

  async type(selector, text, options = {}) {
    await this.waitForSelector(selector);
    await this.page.type(selector, text, options);
  }

  async click(selector, options = {}) {
    await this.waitForSelector(selector);
    await this.page.click(selector, options);
  }

  async getText(selector) {
    await this.waitForSelector(selector);
    return await this.page.$eval(selector, el => el.textContent);
  }

  async isElementVisible(selector) {
    try {
      await this.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForText(text, timeout = config.timeout) {
    await this.page.waitForFunction(
      (text) => document.body.innerText.includes(text),
      { timeout },
      text
    );
  }

  async clearAndType(selector, text) {
    await this.waitForSelector(selector);
    await this.page.click(selector, { clickCount: 3 });
    await this.page.keyboard.press('Backspace');
    await this.page.type(selector, text);
  }

  async selectOption(selector, value) {
    await this.waitForSelector(selector);
    await this.page.select(selector, value);
  }

  async scrollTo(selector) {
    await this.waitForSelector(selector);
    await this.page.evaluate((selector) => {
      document.querySelector(selector).scrollIntoView();
    }, selector);
  }

  async evaluateScript(script) {
    return await this.page.evaluate(script);
  }

  getPage() {
    return this.page;
  }
}

module.exports = BrowserManager;
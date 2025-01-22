const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const logger = require("../utils/logger");

// Enable the stealth plugin
puppeteer.use(StealthPlugin());

// Launch a new browser instance
const launchBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: false, // Run in non-headless mode for debugging
    args: [
      "--disable-blink-features=AutomationControlled", // Disable automation flags
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--disable-infobars",
      "--window-size=1080,720", // Set the window size to 1080x720
    ],
  });

  // Get the list of all open pages (tabs)
  const pages = await browser.pages();
  // Close all pages except the first one (if multiple tabs are opened)
  for (let i = 1; i < pages.length; i++) {
    await pages[i].close();
  }

  const page = pages[0]; // Use the first page

  // Set a realistic user agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  // Set viewport and screen resolution
  await page.setViewport({ width: 1080, height: 720, deviceScaleFactor: 1 });

  // Disable the webdriver flag
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  // Set accept-language and other headers
  await page.setExtraHTTPHeaders({
    "accept-language": "en-US,en;q=0.9", // Mimic a real browser's language preferences
  });

  return { browser, page };
};

// Navigate to a URL
const navigateToUrl = async (page, url) => {
  await page.goto(url, { waitUntil: "networkidle2" });
  logger.info(`Navigated to URL: ${url}`);
};

// Extract all "Apply" links from the page
const extractApplyLinks = async (page) => {
  console.log("Starting to extract 'Apply' links...");

  // Select all <a> elements with target="_blank"
  const anchors = await page.$$('a[target="_blank"]');
  console.log(`Found ${anchors.length} <a> elements with target="_blank".`);

  const applyLinks = [];
  for (const anchor of anchors) {
    // Get the text content of the anchor using textContent
    const text = await page.evaluate((el) => el.textContent.trim(), anchor);
    console.log(`Text content: "${text}"`);

    // Filter by text content
    if (text === "Apply") {
      // Get the href attribute of the anchor
      const href = await page.evaluate((el) => el.href, anchor);
      console.log(`Href: "${href}"`);

      // Add the link to the list
      applyLinks.push({ href, text });
      console.log(`Added link: ${href}`);
    }
  }

  console.log(`Finished extracting ${applyLinks.length} "Apply" links.`);
  return applyLinks;
};

module.exports = { launchBrowser, navigateToUrl, extractApplyLinks };
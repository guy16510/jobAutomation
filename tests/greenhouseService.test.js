const puppeteer = require("puppeteer");
const { handleGreenhouseApplication } = require("../services/greenhouseService");
const logger = require("../utils/logger");
require("dotenv").config();

(async () => {
  // Launch a new browser instance
  const browser = await puppeteer.launch({ headless: false }); // Set headless: true to run in the background
  const page = await browser.newPage();

  try {
    // Navigate to a Greenhouse job application page
    const jobApplicationUrl = `${process.env.GREENHOUSE_SAMPLE_JOB}`; // Replace with a real Greenhouse job application URL
    await page.goto(jobApplicationUrl, { waitUntil: "networkidle2" });

    // Call the handleGreenhouseApplication function
    await handleGreenhouseApplication(page);

    logger.info("Greenhouse application automation completed successfully.");
  } catch (error) {
    logger.error(`Error during automation: ${error.message}`);
  } finally {
    // Close the browser
    await browser.close();
  }
})();
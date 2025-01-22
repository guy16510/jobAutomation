const { launchBrowser, navigateToUrl, extractApplyLinks } = require("./puppeteerService");
const { trackJobApplication } = require("./jobTrackerService");
const { handleGreenhouseApplication } = require("./greenhouseService");
const logger = require("../utils/logger");
const config = require("../config/config");

const scrapeJobs = async () => {
  let browser;
  try {
    // Launch the browser and get the page
    const { browser: launchedBrowser, page } = await launchBrowser();
    browser = launchedBrowser;

    // Navigate to the job listings page
    const url = config.jobAggeratorURL;
    await navigateToUrl(page, url);

    // Extract all "Apply" links
    const applyLinks = await extractApplyLinks(page);
    logger.info(`Found ${applyLinks.length} "Apply" links.`);

    // Apply to each job
    for (const link of applyLinks) {
      const isAlreadyApplied = await trackJobApplication({ applyUrl: link.href });
      if (isAlreadyApplied) {
        logger.info(`Already applied to job: ${link.href}`);
        continue;
      }

      logger.info(`Applying to job: ${link.href}`);
      await navigateToUrl(page, link.href);

      // Handle Greenhouse job application
      if (link.href.includes("greenhouse.io")) {
        await handleGreenhouseApplication(page);
      }

      // Track the job application status
      await trackJobApplication({ applyUrl: link.href }, true);
    }
  } catch (error) {
    logger.error(`Error scraping jobs: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = { scrapeJobs };
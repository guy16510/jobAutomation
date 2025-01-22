const { scrapeJobs } = require("./services/jobScraperService");
const logger = require("./utils/logger");

const main = async () => {
  try {
    // Scrape and apply to jobs
    await scrapeJobs();
  } catch (error) {
    logger.error(`Error in main function: ${error.message}`);
  }
};

main();
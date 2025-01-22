const { scrapeJobs } = require("./services/jobScraperService");
const { parseResume } = require("./utils/resumeParser");
const logger = require("./utils/logger");

const main = async () => {
  try {
    // Parse resume
    const resumeText = await parseResume("./data/fake.pdf");
    logger.info("Resume parsed successfully.");

    // Scrape and apply to jobs
    await scrapeJobs();
  } catch (error) {
    logger.error(`Error in main function: ${error.message}`);
  }
};

main();
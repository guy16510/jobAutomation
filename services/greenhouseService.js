const { getAIAnswer } = require("./aiService");
const config = require("../config/config");
const logger = require("../utils/logger");

// Handle Greenhouse job application
const handleGreenhouseApplication = async (page) => {
  try {
    // Wait for the form to load
    await page.waitForSelector("#application_form", { visible: true, timeout: 30000 });
    logger.info("Greenhouse application form loaded.");

    // Fill in personal information
    await fillPersonalInformation(page);

    // Fill in LinkedIn and GitHub (if fields exist)
    await fillLinkedInAndGitHub(page);

    // Upload resume
    await uploadResume(page);

    // Handle location field
    await handleLocationField(page);

    // Handle questions
    await handleQuestions(page);

    // Handle cover letter
    await handleCoverLetter(page);

    // Submit application
    await submitApplication(page);

    logger.info("Application submitted successfully.");
  } catch (error) {
    logger.error(`Error handling Greenhouse application: ${error.message}`);
  }
};

// Fill in personal information
const fillPersonalInformation = async (page) => {
  await page.type('input[name="job_application[first_name]"]', config.personalInfo.firstName);
  await page.type('input[name="job_application[last_name]"]', config.personalInfo.lastName);
  await page.type('input[name="job_application[email]"]', config.personalInfo.email);
  await page.type('input[name="job_application[phone]"]', config.personalInfo.phone);
  logger.info("Filled in personal information.");
};

// Fill in LinkedIn and GitHub (if fields exist)
const fillLinkedInAndGitHub = async (page) => {
  const linkedinField = await page.$('input[name="job_application[urls][LinkedIn]"]');
  if (linkedinField) {
    await linkedinField.type(config.personalInfo.linkedin);
    logger.info("Filled in LinkedIn.");
  }

  const githubField = await page.$('input[name="job_application[urls][GitHub]"]');
  if (githubField) {
    await githubField.type(config.personalInfo.github);
    logger.info("Filled in GitHub.");
  }
};

// Upload resume
const uploadResume = async (page) => {
  const resumeInput = await page.$('input[type="file"]');
  if (resumeInput) {
    await resumeInput.uploadFile(config.resumePath);
    logger.info("Resume uploaded successfully.");
  } else {
    logger.warn("Resume upload field not found.");
  }
};

// Handle location field
const handleLocationField = async (page) => {
    const locationInput = await page.$('input[name="job_application[location]"]');
    if (locationInput) {
      // Type the location from config
      await locationInput.type(config.personalInfo.location);
  
      // Wait for the dropdown to appear
      await page.waitForSelector("#location_autocomplete-items-popup", { visible: true, timeout: 5000 });
  
      // Select the first suggestion from the dropdown
      await page.click("#location_autocomplete-items-popup li:first-child");
      logger.info("Location selected successfully.");
    } else {
      logger.warn("Location input field not found.");
    }
  };

// Handle questions
const handleQuestions = async (page) => {
  const questions = await page.$$(".field");
  for (const question of questions) {
    const label = await question.$eval("label", (el) => el.innerText.trim());
    const input = await question.$("input, textarea, select");

    if (label.includes("How did you hear about this job?")) {
      await input.type("I found this job on Remote RocketShip.");
    } else if (label.includes("Salary expectations")) {
      await input.type("$190,000");
    } else if (label.includes("Are you authorized to work in the United States?")) {
      await input.select("Yes");
    } else {
      const answer = await getAIAnswer(label, "Job description not available", "Resume text not available");
      if (await question.$("textarea")) {
        await question.type("textarea", answer);
      } else if (await question.$("input[type='text']")) {
        await question.type("input[type='text']", answer);
      } else if (await question.$("select")) {
        await input.select(answer);
      }
    }
  }
  logger.info("Answered all questions.");
};

// Handle cover letter
const handleCoverLetter = async (page) => {
  const coverLetterButton = await page.$('button:has-text("Cover Letter")');
  if (coverLetterButton) {
    await coverLetterButton.click();
    await page.waitForSelector('textarea[name="job_application[cover_letter]"]', { visible: true });

    const coverLetterPrompt = `Write a professional cover letter based on the following resume and job description:\n\nResume: Resume text not available\n\nJob Description: Job description not available`;
    const coverLetter = await getAIAnswer(coverLetterPrompt, "Job description not available", "Resume text not available");

    await page.type('textarea[name="job_application[cover_letter]"]', coverLetter);
    logger.info("Cover letter generated and filled successfully.");
  } else {
    logger.warn("Cover letter button not found.");
  }
};

// Submit application
const submitApplication = async (page) => {
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  logger.info("Application submitted successfully.");
};

module.exports = { handleGreenhouseApplication };
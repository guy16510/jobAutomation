const puppeteer = require("puppeteer");
const Fuzz = require("fuzzball");
const { getAIAnswer } = require("./aiService");
const config = require("../config/config");
const logger = require("../utils/logger");

/**
 * Extract the job description from the page.
 * @param {object} page - Puppeteer page object.
 * @returns {Promise<string>} - The job description text.
 */
const extractJobDescription = async (page) => {
  try {
    // Wait for the job description element to load
    await page.waitForSelector("#content");
    logger.info("Job description element found.");

    // Extract the job description text
    const jobDescription = await page.$eval("#content", (el) =>
      el.innerText.trim()
    );
    logger.info("Job description extracted successfully.");
    return jobDescription;
  } catch (error) {
    logger.error(`Error extracting job description: ${error.message}`);
    throw new Error("Failed to extract job description.");
  }
};

// Handle Greenhouse job application
const handleGreenhouseApplication = async (page) => {
  const filledFields = new Set(); // Track fields that have already been filled

  try {
    // Extract the job description from the page
    const jobDescription = await extractJobDescription(page);
    logger.info("Job description:", jobDescription);

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
    await handleQuestions(page, jobDescription, filledFields);

    // Handle cover letter
    // await handleCoverLetter(page, jobDescription);

    // Submit application
    // await submitApplication(page);

    logger.info("Application submitted successfully.");
  } catch (error) {
    logger.error(`Error handling Greenhouse application: ${error.message}`);
  }
};

// Fill in personal information
const fillPersonalInformation = async (page) => {
  await page.type('input[name="job_application[first_name]"]', config.personalInfo.firstname);
  await page.type('input[name="job_application[last_name]"]', config.personalInfo.lastname);
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
// Handle cover letter
const handleCoverLetter = async (page, jobDescription) => {
  try {
    // Wait for the cover letter section to load
    await page.waitForSelector('#cover_letter_fieldset', { visible: true, timeout: 30000 });
    logger.info("Cover letter section loaded.");

    // Click the "or enter manually" button
    const enterManuallyButton = await page.$('#cover_letter_fieldset button[data-source="paste"]');
    if (enterManuallyButton) {
      await enterManuallyButton.click();
      logger.info("Clicked 'or enter manually' button.");
    } else {
      throw new Error("'or enter manually' button not found.");
    }

    // Wait for the textarea to appear
    await page.waitForSelector('textarea#cover_letter_text', { visible: true, timeout: 10000 });
    logger.info("Cover letter textarea is visible.");

    // Generate the cover letter using AI
    const coverLetterPrompt = `Write a professional cover letter. Keep it short to 1-2 paragraphs. 
    You are me, and you are applying to jobs. Write your response in first person, being humble, concise, and professional. 
    Leverage relevant experience from my resume and align it with the job description. 
    Do not use placeholders like [Your Name], [City, State], <COMPANY>, or any other bracketed text under any circumstances. 
    If specific details are not provided, generalize or omit them entirely. 
    For example:
      - Instead of writing "I am [Your Name], located in [City, State]," write "I am excited to apply for this position."
      - Instead of writing "I am particularly drawn to <COMPANY>," write "I am particularly drawn to this opportunity."
    `;
    const coverLetter = await getAIAnswer(coverLetterPrompt, jobDescription);
    logger.info("Cover letter generated successfully.");

    // Fill the generated cover letter into the textarea
    await page.type('textarea#cover_letter_text', coverLetter);
    logger.info("Cover letter filled into the textarea.");

  } catch (error) {
    logger.error(`Error handling cover letter: ${error.message}`);
    throw error;
  }
};

// Handle questions
const handleQuestions = async (page, jobDescription, filledFields) => {
  // Get all question elements
  const questions = await page.$$("#custom_fields .field");

  // Known questions and their answers (from config or hardcoded)
  const knownQuestions = {
    "LinkedIn Profile": config.personalInfo.linkedin,
    "How did you hear about this job?": config.hardcodedAnswers.jobReferral,
    "Desired Salary": config.hardcodedAnswers.salary,
    "Do you currently reside in one of these states?": "Yes", // Assuming the answer is "Yes"
    "Which state do you currently reside in?": config.personalInfo.state,
    "Will you need sponsorship for an employment visa to work at Subsplash?": config.hardcodedAnswers.sponsorship,
    "Do you have the legal right to work in the United States for Subsplash?": config.hardcodedAnswers.authorizedUS,
  };

  for (const question of questions) {
    try {
      // Extract the question label
      const label = await question.$eval("label", (el) => el.innerText.trim().replace(/\s+/g, " "));
      logger.info(`Processing question: ${label}`);

      // Skip if the field has already been filled
      if (filledFields.has(label)) {
        logger.info(`Skipping already filled field: ${label}`);
        continue;
      }

      // Fuzzy match the label with known questions
      let bestMatch = null;
      let bestScore = 0;

      for (const knownQuestion of Object.keys(knownQuestions)) {
        const score = Fuzz.ratio(label.toLowerCase(), knownQuestion.toLowerCase());
        if (score > bestScore && score > 70) {
          // Threshold for a good match
          bestScore = score;
          bestMatch = knownQuestion;
        }
      }

      if (bestMatch) {
        // Get the answer for the matched question
        const answer = knownQuestions[bestMatch];

        // Determine the input type and fill accordingly
        const input = await question.$("input[type='text'], textarea, select");
        if (input) {
          const inputType = await input.evaluate((el) => el.tagName.toLowerCase());

          switch (inputType) {
            case "input": {
              // Handle text inputs
              await input.type(answer);
              logger.info(`Filled text input for: ${label}`);
              break;
            }
            case "select": {
              // Handle select2 dropdowns
              const selectId = await input.evaluate((el) => el.id);
              if (selectId) {
                // Click the select2 container to open the dropdown
                await page.click(`#s2id_${selectId}`);

                // Wait for the dropdown options to appear
                await page.waitForSelector(".select2-results li", { visible: true });

                // Select the option that matches the answer
                const options = await page.$$(".select2-results li");
                for (const option of options) {
                  const optionText = await option.evaluate((el) => el.innerText.trim());
                  if (optionText.toLowerCase() === answer.toLowerCase()) {
                    await option.click();
                    logger.info(`Selected dropdown option for: ${label}`);
                    break;
                  }
                }
              }
              break;
            }
            default: {
              logger.warn(`Unsupported input type: ${inputType} for question: ${label}`);
              break;
            }
          }

          filledFields.add(label); // Mark as filled
        } else {
          logger.warn(`No input field found for question: ${label}`);
        }
      } else {
        logger.warn(`No match found for question: ${label}`);
      }
    } catch (error) {
      logger.error(`Error handling question: ${label} - ${error.message}`);
    }
  }

  logger.info("Answered all questions.");
};


// Submit application
const submitApplication = async (page) => {
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  logger.info("Application submitted successfully.");
};

module.exports = { handleGreenhouseApplication };
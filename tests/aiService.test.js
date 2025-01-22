const fs = require("fs");
const getAIAnswer = require("../services/aiService").getAIAnswer;
const parseResume = require("../utils/resumeParser").parseResume;
const logger = require("../utils/logger");

(async () => {
  try {
    // Read the mock job description and resume
    const jobDescription = fs.readFileSync("./data/jobDescription.txt", "utf-8");
    const resumeText = await parseResume("./data/fake.pdf");
    logger.info("Resume parsed successfully.");

    // Test the getAIAnswer function
    const prompt = "Why are you a good fit for this role?";
    const answer = await getAIAnswer(prompt, jobDescription, resumeText);
    console.log("AI Answer:\n", answer);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
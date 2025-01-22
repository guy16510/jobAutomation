const fs = require("fs");
const getAIAnswer = require("../services/aiService").getAIAnswer;
const logger = require("../utils/logger");

(async () => {
  try {
    // Read the mock job description and resume
    const jobDescription = fs.readFileSync("./data/jobDescription.txt", "utf-8");

    // Test the getAIAnswer function
    const prompt = `Write a professional cover letter. Keep it short to 1-2 paragraphs. 
    
    You are me, and you are applying to jobs. Write your response in first person, being humble, concise, and professional. Leverage relevant experience from my resume and align it with the job description. Do not use placeholders like [Your Name], [City, State], [COMPANY], or any other bracketed text under any circumstances. If specific details are not provided, generalize or omit them entirely. For example:

      - Instead of writing "I am [Your Name], located in [City, State]," write "I am excited to apply for this position."
      - Instead of writing "I am particularly drawn to [COMPANY]," write "I am particularly drawn to this opportunity."
      `;
    const answer = await getAIAnswer(prompt, jobDescription);
    console.log("AI Answer:\n", answer);
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
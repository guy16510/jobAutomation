const axios = require("axios");
const config = require("../config/config");
const logger = require("../utils/logger");
const { parseResume } = require("../utils/resumeParser");

/**
 * Get an AI-generated answer using Ollama.
 * @param {string} prompt - The prompt or question to send to the AI.
 * @param {string} jobDescription - The job description (context for the AI).
 * @returns {Promise<string>} - The AI-generated answer.
 */
const getAIAnswer = async (prompt, jobDescription) => {
  try {
    // Parse resume
    const resumeText = await parseResume(config.resumePath);
    logger.info("Resume parsed successfully.");

    // Construct the payload for the Ollama API
    const payload = {
      model: config.ollama.model,
      prompt: `
      Here is the job description and my resume for context:
      Job Description: ${jobDescription}
      Resume (my experience): ${resumeText}
      
      Questions: ${prompt}`,
      stream: false,
      options: {
        ...config.ollama.options,
        format: "json", // Request the response in JSON format
      },
    };

    // Make the API request to Ollama
    const response = await axios.post(config.ollama.apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Extract the AI's response
    let aiResponse = response.data.response;

    // Remove the <think> section from the response
    aiResponse = aiResponse.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    logger.info("AI response generated successfully.");
    return aiResponse;
  } catch (error) {
    logger.error(`Error getting AI answer: ${error.message}`);
    if (error.response) {
      logger.error(`API Response Status: ${error.response.status}`);
      logger.error(`API Response Data: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error("Failed to get AI answer.");
  }
};

module.exports = { getAIAnswer };
const axios = require("axios");
const config = require("../config/config");
const logger = require("../utils/logger");

/**
 * Get an AI-generated answer using Ollama.
 * @param {string} prompt - The prompt or question to send to the AI.
 * @param {string} jobDescription - The job description (context for the AI).
 * @param {string} resumeText - The resume text (context for the AI).
 * @returns {Promise<string>} - The AI-generated answer.
 */
const getAIAnswer = async (prompt, jobDescription, resumeText) => {
  try {
    // Construct the payload for the Ollama API
    const payload = {
      model: config.ollama.model, // Use the model from config
      prompt: `You are me, and applying to jobs, write this in first person. Use the following job description and resume text to answer the question. Write this response in first person, being humble, short and concise, and leveraging experience from the resume. Do not add anything else in your response.\n\nJob Description: ${jobDescription}\n\nResume: ${resumeText}\n\nQuestion: ${prompt}`,
      stream: false, // Set to false to get a single response
      options: config.ollama.options, // Use options from config
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
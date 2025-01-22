const axios = require("axios");
const config = require("../config/config");
const logger = require("../utils/logger");

// DeepSeek API configuration
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"; // Replace with the actual DeepSeek API endpoint
const DEEPSEEK_API_KEY = config.deepseekApiKey; // Ensure your API key is stored in the config

/**
 * Get an AI-generated answer using DeepSeek AI.
 * @param {string} prompt - The prompt or question to send to the AI.
 * @param {string} jobDescription - The job description (context for the AI).
 * @param {string} resumeText - The resume text (context for the AI).
 * @returns {Promise<string>} - The AI-generated answer.
 */
const getAIAnswer = async (prompt, jobDescription, resumeText) => {
  try {
    // Construct the payload for the DeepSeek API
    const payload = {
      model: "deepseek-chat", // Replace with the appropriate model name
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Use the following job description and resume text to answer the user's question.\n\nJob Description: ${jobDescription}\n\nResume: ${resumeText}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500, // Adjust as needed
      temperature: 0.7, // Adjust for creativity vs. determinism
    };

    // Make the API request
    const response = await axios.post(DEEPSEEK_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // Extract and return the AI's response
    const aiResponse = response.data.choices[0].message.content;
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
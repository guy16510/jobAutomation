const path = require("path");
require("dotenv").config(); // Load environment variables from .env

module.exports = {
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    location: "Boston, MA",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    portfolio: "https://johndoe.com",
  },
  resumePath: path.resolve(__dirname, "fake.pdf"), // Full path to the resume PDF
  configPath: path.resolve(__dirname, "config.js"), // Full path to this config file

  // Ollama configuration
  ollama: {
    apiUrl: `http://${process.env.SERVER_IP}:11434/api/generate`, // Use SERVER_IP from .env
    model: "deepseek-r1:latest", // Replace with the model you have installed (e.g., "mistral", "codellama")
    options: {
      temperature: 0.7, // Adjust for creativity vs. determinism
      max_tokens: 500, // Adjust as needed
    },
  },
};
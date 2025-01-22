const path = require("path");

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
  deepseekApiKey: process.env.DEEPSEEK_API_KEY, // Add your Deepseek API key in .env
  resumePath: path.resolve(__dirname, "fake.pdf"), // Full path to the resume PDF
  configPath: path.resolve(__dirname, "config.js"), // Full path to this config file
};
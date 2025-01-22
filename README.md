# Job Automation

This project automates the process of applying to jobs on Greenhouse using Puppeteer and DeepSeek AI. It fills out personal information, uploads a resume, answers application questions, generates a cover letter using AI, and submits the application.

## Features

- **Personal Information**: Automatically fills in personal details (name, email, phone, etc.).
- **Resume Upload**: Uploads a resume from a specified file path.
- **Location Handling**: Fills in the location field and selects the first autocomplete suggestion.
- **AI-Powered Answers**: Uses DeepSeek AI to generate answers for application questions and cover letters.
- **Logging**: Provides detailed logging for debugging and monitoring.

## Prerequisites

Before running the project, ensure you have the following:

1. **Node.js**: Install Node.js (v16 or higher) from [nodejs.org](https://nodejs.org/).
2. **DeepSeek API Key**: Obtain an API key from DeepSeek and add it to your `.env` file.
3. **Resume PDF**: Place your resume PDF in the project directory and update the path in `config.js`.

## Setup

1. /config/config.js
    - update your personal information

2. update the .env file

3. add your pdf to /data/*

4. run the index.js file.
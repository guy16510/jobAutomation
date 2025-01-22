const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const appliedJobsFilePath = path.resolve(__dirname, "../data/appliedJobs.json");

// Load applied jobs from file
const loadAppliedJobs = () => {
  if (!fs.existsSync(appliedJobsFilePath)) {
    fs.writeFileSync(appliedJobsFilePath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(appliedJobsFilePath));
};

// Save applied jobs to file
const saveAppliedJobs = (jobs) => {
  fs.writeFileSync(appliedJobsFilePath, JSON.stringify(jobs, null, 2));
};

// Track job application status
const trackJobApplication = async (job, isSuccess = false) => {
  const appliedJobs = loadAppliedJobs();

  // Check if the job has already been applied to
  const isAlreadyApplied = appliedJobs.some(
    (appliedJob) => appliedJob.applyUrl === job.applyUrl && appliedJob.isSuccess === true
  );

  if (isAlreadyApplied) {
    return true; // Job already applied
  }

  // Add the job to the applied jobs list
  appliedJobs.push({ ...job, appliedAt: new Date().toISOString(), isSuccess });
  saveAppliedJobs(appliedJobs);

  return false; // Job not applied yet
};

module.exports = { trackJobApplication };
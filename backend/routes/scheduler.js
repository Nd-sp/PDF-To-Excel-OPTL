const express = require('express');
const router = express.Router();
const schedulerService = require('../services/schedulerService');

/**
 * Create a new scheduled job
 */
router.post('/jobs', async (req, res) => {
  try {
    const result = await schedulerService.createJob(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message || 'Failed to create job' });
  }
});

/**
 * Get all jobs
 */
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await schedulerService.getAllJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * Get job by ID
 */
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await schedulerService.getJob(parseInt(jobId));

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

/**
 * Pause a job
 */
router.put('/jobs/:jobId/pause', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await schedulerService.pauseJob(parseInt(jobId));
    res.json(result);
  } catch (error) {
    console.error('Error pausing job:', error);
    res.status(500).json({ error: 'Failed to pause job' });
  }
});

/**
 * Resume a job
 */
router.put('/jobs/:jobId/resume', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await schedulerService.resumeJob(parseInt(jobId));
    res.json(result);
  } catch (error) {
    console.error('Error resuming job:', error);
    res.status(500).json({ error: 'Failed to resume job' });
  }
});

/**
 * Delete a job
 */
router.delete('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await schedulerService.deleteJob(parseInt(jobId));
    res.json(result);
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;

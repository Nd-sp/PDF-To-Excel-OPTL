const db = require('../config/database');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

class SchedulerService {
  constructor() {
    this.activeCrons = new Map();
    this.init();
  }

  /**
   * Initialize scheduler - load and start active jobs
   */
  async init() {
    try {
      const [jobs] = await db.query(`
        SELECT * FROM scheduled_jobs
        WHERE is_active = 1 AND status = 'active'
      `);

      for (const job of jobs) {
        await this.startCronJob(job);
      }

      console.log(`Scheduler initialized with ${jobs.length} active jobs`);
    } catch (error) {
      console.error('Scheduler initialization error:', error);
    }
  }

  /**
   * Create a new scheduled job
   */
  async createJob(jobData) {
    try {
      const { job_name, job_type, schedule_cron, config } = jobData;

      // Validate cron expression
      if (!cron.validate(schedule_cron)) {
        throw new Error('Invalid cron expression');
      }

      const [result] = await db.query(`
        INSERT INTO scheduled_jobs
        (job_name, job_type, schedule_cron, config, status, is_active)
        VALUES (?, ?, ?, ?, 'active', TRUE)
      `, [job_name, job_type, schedule_cron, JSON.stringify(config)]);

      const jobId = result.insertId;

      // Get the created job
      const [jobs] = await db.query(`
        SELECT * FROM scheduled_jobs WHERE id = ?
      `, [jobId]);

      const job = jobs[0];

      // Calculate next run time
      await this.updateNextRunTime(jobId, schedule_cron);

      // Start the cron job
      await this.startCronJob(job);

      return { success: true, jobId, job };
    } catch (error) {
      console.error('Error creating scheduled job:', error);
      throw error;
    }
  }

  /**
   * Start a cron job
   */
  async startCronJob(job) {
    try {
      if (this.activeCrons.has(job.id)) {
        console.log(`Job ${job.id} already running`);
        return;
      }

      const task = cron.schedule(job.schedule_cron, async () => {
        console.log(`Executing scheduled job: ${job.job_name} (ID: ${job.id})`);
        await this.executeJob(job);
      });

      this.activeCrons.set(job.id, task);
      console.log(`Started cron job: ${job.job_name} (${job.schedule_cron})`);
    } catch (error) {
      console.error(`Error starting cron job ${job.id}:`, error);
    }
  }

  /**
   * Execute a job
   */
  async executeJob(job) {
    try {
      // Update last_run_at
      await db.query(`
        UPDATE scheduled_jobs
        SET last_run_at = NOW()
        WHERE id = ?
      `, [job.id]);

      const config = typeof job.config === 'string' ? JSON.parse(job.config) : job.config;

      switch (job.job_type) {
        case 'batch_processing':
          await this.executeBatchProcessing(config);
          break;
        case 'report_generation':
          await this.executeReportGeneration(config);
          break;
        case 'cloud_sync':
          await this.executeCloudSync(config);
          break;
        case 'data_cleanup':
          await this.executeDataCleanup(config);
          break;
        default:
          console.warn(`Unknown job type: ${job.job_type}`);
      }

      // Update next run time
      await this.updateNextRunTime(job.id, job.schedule_cron);

      // Update status to completed
      await db.query(`
        UPDATE scheduled_jobs
        SET status = 'active'
        WHERE id = ?
      `, [job.id]);

    } catch (error) {
      console.error(`Error executing job ${job.id}:`, error);

      // Mark as failed
      await db.query(`
        UPDATE scheduled_jobs
        SET status = 'failed'
        WHERE id = ?
      `, [job.id]);
    }
  }

  /**
   * Execute batch processing job
   */
  async executeBatchProcessing(config) {
    console.log('Executing batch processing:', config);
    // Implementation for watching a folder and auto-processing PDFs
    const { watch_folder } = config;

    if (watch_folder) {
      const files = await fs.readdir(watch_folder);
      const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

      console.log(`Found ${pdfFiles.length} PDF files in watch folder`);
      // Here you would trigger the batch processing
      // This would integrate with your existing upload/batch processor
    }
  }

  /**
   * Execute report generation job
   */
  async executeReportGeneration(config) {
    console.log('Executing report generation:', config);
    // Implementation for generating periodic reports
    const { report_type, email_to } = config;

    // Generate report based on type (analytics, summary, etc.)
    // This would use your analytics service
  }

  /**
   * Execute cloud sync job
   */
  async executeCloudSync(config) {
    console.log('Executing cloud sync:', config);
    // Implementation for syncing with cloud storage
    const { provider, sync_type } = config;

    // Sync files to/from cloud storage
  }

  /**
   * Execute data cleanup job
   */
  async executeDataCleanup(config) {
    console.log('Executing data cleanup:', config);
    const { days_old } = config;

    // Clean up old data
    await db.query(`
      DELETE FROM alerts
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      AND is_dismissed = 1
    `, [days_old || 90]);

    console.log('Data cleanup completed');
  }

  /**
   * Update next run time
   */
  async updateNextRunTime(jobId, cronExpression) {
    // For simplicity, just calculate based on current time
    // In production, use a proper cron parser library
    await db.query(`
      UPDATE scheduled_jobs
      SET next_run_at = DATE_ADD(NOW(), INTERVAL 1 HOUR)
      WHERE id = ?
    `, [jobId]);
  }

  /**
   * Pause a job
   */
  async pauseJob(jobId) {
    const task = this.activeCrons.get(jobId);
    if (task) {
      task.stop();
      this.activeCrons.delete(jobId);
    }

    await db.query(`
      UPDATE scheduled_jobs
      SET status = 'paused', is_active = 0
      WHERE id = ?
    `, [jobId]);

    return { success: true };
  }

  /**
   * Resume a job
   */
  async resumeJob(jobId) {
    const [jobs] = await db.query(`
      SELECT * FROM scheduled_jobs WHERE id = ?
    `, [jobId]);

    if (jobs.length === 0) {
      throw new Error('Job not found');
    }

    const job = jobs[0];

    await db.query(`
      UPDATE scheduled_jobs
      SET status = 'active', is_active = 1
      WHERE id = ?
    `, [jobId]);

    await this.startCronJob(job);

    return { success: true };
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId) {
    const task = this.activeCrons.get(jobId);
    if (task) {
      task.stop();
      this.activeCrons.delete(jobId);
    }

    await db.query(`
      DELETE FROM scheduled_jobs WHERE id = ?
    `, [jobId]);

    return { success: true };
  }

  /**
   * Get all jobs
   */
  async getAllJobs() {
    const [jobs] = await db.query(`
      SELECT * FROM scheduled_jobs
      ORDER BY created_at DESC
    `);

    return jobs;
  }

  /**
   * Get job by ID
   */
  async getJob(jobId) {
    const [jobs] = await db.query(`
      SELECT * FROM scheduled_jobs WHERE id = ?
    `, [jobId]);

    return jobs[0];
  }
}

module.exports = new SchedulerService();

const express = require('express');
const router = express.Router();
const cloudStorageService = require('../services/cloudStorageService');

/**
 * Upload file to cloud
 */
router.post('/upload', async (req, res) => {
  try {
    const { file_path, provider, config } = req.body;

    if (!file_path) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const result = await cloudStorageService.uploadToCloud(file_path, provider, config);
    res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

/**
 * Sync entire batch to cloud
 */
router.post('/sync-batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { provider, config } = req.body;

    const result = await cloudStorageService.syncBatchToCloud(
      parseInt(batchId),
      provider || 'local',
      config || {}
    );

    res.json(result);
  } catch (error) {
    console.error('Batch sync error:', error);
    res.status(500).json({ error: error.message || 'Sync failed' });
  }
});

/**
 * Download file from cloud
 */
router.post('/download', async (req, res) => {
  try {
    const { cloud_path, local_path, provider } = req.body;

    if (!cloud_path || !local_path) {
      return res.status(400).json({ error: 'Cloud path and local path are required' });
    }

    const result = await cloudStorageService.downloadFromCloud(
      cloud_path,
      local_path,
      provider || 'local'
    );

    res.json(result);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message || 'Download failed' });
  }
});

/**
 * List files in cloud storage
 */
router.get('/list', async (req, res) => {
  try {
    const { provider, ...config } = req.query;

    const result = await cloudStorageService.listCloudFiles(
      provider || 'local',
      config
    );

    res.json(result);
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: error.message || 'Failed to list files' });
  }
});

/**
 * Get configuration guide
 */
router.get('/config-guide', async (req, res) => {
  try {
    const guide = cloudStorageService.getConfigurationGuide();
    res.json(guide);
  } catch (error) {
    console.error('Error fetching config guide:', error);
    res.status(500).json({ error: 'Failed to fetch configuration guide' });
  }
});

module.exports = router;

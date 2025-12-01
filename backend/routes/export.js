const express = require('express');
const router = express.Router();
const exportService = require('../services/exportService');
const path = require('path');

/**
 * Export batch to Excel
 */
router.get('/excel/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const result = await exportService.exportToExcel(parseInt(batchId));

    res.download(result.filepath, result.filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file' });
        }
      }
    });
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ error: 'Failed to export to Excel' });
  }
});

/**
 * Export batch to CSV
 */
router.get('/csv/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const result = await exportService.exportToCSV(parseInt(batchId));

    res.download(result.filepath, result.filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file' });
        }
      }
    });
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export to CSV' });
  }
});

/**
 * Export batch to JSON
 */
router.get('/json/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const result = await exportService.exportToJSON(parseInt(batchId));

    res.download(result.filepath, result.filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file' });
        }
      }
    });
  } catch (error) {
    console.error('JSON export error:', error);
    res.status(500).json({ error: 'Failed to export to JSON' });
  }
});

/**
 * Get export history for a batch
 */
router.get('/history/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const history = await exportService.getExportHistory(parseInt(batchId));
    res.json(history);
  } catch (error) {
    console.error('Error fetching export history:', error);
    res.status(500).json({ error: 'Failed to fetch export history' });
  }
});

module.exports = router;

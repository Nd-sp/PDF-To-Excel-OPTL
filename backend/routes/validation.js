const express = require('express');
const router = express.Router();
const validationService = require('../services/validationService');

/**
 * Get validation results for a batch
 */
router.get('/batches/:batchId/validation', async (req, res) => {
  try {
    const { batchId } = req.params;
    const results = await validationService.getBatchValidationResults(batchId);
    res.json(results);
  } catch (error) {
    console.error('Error fetching validation results:', error);
    res.status(500).json({ error: 'Failed to fetch validation results' });
  }
});

/**
 * Get validation summary for a batch
 */
router.get('/batches/:batchId/validation/summary', async (req, res) => {
  try {
    const { batchId } = req.params;
    const summary = await validationService.getBatchValidationSummary(batchId);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching validation summary:', error);
    res.status(500).json({ error: 'Failed to fetch validation summary' });
  }
});

/**
 * Check for duplicate invoices
 */
router.post('/check-duplicates', async (req, res) => {
  try {
    const { invoiceNumber, relationshipNumber, excludePdfRecordId } = req.body;
    const duplicates = await validationService.checkDuplicates(
      invoiceNumber,
      relationshipNumber,
      excludePdfRecordId
    );
    res.json({ duplicates, hasDuplicates: duplicates.length > 0 });
  } catch (error) {
    console.error('Error checking duplicates:', error);
    res.status(500).json({ error: 'Failed to check duplicates' });
  }
});

module.exports = router;

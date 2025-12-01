const express = require('express');
const router = express.Router();
const correctionService = require('../services/correctionService');

/**
 * Get invoice for correction
 */
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const data = await correctionService.getInvoiceForCorrection(parseInt(invoiceId));
    res.json(data);
  } catch (error) {
    console.error('Error fetching invoice for correction:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

/**
 * Save single correction
 */
router.post('/save', async (req, res) => {
  try {
    const { invoiceId, fieldName, originalValue, correctedValue, reason, correctedBy } = req.body;
    const result = await correctionService.saveCorrection(
      invoiceId, fieldName, originalValue, correctedValue, reason, correctedBy
    );
    res.json(result);
  } catch (error) {
    console.error('Error saving correction:', error);
    res.status(500).json({ error: 'Failed to save correction' });
  }
});

/**
 * Apply multiple corrections
 */
router.post('/apply', async (req, res) => {
  try {
    const { invoiceId, corrections } = req.body;
    const result = await correctionService.applyCorrections(invoiceId, corrections);
    res.json(result);
  } catch (error) {
    console.error('Error applying corrections:', error);
    res.status(500).json({ error: 'Failed to apply corrections' });
  }
});

/**
 * Get batch corrections
 */
router.get('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const corrections = await correctionService.getBatchCorrections(parseInt(batchId));
    res.json(corrections);
  } catch (error) {
    console.error('Error fetching batch corrections:', error);
    res.status(500).json({ error: 'Failed to fetch corrections' });
  }
});

/**
 * Approve correction
 */
router.put('/:correctionId/approve', async (req, res) => {
  try {
    const { correctionId } = req.params;
    const { approvedBy } = req.body;
    const result = await correctionService.approveCorrection(parseInt(correctionId), approvedBy);
    res.json(result);
  } catch (error) {
    console.error('Error approving correction:', error);
    res.status(500).json({ error: 'Failed to approve correction' });
  }
});

/**
 * Get correction stats
 */
router.get('/stats', async (req, res) => {
  try {
    const { batchId } = req.query;
    const stats = await correctionService.getCorrectionStats(batchId ? parseInt(batchId) : null);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching correction stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Get frequently corrected fields
 */
router.get('/frequent-fields', async (req, res) => {
  try {
    const { limit } = req.query;
    const fields = await correctionService.getFrequentlyCorrectedFields(
      limit ? parseInt(limit) : 10
    );
    res.json(fields);
  } catch (error) {
    console.error('Error fetching frequent fields:', error);
    res.status(500).json({ error: 'Failed to fetch frequent fields' });
  }
});

module.exports = router;

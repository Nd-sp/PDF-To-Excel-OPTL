const express = require('express');
const router = express.Router();
const comparisonService = require('../services/comparisonService');

/**
 * Compare invoice with previous
 */
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const comparison = await comparisonService.compareWithPrevious(parseInt(invoiceId));
    res.json(comparison);
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: 'Comparison failed' });
  }
});

/**
 * Get circuit comparison history
 */
router.get('/circuit/:circuitId/history', async (req, res) => {
  try {
    const { circuitId } = req.params;
    const { limit } = req.query;

    const history = await comparisonService.getCircuitComparisonHistory(
      circuitId,
      limit ? parseInt(limit) : 12
    );

    res.json(history);
  } catch (error) {
    console.error('Error fetching comparison history:', error);
    res.status(500).json({ error: 'Failed to fetch comparison history' });
  }
});

/**
 * Get significant cost changes
 */
router.get('/significant-changes', async (req, res) => {
  try {
    const { threshold } = req.query;
    const changes = await comparisonService.getSignificantChanges(
      threshold ? parseFloat(threshold) : 15
    );
    res.json(changes);
  } catch (error) {
    console.error('Error fetching significant changes:', error);
    res.status(500).json({ error: 'Failed to fetch significant changes' });
  }
});

/**
 * Compare multiple circuits
 */
router.post('/circuits', async (req, res) => {
  try {
    const { circuitIds } = req.body;

    if (!circuitIds || !Array.isArray(circuitIds) || circuitIds.length === 0) {
      return res.status(400).json({ error: 'Circuit IDs array required' });
    }

    const comparison = await comparisonService.compareCircuits(circuitIds);
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing circuits:', error);
    res.status(500).json({ error: 'Failed to compare circuits' });
  }
});

module.exports = router;

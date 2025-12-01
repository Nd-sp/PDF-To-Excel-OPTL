const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

/**
 * Get dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { vendorType } = req.query;
    const stats = await analyticsService.getDashboardStats(vendorType);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

/**
 * Get cost analytics
 */
router.get('/costs', async (req, res) => {
  try {
    const { startDate, endDate, vendor, circuitId } = req.query;
    const analytics = await analyticsService.getCostAnalytics({
      startDate,
      endDate,
      vendor,
      circuitId
    });
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching cost analytics:', error);
    res.status(500).json({ error: 'Failed to fetch cost analytics' });
  }
});

/**
 * Get circuit-wise breakdown
 */
router.get('/circuits', async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const breakdown = await analyticsService.getCircuitCostBreakdown({
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : 20
    });
    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching circuit breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch circuit breakdown' });
  }
});

/**
 * Get vendor comparison
 */
router.get('/vendors', async (req, res) => {
  try {
    const { vendorType } = req.query;
    const comparison = await analyticsService.getVendorComparison(vendorType);
    res.json(comparison);
  } catch (error) {
    console.error('Error fetching vendor comparison:', error);
    res.status(500).json({ error: 'Failed to fetch vendor comparison' });
  }
});

/**
 * Get monthly trends
 */
router.get('/trends', async (req, res) => {
  try {
    const { months, vendorType } = req.query;
    const trends = await analyticsService.getMonthlyTrend(
      months ? parseInt(months) : 12,
      vendorType
    );
    res.json(trends);
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    res.status(500).json({ error: 'Failed to fetch monthly trends' });
  }
});

/**
 * Get cost by bandwidth
 */
router.get('/bandwidth', async (req, res) => {
  try {
    const { vendorType } = req.query;
    const data = await analyticsService.getCostByBandwidth(vendorType);
    res.json(data);
  } catch (error) {
    console.error('Error fetching bandwidth costs:', error);
    res.status(500).json({ error: 'Failed to fetch bandwidth costs' });
  }
});

/**
 * Get top spending circuits
 */
router.get('/top-spending', async (req, res) => {
  try {
    const { limit, vendorType } = req.query;
    const circuits = await analyticsService.getTopSpendingCircuits(
      limit ? parseInt(limit) : 10,
      vendorType
    );
    res.json(circuits);
  } catch (error) {
    console.error('Error fetching top spending circuits:', error);
    // Return empty array if table doesn't exist or query fails
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_WRONG_ARGUMENTS') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Failed to fetch top spending circuits' });
  }
});

/**
 * Get payment due invoices
 */
router.get('/payment-due', async (req, res) => {
  try {
    const { days, vendorType } = req.query;
    const invoices = await analyticsService.getPaymentDueInvoices(
      days ? parseInt(days) : 7,
      vendorType
    );
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching payment due invoices:', error);
    res.status(500).json({ error: 'Failed to fetch payment due invoices' });
  }
});

module.exports = router;

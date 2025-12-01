const express = require('express');
const router = express.Router();
const alertsService = require('../services/alertsService');

/**
 * Get alerts for a batch
 */
router.get('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const alerts = await alertsService.getBatchAlerts(parseInt(batchId));
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching batch alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * Generate alerts for a batch
 */
router.post('/batch/:batchId/generate', async (req, res) => {
  try {
    const { batchId } = req.params;
    const alerts = await alertsService.generateAlertsForBatch(parseInt(batchId));
    res.json({ success: true, alerts, count: alerts.length });
  } catch (error) {
    console.error('Error generating alerts:', error);
    res.status(500).json({ error: 'Failed to generate alerts' });
  }
});

/**
 * Get all unread alerts
 */
router.get('/unread', async (req, res) => {
  try {
    const { limit } = req.query;
    const alerts = await alertsService.getUnreadAlerts(
      limit ? parseInt(limit) : 50
    );
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching unread alerts:', error);
    // If table doesn't exist, return empty array instead of error
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_WRONG_ARGUMENTS') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Failed to fetch unread alerts' });
  }
});

/**
 * Get critical alerts
 */
router.get('/critical', async (req, res) => {
  try {
    const alerts = await alertsService.getCriticalAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching critical alerts:', error);
    res.status(500).json({ error: 'Failed to fetch critical alerts' });
  }
});

/**
 * Get alert statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await alertsService.getAlertStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

/**
 * Mark alert as read
 */
router.put('/:alertId/read', async (req, res) => {
  try {
    const { alertId } = req.params;
    await alertsService.markAsRead(parseInt(alertId));
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({ error: 'Failed to mark alert as read' });
  }
});

/**
 * Dismiss alert
 */
router.put('/:alertId/dismiss', async (req, res) => {
  try {
    const { alertId } = req.params;
    await alertsService.dismissAlert(parseInt(alertId));
    res.json({ success: true });
  } catch (error) {
    console.error('Error dismissing alert:', error);
    res.status(500).json({ error: 'Failed to dismiss alert' });
  }
});

/**
 * Cleanup old alerts
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const { days } = req.query;
    const deleted = await alertsService.cleanupOldAlerts(
      days ? parseInt(days) : 90
    );
    res.json({ success: true, deletedCount: deleted });
  } catch (error) {
    console.error('Error cleaning up alerts:', error);
    res.status(500).json({ error: 'Failed to cleanup alerts' });
  }
});

module.exports = router;

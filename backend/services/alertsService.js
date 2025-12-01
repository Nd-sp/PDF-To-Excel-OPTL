const db = require('../config/database');
const validationService = require('./validationService');

class AlertsService {
  /**
   * Generate alerts for a batch
   */
  async generateAlertsForBatch(batchId) {
    try {
      const alerts = [];

      // Get all invoices in batch
      const [invoices] = await db.query(`
        SELECT * FROM invoice_data WHERE batch_id = ?
      `, [batchId]);

      for (const invoice of invoices) {
        // Check for cost spikes
        if (invoice.circuit_id && invoice.total) {
          const spikeResult = await validationService.detectCostSpikes(
            invoice.circuit_id,
            parseFloat(invoice.total)
          );

          if (spikeResult.hasSpike) {
            alerts.push({
              batch_id: batchId,
              invoice_id: invoice.id,
              alert_type: 'cost_spike',
              severity: spikeResult.severity,
              title: `Cost spike detected for circuit ${invoice.circuit_id}`,
              message: `Current amount: ${spikeResult.currentAmount}, Average previous: ${spikeResult.averagePrevious}, Change: ${spikeResult.changePercentage}%`,
              metadata: JSON.stringify(spikeResult)
            });
          }
        }

        // Check for missing critical data
        const missingFields = this.checkMissingData(invoice);
        if (missingFields.length > 0) {
          alerts.push({
            batch_id: batchId,
            invoice_id: invoice.id,
            alert_type: 'missing_data',
            severity: 'medium',
            title: `Missing data in invoice ${invoice.bill_number}`,
            message: `Missing fields: ${missingFields.join(', ')}`,
            metadata: JSON.stringify({ missing_fields: missingFields })
          });
        }

        // Check for duplicates
        if (invoice.bill_number) {
          const duplicates = await validationService.checkDuplicates(
            invoice.bill_number,
            invoice.relationship_number,
            invoice.pdf_record_id
          );

          if (duplicates.length > 0) {
            alerts.push({
              batch_id: batchId,
              invoice_id: invoice.id,
              alert_type: 'duplicate_invoice',
              severity: 'high',
              title: `Duplicate invoice detected: ${invoice.bill_number}`,
              message: `Found ${duplicates.length} duplicate(s)`,
              metadata: JSON.stringify({ duplicates })
            });
          }
        }

        // Check for unusual charges
        if (invoice.one_time_charges && parseFloat(invoice.one_time_charges) > 0) {
          alerts.push({
            batch_id: batchId,
            invoice_id: invoice.id,
            alert_type: 'unusual_charge',
            severity: 'medium',
            title: `One-time charges detected`,
            message: `One-time charge of ${invoice.one_time_charges} in invoice ${invoice.bill_number}`,
            metadata: JSON.stringify({ amount: invoice.one_time_charges })
          });
        }

        // Check payment due soon
        if (invoice.due_date) {
          const dueDate = new Date(invoice.due_date);
          const today = new Date();
          const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

          if (daysUntilDue >= 0 && daysUntilDue <= 7) {
            const severity = daysUntilDue <= 3 ? 'high' : 'medium';
            alerts.push({
              batch_id: batchId,
              invoice_id: invoice.id,
              alert_type: 'payment_due',
              severity,
              title: `Payment due in ${daysUntilDue} days`,
              message: `Invoice ${invoice.bill_number} - Amount: ${invoice.total} - Due: ${invoice.due_date}`,
              metadata: JSON.stringify({ days_until_due: daysUntilDue, amount: invoice.total })
            });
          }
        }
      }

      // Save all alerts to database
      if (alerts.length > 0) {
        await this.saveAlerts(alerts);
      }

      return alerts;
    } catch (error) {
      console.error('Error generating alerts:', error);
      throw error;
    }
  }

  /**
   * Check for missing critical data
   */
  checkMissingData(invoice) {
    const criticalFields = [
      'bill_number',
      'bill_date',
      'due_date',
      'total',
      'vendor_name',
      'company_name',
      'circuit_id',
      'relationship_number'
    ];

    const missing = [];

    for (const field of criticalFields) {
      if (!invoice[field] || invoice[field] === null || invoice[field] === '') {
        missing.push(field);
      }
    }

    return missing;
  }

  /**
   * Save alerts to database
   */
  async saveAlerts(alerts) {
    if (alerts.length === 0) return;

    const values = alerts.map(a => [
      a.batch_id,
      a.invoice_id,
      a.alert_type,
      a.severity,
      a.title,
      a.message,
      a.metadata
    ]);

    const query = `
      INSERT INTO alerts
      (batch_id, invoice_id, alert_type, severity, title, message, metadata)
      VALUES ?
    `;

    await db.query(query, [values]);
  }

  /**
   * Get alerts for a batch
   */
  async getBatchAlerts(batchId) {
    const [alerts] = await db.query(`
      SELECT * FROM alerts
      WHERE batch_id = ?
      ORDER BY severity DESC, created_at DESC
    `, [batchId]);

    return alerts;
  }

  /**
   * Get all unread alerts
   */
  async getUnreadAlerts(limit = 50) {
    const [alerts] = await db.query(`
      SELECT a.*, b.batch_name, id.bill_number
      FROM alerts a
      LEFT JOIN upload_batches b ON a.batch_id = b.id
      LEFT JOIN invoice_data id ON a.invoice_id = id.id
      WHERE a.is_read = 0 AND a.is_dismissed = 0
      ORDER BY a.severity DESC, a.created_at DESC
      LIMIT ?
    `, [limit]);

    return alerts;
  }

  /**
   * Mark alert as read
   */
  async markAsRead(alertId) {
    await db.query(`
      UPDATE alerts SET is_read = 1 WHERE id = ?
    `, [alertId]);
  }

  /**
   * Dismiss alert
   */
  async dismissAlert(alertId) {
    await db.query(`
      UPDATE alerts SET is_dismissed = 1 WHERE id = ?
    `, [alertId]);
  }

  /**
   * Get alert statistics
   */
  async getAlertStats() {
    const [stats] = await db.query(`
      SELECT
        alert_type,
        severity,
        COUNT(*) as count,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count
      FROM alerts
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY alert_type, severity
      ORDER BY severity DESC, count DESC
    `);

    return stats;
  }

  /**
   * Get critical alerts (high/critical severity, unread)
   */
  async getCriticalAlerts() {
    const [alerts] = await db.query(`
      SELECT a.*, b.batch_name, id.bill_number
      FROM alerts a
      LEFT JOIN upload_batches b ON a.batch_id = b.id
      LEFT JOIN invoice_data id ON a.invoice_id = id.id
      WHERE a.severity IN ('high', 'critical')
      AND a.is_read = 0
      AND a.is_dismissed = 0
      ORDER BY a.created_at DESC
      LIMIT 20
    `);

    return alerts;
  }

  /**
   * Delete old alerts
   */
  async cleanupOldAlerts(daysOld = 90) {
    const [result] = await db.query(`
      DELETE FROM alerts
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      AND is_dismissed = 1
    `, [daysOld]);

    return result.affectedRows;
  }
}

module.exports = new AlertsService();

const db = require('../config/database');

class ComparisonService {
  /**
   * Compare invoice with previous month for same circuit
   */
  async compareWithPrevious(invoiceId) {
    try {
      const [current] = await db.query(`
        SELECT * FROM invoice_data WHERE id = ?
      `, [invoiceId]);

      if (!current || current.length === 0) {
        throw new Error('Invoice not found');
      }

      const invoice = current[0];

      if (!invoice.circuit_id) {
        return { error: 'Circuit ID not available for comparison' };
      }

      // Get previous invoices for same circuit
      const [previous] = await db.query(`
        SELECT * FROM invoice_data
        WHERE circuit_id = ?
        AND bill_date < ?
        ORDER BY bill_date DESC
        LIMIT 6
      `, [invoice.circuit_id, invoice.bill_date]);

      if (previous.length === 0) {
        return { message: 'No previous invoices found for comparison' };
      }

      const comparisons = {
        current: invoice,
        previous: previous[0],
        history: previous,
        changes: this.calculateChanges(invoice, previous[0]),
        trend: this.calculateTrend(invoice, previous)
      };

      // Save comparison to database
      await this.saveComparison(invoice.id, previous[0]?.id, comparisons.changes);

      return comparisons;
    } catch (error) {
      console.error('Comparison error:', error);
      throw error;
    }
  }

  /**
   * Calculate changes between two invoices
   */
  calculateChanges(current, previous) {
    const changes = {};

    const fieldsToCompare = [
      'total', 'sub_total', 'recurring_charges', 'one_time_charges',
      'usage_charges', 'tax_amount', 'bandwidth_mbps', 'annual_charges'
    ];

    fieldsToCompare.forEach(field => {
      const currentVal = parseFloat(current[field]) || 0;
      const previousVal = parseFloat(previous[field]) || 0;

      if (previousVal !== 0) {
        const change = currentVal - previousVal;
        const percentChange = ((change / previousVal) * 100).toFixed(2);

        changes[field] = {
          current: currentVal,
          previous: previousVal,
          change: change.toFixed(2),
          percentChange: percentChange,
          increased: change > 0,
          significant: Math.abs(percentChange) > 10
        };
      }
    });

    return changes;
  }

  /**
   * Calculate trend over multiple invoices
   */
  calculateTrend(current, history) {
    const amounts = history.map(inv => parseFloat(inv.total) || 0);
    const currentAmount = parseFloat(current.total) || 0;

    if (amounts.length < 2) {
      return { trend: 'insufficient_data' };
    }

    const avgPrevious = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const deviation = ((currentAmount - avgPrevious) / avgPrevious) * 100;

    let trend = 'stable';
    if (deviation > 5) trend = 'increasing';
    if (deviation < -5) trend = 'decreasing';

    return {
      trend,
      currentAmount,
      averagePrevious: avgPrevious.toFixed(2),
      deviation: deviation.toFixed(2),
      dataPoints: amounts.length
    };
  }

  /**
   * Save comparison result to database
   */
  async saveComparison(currentId, previousId, changes) {
    if (!previousId || !changes.total) return;

    try {
      const [invoice] = await db.query(`
        SELECT circuit_id FROM invoice_data WHERE id = ?
      `, [currentId]);

      await db.query(`
        INSERT INTO invoice_comparisons
        (circuit_id, current_invoice_id, previous_invoice_id, comparison_type,
         current_value, previous_value, change_amount, change_percentage)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoice[0].circuit_id,
        currentId,
        previousId,
        'month_over_month',
        changes.total.current,
        changes.total.previous,
        changes.total.change,
        changes.total.percentChange
      ]);
    } catch (error) {
      console.error('Error saving comparison:', error);
    }
  }

  /**
   * Get comparison history for a circuit
   */
  async getCircuitComparisonHistory(circuitId, limit = 12) {
    const [comparisons] = await db.query(`
      SELECT * FROM invoice_comparisons
      WHERE circuit_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `, [circuitId, limit]);

    return comparisons;
  }

  /**
   * Find circuits with significant cost changes
   */
  async getSignificantChanges(threshold = 15) {
    const [changes] = await db.query(`
      SELECT
        ic.*,
        id.company_name,
        id.bill_date
      FROM invoice_comparisons ic
      JOIN invoice_data id ON ic.current_invoice_id = id.id
      WHERE ABS(ic.change_percentage) > ?
      AND ic.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY ABS(ic.change_percentage) DESC
      LIMIT 50
    `, [threshold]);

    return changes;
  }

  /**
   * Compare multiple circuits
   */
  async compareCircuits(circuitIds) {
    const placeholders = circuitIds.map(() => '?').join(',');

    const [circuits] = await db.query(`
      SELECT
        circuit_id,
        company_name,
        bandwidth_mbps,
        AVG(total) as avg_cost,
        SUM(total) as total_cost,
        COUNT(*) as invoice_count,
        MAX(bill_date) as last_invoice
      FROM invoice_data
      WHERE circuit_id IN (${placeholders})
      GROUP BY circuit_id, company_name, bandwidth_mbps
    `, circuitIds);

    return circuits;
  }
}

module.exports = new ComparisonService();

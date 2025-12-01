const db = require('../config/database');

class AnalyticsService {
  /**
   * Get cost analytics for dashboard
   */
  async getCostAnalytics(filters = {}) {
    try {
      const { startDate, endDate, vendor, vendorType, circuitId } = filters;

      let query = `
        SELECT
          DATE_FORMAT(bill_date, '%Y-%m') as month,
          vendor_name,
          COUNT(*) as invoice_count,
          SUM(total) as total_amount,
          SUM(recurring_charges) as total_recurring,
          SUM(one_time_charges) as total_onetime,
          AVG(total) as avg_amount,
          MIN(total) as min_amount,
          MAX(total) as max_amount
        FROM invoice_data
        WHERE 1=1
      `;

      const params = [];

      if (startDate) {
        query += ' AND bill_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        query += ' AND bill_date <= ?';
        params.push(endDate);
      }
      if (vendor) {
        query += ' AND vendor_name = ?';
        params.push(vendor);
      }
      if (vendorType) {
        query += ' AND vendor_type = ?';
        params.push(vendorType);
      }
      if (circuitId) {
        query += ' AND circuit_id = ?';
        params.push(circuitId);
      }

      query += ' GROUP BY month, vendor_name ORDER BY month DESC';

      const [results] = await db.query(query, params);
      return results;
    } catch (error) {
      console.error('Analytics error:', error);
      throw error;
    }
  }

  /**
   * Get circuit-wise cost breakdown
   */
  async getCircuitCostBreakdown(filters = {}) {
    const { startDate, endDate, vendorType, limit = 20 } = filters;

    let query = `
      SELECT
        circuit_id,
        company_name,
        bandwidth_mbps,
        COUNT(*) as invoice_count,
        SUM(total) as total_cost,
        AVG(total) as avg_monthly_cost,
        MAX(bill_date) as last_invoice_date
      FROM invoice_data
      WHERE circuit_id IS NOT NULL
    `;

    const params = [];

    if (startDate) {
      query += ' AND bill_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND bill_date <= ?';
      params.push(endDate);
    }
    if (vendorType) {
      query += ' AND vendor_type = ?';
      params.push(vendorType);
    }

    query += ' GROUP BY circuit_id, company_name, bandwidth_mbps';
    query += ' ORDER BY total_cost DESC LIMIT ?';
    params.push(limit);

    const [results] = await db.query(query, params);
    return results;
  }

  /**
   * Get vendor comparison stats
   */
  async getVendorComparison(vendorType = null) {
    let query = `
      SELECT
        vendor_name,
        COUNT(DISTINCT circuit_id) as circuit_count,
        COUNT(*) as invoice_count,
        SUM(total) as total_amount,
        AVG(total) as avg_invoice_amount,
        SUM(bandwidth_mbps) as total_bandwidth
      FROM invoice_data
      WHERE vendor_name IS NOT NULL
    `;

    const params = [];
    if (vendorType) {
      query += ' AND vendor_type = ?';
      params.push(vendorType);
    }

    query += ' GROUP BY vendor_name ORDER BY total_amount DESC';

    const [results] = await db.query(query, params);
    return results;
  }

  /**
   * Get monthly trend data
   */
  async getMonthlyTrend(months = 12, vendorType = null) {
    let query = `
      SELECT
        DATE_FORMAT(bill_date, '%Y-%m') as month,
        COUNT(*) as invoice_count,
        SUM(total) as total_amount,
        SUM(recurring_charges) as recurring_amount,
        SUM(tax_amount) as tax_amount,
        COUNT(DISTINCT circuit_id) as active_circuits
      FROM invoice_data
      WHERE bill_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
    `;

    const params = [months];
    if (vendorType) {
      query += ' AND vendor_type = ?';
      params.push(vendorType);
    }

    query += ' GROUP BY month ORDER BY month ASC';

    const [results] = await db.query(query, params);
    return results;
  }

  /**
   * Get cost distribution by bandwidth
   */
  async getCostByBandwidth(vendorType = null) {
    let query = `
      SELECT
        bandwidth_mbps,
        COUNT(*) as circuit_count,
        SUM(total) as total_cost,
        AVG(total) as avg_cost
      FROM invoice_data
      WHERE bandwidth_mbps IS NOT NULL
    `;

    const params = [];
    if (vendorType) {
      query += ' AND vendor_type = ?';
      params.push(vendorType);
    }

    query += ' GROUP BY bandwidth_mbps ORDER BY bandwidth_mbps ASC';

    const [results] = await db.query(query, params);
    return results;
  }

  /**
   * Get top spending circuits
   */
  async getTopSpendingCircuits(limit = 10, vendorType = null) {
    let query = `
      SELECT
        circuit_id,
        company_name,
        city,
        state,
        bandwidth_mbps,
        SUM(total) as total_spent,
        COUNT(*) as invoice_count,
        AVG(total) as avg_monthly
      FROM invoice_data
      WHERE circuit_id IS NOT NULL
    `;

    const params = [];
    if (vendorType) {
      query += ' AND vendor_type = ?';
      params.push(vendorType);
    }

    query += ' GROUP BY circuit_id, company_name, city, state, bandwidth_mbps';
    query += ' ORDER BY total_spent DESC LIMIT ?';
    params.push(limit);

    const [results] = await db.query(query, params);
    return results;
  }

  /**
   * Get payment due alerts
   */
  async getPaymentDueInvoices(daysAhead = 7, vendorType = null) {
    let query = `
      SELECT
        id.bill_number,
        id.due_date,
        id.total,
        id.company_name,
        id.circuit_id,
        b.batch_name,
        DATEDIFF(id.due_date, CURDATE()) as days_until_due
      FROM invoice_data id
      JOIN upload_batches b ON id.batch_id = b.id
      WHERE id.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
    `;

    const params = [daysAhead];
    if (vendorType) {
      query += ' AND id.vendor_type = ?';
      params.push(vendorType);
    }

    query += ' ORDER BY id.due_date ASC';

    const [results] = await db.query(query, params);
    return results;
  }

  /**
   * Get comprehensive dashboard stats
   */
  async getDashboardStats(vendorType = null) {
    let statsQuery = `
      SELECT
        COUNT(DISTINCT batch_id) as total_batches,
        COUNT(*) as total_invoices,
        SUM(total) as total_amount,
        AVG(total) as avg_invoice_amount,
        COUNT(DISTINCT circuit_id) as unique_circuits,
        COUNT(DISTINCT vendor_name) as vendor_count
      FROM invoice_data
    `;

    let activityQuery = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as invoice_count
      FROM invoice_data
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

    const statsParams = [];
    const activityParams = [];

    if (vendorType) {
      statsQuery += ' WHERE vendor_type = ?';
      statsParams.push(vendorType);
      activityQuery += ' AND vendor_type = ?';
      activityParams.push(vendorType);
    }

    activityQuery += ' GROUP BY DATE(created_at) ORDER BY date DESC';

    const [totalStats] = await db.query(statsQuery, statsParams);
    const [recentActivity] = await db.query(activityQuery, activityParams);

    return {
      summary: totalStats[0],
      recentActivity
    };
  }
}

module.exports = new AnalyticsService();

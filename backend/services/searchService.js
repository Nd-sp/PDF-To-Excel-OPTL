const db = require('../config/database');

class SearchService {
  /**
   * Advanced search with multiple filters
   */
  async search(filters = {}, pagination = {}) {
    const {
      searchTerm,
      vendor,
      vendorType,
      circuitId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      city,
      state,
      status
    } = filters;

    const { page = 1, limit = 50 } = pagination;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = ' WHERE 1=1';
    const params = [];

    // Search term (searches multiple fields)
    if (searchTerm) {
      whereClause += ` AND (
        id.bill_number LIKE ? OR
        id.circuit_id LIKE ? OR
        id.company_name LIKE ? OR
        id.relationship_number LIKE ? OR
        pr.filename LIKE ?
      )`;
      const term = `%${searchTerm}%`;
      params.push(term, term, term, term, term);
    }

    // Vendor filter (by name or type)
    if (vendor) {
      whereClause += ' AND id.vendor_name = ?';
      params.push(vendor);
    }

    // Vendor type filter (vodafone/tata)
    if (vendorType) {
      whereClause += ' AND id.vendor_type = ?';
      params.push(vendorType);
    }

    // Circuit ID filter
    if (circuitId) {
      whereClause += ' AND id.circuit_id LIKE ?';
      params.push(`%${circuitId}%`);
    }

    // Date range filter
    if (startDate) {
      whereClause += ' AND id.bill_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND id.bill_date <= ?';
      params.push(endDate);
    }

    // Amount range filter
    if (minAmount) {
      whereClause += ' AND id.total >= ?';
      params.push(minAmount);
    }
    if (maxAmount) {
      whereClause += ' AND id.total <= ?';
      params.push(maxAmount);
    }

    // Location filters
    if (city) {
      whereClause += ' AND id.city = ?';
      params.push(city);
    }
    if (state) {
      whereClause += ' AND id.state = ?';
      params.push(state);
    }

    // Status filter
    if (status) {
      whereClause += ' AND b.status = ?';
      params.push(status);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM invoice_data id
      JOIN pdf_records pr ON id.pdf_record_id = pr.id
      JOIN upload_batches b ON id.batch_id = b.id
      ${whereClause}
    `;

    const [countResult] = await db.query(countQuery, params);
    const total = countResult[0].total;

    // Build main query
    const query = `
      SELECT
        id.*,
        b.batch_name,
        b.status as batch_status,
        pr.filename
      FROM invoice_data id
      JOIN pdf_records pr ON id.pdf_record_id = pr.id
      JOIN upload_batches b ON id.batch_id = b.id
      ${whereClause}
      ORDER BY id.bill_date DESC, id.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [results] = await db.query(query, params);

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + results.length < total
      }
    };
  }

  /**
   * Search by circuit ID
   */
  async searchByCircuit(circuitId) {
    const [results] = await db.query(`
      SELECT * FROM invoice_data
      WHERE circuit_id = ?
      ORDER BY bill_date DESC
    `, [circuitId]);

    return results;
  }

  /**
   * Search by relationship number
   */
  async searchByRelationship(relationshipNumber) {
    const [results] = await db.query(`
      SELECT * FROM invoice_data
      WHERE relationship_number = ?
      ORDER BY bill_date DESC
    `, [relationshipNumber]);

    return results;
  }

  /**
   * Full-text search across all text fields
   */
  async fullTextSearch(searchTerm, limit = 100) {
    const term = `%${searchTerm}%`;

    const [results] = await db.query(`
      SELECT
        id.*,
        b.batch_name,
        pr.filename,
        CASE
          WHEN id.bill_number LIKE ? THEN 5
          WHEN id.circuit_id LIKE ? THEN 4
          WHEN id.company_name LIKE ? THEN 3
          WHEN id.relationship_number LIKE ? THEN 2
          ELSE 1
        END as relevance_score
      FROM invoice_data id
      JOIN pdf_records pr ON id.pdf_record_id = pr.id
      JOIN upload_batches b ON id.batch_id = b.id
      WHERE
        id.bill_number LIKE ? OR
        id.circuit_id LIKE ? OR
        id.company_name LIKE ? OR
        id.relationship_number LIKE ? OR
        id.installation_address LIKE ? OR
        id.contact_person LIKE ? OR
        pr.filename LIKE ?
      ORDER BY relevance_score DESC, id.bill_date DESC
      LIMIT ?
    `, [term, term, term, term, term, term, term, term, term, term, term, limit]);

    return results;
  }

  /**
   * Get filter options (for dropdowns)
   */
  async getFilterOptions() {
    const [vendors] = await db.query(`
      SELECT DISTINCT vendor_name
      FROM invoice_data
      WHERE vendor_name IS NOT NULL
      ORDER BY vendor_name
    `);

    const [cities] = await db.query(`
      SELECT DISTINCT city
      FROM invoice_data
      WHERE city IS NOT NULL
      ORDER BY city
    `);

    const [states] = await db.query(`
      SELECT DISTINCT state
      FROM invoice_data
      WHERE state IS NOT NULL
      ORDER BY state
    `);

    const [circuits] = await db.query(`
      SELECT DISTINCT circuit_id, company_name
      FROM invoice_data
      WHERE circuit_id IS NOT NULL
      ORDER BY circuit_id
      LIMIT 1000
    `);

    return {
      vendors: vendors.map(v => v.vendor_name),
      cities: cities.map(c => c.city),
      states: states.map(s => s.state),
      circuits: circuits.map(c => ({ id: c.circuit_id, name: c.company_name }))
    };
  }

  /**
   * Get recent searches (can be extended with user tracking)
   */
  async getRecentInvoices(limit = 20) {
    const [results] = await db.query(`
      SELECT
        id.*,
        b.batch_name,
        pr.filename
      FROM invoice_data id
      JOIN pdf_records pr ON id.pdf_record_id = pr.id
      JOIN upload_batches b ON id.batch_id = b.id
      ORDER BY id.created_at DESC
      LIMIT ?
    `, [limit]);

    return results;
  }

  /**
   * Search invoices by amount range
   */
  async searchByAmountRange(minAmount, maxAmount) {
    const [results] = await db.query(`
      SELECT * FROM invoice_data
      WHERE total BETWEEN ? AND ?
      ORDER BY total DESC
    `, [minAmount, maxAmount]);

    return results;
  }

  /**
   * Search invoices due in date range
   */
  async searchByDueDateRange(startDate, endDate) {
    const [results] = await db.query(`
      SELECT * FROM invoice_data
      WHERE due_date BETWEEN ? AND ?
      ORDER BY due_date ASC
    `, [startDate, endDate]);

    return results;
  }
}

module.exports = new SearchService();

const db = require('../config/database');

class CorrectionService {
  /**
   * Get invoice data for correction
   */
  async getInvoiceForCorrection(invoiceId) {
    try {
      const [invoice] = await db.query(`
        SELECT id.*, pr.filename, b.batch_name
        FROM invoice_data id
        JOIN pdf_records pr ON id.pdf_record_id = pr.id
        JOIN upload_batches b ON id.batch_id = b.id
        WHERE id.id = ?
      `, [invoiceId]);

      if (invoice.length === 0) {
        throw new Error('Invoice not found');
      }

      // Get existing corrections
      const [corrections] = await db.query(`
        SELECT * FROM manual_corrections
        WHERE invoice_id = ?
        ORDER BY created_at DESC
      `, [invoiceId]);

      return {
        invoice: invoice[0],
        corrections
      };
    } catch (error) {
      console.error('Error fetching invoice for correction:', error);
      throw error;
    }
  }

  /**
   * Save manual correction
   */
  async saveCorrection(invoiceId, fieldName, originalValue, correctedValue, reason, correctedBy) {
    try {
      await db.query(`
        INSERT INTO manual_corrections
        (invoice_id, field_name, original_value, corrected_value, correction_reason, corrected_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [invoiceId, fieldName, originalValue, correctedValue, reason, correctedBy || 'User']);

      return { success: true };
    } catch (error) {
      console.error('Error saving correction:', error);
      throw error;
    }
  }

  /**
   * Apply corrections to invoice data
   */
  async applyCorrections(invoiceId, corrections) {
    try {
      const updateFields = [];
      const updateValues = [];

      for (const correction of corrections) {
        updateFields.push(`${correction.field_name} = ?`);
        updateValues.push(correction.corrected_value);

        // Log the correction
        await this.saveCorrection(
          invoiceId,
          correction.field_name,
          correction.original_value,
          correction.corrected_value,
          correction.reason || 'Manual correction',
          correction.corrected_by || 'User'
        );
      }

      if (updateFields.length > 0) {
        updateValues.push(invoiceId);
        const query = `
          UPDATE invoice_data
          SET ${updateFields.join(', ')}
          WHERE id = ?
        `;

        await db.query(query, updateValues);
      }

      return { success: true, updatedFields: updateFields.length };
    } catch (error) {
      console.error('Error applying corrections:', error);
      throw error;
    }
  }

  /**
   * Get all corrections for a batch
   */
  async getBatchCorrections(batchId) {
    const [corrections] = await db.query(`
      SELECT mc.*, id.bill_number, pr.filename
      FROM manual_corrections mc
      JOIN invoice_data id ON mc.invoice_id = id.id
      JOIN pdf_records pr ON id.pdf_record_id = pr.id
      WHERE id.batch_id = ?
      ORDER BY mc.created_at DESC
    `, [batchId]);

    return corrections;
  }

  /**
   * Approve a correction
   */
  async approveCorrection(correctionId, approvedBy) {
    await db.query(`
      UPDATE manual_corrections
      SET is_approved = 1, approved_by = ?, approved_at = NOW()
      WHERE id = ?
    `, [approvedBy, correctionId]);

    return { success: true };
  }

  /**
   * Get correction statistics
   */
  async getCorrectionStats(batchId = null) {
    let query = `
      SELECT
        COUNT(*) as total_corrections,
        COUNT(DISTINCT invoice_id) as invoices_corrected,
        SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as approved_corrections,
        COUNT(DISTINCT field_name) as unique_fields_corrected
      FROM manual_corrections
    `;

    const params = [];

    if (batchId) {
      query += ` WHERE invoice_id IN (SELECT id FROM invoice_data WHERE batch_id = ?)`;
      params.push(batchId);
    }

    const [stats] = await db.query(query, params);
    return stats[0];
  }

  /**
   * Get frequently corrected fields
   */
  async getFrequentlyCorrectedFields(limit = 10) {
    const [fields] = await db.query(`
      SELECT
        field_name,
        COUNT(*) as correction_count,
        COUNT(DISTINCT invoice_id) as invoice_count
      FROM manual_corrections
      GROUP BY field_name
      ORDER BY correction_count DESC
      LIMIT ?
    `, [limit]);

    return fields;
  }
}

module.exports = new CorrectionService();

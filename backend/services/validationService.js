const db = require('../config/database');

class ValidationService {
  /**
   * Validate extracted invoice data
   */
  async validateInvoiceData(pdfRecordId, batchId, invoiceData) {
    try {
      const results = [];

      // Get validation rules from database
      const [rules] = await db.query(
        'SELECT * FROM validation_rules WHERE is_active = 1 ORDER BY field_name'
      );

      // Run each validation rule
      for (const rule of rules) {
        const result = await this.applyRule(rule, invoiceData);
        if (result) {
          results.push({
            ...result,
            pdf_record_id: pdfRecordId,
            batch_id: batchId,
            rule_id: rule.id
          });
        }
      }

      // Save validation results to database
      if (results.length > 0) {
        await this.saveValidationResults(results);
      }

      return {
        isValid: !results.some(r => r.status === 'fail'),
        errors: results.filter(r => r.status === 'fail'),
        warnings: results.filter(r => r.status === 'warning'),
        allResults: results
      };

    } catch (error) {
      console.error('Validation error:', error);
      throw error;
    }
  }

  /**
   * Apply a single validation rule
   */
  async applyRule(rule, data) {
    const fieldValue = data[rule.field_name];
    const config = typeof rule.rule_config === 'string'
      ? JSON.parse(rule.rule_config)
      : rule.rule_config;

    let status = 'pass';
    let message = null;
    let suggestedValue = null;

    switch (rule.rule_type) {
      case 'required':
        if (this.isEmpty(fieldValue)) {
          status = 'fail';
          message = rule.error_message || `${rule.field_name} is required`;
        }
        break;

      case 'numeric':
        if (!this.isEmpty(fieldValue) && !this.isNumeric(fieldValue)) {
          status = 'fail';
          message = rule.error_message || `${rule.field_name} must be a number`;
        } else if (config.min !== undefined && fieldValue < config.min) {
          status = 'fail';
          message = `${rule.field_name} must be at least ${config.min}`;
        } else if (config.max !== undefined && fieldValue > config.max) {
          status = 'fail';
          message = `${rule.field_name} must be at most ${config.max}`;
        }
        break;

      case 'date':
        if (!this.isEmpty(fieldValue) && !this.isValidDate(fieldValue)) {
          status = 'fail';
          message = rule.error_message || `${rule.field_name} must be a valid date`;
        }
        break;

      case 'gstin':
        if (!this.isEmpty(fieldValue)) {
          const gstinResult = this.validateGSTIN(fieldValue);
          if (!gstinResult.valid) {
            status = rule.severity === 'error' ? 'fail' : 'warning';
            message = rule.error_message || gstinResult.message;
            suggestedValue = gstinResult.suggestion;
          }
        }
        break;

      case 'email':
        if (!this.isEmpty(fieldValue) && !this.isValidEmail(fieldValue)) {
          status = rule.severity === 'error' ? 'fail' : 'warning';
          message = rule.error_message || `${rule.field_name} must be a valid email`;
        }
        break;

      case 'phone':
        if (!this.isEmpty(fieldValue)) {
          const phoneResult = this.validatePhone(fieldValue);
          if (!phoneResult.valid) {
            status = rule.severity === 'error' ? 'fail' : 'warning';
            message = rule.error_message || phoneResult.message;
            suggestedValue = phoneResult.suggestion;
          }
        }
        break;

      case 'range':
        if (!this.isEmpty(fieldValue)) {
          if (config.min !== undefined && fieldValue < config.min) {
            status = 'fail';
            message = `${rule.field_name} must be at least ${config.min}`;
          } else if (config.max !== undefined && fieldValue > config.max) {
            status = 'fail';
            message = `${rule.field_name} must be at most ${config.max}`;
          }
        }
        break;

      case 'regex':
        if (!this.isEmpty(fieldValue)) {
          const regex = new RegExp(config.pattern, config.flags || 'i');
          if (!regex.test(fieldValue)) {
            status = rule.severity === 'error' ? 'fail' : 'warning';
            message = rule.error_message || `${rule.field_name} format is invalid`;
          }
        }
        break;
    }

    // Only return if there's an issue
    if (status !== 'pass') {
      return {
        field_name: rule.field_name,
        status,
        message,
        original_value: fieldValue?.toString() || null,
        suggested_value: suggestedValue
      };
    }

    return null;
  }

  /**
   * Validate GSTIN format
   */
  validateGSTIN(gstin) {
    if (!gstin) return { valid: false, message: 'GSTIN is empty' };

    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (gstin.length !== 15) {
      return {
        valid: false,
        message: 'GSTIN must be exactly 15 characters',
        suggestion: null
      };
    }

    if (!gstinPattern.test(gstin)) {
      return {
        valid: false,
        message: 'GSTIN format is invalid',
        suggestion: null
      };
    }

    return { valid: true };
  }

  /**
   * Validate phone number
   */
  validatePhone(phone) {
    if (!phone) return { valid: false, message: 'Phone is empty' };

    const cleaned = phone.toString().replace(/\D/g, '');

    if (cleaned.length < 10) {
      return {
        valid: false,
        message: 'Phone number is too short',
        suggestion: null
      };
    }

    if (cleaned.length === 10) {
      return { valid: true };
    }

    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return { valid: true, suggestion: cleaned.substring(2) };
    }

    return {
      valid: false,
      message: 'Phone number format is invalid',
      suggestion: null
    };
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Check if value is empty
   */
  isEmpty(value) {
    return value === null || value === undefined || value === '' || value === 'null' || value === 'undefined';
  }

  /**
   * Check if value is numeric
   */
  isNumeric(value) {
    if (this.isEmpty(value)) return false;
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  /**
   * Validate date
   */
  isValidDate(dateStr) {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Save validation results to database
   */
  async saveValidationResults(results) {
    const values = results.map(r => [
      r.pdf_record_id,
      r.batch_id,
      r.field_name,
      r.rule_id || null,
      r.status,
      r.message,
      r.original_value,
      r.suggested_value
    ]);

    const query = `
      INSERT INTO validation_results
      (pdf_record_id, batch_id, field_name, rule_id, status, message, original_value, suggested_value)
      VALUES ?
    `;

    await db.query(query, [values]);
  }

  /**
   * Get validation results for a batch
   */
  async getBatchValidationResults(batchId) {
    const [results] = await db.query(`
      SELECT vr.*, pr.filename
      FROM validation_results vr
      JOIN pdf_records pr ON vr.pdf_record_id = pr.id
      WHERE vr.batch_id = ?
      ORDER BY vr.status DESC, pr.filename
    `, [batchId]);

    return results;
  }

  /**
   * Get validation summary for a batch
   */
  async getBatchValidationSummary(batchId) {
    const [summary] = await db.query(`
      SELECT
        COUNT(*) as total_validations,
        SUM(CASE WHEN status = 'fail' THEN 1 ELSE 0 END) as errors,
        SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) as warnings,
        SUM(CASE WHEN status = 'pass' THEN 1 ELSE 0 END) as passed,
        COUNT(DISTINCT pdf_record_id) as files_with_issues
      FROM validation_results
      WHERE batch_id = ?
    `, [batchId]);

    return summary[0];
  }

  /**
   * Check for duplicate invoices
   */
  async checkDuplicates(invoiceNumber, relationshipNumber, excludePdfRecordId = null) {
    let query = `
      SELECT id.id, id.bill_number, id.relationship_number, id.bill_date,
             id.total, pr.filename, b.batch_name
      FROM invoice_data id
      JOIN pdf_records pr ON id.pdf_record_id = pr.id
      JOIN upload_batches b ON id.batch_id = b.id
      WHERE (id.bill_number = ? OR id.relationship_number = ?)
    `;

    const params = [invoiceNumber, relationshipNumber];

    if (excludePdfRecordId) {
      query += ' AND pr.id != ?';
      params.push(excludePdfRecordId);
    }

    query += ' ORDER BY id.created_at DESC LIMIT 10';

    const [duplicates] = await db.query(query, params);
    return duplicates;
  }

  /**
   * Detect unusual amounts (cost spikes)
   */
  async detectCostSpikes(circuitId, currentAmount, threshold = 20) {
    const [history] = await db.query(`
      SELECT total, bill_date
      FROM invoice_data
      WHERE circuit_id = ?
      ORDER BY bill_date DESC
      LIMIT 6
    `, [circuitId]);

    if (history.length < 2) {
      return { hasSpike: false };
    }

    const previousAmounts = history.slice(1).map(h => parseFloat(h.total));
    const avgPrevious = previousAmounts.reduce((a, b) => a + b, 0) / previousAmounts.length;

    const changePercentage = ((currentAmount - avgPrevious) / avgPrevious) * 100;

    if (Math.abs(changePercentage) > threshold) {
      return {
        hasSpike: true,
        changePercentage: changePercentage.toFixed(2),
        currentAmount,
        averagePrevious: avgPrevious.toFixed(2),
        severity: Math.abs(changePercentage) > 50 ? 'high' : 'medium'
      };
    }

    return { hasSpike: false };
  }
}

module.exports = new ValidationService();

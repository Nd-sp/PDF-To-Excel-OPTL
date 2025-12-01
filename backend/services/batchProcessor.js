const pdfParser = require('./pdfParser');
const excelGenerator = require('./excelGenerator');
const db = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

class BatchProcessor {
  constructor() {
    this.activeBatches = new Map();
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_PROCESSES) || 5;
  }

  /**
   * Process a batch of PDF files
   */
  async processBatch(batchId, files, options = {}) {
    const {
      useAI = true,
      templateId = null,
      onProgress = null,
      vendorType = 'vodafone'
    } = options;

    // Mark batch as processing
    await db.query(
      'UPDATE upload_batches SET status = ? WHERE id = ?',
      ['processing', batchId]
    );

    let processedCount = 0;
    let failedCount = 0;
    const template = templateId ? await this.getTemplate(templateId) : null;

    // Process files in batches to avoid overwhelming the system
    const chunks = this.chunkArray(files, this.maxConcurrent);

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (file) => {
          try {
            await this.processSingleFile(batchId, file, template, useAI, vendorType);
            processedCount++;
          } catch (error) {
            console.error(`Failed to process ${file.filename}:`, error.message);
            failedCount++;
            await this.logError(batchId, file.id, error.message);
          }

          // Update progress
          await db.query(
            'UPDATE upload_batches SET processed_files = ?, failed_files = ? WHERE id = ?',
            [processedCount, failedCount, batchId]
          );

          // Call progress callback if provided
          if (onProgress) {
            onProgress({
              processed: processedCount,
              failed: failedCount,
              total: files.length,
              percentage: Math.round((processedCount + failedCount) / files.length * 100)
            });
          }
        })
      );

      // Small delay between chunks to prevent resource exhaustion
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.delay(parseInt(process.env.BATCH_PROCESSING_DELAY) || 100);
      }
    }

    // Generate Excel file
    const excelPath = await this.generateBatchExcel(batchId);

    // Update batch status
    await db.query(
      'UPDATE upload_batches SET status = ?, excel_file_path = ? WHERE id = ?',
      ['completed', excelPath, batchId]
    );

    return {
      batchId,
      processed: processedCount,
      failed: failedCount,
      total: files.length,
      excelPath
    };
  }

  /**
   * Process a single PDF file
   */
  async processSingleFile(batchId, file, template, useAI, vendorType = 'vodafone') {
    const startTime = Date.now();

    // Update file status to processing
    await db.query(
      'UPDATE pdf_records SET status = ?, vendor_type = ? WHERE id = ?',
      ['processing', vendorType, file.id]
    );

    try {
      // Extract data from PDF
      const result = await pdfParser.extractInvoiceData(
        file.file_path,
        template,
        useAI,
        vendorType
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      const processingTime = Date.now() - startTime;

      // Store extracted data
      await this.storeExtractedData(batchId, file.id, result.data, file.filename, vendorType);

      // Update PDF record
      await db.query(
        `UPDATE pdf_records
         SET status = ?, extracted_data = ?, processing_time_ms = ?
         WHERE id = ?`,
        ['completed', JSON.stringify(result.data), processingTime, file.id]
      );

      // Log success
      await this.logProcessing(batchId, file.id, 'info', 'File processed successfully', {
        processingTime,
        extractionMethod: result.metadata.extractionMethod
      });

    } catch (error) {
      // Update file status to failed
      await db.query(
        'UPDATE pdf_records SET status = ?, error_message = ? WHERE id = ?',
        ['failed', error.message, file.id]
      );

      throw error;
    }
  }

  /**
   * Store extracted data in invoice_data table
   */
  async storeExtractedData(batchId, pdfRecordId, data, filename, vendorType = 'vodafone') {
    const insertQuery = `
      INSERT INTO invoice_data (
        pdf_record_id, batch_id, filename, vendor_type, bill_date, due_date, bill_id,
        vendor_name, vendor_circuit_id, bill_number, purchase_order,
        currency_code, sub_total, total, item_name, description,
        tax_amount, gstin, hsn_sac, relationship_number, control_number,
        circuit_id, bandwidth_mbps, company_name, city, state, pin,
        contact_person, contact_number, installation_address,
        cgst, sgst, annual_charges, plan_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      pdfRecordId,
      batchId,
      filename,
      vendorType,
      data.billDate || null,
      data.dueDate || null,
      data.invoiceNumber || data.billId || null,
      data.vendorName || (vendorType === 'tata' ? 'TATA TELESERVICES LTD' : 'Vodafone Idea'),
      data.circuitId || null,
      data.invoiceNumber || null,
      data.poNumber || data.purchaseOrder || null,
      data.currencyCode || 'INR',
      data.subTotal || null,
      data.totalPayable || data.total || null,
      data.itemName || 'MPLS Service',
      data.description || data.planName || null,
      data.tax || data.taxAmount || null,
      data.gstin || null,
      data.hsnSac || '998414',
      data.relationshipNumber || null,
      data.controlNumber || null,
      data.circuitId || null,
      data.bandwidth || data.bandwidthMbps || null,
      data.companyName || null,
      data.city || null,
      data.state || null,
      data.pin || null,
      data.contactPerson || null,
      data.contactNumber || null,
      data.installationAddress || null,
      data.cgstAmount || null,
      data.sgstAmount || null,
      data.annualCharges || null,
      data.planName || null
    ];

    await db.query(insertQuery, values);
  }

  /**
   * Generate Excel file for entire batch
   */
  async generateBatchExcel(batchId, includeBlankColumns = null) {
    // Fetch batch info to get includeBlankColumns and vendor_type preference
    const [batches] = await db.query(
      'SELECT include_blank_columns, vendor_type FROM upload_batches WHERE id = ?',
      [batchId]
    );

    if (batches.length === 0) {
      throw new Error('Batch not found');
    }

    // Use provided value or fallback to batch preference
    const shouldIncludeBlanks = includeBlankColumns !== null
      ? includeBlankColumns
      : (batches[0].include_blank_columns === 1);

    const vendorType = batches[0].vendor_type || 'vodafone';

    // Fetch all invoice data for this batch
    const [records] = await db.query(
      'SELECT * FROM pdf_records WHERE batch_id = ? AND status = ?',
      [batchId, 'completed']
    );

    if (records.length === 0) {
      throw new Error('No successfully processed files found in batch');
    }

    // Parse extracted data (MySQL2 already parses JSON columns)
    const invoiceData = records.map(record => ({
      filename: record.filename,
      extractedData: typeof record.extracted_data === 'string'
        ? JSON.parse(record.extracted_data)
        : (record.extracted_data || {})
    }));

    // Generate output path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(process.env.UPLOAD_DIR || './uploads', 'exports');
    const outputPath = path.join(outputDir, `batch_${batchId}_${timestamp}.xlsx`);

    // Generate Excel with blank columns preference and vendor type
    const result = await excelGenerator.generateExcel(invoiceData, outputPath, null, shouldIncludeBlanks, vendorType);

    if (!result.success) {
      throw new Error(`Excel generation failed: ${result.error}`);
    }

    return outputPath;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId) {
    const [templates] = await db.query(
      'SELECT * FROM field_templates WHERE id = ?',
      [templateId]
    );
    return templates[0] || null;
  }

  /**
   * Log processing information
   */
  async logProcessing(batchId, pdfRecordId, level, message, metadata = null) {
    await db.query(
      'INSERT INTO processing_logs (batch_id, pdf_record_id, log_level, message, metadata) VALUES (?, ?, ?, ?, ?)',
      [batchId, pdfRecordId, level, message, metadata ? JSON.stringify(metadata) : null]
    );
  }

  /**
   * Log error
   */
  async logError(batchId, pdfRecordId, errorMessage) {
    await this.logProcessing(batchId, pdfRecordId, 'error', errorMessage);
  }

  /**
   * Split array into chunks
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get batch status
   */
  async getBatchStatus(batchId) {
    const [batches] = await db.query(
      'SELECT * FROM upload_batches WHERE id = ?',
      [batchId]
    );

    if (batches.length === 0) {
      return null;
    }

    const batch = batches[0];
    const percentage = batch.total_files > 0
      ? Math.round((batch.processed_files + batch.failed_files) / batch.total_files * 100)
      : 0;

    return {
      ...batch,
      percentage
    };
  }

  /**
   * Cancel batch processing
   */
  async cancelBatch(batchId) {
    this.activeBatches.delete(batchId);
    await db.query(
      'UPDATE upload_batches SET status = ? WHERE id = ?',
      ['failed', batchId]
    );
  }
}

module.exports = new BatchProcessor();

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const batchProcessor = require('../services/batchProcessor');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'pdfs');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Only PDF files are allowed'), false);
    return;
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    cb(new Error('File must have .pdf extension'), false);
    return;
  }

  // Check filename for suspicious patterns
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    cb(new Error('Invalid filename'), false);
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
    files: parseInt(process.env.MAX_FILES_PER_BATCH) || 1000
  }
});

class UploadController {
  /**
   * Upload middleware
   */
  static uploadMiddleware = upload.array('pdfs', parseInt(process.env.MAX_FILES_PER_BATCH) || 1000);

  /**
   * Upload and process PDFs
   */
  static async uploadPDFs(req, res) {
    try {
      const files = req.files;
      const {
        batchName = `Batch_${Date.now()}`,
        useAI = true,
        templateId = null,
        includeBlankColumns = true,
        vendorType = 'vodafone'
      } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Check for duplicate batch name
      const [existing] = await db.query(
        'SELECT id FROM upload_batches WHERE batch_name = ?',
        [batchName]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Batch name already exists. Please use a unique name.'
        });
      }

      // Create batch record
      const [batchResult] = await db.query(
        'INSERT INTO upload_batches (batch_name, vendor_type, total_files, status, include_blank_columns) VALUES (?, ?, ?, ?, ?)',
        [batchName, vendorType, files.length, 'pending', includeBlankColumns === 'true' || includeBlankColumns === true ? 1 : 0]
      );

      const batchId = batchResult.insertId;

      // Create PDF records
      const pdfRecords = [];
      for (const file of files) {
        const [result] = await db.query(
          'INSERT INTO pdf_records (batch_id, filename, file_path, status) VALUES (?, ?, ?, ?)',
          [batchId, file.originalname, file.path, 'pending']
        );

        pdfRecords.push({
          id: result.insertId,
          filename: file.originalname,
          file_path: file.path
        });
      }

      // Start processing asynchronously
      UploadController.processAsync(batchId, pdfRecords, {
        useAI: useAI === 'true' || useAI === true,
        templateId: templateId ? parseInt(templateId) : null,
        vendorType: vendorType || 'vodafone'
      });

      res.status(202).json({
        success: true,
        message: 'Files uploaded successfully. Processing started.',
        batchId,
        totalFiles: files.length
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: error.message
      });
    }
  }

  /**
   * Process batch asynchronously
   */
  static async processAsync(batchId, files, options) {
    try {
      await batchProcessor.processBatch(batchId, files, options);
    } catch (error) {
      console.error(`Batch ${batchId} processing failed:`, error);
      await db.query(
        'UPDATE upload_batches SET status = ? WHERE id = ?',
        ['failed', batchId]
      );
    }
  }

  /**
   * Get batch status
   */
  static async getBatchStatus(req, res) {
    try {
      const { batchId } = req.params;

      const status = await batchProcessor.getBatchStatus(batchId);

      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Get batch status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get batch status',
        error: error.message
      });
    }
  }

  /**
   * Get all batches with pagination and search
   */
  static async getAllBatches(req, res) {
    try {
      const {
        limit = 50,
        offset = 0,
        search = '',
        status = '',
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      // Ensure limit and offset are valid integers
      const limitInt = Math.max(1, Math.min(parseInt(limit) || 50, 1000));
      const offsetInt = Math.max(0, parseInt(offset) || 0);

      // Build WHERE clause
      const conditions = [];
      const params = [];

      if (search) {
        conditions.push('batch_name LIKE ?');
        params.push(`%${search}%`);
      }

      if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
        conditions.push('status = ?');
        params.push(status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Validate sort parameters
      const validSortFields = ['created_at', 'batch_name', 'total_files', 'status'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
      const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      // Get batches
      const sql = `SELECT * FROM upload_batches ${whereClause} ORDER BY ${sortField} ${order} LIMIT ${limitInt} OFFSET ${offsetInt}`;
      const [batches] = await db.query(sql, params);

      // Get total count
      const countSql = `SELECT COUNT(*) as count FROM upload_batches ${whereClause}`;
      const [total] = await db.query(countSql, params);

      res.json({
        success: true,
        data: batches,
        pagination: {
          total: total[0].count,
          limit: limitInt,
          offset: offsetInt,
          hasMore: offsetInt + batches.length < total[0].count
        }
      });

    } catch (error) {
      console.error('Get batches error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get batches',
        error: error.message
      });
    }
  }

  /**
   * Download Excel file
   */
  static async downloadExcel(req, res) {
    try {
      const { batchId } = req.params;

      const [batches] = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      const batch = batches[0];

      if (!batch.excel_file_path) {
        return res.status(404).json({
          success: false,
          message: 'Excel file not yet generated'
        });
      }

      const filename = path.basename(batch.excel_file_path);
      res.download(batch.excel_file_path, filename);

    } catch (error) {
      console.error('Download Excel error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download Excel file',
        error: error.message
      });
    }
  }

  /**
   * Download CSV file
   */
  static async downloadCSV(req, res) {
    try {
      const { batchId } = req.params;

      const [batches] = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Get all invoice data
      const [invoiceData] = await db.query(
        'SELECT * FROM invoice_data WHERE batch_id = ?',
        [batchId]
      );

      if (invoiceData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No data available for export'
        });
      }

      // Generate CSV
      const headers = Object.keys(invoiceData[0]).filter(key => key !== 'id');
      const csvRows = [headers.join(',')];

      for (const row of invoiceData) {
        const values = headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          if (value === null || value === undefined) return '';
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }

      const csv = csvRows.join('\n');
      const filename = `batch_${batchId}_export.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);

    } catch (error) {
      console.error('Download CSV error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download CSV file',
        error: error.message
      });
    }
  }

  /**
   * Download JSON file
   */
  static async downloadJSON(req, res) {
    try {
      const { batchId } = req.params;

      const [batches] = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Get all invoice data
      const [invoiceData] = await db.query(
        'SELECT * FROM invoice_data WHERE batch_id = ?',
        [batchId]
      );

      if (invoiceData.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No data available for export'
        });
      }

      const json = JSON.stringify({
        batch: batches[0],
        data: invoiceData,
        exportedAt: new Date().toISOString(),
        totalRecords: invoiceData.length
      }, null, 2);

      const filename = `batch_${batchId}_export.json`;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(json);

    } catch (error) {
      console.error('Download JSON error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download JSON file',
        error: error.message
      });
    }
  }

  /**
   * Download error report
   */
  static async downloadErrorReport(req, res) {
    try {
      const { batchId } = req.params;

      const [batches] = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Get failed files
      const [failedFiles] = await db.query(
        'SELECT id, filename, status, error_message, created_at, updated_at FROM pdf_records WHERE batch_id = ? AND status = ?',
        [batchId, 'failed']
      );

      if (failedFiles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No failed files to report'
        });
      }

      // Generate CSV error report
      const headers = ['File ID', 'Filename', 'Error Message', 'Failed At'];
      const csvRows = [headers.join(',')];

      for (const file of failedFiles) {
        const values = [
          file.id,
          `"${file.filename}"`,
          `"${(file.error_message || 'Unknown error').replace(/"/g, '""')}"`,
          `"${file.updated_at}"`
        ];
        csvRows.push(values.join(','));
      }

      const csv = csvRows.join('\n');
      const filename = `batch_${batchId}_errors.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);

    } catch (error) {
      console.error('Download error report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download error report',
        error: error.message
      });
    }
  }

  /**
   * Get batch details with all PDF records
   */
  static async getBatchDetails(req, res) {
    try {
      const { batchId } = req.params;

      const [batches] = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      const [pdfRecords] = await db.query(
        'SELECT * FROM pdf_records WHERE batch_id = ? ORDER BY created_at ASC',
        [batchId]
      );

      const [logs] = await db.query(
        'SELECT * FROM processing_logs WHERE batch_id = ? ORDER BY created_at DESC LIMIT 100',
        [batchId]
      );

      res.json({
        success: true,
        data: {
          batch: batches[0],
          pdfRecords,
          logs
        }
      });

    } catch (error) {
      console.error('Get batch details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get batch details',
        error: error.message
      });
    }
  }

  /**
   * Delete batch
   */
  static async deleteBatch(req, res) {
    try {
      const { batchId } = req.params;

      // Get batch info to delete files
      const [batches] = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Get PDF records to delete files
      const [pdfRecords] = await db.query(
        'SELECT file_path FROM pdf_records WHERE batch_id = ?',
        [batchId]
      );

      // Delete PDF files
      for (const record of pdfRecords) {
        try {
          await fs.unlink(record.file_path);
        } catch (err) {
          console.warn(`Failed to delete file: ${record.file_path}`);
        }
      }

      // Delete Excel file if exists
      const batch = batches[0];
      if (batch.excel_file_path) {
        try {
          await fs.unlink(batch.excel_file_path);
        } catch (err) {
          console.warn(`Failed to delete Excel file: ${batch.excel_file_path}`);
        }
      }

      // Delete batch (cascades to pdf_records and invoice_data)
      await db.query('DELETE FROM upload_batches WHERE id = ?', [batchId]);

      res.json({
        success: true,
        message: 'Batch deleted successfully'
      });

    } catch (error) {
      console.error('Delete batch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete batch',
        error: error.message
      });
    }
  }

  /**
   * Retry all failed files in batch
   */
  static async retryBatch(req, res) {
    try {
      const { batchId } = req.params;
      const { useAI = true, templateId = null } = req.body;

      // Get batch info
      const [batches] = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Get failed files
      const [failedFiles] = await db.query(
        'SELECT * FROM pdf_records WHERE batch_id = ? AND status = ?',
        [batchId, 'failed']
      );

      if (failedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No failed files to retry'
        });
      }

      // Reset failed files to pending
      await db.query(
        'UPDATE pdf_records SET status = ?, error_message = NULL WHERE batch_id = ? AND status = ?',
        ['pending', batchId, 'failed']
      );

      // Update batch status
      await db.query(
        'UPDATE upload_batches SET status = ?, failed_files = 0 WHERE id = ?',
        ['processing', batchId]
      );

      // Restart processing
      UploadController.processAsync(batchId, failedFiles, {
        useAI: useAI === 'true' || useAI === true,
        templateId: templateId ? parseInt(templateId) : null
      });

      res.json({
        success: true,
        message: `Retrying ${failedFiles.length} failed file(s)`,
        count: failedFiles.length
      });

    } catch (error) {
      console.error('Retry batch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retry batch',
        error: error.message
      });
    }
  }

  /**
   * Bulk delete batches
   */
  static async bulkDeleteBatches(req, res) {
    try {
      const { batchIds } = req.body;

      if (!batchIds || !Array.isArray(batchIds) || batchIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No batch IDs provided'
        });
      }

      let deletedCount = 0;
      const errors = [];

      for (const batchId of batchIds) {
        try {
          // Get batch info
          const [batches] = await db.query(
            'SELECT * FROM upload_batches WHERE id = ?',
            [batchId]
          );

          if (batches.length === 0) {
            errors.push(`Batch ${batchId} not found`);
            continue;
          }

          // Get PDF records to delete files
          const [pdfRecords] = await db.query(
            'SELECT file_path FROM pdf_records WHERE batch_id = ?',
            [batchId]
          );

          // Delete PDF files
          for (const record of pdfRecords) {
            try {
              await fs.unlink(record.file_path);
            } catch (err) {
              console.warn(`Failed to delete file: ${record.file_path}`);
            }
          }

          // Delete Excel file if exists
          const batch = batches[0];
          if (batch.excel_file_path) {
            try {
              await fs.unlink(batch.excel_file_path);
            } catch (err) {
              console.warn(`Failed to delete Excel file: ${batch.excel_file_path}`);
            }
          }

          // Delete batch
          await db.query('DELETE FROM upload_batches WHERE id = ?', [batchId]);
          deletedCount++;

        } catch (error) {
          console.error(`Error deleting batch ${batchId}:`, error);
          errors.push(`Failed to delete batch ${batchId}: ${error.message}`);
        }
      }

      res.json({
        success: true,
        message: `${deletedCount} batch(es) deleted successfully`,
        deletedCount,
        errors: errors.length > 0 ? errors : undefined
      });

    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk delete batches',
        error: error.message
      });
    }
  }

  /**
   * Retry single failed file
   */
  static async retrySingleFile(req, res) {
    try {
      const { batchId, fileId } = req.params;
      const { useAI = true, templateId = null } = req.body;

      // Get file record
      const [files] = await db.query(
        'SELECT * FROM pdf_records WHERE id = ? AND batch_id = ?',
        [fileId, batchId]
      );

      if (files.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      const file = files[0];

      // Reset file status
      await db.query(
        'UPDATE pdf_records SET status = ?, error_message = NULL WHERE id = ?',
        ['pending', fileId]
      );

      // Process single file
      UploadController.processAsync(batchId, [file], {
        useAI: useAI === 'true' || useAI === true,
        templateId: templateId ? parseInt(templateId) : null
      });

      res.json({
        success: true,
        message: 'File retry started',
        filename: file.filename
      });

    } catch (error) {
      console.error('Retry file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retry file',
        error: error.message
      });
    }
  }

  /**
   * Regenerate Excel file for a batch
   */
  static async regenerateExcel(req, res) {
    try {
      const { batchId } = req.params;
      const { includeBlankColumns } = req.body;

      // Get batch info
      const [batches] = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      const batch = batches[0];

      // Check if batch has completed files
      const [completedFiles] = await db.query(
        'SELECT COUNT(*) as count FROM pdf_records WHERE batch_id = ? AND status = ?',
        [batchId, 'completed']
      );

      if (completedFiles[0].count === 0) {
        return res.status(400).json({
          success: false,
          message: 'No successfully processed files found in this batch'
        });
      }

      // Generate Excel file using batch processor
      const BatchProcessor = require('../services/batchProcessor');
      const processor = new BatchProcessor();

      // Pass includeBlankColumns if provided, otherwise use batch preference
      const shouldIncludeBlanks = includeBlankColumns !== undefined
        ? (includeBlankColumns === 'true' || includeBlankColumns === true)
        : null;

      const excelPath = await processor.generateBatchExcel(batchId, shouldIncludeBlanks);

      // Update batch with new Excel path and blank columns preference if provided
      if (includeBlankColumns !== undefined) {
        await db.query(
          'UPDATE upload_batches SET excel_file_path = ?, include_blank_columns = ? WHERE id = ?',
          [excelPath, shouldIncludeBlanks ? 1 : 0, batchId]
        );
      } else {
        await db.query(
          'UPDATE upload_batches SET excel_file_path = ? WHERE id = ?',
          [excelPath, batchId]
        );
      }

      res.json({
        success: true,
        message: 'Excel file generated successfully',
        excelPath
      });

    } catch (error) {
      console.error('Regenerate Excel error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to regenerate Excel file',
        error: error.message
      });
    }
  }
}

module.exports = UploadController;

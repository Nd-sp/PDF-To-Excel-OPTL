const express = require('express');
const UploadController = require('../controllers/uploadController');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// ===== UPLOAD ROUTES =====

// Upload PDFs and start processing
router.post('/upload',
  UploadController.uploadMiddleware,
  UploadController.uploadPDFs
);

// Get all batches
router.get('/batches', UploadController.getAllBatches);

// Get batch status
router.get('/batches/:batchId/status', UploadController.getBatchStatus);

// Get batch details
router.get('/batches/:batchId', UploadController.getBatchDetails);

// Download Excel file
router.get('/batches/:batchId/download', UploadController.downloadExcel);

// Regenerate Excel file for a batch
router.post('/batches/:batchId/regenerate-excel', UploadController.regenerateExcel);

// Download CSV file
router.get('/batches/:batchId/download/csv', UploadController.downloadCSV);

// Download JSON file
router.get('/batches/:batchId/download/json', UploadController.downloadJSON);

// Download error report
router.get('/batches/:batchId/download/errors', UploadController.downloadErrorReport);

// Delete batch
router.delete('/batches/:batchId', UploadController.deleteBatch);

// Bulk delete batches
router.post('/batches/bulk-delete', UploadController.bulkDeleteBatches);

// Retry failed files in batch
router.post('/batches/:batchId/retry', UploadController.retryBatch);

// Retry single failed file
router.post('/batches/:batchId/files/:fileId/retry', UploadController.retrySingleFile);

module.exports = router;

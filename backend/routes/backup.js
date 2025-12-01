const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

/**
 * Database Backup & Restore Routes
 *
 * All routes are under /api/backup
 */

// Create a new backup
// POST /api/backup/create
// Body: { includeData: boolean, description: string }
router.post('/create', backupController.createBackup);

// List all backups
// GET /api/backup/list
router.get('/list', backupController.listBackups);

// Get backup statistics
// GET /api/backup/stats
router.get('/stats', backupController.getBackupStats);

// Download a backup file
// GET /api/backup/download/:filename
router.get('/download/:filename', backupController.downloadBackup);

// Delete a backup file
// DELETE /api/backup/delete/:filename
router.delete('/delete/:filename', backupController.deleteBackup);

// Restore from a backup
// POST /api/backup/restore/:filename
router.post('/restore/:filename', backupController.restoreBackup);

module.exports = router;
